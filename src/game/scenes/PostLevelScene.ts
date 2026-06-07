import Phaser from 'phaser';
import { sound } from '../sound';

export interface PostLevelData {
  level: number;
  accuracy: number;
  kills: number;
  coins: number;
  score: number;
  xp: number;
}

export class PostLevelScene extends Phaser.Scene {
  private stats!: PostLevelData;
  private currentY: number = 100;

  constructor() {
    super('PostLevelScene');
  }

  init(data: PostLevelData) {
    this.stats = data || {
      level: 1,
      accuracy: 85,
      kills: 10,
      coins: 15,
      score: 2500,
      xp: 150,
    };
    this.currentY = 100;
  }

  create() {
    const { width, height } = this.scale;

    // Dark screen
    this.add.rectangle(0, 0, width, height, 0x050609).setOrigin(0);

    // Title banner
    this.add.text(width / 2, 50, `LEVEL ${this.stats.level} CLEARED`, {
      fontFamily: '"Press Start 2P", Courier',
      fontSize: '20px',
      color: '#ffd166',
    }).setOrigin(0.5);

    // Stats lines count-up effect
    const lines = [
      { label: 'ACCURACY', val: `${this.stats.accuracy}%`, color: '#06d6a0' },
      { label: 'ENEMIES DEFEATED', val: `${this.stats.kills}`, color: '#ef476f' },
      { label: 'COINS COLLECTED', val: `${this.stats.coins}`, color: '#ffd166' },
      { label: 'XP EARNED', val: `+${this.stats.xp} XP`, color: '#ffb703' },
      { label: 'STAGE SCORE', val: `${this.stats.score}`, color: '#4cc9f0' },
    ];

    lines.forEach((line, idx) => {
      this.time.delayedCall(idx * 500 + 400, () => {
        if (!this.sys.isActive()) return;
        sound.playSFX('powerup');
        
        // Label
        this.add.text(180, this.currentY, line.label, {
          font: 'bold 16px "Courier New", monospace',
          color: '#ffffff',
        });

        // Value
        this.add.text(width - 240, this.currentY, line.val, {
          font: 'bold 16px "Courier New", monospace',
          color: line.color,
          align: 'right',
        }).setOrigin(1, 0);

        this.currentY += 35;
      });
    });

    // Flashing Continue Prompt
    this.time.delayedCall(lines.length * 500 + 700, () => {
      if (!this.sys.isActive()) return;

      const continueText = this.add.text(width / 2, height - 70, 'PRESS ENTER TO CONTINUE', {
        fontFamily: '"Press Start 2P", Courier',
        fontSize: '12px',
        color: '#39ff14',
      }).setOrigin(0.5);

      this.tweens.add({
        targets: continueText,
        alpha: 0.2,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });

      // Bind Keyboard enter
      const enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      if (enterKey) {
        enterKey.once('down', () => {
          sound.playSFX('powerup');
          // Shut down game and return to React Menu
          this.game.events.emit('phaser_return_to_menu');
        });
      }

      // Allow click/tap to continue
      this.input.once('pointerdown', () => {
        sound.playSFX('powerup');
        this.game.events.emit('phaser_return_to_menu');
      });
    });
  }
}
export default PostLevelScene;
