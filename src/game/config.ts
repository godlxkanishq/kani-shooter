import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { PostLevelScene } from './scenes/PostLevelScene';

export const getGameConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => {
  // Calculate the aspect ratio to stretch the game width dynamically for ultrawide/mobile displays
  const ratio = window.innerWidth / window.innerHeight;
  const gameHeight = 450;
  // If the device is wider than 16:9 (ratio > 1.77), we expand the game width to fill it.
  const gameWidth = Math.max(800, gameHeight * ratio);

  return {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: gameWidth,
      height: gameHeight,
    },
    parent: parent,
  backgroundColor: '#0c0d12',
  pixelArt: true,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false,
    },
  },
  input: {
    activePointers: 3, // Allow multi-touch for mobile controls
  },
  scene: [BootScene, PreloaderScene, GameScene, HUDScene, PostLevelScene],
  };
};
