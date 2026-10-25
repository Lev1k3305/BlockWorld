import { HeroType } from './types';
import { Direction, AnimationState } from './PlayerController';

/**
 * Premium 32-bit Pixel Art Sprite Generator & Renderer
 * Handcrafted detailed pixel-grid sprite graphics for Алижан, Дильназ, and Dragon Companion.
 */

export interface CharacterSpriteConfig {
  heroType: HeroType;
  facing: Direction;
  animState: AnimationState;
  animFrame: number;
}

/**
 * Renders a detailed 16x24 pixel art matrix scaled to target canvas size
 */
function renderPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: (string | null)[][],
  startX: number,
  startY: number,
  pixelSize: number
) {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      const color = matrix[r][c];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

export function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  tileSize: number,
  config: CharacterSpriteConfig
) {
  const { heroType, facing, animState, animFrame } = config;
  const isSister = heroType === 'sister';

  // Palette definitions
  const C_OUTLINE = '#0f172a';
  const C_SKIN = '#fde047';
  const C_SKIN_SHADOW = '#eab308';

  // Hero Colors
  const C_HAIR = isSister ? '#f43f5e' : '#3b82f6';
  const C_HAIR_HIGHLIGHT = isSister ? '#fb7185' : '#60a5fa';
  const C_OUTFIT_MAIN = isSister ? '#ec4899' : '#2563eb';
  const C_OUTFIT_DARK = isSister ? '#be185d' : '#1d4ed8';
  const C_OUTFIT_ACCENT = isSister ? '#a855f7' : '#f59e0b';
  const C_BOOTS = isSister ? '#831843' : '#1e293b';
  const C_GOLD = '#facc15';

  const pixelSize = Math.max(1.5, Math.floor(tileSize / 16));
  const spriteW = 12 * pixelSize;
  const spriteH = 18 * pixelSize;

  const startX = Math.floor(screenX - spriteW / 2);
  const startY = Math.floor(screenY - spriteH);

  // Animation offsets
  const walkOffset = animState === 'walk' ? (animFrame % 2 === 0 ? 1 : -1) : 0;
  const celebrateOffset = animState === 'celebrate' ? -Math.abs(Math.sin(animFrame * Math.PI * 0.5)) * 4 : 0;

  ctx.save();

  // Ground Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
  ctx.beginPath();
  ctx.ellipse(screenX, screenY - 2, spriteW * 0.5, pixelSize * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Handcrafted 12x18 Detailed 32-bit Pixel Matrix
  const K = C_OUTLINE;
  const S = C_SKIN;
  const H = C_HAIR;
  const L = C_HAIR_HIGHLIGHT;
  const M = C_OUTFIT_MAIN;
  const D = C_OUTFIT_DARK;
  const A = C_OUTFIT_ACCENT;
  const B = C_BOOTS;
  const G = C_GOLD;
  const _ = null;

  let matrix: (string | null)[][] = [];

  if (facing === 'down') {
    matrix = [
      [_, _, K, K, K, K, K, K, K, K, _, _],
      [_, K, H, H, L, L, H, H, L, L, K, _],
      [K, H, H, L, L, H, H, L, L, H, H, K],
      [K, H, S, S, S, S, S, S, S, S, H, K],
      [K, S, K, K, S, S, S, S, K, K, S, K],
      [K, S, S, S, S, S, S, S, S, S, S, K],
      [_, K, S, S, S, G, G, S, S, S, K, _],
      [_, _, K, K, K, K, K, K, K, K, _, _],
      [_, K, M, M, A, A, A, A, M, M, K, _],
      [K, M, M, M, A, G, G, A, M, M, M, K],
      [K, D, M, M, M, A, A, M, M, M, D, K],
      [K, D, M, M, M, M, M, M, M, M, D, K],
      [_, K, D, D, G, G, G, G, D, D, K, _],
      [_, K, D, D, K, K, K, K, D, D, K, _],
      [_, K, B, B, K, _, _, K, B, B, K, _],
      [_, K, B, B, K, _, _, K, B, B, K, _],
      [_, K, B, B, K, _, _, K, B, B, K, _],
      [_, _, K, K, _, _, _, _, K, K, _, _],
    ];
  } else if (facing === 'up') {
    matrix = [
      [_, _, K, K, K, K, K, K, K, K, _, _],
      [_, K, H, H, L, L, H, H, L, L, K, _],
      [K, H, H, H, L, L, H, H, L, L, H, K],
      [K, H, H, H, H, H, H, H, H, H, H, K],
      [K, H, H, H, H, H, H, H, H, H, H, K],
      [K, H, H, H, H, H, H, H, H, H, H, K],
      [_, K, H, H, H, H, H, H, H, H, K, _],
      [_, _, K, K, K, K, K, K, K, K, _, _],
      [_, K, M, M, M, M, M, M, M, M, K, _],
      [K, M, M, D, D, D, D, D, D, M, M, K],
      [K, D, M, D, D, D, D, D, D, M, D, K],
      [K, D, M, M, M, M, M, M, M, M, D, K],
      [_, K, D, D, G, G, G, G, D, D, K, _],
      [_, K, D, D, K, K, K, K, D, D, K, _],
      [_, K, B, B, K, _, _, K, B, B, K, _],
      [_, K, B, B, K, _, _, K, B, B, K, _],
      [_, K, B, B, K, _, _, K, B, B, K, _],
      [_, _, K, K, _, _, _, _, K, K, _, _],
    ];
  } else {
    // Left / Right
    matrix = [
      [_, _, K, K, K, K, K, K, _, _, _, _],
      [_, K, H, H, L, L, H, H, K, _, _, _],
      [K, H, H, L, L, S, S, S, K, _, _, _],
      [K, H, S, S, S, K, S, S, K, _, _, _],
      [K, S, S, S, S, S, S, S, K, _, _, _],
      [_, K, S, S, S, S, S, K, _, _, _, _],
      [_, _, K, K, K, K, K, _, _, _, _, _],
      [_, K, M, M, A, A, M, K, _, _, _, _],
      [K, M, M, A, G, G, A, M, K, _, _, _],
      [K, D, M, M, A, A, M, M, K, _, _, _],
      [K, D, M, M, M, M, M, M, K, _, _, _],
      [_, K, D, D, G, G, D, D, K, _, _, _],
      [_, K, D, D, K, K, D, D, K, _, _, _],
      [_, K, B, B, K, K, B, B, K, _, _, _],
      [_, K, B, B, K, K, B, B, K, _, _, _],
      [_, K, B, B, K, K, B, B, K, _, _, _],
      [_, _, K, K, _, _, K, K, _, _, _, _],
      [_, _, _, _, _, _, _, _, _, _, _, _],
    ];
  }

  ctx.translate(0, celebrateOffset);
  if (facing === 'left') {
    ctx.scale(-1, 1);
    renderPixelMatrix(ctx, matrix, -startX - spriteW, startY + walkOffset * pixelSize, pixelSize);
  } else {
    renderPixelMatrix(ctx, matrix, startX, startY + walkOffset * pixelSize, pixelSize);
  }

  ctx.restore();
}

export function drawDragonSprite(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  tileSize: number,
  isCelebrating: boolean,
  animFrame: number
) {
  const pixelSize = Math.max(1.5, Math.floor(tileSize / 16));
  const spriteW = 10 * pixelSize;
  const spriteH = 10 * pixelSize;

  const floatY = Math.sin(animFrame * Math.PI * 0.5) * (pixelSize * 2);
  const startX = Math.floor(screenX - spriteW / 2);
  const startY = Math.floor(screenY - spriteH + floatY);

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
  ctx.beginPath();
  ctx.ellipse(screenX, screenY - 2, spriteW * 0.4, pixelSize * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  const K = '#0f172a';
  const D = isCelebrating ? '#facc15' : '#38bdf8';
  const L = isCelebrating ? '#fef08a' : '#93c5fd';
  const W = '#ffffff';
  const _ = null;

  const dragonMatrix = [
    [_, _, K, K, K, K, _, _, _, _],
    [_, K, D, D, D, D, K, _, _, _],
    [K, D, W, K, D, D, L, K, _, _],
    [K, D, K, K, D, D, L, K, _, _],
    [K, D, D, D, D, L, L, K, _, _],
    [_, K, W, W, K, D, D, K, _, _],
    [K, W, D, D, W, K, K, _, _, _],
    [K, W, D, D, D, K, _, _, _, _],
    [_, K, K, D, D, K, _, _, _, _],
    [_, _, _, K, K, _, _, _, _, _],
  ];

  renderPixelMatrix(ctx, dragonMatrix, startX, startY, pixelSize);

  ctx.restore();
}
