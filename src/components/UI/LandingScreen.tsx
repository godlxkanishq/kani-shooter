import React from 'react';
import { Sparkles } from 'lucide-react';

interface LandingScreenProps {
  onEnter: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnter }) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-kani-dark text-white font-mono overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.08]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-kani-5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-kani-green-5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Retro Title Logo */}
      <div className="z-10 text-center mb-10 select-none">
        <div className="inline-flex items-center gap-1 bg-kani-10 border border-kani-30 px-3 py-1 rounded-full text-xs text-kani-green font-bold mb-4 tracking-wider uppercase animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          The Retro Gun-and-Run Sensation
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-kani-green via-purple-500 to-purple-900 drop-shadow-[0_4px_12px_rgba(182,120,255,0.5)]">
          KANI FORCE
        </h1>
      </div>

      {/* Floating programmatically aligned cat card */}
      <div className="z-10 bg-black-60 border border-kani-20 p-4 rounded-xl flex flex-col items-center max-w-sm w-full backdrop-blur-md mb-8 text-center">
        <div className="w-20 h-20 bg-zinc-900 border-2 border-kani-green rounded-lg flex items-center justify-center overflow-hidden mb-3">
          {/* A mock vector draw of Kani to match description */}
          <svg className="w-16 h-16 text-kani-green" viewBox="0 0 100 100" fill="currentColor">
            {/* Explorer Hat */}
            <path d="M 20 40 L 80 40 L 70 25 L 30 25 Z" fill="#d5c289" />
            <rect x="30" y="35" width="40" height="5" fill="#695125" />
            {/* Cat Face */}
            <circle cx="50" cy="65" r="22" fill="#1c1c1c" />
            {/* Cat Ears */}
            <polygon points="30,48 18,30 38,44" fill="#1c1c1c" />
            <polygon points="70,48 82,30 62,44" fill="#1c1c1c" />
            {/* Eyes */}
            <circle cx="42" cy="62" r="5" fill="#fff" />
            <circle cx="42" cy="62" r="3" fill="#000" />
            <circle cx="58" cy="62" r="5" fill="#fff" />
            <circle cx="58" cy="62" r="3" fill="#000" />
            {/* Ritual forehead symbol */}
            <rect x="47" y="48" width="6" height="6" fill="#fff" />
          </svg>
        </div>
        <h2 className="text-kani-green font-bold text-sm tracking-wider uppercase mb-1">
          FEARLESS EXPLORER: KANI
        </h2>
        <p className="text-xs text-zinc-400">
          Guide the cute but fearless black cat mascot through deep jungle outposts, frozen research labs, and alien hives!
        </p>
      </div>

      {/* Flashing Enter Button */}
      <button
        onClick={onEnter}
        className="z-10 group relative px-10 py-4 bg-gradient-to-r from-green-500 to-kani-green text-black font-extrabold text-lg rounded shadow-kani-glow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-kani-glow-xl active:scale-95"
      >
        <span className="relative z-10 tracking-widest uppercase">
          ENTER ARCADE
        </span>
        <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded" />
      </button>

      {/* Bottom retro credentials footer */}
      <div className="absolute bottom-4 text-[10px] text-kani-darkgray tracking-widest uppercase font-mono">
        © 2026 KANI CO. ALL RIGHTS RESERVED
      </div>
    </div>
  );
};
export default LandingScreen;
