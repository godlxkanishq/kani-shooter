import Phaser from 'phaser';

export const generateTextures = (scene: Phaser.Scene) => {
  const { textures } = scene;

  // --- PIXEL ART UTILITY ---
  const createPixelTexture = (
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void,
    frameConfig?: { frameWidth: number; frameHeight: number }
  ) => {
    if (textures.exists(key)) return;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      drawFn(ctx);
      if (frameConfig) textures.addSpriteSheet(key, canvas as any, frameConfig);
      else textures.addCanvas(key, canvas);
    }
  };

  // 1. KANI MASCOT (32x32)
  createPixelTexture('kani_sprites', 32 * 10, 32, (ctx) => {
    for (let i = 0; i < 10; i++) {
      ctx.save(); ctx.translate(i * 32, 0);
      ctx.fillStyle = '#333333'; ctx.fillRect(8, 12, 16, 16); 
      ctx.beginPath(); ctx.moveTo(8, 12); ctx.lineTo(12, 4); ctx.lineTo(16, 12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(24, 12); ctx.lineTo(20, 4); ctx.lineTo(16, 12); ctx.fill();
      ctx.fillStyle = '#999999'; 
      ctx.beginPath(); ctx.moveTo(10, 11); ctx.lineTo(12, 7); ctx.lineTo(14, 11); ctx.fill();
      ctx.beginPath(); ctx.moveTo(22, 11); ctx.lineTo(20, 7); ctx.lineTo(18, 11); ctx.fill();
      ctx.fillStyle = '#bbbbbb'; 
      ctx.fillRect(6, 0, 20, 4); ctx.fillRect(10, -4, 12, 4);
      ctx.fillStyle = '#ffffff'; 
      ctx.fillRect(10, 16, 4, 4); ctx.fillRect(18, 16, 4, 4);
      ctx.fillStyle = '#000000'; ctx.fillRect(12, 18, 2, 2); ctx.fillRect(18, 18, 2, 2);
      ctx.fillStyle = '#333333';
      if (i % 2 === 0) { ctx.fillRect(10, 28, 4, 4); ctx.fillRect(18, 28, 4, 4); } 
      else { ctx.fillRect(12, 28, 4, 4); ctx.fillRect(16, 28, 4, 4); }
      ctx.restore();
    }
  }, { frameWidth: 32, frameHeight: 32 });

  // 2. ENEMIES (32x32)
  const enemyTypes = [
    { key: 'enemy_soldier', color: '#aaaaaa' },
    { key: 'enemy_drone', color: '#bbbbbb' },
    { key: 'enemy_turret', color: '#cccccc' },
    { key: 'enemy_heavy', color: '#dddddd' },
    { key: 'enemy_jetpack', color: '#eeeeee' },
    { key: 'enemy_alien', color: '#ffffff' }
  ];

  enemyTypes.forEach(enemy => {
    createPixelTexture(enemy.key, 32, 32, (ctx) => {
      ctx.fillStyle = enemy.color;
      // Human Head
      ctx.fillRect(12, 4, 8, 8); 
      // Human Torso
      ctx.fillRect(10, 12, 12, 10); 
      // Arms
      ctx.fillRect(6, 12, 4, 8);
      ctx.fillRect(22, 12, 4, 8);
      // Legs
      ctx.fillRect(10, 22, 4, 8);
      ctx.fillRect(18, 22, 4, 8);

      // Neon eyes
      ctx.fillStyle = '#ffffff'; 
      ctx.fillRect(12, 6, 2, 2); ctx.fillRect(18, 6, 2, 2);
      ctx.fillStyle = '#000000'; ctx.fillRect(13, 7, 1, 1); ctx.fillRect(19, 7, 1, 1);
    });
  });

  // 3. BOSSES
  const bossTypes = [
    { key: 'boss_tank', w: 128, h: 64 },
    { key: 'boss_scorpion', w: 96, h: 96 },
    { key: 'boss_train', w: 64, h: 64 },
    { key: 'boss_ice_mech', w: 96, h: 96 },
    { key: 'boss_spider', w: 96, h: 96 },
    { key: 'boss_mutant', w: 96, h: 96 },
    { key: 'boss_queen', w: 128, h: 128 },
    { key: 'boss_ai', w: 96, h: 96 }
  ];
  bossTypes.forEach(boss => {
    createPixelTexture(boss.key, boss.w * 2, boss.h, (ctx) => {
      for (let i = 0; i < 2; i++) {
        ctx.save(); ctx.translate(i * boss.w, 0);
        
        // Base animations: frame 1 (i=0) and frame 2 (i=1)
        const animOffset = i === 0 ? 0 : 4;
        
        if (boss.key === 'boss_tank') {
          // Tank (128x64)
          ctx.fillStyle = '#555555'; ctx.fillRect(10, 40, 108, 20); // Treads
          ctx.fillStyle = '#333333'; ctx.fillRect(14 + animOffset, 44, 100, 12); // Tread inner
          ctx.fillStyle = '#888888'; ctx.fillRect(20, 20, 88, 20); // Main body
          ctx.fillStyle = '#aaaaaa'; ctx.fillRect(40, 4, 48, 16); // Turret
          ctx.fillStyle = '#cccccc'; ctx.fillRect(0, 10, 40, 6); // Gun barrel
          ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 8, 8, 8); // Eye/Window
        } 
        else if (boss.key === 'boss_scorpion') {
          // Scorpion (96x96)
          ctx.fillStyle = '#777777'; 
          ctx.fillRect(32, 48 + animOffset, 48, 24); // Body
          // Tail
          ctx.fillRect(72, 24, 12, 32); 
          ctx.fillRect(48, 12, 32, 12);
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(48, 12); ctx.lineTo(32, 18); ctx.lineTo(48, 24); ctx.fill(); // Stinger
          // Legs
          ctx.fillStyle = '#555555'; 
          ctx.fillRect(40, 72 + animOffset, 4, 20); ctx.fillRect(56, 72 + animOffset, 4, 20); ctx.fillRect(72, 72 + animOffset, 4, 20);
          // Claws
          ctx.fillStyle = '#aaaaaa'; ctx.fillRect(8, 48 + animOffset, 24, 16); ctx.fillRect(16, 64 + animOffset, 16, 12);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(40, 52 + animOffset, 8, 8); // Eye
        }
        else if (boss.key === 'boss_train') {
          // Train (64x64)
          ctx.fillStyle = '#555555'; ctx.fillRect(4, 48, 56, 12); // Base
          ctx.fillStyle = '#888888'; ctx.fillRect(32, 16, 24, 32); // Cabin
          ctx.fillStyle = '#aaaaaa'; ctx.fillRect(8, 24, 24, 24); // Boiler
          ctx.fillStyle = '#cccccc'; ctx.fillRect(12, 8, 8, 16); // Smokestack
          ctx.fillStyle = '#ffffff'; ctx.fillRect(36, 24, 12, 12); // Window
          ctx.fillStyle = '#333333'; 
          ctx.beginPath(); ctx.arc(20, 54, 8, 0, Math.PI*2); ctx.fill(); // Wheel 1
          ctx.beginPath(); ctx.arc(44, 54, 8, 0, Math.PI*2); ctx.fill(); // Wheel 2
          ctx.fillStyle = '#ffffff'; 
          ctx.fillRect(18 + animOffset/2, 52, 4, 4); ctx.fillRect(42 + animOffset/2, 52, 4, 4); // Wheel spokes
        }
        else if (boss.key === 'boss_ice_mech') {
          // Mech (96x96)
          ctx.fillStyle = '#666666'; ctx.fillRect(32, 16 + animOffset, 32, 40); // Torso
          ctx.fillStyle = '#888888'; ctx.fillRect(40, 8 + animOffset, 16, 8); // Head
          ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 10 + animOffset, 8, 4); // Visor
          // Arms
          ctx.fillStyle = '#aaaaaa'; ctx.fillRect(16, 24 + animOffset, 16, 24); ctx.fillRect(64, 24 + animOffset, 16, 24);
          // Cannons
          ctx.fillStyle = '#cccccc'; ctx.fillRect(8, 40 + animOffset, 8, 24); ctx.fillRect(80, 40 + animOffset, 8, 24);
          // Legs
          ctx.fillStyle = '#555555'; ctx.fillRect(32, 56, 12, 36 - animOffset); ctx.fillRect(52, 56, 12, 36 + animOffset);
        }
        else if (boss.key === 'boss_spider') {
          // Spider (96x96)
          ctx.fillStyle = '#444444'; ctx.beginPath(); ctx.arc(48, 48 + animOffset, 24, 0, Math.PI*2); ctx.fill(); // Body
          // Legs (Left)
          ctx.fillStyle = '#777777'; 
          ctx.fillRect(8, 24 + animOffset, 24, 4); ctx.fillRect(4, 36 + animOffset, 28, 4); ctx.fillRect(8, 48 + animOffset, 24, 4); ctx.fillRect(16, 60 + animOffset, 16, 4);
          // Legs (Right)
          ctx.fillRect(64, 24 + animOffset, 24, 4); ctx.fillRect(64, 36 + animOffset, 28, 4); ctx.fillRect(64, 48 + animOffset, 24, 4); ctx.fillRect(64, 60 + animOffset, 16, 4);
          // Eyes
          ctx.fillStyle = '#ffffff'; 
          ctx.beginPath(); ctx.arc(36, 44 + animOffset, 4, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(44, 40 + animOffset, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(52, 40 + animOffset, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(60, 44 + animOffset, 4, 0, Math.PI*2); ctx.fill();
        }
        else if (boss.key === 'boss_mutant') {
          // Mutant (96x96)
          ctx.fillStyle = '#666666'; 
          ctx.beginPath(); ctx.arc(48, 48, 36 + animOffset, 0, Math.PI*2); ctx.fill(); // Blob body
          ctx.fillStyle = '#888888';
          ctx.beginPath(); ctx.arc(36, 36, 16 - animOffset, 0, Math.PI*2); ctx.fill(); // Lumps
          ctx.beginPath(); ctx.arc(64, 60, 20 + animOffset, 0, Math.PI*2); ctx.fill();
          // Tentacles
          ctx.fillStyle = '#555555'; ctx.fillRect(12, 60, 16, 8); ctx.fillRect(68, 24, 16, 8); ctx.fillRect(44, 80, 8, 16);
          // Huge Eye
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(48, 48, 12, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(48, 48, 4, 0, Math.PI*2); ctx.fill();
        }
        else if (boss.key === 'boss_queen') {
          // Queen (128x128)
          ctx.fillStyle = '#555555'; ctx.beginPath(); ctx.moveTo(64, 8 + animOffset); ctx.lineTo(112, 48 + animOffset); ctx.lineTo(64, 64 + animOffset); ctx.lineTo(16, 48 + animOffset); ctx.fill(); // Head crest
          ctx.fillStyle = '#333333'; ctx.fillRect(56, 64 + animOffset, 16, 48); // Slender body
          ctx.fillStyle = '#777777'; 
          ctx.beginPath(); ctx.moveTo(56, 72 + animOffset); ctx.lineTo(16, 64 + animOffset); ctx.lineTo(32, 96 + animOffset); ctx.fill(); // Left Scythe
          ctx.beginPath(); ctx.moveTo(72, 72 + animOffset); ctx.lineTo(112, 64 + animOffset); ctx.lineTo(96, 96 + animOffset); ctx.fill(); // Right Scythe
          // Eyes
          ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 48 + animOffset, 8, 4); ctx.fillRect(72, 48 + animOffset, 8, 4);
        }
        else if (boss.key === 'boss_ai') {
          // AI Core (96x96)
          ctx.fillStyle = '#444444'; ctx.fillRect(24, 16 + animOffset, 48, 64); // Main server pillar
          ctx.fillStyle = '#777777'; ctx.fillRect(16, 32 + animOffset, 64, 32); // Center block
          ctx.fillStyle = '#aaaaaa'; ctx.fillRect(32, 0, 32, 16 + animOffset); // Ceiling mount
          // Wires
          ctx.fillStyle = '#333333'; ctx.fillRect(36, 80 + animOffset, 4, 16); ctx.fillRect(56, 80 + animOffset, 4, 16);
          // Big Eye
          ctx.fillStyle = '#ffffff'; ctx.fillRect(40, 40 + animOffset, 16, 16);
          ctx.fillStyle = '#000000'; ctx.fillRect(44, 44 + animOffset, 8, 8);
        }
        
        ctx.restore();
      }
    }, { frameWidth: boss.w, frameHeight: boss.h });
  });

  // 4. LEVEL TILES (32x32) (Pixel Art Blocks)
  createPixelTexture('game_tiles', 32 * 8, 32, (ctx) => {
    const levelColors = [
      { base: '#251b30', inner: '#422c5e', neon: '#b678ff' }, // L1: Violet (Base)
      { base: '#2d2d00', inner: '#4a4a00', neon: '#ffff00' }, // L2: Yellow (Desert)
      { base: '#301800', inner: '#5e3200', neon: '#ff8800' }, // L3: Orange (Train/Industrial)
      { base: '#002233', inner: '#004466', neon: '#00eeff' }, // L4: Blue (Frozen)
      { base: '#002500', inner: '#004a00', neon: '#39ff14' }, // L5: Green (Spider/Cave)
      { base: '#300030', inner: '#5e005e', neon: '#ff00ff' }, // L6: Magenta (Mutant)
      { base: '#33001a', inner: '#660033', neon: '#ff0055' }, // L7: Pink/Red (Queen Hive)
      { base: '#330000', inner: '#660000', neon: '#ff0000' }  // L8: Bright Red (AI Core)
    ];

    for (let i = 0; i < 8; i++) {
      ctx.save(); ctx.translate(i * 32, 0);
      
      const c = levelColors[i];
      // Base dark block
      ctx.fillStyle = c.base; ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = c.inner; ctx.fillRect(2, 2, 28, 28);

      // Neon highlight
      ctx.fillStyle = c.neon;
      ctx.globalAlpha = 0.6;
      
      // Standard Box Design (Top glowing edge and subtle border)
      ctx.fillRect(4, 4, 24, 2); // Top strip
      
      ctx.globalAlpha = 0.3;
      ctx.fillRect(4, 26, 24, 2); // Bottom strip
      ctx.fillRect(4, 6, 2, 20); // Left strip
      ctx.fillRect(26, 6, 2, 20); // Right strip
      
      ctx.restore();
    }
  }, { frameWidth: 32, frameHeight: 32 });
  
  // 5. LADDER
  createPixelTexture('ladder', 32, 32, (ctx) => {
    ctx.fillStyle = '#666666'; ctx.fillRect(4, 0, 4, 32); ctx.fillRect(24, 0, 4, 32);
    ctx.fillStyle = '#aaaaaa'; for(let y=4; y<32; y+=8) ctx.fillRect(8, y, 16, 3);
  });

  // 6. COIN
  createPixelTexture('coin', 16, 16, (ctx) => {
    ctx.fillStyle = '#cccccc'; ctx.beginPath(); ctx.arc(8, 8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(8, 8, 4, 0, Math.PI * 2); ctx.fill();
  });

  // 7. WEAPONS AND POWERUPS
  const p_keys = ['P', 'M', 'S', 'L', 'F', 'R', 'P'];
  
  // Powerup Boxes
  p_keys.forEach((key) => {
    createPixelTexture(`powerup_${key}`, 16, 16, (ctx) => {
      ctx.fillStyle = '#555555'; ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(4, 4, 8, 8);
    });
  });

  // Bullets
  createPixelTexture('bullet_pistol', 8, 4, (ctx) => {
    ctx.fillStyle = '#cccccc'; ctx.fillRect(0, 1, 8, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(2, 1, 4, 2);
  });
  
  createPixelTexture('bullet_machine', 10, 4, (ctx) => {
    ctx.fillStyle = '#aaaaaa'; ctx.fillRect(0, 1, 10, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(4, 1, 6, 2);
  });
  
  createPixelTexture('bullet_spread', 8, 8, (ctx) => {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI*2); ctx.fill();
  });
  
  createPixelTexture('bullet_laser', 16, 2, (ctx) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 16, 2);
  });
  
  createPixelTexture('bullet_flame', 12, 12, (ctx) => {
    ctx.fillStyle = '#777777'; ctx.beginPath(); ctx.arc(6, 6, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#cccccc'; ctx.beginPath(); ctx.arc(6, 6, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI*2); ctx.fill();
  });
  
  createPixelTexture('bullet_rocket', 16, 8, (ctx) => {
    ctx.fillStyle = '#888888'; ctx.fillRect(2, 2, 10, 4); // body
    ctx.fillStyle = '#cccccc'; ctx.fillRect(10, 2, 4, 4); // warhead
    ctx.fillStyle = '#555555'; ctx.fillRect(0, 0, 4, 2); ctx.fillRect(0, 6, 4, 2); // fins
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 3, 2, 2); // engine flare
  });
  
  createPixelTexture('bullet_plasma', 12, 12, (ctx) => {
    ctx.fillStyle = '#555555'; ctx.beginPath(); ctx.arc(6, 6, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#aaaaaa'; ctx.beginPath(); ctx.arc(6, 6, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(6, 6, 2, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#cccccc'; ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI*2); ctx.stroke();
  });

  // Checkpoints
  createPixelTexture('checkpoint_flag', 32, 32, (ctx) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(6, 8, 4, 24); ctx.fillStyle = '#555555'; ctx.fillRect(10, 8, 16, 10);
  });
  createPixelTexture('checkpoint_active', 32, 32, (ctx) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(6, 8, 4, 24); ctx.fillStyle = '#ffffff'; ctx.fillRect(10, 8, 16, 10);
  });

  // Particles
  createPixelTexture('explosion_particle', 8, 8, (ctx) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(2, 2, 4, 4); });
  createPixelTexture('smoke_particle', 8, 8, (ctx) => { ctx.fillStyle = '#555555'; ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI*2); ctx.fill(); });

  // Background Grid (Smaller 32x32)
  createPixelTexture('bg_grid', 32, 32, (ctx) => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 32, 32);
  });
};
