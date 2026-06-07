import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { ClipboardCheck, Sparkles, Award } from 'lucide-react';

export const MissionsTab: React.FC = () => {
  const { missions, claimMissionReward } = useGameState();

  const renderMissionRow = (m: any, category: 'daily' | 'weekly') => {
    const isCompleted = m.progress >= m.target;
    const progressPct = Math.min(100, (m.progress / m.target) * 100);

    return (
      <div 
        key={m.id} 
        className={`p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950-60 transition-all ${
          isCompleted 
            ? 'border-kani-30 bg-kani-5' 
            : 'border-zinc-800'
        }`}
      >
        <div className="flex-grow w-full">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-white tracking-tight">{m.description}</h4>
            {isCompleted && (
              <span className="text-[9px] bg-kani-15 text-kani-green border border-kani-30 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                COMPLETED
              </span>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-zinc-850 h-2.5 rounded overflow-hidden mt-3 border border-zinc-800 relative">
            <div 
              className={`h-full transition-all duration-300 ${isCompleted ? 'bg-kani-green' : 'bg-kani-green'}`} 
              style={{ width: `${progressPct}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-550 mt-1">
            <span>Progress: {m.progress} / {m.target}</span>
            <span>Reward: <span className="text-yellow-400 font-bold">{m.rewardValue} {m.rewardType.toUpperCase()}</span></span>
          </div>
        </div>

        <button
          disabled={!isCompleted || m.rewarded}
          onClick={() => claimMissionReward(category, m.id)}
          className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded tracking-wider shrink-0 transition-all ${
            m.rewarded 
              ? 'bg-zinc-850 text-zinc-650 cursor-not-allowed border border-zinc-800' 
              : isCompleted 
                ? 'bg-kani-green text-black shadow-kani-glow-sm hover:scale-105' 
                : 'bg-zinc-900 text-zinc-500 border border-zinc-850 cursor-not-allowed'
          }`}
        >
          {m.rewarded ? 'CLAIMED' : 'CLAIM REWARD'}
        </button>
      </div>
    );
  };

  return (
    <div className="font-mono text-zinc-300">
      <h2 className="text-md font-black text-kani-green mb-2 flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-kani-green" />
        DAILY & WEEKLY MISSIONS
      </h2>
      <p className="text-xs text-zinc-400 mb-6">
        Complete routine combat targets to receive high-value Gold Coins, cosmetic hat tickets, and bonus rank XP.
      </p>

      {/* Daily Missions */}
      <div className="mb-8">
        <h3 className="text-xs font-black text-kani-green tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-kani-green" />
          DAILY TARGETS
        </h3>
        <div className="flex flex-col gap-3">
          {missions.daily.map(m => renderMissionRow(m, 'daily'))}
        </div>
      </div>

      {/* Weekly Missions */}
      <div>
        <h3 className="text-xs font-black text-kani-green tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-kani-green" />
          WEEKLY CAMPAIGNS
        </h3>
        <div className="flex flex-col gap-3">
          {missions.weekly.map(m => renderMissionRow(m, 'weekly'))}
        </div>
      </div>
    </div>
  );
};
export default MissionsTab;
