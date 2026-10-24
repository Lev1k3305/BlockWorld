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
 * - 5-stop artistic vertical height gradient (Deep Loam -> Spring Turf -> Lush Emerald -> Golden Sunshine -> Peak Flora)
 * - Slope-aware rock texturing: steep slopes and cliff faces smoothly blend into weathered stylized stone
 * - Procedural multi-frequency turf mottling to eliminate flat monochrome patches
 * - Animated dual-frequency vertex wind sway on upper grassy geometry
 * - Soft ambient sunbeam and drifting cloud shadow dapples across the island
 * - Seamless integration with Three.js PBR lighting, RoomEnvironment reflections, and PCF shadows
 */
export function createStylizedTerrainMaterial(options: StylizedTerrainOptions | number = 0x2e8544): THREE.MeshStandardMaterial {
  const opts: StylizedTerrainOptions = typeof options === 'number' ? { baseColorHex: options } : options;
  const baseColor = opts.baseColorHex ?? 0x2e8544;
  const roughness = opts.roughness ?? 0.75;

  const rootCol = opts.rootColor ?? new THREE.Color(0.08, 0.22, 0.11);
  const meadowCol = opts.meadowColor ?? new THREE.Color(0.16, 0.52, 0.22);
  const goldenCol = opts.goldenColor ?? new THREE.Color(0.38, 0.68, 0.18);
  const tipCol = opts.tipColor ?? new THREE.Color(0.58, 0.85, 0.28);
  const cliffCol = opts.cliffColor ?? new THREE.Color(0.26, 0.32, 0.38);

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
      // Enhanced dual-frequency organic wind sway for grass and canopy surfaces
      float windFactor = clamp(position.y * 0.82, 0.0, 1.0);
      float windWave1 = sin(position.x * 1.65 + uTime * 2.3) * cos(position.z * 1.45 + uTime * 1.9);
      float windWave2 = cos(position.x * 3.2 - uTime * 3.1) * sin(position.z * 2.8 + uTime * 2.5) * 0.4;
      float totalWind = (windWave1 + windWave2) * 0.042 * windFactor;

      transformed.x += totalWind;
      transformed.z += totalWind * 0.75;
      
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

      // 1. Artistic 5-Stop Height-Based Meadow Gradient
      float hFactor = clamp((vWorldPosition.y + 0.6) / 3.8, 0.0, 1.0);

      vec3 grassGrad = mix(uRootCol, uMeadowCol, smoothstep(0.0, 0.32, hFactor));
      grassGrad = mix(grassGrad, uGoldenCol, smoothstep(0.32, 0.68, hFactor));
      grassGrad = mix(grassGrad, uTipCol, smoothstep(0.68, 1.0, hFactor));

      // 2. Procedural Multi-Frequency Mottling
      float mottle1 = sin(vWorldPosition.x * 1.95) * sin(vWorldPosition.z * 1.95);
      float mottle2 = sin(vWorldPosition.x * 4.4 + 0.9) * cos(vWorldPosition.z * 4.4 + 0.5) * 0.5;
      float mottling = (mottle1 + mottle2) * 0.082;

      // 3. Slope-Aware Cliff Rock Blending
      float slope = clamp(vWorldNormal.y, 0.0, 1.0);
      vec3 combinedTerrain = mix(uCliffCol, grassGrad + mottling, smoothstep(0.32, 0.70, slope));

      // 4. Subtle Ambient Sunbeam Dapples
      float dapple = sin(vWorldPosition.x * 0.30 + uTime * 0.20) * cos(vWorldPosition.z * 0.30 + uTime * 0.15);
      combinedTerrain += vec3(0.045, 0.065, 0.025) * clamp(dapple, 0.0, 1.0);

      diffuseColor.rgb = mix(diffuseColor.rgb, combinedTerrain, 0.82);
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
 * - Smooth multi-harmonic vertex wave animation for lakes and vertical waterfalls
 * - 3-tier aquatic color gradient (Abyssal Azure -> Lagoon Turquoise -> Sunlit Aquamarine)
 * - Dual-layer scrolling caustics with interference wave ribbons
 * - Animated glistening wave crests and foam highlights
 * - High-specular reflections and translucent depth transparency
 */
export function createStylizedWaterMaterial(options?: StylizedWaterOptions): THREE.MeshStandardMaterial {
  const opts = options || {};
  const baseColor = opts.baseColorHex ?? 0x0ea5e9;
  const deepCol = opts.deepColor ?? new THREE.Color(0.02, 0.20, 0.45);
  const midCol = opts.midColor ?? new THREE.Color(0.05, 0.50, 0.74);
  const shallowCol = opts.shallowColor ?? new THREE.Color(0.18, 0.86, 0.92);
  const foamCol = opts.foamColor ?? new THREE.Color(0.94, 0.99, 1.00);

  const mat = new THREE.MeshStandardMaterial({
    color: baseColor,
    transparent: true,
    opacity: opts.opacity ?? 0.88,
    roughness: opts.roughness ?? 0.05,
    metalness: opts.metalness ?? 0.25,
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
      
      // Multi-harmonic vertex wave displacement
      float waveMain = sin(position.x * 1.75 + uTime * 2.4) * cos(position.z * 1.75 + uTime * 1.9) * 0.05;
      float waveDetail = sin(position.x * 3.6 - uTime * 1.8) * cos(position.z * 3.0 + uTime * 1.6) * 0.025;
      float waveCross = cos((position.x + position.z) * 2.2 + uTime * 2.7) * 0.018;
      
      // Horizontal water (lake, pond): animate Y elevation
      transformed.y += (waveMain + waveDetail + waveCross);

      // Vertical waterfall surfaces: animate cascading ripples
      if (abs(normal.y) < 0.4) {
        float fallRipple = sin(position.y * 4.0 - uTime * 4.8) * 0.05;
        transformed.z += fallRipple;
        transformed.x += cos(position.y * 2.6 - uTime * 3.4) * 0.022;
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
      vec2 p1 = vWorldPosition.xz * 1.0 + vec2(uTime * 0.16, uTime * 0.12);
      vec2 p2 = vWorldPosition.xz * 1.5 - vec2(uTime * 0.13, uTime * 0.18);
      
      if (abs(vLocalNormal.y) < 0.4) {
        p1 = vec2(vWorldPosition.x * 1.25, vWorldPosition.y * 0.85 - uTime * 1.3);
        p2 = vec2(vWorldPosition.z * 1.25, vWorldPosition.y * 1.45 - uTime * 1.9);
      }

      float c1 = sin(p1.x * 3.3 + sin(p1.y * 2.9));
      float c2 = cos(p2.x * 3.5 + sin(p2.y * 3.2));
      float caustic = c1 * c2;
      
      float foamPattern = smoothstep(0.36, 0.82, caustic);

      // 2. Artistic 3-Stop Aquatic Depth Gradient
      float depthFactor = clamp((vWorldPosition.y + 0.6) / 1.6, 0.0, 1.0);
      vec3 waterColor = mix(uDeepCol, uMidCol, smoothstep(0.0, 0.5, depthFactor));
      waterColor = mix(waterColor, uShallowCol, smoothstep(0.5, 1.0, depthFactor));

      // 3. Blend in animated caustics & glistening foam crests
      diffuseColor.rgb = mix(waterColor, uFoamCol, foamPattern * 0.50);
      diffuseColor.a = 0.85 + foamPattern * 0.13;
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
