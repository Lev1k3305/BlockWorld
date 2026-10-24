import * as THREE from 'three';

/**
 * Shared uniforms for stylized shaders across the game engine.
 * uTime is updated every frame in GameEngine.tick().
 */
export const shaderUniforms = {
  uTime: { value: 0 },
};

export interface StylizedTerrainOptions {
  baseColorHex?: number;
  roughness?: number;
  rootColor?: THREE.Color;
  meadowColor?: THREE.Color;
  goldenColor?: THREE.Color;
  tipColor?: THREE.Color;
  cliffColor?: THREE.Color;
}

/**
 * Creates a stylized terrain/grass shader extending MeshStandardMaterial.
 * 
 * Features:
 * - 4-stop artistic vertical gradient (Deep Loam -> Lush Emerald Meadow -> Sun-kissed Lime -> Luminous Tips)
 * - Slope-aware rock texturing: steep slopes and cliff faces smoothly blend into weathered stylized stone
 * - Procedural multi-frequency turf mottling to eliminate flat monochrome patches
 * - Animated vertex wind sway on upper grassy geometry
 * - Soft ambient sunbeam/cloud shadow dapples drifting smoothly across the island
 * - Seamless integration with Three.js PBR lighting, RoomEnvironment reflections, and soft PCF shadows
 */
export function createStylizedTerrainMaterial(options: StylizedTerrainOptions | number = 0x2e8544): THREE.MeshStandardMaterial {
  const opts: StylizedTerrainOptions = typeof options === 'number' ? { baseColorHex: options } : options;
  const baseColor = opts.baseColorHex ?? 0x2e8544;
  const roughness = opts.roughness ?? 0.78;

  const rootCol = opts.rootColor ?? new THREE.Color(0.09, 0.23, 0.12);
  const meadowCol = opts.meadowColor ?? new THREE.Color(0.18, 0.54, 0.24);
  const goldenCol = opts.goldenColor ?? new THREE.Color(0.40, 0.70, 0.20);
  const tipCol = opts.tipColor ?? new THREE.Color(0.60, 0.86, 0.30);
  const cliffCol = opts.cliffColor ?? new THREE.Color(0.28, 0.33, 0.40);

  const mat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: roughness,
    metalness: 0.05,
    flatShading: false,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shaderUniforms.uTime;
    shader.uniforms.uRootCol = { value: rootCol };
    shader.uniforms.uMeadowCol = { value: meadowCol };
    shader.uniforms.uGoldenCol = { value: goldenCol };
    shader.uniforms.uTipCol = { value: tipCol };
    shader.uniforms.uCliffCol = { value: cliffCol };

    shader.vertexShader = `
      uniform float uTime;
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
      transformed.x += windVal * 0.035 * windFactor;
      transformed.z += windVal * 0.025 * windFactor;
      
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
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // 1. Artistic 4-Stop Height-Based Meadow Gradient
      float hFactor = clamp((vWorldPosition.y + 0.6) / 3.6, 0.0, 1.0);

      vec3 grassGrad = mix(uRootCol, uMeadowCol, smoothstep(0.0, 0.35, hFactor));
      grassGrad = mix(grassGrad, uGoldenCol, smoothstep(0.35, 0.72, hFactor));
      grassGrad = mix(grassGrad, uTipCol, smoothstep(0.72, 1.0, hFactor));

      // 2. Procedural Organic Mottling (Breaks up flat surfaces into vibrant natural turf)
      float mottle1 = sin(vWorldPosition.x * 1.85) * sin(vWorldPosition.z * 1.85);
      float mottle2 = sin(vWorldPosition.x * 4.2 + 0.8) * cos(vWorldPosition.z * 4.2 + 0.4) * 0.5;
      float mottling = (mottle1 + mottle2) * 0.075;

      // 3. Slope-Aware Cliff Rock Blending
      // Surfaces pointing outward or downwards smoothly transition into weathered stylized stone
      float slope = clamp(vWorldNormal.y, 0.0, 1.0);
      vec3 combinedTerrain = mix(uCliffCol, grassGrad + mottling, smoothstep(0.35, 0.72, slope));

      // 4. Subtle Ambient Sunbeam Dapples (Soft slow drifting cloud/canopy illumination)
      float dapple = sin(vWorldPosition.x * 0.28 + uTime * 0.18) * cos(vWorldPosition.z * 0.28 + uTime * 0.14);
      combinedTerrain += vec3(0.04, 0.06, 0.02) * clamp(dapple, 0.0, 1.0);

      diffuseColor.rgb = mix(diffuseColor.rgb, combinedTerrain, 0.78);
      `
    );
  };

  return mat;
}

export const createStylizedGrassMaterial = createStylizedTerrainMaterial;

export interface StylizedWaterOptions {
  baseColorHex?: number;
  deepColor?: THREE.Color;
  midColor?: THREE.Color;
  shallowColor?: THREE.Color;
  foamColor?: THREE.Color;
  opacity?: number;
  roughness?: number;
  metalness?: number;
}

