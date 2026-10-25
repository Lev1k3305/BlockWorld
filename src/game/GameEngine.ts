import { GameScreen, HeroType, InteractiveTarget, QuestState } from './types';
import { PlayerController, MovementInput, Vector3D } from './PlayerController';
import { DragonCompanion } from './DragonCompanion';
import { sounds } from '../services/soundEffects';
import { birthdayConfig } from '../config/birthdayConfig';
import { buildGameWorld, WorldObjects } from './WorldManager';

export interface GameEngineCallbacks {
  onInteractionChange: (target: InteractiveTarget | null) => void;
  onNotification: (msg: string) => void;
  onQuestUpdated: (state: QuestState) => void;
  onHeartRestored: () => void;
  onPortalEnter: () => void;
  onGiftOpen: (type: 'sister' | 'brother') => void;
}

export class GameEngine {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frameId: number = 0;
  private isPaused: boolean = false;
  private isDisposed: boolean = false;
  private lastTime: number = 0;

  public player: PlayerController;
  public dragon: DragonCompanion;
  public world!: WorldObjects;

  private currentMode: 'island' | 'birthday_room' = 'island';
  private screenMode: GameScreen = 'menu';
  private heroType: HeroType;
  private questState: QuestState;
  private callbacks: GameEngineCallbacks;

  // 2D Camera parameters
  public cameraX: number = 0;
  public cameraY: number = 0;
  public zoom: number = 42; // Pixels per world tile unit
  public targetZoom: number = 42;

  // Input
  private movementInput: MovementInput = { forward: 0, right: 0, jump: false };
  private activeTarget: InteractiveTarget | null = null;

  constructor(
    container: HTMLElement,
    heroType: HeroType,
    initialQuestState: QuestState,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.heroType = heroType;
    this.questState = { ...initialQuestState };
    this.callbacks = callbacks;

    // Create 2D Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block bg-slate-950';
    this.container.appendChild(this.canvas);

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not create 2D rendering context');
    }
    this.ctx = context;

    this.player = new PlayerController(this.heroType);
    this.dragon = new DragonCompanion();

