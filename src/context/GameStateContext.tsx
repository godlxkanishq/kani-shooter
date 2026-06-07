import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  username: string;
  walletConnected: boolean;
  walletAddress: string;
  avatar: string;
  coins: number;
  xp: number;
  level: number;
  highScore: number;
  highestLevel: number;
  totalKills: number;
  unlockedCosmetics: string[];
  activeCosmetics: {
    hat: string;
    outfit: string;
    weaponSkin: string;
    trail: string;
    vfx: string;
  };
}

export interface Mission {
  id: string;
  description: string;
  progress: number;
  target: number;
  rewarded: boolean;
  rewardType: 'coins' | 'xp' | 'cosmetic';
  rewardValue: number | string;
}

export interface MissionsState {
  daily: Mission[];
  weekly: Mission[];
}

export interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
}

export interface SettingsState {
  profile: {
    username: string;
    avatar: string;
  };
  audio: AudioSettings;
  graphics: 'low' | 'medium' | 'high';
  crtFilter: boolean;
}

export interface GameSession {
  score: number;
  coinsCollected: number;
  kills: number;
  level: number;
  lives: number;
  health: number;
  maxHealth: number;
  currentWeapon: string;
  ammo: Record<string, number>;
  enemiesDefeated: number;
  shotsFired: number;
  shotsHit: number;
  isGameOver: boolean;
  isGameCompleted: boolean;
  checkpoint: { x: number; y: number; level: number } | null;
}

interface GameStateContextType {
  userProfile: UserProfile;
  missions: MissionsState;
  settings: SettingsState;
  session: GameSession;
  connectWalletState: (address: string, username?: string) => void;
  disconnectWalletState: () => void;
  updateUsername: (name: string) => void;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  gainXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  buyCosmetic: (id: string, cost: number) => boolean;
  equipCosmetic: (category: 'hat' | 'outfit' | 'weaponSkin' | 'trail' | 'vfx', id: string) => void;
  startNewGame: (levelNum?: number) => void;
  updateSession: (update: Partial<GameSession> | ((prev: GameSession) => Partial<GameSession>)) => void;
  endLevel: (_accuracy: number, enemiesDefeated: number, coins: number, xp: number) => void;
  triggerGameOver: () => void;
  claimMissionReward: (category: 'daily' | 'weekly', missionId: string) => void;
  resetAllData: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  username: 'Kani_Recruit',
  walletConnected: false,
  walletAddress: '',
  avatar: 'default_kani',
  coins: 0,
  xp: 0,
  level: 1,
  highScore: 0,
  highestLevel: 1,
  totalKills: 0,
  unlockedCosmetics: ['classic_hat'],
  activeCosmetics: {
    hat: 'classic_hat',
    outfit: 'classic_outfit',
    weaponSkin: 'default_skin',
    trail: 'none',
    vfx: 'none',
  },
};

const DEFAULT_MISSIONS = (): MissionsState => ({
  daily: [
    { id: 'd1', description: 'Defeat 50 enemies', progress: 0, target: 50, rewarded: false, rewardType: 'coins', rewardValue: 150 },
    { id: 'd2', description: 'Finish 1 level', progress: 0, target: 1, rewarded: false, rewardType: 'xp', rewardValue: 100 },
    { id: 'd3', description: 'Collect 100 coins', progress: 0, target: 100, rewarded: false, rewardType: 'coins', rewardValue: 100 },
  ],
  weekly: [
    { id: 'w1', description: 'Defeat 5 bosses', progress: 0, target: 5, rewarded: false, rewardType: 'cosmetic', rewardValue: 'golden_hat' },
    { id: 'w2', description: 'Reach 100,000 score', progress: 0, target: 100000, rewarded: false, rewardType: 'coins', rewardValue: 1000 },
    { id: 'w3', description: 'Complete all campaign levels', progress: 0, target: 8, rewarded: false, rewardType: 'xp', rewardValue: 1000 },
  ],
});

const DEFAULT_SETTINGS: SettingsState = {
  profile: {
    username: 'Kani_Recruit',
    avatar: 'default_kani',
  },
  audio: {
    master: 0.8,
    music: 0.7,
    sfx: 0.8,
  },
  graphics: 'high',
  crtFilter: true,
};

