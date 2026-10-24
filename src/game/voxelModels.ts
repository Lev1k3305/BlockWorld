import * as THREE from 'three';
import { HeroType } from './types';

// Curated PBR Materials for Stylized Fantasy Adventure
const materials = {
  // Skin
  skinWarm: new THREE.MeshStandardMaterial({ 
    color: 0xffdfc4, 
    roughness: 0.65, 
    metalness: 0.05 
  }),
  skinShadow: new THREE.MeshStandardMaterial({ 
    color: 0xf5cca0, 
    roughness: 0.7, 
    metalness: 0.05 
  }),

  // Dilnaz (14) - Rose Pink, Amethyst Purple, Luminous Cyan
  dilnazHair: new THREE.MeshStandardMaterial({ 
    color: 0x3d2014, 
    roughness: 0.6, 
    metalness: 0.1 
  }),
  dilnazHairAccent: new THREE.MeshStandardMaterial({ 
    color: 0x543220, 
    roughness: 0.55, 
    metalness: 0.1 
  }),
  dilnazTunic: new THREE.MeshStandardMaterial({ 
    color: 0xec4899, 
    roughness: 0.5, 
    metalness: 0.15 
  }),
  dilnazCloak: new THREE.MeshStandardMaterial({ 
    color: 0x9333ea, 
    roughness: 0.55, 
    metalness: 0.2 
  }),
  dilnazTrim: new THREE.MeshStandardMaterial({ 
    color: 0x06b6d4, 
    roughness: 0.35, 
    metalness: 0.4 
  }),
  dilnazPants: new THREE.MeshStandardMaterial({ 
    color: 0x2e1065, 
    roughness: 0.65, 
    metalness: 0.1 
  }),
  dilnazBoots: new THREE.MeshStandardMaterial({ 
    color: 0x4c1d95, 
    roughness: 0.5, 
    metalness: 0.25 
  }),

  // Alizhan (16) - Royal Blue, Warm Amber Gold, Deep Slate Navy
  alizhanHair: new THREE.MeshStandardMaterial({ 
    color: 0x1c1917, 
    roughness: 0.6, 
    metalness: 0.1 
  }),
  alizhanHairAccent: new THREE.MeshStandardMaterial({ 
    color: 0x292524, 
    roughness: 0.55, 
    metalness: 0.1 
  }),
  alizhanTunic: new THREE.MeshStandardMaterial({ 
    color: 0x1d4ed8, 
    roughness: 0.5, 
    metalness: 0.2 
  }),
  alizhanCloak: new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, 
    roughness: 0.6, 
    metalness: 0.2 
  }),
  alizhanGoldTrim: new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, 
    roughness: 0.25, 
    metalness: 0.85 
  }),
  alizhanPants: new THREE.MeshStandardMaterial({ 
    color: 0x1e293b, 
    roughness: 0.65, 
    metalness: 0.1 
  }),
  alizhanBoots: new THREE.MeshStandardMaterial({ 
    color: 0x334155, 
    roughness: 0.45, 
    metalness: 0.3 
  }),

  // Eyes & Facial Details
  eyeWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  eyePupilAlizhan: new THREE.MeshBasicMaterial({ color: 0x1e3a8a }),
  eyePupilDilnaz: new THREE.MeshBasicMaterial({ color: 0x451a03 }),
  eyeShine: new THREE.MeshBasicMaterial({ color: 0xffffff }),

  // Metallics & Runic Glows
  goldMetal: new THREE.MeshStandardMaterial({ 
    color: 0xfbbf24, 
    roughness: 0.2, 
    metalness: 0.9 
  }),
  silverMetal: new THREE.MeshStandardMaterial({ 
    color: 0xe2e8f0, 
    roughness: 0.25, 
    metalness: 0.85 
  }),
  runeCyanGlow: new THREE.MeshStandardMaterial({ 
    color: 0x38bdf8, 
    emissive: 0x0284c7, 
    emissiveIntensity: 1.4,
    roughness: 0.2, 
    metalness: 0.4 
  }),
  starGold: new THREE.MeshStandardMaterial({ 
    color: 0xfde047, 
    emissive: 0xf59e0b, 
    emissiveIntensity: 1.3, 
    roughness: 0.2, 
    metalness: 0.5 
  }),

  // Baby Dragon (Sparky) Materials
  dragonSkin: new THREE.MeshStandardMaterial({ 
    color: 0x10b981, 
    roughness: 0.5, 
    metalness: 0.1 
  }),
  dragonBelly: new THREE.MeshStandardMaterial({ 
    color: 0xa7f3d0, 
    roughness: 0.6, 
    metalness: 0.05 
  }),
  dragonHorns: new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, 
    roughness: 0.25, 
    metalness: 0.8 
  }),
  dragonWings: new THREE.MeshStandardMaterial({ 
    color: 0x047857, 
    roughness: 0.45, 
    metalness: 0.15,
    side: THREE.DoubleSide 
  }),
  partyHatMat: new THREE.MeshStandardMaterial({ 
    color: 0xf43f5e, 
    roughness: 0.4, 
    metalness: 0.2 
  }),

  // Collectible Crystals
  crystalParkourMat: new THREE.MeshStandardMaterial({ 
    color: 0x38bdf8, 
    emissive: 0x0284c7, 
    emissiveIntensity: 1.2, 
    roughness: 0.1, 
    metalness: 0.35, 
    transparent: true, 
    opacity: 0.92 
  }),
  crystalCaveMat: new THREE.MeshStandardMaterial({ 
    color: 0x34d399, 
    emissive: 0x059669, 
    emissiveIntensity: 1.2, 
    roughness: 0.1, 
    metalness: 0.35, 
    transparent: true, 
    opacity: 0.92 
  }),
  crystalWaterfallMat: new THREE.MeshStandardMaterial({ 
    color: 0xc084fc, 
    emissive: 0x9333ea, 
    emissiveIntensity: 1.2, 
    roughness: 0.1, 
    metalness: 0.35, 
    transparent: true, 
    opacity: 0.92 
  }),
};