    this.handleResize();
    this.initWorld(this.currentMode);

    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibility);

    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  public setScreenMode(mode: GameScreen) {
    this.screenMode = mode;
    if (mode === 'menu' || mode === 'character_select') {
      this.targetZoom = 32;
    } else if (mode === 'playing' || mode === 'birthday_room') {
      this.targetZoom = 44;
    }
  }

  public setHeroType(hero: HeroType) {
    this.heroType = hero;
    this.player.setHeroType(hero);
  }

  public initWorld(mode: 'island' | 'birthday_room') {
    this.currentMode = mode;
    this.world = buildGameWorld(null as any, mode);

    if (mode === 'birthday_room') {
      this.player.setPosition(0, 0, 4);
    } else {
      this.player.setPosition(0, 0, 5.2);
    }
    this.dragon.setPosition(this.player.position.x + 0.8, 0, this.player.position.z + 0.8);
    this.cameraX = this.player.position.x;
    this.cameraY = this.player.position.z;
  }

  public switchWorld(mode: 'island' | 'birthday_room') {
    this.initWorld(mode);
  }

  public setMovementInput(forward: number, right: number, jump: boolean) {
    this.movementInput.forward = forward;
    this.movementInput.right = right;
    this.movementInput.jump = jump;
  }

  public rotateCamera(_deltaX: number) {
    // Top-down fixed orthographic perspective
  }

  public setCameraZoom(zoomLevel: 'normal' | 'cinematic_voice' | 'screenshot') {
    if (zoomLevel === 'cinematic_voice') {
      this.targetZoom = 56;
    } else if (zoomLevel === 'screenshot') {
      this.targetZoom = 48;
    } else {
      this.targetZoom = 44;
    }
  }

  public triggerAction() {
    if (!this.activeTarget) return;

    const t = this.activeTarget;
    if (t.type === 'crystal') {
      sounds.playCrystalCollect();
      this.dragon.celebrate();
      this.world.triggerFireworks(t.position[0], t.position[1], t.position[2]);

      const updated = {
        ...this.questState,
        crystalsCollected: {
          ...this.questState.crystalsCollected,
          [t.id]: true,
        },
      };
      this.questState = updated;
      this.callbacks.onQuestUpdated(updated);
      this.callbacks.onNotification(`✨ Собран: ${t.name}!`);

      const count = Object.values(updated.crystalsCollected).filter(Boolean).length;
      if (count === 3 && !updated.heartRestored) {
        this.callbacks.onNotification(`🌟 Все 3 кристалла найдены! Направляйтесь к Сердцу острова!`);
      }
    } else if (t.type === 'star') {
      sounds.playStarCollect();
      this.dragon.celebrate();
      const updated = {
        ...this.questState,
        starsCollected: {
          ...this.questState.starsCollected,
          [t.id]: true,
        },
      };
      this.questState = updated;
      this.callbacks.onQuestUpdated(updated);
      this.callbacks.onNotification(`⭐ Собрана праздничная звезда!`);
    } else if (t.type === 'heart') {
      const count = Object.values(this.questState.crystalsCollected).filter(Boolean).length;
      if (count >= 3 && !this.questState.heartRestored) {
        sounds.playHeartRestored();
        this.dragon.celebrate();
        this.world.triggerFireworks(0, 0, 0);
        this.world.triggerFireworks(2.5, 0, -2.5);
        this.world.triggerFireworks(-2.5, 0, 2.5);

        const updated = {
          ...this.questState,
          heartRestored: true,
          portalDiscovered: true,
        };
        this.questState = updated;
        this.callbacks.onQuestUpdated(updated);
        this.callbacks.onHeartRestored();
        this.callbacks.onNotification(`🎉 Сердце острова пробуждено! Открылся праздничный портал!`);
      } else if (!this.questState.heartRestored) {
        const remaining = 3 - count;
        this.callbacks.onNotification(`Для пробуждения требуется ещё ${remaining} ${remaining === 1 ? 'кристалл' : 'кристалла'}!`);
      }
    } else if (t.type === 'portal') {
      sounds.playPortalTeleport();
      this.callbacks.onPortalEnter();
    } else if (t.type === 'gift_sister') {
      this.callbacks.onGiftOpen('sister');
    } else if (t.type === 'gift_brother') {
      this.callbacks.onGiftOpen('brother');
    }
  }

  private checkInteractions() {
    const playerPos = this.player.position;
    const candidates: InteractiveTarget[] = [];

    if (this.currentMode === 'island') {
      // 1. Heart of the Island
      const heartDist = Math.hypot(playerPos.x, playerPos.z);
      if (heartDist < 3.8) {
        const count = Object.values(this.questState.crystalsCollected).filter(Boolean).length;
        candidates.push({
          id: 'heart_main',
          name: 'Сердце острова',
          type: 'heart',
          prompt: this.questState.heartRestored
            ? 'Сердце сияет магией ✨'
            : count >= 3
            ? 'Пробудить Сердце острова! 💖'
            : `Осмотреть Сердце (${count}/3 кристаллов)`,
          position: [0, 0, 0],
          distance: heartDist,
        });
      }

      // 2. Crystals
      this.world.crystals.forEach((c, id) => {
        if (!this.questState.crystalsCollected[id]) {
          const dist = Math.hypot(playerPos.x - c.position.x, playerPos.z - c.position.z);
          if (dist < 2.5) {
            let name = 'Магический кристалл';
            if (id === 'crystal_parkour') name = 'Кристалл праздничной поляны';
            if (id === 'crystal_cave') name = 'Кристалл скрытой пещеры';
            if (id === 'crystal_waterfall') name = 'Кристалл грота водопада';

            candidates.push({
              id,
              name,
              type: 'crystal',
              prompt: `Собрать: ${name} 💎`,
              position: [c.position.x, 0, c.position.z],
              distance: dist,
            });
          }
        }
      });

      // 3. Stars
      this.world.stars.forEach((s, id) => {
        if (!this.questState.starsCollected[id]) {
          const dist = Math.hypot(playerPos.x - s.position.x, playerPos.z - s.position.z);
          if (dist < 2.2) {
            candidates.push({
              id,
              name: 'Праздничная звезда',
              type: 'star',
              prompt: 'Собрать звезду ⭐',
              position: [s.position.x, 0, s.position.z],
              distance: dist,
            });
          }
        }
      });

      // 4. Secret Portal
      if (this.questState.heartRestored) {
        const portalDist = Math.hypot(playerPos.x - (-8.5), playerPos.z - 8.5);
        if (portalDist < 3.2) {
          candidates.push({
            id: 'secret_portal',
            name: 'Секретный праздничный портал',
            type: 'portal',
            prompt: 'Войти в праздничную комнату 🎂',
            position: [-8.5, 0, 8.5],
            distance: portalDist,
          });
        }
      }
    } else {
      // Birthday Room Interactions
      // 1. Dilnaz Gift
      const distSister = Math.hypot(playerPos.x - (-4.8), playerPos.z - 1.5);
      if (distSister < 2.8) {
        candidates.push({
          id: 'gift_sister',
          name: `Подарок для ${birthdayConfig.heroes.sister.name}`,
          type: 'gift_sister',
          prompt: `Открыть подарок Дильназ 🎁`,
          position: [-4.8, 0, 1.5],
          distance: distSister,
        });
      }

      // 2. Alizhan Gift
      const distBrother = Math.hypot(playerPos.x - 4.8, playerPos.z - 1.5);
      if (distBrother < 2.8) {
        candidates.push({
          id: 'gift_brother',
          name: `Подарок для ${birthdayConfig.heroes.brother.name}`,
          type: 'gift_brother',
          prompt: `Открыть подарок Алижана 🎁`,
          position: [4.8, 0, 1.5],
          distance: distBrother,
        });
      }

      // 3. Return portal
      const returnDist = Math.hypot(playerPos.x, playerPos.z - 8.0);
      if (returnDist < 2.8) {
        candidates.push({
          id: 'return_portal',
          name: 'Портал на остров',
          type: 'portal',
          prompt: 'Вернуться на остров 🏝️',
          position: [0, 0, 8.0],
          distance: returnDist,
        });
      }
    }

    candidates.sort((a, b) => a.distance - b.distance);
    const closest = candidates.length > 0 ? candidates[0] : null;

    if (this.activeTarget?.id !== closest?.id) {
      this.activeTarget = closest;
      this.callbacks.onInteractionChange(closest);
    }
  }

  private handleResize = () => {
    if (!this.container || !this.canvas) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
  };

  private handleVisibility = () => {
    this.isPaused = document.hidden;
    if (!this.isPaused) {
      this.lastTime = performance.now();
    }
  };

  private tick = (timestamp: number) => {
    if (this.isDisposed) return;

    const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    if (!this.isPaused) {
      // Smooth zoom lerp
      this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 6);

      if (this.screenMode !== 'menu') {
        this.player.update(
          dt,
          this.movementInput,
          this.world.isObstacle
        );

        this.dragon.update(
          dt,
          this.player.position,
          this.player.facingDirection
        );

        this.checkInteractions();

        // Smooth 2D Camera Follow
        this.cameraX += (this.player.position.x - this.cameraX) * Math.min(1, dt * 8);
        this.cameraY += (this.player.position.z - this.cameraY) * Math.min(1, dt * 8);
      } else {
        // Slow gentle orbit pan for menu
        const orbitTime = timestamp * 0.0003;
        this.cameraX = Math.cos(orbitTime) * 4.0;
        this.cameraY = Math.sin(orbitTime) * 4.0;
      }

      this.world.update(dt, this.questState);
      this.render();
    }

    this.frameId = requestAnimationFrame(this.tick);
  };

  private render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Disable smoothing for crisp pixel art rendering
    ctx.imageSmoothingEnabled = false;

    // Viewport Center Offset
    const centerX = width / 2;
    const centerY = height / 2;

    // Render World (Tiles, Entities, Particles)
    this.world.render(
      ctx,
      centerX,
      centerY,
      this.cameraX,
      this.cameraY,
      this.zoom,
      this.player,
      this.dragon,
      this.activeTarget
    );

    ctx.restore();
  }

  // Compatibility Stub Methods for Materials
  public getTerrainMaterial(): any { return {}; }
  public getGroundMaterial(): any { return {}; }
  public getWaterMaterial(): any { return {}; }
  public createTerrainMaterial(): any { return {}; }
  public createGroundMaterial(): any { return {}; }
  public applyGroundShader(): void {}
  public createWaterMaterial(): any { return {}; }

  public takeScreenshot(): string {
    return this.canvas.toDataURL('image/png');
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibility);

    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
