import Phaser from 'phaser';
import { sound } from '../sound';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private isClimbing: boolean = false;
  private lastFired: number = 0;
  private flashTimer: number = 0;
  private prevVirtualJump: boolean = false;
  
  // Game session properties linked back to state
  public weapon: string = 'Pistol';
  public health: number = 100;
  public maxHealth: number = 100;
  public lives: number = 3;
  public score: number = 0;
  public coins: number = 0;
  
  public activeCosmetics: any = { hat: 'classic_hat', outfit: 'classic_outfit', weaponSkin: 'default_skin' };
  private cosmeticGraphics: Phaser.GameObjects.Graphics;
  
  // Callback when player fires a bullet
  private onFireCallback?: (
    x: number, 
    y: number, 
    vx: number, 
    vy: number, 
    weaponType: string
  ) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'kani_sprites', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(20, 28);
      body.setOffset(6, 4);
    }

    this.cosmeticGraphics = scene.add.graphics();
    this.cosmeticGraphics.setDepth(10); // Ensure it renders over the player

    // Setup input keys
    const keyboard = scene.input.keyboard;
    if (keyboard) {
      this.keys = keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        up: Phaser.Input.Keyboard.KeyCodes.W,
        upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
        shoot: Phaser.Input.Keyboard.KeyCodes.K,
        shoot2: Phaser.Input.Keyboard.KeyCodes.F,
        shoot3: Phaser.Input.Keyboard.KeyCodes.X,
        shoot4: Phaser.Input.Keyboard.KeyCodes.ENTER,
      }) as Record<string, Phaser.Input.Keyboard.Key>;
    }

    // Create player animations if they don't exist
    const anims = scene.anims;
    if (!anims.exists('kani_walk')) {
      anims.create({
        key: 'kani_walk',
        frames: anims.generateFrameNumbers('kani_sprites', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!anims.exists('kani_climb')) {
      anims.create({
        key: 'kani_climb',
        frames: anims.generateFrameNumbers('kani_sprites', { start: 5, end: 6 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  public setWeapon(type: string) {
    this.weapon = type;
  }

  public setCosmetics(cosmetics: any) {
    if (cosmetics) {
      this.activeCosmetics = cosmetics;
    }
  }

  registerFireCallback(cb: (x: number, y: number, vx: number, vy: number, weaponType: string) => void) {
    this.onFireCallback = cb;
  }

  setClimbing(climbing: boolean) {
    this.isClimbing = climbing;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      if (climbing) {
        body.setAllowGravity(false);
        this.setVelocityY(0);
      } else {
        body.setAllowGravity(true);
      }
    }
  }

  takeDamage(amount: number) {
    if (this.flashTimer > 0) return; // Invulnerability frames

    this.health = Math.max(0, this.health - amount);
    sound.playSFX('hit');

    // Trigger hit flashing (invulnerable for 1.2s)
    this.flashTimer = 72; // frames (~1.2s at 60fps)

    // Red tint hit feedback
    this.setTint(0xff3333);
  }

  respawn(spawnX: number, spawnY: number) {
    this.health = this.maxHealth;
    this.setPosition(spawnX, spawnY);
    this.setVelocity(0, 0);
    this.setClimbing(false);
    this.clearTint();
    this.flashTimer = 90; // Invulnerable for 1.5s on spawn
  }

  update(time: number, isLadderNearby: boolean) {
    // 1. Flash timer update
    if (this.flashTimer > 0) {
      this.flashTimer--;
      this.setVisible(Math.floor(this.flashTimer / 3) % 2 === 0);
      if (this.flashTimer === 0) {
        this.setVisible(true);
        this.clearTint();
      }
    }

    // Update cosmetics position
    this.cosmeticGraphics.clear();
    if (this.visible && this.alpha > 0) {
      const hx = this.x;
      const hy = this.y - 14; // Head position offset
      const dir = this.flipX ? -1 : 1;
      
      // Draw Hats
      if (this.activeCosmetics.hat === 'ranger_cap') {
        this.cosmeticGraphics.fillStyle(0xff0000, 1);
        this.cosmeticGraphics.fillRect(hx - 6, hy - 4, 12, 4);
        this.cosmeticGraphics.fillStyle(0x000000, 1);
        this.cosmeticGraphics.fillRect(hx + (dir * 4), hy - 2, 4, 2); // badge
      } else if (this.activeCosmetics.hat === 'golden_hat') {
        this.cosmeticGraphics.fillStyle(0xffd700, 1);
        this.cosmeticGraphics.fillRect(hx - 8, hy - 6, 16, 6);
        this.cosmeticGraphics.fillRect(hx - 8, hy - 8, 4, 2);
        this.cosmeticGraphics.fillRect(hx - 2, hy - 8, 4, 2);
        this.cosmeticGraphics.fillRect(hx + 4, hy - 8, 4, 2);
      } else if (this.activeCosmetics.hat === 'tactical_helmet') {
        this.cosmeticGraphics.fillStyle(0x333333, 1);
        this.cosmeticGraphics.fillRect(hx - 7, hy - 6, 14, 10);
        this.cosmeticGraphics.fillStyle(0x39ff14, 1); // Neon green visor
        this.cosmeticGraphics.fillRect(hx + (dir * 2) - 4, hy - 2, 8, 4);
      }

      // Draw Outfits
      const oy = this.y - 2; // Chest position
      if (this.activeCosmetics.outfit === 'steel_armor') {
        this.cosmeticGraphics.fillStyle(0x888888, 1);
        this.cosmeticGraphics.fillRect(hx - 7, oy - 4, 14, 8);
        this.cosmeticGraphics.fillStyle(0xaaaaaa, 1); // Highlight
        this.cosmeticGraphics.fillRect(hx - 5, oy - 2, 10, 2);
      } else if (this.activeCosmetics.outfit === 'jungle_camo') {
        this.cosmeticGraphics.fillStyle(0x2d4c1e, 1); // Dark olive
        this.cosmeticGraphics.fillRect(hx - 8, oy - 4, 16, 10);
        this.cosmeticGraphics.fillStyle(0x4a7c29, 1); // Light camo splotches
        this.cosmeticGraphics.fillRect(hx - 4, oy - 2, 4, 4);
        this.cosmeticGraphics.fillRect(hx + 2, oy + 2, 4, 4);
      } else if (this.activeCosmetics.outfit === 'carbon_suit') {
        this.cosmeticGraphics.fillStyle(0x1a1a1a, 1); // Carbon black
        this.cosmeticGraphics.fillRect(hx - 8, oy - 5, 16, 10);
        this.cosmeticGraphics.fillStyle(0x00e5ff, 1); // Power core
        this.cosmeticGraphics.fillCircle(hx + (dir * 2), oy, 2);
      }

      // Draw Weapon Skins (overlaying the gun barrel)
      const wy = this.y + 4; // Gun barrel height
      const wx = hx + (dir * 12); // Extending outward
      if (this.activeCosmetics.weaponSkin === 'gold_skin') {
        this.cosmeticGraphics.fillStyle(0xffd700, 1);
        this.cosmeticGraphics.fillRect(dir > 0 ? wx - 4 : wx, wy - 1, 4, 2);
      } else if (this.activeCosmetics.weaponSkin === 'neon_skin') {
        this.cosmeticGraphics.fillStyle(0x39ff14, 1);
        this.cosmeticGraphics.fillRect(dir > 0 ? wx - 4 : wx, wy - 1, 4, 2);
      }
    }

    const keys = this.keys;
    if (!keys) return;

    const reg = this.scene.registry;
    const v_left = reg.get('v_left') || false;
    const v_right = reg.get('v_right') || false;
    const v_up = reg.get('v_up') || false;
    const v_down = reg.get('v_down') || false;
    const v_jump = reg.get('v_jump') || false;
    const v_shoot = reg.get('v_shoot') || false;

    let virtualJustJumped = false;
    if (v_jump && !this.prevVirtualJump) {
      virtualJustJumped = true;
    }
    this.prevVirtualJump = v_jump;

    const moveLeft = keys.left.isDown || keys.leftArrow.isDown || v_left;
    const moveRight = keys.right.isDown || keys.rightArrow.isDown || v_right;
    const holdUp = keys.up.isDown || keys.upArrow.isDown || v_up;
    const holdDown = keys.down.isDown || keys.downArrow.isDown || v_down;
    const pressJump = Phaser.Input.Keyboard.JustDown(keys.jump) || virtualJustJumped;
    const mouseShoot = this.scene.input.activePointer.leftButtonDown();
    const holdShoot = keys.shoot.isDown || keys.shoot2.isDown || keys.shoot3.isDown || keys.shoot4.isDown || v_shoot || mouseShoot;
    if (isLadderNearby) {
      if (holdUp) {
        this.setClimbing(true);
        this.setVelocityY(-140);
        this.play('kani_climb', true);
      } else if (holdDown) {
        this.setClimbing(true);
        this.setVelocityY(140);
        this.play('kani_climb', true);
      } else if (this.isClimbing) {
        this.setVelocityY(0);
        this.stop(); // Pause animation frame
      }
    } else {
      this.setClimbing(false);
    }

    // B. Horizontal Movement (Standard & Climbing)
    if (this.isClimbing) {
      // Small lateral movements on ladder
      if (moveLeft) {
        this.setVelocityX(-70);
        this.setFlipX(true);
      } else if (moveRight) {
        this.setVelocityX(70);
        this.setFlipX(false);
      } else {
        this.setVelocityX(0);
      }

      // Jump off ladder
      if (pressJump) {
        this.setClimbing(false);
        this.setVelocityY(-300);
        sound.playSFX('jump');
      }
    } else {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body) {
        // Ground/Air movement
        const speed = holdDown && body.blocked.down ? 100 : 200; // Slower walking while crouching
        
        if (moveLeft) {
          this.setVelocityX(-speed);
          this.setFlipX(true);
          if (body.blocked.down) {
            this.play('kani_walk', true);
          }
        } else if (moveRight) {
          this.setVelocityX(speed);
          this.setFlipX(false);
          if (body.blocked.down) {
            this.play('kani_walk', true);
          }
        } else {
          this.setVelocityX(0);
          if (body.blocked.down) {
            this.stop();
            this.setFrame(0); // standing pose
          }
        }

        // C. Crouch & Jumps
        if (holdDown && body.blocked.down) {
          this.setFrame(4); // crouch pose
          body.setSize(20, 18);
          body.setOffset(6, 14);
        } else {
          body.setSize(20, 28);
          body.setOffset(6, 4);

          if (pressJump && body.blocked.down) {
            this.setVelocityY(-350);
            this.setFrame(3); // jump frame
            sound.playSFX('jump');
          }

          if (!body.blocked.down) {
            this.setFrame(3); // Keep jump frame in air
          }
        }
      }
    }

    // D. Aiming Modifiers
    if (!this.isClimbing) {
      if (holdUp) {
        if (moveLeft || moveRight) {
          this.setFrame(8); // Aim diagonal
        } else {
          this.setFrame(7); // Aim up
        }
      }
    }

    // Override flip direction to always face the mouse pointer
    const pointer = this.scene.input.activePointer;
    if (pointer.active || (pointer.x > 0 && pointer.y > 0)) {
      this.setFlipX(pointer.worldX < this.x);
    }

    // E. Shooting Controller
    if (holdShoot) {
      this.fireWeapon(time, pointer);
    }
  }

  private fireWeapon(time: number, pointer: Phaser.Input.Pointer) {
    let delay = 350; // standard pistol delay
    let soundType: 'shoot_pistol' | 'shoot_machine' | 'shoot_spread' | 'shoot_laser' | 'shoot_flame' | 'shoot_rocket' | 'shoot_plasma' = 'shoot_pistol';

    if (this.weapon === 'MachineGun') { delay = 120; soundType = 'shoot_machine'; }
    if (this.weapon === 'SpreadShot') { delay = 300; soundType = 'shoot_spread'; }
    if (this.weapon === 'LaserRifle') { delay = 500; soundType = 'shoot_laser'; }
    if (this.weapon === 'Flamethrower') { delay = 80; soundType = 'shoot_flame'; }
    if (this.weapon === 'RocketLauncher') { delay = 600; soundType = 'shoot_rocket'; }
    if (this.weapon === 'PlasmaCannon') { delay = 800; soundType = 'shoot_plasma'; }

    if (time < this.lastFired + delay) return;
    this.lastFired = time;

    // Bullet Velocity calculation based on mouse pointer angle
    const spawnX = this.x + (this.flipX ? -16 : 16);
    const body = this.body as Phaser.Physics.Arcade.Body;
    let spawnY = this.y - 4; // chest height
    
    if (body && this.keys.down.isDown && body.blocked.down) {
      spawnY = this.y + 6; // crouch height
    }

    const angle = Phaser.Math.Angle.Between(spawnX, spawnY, pointer.worldX, pointer.worldY);
    let vx = Math.cos(angle) * 400;
    let vy = Math.sin(angle) * 400;

    // (Legacy aiming overrides removed in favor of 360 degree mouse aim)

    // Custom firing logic for SpreadShot, Plasma, Laser, etc.
    if (this.onFireCallback) {
      sound.playSFX(soundType);
      
      if (this.weapon === 'SpreadShot') {
        // Fire 3 bullets spreading at angles (-15, 0, 15 degrees)
        // 0 degrees
        this.onFireCallback(spawnX, spawnY, vx, vy, 'SpreadShot');
        // Spread Up
        const vxUp = vx * Math.cos(0.26) - vy * Math.sin(0.26);
        const vyUp = vx * Math.sin(0.26) + vy * Math.cos(0.26);
        this.onFireCallback(spawnX, spawnY, vxUp, vyUp, 'SpreadShot');
        // Spread Down
        const vxDn = vx * Math.cos(-0.26) - vy * Math.sin(-0.26);
        const vyDn = vx * Math.sin(-0.26) + vy * Math.cos(-0.26);
        this.onFireCallback(spawnX, spawnY, vxDn, vyDn, 'SpreadShot');
      } else {
        this.onFireCallback(spawnX, spawnY, vx, vy, this.weapon);
      }
    }
  }

  destroy(fromScene?: boolean) {
    if (this.cosmeticGraphics) this.cosmeticGraphics.destroy();
    super.destroy(fromScene);
  }
}
export default Player;
