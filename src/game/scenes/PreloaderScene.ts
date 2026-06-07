import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background retro grid styling
    this.add.rectangle(0, 0, width, height, 0x050608).setOrigin(0);

    // Dynamic boot logs simulation
    const logs = [
      'ASTERISM RETRIEVAL SYSTEM v1.0.1...',
      'INITIALIZING 16-BIT GRAPHICS ENGINE...',
      'COMPILING WEAPON SYSTEMS...',
      'BOOTING COMBAT PROTOCOLS...',
      'LOADING LEVEL ENVIRONMENTS...',
      'READY - ASTERISM RETRIEVAL ENGAGED.'
    ];

    let currentLogIndex = 0;
    const logText = this.add.text(40, 60, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#39ff14', // neon green terminal
      lineSpacing: 8,
    });

    const addLogLine = () => {
      if (currentLogIndex < logs.length) {
        logText.text += `> ${logs[currentLogIndex]}\n`;
        currentLogIndex++;
        this.time.delayedCall(250, addLogLine);
      } else {
        // Show flash PRESS ENTER prompt
        const enterText = this.add.text(width / 2, height - 80, 'LOADING COMPLETE', {
          fontFamily: '"Press Start 2P", Courier',
          fontSize: '16px',
          color: '#ffd166',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: enterText,
          alpha: 0.2,
          duration: 400,
          yoyo: true,
          repeat: -1,
        });

        // Auto start game after short delay
        this.time.delayedCall(800, () => {
          const level = this.registry.get('activeLevel') || 1;
          this.scene.start('GameScene', { level });
        });
      }
    };

    addLogLine();
  }
}
export default PreloaderScene;