export interface CharacterRig {
  root: THREE.Group;
  head: THREE.Group;
  body: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  heroType: HeroType;
  updateAnimation: (state: 'idle' | 'walk' | 'jump', speed: number, delta: number) => void;
}

/**
 * Creates distinct, high-quality stylized adventurer characters (Alizhan & Dilnaz)
 * with expressive proportions, sculpted hair, layered adventure gear, and artifacts.
 */
export function createVoxelCharacter(heroType: HeroType): CharacterRig {
  const root = new THREE.Group();
  root.name = `character_${heroType}`;

  const isSister = heroType === 'sister';
  const tunicMat = isSister ? materials.dilnazTunic : materials.alizhanTunic;
  const cloakMat = isSister ? materials.dilnazCloak : materials.alizhanCloak;
  const trimMat = isSister ? materials.dilnazTrim : materials.alizhanGoldTrim;
  const hairMat = isSister ? materials.dilnazHair : materials.alizhanHair;
  const hairAccentMat = isSister ? materials.dilnazHairAccent : materials.alizhanHairAccent;
  const pantsMat = isSister ? materials.dilnazPants : materials.alizhanPants;
  const bootsMat = isSister ? materials.dilnazBoots : materials.alizhanBoots;
  const pupilMat = isSister ? materials.eyePupilDilnaz : materials.eyePupilAlizhan;

  // 1. Head Group (height ~1.5m)
  const head = new THREE.Group();
  head.position.y = 1.52;

  // Stylized head form with rounded bevels
  const headGeo = new THREE.BoxGeometry(0.5, 0.48, 0.48);
  const headMesh = new THREE.Mesh(headGeo, materials.skinWarm);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Layered Stylized Hair
  const hairCrown = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.54), hairMat);
  hairCrown.position.y = 0.16;
  head.add(hairCrown);

  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.38, 0.22), hairMat);
  hairBack.position.set(0, -0.06, -0.18);
  head.add(hairBack);

  if (isSister) {
    // Dilnaz: Twin sweeping braids + side locks + turquoise astral clips
    const lockL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 0.16), hairMat);
    lockL.position.set(-0.27, -0.12, 0.08);
    const lockR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 0.16), hairMat);
    lockR.position.set(0.27, -0.12, 0.08);

    const bang = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.14), hairAccentMat);
    bang.position.set(0, 0.22, 0.22);

    // Cyan glowing star hair accessories
    const clipL = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), materials.runeCyanGlow);
    clipL.position.set(-0.28, 0.15, 0.22);
    const clipR = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), materials.runeCyanGlow);
    clipR.position.set(0.28, 0.15, 0.22);

    head.add(lockL, lockR, bang, clipL, clipR);
  } else {
    // Alizhan: Swept side-part adventurer hair + golden tactical circlet
    const circlet = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.07, 0.56), materials.goldMetal);
    circlet.position.y = 0.11;
    head.add(circlet);

    const bang1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.18), hairAccentMat);
    bang1.position.set(-0.06, 0.27, 0.22);
    head.add(bang1);
  }

  // Expressive Stylized Eyes
  const addEye = (xPos: number) => {
    const eyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.02), materials.eyeWhite);
    eyeWhite.position.set(xPos, 0.01, 0.245);

    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.025), pupilMat);
    pupil.position.set(xPos + (xPos > 0 ? -0.01 : 0.01), 0.01, 0.25);

    const shine = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.03), materials.eyeShine);
    shine.position.set(xPos + (xPos > 0 ? 0.015 : -0.005), 0.035, 0.255);

    head.add(eyeWhite, pupil, shine);
  };
  addEye(-0.13);
  addEye(0.13);

  root.add(head);

  // 2. Torso Group
  const body = new THREE.Group();
  body.position.y = 0.98;

  const torsoGeo = new THREE.BoxGeometry(0.48, 0.6, 0.3);
  const torso = new THREE.Mesh(torsoGeo, tunicMat);
  torso.castShadow = true;
  body.add(torso);

  // Belt & Buckle
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.32), trimMat);
  belt.position.y = -0.22;
  body.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.34), materials.goldMetal);
  buckle.position.set(0, -0.22, 0.01);
  body.add(buckle);

  // Hero-specific accessories & cloaks
  if (isSister) {
    // Dilnaz: Cyan Astral Portal Rune Amulet & Flowing Purple Mantle
    const amulet = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), materials.runeCyanGlow);
    amulet.position.set(0, 0.09, 0.17);
    body.add(amulet);

    const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.58, 0.04), cloakMat);
    cloak.position.set(0, -0.06, -0.17);
    body.add(cloak);
  } else {
    // Alizhan: Golden Chess Knight Artifact on chest/shoulder + Navy Adventurer Cloak
    const knightBase = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.18, 0.06), materials.goldMetal);
    knightBase.position.set(0, 0.09, 0.17);
    body.add(knightBase);

    const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.58, 0.04), cloakMat);
    cloak.position.set(0, -0.06, -0.17);
    body.add(cloak);
  }

  root.add(body);

  // 3. Arms with Shoulder Pivots & Cuffs
  const armGeo = new THREE.BoxGeometry(0.17, 0.54, 0.17);
  armGeo.translate(0, -0.22, 0);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.34, 1.18, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, tunicMat);
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  const cuffGeo = new THREE.BoxGeometry(0.19, 0.08, 0.19);
  const leftCuff = new THREE.Mesh(cuffGeo, trimMat);
  leftCuff.position.set(0, -0.4, 0);
  leftArm.add(leftCuff);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.34, 1.18, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, tunicMat);
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightCuff = new THREE.Mesh(cuffGeo, trimMat);
  rightCuff.position.set(0, -0.4, 0);
  rightArm.add(rightCuff);
  root.add(rightArm);

  // 4. Legs with Hip Pivots & Boots
  const legGeo = new THREE.BoxGeometry(0.19, 0.64, 0.21);
  legGeo.translate(0, -0.29, 0);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14, 0.68, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.24, 0.23), bootsMat);
  leftBoot.position.set(0, -0.52, 0.01);
  leftLeg.add(leftBoot);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14, 0.68, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.24, 0.23), bootsMat);
  rightBoot.position.set(0, -0.52, 0.01);
  rightLeg.add(rightBoot);
  root.add(rightLeg);

  // Natural Animation Loop (Idle breath, dynamic walk swing, jump flexion)
  let walkCycle = 0;
  const updateAnimation = (state: 'idle' | 'walk' | 'jump', speed: number, delta: number) => {
    if (state === 'walk') {
      walkCycle += delta * speed * 7.5;
      const swing = Math.sin(walkCycle) * 0.7;

      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing;
      rightArm.rotation.x = swing;

      body.position.y = 0.98 + Math.abs(Math.sin(walkCycle * 2)) * 0.04;
      head.position.y = 1.52 + Math.abs(Math.sin(walkCycle * 2)) * 0.04;
    } else if (state === 'jump') {
      leftLeg.rotation.x = -0.45;
      rightLeg.rotation.x = 0.35;
      leftArm.rotation.x = -1.2;
      rightArm.rotation.x = -1.2;
    } else {
      walkCycle += delta * 2.2;
      const breath = Math.sin(walkCycle) * 0.02;
      body.position.y = 0.98 + breath;
      head.position.y = 1.52 + breath * 0.8;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = Math.sin(walkCycle) * 0.04;
      rightArm.rotation.x = -Math.sin(walkCycle) * 0.04;
    }
  };

  return {
    root,
    head,
    body,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    heroType,
    updateAnimation,
  };
}

