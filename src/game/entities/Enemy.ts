import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyType: string;
  public hp: number;
  private patrolMinX: number = 0;
  private patrolMaxX: number = 0;
  private direction: number = -1; // -1: left, 1: right
  private lastShot: number = 0;
  private shootDelay: number = 2000;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
    let spriteKey = 'enemy_soldier';
    if (type === 'drone') spriteKey = 'enemy_drone';
    if (type === 'turret') spriteKey = 'enemy_turret';
    if (type === 'heavy') spriteKey = 'enemy_heavy';
    if (type === 'jetpack') spriteKey = 'enemy_jetpack';
    if (type === 'alien') spriteKey = 'enemy_alien';

    super(scene, x, y, spriteKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = type;
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Type configurations
    switch (type) {
      case 'drone':
        this.hp = 15;
        if (body) body.setAllowGravity(false);
        this.shootDelay = 1800;
        break;
      case 'turret':
        this.hp = 25;
        if (body) {
          body.setAllowGravity(false);
          body.setImmovable(true);
        }
        this.shootDelay = 1500;
        break;
      case 'heavy':
        this.hp = 45;
        this.shootDelay = 2500;
        break;
      case 'jetpack':
        this.hp = 20;
        if (body) body.setAllowGravity(false);
        this.shootDelay = 1200;
        break;
      case 'alien':
        this.hp = 10;
        this.shootDelay = Infinity; // Doesn't shoot, only leaps and bites!
        break;
      case 'soldier':
      default:
        this.enemyType = 'soldier';
        this.hp = 20;
        this.shootDelay = 2200;
        break;
    }

    // Set patrol ranges around spawn
    this.patrolMinX = x - 100;
    this.patrolMaxX = x + 100;

    // Collide with platforms bounds
    this.setCollideWorldBounds(true);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.clearTint();
      }
    });

    return this.hp <= 0;
  }

  update(time: number, playerX: number, playerY: number, onShoot: (ex: number, ey: number, vx: number, vy: number) => void) {
    if (this.hp <= 0) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Movement & AI behaviors
    switch (this.enemyType) {
      case 'soldier': {
        this.setVelocityX(this.direction * 60);
        // Face moving direction
        this.setFlipX(this.direction > 0);

        // Turn around at patrol limits or walls
        if (this.x <= this.patrolMinX || body.blocked.left) {
          this.direction = 1;
        } else if (this.x >= this.patrolMaxX || body.blocked.right) {
          this.direction = -1;
        }

        // Shoot at player if within line of sight
        if (Math.abs(playerY - this.y) < 40 && Math.abs(playerX - this.x) < 250) {
          // If player is to the left, shoot left, etc.
          const isPlayerToLeft = playerX < this.x;
          if ((isPlayerToLeft && this.direction === -1) || (!isPlayerToLeft && this.direction === 1)) {
            if (time > this.lastShot + this.shootDelay) {
              this.lastShot = time;
              onShoot(this.x, this.y, this.direction * 250, 0);
            }
          }
        }
        break;
      }
      case 'drone': {
        // Patrol vertically with a small sine wave
        this.y += Math.sin(time * 0.003) * 0.4;
        this.setVelocityX(this.direction * 80);
        this.setFlipX(this.direction > 0);

        if (this.x <= this.patrolMinX || body.blocked.left) {
          this.direction = 1;
        } else if (this.x >= this.patrolMaxX || body.blocked.right) {
          this.direction = -1;
        }

        // Shoot down at player if above them
        if (Math.abs(playerX - this.x) < 50 && playerY > this.y && playerY - this.y < 200) {
          if (time > this.lastShot + this.shootDelay) {
            this.lastShot = time;
            onShoot(this.x, this.y + 10, 0, 300);
          }
        }
        break;
      }
      case 'turret': {
        // Stationary, rotate and shoot towards player
        const isPlayerToLeft = playerX < this.x;
        this.setFlipX(!isPlayerToLeft); // Face player

        const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
        if (distance < 300) {
          if (time > this.lastShot + this.shootDelay) {
            this.lastShot = time;
            // Aim vector to player
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const angle = Math.atan2(dy, dx);
            onShoot(this.x, this.y, Math.cos(angle) * 250, Math.sin(angle) * 250);
          }
        }
        break;
      }
      case 'heavy': {
        this.setVelocityX(this.direction * 40); // Slow walkers
        this.setFlipX(this.direction > 0);

        if (this.x <= this.patrolMinX || body.blocked.left) {
          this.direction = 1;
        } else if (this.x >= this.patrolMaxX || body.blocked.right) {
          this.direction = -1;
        }

        // Burst fire: 3 rapid bullets
        if (Math.abs(playerY - this.y) < 60 && Math.abs(playerX - this.x) < 300) {
          if (time > this.lastShot + this.shootDelay) {
            this.lastShot = time;
            // Spawn 3 bullets spread out slightly in time
            for (let i = 0; i < 3; i++) {
              this.scene.time.delayedCall(i * 120, () => {
                if (this.active) {
                  onShoot(this.x, this.y, this.direction * 300, 0);
                }
              });
            }
          }
        }
        break;
      }
      case 'jetpack': {
        // Move horizontal at high speed in air
        this.setVelocityX(this.direction * 120);
        this.setFlipX(this.direction > 0);

        if (this.x <= this.patrolMinX || body.blocked.left) {
          this.direction = 1;
        } else if (this.x >= this.patrolMaxX || body.blocked.right) {
          this.direction = -1;
        }

        // Fire diagonal bullets downwards towards player
        const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
        if (dist < 280 && playerY > this.y) {
          if (time > this.lastShot + this.shootDelay) {
            this.lastShot = time;
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const angle = Math.atan2(dy, dx);
            onShoot(this.x, this.y + 12, Math.cos(angle) * 280, Math.sin(angle) * 280);
          }
        }
        break;
      }
      case 'alien': {
        // Crawl fast, leap when close
        this.setVelocityX(this.direction * 100);
        this.setFlipX(this.direction > 0);

        if (this.x <= this.patrolMinX || body.blocked.left) {
          this.direction = 1;
        } else if (this.x >= this.patrolMaxX || body.blocked.right) {
          this.direction = -1;
        }

        // Leap at player if grounded and near
        const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
        if (distance < 120 && body.blocked.down && playerY <= this.y) {
          this.setVelocityY(-250);
          this.setVelocityX(playerX < this.x ? -150 : 150);
        }
        break;
      }
    }
  }
}
export default Enemy;
