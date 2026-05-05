'use client';

import * as THREE from 'three';

/* ─── Factory for per-module section cut uniforms ─── */
export function createSectionCutUniforms(baseColor: string, metalness = 0.75, roughness = 0.35) {
  return {
    uCursor: { value: new THREE.Vector2(0, 0) },
    uRadius: { value: 2.0 },
    uActive: { value: 0 },
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(baseColor) },
    uOpacity: { value: 1.0 },
    uMetalness: { value: metalness },
    uRoughness: { value: roughness },
  };
}

/* ─── Re-export shader source for external use ─── */
export const SECTION_CUT_VERTEX_SHADER = `
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

export const SECTION_CUT_FRAGMENT_SHADER = `
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
