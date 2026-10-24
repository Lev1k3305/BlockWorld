import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameScreen, HeroType, InteractiveTarget, QuestState } from './types';
import { CharacterRig, createBabyDragon, createVoxelCharacter } from './voxelModels';
import { buildGameWorld, WorldObjects } from './WorldManager';
import { MovementInput, PlayerController } from './PlayerController';
import { DragonCompanion } from './DragonCompanion';
import { sounds } from '../services/soundEffects';
import { birthdayConfig } from '../config/birthdayConfig';
import { 
  createStylizedTerrainMaterial, 
  createStylizedWaterMaterial, 
  createStylizedGrassMaterial, 
  updateStylizedShaderTime, 
  shaderUniforms,
  StylizedTerrainOptions,
  StylizedWaterOptions
} from './stylizedShaders';

/**
 * Shared uniforms for stylized shaders across the game engine.
 * uTime is updated every frame in GameEngine.tick().
 */
export const groundShaderUniforms = shaderUniforms;

export interface StylizedGroundShaderOptions {
  baseColorHex?: number;
  roughness?: number;
  metalness?: number;
  rootColor?: THREE.Color;
  meadowColor?: THREE.Color;
  goldenColor?: THREE.Color;
  tipColor?: THREE.Color;
  cliffColor?: THREE.Color;
  windStrength?: number;
  heightMin?: number;
  heightMax?: number;
}

/**
 * Injects custom vertex and fragment shaders into a MeshStandardMaterial
 * to create an artistic, multi-stop height and slope gradient terrain appearance.
 */
export function applyStylizedGroundShaderToMaterial(
  mat: THREE.MeshStandardMaterial,
  config: {
    rootCol: THREE.Color;
    meadowCol: THREE.Color;
    goldenCol: THREE.Color;
    tipCol: THREE.Color;
    cliffCol: THREE.Color;
    windStrength: number;
    hMin: number;
    hMax: number;
  }
): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = groundShaderUniforms.uTime;
    shader.uniforms.uRootCol = { value: config.rootCol };
    shader.uniforms.uMeadowCol = { value: config.meadowCol };
    shader.uniforms.uGoldenCol = { value: config.goldenCol };
    shader.uniforms.uTipCol = { value: config.tipCol };
    shader.uniforms.uCliffCol = { value: config.cliffCol };
    shader.uniforms.uWindStrength = { value: config.windStrength };
    shader.uniforms.uHeightMin = { value: config.hMin };
    shader.uniforms.uHeightSpan = { value: Math.max(0.001, config.hMax - config.hMin) };

    shader.vertexShader = `
      uniform float uTime;
      uniform float uWindStrength;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // Subtle organic wind sway for grass surfaces based on elevation and position
      float windFactor = clamp(position.y * 0.75, 0.0, 1.0);
      float windVal = sin(position.x * 1.5 + uTime * 2.1) * cos(position.z * 1.3 + uTime * 1.7);
      transformed.x += windVal * uWindStrength * windFactor;
      transformed.z += windVal * (uWindStrength * 0.72) * windFactor;
      
      vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      `
    );

    shader.fragmentShader = `
      uniform float uTime;
      uniform vec3 uRootCol;
      uniform vec3 uMeadowCol;
      uniform vec3 uGoldenCol;
      uniform vec3 uTipCol;
      uniform vec3 uCliffCol;
      uniform float uHeightMin;
      uniform float uHeightSpan;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // 1. Artistic 4-Stop Height-Based Meadow Gradient
      float hFactor = clamp((vWorldPosition.y - uHeightMin) / uHeightSpan, 0.0, 1.0);

      vec3 grassGrad = mix(uRootCol, uMeadowCol, smoothstep(0.0, 0.35, hFactor));
      grassGrad = mix(grassGrad, uGoldenCol, smoothstep(0.35, 0.72, hFactor));
      grassGrad = mix(grassGrad, uTipCol, smoothstep(0.72, 1.0, hFactor));

      // 2. Procedural Organic Mottling (Eliminates flat monochrome surfaces into vibrant natural turf)
      float mottle1 = sin(vWorldPosition.x * 1.85) * sin(vWorldPosition.z * 1.85);
      float mottle2 = sin(vWorldPosition.x * 4.2 + 0.8) * cos(vWorldPosition.z * 4.2 + 0.4) * 0.5;
      float mottling = (mottle1 + mottle2) * 0.075;

      // 3. Slope-Aware Cliff Rock Blending
      // Surfaces pointing outward or downwards smoothly transition into weathered stylized stone
      float slope = clamp(vWorldNormal.y, 0.0, 1.0);
      vec3 combinedTerrain = mix(uCliffCol, grassGrad + mottling, smoothstep(0.35, 0.72, slope));

      // 4. Subtle Ambient Sunbeam Dapples (Soft drifting sunlight variation across the landscape)
      float dapple = sin(vWorldPosition.x * 0.28 + uTime * 0.18) * cos(vWorldPosition.z * 0.28 + uTime * 0.14);
      combinedTerrain += vec3(0.04, 0.06, 0.02) * clamp(dapple, 0.0, 1.0);

      diffuseColor.rgb = mix(diffuseColor.rgb, combinedTerrain, 0.78);
      `
    );
  };
}