export interface DragonRig {
  root: THREE.Group;
  head: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  tail: THREE.Group;
  partyHat: THREE.Group;
  setBirthdayMode: (enabled: boolean) => void;
  celebrate: () => void;
  update: (delta: number, isMoving: boolean) => void;
}

/**
 * Creates a delightful, stylized fantasy baby dragon (Sparky)
 * with organic rounded curves, flapping wings, waving tail, and golden horns.
 */
export function createBabyDragon(): DragonRig {
  const root = new THREE.Group();
  root.name = 'sparky_baby_dragon';
  root.scale.set(0.75, 0.75, 0.75);

  // Rounded chubby body
  const bodyGeo = new THREE.DodecahedronGeometry(0.38, 0);
  bodyGeo.scale(1.0, 0.9, 1.25);
  const bodyMesh = new THREE.Mesh(bodyGeo, materials.dragonSkin);
  bodyMesh.castShadow = true;
  root.add(bodyMesh);

  // Soft mint belly
  const bellyGeo = new THREE.DodecahedronGeometry(0.28, 0);
  bellyGeo.scale(0.9, 0.8, 1.0);
  const bellyMesh = new THREE.Mesh(bellyGeo, materials.dragonBelly);
  bellyMesh.position.set(0, -0.08, 0.08);
  root.add(bellyMesh);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.32, 0.38);

  const headGeo = new THREE.DodecahedronGeometry(0.32, 0);
  const headMesh = new THREE.Mesh(headGeo, materials.dragonSkin);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Cute tapered snout
  const snoutGeo = new THREE.BoxGeometry(0.28, 0.2, 0.26);
  const snout = new THREE.Mesh(snoutGeo, materials.dragonSkin);
  snout.position.set(0, -0.06, 0.26);
  head.add(snout);

  // Expressive eyes
  const eyeWhiteGeo = new THREE.BoxGeometry(0.08, 0.09, 0.04);
  const pupilGeo = new THREE.BoxGeometry(0.05, 0.08, 0.05);

  const eyeL = new THREE.Mesh(eyeWhiteGeo, materials.eyeWhite);
  eyeL.position.set(-0.14, 0.08, 0.22);
  const pupilL = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x064e3b }));
  pupilL.position.set(-0.14, 0.08, 0.23);

  const eyeR = new THREE.Mesh(eyeWhiteGeo, materials.eyeWhite);
  eyeR.position.set(0.14, 0.08, 0.22);
  const pupilR = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x064e3b }));
  pupilR.position.set(0.14, 0.08, 0.23);

  head.add(eyeL, pupilL, eyeR, pupilR);

  // Curved Golden Horns
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 5), materials.dragonHorns);
  hornL.position.set(-0.15, 0.28, -0.06);
  hornL.rotation.z = -0.3;
  hornL.rotation.x = -0.2;

  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 5), materials.dragonHorns);
  hornR.position.set(0.15, 0.28, -0.06);
  hornR.rotation.z = 0.3;
  hornR.rotation.x = -0.2;
  head.add(hornL, hornR);

  // Party Hat
  const partyHat = new THREE.Group();
  const coneGeo = new THREE.ConeGeometry(0.15, 0.4, 6);
  coneGeo.rotateX(Math.PI);
  const cone = new THREE.Mesh(coneGeo, materials.partyHatMat);
  cone.position.set(0, 0.38, 0);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), materials.goldMetal);
  pom.position.set(0, 0.6, 0);
  partyHat.add(cone, pom);
  partyHat.visible = false;
  head.add(partyHat);

  root.add(head);

  // Flapping Wings
  const leftWing = new THREE.Group();
  leftWing.position.set(0.24, 0.16, 0);
  const wingMeshL = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.7, 4), materials.dragonWings);
  wingMeshL.rotation.z = Math.PI / 2;
  wingMeshL.rotation.y = 0.4;
  wingMeshL.scale.set(0.08, 1.0, 0.6);
  leftWing.add(wingMeshL);
  root.add(leftWing);

  const rightWing = new THREE.Group();
  rightWing.position.set(-0.24, 0.16, 0);
  const wingMeshR = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.7, 4), materials.dragonWings);
  wingMeshR.rotation.z = -Math.PI / 2;
  wingMeshR.rotation.y = -0.4;
  wingMeshR.scale.set(0.08, 1.0, 0.6);
  rightWing.add(wingMeshR);
  root.add(rightWing);

  // Tail
  const tail = new THREE.Group();
  tail.position.set(0, 0, -0.36);
  const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.45, 6), materials.dragonSkin);
  tailMesh.rotation.x = Math.PI / 3;
  tailMesh.position.set(0, 0.08, -0.18);
  const tailTip = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), materials.dragonHorns);
  tailTip.position.set(0, 0.18, -0.38);
  tail.add(tailMesh, tailTip);
  root.add(tail);

  let animTimer = 0;
  let celebrationTimer = 0;

  const setBirthdayMode = (enabled: boolean) => {
    partyHat.visible = enabled;
    root.scale.set(enabled ? 0.95 : 0.75, enabled ? 0.95 : 0.75, enabled ? 0.95 : 0.75);
  };

  const celebrate = () => {
    celebrationTimer = 1.3;
  };

  const update = (delta: number, isMoving: boolean) => {
    animTimer += delta;
    const flapSpeed = isMoving ? 16 : 6;
    const wingAngle = Math.sin(animTimer * flapSpeed) * 0.45;
    leftWing.rotation.z = wingAngle;
    rightWing.rotation.z = -wingAngle;

    tail.rotation.y = Math.sin(animTimer * 4.5) * 0.35;
    head.rotation.y = Math.sin(animTimer * 2.2) * 0.15;

    if (celebrationTimer > 0) {
      celebrationTimer -= delta;
      root.position.y += Math.sin((1.3 - celebrationTimer) * Math.PI * 2) * 0.05;
      root.rotation.x = Math.sin((1.3 - celebrationTimer) * Math.PI * 2) * 0.6;
    } else {
      root.rotation.x = 0;
      root.position.y += Math.sin(animTimer * 3.0) * 0.003;
    }
  };

  return {
    root,
    head,
    leftWing,
    rightWing,
    tail,
    partyHat,
    setBirthdayMode,
    celebrate,
    update,
  };
}

