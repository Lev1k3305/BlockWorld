import * as THREE from 'three';
import { 
  createCollectableCrystal, 
  createCollectableStar, 
  createHeartOfTheIsland, 
  createSecretPortal,
  createVoxelBirthdayCake 
} from './voxelModels';
import { 
  createStylizedTerrainMaterial,
  createStylizedGrassMaterial, 
  createStylizedWaterMaterial, 
  updateStylizedShaderTime 
} from './stylizedShaders';
import { QuestState } from './types';

export interface WorldObjects {
  scene: THREE.Scene;
  heart: ReturnType<typeof createHeartOfTheIsland>;
  portal: ReturnType<typeof createSecretPortal>;
  crystals: Map<string, { group: THREE.Group; update: (dt: number) => void; position: THREE.Vector3 }>;
  stars: Map<string, { group: THREE.Group; update: (dt: number) => void; position: THREE.Vector3 }>;
  birthdayCake?: ReturnType<typeof createVoxelBirthdayCake>;
  sisterPedestal?: THREE.Group;
  brotherPedestal?: THREE.Group;
  update: (delta: number, questState: QuestState) => void;
  getGroundHeight: (x: number, z: number) => number;
  isObstacle: (x: number, z: number) => boolean;
  triggerFireworks: (x: number, y: number, z: number) => void;
}

export function buildGameWorld(scene: THREE.Scene, mode: 'island' | 'birthday_room'): WorldObjects {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  if (mode === 'birthday_room') {
    return buildBirthdayRoom(scene);
  } else {
    return buildFloatingIsland(scene);
  }
}

/**
 * 3 Distinct Stylized Handcrafted Tree Species
 */

// 1. Grand Ancient Oak: Sculpted twisting trunk with roots, branches, and lush layered rounded foliage
function createStylizedOakTree(scale = 1.0): THREE.Group {
  const tree = new THREE.Group();
  tree.scale.setScalar(scale);

  const barkMat = new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.85 });
  const leafDark = createStylizedGrassMaterial(0x1b4320);
  const leafMid = createStylizedGrassMaterial(0x2d6a36);
  const leafLight = createStylizedGrassMaterial(0x438a4e);

  // Roots spreading into ground
  const rootGeo = new THREE.CylinderGeometry(0.35, 0.65, 0.6, 6);
  const root1 = new THREE.Mesh(rootGeo, barkMat);
  root1.position.set(0.3, 0.25, 0.2);
  root1.rotation.z = -0.3;
  const root2 = new THREE.Mesh(rootGeo, barkMat);
  root2.position.set(-0.35, 0.25, -0.15);
  root2.rotation.z = 0.35;
  tree.add(root1, root2);

  // Main Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.45, 0.6, 3.2, 8);
  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  tree.add(trunk);

  // Branches
  const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.4, 6), barkMat);
  branch1.position.set(0.4, 2.4, 0.3);
  branch1.rotation.set(0.3, 0, -0.6);
  branch1.castShadow = true;
  tree.add(branch1);

  const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.2, 6), barkMat);
  branch2.position.set(-0.35, 2.5, -0.25);
  branch2.rotation.set(-0.25, 0, 0.55);
  branch2.castShadow = true;
  tree.add(branch2);

  // Layered Rounded Foliage Clusters
  const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), leafDark);
  canopy1.position.set(0, 3.4, 0);
  canopy1.castShadow = true;

  const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 0), leafMid);
  canopy2.position.set(0.65, 3.3, 0.5);
  canopy2.castShadow = true;

  const canopy3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), leafMid);
  canopy3.position.set(-0.6, 3.4, -0.4);
  canopy3.castShadow = true;

  const canopyTop = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), leafLight);
  canopyTop.position.set(0.05, 4.3, 0.05);
  canopyTop.castShadow = true;

  tree.add(canopy1, canopy2, canopy3, canopyTop);

  return tree;
}

// 2. Weeping Fairy Sakura: Slender curved trunk with cascading blossom clouds and hanging lantern
function createStylizedSakuraTree(scale = 1.0): THREE.Group {
  const tree = new THREE.Group();
  tree.scale.setScalar(scale);

  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x361b0d, roughness: 0.85 });
  const sakuraDeep = new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.6 });
  const sakuraMid = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.55 });
  const sakuraLight = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 });

  const trunkLower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.55, 2.0, 7), darkWoodMat);
  trunkLower.position.set(0, 1.0, 0);
  trunkLower.castShadow = true;
  tree.add(trunkLower);

  const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.8, 7), darkWoodMat);
  trunkUpper.position.set(0.25, 2.5, 0.15);
  trunkUpper.rotation.z = -0.22;
  trunkUpper.castShadow = true;
  tree.add(trunkUpper);

  // Soft Layered Blossom Clouds
  const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), sakuraDeep);
  c1.position.set(0.3, 3.3, 0.2);
  c1.castShadow = true;

  const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), sakuraMid);
  c2.position.set(-0.6, 3.1, -0.3);
  c2.castShadow = true;

  const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), sakuraMid);
  c3.position.set(0.8, 3.2, 0.6);
  c3.castShadow = true;

  const cTop = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), sakuraLight);
  cTop.position.set(0.15, 4.2, 0.1);
  cTop.castShadow = true;

  tree.add(c1, c2, c3, cTop);

  // Hanging paper lantern with warm amber radiance
  const lantern = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({ 
      color: 0xfef08a, 
      emissive: 0xf59e0b, 
      emissiveIntensity: 1.0,
      roughness: 0.2 
    })
  );
  lantern.position.set(0.9, 2.1, 0.7);
  tree.add(lantern);

  const light = new THREE.PointLight(0xfef08a, 0.9, 6);
  light.position.set(0.9, 2.0, 0.7);
  tree.add(light);

  return tree;
}