/**
 * Creates a stylized ground/grass shader material extending MeshStandardMaterial.
 * Uses artistic gradient coloring (multi-stop height + slope) instead of flat colors.
 */
export function createStylizedGroundMaterial(options?: StylizedGroundShaderOptions | number): THREE.MeshStandardMaterial {
  const opts: StylizedGroundShaderOptions = typeof options === 'number' ? { baseColorHex: options } : (options || {});
  const baseColor = opts.baseColorHex ?? 0x2e8544;
  const roughness = opts.roughness ?? 0.78;
  const metalness = opts.metalness ?? 0.05;

  const rootCol = opts.rootColor ?? new THREE.Color(0.09, 0.23, 0.12);
  const meadowCol = opts.meadowColor ?? new THREE.Color(0.18, 0.54, 0.24);
  const goldenCol = opts.goldenColor ?? new THREE.Color(0.40, 0.70, 0.20);
  const tipCol = opts.tipColor ?? new THREE.Color(0.60, 0.86, 0.30);
  const cliffCol = opts.cliffColor ?? new THREE.Color(0.28, 0.33, 0.40);
  const windStrength = opts.windStrength ?? 0.035;
  const hMin = opts.heightMin ?? -0.6;
  const hMax = opts.heightMax ?? 3.6;

  const mat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: roughness,
    metalness: metalness,
    flatShading: false,
  });

  applyStylizedGroundShaderToMaterial(mat, {
    rootCol,
    meadowCol,
    goldenCol,
    tipCol,
    cliffCol,
    windStrength,
    hMin,
    hMax,
  });

  return mat;
}