/**
 * Creates the magnificent Heart of the Island:
 * An enchanting magical crystal shrine with a carved stone dais, gold runic inlays,
 * a multi-faceted glowing crystal, 4 guardian pillars, orbiting astral shards,
 * and soft ambient radiance.
 */
export function createHeartOfTheIsland() {
  const group = new THREE.Group();
  group.name = 'heart_of_the_island_shrine';

  // 1. Carved Ancient Stone Pedestal
  const stoneMat = new THREE.MeshStandardMaterial({ 
    color: 0x334155, 
    roughness: 0.75, 
    metalness: 0.15 
  });
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.65,
    metalness: 0.2
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.85,
    roughness: 0.2
  });

  // Tier 1 Base Dais
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.0, 0.5, 12), stoneMat);
  base1.position.y = 0.25;
  base1.receiveShadow = true;
  group.add(base1);

  // Tier 2 with Inlaid Gold Rune Ring
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.0, 0.4, 12), marbleMat);
  base2.position.y = 0.7;
  base2.receiveShadow = true;
  group.add(base2);

  const goldRing = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.08, 8, 16), goldTrimMat);
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 0.9;
  group.add(goldRing);

  // Tier 3 Core Altar
  const base3 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.35, 12), stoneMat);
  base3.position.y = 1.05;
  group.add(base3);

  // 4 Guardian Obelisks with carved runic tips
  const pillarGeo = new THREE.BoxGeometry(0.45, 1.9, 0.45);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ox = Math.cos(angle) * 2.3;
    const oz = Math.sin(angle) * 2.3;

    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(ox, 1.5, oz);
    pillar.castShadow = true;
    group.add(pillar);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.55), goldTrimMat);
    cap.position.set(ox, 2.5, oz);
    group.add(cap);

    const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), materials.runeCyanGlow);
    tip.position.set(ox, 2.75, oz);
    group.add(tip);
  }

  // 2. The Heart Crystal Itself
  // Distinct multi-faceted pointed gem geometry (Double hexagonal spire)
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    roughness: 0.12,
    metalness: 0.3,
    transparent: true,
    opacity: 0.93,
  });

  const crystalGroup = new THREE.Group();
  crystalGroup.position.y = 3.2;

  // Upper Spire
  const upperSpire = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.2, 6), crystalMat);
  upperSpire.position.y = 0.4;
  upperSpire.castShadow = true;
  crystalGroup.add(upperSpire);

  // Lower Spire (Inverted)
  const lowerSpire = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.4, 6), crystalMat);
  lowerSpire.rotation.x = Math.PI;
  lowerSpire.position.y = -0.7;
  lowerSpire.castShadow = true;
  crystalGroup.add(lowerSpire);

  // Inner Radiant Core
  const innerCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 0),
    new THREE.MeshBasicMaterial({ color: 0xbae6fd })
  );
  crystalGroup.add(innerCore);

  group.add(crystalGroup);

  // 3. Orbiting Astral Shards
  const shards: THREE.Mesh[] = [];
  const shardGeo = new THREE.OctahedronGeometry(0.28, 0);
  for (let i = 0; i < 6; i++) {
    const shard = new THREE.Mesh(shardGeo, crystalMat.clone());
    group.add(shard);
    shards.push(shard);
  }

  // 4. Subtle Colored Point Light
  const light = new THREE.PointLight(0x06b6d4, 1.5, 18);
  light.position.y = 3.2;
  group.add(light);

  const update = (delta: number, crystalsCount: number, isRestored: boolean) => {
    const time = Date.now() * 0.001;
    crystalGroup.rotation.y += delta * (isRestored ? 1.5 : 0.45);
    crystalGroup.position.y = 3.2 + Math.sin(time * 2.0) * 0.16;
    innerCore.rotation.x += delta * 1.2;

    // Double-helix orbit for shards
    shards.forEach((shard, idx) => {
      const angle = time * (0.8 + idx * 0.12) + (idx * Math.PI * 2) / 6;
      const radius = 2.6 + Math.sin(time * 2.2 + idx) * 0.25;
      shard.position.set(
        Math.cos(angle) * radius,
        3.2 + Math.sin(time * 2.0 + idx * 1.1) * 0.45,
        Math.sin(angle) * radius
      );
      shard.rotation.x += delta * 1.4;
      shard.rotation.y += delta * 1.8;
    });

    // Dynamic color & glow state
    if (isRestored) {
      const hue = (time * 0.18) % 1;
      const col = new THREE.Color().setHSL(hue, 0.95, 0.65);
      crystalMat.color.copy(col);
      crystalMat.emissive.copy(col);
      crystalMat.emissiveIntensity = 2.4;
      light.color.copy(col);
      light.intensity = 4.0;
    } else {
      if (crystalsCount === 0) {
        crystalMat.color.setHex(0x0284c7);
        crystalMat.emissive.setHex(0x0369a1);
        crystalMat.emissiveIntensity = 0.5;
        light.color.setHex(0x38bdf8);
        light.intensity = 1.0;
      } else if (crystalsCount === 1) {
        crystalMat.color.setHex(0x06b6d4);
        crystalMat.emissive.setHex(0x0891b2);
        crystalMat.emissiveIntensity = 1.0;
        light.color.setHex(0x06b6d4);
        light.intensity = 1.8;
      } else if (crystalsCount === 2) {
        crystalMat.color.setHex(0x10b981);
        crystalMat.emissive.setHex(0x059669);
        crystalMat.emissiveIntensity = 1.5;
        light.color.setHex(0x10b981);
        light.intensity = 2.5;
      } else if (crystalsCount >= 3) {
        crystalMat.color.setHex(0xa855f7);
        crystalMat.emissive.setHex(0x7e22ce);
        crystalMat.emissiveIntensity = 2.0;
        light.color.setHex(0xa855f7);
        light.intensity = 3.2;
      }
    }
  };

  return {
    group,
    crystal: crystalGroup,
    light,
    update,
  };
}

