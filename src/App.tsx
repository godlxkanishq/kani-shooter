import React, { useState } from 'react';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import { LandingScreen } from './components/UI/LandingScreen';
import { MainMenu } from './components/UI/MainMenu';
import { GameContainer } from './components/Game/GameContainer';

const AppContent: React.FC = () => {
  const [screen, setScreen] = useState<'landing' | 'menu' | 'playing'>('landing');
  const [activeLevel, setActiveLevel] = useState(1);
  const { startNewGame, settings } = useGameState();

  const handleStartGame = (level: number) => {
    setActiveLevel(level);
    // Initialize stats
    startNewGame(level);
    // Launch play screen
    setScreen('playing');
  };

  return (
    <div className={`w-full min-h-screen ${settings.crtFilter ? 'bg-scanlines-container' : ''}`}>
      {/* Dynamic CRT Scanline filter backing class container */}
      {settings.crtFilter && (
        <div className="fixed inset-0 pointer-events-none z-50 bg-scanlines" />
      )}

      {screen === 'landing' && (
        <LandingScreen onEnter={() => setScreen('menu')} />
      )}

      {screen === 'menu' && (
        <MainMenu onStartGame={handleStartGame} />
      )}

      {screen === 'playing' && (
        <GameContainer level={activeLevel} onBackToMenu={() => setScreen('menu')} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
};

export default App;
