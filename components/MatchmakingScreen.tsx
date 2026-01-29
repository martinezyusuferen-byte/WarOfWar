
import React, { useEffect, useState } from 'react';
import { Brawler } from '../types';
import { MapPin, Target, Shield, Skull, Loader2 } from 'lucide-react';

interface MatchmakingScreenProps {
  playerBrawler: Brawler;
  onMatchFound: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ playerBrawler, onMatchFound }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onMatchFound, 500);
          return 100;
        }
        return prev + (Math.random() * 5); // Random increments
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onMatchFound]);

  return (
    <div className="w-full h-full bg-slate-900 relative overflow-hidden flex">
      
      {/* LEFT SIDE: MISSIONS (Black/Dark Panel) */}
      <div className="w-full lg:w-1/3 bg-[#0f172a] h-full relative z-20 flex flex-col p-10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] border-r border-white/5">
         
         <div className="mb-12">
            <h2 className="text-white/60 text-sm font-bold uppercase tracking-[0.3em] mb-2">GÖREVİN:</h2>
            <h1 className="text-5xl font-brawl text-white leading-none">KRİSTALLERİ<br /><span className="text-yellow-400">ELE GEÇİR</span></h1>
         </div>

         <div className="space-y-8 flex-1">
             <div className="flex gap-6 items-start group">
                 <div className="w-16 h-16 rounded-full border-4 border-white flex-shrink-0 flex items-center justify-center bg-transparent group-hover:bg-white group-hover:text-black transition-all">
                     <Target className="w-8 h-8" />
                 </div>
                 <div>
                     <h3 className="text-2xl font-brawl text-white mb-1">Kristal Depolarını Bul</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">Haritanın ortasındaki taş yığınlarının arasında gizlenmiş güç kristallerini bul.</p>
                 </div>
             </div>

             <div className="flex gap-6 items-start group">
                 <div className="w-16 h-16 rounded-full border-4 border-white flex-shrink-0 flex items-center justify-center bg-transparent group-hover:bg-white group-hover:text-black transition-all">
                     <Skull className="w-8 h-8" />
                 </div>
                 <div>
                     <h3 className="text-2xl font-brawl text-white mb-1">Rakipleri Yok Et</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">Düşman robotları yok ederek bölgeleri temizle ve puan kazan.</p>
                 </div>
             </div>

             <div className="flex gap-6 items-start group">
                 <div className="w-16 h-16 rounded-full border-4 border-white flex-shrink-0 flex items-center justify-center bg-transparent group-hover:bg-white group-hover:text-black transition-all">
                     <Shield className="w-8 h-8" />
                 </div>
                 <div>
                     <h3 className="text-2xl font-brawl text-white mb-1">Hayatta Kal</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">Süper yeteneğini doldurmak için hasar ver ve sonuna kadar dayan.</p>
                 </div>
             </div>
         </div>

         {/* Character Mini-Card */}
         <div className="mt-auto bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/10">
             <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: playerBrawler.color }}></div>
             <div>
                 <div className="text-xs text-white/50 uppercase font-bold">SEÇİLEN KARAKTER</div>
                 <div className="text-xl font-brawl text-white uppercase">{playerBrawler.name}</div>
             </div>
         </div>
      </div>

      {/* RIGHT SIDE: MAP PREVIEW (Visual) */}
      <div className="flex-1 h-full relative overflow-hidden bg-slate-800">
          {/* Faux Map Background using CSS Patterns */}
          <div className="absolute inset-0 bg-[#4ade80] opacity-80">
              {/* River */}
              <div className="absolute top-0 right-0 w-[400px] h-[200%] bg-blue-500 transform -rotate-12 translate-x-20 -translate-y-20 border-l-8 border-blue-400/50"></div>
              {/* Grid Lines */}
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)', backgroundSize: '100px 100px', opacity: 0.1 }}></div>
              {/* Topographic Lines */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 50%, #000 51%)', backgroundSize: '200px 200px' }}></div>
          </div>

          {/* Map POI Markers */}
          <div className="absolute top-1/4 left-1/4 animate-bounce delay-700">
              <MapPin className="w-10 h-10 text-red-600 drop-shadow-xl" fill="currentColor" />
          </div>
          <div className="absolute bottom-1/3 right-1/3 animate-bounce delay-1000">
              <MapPin className="w-10 h-10 text-red-600 drop-shadow-xl" fill="currentColor" />
          </div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
              <div className="w-32 h-32 rounded-full border-4 border-yellow-400/50 flex items-center justify-center">
                   <div className="w-20 h-20 rounded-full bg-yellow-400/20"></div>
              </div>
          </div>

          {/* Player Banner */}
          <div className="absolute top-10 right-10 flex gap-2">
              <div className="bg-black/80 text-white font-bold px-4 py-2 rounded transform skew-x-[-10deg]">SOLO</div>
              <div className="bg-yellow-400 text-black font-bold px-4 py-2 rounded transform skew-x-[-10deg]">EU-WEST</div>
          </div>

          {/* Loading Bar Container */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/90 to-transparent flex items-end pb-8 px-12">
              <div className="w-full">
                  <div className="flex justify-between text-white font-bold uppercase text-xs tracking-widest mb-2">
                      <span>Harita Oluşturuluyor...</span>
                      <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 shadow-[0_0_15px_#facc15]" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};
