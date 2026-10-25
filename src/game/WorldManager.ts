import { QuestState, InteractiveTarget } from './types';
import { PlayerController, Vector3D } from './PlayerController';
import { DragonCompanion } from './DragonCompanion';
import { TileType, drawPixelTile } from './maps';
import { drawCharacterSprite, drawDragonSprite } from './sprites';
import { birthdayConfig } from '../config/birthdayConfig';

export interface WorldObjects {
  mode: 'island' | 'birthday_room';
  crystals: Map<string, { position: Vector3D; name: string }>;
  stars: Map<string, { position: Vector3D }>;
  update: (delta: number, questState: QuestState) => void;
  render: (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    cameraX: number,
    cameraY: number,
    zoom: number,
    player: PlayerController,
    dragon: DragonCompanion,
    activeTarget: InteractiveTarget | null
  ) => void;
  getGroundHeight: (x: number, z: number) => number;
  isObstacle: (x: number, z: number) => boolean;
  triggerFireworks: (x: number, y: number, z: number) => void;
}

export interface RenderableEntity {
  sortY: number;
  draw: (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, cameraX: number, cameraY: number, zoom: number) => void;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export function buildGameWorld(_scene: any, mode: 'island' | 'birthday_room'): WorldObjects {
  const crystals = new Map<string, { position: Vector3D; name: string }>();
  const stars = new Map<string, { position: Vector3D }>();
  const particles: Particle[] = [];
  let animTime = 0;

  if (mode === 'island') {
    // 3 Main Quest Crystals
    crystals.set('crystal_parkour', { position: new Vector3D(6, 0, 8), name: 'Кристалл праздничной поляны' });
    crystals.set('crystal_cave', { position: new Vector3D(10, 0, -8), name: 'Кристалл скрытой пещеры' });
    crystals.set('crystal_waterfall', { position: new Vector3D(-9, 0, -2), name: 'Кристалл грота водопада' });

    // 5 Stars
    stars.set('star_1', { position: new Vector3D(-4, 0, 6) });
    stars.set('star_2', { position: new Vector3D(5, 0, -3) });
    stars.set('star_3', { position: new Vector3D(8, 0, 4) });
    stars.set('star_4', { position: new Vector3D(-6, 0, -6) });
    stars.set('star_5', { position: new Vector3D(11, 0, -6) });
  }

  // Environmental Obstacles (Trees, Rocks, Shrine, Walls)
  const trees: { x: number; z: number; type: 'oak' | 'sakura' | 'pine'; scale: number }[] = [
    { x: -3, z: 8, type: 'oak', scale: 1.1 },
    { x: 3, z: 9, type: 'sakura', scale: 1.2 },
    { x: -5, z: 12, type: 'pine', scale: 1.0 },
    { x: -8, z: -4, type: 'oak', scale: 1.3 },
    { x: -11, z: -6, type: 'pine', scale: 1.2 },
    { x: -10, z: -10, type: 'sakura', scale: 1.2 },
    { x: -6, z: -8, type: 'oak', scale: 1.1 },
    { x: -13, z: -2, type: 'pine', scale: 1.3 },
    { x: -5, z: -2, type: 'sakura', scale: 1.1 },
    { x: 5, z: -2, type: 'sakura', scale: 1.1 },
    { x: 5, z: 2, type: 'oak', scale: 1.0 },
    { x: 7, z: -11, type: 'pine', scale: 1.2 },
    { x: 13, z: -10, type: 'pine', scale: 1.1 },
  ];

  const rocks: { x: number; z: number; size: number }[] = [
    { x: -8, z: 2, size: 1.2 },
    { x: -11, z: 1, size: 1.5 },
    { x: 7, z: -4, size: 1.1 },
    { x: 12, z: -3, size: 1.4 },
    { x: -4, z: -11, size: 1.2 },
  ];

  const triggerFireworks = (x: number, _y: number, z: number) => {
    const colors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#4ade80'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particles.push({
        x,
        y: z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8,
      });
    }
  };

  const getGroundHeight = () => 0;

  const isObstacle = (x: number, z: number): boolean => {
    if (mode === 'birthday_room') {
      if (x < -7.2 || x > 7.2 || z < -7.2 || z > 7.2) return true;
      if (Math.hypot(x, z - (-2.2)) < 1.6) return true;
      if (Math.hypot(x - (-4.8), z - 1.5) < 1.0) return true;
      if (Math.hypot(x - 4.8, z - 1.5) < 1.0) return true;
      return false;
    }

    if (x < -14.5 || x > 14.5 || z < -13.5 || z > 13.5) return true;

    for (const t of trees) {
      if (Math.hypot(x - t.x, z - t.z) < 0.65 * t.scale) return true;
    }

    for (const r of rocks) {
      if (Math.hypot(x - r.x, z - r.z) < 0.6 * r.size) return true;
    }

    if (Math.hypot(x, z) < 1.4) return true;
    if (x < -10.5 && x > -14.0 && z > -5.0 && z < 1.0) return true;

    return false;
  };

  const update = (delta: number, _questState: QuestState) => {
    animTime += delta;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += delta;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
      }
    }
  };

  const render = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    cameraX: number,
    cameraY: number,
    zoom: number,
    player: PlayerController,
    dragon: DragonCompanion,
    _activeTarget: InteractiveTarget | null
  ) => {
    const minTileX = Math.floor(cameraX - centerX / zoom) - 2;
    const maxTileX = Math.ceil(cameraX + centerX / zoom) + 2;
    const minTileZ = Math.floor(cameraY - centerY / zoom) - 2;
    const maxTileZ = Math.ceil(cameraY + centerY / zoom) + 2;

    // 1. Draw Tile Map Base
    for (let tz = minTileZ; tz <= maxTileZ; tz++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        const sx = centerX + (tx - cameraX) * zoom;
        const sy = centerY + (tz - cameraY) * zoom;

        let tile: TileType = 'grass';

        if (mode === 'birthday_room') {
          if (tx < -7 || tx > 7 || tz < -7 || tz > 7) {
            tile = 'birthday_wall';
          } else if (Math.abs(tx) <= 3 && Math.abs(tz) <= 4) {
            tile = 'carpet';
          } else {
            tile = 'birthday_floor';
          }
        } else {
          if (tx < -14 || tx > 14 || tz < -13 || tz > 13) {
            tile = 'water';
          } else if (tx < -10 && tz > -5 && tz < 1) {
            tile = tz === -4 ? 'waterfall' : 'water';
          } else if (tx >= 5 && tx <= 13 && tz >= -12 && tz <= -4) {
            tile = 'cave_floor';
          } else if (Math.hypot(tx, tz) <= 2.8) {
            tile = 'shrine_floor';
          } else if ((Math.abs(tx) <= 1 && tz >= 0 && tz <= 10) || (tz === 0 && Math.abs(tx) <= 8)) {
            tile = 'path_stone';
          } else if ((Math.abs(tx * 3 + tz * 7) % 7) < 2) {
            tile = 'flower_grass';
          } else {
            tile = 'grass';
          }
        }

        drawPixelTile(ctx, tile, sx, sy, zoom, animTime, tx, tz);
      }
    }

    // 2. Y-Sorting Render Queue
    const queue: RenderableEntity[] = [];

    if (mode === 'island') {
      // Friendly Elder NPC
      queue.push({
        sortY: 7,
        draw: (c, cx, cy, camX, camY, z) => {
          const sx = cx + (0 - camX) * z;
          const sy = cy + (7 - camY) * z;

          // Elder Robe & Beard
          c.fillStyle = '#0f172a';
          c.fillRect(sx - z * 0.35, sy - z * 0.8, z * 0.7, z * 0.8);

          c.fillStyle = '#f59e0b';
          c.fillRect(sx - z * 0.3, sy - z * 0.75, z * 0.6, z * 0.75);

          c.fillStyle = '#fef08a';
          c.fillRect(sx - z * 0.25, sy - z * 0.9, z * 0.5, z * 0.2);

          c.fillStyle = '#ffffff';
          c.fillRect(sx - z * 0.2, sy - z * 0.55, z * 0.4, z * 0.35);

          c.font = `bold ${Math.max(10, z * 0.28)}px font-fun, sans-serif`;
          c.textAlign = 'center';
          c.fillText('Хранитель Острова', sx, sy - z * 1.05);
          c.fillStyle = '#facc15';
          c.fillText('«Нажми, чтобы поговорить»', sx, sy - z * 0.9);
        },
      });

      // Heart Shrine
      queue.push({
        sortY: 0,
        draw: (c, cx, cy, camX, camY, z) => {
          const sx = cx + (0 - camX) * z;
          const sy = cy + (0 - camY) * z;

          c.fillStyle = '#1e293b';
          c.fillRect(sx - z * 1.3, sy - z * 1.3, z * 2.6, z * 2.6);

          c.fillStyle = '#475569';
          c.fillRect(sx - z * 1.1, sy - z * 1.1, z * 2.2, z * 2.2);

          c.fillStyle = '#facc15';
          c.fillRect(sx - z * 0.9, sy - z * 0.9, z * 1.8, z * 1.8);

          const pulse = Math.sin(animTime * 4) * 0.15 + 1.0;
          const crystalSize = z * 0.6 * pulse;

          c.fillStyle = '#ec4899';
          c.beginPath();
          c.arc(sx, sy - z * 0.5, crystalSize, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#fef08a';
          c.font = `bold ${Math.max(11, z * 0.3)}px font-fun, sans-serif`;
          c.textAlign = 'center';
          c.fillText('Сердце Острова', sx, sy - z * 1.2);
        },
      });

      // Secret Portal
      queue.push({
        sortY: 8.5,
        draw: (c, cx, cy, camX, camY, z) => {
          const sx = cx + (-8.5 - camX) * z;
          const sy = cy + (8.5 - camY) * z;

          const portalGlow = Math.sin(animTime * 5) * 0.2 + 0.8;
          c.fillStyle = '#a855f7';
          c.beginPath();
          c.ellipse(sx, sy - z * 0.5, z * 0.75 * portalGlow, z * 0.95 * portalGlow, 0, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#e0e7ff';
          c.font = `bold ${Math.max(10, z * 0.28)}px font-fun, sans-serif`;
          c.textAlign = 'center';
          c.fillText('Праздничный Портал', sx, sy - z * 1.2);
        },
      });

      // Crystals
      crystals.forEach((cItem, id) => {
        queue.push({
          sortY: cItem.position.z,
          draw: (c, cx, cy, camX, camY, z) => {
            const sx = cx + (cItem.position.x - camX) * z;
            const sy = cy + (cItem.position.z - camY) * z;

            const floatY = Math.sin(animTime * 4 + cItem.position.x) * (z * 0.12);

            c.fillStyle = id === 'crystal_parkour' ? '#38bdf8' : id === 'crystal_cave' ? '#a855f7' : '#06b6d4';
            c.beginPath();
            c.moveTo(sx, sy - z * 0.65 + floatY);
            c.lineTo(sx + z * 0.28, sy - z * 0.38 + floatY);
            c.lineTo(sx, sy - z * 0.1 + floatY);
            c.lineTo(sx - z * 0.28, sy - z * 0.38 + floatY);
            c.closePath();
            c.fill();

            c.fillStyle = '#ffffff';
            c.font = `bold ${Math.max(9, z * 0.25)}px font-fun, sans-serif`;
            c.textAlign = 'center';
            c.fillText(cItem.name, sx, sy - z * 0.72 + floatY);
          },
        });
      });

      // Stars
      stars.forEach((sItem) => {
        queue.push({
          sortY: sItem.position.z,
          draw: (c, cx, cy, camX, camY, z) => {
            const sx = cx + (sItem.position.x - camX) * z;
            const sy = cy + (sItem.position.z - camY) * z;

            const spin = Math.sin(animTime * 5 + sItem.position.x) * 0.15 + 1.0;

            c.fillStyle = '#facc15';
            c.fillRect(sx - z * 0.18 * spin, sy - z * 0.45, z * 0.36 * spin, z * 0.36);
          },
        });
      });

      // Trees
      trees.forEach((t) => {
        queue.push({
          sortY: t.z,
          draw: (c, cx, cy, camX, camY, z) => {
            const sx = cx + (t.x - camX) * z;
            const sy = cy + (t.z - camY) * z;
            const s = t.scale;

            c.fillStyle = t.type === 'sakura' ? '#451a03' : '#78350f';
            c.fillRect(sx - z * 0.15 * s, sy - z * 0.8 * s, z * 0.3 * s, z * 0.8 * s);

            c.fillStyle = t.type === 'sakura' ? '#ec4899' : t.type === 'pine' ? '#14532d' : '#15803d';
            c.beginPath();
            c.arc(sx, sy - z * 1.2 * s, z * 0.7 * s, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = t.type === 'sakura' ? '#fbcfe8' : t.type === 'pine' ? '#22c55e' : '#4ade80';
            c.beginPath();
            c.arc(sx - z * 0.1 * s, sy - z * 1.35 * s, z * 0.45 * s, 0, Math.PI * 2);
            c.fill();
          },
        });
      });

      // Rocks
      rocks.forEach((r) => {
        queue.push({
          sortY: r.z,
          draw: (c, cx, cy, camX, camY, z) => {
            const sx = cx + (r.x - camX) * z;
            const sy = cy + (r.z - camY) * z;

            c.fillStyle = '#475569';
            c.fillRect(sx - z * 0.4 * r.size, sy - z * 0.4 * r.size, z * 0.8 * r.size, z * 0.5 * r.size);
            c.fillStyle = '#64748b';
            c.fillRect(sx - z * 0.3 * r.size, sy - z * 0.45 * r.size, z * 0.6 * r.size, z * 0.2 * r.size);
          },
        });
      });
    } else {
      // Birthday Room Entities
      queue.push({
        sortY: -2.2,
        draw: (c, cx, cy, camX, camY, z) => {
          const sx = cx + (0 - camX) * z;
          const sy = cy + (-2.2 - camY) * z;

          c.fillStyle = '#f43f5e';
          c.fillRect(sx - z * 1.0, sy - z * 0.6, z * 2.0, z * 0.6);

          c.fillStyle = '#fbcfe8';
          c.fillRect(sx - z * 0.7, sy - z * 1.0, z * 1.4, z * 0.4);

          for (let cd = -2; cd <= 2; cd++) {
            c.fillStyle = '#fde047';
            c.fillRect(sx + cd * z * 0.25 - z * 0.04, sy - z * 1.3, z * 0.08, z * 0.3);

            const flicker = Math.sin(animTime * 10 + cd) * 0.03;
            c.fillStyle = '#f97316';
            c.beginPath();
            c.arc(sx + cd * z * 0.25, sy - z * 1.38 + flicker, z * 0.06, 0, Math.PI * 2);
            c.fill();
          }

          c.fillStyle = '#ffffff';
          c.font = `bold ${Math.max(12, z * 0.32)}px font-fun, sans-serif`;
          c.textAlign = 'center';
          c.fillText('Праздничный Торт', sx, sy - z * 1.6);
        },
      });

      queue.push({
        sortY: 1.5,
        draw: (c, cx, cy, camX, camY, z) => {
          const sx = cx + (-4.8 - camX) * z;
          const sy = cy + (1.5 - camY) * z;

          c.fillStyle = '#ec4899';
          c.fillRect(sx - z * 0.7, sy - z * 0.6, z * 1.4, z * 0.6);

          c.fillStyle = '#ffffff';
          c.font = `bold ${Math.max(10, z * 0.28)}px font-fun, sans-serif`;
          c.textAlign = 'center';
          c.fillText(`Подарок ${birthdayConfig.heroes.sister.name}`, sx, sy - z * 0.8);
        },
      });

      queue.push({
        sortY: 1.5,
        draw: (c, cx, cy, camX, camY, z) => {
          const sx = cx + (4.8 - camX) * z;
          const sy = cy + (1.5 - camY) * z;

          c.fillStyle = '#2563eb';
          c.fillRect(sx - z * 0.7, sy - z * 0.6, z * 1.4, z * 0.6);

          c.fillStyle = '#ffffff';
          c.font = `bold ${Math.max(10, z * 0.28)}px font-fun, sans-serif`;
          c.textAlign = 'center';
          c.fillText(`Подарок ${birthdayConfig.heroes.brother.name}`, sx, sy - z * 0.8);
        },
      });
    }

    // Player Controller
    queue.push({
      sortY: player.position.z,
      draw: (c, cx, cy, camX, camY, z) => {
        const sx = cx + (player.position.x - camX) * z;
        const sy = cy + (player.position.z - camY) * z;

        drawCharacterSprite(c, sx, sy, z, {
          heroType: player.heroType,
          facing: player.facingDirection,
          animState: player.animState,
          animFrame: player.animFrame,
        });

        // Name tag
        const isSister = player.heroType === 'sister';
        const heroName = isSister ? birthdayConfig.heroes.sister.name : birthdayConfig.heroes.brother.name;
        c.fillStyle = '#ffffff';
        c.font = `bold ${Math.max(10, z * 0.28)}px font-fun, sans-serif`;
        c.textAlign = 'center';
        c.fillText(heroName, sx, sy - z * 1.4);
      },
    });

    // Dragon Companion
    queue.push({
      sortY: dragon.position.z,
      draw: (c, cx, cy, camX, camY, z) => {
        const sx = cx + (dragon.position.x - camX) * z;
        const sy = cy + (dragon.position.z - camY) * z;

        drawDragonSprite(c, sx, sy, z, dragon.isCelebrating, dragon.animFrame);
      },
    });

    // Sort queue by Y
    queue.sort((a, b) => a.sortY - b.sortY);

    // Render sorted entities
    queue.forEach((entity) => {
      entity.draw(ctx, centerX, centerY, cameraX, cameraY, zoom);
    });

    // Particles
    particles.forEach((p) => {
      const sx = centerX + (p.x - cameraX) * zoom;
      const sy = centerY + (p.y - cameraY) * zoom;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  return {
    mode,
    crystals,
    stars,
    update,
    render,
    getGroundHeight,
    isObstacle,
    triggerFireworks,
  };
}