export function createCollectableCrystal(type: 'parkour' | 'cave' | 'waterfall') {
  const group = new THREE.Group();
  group.name = `crystal_${type}`;

  let mat = materials.crystalParkourMat;
  if (type === 'cave') mat = materials.crystalCaveMat;
  if (type === 'waterfall') mat = materials.crystalWaterfallMat;

  // Main crystal
  const mainGeo = new THREE.OctahedronGeometry(0.5, 0);
  mainGeo.scale(0.8, 1.4, 0.8);
  const mainMesh = new THREE.Mesh(mainGeo, mat);
  mainMesh.castShadow = true;
  group.add(mainMesh);

  // Satellite floating gem shards
  const subGeo = new THREE.OctahedronGeometry(0.2, 0);
  const sub1 = new THREE.Mesh(subGeo, mat);
  sub1.position.set(0.32, -0.15, 0.12);
  const sub2 = new THREE.Mesh(subGeo, mat);
  sub2.position.set(-0.28, -0.12, -0.12);
  group.add(sub1, sub2);

  const light = new THREE.PointLight(mat.color, 1.2, 6);
  group.add(light);

  const update = (delta: number) => {
    mainMesh.rotation.y += delta * 1.8;
    mainMesh.rotation.x += delta * 0.5;
    sub1.rotation.y -= delta * 2;
    sub2.rotation.z += delta * 1.5;
    group.position.y += Math.sin(Date.now() * 0.0035) * 0.003;
  };

  return { group, update };
}

