import Phaser from 'phaser';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public bossLevel: number;
  public bossName: string;
  public hp: number;
  public maxHp: number;
  private isFrenzied: boolean = false;
  private lastAttack: number = 0;
  private attackInterval: number = 2000;
  private attackState: number = 0;
  private floatDir: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
    let key = 'boss_tank';
    let name = 'Armored Tank';
    let maxHp = 300;

    switch (level) {
      case 1: key = 'boss_tank'; name = 'Armored Tank'; maxHp = 300; break;
      case 2: key = 'boss_scorpion'; name = 'Mechanical Scorpion'; maxHp = 450; break;
      case 3: key = 'boss_train'; name = 'Train Commander'; maxHp = 600; break;
      case 4: key = 'boss_ice_mech'; name = 'Ice Mech'; maxHp = 750; break;
      case 5: key = 'boss_spider'; name = 'Spider Machine'; maxHp = 900; break;
      case 6: key = 'boss_mutant'; name = 'Mutant Beast'; maxHp = 1100; break;
      case 7: key = 'boss_queen'; name = 'Alien Queen'; maxHp = 1300; break;
      case 8: key = 'boss_ai'; name = 'AI War Machine'; maxHp = 1600; break;
    }

    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.bossLevel = level;
    this.bossName = name;
    this.hp = maxHp;
    this.maxHp = maxHp;

    this.setCollideWorldBounds(true);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      // (Immovable removed so boss can cleanly land on static platforms)

      // Turn off gravity for floating bosses
      if (level === 4 || level === 7 || level === 8) {
        body.setAllowGravity(false);
      }
    }

    // Set sizing and bounding box offset based on level
    this.adjustHitbox();
  }

  private adjustHitbox() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    switch (this.bossLevel) {
      case 1: // Tank (128x64)
        body.setSize(110, 50);
        body.setOffset(9, 14);
        break;
      case 2: // Scorpion (96x96)
        body.setSize(80, 70);
        body.setOffset(8, 20);
        break;
      case 3: // Train (64x64)
        body.setSize(56, 56);
        body.setOffset(4, 8);
        break;
      case 4: // Ice Mech (96x96)
        body.setSize(75, 80);
        body.setOffset(10, 10);
        break;
      case 5: // Spider (96x96)
        body.setSize(80, 60);
        body.setOffset(8, 28);
        break;
      case 6: // Mutant (96x96)
        body.setSize(80, 80);
        body.setOffset(8, 10);
        break;
      case 7: // Queen (128x128)
        body.setSize(90, 110);
        body.setOffset(19, 10);
        break;
      case 8: // AI Core (96x96)
        body.setSize(75, 75);
        body.setOffset(10, 10);
        break;
    }
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);

    // Visual red hit flashing
    this.setTint(0xff3333);
    this.scene.time.delayedCall(120, () => {
      if (this.active) {
        if (this.isFrenzied) {
          this.setTint(0xff8888); // Stays slightly pink/frenzied red
        } else {
          this.clearTint();
        }
      }
    });

    // Check frenzy phase
    if (this.hp <= this.maxHp * 0.5 && !this.isFrenzied) {
      this.isFrenzied = true;
      this.attackInterval = this.attackInterval * 0.6; // Speed up attacks
      this.setTint(0xff8888);
      // Play a warning screen shake or visual hint
      this.scene.cameras.main.shake(400, 0.015);
    }

    return this.hp <= 0;
  }

  update(
    time: number,
    playerX: number,
    playerY: number,
    spawnProjectile: (x: number, y: number, vx: number, vy: number, type: string) => void
  ) {
    if (this.hp <= 0) return;

    // A. Visual movement floats for air bosses
    if (this.bossLevel === 4 || this.bossLevel === 8) {
      // Floating up and down slowly
      this.y += Math.sin(time * 0.003) * 0.4 * this.floatDir;
    }

    if (this.bossLevel === 7) {
      // Alien Queen hovers near player Y coordinates slowly
      const dy = playerY - this.y;
      this.y += dy * 0.02;
    }

    // B. Attack loop logic
    if (time > this.lastAttack + this.attackInterval) {
      this.lastAttack = time;
      this.executeAttack(playerX, playerY, spawnProjectile);
    }
  }

  private executeAttack(
    playerX: number,
    playerY: number,
    spawnProjectile: (x: number, y: number, vx: number, vy: number, type: string) => void
  ) {
    this.attackState = (this.attackState + 1) % 3;

    // Spawn point varies by boss width
    const spawnX = this.x - this.width / 2;
    const spawnY = this.y;
    
    // Calculate angle to player for aimed shots
    const dx = playerX - spawnX;
    const dy = playerY - spawnY;
    const angleToPlayer = Math.atan2(dy, dx);

    switch (this.bossLevel) {
      case 1: { // Tank Outpost
        if (this.attackState === 0) {
          spawnProjectile(spawnX, spawnY - 10, Math.cos(angleToPlayer) * 350, Math.sin(angleToPlayer) * 350, 'rocket');
        } else {
          spawnProjectile(spawnX, spawnY + 10, Math.cos(angleToPlayer - 0.2) * 250, Math.sin(angleToPlayer - 0.2) * 250, 'standard');
          spawnProjectile(spawnX, spawnY + 10, Math.cos(angleToPlayer) * 250, Math.sin(angleToPlayer) * 250, 'standard');
          spawnProjectile(spawnX, spawnY + 10, Math.cos(angleToPlayer + 0.2) * 250, Math.sin(angleToPlayer + 0.2) * 250, 'standard');
        }
        break;
      }
      case 2: { // Scorpion temple
        if (this.attackState === 0) {
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer) * 300, Math.sin(angleToPlayer) * 300, 'laser');
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer - 0.15) * 300, Math.sin(angleToPlayer - 0.15) * 300, 'laser');
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer + 0.15) * 300, Math.sin(angleToPlayer + 0.15) * 300, 'laser');
        } else {
          for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 100, () => {
              if (this.active) spawnProjectile(spawnX, spawnY + 20, Math.cos(angleToPlayer) * 200, Math.sin(angleToPlayer) * 200, 'standard');
            });
          }
        }
        break;
      }
      case 3: { // Train Commander
        for (let i = 0; i < 5; i++) {
          this.scene.time.delayedCall(i * 80, () => {
            if (this.active) spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer) * 300, Math.sin(angleToPlayer) * 300, 'standard');
          });
        }
        if (this.attackState === 2) {
          spawnProjectile(spawnX, spawnY - 20, Math.cos(angleToPlayer) * 320, -200, 'rocket'); // arcs down due to gravity in main
        }
        break;
      }
      case 4: { // Ice Mech
        if (this.attackState === 0) {
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer) * 250, Math.sin(angleToPlayer) * 250, 'plasma');
        } else {
          spawnProjectile(spawnX, spawnY - 15, Math.cos(angleToPlayer - 0.1) * 240, Math.sin(angleToPlayer - 0.1) * 240, 'laser');
          spawnProjectile(spawnX, spawnY + 15, Math.cos(angleToPlayer + 0.1) * 240, Math.sin(angleToPlayer + 0.1) * 240, 'laser');
        }
        break;
      }
      case 5: { // Spider Machine
        for (let i = 0; i < 6; i++) {
          this.scene.time.delayedCall(i * 100, () => {
            if (this.active) {
              const spread = (Math.random() - 0.5) * 0.4;
              spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer + spread) * 200, Math.sin(angleToPlayer + spread) * 200, 'flame');
            }
          });
        }
        break;
      }
      case 6: { // Mutant Beast
        const angles = [-0.4, -0.2, 0, 0.2, 0.4];
        angles.forEach(ang => {
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer + ang) * 220, Math.sin(angleToPlayer + ang) * 220, 'standard');
        });
        break;
      }
      case 7: { // Alien Queen
        if (this.attackState === 0) {
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer) * 350, Math.sin(angleToPlayer) * 350, 'rocket');
        } else {
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer - 0.3) * 250, Math.sin(angleToPlayer - 0.3) * 250, 'laser');
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer) * 250, Math.sin(angleToPlayer) * 250, 'laser');
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer + 0.3) * 250, Math.sin(angleToPlayer + 0.3) * 250, 'laser');
        }
        break;
      }
      case 8: { // Final AI Core
        if (this.attackState === 0) {
          spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer) * 250, Math.sin(angleToPlayer) * 250, 'plasma');
        } else {
          const steps = 8;
          for (let i = 0; i < steps; i++) {
            const angle = (i * Math.PI * 2) / steps;
            spawnProjectile(spawnX, spawnY, Math.cos(angleToPlayer + angle) * 180, Math.sin(angleToPlayer + angle) * 180, 'laser');
          }
        }
        break;
      }
    }
  }
}
export default Boss;