// 3. Stylized Alpine Pine: Slender trunk with layered pagoda/conical foliage skirts
function createStylizedPineTree(scale = 1.0): THREE.Group {
  const tree = new THREE.Group();
  tree.scale.setScalar(scale);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2110, roughness: 0.9 });
  const pineDark = createStylizedGrassMaterial(0x0f3d1e);
  const pineMid = createStylizedGrassMaterial(0x165b2d);
  const pineLight = createStylizedGrassMaterial(0x22783e);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 4.0, 7), woodMat);
  trunk.position.y = 2.0;
  trunk.castShadow = true;
  tree.add(trunk);

  // Tier 1
  const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.1, 7), pineDark);
  tier1.position.y = 2.4;
  tier1.castShadow = true;
  tree.add(tier1);

  // Tier 2
  const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.1, 7), pineMid);
  tier2.position.y = 3.2;
  tier2.castShadow = true;
  tree.add(tier2);

  // Tier 3
  const tier3 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.0, 7), pineMid);
  tier3.position.y = 4.0;
  tier3.castShadow = true;
  tree.add(tier3);

  // Tier 4
  const tier4 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.9, 7), pineLight);
  tier4.position.y = 4.7;
  tier4.castShadow = true;
  tree.add(tier4);

  return tree;
}

