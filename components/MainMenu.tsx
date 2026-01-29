
import React, { useState, useEffect } from 'react';
import { Brawler } from '../types';
import { DEFAULT_BRAWLERS } from '../constants';
import { Zap, Shield, Crosshair, Sparkles, Cpu, Play } from 'lucide-react';

interface MainMenuProps {
  onStartGame: (selectedBrawler: Brawler) => void;
  onGenerateBrawler: (prompt: string) => void;
  generatedBrawler: Brawler | null;
  isGenerating: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onGenerateBrawler, generatedBrawler, isGenerating }) => {
  const [selectedBrawlerId, setSelectedBrawlerId] = useState<string>(DEFAULT_BRAWLERS[0].id);
  const [prompt, setPrompt] = useState('');
  const [animateStats, setAnimateStats] = useState(false);

  const allBrawlers = generatedBrawler 
    ? [...DEFAULT_BRAWLERS, generatedBrawler] 
    : DEFAULT_BRAWLERS;

  const selectedBrawler = allBrawlers.find(b => b.id === selectedBrawlerId) || allBrawlers[0];

  useEffect(() => {
    setAnimateStats(false);
    const timer = setTimeout(() => setAnimateStats(true), 50);
    return () => clearTimeout(timer);
  }, [selectedBrawlerId]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerateBrawler(prompt);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0f0524] font-sans selection:bg-yellow-400 selection:text-black">
      
      <style>{`
        @keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-grid { animation: gridMove 2s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .stats-bar-fill { transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b4b] to-[#0f0524]"></div>
        {/* Ambient Lights */}
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-600 blur-[150px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600 blur-[150px] animate-float" style={{ animationDirection: 'reverse' }}></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-10 max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 animate-in slide-in-from-top duration-700">
            <div className="flex items-center gap-4 group cursor-default">
                <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-2xl rotate-3 shadow-[0_0_25px_rgba(234,179,8,0.5)] group-hover:rotate-12 transition-transform duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-black">
                        <Zap className="w-8 h-8 fill-current" />
                    </div>
                </div>
                <div>
                    <h1 className="text-5xl md:text-6xl text-white font-brawl italic tracking-wider text-outline drop-shadow-xl">
                        BRAWL <span className="text-yellow-400">AI</span>
                    </h1>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400 font-bold text-xs uppercase tracking-wider">Sistem Çevrimiçi</span>
            </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">
            
            {/* LEFT: CHARACTER LIST */}
            <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 animate-in slide-in-from-left duration-700 delay-100">
                
                <div className="flex-1 glass-panel rounded-[32px] p-2 overflow-hidden flex flex-col relative group border-t-4 border-t-white/10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h2 className="text-white/80 font-brawl text-xl tracking-wide">KARAKTERLER</h2>
                        <span className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-md font-bold">{allBrawlers.length} HAZIR</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 p-4 custom-scrollbar">
                        {allBrawlers.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => setSelectedBrawlerId(b.id)}
                                className={`w-full group/btn relative overflow-hidden rounded-2xl p-3 transition-all duration-300 border-l-4 text-left
                                    ${selectedBrawlerId === b.id 
                                        ? 'bg-gradient-to-r from-white/20 to-transparent border-yellow-400 translate-x-2' 
                                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/30'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div 
                                        className={`w-14 h-14 rounded-xl shadow-lg border-2 transition-transform duration-300 group-hover/btn:scale-110 flex items-center justify-center text-xl font-brawl
                                            ${selectedBrawlerId === b.id ? 'border-yellow-400 scale-105' : 'border-white/10 grayscale group-hover/btn:grayscale-0'}
                                        `}
                                        style={{ backgroundColor: b.color }}
                                    >
                                        {b.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-black text-lg truncate uppercase ${selectedBrawlerId === b.id ? 'text-white' : 'text-white/60'}`}>
                                            {b.name}
                                        </div>
                                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider">{b.role}</div>
                                    </div>
                                    {b.isAiGenerated && <Cpu className="w-5 h-5 text-purple-400" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Generator */}
                <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-white font-brawl text-lg">
                             <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                             <span>YAPAY ZEKA ATÖLYESİ</span>
                        </div>
                        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
                            <input 
                                type="text" 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Yeni bir savaşçı tarif et..."
                                className="w-full bg-black/40 border border-indigo-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 transition-all"
                                disabled={isGenerating}
                            />
                            <button 
                                type="submit"
                                disabled={isGenerating || !prompt.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl shadow-lg shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                {isGenerating ? (
                                    <span className="animate-pulse">OLUŞTURULUYOR...</span>
                                ) : (
                                    <>OLUŞTUR <Cpu className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* CENTER: HERO PREVIEW */}
            <div className="lg:col-span-8 flex flex-col relative animate-in slide-in-from-bottom duration-700 delay-200">
                
                {/* 3D Character Stage */}
                <div className="flex-1 relative flex items-center justify-center group perspective-container">
                    
                    {/* Simplified Background to focus on model */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-[400px] h-[400px] bg-gradient-to-b from-white/10 to-transparent rounded-full border border-white/5 animate-[spin_20s_linear_infinite]"></div>
                         <div 
                            className="absolute w-[500px] h-[500px] opacity-20 blur-3xl rounded-full transition-colors duration-1000"
                            style={{ backgroundColor: selectedBrawler.color }}
                         ></div>
                    </div>

                    {/* Character Card Floating */}
                    <div className="relative z-20 animate-float">
                        <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.6)] border-4 border-white/20 relative overflow-hidden backdrop-blur-md bg-white/5 group-hover:scale-105 transition-transform duration-500">
                            {/* Color Fill */}
                            <div className="absolute inset-0 opacity-80 transition-colors duration-500" style={{ backgroundColor: selectedBrawler.color }}></div>
                            
                            {/* Icon / Avatar */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[140px] font-brawl text-white drop-shadow-2xl select-none group-hover:scale-110 transition-transform duration-300">
                                    {selectedBrawler.name.charAt(0)}
                                </span>
                            </div>

                            {/* Shine */}
                            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shine_1.5s_infinite]" />
                        </div>
                    </div>
                </div>

                {/* Info Panel & Start */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Stats Panel */}
                    <div className="md:col-span-8 glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden border-l-4" style={{ borderColor: selectedBrawler.color }}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-4xl text-white font-brawl uppercase text-outline tracking-wider mb-1">{selectedBrawler.name}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-white/10 rounded-lg text-white/80 font-bold text-xs uppercase tracking-widest border border-white/10">
                                        {selectedBrawler.role}
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center" style={{ backgroundColor: selectedBrawler.projectileColor }}>
                                <Crosshair className="w-6 h-6 text-black/50" />
                            </div>
                        </div>
                        
                        <p className="text-white/60 italic text-sm mb-6 border-l-2 border-white/10 pl-4">
                            "{selectedBrawler.description}"
                        </p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <StatRow label="SAĞLIK" value={selectedBrawler.stats.health} max={2500} color="bg-green-500" icon={<Shield size={14} />} animate={animateStats} />
                            <StatRow label="HASAR" value={selectedBrawler.stats.damage * 3} max={1200} color="bg-red-500" icon={<Zap size={14} />} animate={animateStats} />
                            <StatRow label="HIZ" value={selectedBrawler.stats.speed} max={7} color="bg-blue-500" icon={<Zap size={14} />} animate={animateStats} />
                            <StatRow label="MENZİL" value={selectedBrawler.stats.range} max={700} color="bg-orange-500" icon={<Crosshair size={14} />} animate={animateStats} />
                        </div>
                    </div>

                    {/* Play Button */}
                    <div className="md:col-span-4 flex flex-col gap-4">
                         <div className="glass-panel rounded-2xl p-4 flex-1 flex flex-col items-center justify-center text-center">
                             <div className="text-yellow-400 font-brawl text-lg uppercase mb-1">SÜPER GÜÇ</div>
                             <div className="text-white/70 text-xs leading-relaxed">{selectedBrawler.superDescription}</div>
                         </div>

                         <button 
                            onClick={() => onStartGame(selectedBrawler)}
                            className="relative w-full h-24 bg-yellow-400 hover:bg-yellow-300 rounded-2xl border-b-[6px] border-yellow-600 shadow-[0_10px_0_rgba(0,0,0,0.2)] active:border-b-0 active:translate-y-[6px] active:shadow-none transition-all group overflow-hidden"
                         >
                             <div className="absolute inset-0 flex items-center justify-center gap-3 z-10">
                                 <span className="text-4xl font-brawl text-black tracking-widest group-hover:scale-110 transition-transform">OYNA!</span>
                                 <Play className="w-8 h-8 fill-black text-black group-hover:translate-x-1 transition-transform" />
                             </div>
                             
                             {/* Shine */}
                             <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite]" />
                         </button>
                    </div>

                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, max, color, icon, animate }: { label: string, value: number, max: number, color: string, icon: any, animate: boolean }) => {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-white/50 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">{icon} {label}</span>
                <span>{value}</span>
            </div>
            <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                    className={`h-full ${color} stats-bar-fill shadow-[0_0_10px_currentColor]`} 
                    style={{ width: animate ? `${pct}%` : '0%' }}
                ></div>
            </div>
        </div>
    );
};
