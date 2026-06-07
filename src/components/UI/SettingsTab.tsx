import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { sound } from '../../game/sound';
import { Settings, User, Volume2, Monitor, Trash2 } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useGameState();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      profile: {
        ...settings.profile,
        username: e.target.value,
      },
    });
  };

  const handleAudioChange = (key: 'master' | 'music' | 'sfx', value: number) => {
    const updatedAudio = {
      ...settings.audio,
      [key]: value,
    };
    updateSettings({ audio: updatedAudio });
    
    // Sync volumes directly to synthesized audio contexts
    sound.setVolumes(updatedAudio.master, updatedAudio.music, updatedAudio.sfx);
  };

  return (
    <div className="font-mono text-zinc-300">
      <h2 className="text-md font-black text-kani-green mb-2 flex items-center gap-2">
        <Settings className="w-5 h-5 text-kani-green" />
        SETTINGS & DIAGNOSTICS
      </h2>
      <p className="text-xs text-zinc-400 mb-6">
        Adjust explorer profiles, volume mixers, graphic rendering presets, and review database ledgers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Profile & Wallet */}
        <div className="flex flex-col gap-6">
          {/* Profile Section */}
          <div className="bg-zinc-950-40 border border-zinc-900 p-4 rounded-lg">
            <h3 className="text-xs font-black text-kani-green tracking-widest uppercase mb-4 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <User className="w-4 h-4" />
              EXPLORER PROFILE
            </h3>
            
            <label className="block text-[10px] text-zinc-550 mb-1.5">USERNAME / CODENAME</label>
            <input
              type="text"
              value={settings.profile.username}
              onChange={handleUsernameChange}
              maxLength={15}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-kani-50 font-bold"
            />
          </div>

        </div>

        {/* Right column: Audio, Graphics, Danger */}
        <div className="flex flex-col gap-6">
          {/* Volume Mixer */}
          <div className="bg-zinc-950-40 border border-zinc-900 p-4 rounded-lg">
            <h3 className="text-xs font-black text-kani-green tracking-widest uppercase mb-4 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Volume2 className="w-4 h-4" />
              VOLUME MIXER
            </h3>

            <div className="flex flex-col gap-4">
              {/* Master */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>MASTER VOLUME</span>
                  <span>{Math.round(settings.audio.master * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.audio.master}
                  onChange={(e) => handleAudioChange('master', parseFloat(e.target.value))}
                  className="w-full accent-kani-green"
                />
              </div>

              {/* Music */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>CHIPTUNE MUSIC</span>
                  <span>{Math.round(settings.audio.music * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.audio.music}
                  onChange={(e) => handleAudioChange('music', parseFloat(e.target.value))}
                  className="w-full accent-kani-green"
                />
              </div>

              {/* SFX */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>SOUND EFFECTS</span>
                  <span>{Math.round(settings.audio.sfx * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.audio.sfx}
                  onChange={(e) => handleAudioChange('sfx', parseFloat(e.target.value))}
                  className="w-full accent-kani-green"
                />
              </div>
            </div>
          </div>

          {/* Graphics Quality & CRT Filter */}
          <div className="bg-zinc-950-40 border border-zinc-900 p-4 rounded-lg">
            <h3 className="text-xs font-black text-kani-green tracking-widest uppercase mb-4 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Monitor className="w-4 h-4" />
              RENDER ENGINE SETTINGS
            </h3>

            <div className="flex flex-col gap-4">
              {/* Graphics Presets */}
              <div>
                <label className="block text-[10px] text-zinc-550 mb-2">GRAPHICS ENGINE QUALITY</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(preset => (
                    <button
                      key={preset}
                      onClick={() => updateSettings({ graphics: preset })}
                      className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${
                        settings.graphics === preset 
                          ? 'bg-kani-green text-black' 
                          : 'bg-zinc-900 text-zinc-550 border border-zinc-850 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRT Scanline Filter Toggle */}
              <div className="flex justify-between items-center bg-zinc-900-50 p-2.5 rounded border border-zinc-850">
                <div>
                  <h4 className="text-xs font-bold text-white">CRT MONITOR FILTER</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Toggle scanline overlay styling.</p>
                </div>
                <button
                  onClick={() => updateSettings({ crtFilter: !settings.crtFilter })}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${
                    settings.crtFilter ? 'bg-kani-green' : 'bg-zinc-850'
                  }`}
                >
                  <div className={`bg-black w-4 h-4 rounded-full transition-transform ${
                    settings.crtFilter ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-950-15 border border-red-900/30 p-4 rounded-lg mt-2">
            <h3 className="text-xs font-black text-red-500 tracking-widest uppercase mb-3 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              DANGER ARCHIVE
            </h3>
            <p className="text-[10px] text-zinc-500 leading-normal mb-3">
              This will wipe out all local storage, profile stats, coins collected, levels unlocked, and purchased skins.
            </p>
            <button
              onClick={() => {
                if (window.confirm('WARNING: Wiping local save archives is permanent. Continue?')) {
                  resetAllData();
                }
              }}
              className="px-4 py-2 bg-red-700/20 border border-red-800-40 hover:bg-red-700/30 text-red-500 font-bold rounded text-xs tracking-wider transition-all"
            >
              WIPE LOCAL DATA SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsTab;
