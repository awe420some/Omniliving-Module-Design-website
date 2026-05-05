'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, type ModuleDef } from '@/lib/store';

/* ─── Default module definitions ─── */
const DEFAULT_MODULE_DEFS: ModuleDef[] = [
  { id: 'ground-0', label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  { id: 'ground-1', label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
  { id: 'ground-2', label: 'Küchenmodul', type: 'kueche', color: '#3a3535', windowColor: '#ffffdd', emissiveColor: '#ffdd66' },
  { id: 'upper-0', label: 'Badmodul', type: 'bad', color: '#2d3a4a', windowColor: '#ddeeff', emissiveColor: '#88bbff' },
  { id: 'upper-1', label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  { id: 'upper-2', label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
];

/* ─── Container dimensions (improved proportions) ─── */
const CW = 3.0;
const CH = 1.3;
const CD = 1.2;
const GAP = 0.08;

/* ─── Smooth step utility ─── */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/* ─── Get module positions ─── */
function getModulePositions() {
  const totalW = CW * 3 + GAP * 2;
  const startX = -totalW / 2 + CW / 2;

  return {
    ground: [
      { x: startX, y: CH / 2, z: 0 },
      { x: startX + CW + GAP, y: CH / 2, z: 0 },
      { x: startX + (CW + GAP) * 2, y: CH / 2, z: 0 },
    ],
    upper: [
      { x: startX, y: CH + CH / 2 + GAP, z: 0 },
      { x: startX + CW + GAP, y: CH + CH / 2 + GAP, z: 0 },
      { x: startX + (CW + GAP) * 2, y: CH + CH / 2 + GAP, z: 0 },
    ],
  };
}

/* ═══════════════════════════════════════
   GLSL Section Cut Shader (inline)
   ═══════════════════════════════════════ */
const sectionCutVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const sectionCutFragmentShader = `
  uniform vec2 uCursor;
  uniform float uRadius;
  uniform float uActive;
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform float uOpacity;
  uniform float uMetalness;
  uniform float uRoughness;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }

  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265 * denom * denom;
    return num / max(denom, 0.001);
  }

  float geometrySmith(float NdotV, float NdotL, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    float ggx1 = NdotV / (NdotV * (1.0 - k) + k);
    float ggx2 = NdotL / (NdotL * (1.0 - k) + k);
    return ggx1 * ggx2;
  }

  void main() {
    float dist = distance(vWorldPosition.xz, uCursor);
    float noise = snoise(vWorldPosition * 0.5 + uTime * 0.2) * 0.3;
    float cutRadius = uRadius + noise;
    float cut = smoothstep(cutRadius, cutRadius - 0.5, dist);
    float alpha = uOpacity * (1.0 - cut * uActive);

    vec3 albedo = uBaseColor;
    float metallic = uMetalness;
    float rough = uRoughness;
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);

    vec3 lightPositions[3];
    vec3 lightColors[3];
    lightPositions[0] = vec3(8.0, 12.0, 5.0);
    lightColors[0] = vec3(1.0, 0.98, 0.95) * 1.5;
    lightPositions[1] = vec3(-5.0, 4.0, 3.0);
    lightColors[1] = vec3(0.79, 0.66, 0.43) * 1.0;
    lightPositions[2] = vec3(5.0, 2.0, 4.0);
    lightColors[2] = vec3(0.29, 0.62, 1.0) * 0.5;

    vec3 F0 = mix(vec3(0.04), albedo, metallic);
    vec3 Lo = vec3(0.0);

    for (int i = 0; i < 3; i++) {
      vec3 L = normalize(lightPositions[i] - vWorldPosition);
      vec3 H = normalize(V + L);
      float lightDist = length(lightPositions[i] - vWorldPosition);
      float attenuation = 1.0 / (1.0 + 0.007 * lightDist + 0.0017 * lightDist * lightDist);
      vec3 radiance = lightColors[i] * attenuation;
      float NDF = distributionGGX(N, H, rough);
      float G = geometrySmith(max(dot(N, V), 0.0), max(dot(N, L), 0.0), rough);
      vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
      vec3 numerator = NDF * G * F;
      float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
      vec3 specular = numerator / denominator;
      vec3 kS = F;
      vec3 kD = (vec3(1.0) - kS) * (1.0 - metallic);
      float NdotL = max(dot(N, L), 0.0);
      Lo += (kD * albedo / 3.14159265 + specular) * radiance * NdotL;
    }

    vec3 ambient = vec3(0.08, 0.07, 0.12) * albedo;
    vec3 color = ambient + Lo;

    float corrugation = sin(vUv.y * 40.0) * 0.02 + 1.0;
    color *= corrugation;

    float rimWidth = 0.25;
    float rim = smoothstep(cutRadius - rimWidth, cutRadius, dist)
              * (1.0 - smoothstep(cutRadius, cutRadius + 0.05, dist));
    rim *= uActive;
    vec3 rimColor = vec3(0.788, 0.663, 0.431);
    float pulse = 0.85 + 0.15 * sin(uTime * 3.0);
    color = mix(color, rimColor * pulse, rim * 0.7);

    float glowRim = smoothstep(cutRadius - rimWidth * 2.0, cutRadius, dist)
                  * (1.0 - smoothstep(cutRadius, cutRadius + rimWidth, dist));
    color += rimColor * glowRim * 0.4 * uActive * pulse;

    float innerGlow = smoothstep(cutRadius - 0.15, cutRadius - 0.05, dist)
                    * (1.0 - smoothstep(cutRadius - 0.05, cutRadius, dist));
    color += vec3(1.0, 0.85, 0.5) * innerGlow * 0.5 * uActive * pulse;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

/* ─── Module-level uniform sets (mutable, avoids ESLint immutability issues) ─── */
const MODULE_UNIFORMS = DEFAULT_MODULE_DEFS.map((def) => ({
  uCursor: { value: new THREE.Vector2(0, 0) },
  uRadius: { value: 2.0 },
  uActive: { value: 0 },
  uTime: { value: 0 },
  uBaseColor: { value: new THREE.Color(def.color) },
  uOpacity: { value: 1.0 },
  uMetalness: { value: 0.75 },
  uRoughness: { value: 0.35 },
}));

/* ═══════════════════════════════════════
   Single Container Module
   ═══════════════════════════════════════ */
function ContainerModule({
  def,
  position,
  visible,
  targetOpacity,
  isSectionCut,
  cursorWorldPos,
  sectionCutRadius,
  isSelected,
  moduleIndex,
}: {
  def: ModuleDef;
  position: [number, number, number];
  visible: boolean;
  targetOpacity: number;
  isSectionCut: boolean;
  cursorWorldPos: [number, number];
  sectionCutRadius: number;
  isSelected: boolean;
  moduleIndex: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);

  // Material refs for animated properties
  const windowMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const interiorMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const cornerMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const roofMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const doorMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Emissive color for interior warm glow
  const emissiveColor = useMemo(() => new THREE.Color(def.emissiveColor), [def.emissiveColor]);

  /* Animate opacity & section cut */
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const u = MODULE_UNIFORMS[moduleIndex];

    const target = visible ? targetOpacity : 0;
    opacityRef.current += (target - opacityRef.current) * 0.06;

    // Update module-level uniforms
    u.uOpacity.value = opacityRef.current;
    u.uCursor.value.set(cursorWorldPos[0], cursorWorldPos[1]);

    // Update active state and time
    const targetActive = isSectionCut ? 1 : 0;
    const currentActive = u.uActive.value as number;
    u.uActive.value = currentActive + (targetActive - currentActive) * 0.05;
    u.uTime.value = clock.getElapsedTime();

    // Update base color if def changed
    u.uBaseColor.value.set(def.color);

    // Corner posts opacity
    if (cornerMatRef.current) {
      cornerMatRef.current.opacity = opacityRef.current;
    }

    // Window opacity
    if (windowMatRef.current) {
      windowMatRef.current.opacity = Math.min(opacityRef.current * 1.2, 1);
    }

    // Roof opacity
    if (roofMatRef.current) {
      roofMatRef.current.opacity = opacityRef.current;
    }

    // Door opacity
    if (doorMatRef.current) {
      doorMatRef.current.opacity = opacityRef.current;
    }

    // Interior glow - brighter when section cut or selected
    if (interiorMatRef.current) {
      const targetIntensity = isSelected ? 0.5 : (isSectionCut ? 0.3 : 0.05);
      interiorMatRef.current.emissiveIntensity += (targetIntensity - interiorMatRef.current.emissiveIntensity) * 0.06;
    }
  });

  /* Window configurations per module type */
  const windowConfigs = useMemo(() => {
    const configs: { pos: [number, number, number]; size: [number, number]; isFrosted?: boolean }[] = [];
    if (def.type === 'wohnen') {
      configs.push(
        { pos: [-0.55, 0.18, CD / 2 + 0.005], size: [0.65, 0.5] },
        { pos: [0.55, 0.18, CD / 2 + 0.005], size: [0.65, 0.5] },
        { pos: [CW / 2 + 0.005, 0.18, 0.1], size: [0.45, 0.4] },
      );
    } else if (def.type === 'schlafen') {
      configs.push(
        { pos: [-0.4, 0.18, CD / 2 + 0.005], size: [0.45, 0.38] },
        { pos: [0.5, 0.18, CD / 2 + 0.005], size: [0.45, 0.38] },
      );
    } else if (def.type === 'kueche') {
      configs.push(
        { pos: [0.0, 0.18, CD / 2 + 0.005], size: [0.6, 0.42] },
      );
    } else {
      configs.push(
        { pos: [0.3, 0.18, CD / 2 + 0.005], size: [0.3, 0.3], isFrosted: true },
      );
    }
    return configs;
  }, [def.type]);

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Main body - uses section cut shader */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CW, CH, CD]} />
        <shaderMaterial
          vertexShader={sectionCutVertexShader}
          fragmentShader={sectionCutFragmentShader}
          uniforms={MODULE_UNIFORMS[moduleIndex]}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Corrugation ridges on front face */}
      {Array.from({ length: 12 }).map((_, i) => {
        const y = -CH / 2 + 0.06 + (i * (CH - 0.12)) / 11;
        return (
          <mesh key={`corr-front-${i}`} position={[0, y, CD / 2 + 0.002]}>
            <boxGeometry args={[CW - 0.14, 0.012, 0.004]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Corrugation ridges on back face */}
      {Array.from({ length: 12 }).map((_, i) => {
        const y = -CH / 2 + 0.06 + (i * (CH - 0.12)) / 11;
        return (
          <mesh key={`corr-back-${i}`} position={[0, y, -CD / 2 - 0.002]}>
            <boxGeometry args={[CW - 0.14, 0.012, 0.004]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Floor (interior) */}
      <mesh position={[0, -CH / 2 + 0.02, 0]}>
        <boxGeometry args={[CW - 0.1, 0.02, CD - 0.1]} />
        <meshStandardMaterial
          color="#1a1510"
          emissive={emissiveColor}
          emissiveIntensity={0.05}
          metalness={0}
          roughness={0.9}
          ref={interiorMatRef}
        />
      </mesh>

      {/* Interior furniture */}
      <InteriorFurniture type={def.type} emissiveColor={emissiveColor} />

      {/* Windows with frames */}
      {windowConfigs.map((wc, i) => (
        <group key={`win-${i}`}>
          {/* Window frame - top */}
          <mesh position={[wc.pos[0], wc.pos[1] + wc.size[1] / 2 + 0.012, wc.pos[2]]}>
            <boxGeometry args={[wc.size[0] + 0.04, 0.024, 0.015]} />
            <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Window frame - bottom */}
          <mesh position={[wc.pos[0], wc.pos[1] - wc.size[1] / 2 - 0.012, wc.pos[2]]}>
            <boxGeometry args={[wc.size[0] + 0.04, 0.024, 0.015]} />
            <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Window frame - left */}
          <mesh position={[wc.pos[0] - wc.size[0] / 2 - 0.012, wc.pos[1], wc.pos[2]]}>
            <boxGeometry args={[0.024, wc.size[1] + 0.04, 0.015]} />
            <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Window frame - right */}
          <mesh position={[wc.pos[0] + wc.size[0] / 2 + 0.012, wc.pos[1], wc.pos[2]]}>
            <boxGeometry args={[0.024, wc.size[1] + 0.04, 0.015]} />
            <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Glass pane */}
          <mesh position={wc.pos}>
            <planeGeometry args={wc.size} />
            <meshPhysicalMaterial
              color={wc.isFrosted ? '#e0e8f0' : '#cce5ff'}
              transmission={wc.isFrosted ? 0.5 : 0.9}
              roughness={wc.isFrosted ? 0.6 : 0.05}
              thickness={0.02}
              ior={1.5}
              metalness={0}
              transparent
              opacity={0}
              ref={windowMatRef}
            />
          </mesh>
        </group>
      ))}

      {/* Corner posts - galvanized steel */}
      {[
        [-CW / 2 - 0.01, 0, -CD / 2 - 0.01],
        [CW / 2 + 0.01, 0, -CD / 2 - 0.01],
        [-CW / 2 - 0.01, 0, CD / 2 + 0.01],
        [CW / 2 + 0.01, 0, CD / 2 + 0.01],
      ].map((pos, i) => (
        <mesh key={`corner-${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.07, CH + 0.02, 0.07]} />
          <meshStandardMaterial
            color="#8a8a8a"
            metalness={0.95}
            roughness={0.15}
            transparent
            opacity={0}
            ref={cornerMatRef}
          />
        </mesh>
      ))}

      {/* Roof element - standing seam metal */}
      <mesh position={[0, CH / 2 + 0.025, -0.01]} castShadow>
        <boxGeometry args={[CW + 0.06, 0.05, CD + 0.06]} />
        <meshStandardMaterial
          color="#2d4a3e"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0}
          ref={roofMatRef}
        />
      </mesh>

      {/* Standing seam ridges on roof */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = -CW / 2 + 0.15 + (i * (CW - 0.1)) / 6;
        return (
          <mesh key={`seam-${i}`} position={[x, CH / 2 + 0.055, -0.01]}>
            <boxGeometry args={[0.015, 0.015, CD + 0.04]} />
            <meshStandardMaterial color="#1a3028" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}

      {/* Door */}
      {(def.type === 'wohnen' || def.type === 'schlafen') && (
        <group>
          <mesh position={[-CW / 2 + 0.3, -0.08, CD / 2 + 0.005]}>
            <planeGeometry args={[0.48, 0.8]} />
            <meshStandardMaterial
              color="#444444"
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={0}
              ref={doorMatRef}
            />
          </mesh>
          {/* Door handle */}
          <mesh position={[-CW / 2 + 0.12, -0.08, CD / 2 + 0.015]}>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
            <meshStandardMaterial color="#c9a96e" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* Kitchen ventilation hood on roof */}
      {def.type === 'kueche' && (
        <mesh position={[0.4, CH / 2 + 0.12, -0.2]} castShadow>
          <boxGeometry args={[0.25, 0.14, 0.2]} />
          <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.3} />
        </mesh>
      )}

      {/* Bolt/rivet details at corners */}
      {[
        [-CW / 2, -CH / 2 + 0.06, -CD / 2],
        [CW / 2, -CH / 2 + 0.06, -CD / 2],
        [-CW / 2, -CH / 2 + 0.06, CD / 2],
        [CW / 2, -CH / 2 + 0.06, CD / 2],
        [-CW / 2, CH / 2 - 0.06, -CD / 2],
        [CW / 2, CH / 2 - 0.06, -CD / 2],
        [-CW / 2, CH / 2 - 0.06, CD / 2],
        [CW / 2, CH / 2 - 0.06, CD / 2],
      ].map((pos, i) => (
        <mesh key={`bolt-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#999999" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════
   Interior Furniture - Enhanced
   ═══════════════════════════════════════ */
function InteriorFurniture({ type, emissiveColor }: { type: string; emissiveColor: THREE.Color }) {
  const furnitureMat = useMemo(() => ({
    color: '#2a2520',
    emissive: emissiveColor,
    emissiveIntensity: 0.1,
    metalness: 0.1,
    roughness: 0.8,
    transparent: true,
    opacity: 0.85,
  }), [emissiveColor]);

  const accentMat = useMemo(() => ({
    color: '#3d3530',
    emissive: emissiveColor,
    emissiveIntensity: 0.15,
    metalness: 0.05,
    roughness: 0.7,
    transparent: true,
    opacity: 0.85,
  }), [emissiveColor]);

  const woodMat = useMemo(() => ({
    color: '#4a3525',
    emissive: '#443322',
    emissiveIntensity: 0.08,
    metalness: 0.05,
    roughness: 0.85,
    transparent: true,
    opacity: 0.85,
  }), []);

  const whiteMat = useMemo(() => ({
    color: '#e8e8e8',
    emissive: '#ffffff',
    emissiveIntensity: 0.05,
    metalness: 0.0,
    roughness: 0.5,
    transparent: true,
    opacity: 0.85,
  }), []);

  if (type === 'wohnen') {
    return (
      <group position={[0, -CH / 2 + 0.15, 0]}>
        {/* L-shaped sofa */}
        <mesh position={[-0.5, 0.05, -0.15]}>
          <boxGeometry args={[0.9, 0.22, 0.4]} />
          <meshStandardMaterial {...furnitureMat} />
        </mesh>
        {/* Sofa back */}
        <mesh position={[-0.5, 0.2, -0.32]}>
          <boxGeometry args={[0.9, 0.15, 0.08]} />
          <meshStandardMaterial {...furnitureMat} />
        </mesh>
        {/* Sofa L-extension */}
        <mesh position={[-0.88, 0.05, 0.05]}>
          <boxGeometry args={[0.15, 0.22, 0.5]} />
          <meshStandardMaterial {...furnitureMat} />
        </mesh>
        {/* Coffee table */}
        <mesh position={[-0.3, 0.02, 0.15]}>
          <boxGeometry args={[0.45, 0.06, 0.3]} />
          <meshStandardMaterial {...woodMat} />
        </mesh>
        {/* TV stand on back wall */}
        <mesh position={[0.6, 0.12, -0.35]}>
          <boxGeometry args={[0.6, 0.08, 0.2]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
        {/* TV screen */}
        <mesh position={[0.6, 0.25, -0.38]}>
          <boxGeometry args={[0.5, 0.3, 0.02]} />
          <meshStandardMaterial color="#111111" emissive="#223344" emissiveIntensity={0.2} metalness={0.3} roughness={0.5} transparent opacity={0.9} />
        </mesh>
      </group>
    );
  }

  if (type === 'schlafen') {
    return (
      <group position={[0, -CH / 2 + 0.12, 0]}>
        {/* Bed */}
        <mesh position={[0.2, 0.04, 0.0]}>
          <boxGeometry args={[1.0, 0.14, 0.65]} />
          <meshStandardMaterial {...furnitureMat} />
        </mesh>
        {/* Bed headboard */}
        <mesh position={[-0.25, 0.15, 0.0]}>
          <boxGeometry args={[0.06, 0.3, 0.65]} />
          <meshStandardMaterial {...woodMat} />
        </mesh>
        {/* Pillows */}
        <mesh position={[-0.15, 0.14, -0.1]}>
          <boxGeometry args={[0.2, 0.06, 0.25]} />
          <meshStandardMaterial {...whiteMat} />
        </mesh>
        <mesh position={[-0.15, 0.14, 0.12]}>
          <boxGeometry args={[0.2, 0.06, 0.25]} />
          <meshStandardMaterial {...whiteMat} />
        </mesh>
        {/* Nightstand */}
        <mesh position={[-0.25, 0.06, 0.42]}>
          <boxGeometry args={[0.2, 0.12, 0.2]} />
          <meshStandardMaterial {...woodMat} />
        </mesh>
        {/* Wardrobe */}
        <mesh position={[0.6, 0.2, -0.32]}>
          <boxGeometry args={[0.6, 0.5, 0.25]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
      </group>
    );
  }

  if (type === 'kueche') {
    return (
      <group position={[0, -CH / 2 + 0.15, 0]}>
        {/* L-shaped counter */}
        <mesh position={[0.3, 0.08, -0.25]}>
          <boxGeometry args={[1.2, 0.18, 0.35]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
        {/* Counter L-extension */}
        <mesh position={[0.85, 0.08, 0.0]}>
          <boxGeometry args={[0.3, 0.18, 0.6]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
        {/* Counter top */}
        <mesh position={[0.3, 0.19, -0.25]}>
          <boxGeometry args={[1.22, 0.02, 0.37]} />
          <meshStandardMaterial {...whiteMat} />
        </mesh>
        {/* Upper cabinets */}
        <mesh position={[0.2, 0.38, -0.35]}>
          <boxGeometry args={[0.8, 0.25, 0.15]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
        {/* Sink */}
        <mesh position={[0.0, 0.2, -0.25]}>
          <boxGeometry args={[0.25, 0.03, 0.2]} />
          <meshStandardMaterial color="#aabbcc" metalness={0.6} roughness={0.2} transparent opacity={0.85} />
        </mesh>
      </group>
    );
  }

  // Badmodul
  return (
    <group position={[0, -CH / 2 + 0.1, 0]}>
      {/* Shower glass partition */}
      <mesh position={[-0.6, 0.2, -0.2]}>
        <boxGeometry args={[0.55, 0.5, 0.02]} />
        <meshStandardMaterial color="#cce5ff" transmission={0.7} roughness={0.1} metalness={0} transparent opacity={0.5} />
      </mesh>
      {/* Shower base */}
      <mesh position={[-0.6, 0.0, -0.05]}>
        <boxGeometry args={[0.55, 0.02, 0.5]} />
        <meshStandardMaterial color="#dddddd" metalness={0.05} roughness={0.7} transparent opacity={0.85} />
      </mesh>
      {/* Toilet */}
      <mesh position={[0.5, 0.04, -0.25]}>
        <boxGeometry args={[0.2, 0.12, 0.3]} />
        <meshStandardMaterial {...whiteMat} />
      </mesh>
      {/* Toilet tank */}
      <mesh position={[0.5, 0.15, -0.38]}>
        <boxGeometry args={[0.2, 0.2, 0.06]} />
        <meshStandardMaterial {...whiteMat} />
      </mesh>
      {/* Vanity */}
      <mesh position={[0.5, 0.08, 0.25]}>
        <boxGeometry args={[0.5, 0.12, 0.25]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>
      {/* Vanity top */}
      <mesh position={[0.5, 0.15, 0.25]}>
        <boxGeometry args={[0.52, 0.02, 0.27]} />
        <meshStandardMaterial {...whiteMat} />
      </mesh>
      {/* Mirror */}
      <mesh position={[0.5, 0.32, 0.35]}>
        <boxGeometry args={[0.4, 0.25, 0.01]} />
        <meshStandardMaterial color="#aaccee" metalness={0.9} roughness={0.05} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════
   Connection Details Between Modules
   ═══════════════════════════════════════ */
function ConnectionDetails({ visible }: { visible: boolean }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const sealRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (!matRef.current || !sealRef.current) return;
    const target = visible ? 1 : 0;
    matRef.current.opacity += (target - matRef.current.opacity) * 0.06;
    sealRef.current.opacity += (target - sealRef.current.opacity) * 0.06;
  });

  const totalW = CW * 3 + GAP * 2;
  const startX = -totalW / 2 + CW / 2;
  const positions = getModulePositions();

  return (
    <group>
      {/* Connection plates between ground modules */}
      {[0, 1].map((i) => {
        const x = startX + CW * (i + 1) + GAP * (i + 0.5);
        return (
          <group key={`conn-ground-${i}`}>
            <mesh position={[x, positions.ground[0].y, 0]}>
              <boxGeometry args={[GAP + 0.06, CH * 0.3, CD * 0.8]} />
              <meshStandardMaterial
                ref={matRef}
                color="#777777"
                metalness={0.85}
                roughness={0.2}
                transparent
                opacity={0}
              />
            </mesh>
            <mesh position={[x, positions.ground[0].y - CH / 2 + 0.03, 0]}>
              <boxGeometry args={[0.02, 0.02, CD + 0.1]} />
              <meshStandardMaterial
                ref={sealRef}
                color="#333333"
                metalness={0.1}
                roughness={0.9}
                transparent
                opacity={0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Connection plates between upper and ground */}
      {[0, 1, 2].map((i) => {
        const x = positions.ground[i].x;
        const y = positions.upper[i].y - CH / 2;
        return (
          <group key={`conn-stack-${i}`}>
            <mesh position={[x, y - GAP / 2, 0]}>
              <boxGeometry args={[CW * 0.6, 0.02, CD * 0.6]} />
              <meshStandardMaterial
                color="#777777"
                metalness={0.85}
                roughness={0.2}
                transparent
                opacity={visible ? 0.8 : 0}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════
   Foundation slab
   ═══════════════════════════════════════ */
function Foundation({ visible }: { visible: boolean }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const opacityRef = useRef(0);

  useFrame(() => {
    if (!matRef.current) return;
    const target = visible ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * 0.08;
    matRef.current.opacity = opacityRef.current;
  });

  return (
    <mesh position={[0, 0.02, 0]} receiveShadow>
      <boxGeometry args={[CW * 3 + GAP * 2 + 0.8, 0.06, CD + 0.6]} />
      <meshStandardMaterial
        ref={matRef}
        color="#808080"
        roughness={0.95}
        metalness={0.05}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════
   Roof elements
   ═══════════════════════════════════════ */
function Roof({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const opacityRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current || !matRef.current) return;
    const target = visible ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * 0.06;
    matRef.current.opacity = opacityRef.current;

    const targetY = CH * 2 + GAP + CH / 2 + 0.05;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
  });

  return (
    <group ref={groupRef} position={[0, 10, 0]}>
      <mesh castShadow>
        <boxGeometry args={[CW * 3 + GAP * 2 + 0.4, 0.08, CD + 0.3]} />
        <meshStandardMaterial
          ref={matRef}
          color="#2d4a3e"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0}
        />
      </mesh>
      {/* Standing seam ridges on main roof */}
      {Array.from({ length: 9 }).map((_, i) => {
        const totalW = CW * 3 + GAP * 2 + 0.3;
        const x = -totalW / 2 + 0.2 + (i * (totalW - 0.2)) / 8;
        return (
          <mesh key={`roof-seam-${i}`} position={[x, 0.045, 0]}>
            <boxGeometry args={[0.02, 0.02, CD + 0.2]} />
            <meshStandardMaterial color="#1a3028" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════
   Balcony/Terrace for upper floor
   ═══════════════════════════════════════ */
function Balcony({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = visible ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * 0.06;
    groupRef.current.visible = opacityRef.current > 0.01;
  });

  const positions = getModulePositions();
  const balconyX = positions.upper[1].x;
  const balconyY = positions.upper[1].y - CH / 2;
  const railingHeight = 0.4;

  return (
    <group ref={groupRef} position={[balconyX, balconyY, CD / 2 + 0.3]}>
      {/* Balcony floor */}
      <mesh position={[0, -0.02, 0.3]}>
        <boxGeometry args={[CW * 0.8, 0.03, 0.7]} />
        <meshStandardMaterial color="#5a4a3a" metalness={0.05} roughness={0.8} />
      </mesh>

      {/* Floor planks */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`plank-${i}`} position={[0, 0.0, 0.05 + i * 0.13]}>
          <boxGeometry args={[CW * 0.75, 0.01, 0.1]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#6a5a4a' : '#5a4a3a'}
            metalness={0.05}
            roughness={0.85}
          />
        </mesh>
      ))}

      {/* Front railing */}
      <mesh position={[0, railingHeight / 2, 0.65]}>
        <boxGeometry args={[CW * 0.8, 0.02, 0.02]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.04, 0.65]}>
        <boxGeometry args={[CW * 0.8, 0.02, 0.02]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Railing vertical bars */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`rail-${i}`} position={[-CW * 0.35 + i * (CW * 0.7 / 6), railingHeight / 2, 0.65]}>
          <cylinderGeometry args={[0.008, 0.008, railingHeight, 6]} />
          <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Side railings */}
      <mesh position={[-CW * 0.38, railingHeight / 2, 0.3]}>
        <boxGeometry args={[0.02, 0.02, 0.7]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[CW * 0.38, railingHeight / 2, 0.3]}>
        <boxGeometry args={[0.02, 0.02, 0.7]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════
   Ground with grid and landscape
   ═══════════════════════════════════════ */
function Ground() {
  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0c0c18" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[30, 30, '#1a1a2e', '#111122']}
        position={[0, -0.01, 0]}
      />

      {/* Concrete pathway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, CD + 0.8]}>
        <planeGeometry args={[0.8, 2.5]} />
        <meshStandardMaterial color="#505050" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Small landscape bushes */}
      {[
        [-4.5, 0.15, 2.5],
        [4.5, 0.12, 2.0],
        [-5.0, 0.1, -1.5],
        [5.2, 0.18, -0.5],
        [-3.8, 0.08, 3.5],
        [3.5, 0.14, 3.0],
      ].map((pos, i) => (
        <mesh key={`bush-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[pos[1] * 1.2, 8, 6]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL((130 + i * 10) / 360, (30 + i * 5) / 100, (15 + i * 3) / 100)}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════
   Ambient Particles
   ═══════════════════════════════════════ */
function AmbientParticles({ intensity }: { intensity: number }) {
  return (
    <Sparkles
      count={40}
      scale={[12, 6, 8]}
      size={1.5}
      speed={0.3}
      opacity={intensity * 0.3}
      color="#c9a96e"
    />
  );
}

/* ═══════════════════════════════════════
   MAIN: ModularBuilding
   ═══════════════════════════════════════ */
export default function ModularBuilding() {
  const scrollProgress = useAppStore((s) => s.scrollProgress);
  const selectedModules = useAppStore((s) => s.selectedModules);
  const isSectionCutActive = useAppStore((s) => s.isSectionCutActive);
  const cursorPosition = useAppStore((s) => s.cursorPosition);
  const experienceMode = useAppStore((s) => s.experienceMode);
  const moduleAssignments = useAppStore((s) => s.moduleAssignments);

  const positions = useMemo(() => getModulePositions(), []);
  const groupRef = useRef<THREE.Group>(null);

  /* Get effective module def */
  const getEffectiveDef = useMemo(() => {
    return (index: number): ModuleDef => {
      const defaultDef = DEFAULT_MODULE_DEFS[index];
      const positionId = defaultDef.id;
      return moduleAssignments[positionId] || defaultDef;
    };
  }, [moduleAssignments]);

  /* Derive building phase from scroll progress */
  const phase = useMemo(() => {
    if (experienceMode === 'hero') return 0;
    if (experienceMode === 'configurator') return 5;
    return Math.min(5, Math.floor(scrollProgress * 6));
  }, [scrollProgress, experienceMode]);

  /* Camera animation */
  const { camera } = useThree();
  const cameraTargetRef = useRef(new THREE.Vector3(0, 2, 10));
  const cameraLookAtRef = useRef(new THREE.Vector3(0, 1, 0));

  useFrame(() => {
    let targetPos: THREE.Vector3;
    let lookAt: THREE.Vector3;

    if (experienceMode === 'hero') {
      const time = Date.now() * 0.0002;
      targetPos = new THREE.Vector3(
        Math.sin(time) * 8,
        3.5 + Math.sin(time * 0.7) * 0.8,
        Math.cos(time) * 8
      );
      lookAt = new THREE.Vector3(0, 1.2, 0);
    } else if (experienceMode === 'building') {
      const buildProgress = Math.min(1, scrollProgress / 0.7);
      targetPos = new THREE.Vector3(
        6 + buildProgress * 1,
        3 + buildProgress * 1.5,
        8 - buildProgress * 1
      );
      lookAt = new THREE.Vector3(0, 1.0 + buildProgress * 0.5, 0);
    } else if (experienceMode === 'sectioncut') {
      targetPos = new THREE.Vector3(3.5, 3, 5);
      lookAt = new THREE.Vector3(0, 1.2, 0);
    } else {
      const time = Date.now() * 0.00015;
      const mx = (cursorPosition.x - 0.5) * 2;
      targetPos = new THREE.Vector3(
        5 + Math.sin(time) * 2 + mx * 1.5,
        3 + (cursorPosition.y - 0.5) * 1,
        7 + Math.cos(time) * 1.5
      );
      lookAt = new THREE.Vector3(0, 1.2, 0);
    }

    cameraTargetRef.current.lerp(targetPos, 0.025);
    cameraLookAtRef.current.lerp(lookAt, 0.025);
    camera.position.copy(cameraTargetRef.current);
    camera.lookAt(cameraLookAtRef.current);

    if (groupRef.current) {
      if (experienceMode === 'configurator') {
        const targetRotY = Math.sin(Date.now() * 0.00015) * 0.15;
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.02;
      } else if (experienceMode === 'hero') {
        const targetRotY = Math.sin(Date.now() * 0.0001) * 0.05;
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.01;
      } else {
        groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.02;
      }
    }
  });

  /* Section cut cursor world position */
  const cursorWorld: [number, number] = useMemo(() => {
    const worldX = (cursorPosition.x - 0.5) * 8;
    const worldY = cursorPosition.y * 3;
    return [worldX, worldY];
  }, [cursorPosition]);

  /* Module visibility */
  const groundModules = useMemo(() => {
    return [0, 1, 2].map((i) => ({
      visible: phase >= i + 1,
      pos: positions.ground[i],
      def: getEffectiveDef(i),
      index: i,
    }));
  }, [phase, positions, getEffectiveDef]);

  const upperModules = useMemo(() => {
    return [0, 1, 2].map((i) => ({
      visible: phase >= 4,
      pos: positions.upper[i],
      def: getEffectiveDef(3 + i),
      index: i,
    }));
  }, [phase, positions, getEffectiveDef]);

  const roofVisible = phase >= 5;
  const connectionVisible = phase >= 3;
  const particleIntensity = experienceMode === 'hero' ? 1 : (experienceMode === 'sectioncut' ? 0.4 : 0.6);

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.25} color="#1a1a3e" />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />
      <pointLight position={[-5, 4, 3]} intensity={1.0} color="#c9a96e" distance={15} />
      <pointLight position={[5, 2, 4]} intensity={0.5} color="#4a9eff" distance={12} />
      <pointLight position={[0, 1.5, 0.5]} intensity={0.3} color="#ffcc88" distance={8} />

      <Ground />
      <Foundation visible={phase >= 0} />

      {groundModules.map((m) => (
        <AnimatedModule
          key={`g-${m.index}`}
          def={m.def}
          targetPos={[m.pos.x, m.pos.y, m.pos.z] as [number, number, number]}
          enterFrom={m.index % 2 === 0 ? 'left' : 'right'}
          visible={m.visible}
          isSectionCut={isSectionCutActive}
          cursorWorldPos={cursorWorld}
          sectionCutRadius={2.0}
          isSelected={selectedModules.includes(m.def.id)}
          moduleIndex={m.index}
        />
      ))}

      {upperModules.map((m) => (
        <AnimatedModule
          key={`u-${m.index}`}
          def={m.def}
          targetPos={[m.pos.x, m.pos.y, m.pos.z] as [number, number, number]}
          enterFrom="top"
          visible={m.visible}
          isSectionCut={isSectionCutActive}
          cursorWorldPos={cursorWorld}
          sectionCutRadius={2.0}
          isSelected={selectedModules.includes(m.def.id)}
          moduleIndex={3 + m.index}
        />
      ))}

      <ConnectionDetails visible={connectionVisible} />
      <Roof visible={roofVisible} />
      <Balcony visible={roofVisible} />
      <AmbientParticles intensity={particleIntensity} />
    </group>
  );
}

/* ═══════════════════════════════════════
   Animated Module with entrance animation
   ═══════════════════════════════════════ */
function AnimatedModule({
  def,
  targetPos,
  enterFrom,
  visible,
  isSectionCut,
  cursorWorldPos,
  sectionCutRadius,
  isSelected,
  moduleIndex,
}: {
  def: ModuleDef;
  targetPos: [number, number, number];
  enterFrom: 'left' | 'right' | 'top';
  visible: boolean;
  isSectionCut: boolean;
  cursorWorldPos: [number, number];
  sectionCutRadius: number;
  isSelected: boolean;
  moduleIndex: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const startPos = useMemo(() => {
    if (enterFrom === 'left') return [targetPos[0] - 10, targetPos[1], targetPos[2]] as [number, number, number];
    if (enterFrom === 'right') return [targetPos[0] + 10, targetPos[1], targetPos[2]] as [number, number, number];
    return [targetPos[0], targetPos[1] + 8, targetPos[2]] as [number, number, number];
  }, [enterFrom, targetPos]);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = visible ? targetPos : startPos;
    groupRef.current.position.x += (target[0] - groupRef.current.position.x) * 0.04;
    groupRef.current.position.y += (target[1] - groupRef.current.position.y) * 0.04;
    groupRef.current.position.z += (target[2] - groupRef.current.position.z) * 0.04;
  });

  const targetOpacity = visible ? 1 : 0;

  return (
    <group ref={groupRef} position={startPos}>
      <ContainerModule
        def={def}
        position={[0, 0, 0]}
        visible={visible}
        targetOpacity={targetOpacity}
        isSectionCut={isSectionCut}
        cursorWorldPos={cursorWorldPos}
        sectionCutRadius={sectionCutRadius}
        isSelected={isSelected}
        moduleIndex={moduleIndex}
      />
    </group>
  );
}
