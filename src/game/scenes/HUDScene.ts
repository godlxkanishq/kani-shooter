import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  private livesText!: Phaser.GameObjects.Text;
  private bossBarContainer!: Phaser.GameObjects.Rectangle;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossNameText!: Phaser.GameObjects.Text;
  private crosshair!: Phaser.GameObjects.Graphics;

  private currentScore: number = 0;
  private currentCoins: number = 0;
  private currentWeapon: string = 'Pistol';
  private currentHealth: number = 100;
  private currentMaxHealth: number = 100;
  private currentLives: number = 3;

  private levelColor: number = 0xb678ff;
  private levelColorHex: string = '#b678ff';

  constructor() {
    super('HUDScene');
  }

  init(data: { color?: number }) {
    if (data.color !== undefined) {
      this.levelColor = data.color;
      this.levelColorHex = '#' + data.color.toString(16).padStart(6, '0');
    }
  }

  create() {
    const { width, height } = this.scale;

    // Level-specific HUD base
    const themeColor = this.levelColor;
    const themeColorStr = this.levelColorHex;
    
    // Draw dynamic crosshair
    this.crosshair = this.add.graphics();
    this.crosshair.lineStyle(2, themeColor, 0.8);
    this.crosshair.beginPath();
    this.crosshair.moveTo(0, -15); this.crosshair.lineTo(0, 15);
    this.crosshair.moveTo(-15, 0); this.crosshair.lineTo(15, 0);
    this.crosshair.strokePath();

    // Draw frame brackets
    const bracketSize = 40;
    const padding = 20;
    const ch = this.add.graphics();
    ch.lineStyle(3, themeColor, 0.5);
    // TL
    ch.beginPath(); ch.moveTo(padding, padding + bracketSize); ch.lineTo(padding, padding); ch.lineTo(padding + bracketSize, padding); ch.strokePath();
    // TR
    ch.beginPath(); ch.moveTo(width - padding - bracketSize, padding); ch.lineTo(width - padding, padding); ch.lineTo(width - padding, padding + bracketSize); ch.strokePath();
    // BL
    ch.beginPath(); ch.moveTo(padding, height - padding - bracketSize); ch.lineTo(padding, height - padding); ch.lineTo(padding + bracketSize, height - padding); ch.strokePath();
    // BR
    ch.beginPath(); ch.moveTo(width - padding - bracketSize, height - padding); ch.lineTo(width - padding, height - padding); ch.lineTo(width - padding, height - padding - bracketSize); ch.strokePath();

    // Static Technical Text
    this.add.text(padding + 10, padding + 10, 'SYS: OK\nDATA: 34A2\nBRG: 19\n\nARM', { font: 'bold 10px "Courier New", monospace', color: themeColorStr }).setAlpha(0.7);
    this.add.text(width - padding - 80, padding + 10, 'N: 48°12\'33"\nW: 122°29\'11"\nDST: 1.2\nRNG: 259 M', { font: 'bold 10px "Courier New", monospace', color: themeColorStr, align: 'right' }).setAlpha(0.7);
    this.add.text(padding + 10, height - padding - 20, 'F: 1050', { font: 'bold 10px "Courier New", monospace', color: themeColorStr }).setAlpha(0.7);
    this.add.text(width - padding - 60, height - padding - 20, 'LOCKED', { font: 'bold 10px "Courier New", monospace', color: themeColorStr }).setAlpha(0.7);

    // Target Locked center top
    this.add.text(width / 2, 60, '◇ TARGET LOCKED ◇', { font: 'bold 12px "Courier New", monospace', color: themeColorStr }).setOrigin(0.5).setAlpha(0.8);

    // Score Label
    this.scoreText = this.add.text(width / 2 - 150, 20, 'SCORE: 000000', { font: 'bold 14px "Courier New", monospace', color: themeColorStr });

    // Coins Label
    this.coinsText = this.add.text(width / 2 + 50, 20, 'COINS: 0', { font: 'bold 14px "Courier New", monospace', color: themeColorStr });

    // Lives Label
    this.livesText = this.add.text(width / 2 - 150, 40, 'LIVES: ❤❤❤', { font: 'bold 14px "Courier New", monospace', color: themeColorStr });

    // Active Weapon Label
    this.weaponText = this.add.text(width / 2 + 50, 40, 'WPN: PISTOL', { font: 'bold 14px "Courier New", monospace', color: themeColorStr });

    // Health Bar Graphic
    this.healthBar = this.add.graphics();
    this.drawHealthBar();

    // Setup Boss Health Bar (hidden by default)
    this.createBossHealthBar();

    // Wire up events from main GameScene
    const mainGame = this.scene.get('GameScene');
    
    // Request stats sync
    mainGame.game.events.emit('phaser_query_session_stats', (sessionStats: any) => {
      if (sessionStats) {
        this.currentScore = sessionStats.score;
        this.currentCoins = sessionStats.coinsCollected;
        this.currentWeapon = sessionStats.currentWeapon;
        this.currentHealth = sessionStats.health;
        this.currentMaxHealth = sessionStats.maxHealth;
        this.currentLives = sessionStats.lives;
        
        this.updateHUDText();
        this.drawHealthBar();
      }
    });

    mainGame.game.events.on('phaser_coin_collected', (data: { coins: number; score: number }) => {
      this.currentCoins = data.coins;
      this.currentScore = data.score;
      this.updateHUDText();
    });

    mainGame.game.events.on('phaser_enemy_killed', (data: { score: number }) => {
      this.currentScore = data.score;
      this.updateHUDText();
    });

    mainGame.game.events.on('phaser_health_changed', (health: number) => {
      this.currentHealth = health;
      this.drawHealthBar();
    });

    mainGame.game.events.on('phaser_lives_changed', (lives: number) => {
      this.currentLives = lives;
      this.updateHUDText();
    });

    mainGame.game.events.on('phaser_weapon_unlocked', (weaponType: string) => {
      this.currentWeapon = weaponType;
      this.updateHUDText();
    });

    mainGame.game.events.on('phaser_boss_spawned', (bossInfo: { name: string; hp: number; maxHp: number }) => {
      this.showBossHealthBar(bossInfo.name, bossInfo.hp, bossInfo.maxHp);
    });

    mainGame.game.events.on('phaser_boss_health_changed', (bossInfo: { hp: number; maxHp: number }) => {
      this.updateBossHealthBar(bossInfo.hp, bossInfo.maxHp);
    });

    this.createVirtualControls();
  }

  private updateHUDText() {
    // Score string formatting
    const scoreStr = String(this.currentScore).padStart(6, '0');
    this.scoreText.setText(`SCORE: ${scoreStr}`);
    this.coinsText.setText(`COINS: ${this.currentCoins}`);
    this.weaponText.setText(`WPN: ${this.currentWeapon.toUpperCase()}`);

    const hearts = '❤'.repeat(Math.max(0, this.currentLives));
    this.livesText.setText(`LIVES: ${hearts || 'NONE'}`);
  }

  private drawHealthBar() {
    this.healthBar.clear();
    const x = this.scale.width / 2 - 50;
    const y = 80;
    const widthBar = 100;
    const height = 12;

    // Draw outline
    this.healthBar.lineStyle(1, this.levelColor, 0.8);
    this.healthBar.strokeRect(x, y, widthBar, height);

    // Draw fill
    const healthPercent = this.currentHealth / this.currentMaxHealth;
    this.healthBar.fillStyle(this.levelColor, 0.4);
    this.healthBar.fillRect(x + 2, y + 2, (widthBar - 4) * Math.max(0, healthPercent), height - 4);
  }

  private createBossHealthBar() {
    const { width } = this.scale;

    // Container box
    this.bossBarContainer = this.add.rectangle(width / 2, 100, 300, 16, 0x05000a)
      .setStrokeStyle(2, this.levelColor, 0.8)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    // Fill rect
    this.bossBarFill = this.add.rectangle(width / 2 - 148, 100, 296, 12, this.levelColor, 0.5)
      .setOrigin(0, 0.5)
      .setVisible(false);

    // Text
    this.bossNameText = this.add.text(width / 2, 85, '', {
      font: 'bold 14px "Courier New", monospace',
      color: this.levelColorHex,
    }).setOrigin(0.5).setVisible(false);
  }

  private createVirtualControls() {
    // Only create if touch is supported
    if (!this.sys.game.device.input.touch) return;

    const { width, height } = this.scale;
    const baseAlpha = 0.4;
    const activeAlpha = 0.8;

    const createBtn = (x: number, y: number, label: string, key: string, isRound: boolean = false, widthOverride: number = 60, heightOverride: number = 60) => {
      const btn = this.add.container(x, y);
      btn.setSize(widthOverride, heightOverride);

      const bg = isRound 
        ? this.add.circle(0, 0, widthOverride/2, this.levelColor, baseAlpha)
        : this.add.rectangle(0, 0, widthOverride - 10, heightOverride - 10, this.levelColor, baseAlpha);
      
      const txt = this.add.text(0, 0, label, { font: 'bold 20px Arial', color: '#000' }).setOrigin(0.5);

      btn.add([bg, txt]);
      btn.setInteractive();

      btn.on('pointerdown', () => {
        bg.setAlpha(activeAlpha);
        this.registry.set(key, true);
      });

      const release = () => {
        bg.setAlpha(baseAlpha);
        this.registry.set(key, false);
      };

      btn.on('pointerup', release);
      btn.on('pointerout', release);

      this.registry.set(key, false);

      return btn;
    };

    // Floating Joystick on the left side
    const joyBaseDefaultX = 100;
    const joyBaseDefaultY = height - 100;
    const joyRadius = 60;

    const joyBase = this.add.circle(joyBaseDefaultX, joyBaseDefaultY, joyRadius, this.levelColor, 0.2);
    const joyThumb = this.add.circle(joyBaseDefaultX, joyBaseDefaultY, 30, this.levelColor, 0.6);
    
    let activeJoyPointer: Phaser.Input.Pointer | null = null;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < width / 2 && !activeJoyPointer) {
        activeJoyPointer = pointer;
        joyBase.setPosition(pointer.x, pointer.y);
        joyThumb.setPosition(pointer.x, pointer.y);
        joyBase.setAlpha(0.4);
        joyThumb.setAlpha(0.9);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (activeJoyPointer && pointer.id === activeJoyPointer.id) {
        const dx = pointer.x - joyBase.x;
        const dy = pointer.y - joyBase.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        if (dist > joyRadius) {
          joyThumb.x = joyBase.x + Math.cos(angle) * joyRadius;
          joyThumb.y = joyBase.y + Math.sin(angle) * joyRadius;
        } else {
          joyThumb.x = pointer.x;
          joyThumb.y = pointer.y;
        }

        // Apply movement thresholds
        this.registry.set('v_left', dx < -20);
        this.registry.set('v_right', dx > 20);
        this.registry.set('v_up', dy < -20);
        this.registry.set('v_down', dy > 20);
      }
    });

    const releaseJoy = (pointer: Phaser.Input.Pointer) => {
      if (activeJoyPointer && pointer.id === activeJoyPointer.id) {
        activeJoyPointer = null;
        joyBase.setPosition(joyBaseDefaultX, joyBaseDefaultY);
        joyThumb.setPosition(joyBaseDefaultX, joyBaseDefaultY);
        joyBase.setAlpha(0.2);
        joyThumb.setAlpha(0.6);
        this.registry.set('v_left', false);
        this.registry.set('v_right', false);
        this.registry.set('v_up', false);
        this.registry.set('v_down', false);
      }
    };

    this.input.on('pointerup', releaseJoy);
    this.input.on('pointerout', releaseJoy);

    // Action buttons on the right side
    const actX = width - 80;
    const actY = height - 80;
    createBtn(actX - 60, actY + 20, 'FIRE', 'v_shoot', true, 60, 60);
    createBtn(actX + 20, actY - 30, 'JUMP', 'v_jump', true, 60, 60);
  }

  private showBossHealthBar(name: string, hp: number, maxHp: number) {
    this.bossNameText.setText(`BOSS: ${name.toUpperCase()}`).setVisible(true);
    this.bossBarContainer.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.updateBossHealthBar(hp, maxHp);
  }

  private updateBossHealthBar(hp: number, maxHp: number) {
    const pct = Math.max(0, hp / maxHp);
    this.bossBarFill.width = 296 * pct;
  }

  update() {
    if (this.crosshair) {
      const pointer = this.input.activePointer;
      // Follow mouse pointer directly
      this.crosshair.setPosition(pointer.x, pointer.y);
    }
  }
}
export default HUDScene;
