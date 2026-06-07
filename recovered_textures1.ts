import Phaser from 'phaser';

/**
 * Utility to generate 16-bit retro pixel-art assets programmatically at runtime.
 * This guarantees the game has complete, beautiful retro style images without relying on network assets.
 */
export const generateTextures = (scene: Phaser.Scene) => {
  const { textures } = scene;

  // Helper to draw a pixel grid onto a Canvas texture
  const createPixelTexture = (
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void
  ) => {
    if (textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      drawFn(ctx);
      textures.addCanvas(key, canvas);
    }
  };

  // 1. SIGGY MASCOT (32x32 per frame, sheets generated)
  // Let's draw Siggy walking, jumping, crouching, climbing.
  // Colors:
  // Cat fur: #1c1c1c (main black), #2d2d2d (highlight), #0b0b0b (shadow)
  // Inside ears / Nose / Paw pads: #ffa0a0 (cute pink)
  // Eyes: #ffffff (large white), #000000 (pupils), #5bc0be (bright highlight)
  // Safari Hat: #d4c598 (tan), #ae9e6b (shadow), #5c5031 (brown strap)
  // Ritual Forehead Symbol: #ffffff (white square grid)
  const drawSiggyFrame = (
    ctx: CanvasRenderingContext2D,
    pose: 'stand' | 'walk1' | 'walk2' | 'jump' | 'crouch' | 'climb1' | 
    ctx.beginPath();
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.arc(24, 24, 5, 0, Math.PI * 2);
    ctx.fill();

    // 7: Mainframe Core Server
    ctx.translate(32, 0);
    ctx.fillStyle = '#0f1115'; // pitch black chassis
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#222';
    ctx.fillRect(2, 2, 28, 28);
    // flashing server LEDs (red, green, blue)
    ctx.fillStyle = '#ef233c'; // red LED
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillRect(18, 6, 2, 2);
    ctx.fillStyle = '#55ff55'; // green LED
    ctx.fillRect(10, 6, 2, 2);
    ctx.fillRect(22, 6, 2, 2);
    ctx.fillStyle = '#4cc9f0'; // blue LED
    ctx.fillRect(14, 6, 2, 2);
    // motherboard grid lines
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(6, 14, 20, 1);
    ctx.fillRect(6, 20, 20, 1);
    ctx.fillRect(6, 26, 20, 1);
  });

  // 5. LADDER SPRITE (32x32)
  createPixelTexture('ladder', 32, 32, (ctx) => {
    ctx.fillStyle = '#7f5539'; // wood rails
    ctx.fillRect(4, 0, 4, 32);
    ctx.fillRect(24, 0, 4, 32);
    // rungs
    ctx.fillStyle = '#b7b7a4';
    ctx.fillRect(8, 4, 16, 3);
    ctx.fillRect(8, 12, 16, 3);
    ctx.fillRect(8, 20, 16, 3);
    ctx.fillRect(8, 28, 16, 3);
  });

  // 6. COLLECTIBLE ITEMS
  // Coins
  createPixelTexture('coin', 16, 16, (ctx) => {
    ctx.fillStyle = '#ffd166'; // gold shine
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7b267'; // gold shade
    ctx.beginPath();
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Gun Pickups boxes (M, S, L, F, R, P)