export {
  createStylizedTerrainMaterial,
  createStylizedWaterMaterial,
  createStylizedGrassMaterial,
  updateStylizedShaderTime,
  shaderUniforms,
};
export type { StylizedTerrainOptions, StylizedWaterOptions };

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
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private world!: WorldObjects;
  private player!: PlayerController;
  private dragon!: DragonCompanion;
  private clock: THREE.Clock;
  private frameId: number = 0;
  private isPaused: boolean = false;
  private isDisposed: boolean = false;
  private isSoftwareGl: boolean = false;

  // Dedicated stylized materials managed by the GameEngine
  public readonly terrainMaterial: THREE.MeshStandardMaterial;
  public readonly waterMaterial: THREE.MeshStandardMaterial;

  private currentMode: 'island' | 'birthday_room' = 'island';
  private screenMode: GameScreen = 'menu';
  private heroType: HeroType;
  private questState: QuestState;
  private callbacks: GameEngineCallbacks;

  // Camera parameters for refined third-person adventure framing
  public cameraAngle: number = 0.35;
  private cameraPitch: number = 0.36; // ~20.6 deg: cinematic eye-level to slight high-angle
  private cameraDist: number = 11.0;
  private targetCameraDist: number = 11.0;
  private cameraLookTarget: THREE.Vector3 = new THREE.Vector3(0, 1.35, 0);

  // Cinematic orbit timer for menu
  private menuOrbitAngle: number = 0.5;

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
    this.clock = new THREE.Clock();

    // Initialize custom stylized shader materials for terrain and water
    this.terrainMaterial = createStylizedGroundMaterial();
    this.waterMaterial = createStylizedWaterMaterial();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Three.js Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      48,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      140
    );

    // 4. Studio Environment map for realistic PBR reflections
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }

    // 5. Initialize World & Actors
    this.initWorld(this.currentMode);

    // 6. Listeners
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibility);

    this.tick();
  }

  public setScreenMode(mode: GameScreen) {
    this.screenMode = mode;
    if (mode === 'menu' || mode === 'character_select') {
      this.targetCameraDist = 20.0;
      this.cameraPitch = 0.32;
    } else if (mode === 'playing') {
      this.targetCameraDist = 11.0;
      this.cameraPitch = 0.36;
    }
  }

  public setHeroType(hero: HeroType) {
    if (this.heroType === hero) return;
    this.heroType = hero;

    const oldPos = this.player.position.clone();
    this.scene.remove(this.player.rig.root);

    const newRig = createVoxelCharacter(hero);
    this.scene.add(newRig.root);
    this.player = new PlayerController(newRig);
    this.player.setPosition(oldPos.x, oldPos.y, oldPos.z);
  }

  public initWorld(mode: 'island' | 'birthday_room') {
    this.currentMode = mode;
    this.world = buildGameWorld(this.scene, mode);

    const rig = createVoxelCharacter(this.heroType);
    this.scene.add(rig.root);
    this.player = new PlayerController(rig);

    if (mode === 'birthday_room') {
      this.player.setPosition(0, 0.05, 4);
    } else {
      this.player.setPosition(0, 0.45, 5.2);
    }

    const dragonRig = createBabyDragon();
    this.scene.add(dragonRig.root);
    this.dragon = new DragonCompanion(dragonRig);
    if (mode === 'birthday_room') {
      this.dragon.setBirthdayMode(true);
    }

    this.updateCameraImmediate();
  }

  public switchWorld(mode: 'island' | 'birthday_room') {
    this.initWorld(mode);
  }

  public setMovementInput(forward: number, right: number, jump: boolean) {
    this.movementInput.forward = forward;
    this.movementInput.right = right;
    this.movementInput.jump = jump;
  }

  public rotateCamera(deltaX: number) {
    this.cameraAngle += deltaX;
  }

  public setCameraZoom(zoomLevel: 'normal' | 'cinematic_voice' | 'screenshot') {
    if (zoomLevel === 'cinematic_voice') {
      this.targetCameraDist = 6.0;
    } else if (zoomLevel === 'screenshot') {
      this.targetCameraDist = 9.0;
    } else {
      this.targetCameraDist = 12.0;
    }
  }

  public triggerAction() {
    if (!this.activeTarget) return;

    const t = this.activeTarget;
    if (t.type === 'crystal') {
      sounds.playCrystalCollect();
      this.dragon.celebrate();
      this.world.triggerFireworks(t.position[0], t.position[1] + 1, t.position[2]);

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
        this.world.triggerFireworks(0, 4.0, 0);
        this.world.triggerFireworks(2.5, 5.0, -2.5);
        this.world.triggerFireworks(-2.5, 5.0, 2.5);

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
      if (heartDist < 4.2) {
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
          position: [0, 1.8, 0],
          distance: heartDist,
        });
      }

      // 2. Crystals
      this.world.crystals.forEach((c, id) => {
        if (!this.questState.crystalsCollected[id]) {
          const dist = playerPos.distanceTo(c.position);
          if (dist < 3.0) {
            let name = 'Магический кристалл';
            if (id === 'crystal_parkour') name = 'Кристалл небесного паркура';
            if (id === 'crystal_cave') name = 'Кристалл скрытой пещеры';
            if (id === 'crystal_waterfall') name = 'Кристалл грота водопада';

            candidates.push({
              id,
              name,
              type: 'crystal',
              prompt: `Собрать: ${name} 💎`,
              position: [c.position.x, c.position.y, c.position.z],
              distance: dist,
            });
          }
        }
      });

      // 3. Stars
      this.world.stars.forEach((s, id) => {
        if (!this.questState.starsCollected[id]) {
          const dist = playerPos.distanceTo(s.position);
          if (dist < 2.6) {
            candidates.push({
              id,
              name: 'Праздничная звезда',
              type: 'star',
              prompt: 'Собрать звезду ⭐',
              position: [s.position.x, s.position.y, s.position.z],
              distance: dist,
            });
          }
        }
      });

      // 4. Secret Portal
      if (this.questState.heartRestored) {
        const portalDist = Math.hypot(playerPos.x - (-8.5), playerPos.z - 9.2);
        if (portalDist < 3.4) {
          candidates.push({
            id: 'secret_portal',
            name: 'Секретный праздничный портал',
            type: 'portal',
            prompt: 'Войти в праздничную комнату 🎂',
            position: [-8.5, 1.5, 9.2],
            distance: portalDist,
          });
        }
      }
    } else {
      // Birthday Room Interactions
      // 1. Dilnaz Gift
      const distSister = Math.hypot(playerPos.x - (-4.8), playerPos.z - 1.5);
      if (distSister < 3.0) {
        candidates.push({
          id: 'gift_sister',
          name: `Подарок для ${birthdayConfig.heroes.sister.name}`,
          type: 'gift_sister',
          prompt: `Открыть подарок Дильназ 🎁`,
          position: [-4.8, 1.5, 1.5],
          distance: distSister,
        });
      }

      // 2. Alizhan Gift
      const distBrother = Math.hypot(playerPos.x - 4.8, playerPos.z - 1.5);
      if (distBrother < 3.0) {
        candidates.push({
          id: 'gift_brother',
          name: `Подарок для ${birthdayConfig.heroes.brother.name}`,
          type: 'gift_brother',
          prompt: `Открыть подарок Алижана 🎁`,
          position: [4.8, 1.5, 1.5],
          distance: distBrother,
        });
      }

      // 3. Return portal
      const returnDist = Math.hypot(playerPos.x, playerPos.z - 8.5);
      if (returnDist < 3.0) {
        candidates.push({
          id: 'return_portal',
          name: 'Портал на остров',
          type: 'portal',
          prompt: 'Вернуться на остров 🏝️',
          position: [0, 1.5, 8.5],
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

  private updateCamera(delta: number) {
    if (this.screenMode === 'menu') {
      // Gentle cinematic orbit around the island in Main Menu
      this.menuOrbitAngle += delta * 0.12;
      this.cameraDist = THREE.MathUtils.damp(this.cameraDist, 18.0, 3, delta);

      this.cameraLookTarget.x = THREE.MathUtils.damp(this.cameraLookTarget.x, 0, 4, delta);
      this.cameraLookTarget.y = THREE.MathUtils.damp(this.cameraLookTarget.y, 2.2, 4, delta);
      this.cameraLookTarget.z = THREE.MathUtils.damp(this.cameraLookTarget.z, 0, 4, delta);

      const cx = Math.sin(this.menuOrbitAngle) * Math.cos(0.4) * this.cameraDist;
      const cy = Math.sin(0.4) * this.cameraDist + 1.8;
      const cz = Math.cos(this.menuOrbitAngle) * Math.cos(0.4) * this.cameraDist;

      this.camera.position.set(cx, cy, cz);
      this.camera.lookAt(this.cameraLookTarget);
      return;
    }

    // Gameplay 3rd person follow
    this.cameraDist = THREE.MathUtils.damp(this.cameraDist, this.targetCameraDist, 4, delta);

    this.cameraLookTarget.x = THREE.MathUtils.damp(
      this.cameraLookTarget.x,
      this.player.position.x,
      7,
      delta
    );
    this.cameraLookTarget.y = THREE.MathUtils.damp(
      this.cameraLookTarget.y,
      this.player.position.y + 1.3,
      7,
      delta
    );
    this.cameraLookTarget.z = THREE.MathUtils.damp(
      this.cameraLookTarget.z,
      this.player.position.z,
      7,
      delta
    );

    const cx = this.cameraLookTarget.x + Math.sin(this.cameraAngle) * Math.cos(this.cameraPitch) * this.cameraDist;
    const cy = this.cameraLookTarget.y + Math.sin(this.cameraPitch) * this.cameraDist;
    const cz = this.cameraLookTarget.z + Math.cos(this.cameraAngle) * Math.cos(this.cameraPitch) * this.cameraDist;

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.cameraLookTarget);
  }

  private updateCameraImmediate() {
    this.cameraLookTarget.set(this.player.position.x, this.player.position.y + 1.3, this.player.position.z);
    const dist = this.screenMode === 'menu' ? 18.0 : 12.0;
    const pitch = this.screenMode === 'menu' ? 0.42 : this.cameraPitch;
    const cx = this.cameraLookTarget.x + Math.sin(this.cameraAngle) * Math.cos(pitch) * dist;
    const cy = this.cameraLookTarget.y + Math.sin(pitch) * dist;
    const cz = this.cameraLookTarget.z + Math.cos(this.cameraAngle) * Math.cos(pitch) * dist;
    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.cameraLookTarget);
  }

  private handleResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private handleVisibility = () => {
    this.isPaused = document.hidden;
    if (!this.isPaused) {
      this.clock.getDelta();
    }
  };

  private tick = () => {
    if (this.isDisposed) return;

    if (!this.isPaused) {
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const totalTime = this.clock.getElapsedTime();
      
      // Update stylized terrain and water shaders with high-precision time
      updateStylizedShaderTime(totalTime);

      if (this.screenMode !== 'menu') {
        this.player.update(
          delta,
          this.movementInput,
          this.world.getGroundHeight,
          this.world.isObstacle,
          this.cameraAngle
        );

        this.dragon.update(
          delta,
          this.player.position,
          this.player.rotationY,
          !this.player.isGrounded
        );

        this.checkInteractions();
      }

      this.world.update(delta, this.questState);
      this.updateCamera(delta);
      this.renderer.render(this.scene, this.camera);
    }

    this.frameId = requestAnimationFrame(this.tick);
  };

  /**
   * Get the primary stylized terrain material managed by the engine.
   */
  public getTerrainMaterial(): THREE.MeshStandardMaterial {
    return this.terrainMaterial;
  }

  /**
   * Get the primary stylized ground material (alias for getTerrainMaterial).
   */
  public getGroundMaterial(): THREE.MeshStandardMaterial {
    return this.terrainMaterial;
  }

  /**
   * Get the primary stylized animated water material managed by the engine.
   */
  public getWaterMaterial(): THREE.MeshStandardMaterial {
    return this.waterMaterial;
  }

  /**
   * Helper to create custom stylized terrain shader material with gradient coloring and slope rock blending.
   */
  public createTerrainMaterial(options?: StylizedTerrainOptions | number): THREE.MeshStandardMaterial {
    return createStylizedGroundMaterial(options);
  }

  /**
   * Helper to create custom stylized ground shader material with artistic multi-stop gradient coloring.
   */
  public createGroundMaterial(options?: StylizedGroundShaderOptions | number): THREE.MeshStandardMaterial {
    return createStylizedGroundMaterial(options);
  }

  /**
   * Directly apply stylized gradient ground shader to any Mesh or MeshStandardMaterial.
   */
  public applyGroundShader(
    target: THREE.Mesh | THREE.MeshStandardMaterial,
    options?: StylizedGroundShaderOptions
  ): void {
    const mat = target instanceof THREE.Mesh ? (target.material as THREE.MeshStandardMaterial) : target;
    if (mat && mat.isMeshStandardMaterial) {
      const opts = options || {};
      applyStylizedGroundShaderToMaterial(mat, {
        rootCol: opts.rootColor ?? new THREE.Color(0.09, 0.23, 0.12),
        meadowCol: opts.meadowColor ?? new THREE.Color(0.18, 0.54, 0.24),
        goldenCol: opts.goldenColor ?? new THREE.Color(0.40, 0.70, 0.20),
        tipCol: opts.tipColor ?? new THREE.Color(0.60, 0.86, 0.30),
        cliffCol: opts.cliffColor ?? new THREE.Color(0.28, 0.33, 0.40),
        windStrength: opts.windStrength ?? 0.035,
        hMin: opts.heightMin ?? -0.6,
        hMax: opts.heightMax ?? 3.6,
      });
      mat.needsUpdate = true;
    }
  }

  /**
   * Helper to create custom stylized water shader material with vertex displacement wave animation and caustics.
   */
  public createWaterMaterial(options?: StylizedWaterOptions): THREE.MeshStandardMaterial {
    return createStylizedWaterMaterial(options);
  }

  public takeScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibility);

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
