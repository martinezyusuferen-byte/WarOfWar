import { GoogleGenAI, Type } from "@google/genai";
import { Brawler, GameResult } from "../types";

export type SourceLink = {
  title: string;
  url: string;
};

export type KnowItAllResult = {
  answer: string;
  sources: SourceLink[];
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing!");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

const parseGroundingSources = (response: any): SourceLink[] => {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];

  const unique = new Map<string, SourceLink>();

  chunks.forEach((chunk: any) => {
    const uri = chunk?.web?.uri;
    if (!uri || unique.has(uri)) return;

    unique.set(uri, {
      title: chunk?.web?.title || 'Bilinmeyen kaynak',
      url: uri,
    });
  });

  return Array.from(unique.values());
};

export const askKnowItAll = async (question: string): Promise<KnowItAllResult> => {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Kullanıcının sorusuna Türkçe olarak kısa, kesin ve tek bir paragrafta cevap ver. Gereksiz açıklama yapma. Soru: ${question}`,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    },
  });

  return {
    answer: response.text || 'Şu anda net bir cevap üretemedim.',
    sources: parseGroundingSources(response),
  };
};

export const generateBrawlerAI = async (prompt: string): Promise<Brawler | null> => {
  try {
    const ai = getAI();
    const modelId = "gemini-3-flash-preview";

    const userPrompt = `Create a Brawl Stars inspired character based on this description: "${prompt}".
    It must be balanced for a game with max health around 2000 and max damage around 300.
    Role must be one of: Tank, Sharpshooter, Support, Assassin, Controller.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            role: { type: Type.STRING, enum: ['Tank', 'Sharpshooter', 'Support', 'Assassin', 'Controller'] },
            color: { type: Type.STRING, description: "Hex color code fitting the theme" },
            projectileColor: { type: Type.STRING, description: "Hex color code for bullets" },
            superDescription: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                health: { type: Type.INTEGER, description: "Between 600 and 2500" },
                damage: { type: Type.INTEGER, description: "Between 50 and 400" },
                speed: { type: Type.NUMBER, description: "Between 3.0 and 6.0" },
                range: { type: Type.INTEGER, description: "Between 50 (melee) and 600 (sniper)" },
                reloadSpeed: { type: Type.INTEGER, description: "Frames between shots, approx 20-80" },
                superChargeRate: { type: Type.INTEGER, description: "10-30" }
              },
              required: ["health", "damage", "speed", "range", "reloadSpeed", "superChargeRate"]
            }
          },
          required: ["name", "description", "role", "color", "projectileColor", "stats", "superDescription"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: `gen_${Date.now()}`,
        ...data,
        isAiGenerated: true
      };
    }
    return null;

  } catch (error) {
    console.error("Failed to generate brawler:", error);
    return null;
  }
};

export const getMatchCoaching = async (result: GameResult, brawlerName: string): Promise<string> => {
  try {
    const ai = getAI();
    const modelId = "gemini-3-flash-preview";

    const prompt = `
      I just played a match in a Brawl Stars clone called "Crystal Clash".
      My Brawler: ${brawlerName}
      Winner: ${result.winner.toUpperCase()} Team
      My Stats: ${result.playerKills} Kills, ${result.playerDeaths} Deaths, ${result.crystalsCollected} Crystals collected.
      Duration: ${Math.floor(result.duration / 60)}m ${result.duration % 60}s.

      Give me a short, punchy, fun coaching tip or reaction. Like a sports commentator or a tough coach.
      Keep it under 3 sentences. Be enthusiastic!
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Good game! Keep brawling!";

  } catch (error) {
    console.error("Coaching error:", error);
    return "Connection error to the coach! Check your internet.";
  }
};