/**
 * Creates a stylized water shader extending MeshStandardMaterial.
 * 
 * Features:
 * - Smooth vertex wave animation in vertex shader (multi-harmonic ripples + vertical cascade flow)
 * - 3-tier artistic aquatic color gradient (Mystic Abyss -> Azure Lagoon -> Sunlit Turquoise)
 * - Dual-layer scrolling procedural caustics with interference wave harmonics
 * - Animated glistening wave crests and foam highlights
 * - High-specular reflections and translucent refraction
 */
export function createStylizedWaterMaterial(options?: StylizedWaterOptions): THREE.MeshStandardMaterial {
  const opts = options || {};
  const baseColor = opts.baseColorHex ?? 0x0ea5e9;
  const deepCol = opts.deepColor ?? new THREE.Color(0.02, 0.22, 0.48);
  const midCol = opts.midColor ?? new THREE.Color(0.06, 0.52, 0.76);
  const shallowCol = opts.shallowColor ?? new THREE.Color(0.20, 0.88, 0.94);
  const foamCol = opts.foamColor ?? new THREE.Color(0.92, 0.98, 1.00);

  const mat = new THREE.MeshStandardMaterial({
    color: baseColor,
    transparent: true,
    opacity: opts.opacity ?? 0.86,
    roughness: opts.roughness ?? 0.06,
    metalness: opts.metalness ?? 0.22,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shaderUniforms.uTime;
    shader.uniforms.uDeepCol = { value: deepCol };
    shader.uniforms.uMidCol = { value: midCol };
    shader.uniforms.uShallowCol = { value: shallowCol };
    shader.uniforms.uFoamCol = { value: foamCol };

    shader.vertexShader = `
      uniform float uTime;
      varying vec3 vWorldPosition;
      varying vec3 vLocalNormal;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Multi-harmonic smooth vertex wave displacement for natural water movement
      float waveMain = sin(position.x * 1.6 + uTime * 2.2) * cos(position.z * 1.6 + uTime * 1.8) * 0.045;
      float waveDetail = sin(position.x * 3.4 - uTime * 1.7) * cos(position.z * 2.8 + uTime * 1.5) * 0.022;
      float waveCross = cos((position.x + position.z) * 2.0 + uTime * 2.5) * 0.015;
      
      // For horizontal water bodies (lake, ponds): animate Y elevation
      transformed.y += (waveMain + waveDetail + waveCross);

      // For vertical waterfall surfaces: animate undulating cascading ripples
      if (abs(normal.y) < 0.4) {
        float fallRipple = sin(position.y * 3.8 - uTime * 4.6) * 0.045;
        transformed.z += fallRipple;
        transformed.x += cos(position.y * 2.4 - uTime * 3.2) * 0.02;
      }

      vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vLocalNormal = normal;
      `
    );

    shader.fragmentShader = `
      uniform float uTime;
      uniform vec3 uDeepCol;
      uniform vec3 uMidCol;
      uniform vec3 uShallowCol;
      uniform vec3 uFoamCol;
      varying vec3 vWorldPosition;
      varying vec3 vLocalNormal;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>

      // 1. Dual Scrolling Caustic Wave Interference
      vec2 p1 = vWorldPosition.xz * 0.95 + vec2(uTime * 0.15, uTime * 0.11);
      vec2 p2 = vWorldPosition.xz * 1.45 - vec2(uTime * 0.12, uTime * 0.17);
      
      // For vertical waterfalls, scroll caustics down the Y axis
      if (abs(vLocalNormal.y) < 0.4) {
        p1 = vec2(vWorldPosition.x * 1.2, vWorldPosition.y * 0.8 - uTime * 1.2);
        p2 = vec2(vWorldPosition.z * 1.2, vWorldPosition.y * 1.4 - uTime * 1.8);
      }

      float c1 = sin(p1.x * 3.2 + sin(p1.y * 2.8));
      float c2 = cos(p2.x * 3.4 + sin(p2.y * 3.1));
      float caustic = c1 * c2;
      
      // Sharp sunlit caustic cell ribbons
      float foamPattern = smoothstep(0.38, 0.84, caustic);

      // 2. Artistic 3-Stop Aquatic Depth Gradient
      float depthFactor = clamp((vWorldPosition.y + 0.6) / 1.6, 0.0, 1.0);
      vec3 waterColor = mix(uDeepCol, uMidCol, smoothstep(0.0, 0.5, depthFactor));
      waterColor = mix(waterColor, uShallowCol, smoothstep(0.5, 1.0, depthFactor));

      // 3. Blend in animated caustics & glistening foam crests
      diffuseColor.rgb = mix(waterColor, uFoamCol, foamPattern * 0.48);
      diffuseColor.a = 0.84 + foamPattern * 0.14;
      `
    );
  };

  return mat;
}

/**
 * Updates the global shader time uniform.
 */
export function updateStylizedShaderTime(elapsedTime: number) {
  shaderUniforms.uTime.value = elapsedTime;
}
