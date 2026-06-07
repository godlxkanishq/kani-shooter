import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from '../../game/config';
import { useGameState } from '../../context/GameStateContext';

interface GameContainerProps {
  level: number;
  onBackToMenu: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ level, onBackToMenu }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { session, updateSession, endLevel, triggerGameOver, userProfile } = useGameState();

  // Refs to avoid stale closures in Phaser event listeners
  const sessionRef = useRef(session);
  const endLevelRef = useRef(endLevel);
  const triggerGameOverRef = useRef(triggerGameOver);
  const userProfileRef = useRef(userProfile);

  sessionRef.current = session;
  endLevelRef.current = endLevel;
  triggerGameOverRef.current = triggerGameOver;
  userProfileRef.current = userProfile;



  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Phaser game config
    const config = getGameConfig(containerRef.current);
    const game = new Phaser.Game(config);
    game.registry.set('activeLevel', level); // Store selected level in registry
    gameRef.current = game;

    // Listen to Phaser events
    game.events.on('phaser_query_session_stats', (callback: (stats: any) => void) => {
      // Phaser pulls initial values from GameStateContext using the latest ref
      callback({
        score: sessionRef.current.score,
        coinsCollected: sessionRef.current.coinsCollected,
        kills: sessionRef.current.kills,
        level: sessionRef.current.level,
        lives: sessionRef.current.lives,
        health: sessionRef.current.health,
        maxHealth: sessionRef.current.maxHealth,
        currentWeapon: sessionRef.current.currentWeapon,
        checkpoint: sessionRef.current.checkpoint,
        activeCosmetics: userProfileRef.current.activeCosmetics,
      });
    });

    game.events.on('phaser_coin_collected', (data: { coins: number; score: number }) => {
      updateSession({
        coinsCollected: data.coins,
        score: data.score,
      });
    });

    game.events.on('phaser_enemy_killed', (data: { score: number }) => {
      // Functional update to avoid reading stale kills state
      updateSession(prev => ({
        score: data.score,
        kills: prev.kills + 1,
        enemiesDefeated: prev.enemiesDefeated + 1,
      }));
    });

    game.events.on('phaser_health_changed', (health: number) => {
      updateSession({ health });
    });

    game.events.on('phaser_lives_changed', (lives: number) => {
      updateSession({ lives });
    });

    game.events.on('phaser_weapon_unlocked', (weaponType: string) => {
      // Functional update to avoid reading stale ammo state
      updateSession(prev => {
        const nextAmmo = { ...prev.ammo, [weaponType]: (prev.ammo[weaponType] || 0) + 50 };
        return {
          currentWeapon: weaponType,
          ammo: nextAmmo,
        };
      });
    });

    game.events.on('phaser_checkpoint_saved', (data: { x: number; y: number; level: number }) => {
      updateSession({
        checkpoint: { x: data.x, y: data.y, level: data.level },
      });
    });

    game.events.on('phaser_boss_spawned', () => {});
    game.events.on('phaser_boss_health_changed', () => {});

    game.events.on('phaser_level_completed', (stats: {
      level: number;
      accuracy: number;
      enemiesDefeated: number;
      coinsCollected: number;
      scoreEarned: number;
      xpEarned: number;
    }) => {
      // Trigger completion hook via ref
      endLevelRef.current(
        stats.accuracy,
        stats.enemiesDefeated,
        stats.coinsCollected,
        stats.xpEarned
      );
    });

    game.events.on('phaser_game_over', () => {
      triggerGameOverRef.current();
    });

    game.events.on('phaser_return_to_menu', () => {
      onBackToMenu();
    });

    // Cleanup Phaser Game Instance
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-kani-dark select-none">
      {/* Phaser Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full overflow-hidden relative flex items-center justify-center bg-black"
      />

      {/* Retro scanline CRT Overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines z-10 opacity-[0.06]" />

      {/* React HTML HUD overlays removed - they are now handled entirely by Phaser HUDScene! */}

      {/* Game Over Modal */}
      {session.isGameOver && (
        <div className="absolute inset-0 bg-black-90 flex flex-col items-center justify-center z-30 font-mono text-center">
          <h1 className="text-4xl text-red-600 font-extrabold tracking-widest mb-2 animate-bounce">
            MISSION FAILED
          </h1>
          <p className="text-kani-gray text-sm mb-6 max-w-sm">
            Kani was overrun. Your final score of {session.score} has been recorded in the local mainframe.
          </p>

          <div className="bg-kani-black border border-red-500-20 p-4 rounded mb-6 text-left w-64">
            <div className="flex justify-between text-xs mb-1">
              <span>SCORE Gained:</span>
              <span className="text-kani-green font-bold">{session.score}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span>Stage Reached:</span>
              <span className="text-red-400 font-bold">{session.level}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Kills Count:</span>
              <span className="text-red-500 font-bold">{session.kills}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                updateSession({ isGameOver: false });
                onBackToMenu();
              }}
              className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded shadow-[0_0_10px_rgba(239,35,60,0.4)]"
            >
              RETURN TO MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
