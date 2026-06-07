import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { MissionsTab } from './MissionsTab';
import { ShopTab } from './ShopTab';
import { SettingsTab } from './SettingsTab';
import { Play, ClipboardList, ShoppingBag, Settings } from 'lucide-react';

interface MainMenuProps {
  onStartGame: (level: number) => void;
}

type TabType = 'missions' | 'shop' | 'settings';

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const { userProfile } = useGameState();

  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Experience Bar calculations
  const xpNeeded = userProfile.level * 500;
  const xpPct = (userProfile.xp / xpNeeded) * 100;

  // Levels campaign configuration
  const CAMPAIGN_LEVELS = [
    { num: 1, name: 'Jungle Outpost', boss: 'Armored Tank' },
    { num: 2, name: 'Desert Fortress', boss: 'Mechanical Scorpion' },
    { num: 3, name: 'Military Train', boss: 'Train Commander' },
    { num: 4, name: 'Frozen Research Base', boss: 'Ice Mech' },
    { num: 5, name: 'Toxic Factory', boss: 'Spider Machine' },
    { num: 6, name: 'Underground Laboratory', boss: 'Mutant Beast' },
    { num: 7, name: 'Alien Hive', boss: 'Alien Queen' },
    { num: 8, name: 'Final Core Facility', boss: 'AI War Machine' },
  ];

  const handlePlayClick = () => {
    onStartGame(selectedLevel);
  };

  return (
    <div className="min-h-screen bg-kani-dark text-white font-mono flex flex-col relative select-none">
      {/* Background elements */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.06] z-0" />

      {/* Top Header stats bar */}
      <header className="z-10 bg-black-60 border-b border-kani-20 p-4 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Kani Profile Status info */}
          <div className="w-12 h-12 bg-zinc-900 border-2 border-kani-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            <svg className="w-10 h-10 text-kani-green" viewBox="0 0 100 100" fill="currentColor">
              <path d="M 20 40 L 80 40 L 70 25 L 30 25 Z" fill="#d5c289" />
              <rect x="30" y="35" width="40" height="5" fill="#695125" />
              <circle cx="50" cy="65" r="22" fill="#1c1c1c" />
              <circle cx="42" cy="62" r="5" fill="#fff" /><circle cx="58" cy="62" r="5" fill="#fff" />
              <rect x="47" y="48" width="6" height="6" fill="#fff" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-kani-green">{userProfile.username}</h2>
              <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400">
                LVL {userProfile.level}
              </span>
            </div>
            
            {/* XP progress bar */}
            <div className="w-48 bg-zinc-850 h-2 rounded overflow-hidden mt-1.5 border border-zinc-800">
              <div className="bg-kani-green h-full transition-all duration-300" style={{ width: `${xpPct}%` }} />
            </div>
            <div className="text-[9px] text-kani-gray mt-0.5">XP: {userProfile.xp} / {xpNeeded}</div>
          </div>
        </div>

        {/* Wallet Status and Currencies */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-zinc-500">GOLD COINS</div>
            <div className="text-kani-green font-black text-lg">{userProfile.coins}💰</div>
          </div>

        </div>
      </header>

      {/* Main content grid */}
      <main className="z-10 flex-grow flex flex-col md:flex-row p-4 gap-6 max-w-6xl mx-auto w-full">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-60 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab(null)}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold border transition-all ${
              activeTab === null 
                ? 'bg-gradient-to-r from-green-500-20 to-kani-green-5 border-kani-50 text-kani-green' 
                : 'bg-zinc-900 border-transparent hover:border-zinc-800 text-zinc-300'
            }`}
          >
            <Play className="w-4 h-4" />
            CAMPAIGN PLAY
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold border transition-all ${
              activeTab === 'missions' 
                ? 'bg-gradient-to-r from-kani-green-20 to-transparent border-kani-40 text-kani-green' 
                : 'bg-zinc-900 border-transparent hover:border-zinc-800 text-zinc-300'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            MISSIONS
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold border transition-all ${
              activeTab === 'shop' 
                ? 'bg-gradient-to-r from-kani-green-20 to-transparent border-kani-40 text-kani-green' 
                : 'bg-zinc-900 border-transparent hover:border-zinc-800 text-zinc-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            COSMETIC SHOP
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold border transition-all ${
              activeTab === 'settings' 
                ? 'bg-gradient-to-r from-kani-green-20 to-transparent border-kani-40 text-kani-green' 
                : 'bg-zinc-900 border-transparent hover:border-zinc-800 text-zinc-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            SETTINGS
          </button>
        </div>

        {/* Content Viewer Panel */}
        <div className="flex-grow bg-black-45 border border-zinc-800 p-6 rounded-lg backdrop-blur-sm min-h-400">
          {activeTab === null && (
            <div className="flex flex-col h-full justify-between">
              <div>
                <h1 className="text-xl font-black text-kani-green mb-2 flex items-center gap-2">
                  <Play className="w-5 h-5 text-kani-green fill-current" />
                  KANI FORCE CAMPAIGN
                </h1>
                <p className="text-xs text-zinc-400 mb-6">
                  Select a Jungle Outpost or Alien Hive deployment. Completing stages earns coins, XP and upgrades!
                </p>

                {/* Level Grid Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {CAMPAIGN_LEVELS.map(lvl => {
                    const isUnlocked = lvl.num <= userProfile.highestLevel;

                    return (
                      <button
                        key={lvl.num}
                        disabled={!isUnlocked}
                        onClick={() => setSelectedLevel(lvl.num)}
                        className={`p-4 border rounded text-left relative flex flex-col justify-between h-28 transition-all ${
                          selectedLevel === lvl.num 
                            ? 'bg-kani-10 border-kani-80 shadow-[0_0_12px_rgba(57,255,20,0.1)]' 
                            : isUnlocked 
                              ? 'bg-zinc-900-60 border-zinc-800 hover:border-zinc-700' 
                              : 'bg-zinc-950-20 border-zinc-950-40 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] text-zinc-500">STAGE 0{lvl.num}</div>
                          <div className="text-xs font-bold text-white tracking-tight leading-tight truncate mt-1">
                            {lvl.name}
                          </div>
                        </div>
                        
                        <div className="text-[9px] text-red-400 font-bold tracking-wider mt-2 truncate">
                          BOSS: {lvl.boss}
                        </div>

                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black-40 flex items-center justify-center rounded">
                            <span className="text-[10px] bg-red-950/80 border border-red-800 text-red-500 px-2 py-0.5 rounded font-black tracking-widest">
                              LOCKED
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center border-t border-zinc-900 pt-6 gap-4">
                <div className="text-xs text-kani-gray">
                  Deploying to: <span className="text-kani-green font-bold">Stage 0{selectedLevel} - {CAMPAIGN_LEVELS[selectedLevel - 1].name}</span>
                </div>
                <button
                  onClick={handlePlayClick}
                  className="px-8 py-3 bg-kani-green text-black font-extrabold rounded text-sm tracking-widest shadow-kani-glow-md hover:scale-105 transition-all"
                >
                  LAUNCH MISSION
                </button>
              </div>
            </div>
          )}

          {activeTab === 'missions' && <MissionsTab />}
          {activeTab === 'shop' && <ShopTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};
export default MainMenu;