export function createCollectableStar() {
  const group = new THREE.Group();
  group.name = 'star_item';

  const starMat = materials.starGold;
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.12), starMat);
  p1.rotation.z = Math.PI / 4;
  const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.12), starMat);
  group.add(p1, p2);

  const light = new THREE.PointLight(0xfacc15, 0.8, 5);
  group.add(light);

  const update = (delta: number) => {
    group.rotation.y += delta * 2.2;
    group.position.y += Math.sin(Date.now() * 0.004) * 0.002;
  };

  return { group, update };
}

export function createSecretPortal() {
  const group = new THREE.Group();
  group.name = 'secret_portal';

  // Obsidian Archway
  const archMat = new THREE.MeshStandardMaterial({ 
    color: 0x0f172a, 
    roughness: 0.35, 
    metalness: 0.85 
  });
  const goldMat = materials.goldMetal;

  const pillarGeo = new THREE.BoxGeometry(0.7, 4.0, 0.7);

  const leftPillar = new THREE.Mesh(pillarGeo, archMat);
  leftPillar.position.set(-1.6, 2.0, 0);
  leftPillar.castShadow = true;

  const rightPillar = new THREE.Mesh(pillarGeo, archMat);
  rightPillar.position.set(1.6, 2.0, 0);
  rightPillar.castShadow = true;

  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.7, 0.7), archMat);
  topBeam.position.set(0, 4.0, 0);
  topBeam.castShadow = true;

  const goldTop = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.15, 0.8), goldMat);
  goldTop.position.set(0, 4.4, 0);

  group.add(leftPillar, rightPillar, topBeam, goldTop);

  // Swirling portal vortex
  const vortexGeo = new THREE.PlaneGeometry(2.5, 3.6);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const vortex = new THREE.Mesh(vortexGeo, vortexMat);
  vortex.position.set(0, 2.0, 0);
  group.add(vortex);

  const portalLight = new THREE.PointLight(0xc084fc, 0, 10);
  portalLight.position.set(0, 2.1, 0);
  group.add(portalLight);

  let active = false;
  vortex.visible = false;

  const setActive = (isActive: boolean) => {
    active = isActive;
    vortex.visible = isActive;
    portalLight.intensity = isActive ? 2.8 : 0;
  };

  const update = (delta: number) => {
    if (!active) return;
    const time = Date.now() * 0.003;
    vortexMat.opacity = 0.75 + Math.sin(time * 3) * 0.2;
    portalLight.intensity = 2.4 + Math.sin(time * 4) * 0.8;
  };

  return { group, setActive, update };
}

