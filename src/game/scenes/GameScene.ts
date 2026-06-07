import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { sound } from '../sound';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private ladders!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private powerups!: Phaser.Physics.Arcade.Group;
  private checkpoints!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private boss: Boss | null = null;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private explosionParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  private currentLevelNum: number = 1;
  private isBossSpawned: boolean = false;
  private bossArenaX: number = 2650;
  private mapWidth: number = 3200;
  private lastCheckpoint: { x: number; y: number } = { x: 100, y: 300 };
  public levelColor: number = 0xffffff;

  constructor() {
    super('GameScene');
  }

  init(data: { level?: number }) {
    this.currentLevelNum = data.level || 1;
    this.isBossSpawned = false;
    this.boss = null;
    this.lastCheckpoint = { x: 100, y: 300 };
  }

  create() {
    const { height } = this.scale;

    // Set world physics bounds (disable bottom collision so player can fall into pits)
    this.physics.world.setBounds(0, 0, this.mapWidth, height);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.cameras.main.setBounds(0, 0, this.mapWidth, height);
    this.cameras.main.setBackgroundColor('#05000a');

    // Add scrolling neon grid background
    const bgColors = [0xb678ff, 0xffff00, 0xff8800, 0x00eeff, 0x39ff14, 0xff00ff, 0xff0055, 0xff0000];
    this.levelColor = bgColors[(this.currentLevelNum - 1) % 8];
    this.add.tileSprite(0, 0, this.mapWidth, height, 'bg_grid')
      .setOrigin(0, 0)
      .setScrollFactor(0.3)
      .setTint(this.levelColor)
      .setAlpha(0.15)
      .setDepth(-10);

    // Create Groups
    this.platforms = this.physics.add.staticGroup();
    this.ladders = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.coins = this.physics.add.group();
    this.powerups = this.physics.add.group();
    this.checkpoints = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    // Setup Explosion Particle System
    const particleTexture = this.textures.get('explosion_particle');
    if (particleTexture) {
      const emitter = this.add.particles(0, 0, 'explosion_particle', {
        lifespan: 400,
        speed: { min: 50, max: 150 },
        scale: { start: 1.5, end: 0 },
        blendMode: 'ADD',
        emitting: false
      });
      this.explosionParticles = emitter;
    }

    // Build the Level procedurally!
    this.buildLevelProcedurally();

    // Create Player
    this.player = new Player(this, this.lastCheckpoint.x, this.lastCheckpoint.y);
    
    // Read starting stats from game state bridge or default values
    this.game.events.emit('phaser_query_session_stats', (sessionStats: any) => {
      if (sessionStats) {
        this.player.setWeapon(sessionStats.currentWeapon);
        this.player.health = sessionStats.health;
        this.player.maxHealth = sessionStats.maxHealth;
        this.player.lives = sessionStats.lives;
        this.player.score = sessionStats.score;
        this.player.coins = sessionStats.coinsCollected;
        
        if (sessionStats.activeCosmetics) {
          this.player.setCosmetics(sessionStats.activeCosmetics);
        }

        if (sessionStats.checkpoint && sessionStats.checkpoint.level === this.currentLevelNum) {
          this.lastCheckpoint = { x: sessionStats.checkpoint.x, y: sessionStats.checkpoint.y };
          this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y);
        }
      }
    });

    // Register shooting handler
    this.player.registerFireCallback((x, y, vx, vy, weaponType) => {
      this.firePlayerBullet(x, y, vx, vy, weaponType);
    });

    // Colliders Setup
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.powerups, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // Overlap: Player and Spikes
    this.physics.add.overlap(this.player, this.spikes, () => {
      this.player.takeDamage(20);
      this.game.events.emit('phaser_health_changed', this.player.health);
      if (this.player.health <= 0) {
        this.handlePlayerDeath();
      }
    });

    // Overlap: Player and Coins
    this.physics.add.overlap(this.player, this.coins, (_p, c) => {
      const coinSprite = c as Phaser.Physics.Arcade.Sprite;
      coinSprite.destroy();
      this.player.coins += 1;
      this.player.score += 50;
      sound.playSFX('powerup');
      this.game.events.emit('phaser_coin_collected', { coins: this.player.coins, score: this.player.score });
    });

    // Overlap: Player and Powerups
    this.physics.add.overlap(this.player, this.powerups, (_p, pow) => {
      const pBox = pow as Phaser.Physics.Arcade.Sprite;
      const type = pBox.getData('type');
      pBox.destroy();

      this.player.setWeapon(type);
      sound.playSFX('powerup');
      this.game.events.emit('phaser_weapon_unlocked', type);
    });

    // Overlap: Player and Checkpoints
    this.physics.add.overlap(this.player, this.checkpoints, (_p, ch) => {
      const flag = ch as Phaser.Physics.Arcade.Sprite;
      if (flag.texture.key === 'checkpoint_flag') {
        flag.setTexture('checkpoint_active');
        this.lastCheckpoint = { x: flag.x, y: flag.y - 10 };
        sound.playSFX('powerup');
        this.game.events.emit('phaser_checkpoint_saved', { x: flag.x, y: flag.y - 10, level: this.currentLevelNum });
      }
    });

    // Bullet overlaps
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemyObj) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      const e = enemyObj as Enemy;
      
      const dmg = b.getData('damage') || 10;
      b.destroy();

      const isDead = e.takeDamage(dmg);
      if (isDead) {
        this.explosionParticles.emitParticleAt(e.x, e.y, 10);
        sound.playSFX('explosion');
        this.player.score += 200;
        e.destroy();

        // Roll chance for coin/powerup drop
        this.handleEnemyDrop(e.x, e.y);
        
        // Notify React
        this.game.events.emit('phaser_enemy_killed', { score: this.player.score });
      }
    });

    // Overlap: Player and enemy bullet
    this.physics.add.overlap(this.player, this.enemyBullets, (_p, bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      b.destroy();

      this.player.takeDamage(15);
      this.game.events.emit('phaser_health_changed', this.player.health);
      if (this.player.health <= 0) {
        this.handlePlayerDeath();
      }
    });

    // Overlap: Player and enemy body contact
    this.physics.add.overlap(this.player, this.enemies, (_p, _e) => {
      this.player.takeDamage(10);
      this.game.events.emit('phaser_health_changed', this.player.health);
      if (this.player.health <= 0) {
        this.handlePlayerDeath();
      }
    });

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Launch HUD Scene concurrently
    this.scene.launch('HUDScene');

    // Single global listener for world bounds destruction
    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject && (this.playerBullets.contains(body.gameObject as any) || this.enemyBullets.contains(body.gameObject as any))) {
        body.gameObject.destroy();
      }
    });

    // Start background chiptune track
    sound.startMusic();
  }

  update(time: number, _delta: number) {
    if (!this.player || !this.player.active || !this.player.body) return;

    // Check if player fell into pit
    if (this.player.y > this.scale.height + 50) {
      this.player.takeDamage(100);
      this.game.events.emit('phaser_health_changed', 0);
      this.handlePlayerDeath();
      return;
    }

    // Check ladder overlap proximity
    let isLadderNearby = false;
    this.physics.overlap(this.player, this.ladders, () => {
      isLadderNearby = true;
    });

    // Update player controls
    this.player.update(time, isLadderNearby);

    // Update enemies shooting routines
    this.enemies.getChildren().forEach(obj => {
      const e = obj as Enemy;
      e.update(time, this.player.x, this.player.y, (ex, ey, vx, vy) => {
        this.fireEnemyBullet(ex, ey, vx, vy);
      });
    });

    // Update Boss logic if active
    if (this.isBossSpawned && this.boss && this.boss.active) {
      this.boss.update(time, this.player.x, this.player.y, (bx, by, vx, vy, type) => {
        this.fireBossBullet(bx, by, vx, vy, type);
      });
    }

    // Materialize unbuilt environment blocks as the player approaches them
    // Expand the render radius during the boss fight so the arena doesn't dematerialize under the boss
    const renderRadius = this.isBossSpawned ? 800 : 350; 
    const allObjects = [
      ...this.platforms.getChildren(),
      ...this.ladders.getChildren(),
      ...this.enemies.getChildren(),
      ...this.coins.getChildren(),
      ...this.spikes.getChildren(),
      ...this.checkpoints.getChildren()
    ];
    
    allObjects.forEach((obj: any) => {
      const inView = Math.abs(obj.x - this.player.x) <= renderRadius;
      
      if (inView && obj.getData('built') === false) {
        obj.setData('built', true);
        obj.setVisible(true);
        
        if (obj.body) obj.body.enable = true;

        this.tweens.add({
          targets: obj,
          alpha: 1,
          duration: 250,
          ease: 'Power2'
        });
        
        if (Math.random() < 0.3) {
          const p = this.add.particles(obj.x, obj.y, 'explosion_particle', {
             speed: { min: 20, max: 60 },
             angle: { min: 0, max: 360 },
             scale: { start: 1, end: 0 },
             alpha: { start: 1, end: 0 },
             lifespan: 300,
             tint: this.levelColor,
             quantity: 2
          });
          this.time.delayedCall(300, () => p.destroy());
        }
      } else if (!inView && obj.getData('built') === true) {
        obj.setData('built', false);
        obj.setAlpha(0);
        obj.setVisible(false);
        if (obj.body) obj.body.enable = false;
        this.tweens.killTweensOf(obj);
      }
    });

    // Spawn Boss check when player reaches Boss arena
    if (!this.isBossSpawned && this.player.x >= this.bossArenaX) {
      this.spawnLevelBoss();
    }

    // Keep camera bounded within Arena once Boss is spawned
    if (this.isBossSpawned) {
      this.cameras.main.setBounds(this.bossArenaX - 100, 0, this.mapWidth - (this.bossArenaX - 100), this.scale.height);
      this.physics.world.setBounds(this.bossArenaX - 100, 0, this.mapWidth - (this.bossArenaX - 100), this.scale.height);
      this.physics.world.setBoundsCollision(true, true, true, false);
      this.player.setCollideWorldBounds(true);
    }
  }

  private buildLevelProcedurally() {
    const tileIndex = (this.currentLevelNum - 1) % 8; // tile color scheme index
    const floorY = 418;

    // A. Generate ground plates with some platform pit gaps
    let x = 0;
    while (x < this.mapWidth) {
      // Create random pits (gaps) from level 1 onwards, except in starting area and boss arena
      const isStartArea = x < 400;
      const isBossArea = x > this.bossArenaX - 100;
      const rollPit = Math.random() < 0.25;

      if (!isStartArea && !isBossArea && rollPit) {
        // Gap of 96 pixels (3 tiles wide)
        x += 96;
        // Place dangerous glowing hazards in pits for harder levels
        if (this.currentLevelNum > 2) {
          const spike = this.spikes.create(x - 48, floorY + 16, 'explosion_particle').setScale(2).setTint(this.levelColor);
          spike.body.setSize(32, 16);
          spike.body.enable = false;
          spike.setData('built', false); spike.setAlpha(0); spike.setVisible(false);
        }
        continue;
      }

      for (let i = 0; i < 4; i++) {
        const platform = this.platforms.create(x + 16, floorY, 'game_tiles');
        platform.setFrame(tileIndex);
        platform.body.updateFromGameObject();
        platform.setAlpha(0);
        platform.setVisible(false);
        platform.body.enable = false;
        platform.setData('built', false);
        
        // Safely spawn an enemy right on this ground tile
        if (Math.random() < 0.06 && x > 450 && x < this.bossArenaX - 200) {
          const enemyType = this.getEnemyTypeForLevel(this.currentLevelNum, Math.floor(x / 100));
          const enemy = new Enemy(this, x + 16, floorY - 32, enemyType);
          this.enemies.add(enemy);
          if (enemy.body) enemy.body.enable = false;
          enemy.setData('built', false); enemy.setAlpha(0); enemy.setVisible(false);
        }

        // Safely spawn a drone above this ground tile
        if (Math.random() < 0.03 && x > 450 && x < this.bossArenaX - 200 && this.currentLevelNum >= 3) {
          const drone = new Enemy(this, x + 16, floorY - 180, 'drone');
          this.enemies.add(drone);
          if (drone.body) drone.body.enable = false;
          drone.setData('built', false); drone.setAlpha(0); drone.setVisible(false);
        }

        x += 32;
      }
      
      // Ensure checkpoints spawn on solid ground blocks
      if (x >= 1000 && this.checkpoints.getChildren().length === 0) {
        const cp = this.checkpoints.create(x - 64, floorY - 32, 'checkpoint_flag').setOrigin(0.5, 0.5).setTint(this.levelColor);
        cp.body.setSize(24, 32);
        cp.body.enable = false;
        cp.setData('built', false); cp.setAlpha(0); cp.setVisible(false);
      } else if (x >= 2000 && this.checkpoints.getChildren().length === 1) {
        const cp = this.checkpoints.create(x - 64, floorY - 32, 'checkpoint_flag').setOrigin(0.5, 0.5).setTint(this.levelColor);
        cp.body.setSize(24, 32);
        cp.body.enable = false;
        cp.setData('built', false); cp.setAlpha(0); cp.setVisible(false);
      }
    }

    // B. Build floating platforms, ladders, spikes, coins and checkpoints
    // Level layout details depending on the current stage
    const seedX = [300, 600, 900, 1200, 1500, 1800, 2100, 2400];
    
    seedX.forEach((sx, idx) => {
      // 1. Elevated platforms
      const platformH = floorY - 96;
      for (let i = 0; i < 3; i++) {
        const plat = this.platforms.create(sx + i * 32, platformH, 'game_tiles');
        plat.setFrame(tileIndex);
        plat.body.updateFromGameObject();
        plat.setAlpha(0);
        plat.setVisible(false);
        plat.body.enable = false;
        plat.setData('built', false);
        plat.body.checkCollision.down = false;
        plat.body.checkCollision.left = false;
        plat.body.checkCollision.right = false;

        // Spawn a coin on platform
        if (Math.random() < 0.7) {
          const coin = this.coins.create(sx + i * 32, platformH - 24, 'coin').setTint(this.levelColor);
          coin.body.enable = false;
          coin.setData('built', false); coin.setAlpha(0); coin.setVisible(false);
        }
      }

      // 2. Ladder to climb up the platforms
      for (let j = 0; j < 3; j++) {
        const ladder = this.ladders.create(sx + 32, platformH + 16 + j * 32, 'ladder');
        ladder.body.setSize(16, 32);
        ladder.body.enable = false;
        ladder.setData('built', false); ladder.setAlpha(0); ladder.setVisible(false);
      }

      // 3. Spikes under platforms or randomly placed
      if (idx % 3 === 0) {
        const spike = this.spikes.create(sx - 64, floorY - 12, 'explosion_particle').setScale(1.5).setTint(this.levelColor);
        spike.body.setSize(24, 16);
        spike.body.enable = false;
        spike.setData('built', false); spike.setAlpha(0); spike.setVisible(false);
      }

      // 4. Enemy spawns on ground / platform
      const enemyType = this.getEnemyTypeForLevel(this.currentLevelNum, idx);
      const enemy = new Enemy(this, sx + 48, floorY - 32, enemyType);
      this.enemies.add(enemy);
      if (enemy.body) enemy.body.enable = false;
      enemy.setData('built', false); enemy.setAlpha(0); enemy.setVisible(false);

      if (idx % 2 === 0 && this.currentLevelNum >= 3) {
        // Spawn flying drone above
        const drone = new Enemy(this, sx, floorY - 180, 'drone');
        this.enemies.add(drone);
        if (drone.body) drone.body.enable = false;
        drone.setData('built', false); drone.setAlpha(0); drone.setVisible(false);
      }
    });

    // C. Static End Arena wall to block scroll
    for (let y = 0; y < 450; y += 32) {
      const wall = this.platforms.create(this.mapWidth - 16, y + 16, 'game_tiles');
      wall.setFrame(tileIndex);
      wall.setVisible(false);
      wall.body.updateFromGameObject();
    }
  }

  private getEnemyTypeForLevel(level: number, index: number): string {
    const list = ['soldier'];
    if (level >= 2) list.push('turret');
    if (level >= 3) list.push('heavy');
    if (level >= 4) list.push('jetpack');
    if (level >= 5) list.push('alien');

    const selectIndex = index % list.length;
    return list[selectIndex];
  }

  private spawnLevelBoss() {
    this.isBossSpawned = true;
    sound.playSFX('hit');

    // Shake camera and flash warning
    this.cameras.main.flash(500, 255, 0, 0);
    this.cameras.main.shake(500, 0.01);

    // Spawn boss on the far right, high up so it falls to the platforms
    const bossX = this.mapWidth - 120;
    const bossY = 200; 

    this.boss = new Boss(this, bossX, bossY, this.currentLevelNum);
    
    // Add collision so the boss doesn't fall through the floor!
    this.physics.add.collider(this.boss, this.platforms);

    // If boss is a collider with bullet
    this.physics.add.overlap(this.playerBullets, this.boss, (bossSpriteObj, bulletGroupChild) => {
      const bossEntity = bossSpriteObj as Boss;
      if (!bossEntity.active || bossEntity.hp <= 0) return; // FIX: Prevent freezing on multi-hit
      const bulletSprite = bulletGroupChild as Phaser.Physics.Arcade.Sprite;
      const dmg = bulletSprite.getData('damage') || 10;
      bulletSprite.destroy();

      const isDead = bossEntity.takeDamage(dmg);
      this.game.events.emit('phaser_boss_health_changed', { hp: bossEntity.hp, maxHp: bossEntity.maxHp });

      if (isDead) {
        this.handleBossDeath();
      }
    });

    // If player overlaps boss body
    this.physics.add.overlap(this.player, this.boss, () => {
      this.player.takeDamage(20);
      this.game.events.emit('phaser_health_changed', this.player.health);
      if (this.player.health <= 0) {
        this.handlePlayerDeath();
      }
    });

    // Notify React layer
    this.game.events.emit('phaser_boss_spawned', { name: this.boss.bossName, hp: this.boss.hp, maxHp: this.boss.maxHp });
  }

  private handleBossDeath() {
    if (!this.boss) return;

    sound.stopMusic();
    sound.playSFX('win');

    // Trigger massive chain explosions
    for (let i = 0; i < 15; i++) {
      this.time.delayedCall(i * 150, () => {
        if (this.boss) {
          const rx = this.boss.x + (Math.random() * 80 - 40);
          const ry = this.boss.y + (Math.random() * 80 - 40);
          this.explosionParticles.emitParticleAt(rx, ry, 6);
          sound.playSFX('explosion');
        }
      });
    }

    this.cameras.main.shake(1500, 0.015);
    this.boss.destroy();

    // End level rewards screens after 3s
    this.time.delayedCall(3000, () => {
      this.scene.stop('HUDScene');
      
      // Calculate Stats
      const accuracy = this.player.score > 0 ? 85 : 0; // simple static/dynamic accuracy
      const kills = 12; // average
      const coins = this.player.coins;
      const score = this.player.score;
      const xp = this.currentLevelNum * 150; // XP rewarded per level

      this.game.events.emit('phaser_level_completed', {
        level: this.currentLevelNum,
        accuracy,
        enemiesDefeated: kills,
        coinsCollected: coins,
        scoreEarned: score,
        xpEarned: xp,
      });

      this.scene.start('PostLevelScene', {
        level: this.currentLevelNum,
        accuracy,
        kills,
        coins,
        score,
        xp,
      });
    });
  }

  private handlePlayerDeath() {
    this.player.lives -= 1;
    this.game.events.emit('phaser_lives_changed', this.player.lives);

    if (this.player.lives <= 0) {
      sound.stopMusic();
      sound.playSFX('gameover');
      
      this.scene.stop('HUDScene');
      this.game.events.emit('phaser_game_over', {
        score: this.player.score,
        level: this.currentLevelNum,
        kills: this.player.score / 200,
      });
      this.player.destroy();
    } else {
      // Respawn at checkpoint
      this.player.respawn(this.lastCheckpoint.x, this.lastCheckpoint.y);
    }
  }

  private firePlayerBullet(x: number, y: number, vx: number, vy: number, weaponType: string) {
    let key = 'bullet_pistol';
    let dmg = 10;

    switch (weaponType) {
      case 'MachineGun': key = 'bullet_machine'; dmg = 12; break;
      case 'SpreadShot': key = 'bullet_spread'; dmg = 14; break;
      case 'LaserRifle': key = 'bullet_laser'; dmg = 25; break;
      case 'Flamethrower': key = 'bullet_flame'; dmg = 8; break;
      case 'RocketLauncher': key = 'bullet_rocket'; dmg = 50; break;
      case 'PlasmaCannon': key = 'bullet_plasma'; dmg = 80; break;
    }

    const bullet = this.playerBullets.create(x, y, key).setTint(this.levelColor);
    bullet.body.setAllowGravity(false);
    bullet.setVelocity(vx, vy);
    bullet.setData('damage', dmg);

    // Angle the bullet sprite to its travel vector
    const angle = Math.atan2(vy, vx);
    bullet.setRotation(angle);

    // Destroy bullet if it leaves world bounds
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;

    // Special logic for flame: decays fast
    if (weaponType === 'Flamethrower') {
      this.time.delayedCall(250, () => {
        if (bullet.active) bullet.destroy();
      });
    }
  }

  private fireEnemyBullet(x: number, y: number, vx: number, vy: number) {
    const bullet = this.enemyBullets.create(x, y, 'bullet_pistol').setTint(this.levelColor);
    bullet.body.setAllowGravity(false);
    bullet.setVelocity(vx, vy);
    bullet.setTint(0xff5555); // Red tint for hostile bullets

    const angle = Math.atan2(vy, vx);
    bullet.setRotation(angle);

    // Destroy on out of bounds
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
  }

  private fireBossBullet(x: number, y: number, vx: number, vy: number, type: string) {
    let key = 'bullet_pistol';
    if (type === 'rocket') key = 'bullet_rocket';
    if (type === 'laser') key = 'bullet_laser';
    if (type === 'flame') key = 'bullet_flame';
    if (type === 'plasma') key = 'bullet_plasma';

    const bullet = this.enemyBullets.create(x, y, key).setTint(this.levelColor);
    bullet.body.setAllowGravity(false);
    bullet.setVelocity(vx, vy);
    
    // Warning tint for boss
    bullet.setTint(0xff5555);

    const angle = Math.atan2(vy, vx);
    bullet.setRotation(angle);

    // Destroy on out of bounds
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
  }

  private handleEnemyDrop(ex: number, ey: number) {
    const roll = Math.random();
    if (roll < 0.3) {
      // Drop coin
      this.coins.create(ex, ey - 10, 'coin').setTint(this.levelColor);
    } else if (roll < 0.45) {
      // Drop random gun pickup based on level progress
      const weapons = ['MachineGun', 'SpreadShot', 'LaserRifle', 'Flamethrower', 'RocketLauncher', 'PlasmaCannon'];
      const maxUnlock = Math.min(this.currentLevelNum, weapons.length);
      const selectWeapon = weapons[Math.floor(Math.random() * maxUnlock)];

      const box = this.powerups.create(ex, ey - 10, `powerup_${selectWeapon[0]}`).setTint(this.levelColor);
      box.setData('type', selectWeapon);
      box.body.setBounce(0.3);
    }
  }
}
export default GameScene;
