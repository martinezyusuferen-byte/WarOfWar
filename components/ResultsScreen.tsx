import React, { useEffect, useState } from 'react';
import { GameResult } from '../types';
import { getMatchCoaching } from '../services/gemini';
import { Home, Repeat, Loader2 } from 'lucide-react';

interface ResultsScreenProps {
  result: GameResult;
  brawlerName: string;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, brawlerName, onHome }) => {
  const [coachingTip, setCoachingTip] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const isWin = result.winner === 'blue';

  useEffect(() => {
    let mounted = true;
    getMatchCoaching(result, brawlerName).then(tip => {
        if (mounted) {
            setCoachingTip(tip);
            setLoading(false);
        }
    });
    return () => { mounted = false; };
  }, [result, brawlerName]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-900">
        {/* Background Effects */}
        <div className={`absolute inset-0 opacity-20 ${isWin ? 'bg-blue-600' : 'bg-red-600'}`}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/0 to-slate-900"></div>

        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <h1 className={`text-6xl md:text-8xl font-brawl text-outline mb-4 ${isWin ? 'text-blue-400' : 'text-red-500'}`}>
                {isWin ? 'VICTORY!' : 'DEFEAT'}
            </h1>
            
            <div className="bg-slate-800/90 backdrop-blur-md p-8 rounded-3xl border-4 border-slate-700 shadow-2xl w-full max-w-md">
                <div className="flex justify-around mb-8 text-center">
                    <div>
                        <div className="text-4xl font-black text-white">{result.playerKills}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Kills</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-white">{result.playerDeaths}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Deaths</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-purple-400">{result.crystalsCollected}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Crystals</div>
                    </div>
                </div>

                {/* AI Coach Section */}
                <div className="bg-indigo-900/50 p-4 rounded-xl border border-indigo-500/50 mb-8 min-h-[100px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">
                        AI COACH
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2 text-indigo-300 text-sm">
                            <Loader2 className="animate-spin w-4 h-4" /> Analyzing match data...
                        </div>
                    ) : (
                        <p className="text-indigo-100 italic text-center text-sm font-medium leading-relaxed">
                            "{coachingTip}"
                        </p>
                    )}
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={onHome}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-xl border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" /> EXIT
                    </button>
                    <button 
                        onClick={onHome} 
                        className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded-xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Repeat className="w-5 h-5" /> PLAY AGAIN
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