// Stylized Faceted Rock / Boulder
function createFacetedBoulder(sizeX = 1.2, sizeY = 0.9, sizeZ = 1.2, color = 0x475569): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(sizeX * 0.65, 0);
  geo.scale(1.0, sizeY / sizeX, sizeZ / sizeX);
  const mat = new THREE.MeshStandardMaterial({ 
    color, 
    roughness: 0.85, 
    metalness: 0.15,
    flatShading: true 
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds the Floating Island adventure world with procedural terrain, stylized grass,
 * stylized mobile water shaders, and enhanced vegetation system.
 */
function buildFloatingIsland(scene: THREE.Scene): WorldObjects {
  // 1. Atmosphere, Sky & Horizon Lighting
  scene.fog = new THREE.FogExp2(0x0c1529, 0.014);
  scene.background = new THREE.Color(0x091122);

  // Ambient sky-blue & warm ground bounce
  const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 1.25);
  scene.add(hemiLight);

  // Warm golden directional sunlight
  const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.75);
  sunLight.position.set(20, 32, 18);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 85;
  sunLight.shadow.camera.left = -26;
  sunLight.shadow.camera.right = 26;
  sunLight.shadow.camera.top = 26;
  sunLight.shadow.camera.bottom = -26;
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);

  const islandGroup = new THREE.Group();
  scene.add(islandGroup);

  // Stylized Shader Materials (Eliminating flat green and flat blue surfaces!)
  const stylizedGrassMain = createStylizedTerrainMaterial({ baseColorHex: 0x3b854e, roughness: 0.75 });
  const stylizedGrassHigh = createStylizedTerrainMaterial({ baseColorHex: 0x4a9b5f, roughness: 0.72 });
  const stylizedGrassMound = createStylizedTerrainMaterial({ baseColorHex: 0x327542, roughness: 0.78 });
  const stylizedWater = createStylizedWaterMaterial();

  const dirtMat = new THREE.MeshStandardMaterial({ color: 0x663914, roughness: 0.9 });
  const cliffStoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, metalness: 0.15 });
  const mossyStoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.15 });
  const cobbleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8, metalness: 0.2 });

  // 2. Sculpted Floating Island Landmass with Procedural Terraced Hills
  const islandRadius = 19.5;
  const segments = 32;

  // Main Surface Layer
  const topGrass = new THREE.Mesh(
    new THREE.CylinderGeometry(islandRadius, islandRadius - 0.5, 0.8, segments),
    stylizedGrassMain
  );
  topGrass.position.y = -0.4;
  topGrass.receiveShadow = true;
  islandGroup.add(topGrass);

  // Sub-surface soil stratum
  const dirtStratum = new THREE.Mesh(
    new THREE.CylinderGeometry(islandRadius - 0.5, islandRadius - 1.5, 1.6, segments),
    dirtMat
  );
  dirtStratum.position.y = -1.5;
  dirtStratum.receiveShadow = true;
  islandGroup.add(dirtStratum);

  // Under-island inverted sculpted rocky cone
  const stoneUnder = new THREE.Mesh(
    new THREE.ConeGeometry(islandRadius - 1.5, 13, segments),
    cliffStoneMat
  );
  stoneUnder.rotateX(Math.PI);
  stoneUnder.position.y = -8.0;
  islandGroup.add(stoneUnder);

  // Hanging rock stalactites beneath island
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + 0.3;
    const r = 4.5 + Math.random() * 8.5;
    const stalactite = new THREE.Mesh(
      new THREE.ConeGeometry(1.2 + Math.random() * 0.6, 5.5 + Math.random() * 4, 6),
      mossyStoneMat
    );
    stalactite.rotateX(Math.PI);
    stalactite.position.set(Math.cos(angle) * r, -8.5 - Math.random() * 4, Math.sin(angle) * r);
    islandGroup.add(stalactite);
  }

  // 3. Procedural Hills across the Island (Natural undulating mounds)
  const hillPositions = [
    { x: -3.0, z: -11.0, rx: 3.2, rz: 2.8, h: 0.65 },
    { x: 4.5, z: 4.8, rx: 2.6, rz: 3.0, h: 0.55 },
    { x: -8.0, z: 5.5, rx: 3.0, rz: 2.5, h: 0.6 },
    { x: 7.5, z: -2.5, rx: 2.8, rz: 2.8, h: 0.5 },
  ];

  hillPositions.forEach(h => {
    const hillMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(h.rx, h.rx + 0.6, h.h, 14),
      stylizedGrassMound
    );
    hillMesh.position.set(h.x, h.h / 2, h.z);
    hillMesh.receiveShadow = true;
    islandGroup.add(hillMesh);

    // Stone rim border around hill base
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(h.rx + 0.3, 0.1, 5, 14),
      cobbleMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(h.x, 0.05, h.z);
    islandGroup.add(rim);
  });

  // 4. Central Sanctuary Plateau (Raised 0.35m with carved stone rim)
  const plateau = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.5, 0.45, 18),
    stylizedGrassHigh
  );
  plateau.position.y = 0.22;
  plateau.receiveShadow = true;
  islandGroup.add(plateau);

  const plateauStoneRim = new THREE.Mesh(
    new THREE.TorusGeometry(5.2, 0.16, 6, 18),
    cobbleMat
  );
  plateauStoneRim.rotation.x = Math.PI / 2;
  plateauStoneRim.position.y = 0.45;
  islandGroup.add(plateauStoneRim);

  // 5. Procedural Cobblestone Pathways & Stepping Stones
  const pathCoords = [
    // Towards parkour (South-East)
    [2.2, 0.22, 2.2], [3.8, 0.05, 3.8], [5.2, 0.05, 5.6], [6.2, 0.05, 7.5],
    // Towards cave sanctuary (North-East)
    [2.2, 0.22, -2.2], [4.4, 0.05, -4.2], [6.5, 0.05, -6.0], [8.2, 0.05, -7.0],
    // Towards waterfall lake (West)
    [-2.4, 0.22, -0.8], [-4.8, 0.05, -1.4], [-7.2, 0.05, -2.0], [-9.2, 0.05, -2.6],
    // Towards celebration glade & portal (South-West)
    [-2.2, 0.22, 2.2], [-4.2, 0.05, 4.4], [-6.2, 0.05, 6.4], [-7.6, 0.05, 8.0]
  ];

  pathCoords.forEach(([px, py, pz]) => {
    const stone = new THREE.Mesh(
      new THREE.BoxGeometry(0.95 + Math.random() * 0.3, 0.08, 0.95 + Math.random() * 0.3),
      cobbleMat
    );
    stone.position.set(px, py, pz);
    stone.rotation.y = Math.random() * Math.PI;
    stone.receiveShadow = true;
    islandGroup.add(stone);
  });

  // 6. Heart of the Island Centerpiece
  const heart = createHeartOfTheIsland();
  heart.group.position.set(0, 0.45, 0);
  scene.add(heart.group);

  // 7. North-East Cave Hill & Sanctuary (Location of Crystal 2: Скрытая пещера)
  const caveGroup = new THREE.Group();

  const hillT1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 2.2, 8.5), cliffStoneMat);
  hillT1.position.set(10.5, 1.1, -9.5);
  hillT1.castShadow = true;
  hillT1.receiveShadow = true;
  caveGroup.add(hillT1);

  const hillT2 = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.8, 7.8), cliffStoneMat);
  hillT2.position.set(10.5, 2.9, -9.5);
  hillT2.castShadow = true;
  hillT2.receiveShadow = true;
  caveGroup.add(hillT2);

  const hillGrassTop = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.45, 8.2), stylizedGrassHigh);
  hillGrassTop.position.set(10.5, 3.95, -9.5);
  hillGrassTop.receiveShadow = true;
  caveGroup.add(hillGrassTop);

  // Arched Stone Cave Entrance
  const archLeft = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.2, 0.9), mossyStoneMat);
  archLeft.position.set(8.8, 1.6, -5.3);
  const archRight = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.2, 0.9), mossyStoneMat);
  archRight.position.set(12.0, 1.6, -5.3);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 1.1), mossyStoneMat);
  archTop.position.set(10.4, 3.2, -5.3);
  caveGroup.add(archLeft, archRight, archTop);

  // Warm glowing cave torch
  const torchMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const torch = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), torchMat);
  torch.position.set(9.2, 1.8, -7.2);
  const torchLight = new THREE.PointLight(0xf59e0b, 1.5, 7);
  torchLight.position.set(9.2, 2.1, -7.2);
  caveGroup.add(torch, torchLight);

  islandGroup.add(caveGroup);

  // 8. West Waterfall & Stylized Turquoise Mountain Spring (Location of Crystal 3: Грот водопада)
  const cliff1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 4.0, 7.5), cliffStoneMat);
  cliff1.position.set(-13.8, 2.0, -3.0);
  cliff1.castShadow = true;
  islandGroup.add(cliff1);

  const cliffGrass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 7.7), stylizedGrassHigh);
  cliffGrass.position.set(-13.8, 4.1, -3.0);
  islandGroup.add(cliffGrass);

  const cliff2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 5.5), mossyStoneMat);
  cliff2.position.set(-11.8, 1.1, -3.0);
  cliff2.castShadow = true;
  islandGroup.add(cliff2);

  // Stylized Lake Basin with Animated Shader
  const lake = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 0.26, 36, 6), stylizedWater);
  lake.position.set(-10.2, 0.08, -3.0);
  islandGroup.add(lake);

  const lakeRim = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.2, 6, 24), cobbleMat);
  lakeRim.rotation.x = Math.PI / 2;
  lakeRim.position.set(-10.2, 0.12, -3.0);
  islandGroup.add(lakeRim);

  // Cascading Waterfall stream with animated vertex wave shader
  const waterfallMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 8.5, 0.4, 8, 36, 2), stylizedWater);
  waterfallMesh.position.set(-15.0, -1.8, -3.0);
  islandGroup.add(waterfallMesh);

  // Wooden footbridge across stream
  const bridgeGroup = new THREE.Group();
  const bridgeWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
  const plankGeo = new THREE.BoxGeometry(1.6, 0.12, 0.4);
  for (let b = 0; b < 6; b++) {
    const plank = new THREE.Mesh(plankGeo, bridgeWoodMat);
    plank.position.set(-6.5, 0.2, -3.8 + b * 0.45);
    bridgeGroup.add(plank);
  }
  islandGroup.add(bridgeGroup);

  // 9. South-East Parkour Floating Pillars (Location of Crystal 1: Небесный паркур)
  const parkourPillars: { x: number; y: number; z: number; r: number }[] = [
    { x: 6.2, y: 1.1, z: 9.0, r: 1.35 },
    { x: 8.8, y: 2.1, z: 11.2, r: 1.25 },
    { x: 11.6, y: 3.1, z: 12.8, r: 1.15 },
    { x: 14.0, y: 4.2, z: 10.6, r: 1.7 },
  ];

  parkourPillars.forEach((p, idx) => {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(p.r - 0.1, p.r + 0.35, p.y + 3.0, 8),
      cliffStoneMat
    );
    shaft.position.set(p.x, p.y / 2 - 1.4, p.z);
    shaft.castShadow = true;
    islandGroup.add(shaft);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(p.r + 0.12, p.r + 0.12, 0.4, 8),
      stylizedGrassHigh
    );
    pad.position.set(p.x, p.y, p.z);
    pad.receiveShadow = true;
    islandGroup.add(pad);

    if (idx === parkourPillars.length - 1) {
      const bannerPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85 })
      );
      bannerPole.position.set(p.x - 1.0, p.y + 1.0, p.z - 1.0);
      islandGroup.add(bannerPole);

      const flag = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.45, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 })
      );
      flag.position.set(p.x - 0.65, p.y + 1.6, p.z - 1.0);
      islandGroup.add(flag);
    }
  });

  // 10. Celebration Glade & Secret Birthday Portal (South-West)
  const portal = createSecretPortal();
  portal.group.position.set(-8.5, 0.05, 9.2);
  portal.group.rotation.y = Math.PI / 4;
  scene.add(portal.group);

  // Floating balloons & gift boxes
  const balloonColors = [0xec4899, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7];
  for (let b = 0; b < 8; b++) {
    const bMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 12, 12),
      new THREE.MeshStandardMaterial({ color: balloonColors[b % balloonColors.length], roughness: 0.3 })
    );
    const bx = -10.5 + (b % 4) * 0.95;
    const bz = 7.5 + Math.floor(b / 4) * 1.6;
    bMesh.position.set(bx, 3.6 + (b % 3) * 0.4, bz);
    islandGroup.add(bMesh);

    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 3.0, 4),
      new THREE.MeshBasicMaterial({ color: 0xf1f5f9 })
    );
    string.position.set(bx, 2.1, bz);
    islandGroup.add(string);
  }

  const giftPositions = [
    { x: -5.5, y: 0.25, z: 3.5, col: 0xec4899 },
    { x: 3.0, y: 0.25, z: 5.5, col: 0x3b82f6 },
    { x: -7.0, y: 0.25, z: 8.0, col: 0xfacc15 },
    { x: 6.8, y: 0.25, z: -5.0, col: 0x10b981 },
  ];

  giftPositions.forEach(g => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.48, 0.48),
      new THREE.MeshStandardMaterial({ color: g.col, roughness: 0.4 })
    );
    box.position.set(g.x, g.y, g.z);
    box.rotation.y = Math.random() * Math.PI;
    box.castShadow = true;
    islandGroup.add(box);

    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    ribbon.position.set(g.x, g.y, g.z);
    ribbon.rotation.y = box.rotation.y;
    islandGroup.add(ribbon);
  });

  // 11. Distinct Trees (Grand Oak, Weeping Sakura with Lantern, Mountain Pine)
  const treeConfigs = [
    { x: -5.5, z: -8.5, type: 'oak', scale: 1.15 },
    { x: -9.5, z: -10.5, type: 'sakura', scale: 1.25 },
    { x: 3.2, z: -12.5, type: 'pine', scale: 1.2 },
    { x: -4.0, z: 12.5, type: 'sakura', scale: 1.15 },
    { x: -11.5, z: 5.8, type: 'oak', scale: 1.05 },
    { x: 8.5, z: 4.2, type: 'pine', scale: 1.1 },
    { x: 12.5, z: -1.8, type: 'sakura', scale: 1.3 },
    { x: -12.5, z: -8.0, type: 'pine', scale: 1.0 },
    { x: 1.5, z: -7.5, type: 'oak', scale: 0.95 },
  ];

  treeConfigs.forEach(t => {
    let treeMesh: THREE.Group;
    if (t.type === 'sakura') {
      treeMesh = createStylizedSakuraTree(t.scale);
    } else if (t.type === 'pine') {
      treeMesh = createStylizedPineTree(t.scale);
    } else {
      treeMesh = createStylizedOakTree(t.scale);
    }
    treeMesh.position.set(t.x, 0, t.z);
    islandGroup.add(treeMesh);
  });

  // 12. Stylized Faceted Boulders & Rock Outcrops
  const rockPlacements = [
    { x: -9.5, y: 0.4, z: 1.2, sx: 1.4, sy: 0.9, sz: 1.3 },
    { x: -12.8, y: 0.5, z: 0.8, sx: 1.8, sy: 1.2, sz: 1.5 },
    { x: 5.8, y: 0.4, z: -2.8, sx: 1.2, sy: 0.8, sz: 1.1 },
    { x: 8.2, y: 0.4, z: 7.2, sx: 1.5, sy: 1.0, sz: 1.4 },
    { x: -3.5, y: 0.3, z: -11.0, sx: 1.3, sy: 0.8, sz: 1.2 },
    { x: 11.2, y: 0.4, z: -4.0, sx: 1.6, sy: 0.9, sz: 1.4 },
  ];

  rockPlacements.forEach(r => {
    const boulder = createFacetedBoulder(r.sx, r.sy, r.sz);
    boulder.position.set(r.x, r.y, r.z);
    boulder.rotation.set(Math.random(), Math.random(), Math.random());
    islandGroup.add(boulder);
  });

  // 13. Enhanced Vegetation System: Swaying Grass Tufts, Wildflowers & Lakeside Reeds
  const flowerColors = [0xec4899, 0x38bdf8, 0xfacc15, 0xf43f5e, 0xa855f7];
  for (let f = 0; f < 48; f++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 3.8 + Math.random() * 13.5;
    const fx = Math.cos(angle) * dist;
    const fz = Math.sin(angle) * dist;

    // Stylized swaying grass blades using our shader
    const tuft1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.08), stylizedGrassHigh);
    tuft1.position.set(fx, 0.17, fz);
    tuft1.rotation.z = 0.2;
    const tuft2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), stylizedGrassHigh);
    tuft2.position.set(fx + 0.08, 0.15, fz);
    tuft2.rotation.z = -0.2;
    islandGroup.add(tuft1, tuft2);

    // Blossom
    const blossom = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12, 0),
      new THREE.MeshStandardMaterial({ color: flowerColors[f % flowerColors.length], roughness: 0.4 })
    );
    blossom.position.set(fx, 0.38, fz);
    islandGroup.add(blossom);
  }

  // Lakeside reeds along turquoise water
  for (let r = 0; r < 14; r++) {
    const rAngle = 0.8 + (r / 14) * Math.PI * 1.5;
    const rx = -10.2 + Math.cos(rAngle) * 4.6;
    const rz = -3.0 + Math.sin(rAngle) * 4.6;
    const reed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.8, 5),
      createStylizedGrassMaterial(0x2d6a36)
    );
    reed.position.set(rx, 0.4, rz);
    reed.rotation.z = (Math.random() - 0.5) * 0.2;
    islandGroup.add(reed);
  }

  // 14. Stylized Floating Clouds Drifting in the Sky
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.4, 
    transparent: true, 
    opacity: 0.88 
  });

  const clouds: { mesh: THREE.Group; speed: number; baseZ: number }[] = [];
  for (let c = 0; c < 7; c++) {
    const cMesh = new THREE.Group();
    const cWidth = 4 + Math.random() * 3;
    const cMain = new THREE.Mesh(new THREE.BoxGeometry(cWidth, 1.4, 2.4), cloudMat);
    const cTop = new THREE.Mesh(new THREE.BoxGeometry(cWidth * 0.6, 1.1, 1.8), cloudMat);
    cTop.position.set(0.3, 1.0, 0);
    cMesh.add(cMain, cTop);

    const cX = (Math.random() - 0.5) * 60;
    const cY = 10 + Math.random() * 12;
    const cZ = (Math.random() - 0.5) * 60;
    cMesh.position.set(cX, cY, cZ);
    cloudGroup.add(cMesh);

    clouds.push({
      mesh: cMesh,
      speed: 0.4 + Math.random() * 0.6,
      baseZ: cZ,
    });
  }
  scene.add(cloudGroup);

  // 15. Distant Floating Mini-Islands
  for (let d = 0; d < 6; d++) {
    const dAngle = (d / 6) * Math.PI * 2 + 0.4;
    const dDist = 42 + (d % 3) * 14;
    const dIsland = new THREE.Group();
    dIsland.position.set(Math.cos(dAngle) * dDist, 6 + (d % 4) * 3, Math.sin(dAngle) * dDist);

    const dTop = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.4, 1.2, 8), stylizedGrassMain);
    const dBottom = new THREE.Mesh(new THREE.ConeGeometry(3.4, 4.8, 8), cliffStoneMat);
    dBottom.rotateX(Math.PI);
    dBottom.position.y = -3.0;
    dIsland.add(dTop, dBottom);

    const dTree = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.6 }));
    dTree.position.y = 2.2;
    dIsland.add(dTree);

    scene.add(dIsland);
  }

  // 16. Collectibles (3 Crystals & 5 Stars)
  const crystals = new Map<string, { group: THREE.Group; update: (dt: number) => void; position: THREE.Vector3 }>();

  // Crystal 1: Небесный паркур
  const cParkour = createCollectableCrystal('parkour');
  const posParkour = new THREE.Vector3(14.0, 5.5, 10.6);
  cParkour.group.position.copy(posParkour);
  scene.add(cParkour.group);
  crystals.set('crystal_parkour', { ...cParkour, position: posParkour });

  // Crystal 2: Скрытая пещера
  const cCave = createCollectableCrystal('cave');
  const posCave = new THREE.Vector3(10.5, 1.5, -9.0);
  cCave.group.position.copy(posCave);
  scene.add(cCave.group);
  crystals.set('crystal_cave', { ...cCave, position: posCave });

  // Crystal 3: Грот водопада
  const cWater = createCollectableCrystal('waterfall');
  const posWater = new THREE.Vector3(-12.0, 1.3, -3.2);
  cWater.group.position.copy(posWater);
  scene.add(cWater.group);
  crystals.set('crystal_waterfall', { ...cWater, position: posWater });

  // 5 Birthday Stars
  const stars = new Map<string, { group: THREE.Group; update: (dt: number) => void; position: THREE.Vector3 }>();
  const starPositions = [
    { id: 'star_1', pos: new THREE.Vector3(-4.5, 1.3, -5.5) },
    { id: 'star_2', pos: new THREE.Vector3(5.5, 1.3, -3.5) },
    { id: 'star_3', pos: new THREE.Vector3(7.2, 1.6, 6.2) },
    { id: 'star_4', pos: new THREE.Vector3(-6.2, 1.3, 5.0) },
    { id: 'star_5', pos: new THREE.Vector3(10.5, 4.8, -9.5) },
  ];

  starPositions.forEach(s => {
    const star = createCollectableStar();
    star.group.position.copy(s.pos);
    scene.add(star.group);
    stars.set(s.id, { ...star, position: s.pos });
  });

  // 17. Ambient Starlight & Pollen Particles
  const particleCount = 160;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 40;
    particlePositions[i * 3 + 1] = Math.random() * 12;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xfef08a,
    size: 0.22,
    transparent: true,
    opacity: 0.85,
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Fireworks system
  const fireworkParticles: { pos: THREE.Vector3; vel: THREE.Vector3; color: THREE.Color; life: number; maxLife: number; mesh: THREE.Mesh }[] = [];
  const triggerFireworks = (x: number, y: number, z: number) => {
    const colors = [0xf43f5e, 0x38bdf8, 0xfacc15, 0xa855f7, 0x10b981];
    for (let i = 0; i < 45; i++) {
      const col = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.14, 0.14),
        new THREE.MeshBasicMaterial({ color: col })
      );
      mesh.position.set(x, y, z);
      scene.add(mesh);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 3.5 + Math.random() * 6.5;
      const vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed + 2.5,
        Math.sin(phi) * Math.sin(theta) * speed
      );

      fireworkParticles.push({
        pos: mesh.position,
        vel,
        color: col,
        life: 0,
        maxLife: 1.6 + Math.random() * 0.8,
        mesh,
      });
    }
  };

  // Ground collision height mapping
  const getGroundHeight = (x: number, z: number): number => {
    // 1. Parkour platforms
    for (const p of parkourPillars) {
      const dist = Math.hypot(x - p.x, z - p.z);
      if (dist <= p.r + 0.4) {
        return p.y;
      }
    }

    // 2. Cave hill
    if (x >= 6.5 && x <= 14.5 && z >= -13.5 && z <= -5.5) {
      if (x >= 9.0 && x <= 12.0 && z >= -10.5 && z <= -4.8) {
        return 0.05; // Inside cave
      }
      return 3.95; // On top of hill
    }

    // 3. Waterfall cliff
    if (x >= -15.5 && x <= -11.5 && z >= -6.8 && z <= 0.8) {
      return 3.5;
    }

    // 4. Central Sanctuary Plateau
    if (Math.hypot(x, z) <= 5.2) {
      return 0.45;
    }

    // 5. Rolling Hill Mounds
    for (const h of hillPositions) {
      const dist = Math.hypot(x - h.x, z - h.z);
      if (dist <= h.rx) {
        return h.h;
      }
    }

    // 6. Main Island boundary
    const centerDist = Math.hypot(x, z);
    if (centerDist <= islandRadius) {
      return 0.05;
    }

    // Abyss
    return -999;
  };

  const isObstacle = (x: number, z: number): boolean => {
    // Cave outer walls
    if (x >= 6.5 && x <= 14.5 && z >= -13.5 && z <= -5.5) {
      const inTunnel = x >= 9.0 && x <= 12.0 && z >= -10.5 && z <= -4.8;
      if (!inTunnel) return true;
    }
    // Trees
    for (const t of treeConfigs) {
      if (Math.hypot(x - t.x, z - t.z) < 0.7) return true;
    }
    return false;
  };

  let globalTime = 0;
  const update = (delta: number, questState: QuestState) => {
    globalTime += delta;
    updateStylizedShaderTime(globalTime);

    const count = Object.values(questState.crystalsCollected).filter(Boolean).length;
    heart.update(delta, count, questState.heartRestored);

    portal.setActive(questState.heartRestored);
    portal.update(delta);

    // Drifting clouds
    clouds.forEach(c => {
      c.mesh.position.x += delta * c.speed;
      if (c.mesh.position.x > 38) {
        c.mesh.position.x = -38;
      }
    });

    // Collectibles update
    crystals.forEach((crystal, id) => {
      if (questState.crystalsCollected[id]) {
        crystal.group.visible = false;
      } else {
        crystal.group.visible = true;
        crystal.update(delta);
      }
    });

    stars.forEach((star, id) => {
      if (questState.starsCollected[id]) {
        star.group.visible = false;
      } else {
        star.group.visible = true;
        star.update(delta);
      }
    });

    // Ambient particles float
    const pos = particleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.012;
      if (pos[i * 3 + 1] > 12) pos[i * 3 + 1] = 0;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Fireworks
    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
      const p = fireworkParticles[i];
      p.life += delta;
      p.vel.y -= 9.8 * delta * 0.35;
      p.pos.addScaledVector(p.vel, delta);
      p.mesh.scale.setScalar(Math.max(0, 1 - p.life / p.maxLife));
      if (p.life >= p.maxLife) {
        scene.remove(p.mesh);
        fireworkParticles.splice(i, 1);
      }
    }
  };

  return {
    scene,
    heart,
    portal,
    crystals,
    stars,
    triggerFireworks,
    update,
    getGroundHeight,
    isObstacle,
  };
}