export function createVoxelBirthdayCake() {
  const group = new THREE.Group();
  group.name = 'birthday_cake';

  // Base tier
  const tier1Geo = new THREE.CylinderGeometry(1.3, 1.3, 0.65, 14);
  const cakeMat = new THREE.MeshStandardMaterial({ color: 0xfdf2e9, roughness: 0.7 });
  const frostMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
  const tier1 = new THREE.Mesh(tier1Geo, cakeMat);
  tier1.position.y = 0.32;
  group.add(tier1);

  const trim1Geo = new THREE.TorusGeometry(1.3, 0.09, 6, 14);
  const trim1 = new THREE.Mesh(trim1Geo, frostMat);
  trim1.rotation.x = Math.PI / 2;
  trim1.position.y = 0.64;
  group.add(trim1);

  // Top tier
  const tier2Geo = new THREE.CylinderGeometry(0.85, 0.85, 0.55, 12);
  const tier2 = new THREE.Mesh(tier2Geo, cakeMat);
  tier2.position.y = 0.95;
  group.add(tier2);

  // Birthday candles
  const candleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

  const candlePositions = [
    [-0.35, 1.3, 0],
    [0.35, 1.3, 0],
    [0, 1.3, -0.35],
    [0, 1.3, 0.35],
  ];

  const flames: THREE.Mesh[] = [];

  candlePositions.forEach(([x, y, z]) => {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.35, 6), candleMat);
    candle.position.set(x, y, z);
    group.add(candle);

    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), flameMat);
    flame.position.set(x, y + 0.22, z);
    group.add(flame);
    flames.push(flame);
  });

  const cakeLight = new THREE.PointLight(0xf59e0b, 1.5, 6);
  cakeLight.position.y = 1.9;
  group.add(cakeLight);

  const update = (delta: number) => {
    const time = Date.now() * 0.005;
    flames.forEach((f, idx) => {
      f.scale.setScalar(0.9 + Math.sin(time * 3 + idx) * 0.2);
    });
  };

  return { group, update };
}
