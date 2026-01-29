import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { Brawler, GameResult, GameStatus } from './types';
import { generateBrawlerAI } from './services/gemini';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.MENU);
  const [selectedBrawler, setSelectedBrawler] = useState<Brawler | null>(null);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  
  // Custom Brawler State
  const [generatedBrawler, setGeneratedBrawler] = useState<Brawler | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartMatchmaking = (brawler: Brawler) => {
    setSelectedBrawler(brawler);
    setGameStatus(GameStatus.MATCHMAKING);
  };

  const handleMatchFound = () => {
      setGameStatus(GameStatus.PLAYING);
  };

  const handleGameOver = (result: GameResult) => {
    setLastResult(result);
    setGameStatus(GameStatus.GAME_OVER);
  };

  const handleGenerateBrawler = async (prompt: string) => {
    setIsGenerating(true);
    const brawler = await generateBrawlerAI(prompt);
    if (brawler) {
      setGeneratedBrawler(brawler);
    } else {
        alert("Failed to generate brawler. Please check API Key or try again.");
    }
    setIsGenerating(false);
  };

  const handleExit = () => {
      setGameStatus(GameStatus.MENU);
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white overflow-hidden select-none">
      {gameStatus === GameStatus.MENU && (
        <MainMenu 
          onStartGame={handleStartMatchmaking} 
          onGenerateBrawler={handleGenerateBrawler}
          generatedBrawler={generatedBrawler}
          isGenerating={isGenerating}
        />
      )}

      {gameStatus === GameStatus.MATCHMAKING && selectedBrawler && (
          <MatchmakingScreen 
            playerBrawler={selectedBrawler}
            onMatchFound={handleMatchFound}
          />
      )}

      {gameStatus === GameStatus.PLAYING && selectedBrawler && (
        <GameCanvas 
          playerBrawler={selectedBrawler} 
          onGameOver={handleGameOver}
          onExit={handleExit}
        />
      )}

      {gameStatus === GameStatus.GAME_OVER && lastResult && selectedBrawler && (
        <ResultsScreen 
          result={lastResult} 
          brawlerName={selectedBrawler.name}
          onHome={() => setGameStatus(GameStatus.MENU)} 
        />
      )}
    </div>
  );
};

export default App;