/**
 * Builds the Secret Birthday Room with warm festive lighting and pedestals
 */
function buildBirthdayRoom(scene: THREE.Scene): WorldObjects {
  scene.fog = new THREE.FogExp2(0x0c1222, 0.018);
  scene.background = new THREE.Color(0x080e1c);

  const ambientLight = new THREE.HemisphereLight(0xfef08a, 0x1e293b, 1.4);
  scene.add(ambientLight);

  const chandelierLight = new THREE.PointLight(0xf59e0b, 2.6, 26);
  chandelierLight.position.set(0, 6.5, 0);
  scene.add(chandelierLight);

  const roomGroup = new THREE.Group();
  scene.add(roomGroup);

  const woodFloorMat = new THREE.MeshStandardMaterial({ 
    color: 0x78350f, 
    roughness: 0.5, 
    metalness: 0.15 
  });
  const floorGeo = new THREE.CylinderGeometry(11.5, 11.5, 0.6, 22);
  const floor = new THREE.Mesh(floorGeo, woodFloorMat);
  floor.position.y = -0.3;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Border pillars with gold capitals and warm lanterns
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const goldTrim = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px = Math.cos(angle) * 10.5;
    const pz = Math.sin(angle) * 10.5;

    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 6.5, 0.85), pillarMat);
    pMesh.position.set(px, 3.25, pz);
    roomGroup.add(pMesh);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.25, 1.05), goldTrim);
    cap.position.set(px, 6.5, pz);
    roomGroup.add(cap);

    const lantern = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.25, 0),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    );
    lantern.position.set(px, 5.8, pz);
    roomGroup.add(lantern);
  }

  // Giant Birthday Cake
  const cake = createVoxelBirthdayCake();
  cake.group.position.set(0, 0, -2.2);
  roomGroup.add(cake.group);

  // Dilnaz's Pedestal (Left: -4.8, 0, 1.5)
  const sisterPedestal = new THREE.Group();
  sisterPedestal.name = 'gift_sister';
  
  const pedSister = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.5, 1.0, 8),
    new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.35, metalness: 0.4 })
  );
  pedSister.position.y = 0.5;
  sisterPedestal.add(pedSister);

  const bladeGroup = new THREE.Group();
  bladeGroup.position.y = 1.9;

  const blade = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 0),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 1.4 })
  );
  const compassRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.08, 6, 12),
    goldTrim
  );
  compassRing.rotation.x = Math.PI / 3;
  bladeGroup.add(blade, compassRing);
  sisterPedestal.add(bladeGroup);

  const sisterGiftLight = new THREE.PointLight(0xec4899, 1.8, 8);
  sisterGiftLight.position.y = 2.0;
  sisterPedestal.add(sisterGiftLight);

  sisterPedestal.position.set(-4.8, 0, 1.5);
  roomGroup.add(sisterPedestal);

  // Alizhan's Pedestal (Right: 4.8, 0, 1.5)
  const brotherPedestal = new THREE.Group();
  brotherPedestal.name = 'gift_brother';

  const pedBrother = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.5, 1.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35, metalness: 0.4 })
  );
  pedBrother.position.y = 0.5;
  brotherPedestal.add(pedBrother);

  const knightGroup = new THREE.Group();
  knightGroup.position.y = 1.9;

  const knightHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.95, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.2 })
  );
  const knightSnout = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.35, 0.35),
    goldTrim
  );
  knightSnout.position.set(0, 0.15, 0.35);
  knightGroup.add(knightHead, knightSnout);
  brotherPedestal.add(knightGroup);

  const brotherGiftLight = new THREE.PointLight(0xf59e0b, 1.8, 8);
  brotherGiftLight.position.y = 2.0;
  brotherPedestal.add(brotherGiftLight);

  brotherPedestal.position.set(4.8, 0, 1.5);
  roomGroup.add(brotherPedestal);

  // Return Portal
  const returnPortal = createSecretPortal();
  returnPortal.group.position.set(0, 0, 8.5);
  returnPortal.group.rotation.y = Math.PI;
  returnPortal.setActive(true);
  roomGroup.add(returnPortal.group);

  const skyStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.32 })
  );
  const starCoords = new Float32Array(160 * 3);
  for (let i = 0; i < 160; i++) {
    starCoords[i * 3] = (Math.random() - 0.5) * 44;
    starCoords[i * 3 + 1] = 8 + Math.random() * 10;
    starCoords[i * 3 + 2] = (Math.random() - 0.5) * 44;
  }
  skyStars.geometry.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
  scene.add(skyStars);

  const dummyHeart = createHeartOfTheIsland();
  const dummyCrystals = new Map();
  const dummyStars = new Map();

  const getGroundHeight = () => 0.05;
  const isObstacle = (x: number, z: number) => {
    if (Math.hypot(x, z - (-2.2)) < 1.6) return true;
    if (Math.hypot(x, z) > 10.6) return true;
    return false;
  };

  let roomGlobalTime = 0;
  const update = (delta: number) => {
    roomGlobalTime += delta;
    updateStylizedShaderTime(roomGlobalTime);
    cake.update(delta);
    returnPortal.update(delta);
    bladeGroup.rotation.y += delta * 1.4;
    bladeGroup.position.y = 1.9 + Math.sin(Date.now() * 0.003) * 0.1;
    knightGroup.rotation.y += delta * 1.4;
    knightGroup.position.y = 1.9 + Math.sin(Date.now() * 0.003) * 0.1;
  };

  const triggerFireworks = () => {};

  return {
    scene,
    heart: dummyHeart,
    portal: returnPortal,
    crystals: dummyCrystals,
    stars: dummyStars,
    birthdayCake: cake,
    sisterPedestal,
    brotherPedestal,
    triggerFireworks,
    update,
    getGroundHeight,
    isObstacle,
  };
}