const DEFAULT_SESSION = (): GameSession => ({
  score: 0,
  coinsCollected: 0,
  kills: 0,
  level: 1,
  lives: 3,
  health: 100,
  maxHealth: 100,
  currentWeapon: 'Pistol',
  ammo: {
    Pistol: Infinity,
    MachineGun: 0,
    SpreadShot: 0,
    LaserRifle: 0,
    Flamethrower: 0,
    RocketLauncher: 0,
    PlasmaCannon: 0,
  },
  enemiesDefeated: 0,
  shotsFired: 0,
  shotsHit: 0,
  isGameOver: false,
  isGameCompleted: false,
  checkpoint: null,
});

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [missions, setMissions] = useState<MissionsState>(DEFAULT_MISSIONS());
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [session, setSession] = useState<GameSession>(DEFAULT_SESSION());

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('kani_profile');
      const savedMissions = localStorage.getItem('kani_missions');
      const savedSettings = localStorage.getItem('kani_settings');

      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      if (savedMissions) setMissions(JSON.parse(savedMissions));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) {
      console.error('Failed to parse saved game state from localStorage:', error);
    }
  }, []);

  // Save changes to local storage helper
  const saveProfile = (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setUserProfile(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('kani_profile', JSON.stringify(next));
      return next;
    });
  };

  const saveMissions = (updater: MissionsState | ((prev: MissionsState) => MissionsState)) => {
    setMissions(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('kani_missions', JSON.stringify(next));
      return next;
    });
  };

  const saveSettings = (settingsState: SettingsState) => {
    setSettings(settingsState);
    localStorage.setItem('kani_settings', JSON.stringify(settingsState));
  };

  // Wallet functions
  const connectWalletState = (address: string, username?: string) => {
    const defaultUsername = username || `Kani_${address.slice(2, 8)}`;
    const updatedProfile = {
      ...userProfile,
      walletConnected: true,
      walletAddress: address,
      username: userProfile.username === 'Kani_Recruit' ? defaultUsername : userProfile.username,
    };
    saveProfile(updatedProfile);

    // Also update settings profile info
    saveSettings({
      ...settings,
      profile: {
        username: updatedProfile.username,
        avatar: updatedProfile.avatar,
      },
    });
  };

  const disconnectWalletState = () => {
    saveProfile(prev => ({
      ...prev,
      walletConnected: false,
      walletAddress: '',
    }));
  };

  const updateUsername = (name: string) => {
    saveProfile(prev => ({ ...prev, username: name }));

    saveSettings({
      ...settings,
      profile: {
        ...settings.profile,
        username: name,
      },
    });
  };

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updatedSettings = { ...settings, ...newSettings };
    saveSettings(updatedSettings);

    // Sync profile username if updated
    if (newSettings.profile?.username) {
      saveProfile({ ...userProfile, username: newSettings.profile.username });
    }
  };

  // Progression functions
  const gainXP = (amount: number) => {
    saveProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;

      // XP curve: each level requires level * 500 XP
      while (newXp >= newLevel * 500) {
        newXp -= newLevel * 500;
        newLevel++;
        console.log(`Congratulations! Kani leveled up to Level ${newLevel}!`);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const addCoins = (amount: number) => {
    saveProfile(prev => ({
      ...prev,
      coins: prev.coins + amount,
    }));

    // Update mission progress
    updateMissionProgress('collectCoins', amount);
  };

  const buyCosmetic = (id: string, cost: number): boolean => {
    if (userProfile.coins >= cost && !userProfile.unlockedCosmetics.includes(id)) {
      saveProfile(prev => ({
        ...prev,
        coins: prev.coins - cost,
        unlockedCosmetics: [...prev.unlockedCosmetics, id],
      }));
      return true;
    }
    return false;
  };

  const equipCosmetic = (category: 'hat' | 'outfit' | 'weaponSkin' | 'trail' | 'vfx', id: string) => {
    if (userProfile.unlockedCosmetics.includes(id) || id === 'none' || id === 'classic_hat' || id === 'classic_outfit' || id === 'default_skin') {
      saveProfile(prev => ({
        ...prev,
        activeCosmetics: {
          ...prev.activeCosmetics,
          [category]: id,
        },
      }));
    }
  };

  // Mission Helpers
  const updateMissionProgress = (type: 'defeatEnemies' | 'finishLevel' | 'collectCoins' | 'defeatBosses' | 'reachScore' | 'completeCampaign', amount: number) => {
    saveMissions(prev => {
      const newDaily = prev.daily.map(m => {
        if (type === 'defeatEnemies' && m.id === 'd1') {
          return { ...m, progress: Math.min(m.target, m.progress + amount) };
        }
        if (type === 'finishLevel' && m.id === 'd2') {
          return { ...m, progress: Math.min(m.target, m.progress + amount) };
        }
        if (type === 'collectCoins' && m.id === 'd3') {
          return { ...m, progress: Math.min(m.target, m.progress + amount) };
        }
        return m;
      });

      const newWeekly = prev.weekly.map(m => {
        if (type === 'defeatBosses' && m.id === 'w1') {
          return { ...m, progress: Math.min(m.target, m.progress + amount) };
        }
        if (type === 'reachScore' && m.id === 'w2') {
          return { ...m, progress: Math.max(m.progress, Math.min(m.target, amount)) }; // Score is absolute maximum reached
        }
        if (type === 'completeCampaign' && m.id === 'w3') {
          return { ...m, progress: Math.min(m.target, m.progress + amount) };
        }
        return m;
      });

      return { daily: newDaily, weekly: newWeekly };
    });
  };

  const claimMissionReward = (category: 'daily' | 'weekly', missionId: string) => {
    const list = category === 'daily' ? missions.daily : missions.weekly;
    const mission = list.find(m => m.id === missionId);

    if (mission && mission.progress >= mission.target && !mission.rewarded) {
      // Award reward
      if (mission.rewardType === 'coins') {
        addCoins(mission.rewardValue as number);
      } else if (mission.rewardType === 'xp') {
        gainXP(mission.rewardValue as number);
      } else if (mission.rewardType === 'cosmetic') {
        const cosmeticId = mission.rewardValue as string;
        if (!userProfile.unlockedCosmetics.includes(cosmeticId)) {
          saveProfile(prev => ({
            ...prev,
            unlockedCosmetics: [...prev.unlockedCosmetics, cosmeticId],
          }));
        }
      }

      // Mark as rewarded
      saveMissions(prev => {
        const prevList = category === 'daily' ? prev.daily : prev.weekly;
        const updatedList = prevList.map(m => m.id === missionId ? { ...m, rewarded: true } : m);
        return {
          ...prev,
          [category]: updatedList,
        };
      });
    }
  };

  // Game Session management
  const startNewGame = (levelNum: number = 1) => {
    // Determine level max health from player level (+5% health at Level 2, cumulative/flat?)
    const bonusHpPercent = userProfile.level >= 2 ? 5 : 0;
    const maxHp = 100 * (1 + bonusHpPercent / 100);

    // Default weapons unlocked based on player level
    // L5: Machine Gun, L10: Spread Shot, L15: Laser Rifle, L20: Rocket Launcher, L25: Plasma Cannon
    const ammo: Record<string, number> = {
      Pistol: Infinity,
      MachineGun: userProfile.level >= 5 ? 100 : 0,
      SpreadShot: userProfile.level >= 10 ? 50 : 0,
      LaserRifle: userProfile.level >= 15 ? 40 : 0,
      Flamethrower: 0, // Unlocked as standard/pickup in level or based on progression
      RocketLauncher: userProfile.level >= 20 ? 15 : 0,
      PlasmaCannon: userProfile.level >= 25 ? 10 : 0,
    };

    setSession({
      ...DEFAULT_SESSION(),
      level: levelNum,
      maxHealth: maxHp,
      health: maxHp,
      ammo,
      currentWeapon: 'Pistol',
    });
  };

  const updateSession = (update: Partial<GameSession> | ((prev: GameSession) => Partial<GameSession>)) => {
    setSession(prev => {
      const nextUpdate = typeof update === 'function' ? update(prev) : update;
      return { ...prev, ...nextUpdate };
    });
  };

  const endLevel = (_accuracy: number, enemiesDefeated: number, coins: number, xp: number) => {
    // Record scores, kills, level completions
    const finalScore = session.score;
    const finalCoins = session.coinsCollected;
    const finalKills = session.kills;
    const nextLevel = session.level + 1;

    saveProfile(prev => ({
      ...prev,
      coins: prev.coins + coins,
      highScore: Math.max(prev.highScore, finalScore),
      highestLevel: Math.max(prev.highestLevel, nextLevel),
      totalKills: prev.totalKills + enemiesDefeated,
    }));

    gainXP(xp);

    // Update Missions progress
    updateMissionProgress('defeatEnemies', enemiesDefeated);
    updateMissionProgress('collectCoins', coins);
    updateMissionProgress('finishLevel', 1);
    updateMissionProgress('defeatBosses', 1); // 1 boss per level completed
    updateMissionProgress('reachScore', finalScore);
    updateMissionProgress('completeCampaign', 1);

    // Update session
    updateSession({
      score: finalScore,
      coinsCollected: finalCoins,
      kills: finalKills,
      level: nextLevel,
      checkpoint: null, // Clear checkpoint for next level
    });
  };

  const triggerGameOver = () => {
    updateSession({ isGameOver: true });
    // Check high score and update total kills even in game over
    saveProfile(prev => ({
      ...prev,
      highScore: Math.max(prev.highScore, session.score),
      totalKills: prev.totalKills + session.enemiesDefeated,
    }));
    updateMissionProgress('reachScore', session.score);
  };

  const resetAllData = () => {
    localStorage.removeItem('kani_profile');
    localStorage.removeItem('kani_missions');
    localStorage.removeItem('kani_settings');
    setUserProfile(DEFAULT_PROFILE);
    setMissions(DEFAULT_MISSIONS());
    setSettings(DEFAULT_SETTINGS);
    setSession(DEFAULT_SESSION());
  };

  return (
    <GameStateContext.Provider
      value={{
        userProfile,
        missions,
        settings,
        session,
        connectWalletState,
        disconnectWalletState,
        updateUsername,
        updateSettings,
        gainXP,
        addCoins,
        buyCosmetic,
        equipCosmetic,
        startNewGame,
        updateSession,
        endLevel,
        triggerGameOver,
        claimMissionReward,
        resetAllData,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) throw new Error('useGameState must be used within GameStateProvider');
  return context;
};
