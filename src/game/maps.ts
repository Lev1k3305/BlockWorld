/**
 * 2D Pixel Art Maps & Tile Definitions
 * Provides pixel-art tile rendering, tilemap data, and environment rendering for BlockWorld RPG.
 */

export type TileType =
  | 'grass'
  | 'flower_grass'
  | 'path_stone'
  | 'water'
  | 'water_foam'
  | 'waterfall'
  | 'cliff_edge'
  | 'cave_floor'
  | 'cave_wall'
  | 'shrine_floor'
  | 'shrine_wall'
  | 'birthday_floor'
  | 'birthday_wall'
  | 'carpet';

export interface LocationInfo {
  id: string;
  name: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export const MAP_LOCATIONS: LocationInfo[] = [
  { id: 'meadow', name: 'Праздничная поляна', bounds: { minX: -12, maxX: 12, minZ: 2, maxZ: 14 } },
  { id: 'forest', name: 'Волшебный лес', bounds: { minX: -14, maxX: -2, minZ: -12, maxZ: 2 } },
  { id: 'shrine', name: 'Сердце острова', bounds: { minX: -4, maxX: 4, minZ: -4, maxZ: 4 } },
  { id: 'cave', name: 'Скрытая пещера', bounds: { minX: 4, maxX: 14, minZ: -12, maxZ: -2 } },
  { id: 'waterfall', name: 'Грот водопада', bounds: { minX: -14, maxX: -4, minZ: -6, maxZ: 4 } },
  { id: 'birthday', name: 'Праздничная комната', bounds: { minX: -8, maxX: 8, minZ: -8, maxZ: 8 } },
];

/**
 * Draws a pixelated tile on the canvas at target (screenX, screenY, zoom)
 */
export function drawPixelTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  screenX: number,
  screenY: number,
  zoom: number,
  time: number,
  wx: number,
  wz: number
) {
  const size = zoom;

  // Render tile base
  switch (tile) {
    case 'grass': {
      // Lush 32-bit green grass with subtle tone variations
      const tone = (Math.sin(wx * 12.5 + wz * 7.2) * 0.5 + 0.5);
      ctx.fillStyle = tone > 0.6 ? '#22c55e' : tone > 0.3 ? '#16a34a' : '#15803d';
      ctx.fillRect(screenX, screenY, size, size);

      // Grass tufts / pixel blades
      ctx.fillStyle = '#4ade80';
      const bX = screenX + (Math.abs(Math.sin(wx * 3.1 + wz)) * 0.7) * size;
      const bY = screenY + (Math.abs(Math.cos(wx + wz * 2.3)) * 0.7) * size;
      ctx.fillRect(bX, bY, Math.max(2, size * 0.12), Math.max(3, size * 0.22));
      break;
    }

    case 'flower_grass': {
      // Grass base with vibrant pixel wildflowers
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(screenX, screenY, size, size);

      // Flowers
      const flowerType = Math.abs(Math.floor(Math.sin(wx * 4.3 + wz * 9.1) * 5));
      const flowerColors = ['#f43f5e', '#ec4899', '#a855f7', '#38bdf8', '#facc15'];
      ctx.fillStyle = flowerColors[flowerType % flowerColors.length];

      const fx = screenX + size * 0.35;
      const fy = screenY + size * 0.35;
      const fSize = Math.max(3, size * 0.25);
      ctx.fillRect(fx, fy, fSize, fSize);

      // Yellow flower center
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(fx + fSize * 0.25, fy + fSize * 0.25, fSize * 0.5, fSize * 0.5);
      break;
    }

    case 'path_stone': {
      // Cobblestone path
      ctx.fillStyle = '#334155';
      ctx.fillRect(screenX, screenY, size, size);

      // Cobble grid lines
      ctx.fillStyle = '#64748b';
      ctx.fillRect(screenX + 1, screenY + 1, size - 2, size - 2);

      ctx.fillStyle = '#475569';
      ctx.fillRect(screenX + size * 0.2, screenY + size * 0.2, size * 0.6, size * 0.6);
      break;
    }

    case 'water': {
      // Animated turquoise water
      const wave = Math.sin(time * 3 + wx * 1.5 + wz * 1.5) * 0.5 + 0.5;
      ctx.fillStyle = wave > 0.5 ? '#0284c7' : '#0369a1';
      ctx.fillRect(screenX, screenY, size, size);

      // Shimmer wave lines
      ctx.fillStyle = '#38bdf8';
      const waveY = screenY + ((time * 2 + wx) % 1) * size;
      ctx.fillRect(screenX + size * 0.1, waveY, size * 0.8, Math.max(2, size * 0.1));
      break;
    }

    case 'water_foam': {
      // Animated water edge foam
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#e0f2fe';
      const foamHeight = (Math.sin(time * 4 + wx * 2) * 0.2 + 0.3) * size;
      ctx.fillRect(screenX, screenY, size, foamHeight);
      break;
    }

    case 'waterfall': {
      // Animated cascading waterfall
      const flowOffset = (time * 8 + wz) % size;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(screenX + size * 0.2, screenY + flowOffset, size * 0.6, size * 0.4);
      break;
    }

    case 'cave_floor': {
      // Dark crystal cavern stone floor
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#312e81';
      ctx.fillRect(screenX + 2, screenY + 2, size - 4, size - 4);

      // Tiny crystal speckles
      if ((Math.abs(wx * 7 + wz * 13) % 5) < 1) {
        ctx.fillStyle = '#818cf8';
        ctx.fillRect(screenX + size * 0.4, screenY + size * 0.4, size * 0.2, size * 0.2);
      }
      break;
    }

    case 'cave_wall': {
      // Dark rock wall
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(screenX + 1, screenY + 1, size - 2, size - 2);

      ctx.fillStyle = '#334155';
      ctx.fillRect(screenX + 3, screenY + 3, size - 6, size - 6);
      break;
    }

    case 'shrine_floor': {
      // Ancient marble / golden shrine tiles
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(screenX + 2, screenY + 2, size - 4, size - 4);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(screenX + size * 0.3, screenY + size * 0.3, size * 0.4, size * 0.4);
      break;
    }

    case 'birthday_floor': {
      // Cozy wooden floor planks with golden polish
      ctx.fillStyle = '#78350f';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#92400e';
      ctx.fillRect(screenX + 1, screenY + 1, size - 2, size - 2);

      // Plank line
      ctx.fillStyle = '#451a03';
      ctx.fillRect(screenX, screenY + size * 0.85, size, Math.max(1, size * 0.15));
      break;
    }

    case 'birthday_wall': {
      // Festive patterned room wall
      ctx.fillStyle = '#831843';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#be185d';
      ctx.fillRect(screenX + 2, screenY + 2, size - 4, size - 4);

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(screenX + size * 0.35, screenY + size * 0.35, size * 0.3, size * 0.3);
      break;
    }

    case 'carpet': {
      // Luxurious birthday carpet
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(screenX, screenY, size, size);

      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(screenX + 2, screenY + 2, size - 4, size - 4);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(screenX + size * 0.25, screenY + size * 0.25, size * 0.5, size * 0.5);
      break;
    }

    default: {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(screenX, screenY, size, size);
      break;
    }
  }
}
