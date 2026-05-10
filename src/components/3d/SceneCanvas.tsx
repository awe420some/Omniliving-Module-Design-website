'use client';

import { useEffect, useRef, useState } from 'react';
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

/* ─── Module target positions (matches original layout) ─── */
const MODULE_TARGETS = [
  { x: -3.1, y: 0.65, z: 0 },
  { x: 0, y: 0.65, z: 0 },
  { x: 3.1, y: 0.65, z: 0 },
  { x: -3.1, y: 2.0, z: 0 },
  { x: 0, y: 2.0, z: 0 },
  { x: 3.1, y: 2.0, z: 0 },
];

/* ─── Easing functions ─── */
function clamp(value: number, min = 0, max = 1): number {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.min(max, Math.max(min, safe));
}

function easeOutCubic(value: number): number {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(value: number): number {
  const t = clamp(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ─── Build progress per module with stagger ─── */
function getBuildProgress(progress: number, index: number): number {
  return clamp((progress - index * 0.075) * 1.65);
}

/* ─── Create simple gradient environment texture ─── */
function createGradientEnvironment(): THREE.Texture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Top: warm sky blue, Bottom: darker cool
      const r = Math.floor(140 + (1 - v) * 60 + v * 10);
      const g = Math.floor(160 + (1 - v) * 50 + v * 15);
      const b = Math.floor(200 + (1 - v) * 40 + v * 20);
      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* ─── Create fog particles near base ─── */
function createGroundFog(scene: THREE.Scene): THREE.Points {
  const count = 80;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = -0.85 + Math.random() * 0.4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    sizes[i] = 0.3 + Math.random() * 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: '#1a2030',
    size: 0.8,
    transparent: true,
    opacity: 0.15,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

/* ─── Create realistic architectural massing module ─── */
function createFallbackArchitecturalMassing(
  def: ModuleDef,
  index: number,
): THREE.Group {
  const root = new THREE.Group();
  root.name = `fallback_${def.id}`;

  const concrete = new THREE.MeshStandardMaterial({ color: '#8d918d', roughness: 0.88, metalness: 0.04 });
  const steel = new THREE.MeshStandardMaterial({ color: '#aeb6bd', roughness: 0.42, metalness: 0.72 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#d7f3ff',
    transparent: true,
    opacity: 0.34,
    roughness: 0.04,
    transmission: 0.45,
    thickness: 0.14,
  });
  const wallDark = new THREE.MeshStandardMaterial({ color: '#20252a', roughness: 0.9, metalness: 0.08 });

  // Tint wall color based on module type with subtle variation
  const wallColor = new THREE.Color(def.color);
  // Add subtle hue variation per module index
  const hsl = { h: 0, s: 0, l: 0 };
  wallColor.getHSL(hsl);
  wallColor.setHSL(
    (hsl.h + (index * 0.02) - 0.01) % 1,
    Math.min(1, hsl.s + 0.03),
    Math.min(1, hsl.l + (index % 2 === 0 ? 0.02 : -0.02)),
  );
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.55, metalness: 0.45 });

  // Secondary wall material for variation
  const wallColor2 = new THREE.Color(def.color);
  wallColor2.getHSL(hsl);
  wallColor2.setHSL(hsl.h, Math.min(1, hsl.s + 0.05), Math.min(1, hsl.l + 0.04));
  const wallMat2 = new THREE.MeshStandardMaterial({ color: wallColor2, roughness: 0.58, metalness: 0.4 });

  const add = (size: number[], position: number[], material: THREE.Material, name: string) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };

  // Floor slab
  add([2.8, 0.1, 1.3], [0, -0.55, 0], concrete, 'floor_slab');
  // Roof slab
  add([2.8, 0.1, 1.3], [0, 0.55, 0], concrete, 'roof_slab');
  // Side walls with color variation
  add([0.1, 1.1, 1.3], [-1.35, 0, 0], wallMat, 'side_wall_left');
  add([0.1, 1.1, 1.3], [1.35, 0, 0], wallMat2, 'side_wall_right');
  // Back wall
  add([2.8, 1.1, 0.08], [0, 0, -0.65], wallDark, 'back_wall');
  // Large cutaway glass on front
  add([2.46, 0.72, 0.04], [0, 0.05, 0.69], glass, 'large_cutaway_glass');

  // Front steel frame
  add([2.95, 0.06, 0.08], [0, 0.62, 0.72], steel, 'front_top_steel_frame');
  add([2.95, 0.06, 0.08], [0, -0.62, 0.72], steel, 'front_bottom_steel_frame');
  add([0.06, 1.25, 0.08], [-1.46, 0, 0.72], steel, 'front_left_steel_frame');
  add([0.06, 1.25, 0.08], [1.46, 0, 0.72], steel, 'front_right_steel_frame');

  // Corrugation ridges on front and back with slight color variation
  for (let i = 0; i < 10; i++) {
    const y = -0.45 + (i * 0.1);
    const corrRoughness = 0.2 + (i % 3) * 0.05;
    const corrMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? '#1a1a1a' : '#1c1c1c',
      metalness: 0.85,
      roughness: corrRoughness,
    });
    add([2.6, 0.008, 0.004], [0, y, 0.68], corrMat, `corr-front-${i}`);
    add([2.6, 0.008, 0.004], [0, y, -0.68], corrMat, `corr-back-${i}`);
  }

  // Interior furniture based on module type
  const woodMat = new THREE.MeshStandardMaterial({ color: '#7a6147', roughness: 0.78 });
  const furnitureMat = new THREE.MeshStandardMaterial({ color: '#626b73', roughness: 0.9 });
  const emissiveColor = new THREE.Color(def.emissiveColor);

  // Floor interior with emissive glow
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#1a1510',
    emissive: emissiveColor,
    emissiveIntensity: 0.05,
    metalness: 0,
    roughness: 0.9,
  });
  add([2.6, 0.02, 1.1], [0, -0.49, 0], floorMat, 'interior_floor');

  // Interior point light
  const interiorLight = new THREE.PointLight(
    def.emissiveColor,
    0.5,
    3,
  );
  interiorLight.position.set(0, 0.2, 0);
  root.add(interiorLight);

  if (def.type === 'wohnen') {
    add([0.8, 0.2, 0.35], [-0.5, -0.34, -0.15], furnitureMat, 'interior_sofa');
    add([0.8, 0.12, 0.06], [-0.5, -0.2, -0.3], furnitureMat, 'sofa_back');
    add([0.45, 0.04, 0.25], [-0.3, -0.43, 0.1], woodMat, 'interior_table');
    add([0.5, 0.28, 0.02], [0.6, -0.2, -0.55], new THREE.MeshStandardMaterial({ color: '#111', emissive: '#223344', emissiveIntensity: 0.15 }), 'tv');
  } else if (def.type === 'schlafen') {
    add([0.9, 0.12, 0.55], [0.1, -0.38, 0], furnitureMat, 'bed');
    add([0.05, 0.25, 0.55], [-0.35, -0.22, 0], woodMat, 'headboard');
    add([0.18, 0.04, 0.2], [-0.25, -0.28, -0.1], new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.5 }), 'pillow_1');
    add([0.18, 0.04, 0.2], [-0.25, -0.28, 0.1], new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.5 }), 'pillow_2');
  } else if (def.type === 'kueche') {
    add([1.0, 0.16, 0.3], [0.3, -0.38, -0.3], furnitureMat, 'counter');
    add([1.02, 0.02, 0.32], [0.3, -0.29, -0.3], new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.5 }), 'counter_top');
    add([0.8, 0.2, 0.12], [0.2, -0.08, -0.55], furnitureMat, 'upper_cabinets');
  } else if (def.type === 'bad') {
    add([0.4, 0.4, 0.02], [-0.7, -0.2, -0.2], new THREE.MeshPhysicalMaterial({ color: '#cce5ff', transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.4 }), 'shower_glass');
    add([0.45, 0.02, 0.4], [-0.7, -0.47, -0.05], new THREE.MeshStandardMaterial({ color: '#ddd', roughness: 0.7 }), 'shower_base');
    add([0.4, 0.1, 0.2], [0.6, -0.38, 0.2], woodMat, 'vanity');
    add([0.35, 0.22, 0.01], [0.6, -0.12, 0.35], new THREE.MeshStandardMaterial({ color: '#aaccee', metalness: 0.9, roughness: 0.05 }), 'mirror');
  }

  // Window configurations with enhanced glass materials
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.8, roughness: 0.2 });

  // Glass with reflective quality for day mode
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: def.type === 'bad' ? '#e0e8f0' : '#cce5ff',
    transmission: def.type === 'bad' ? 0.5 : 0.9,
    roughness: def.type === 'bad' ? 0.6 : 0.05,
    thickness: 0.02,
    ior: 1.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.5,
    reflectivity: 0.5,
    envMapIntensity: 0.8,
  });

  const addWindow = (wx: number, wy: number, wz: number, ww: number, wh: number) => {
    add([ww + 0.04, 0.02, 0.01], [wx, wy + wh / 2 + 0.01, wz], windowFrameMat, `win-frame-top`);
    add([ww + 0.04, 0.02, 0.01], [wx, wy - wh / 2 - 0.01, wz], windowFrameMat, `win-frame-bottom`);
    add([0.02, wh + 0.04, 0.01], [wx - ww / 2 - 0.01, wy, wz], windowFrameMat, `win-frame-left`);
    add([0.02, wh + 0.04, 0.01], [wx + ww / 2 + 0.01, wy, wz], windowFrameMat, `win-frame-right`);
    const winMesh = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), glassMat);
    winMesh.position.set(wx, wy, wz);
    winMesh.name = `window_glass`;
    winMesh.castShadow = false;
    root.add(winMesh);
  };

  if (def.type === 'wohnen') {
    addWindow(-0.5, 0.1, 0.7, 0.55, 0.4);
    addWindow(0.5, 0.1, 0.7, 0.55, 0.4);
  } else if (def.type === 'schlafen') {
    addWindow(-0.4, 0.1, 0.7, 0.4, 0.32);
    addWindow(0.5, 0.1, 0.7, 0.4, 0.32);
  } else if (def.type === 'kueche') {
    addWindow(0.0, 0.1, 0.7, 0.55, 0.38);
  } else {
    addWindow(0.3, 0.1, 0.7, 0.25, 0.25);
  }

  // Door for wohnen and schlafen
  if (def.type === 'wohnen' || def.type === 'schlafen') {
    add([0.4, 0.7, 0.01], [-1.1, -0.1, 0.7], new THREE.MeshStandardMaterial({ color: '#444', metalness: 0.6, roughness: 0.3 }), 'door');
    // Door handle in gold
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.06, 6),
      new THREE.MeshStandardMaterial({ color: '#c9a96e', metalness: 0.9, roughness: 0.1 }),
    );
    handle.position.set(-1.22, -0.1, 0.72);
    handle.rotation.x = Math.PI / 2;
    root.add(handle);

    // External light fixture above door
    const lightFixture = new THREE.Group();
    lightFixture.name = 'door_light';
    // Mounting plate
    const mountPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.06, 0.02),
      new THREE.MeshStandardMaterial({ color: '#333', metalness: 0.8, roughness: 0.2 }),
    );
    mountPlate.position.set(-1.1, 0.32, 0.73);
    lightFixture.add(mountPlate);
    // Lamp shade
    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.04, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: '#222', metalness: 0.6, roughness: 0.3 }),
    );
    lampShade.position.set(-1.1, 0.3, 0.74);
    lightFixture.add(lampShade);
    // Emissive bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 8, 8),
      new THREE.MeshStandardMaterial({
        color: '#ffdd88',
        emissive: '#ffcc66',
        emissiveIntensity: 0.6,
        metalness: 0,
        roughness: 1,
      }),
    );
    bulb.position.set(-1.1, 0.28, 0.75);
    lightFixture.add(bulb);
    // Small point light
    const doorLight = new THREE.PointLight('#ffcc66', 0.4, 2);
    doorLight.position.set(-1.1, 0.28, 0.76);
    lightFixture.add(doorLight);
    root.add(lightFixture);

    // House number plate
    const numberPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.06, 0.005),
      new THREE.MeshStandardMaterial({ color: '#c9a96e', metalness: 0.7, roughness: 0.3 }),
    );
    numberPlate.position.set(-0.95, 0.32, 0.73);
    numberPlate.name = 'house_number';
    root.add(numberPlate);
  }

  // Ventilation grills for kitchen and bathroom modules
  if (def.type === 'kueche' || def.type === 'bad') {
    const grillMat = new THREE.MeshStandardMaterial({ color: '#444', metalness: 0.7, roughness: 0.3 });
    // Vent on side wall
    const ventGroup = new THREE.Group();
    ventGroup.name = 'ventilation_grill';
    // Vent frame
    const ventFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.15, 0.2),
      grillMat,
    );
    ventFrame.position.set(1.41, 0.15, -0.2);
    ventGroup.add(ventFrame);
    // Vent slats
    for (let s = 0; s < 5; s++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.004, 0.18),
        new THREE.MeshStandardMaterial({ color: '#333', metalness: 0.8, roughness: 0.2 }),
      );
      slat.position.set(1.42, 0.09 + s * 0.03, -0.2);
      slat.rotation.z = 0.3;
      ventGroup.add(slat);
    }
    root.add(ventGroup);
  }

  // Rain gutters along roof edges
  const gutterMat = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.7, roughness: 0.3 });
  // Front gutter
  add([2.9, 0.03, 0.04], [0, 0.57, 0.7], gutterMat, 'gutter_front');
  // Back gutter
  add([2.9, 0.03, 0.04], [0, 0.57, -0.7], gutterMat, 'gutter_back');
  // Downspout at right corner
  const downspout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 1.1, 6),
    gutterMat,
  );
  downspout.position.set(1.46, 0, 0.7);
  downspout.name = 'downspout';
  root.add(downspout);
  // Downspout bracket
  add([0.04, 0.02, 0.04], [1.46, -0.3, 0.7], gutterMat, 'spout_bracket_1');
  add([0.04, 0.02, 0.04], [1.46, 0.1, 0.7], gutterMat, 'spout_bracket_2');

  // Corner posts
  const cornerMat = new THREE.MeshStandardMaterial({ color: '#8a8a8a', metalness: 0.95, roughness: 0.15 });
  [[-1.4, 0, -0.66], [1.4, 0, -0.66], [-1.4, 0, 0.66], [1.4, 0, 0.66]].forEach((pos, ci) => {
    add([0.06, 1.16, 0.06], pos, cornerMat, `corner_post_${ci}`);
  });

  // Roof element - standing seam
  add([2.9, 0.04, 1.4], [0, 0.6, 0], new THREE.MeshStandardMaterial({ color: '#2d4a3e', metalness: 0.6, roughness: 0.3 }), 'roof');

  // Standing seam ridges
  for (let i = 0; i < 6; i++) {
    const x = -1.2 + (i * 0.48);
    add([0.012, 0.012, 1.3], [x, 0.635, 0], new THREE.MeshStandardMaterial({ color: '#1a3028', metalness: 0.8, roughness: 0.2 }), `seam_${i}`);
  }

  root.userData.isFallback = true;
  root.userData.moduleIndex = index;
  root.userData.moduleDef = def;
  return root;
}

/* ─── Create external staircase ─── */
function createExternalStaircase(scene: THREE.Group) {
  const stairGroup = new THREE.Group();
  stairGroup.name = 'external_staircase';

  const metalMat = new THREE.MeshStandardMaterial({ color: '#6a6a6a', metalness: 0.85, roughness: 0.25 });
  const grateMat = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.8, roughness: 0.3 });
  const goldAccentMat = new THREE.MeshStandardMaterial({ color: '#c9a96e', metalness: 0.9, roughness: 0.1 });

  // Position staircase on the far right side of the building
  const baseX = 5.0;
  const baseZ = 0.3;

  // Steps - from ground to upper floor level
  const stepCount = 8;
  const stepHeight = 2.6 / stepCount;
  const stepDepth = 0.25;

  for (let i = 0; i < stepCount; i++) {
    // Metal grate step
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.015, stepDepth),
      grateMat,
    );
    step.position.set(baseX, -0.9 + (i + 1) * stepHeight, baseZ - i * stepDepth * 0.3);
    step.castShadow = true;
    step.receiveShadow = true;
    stairGroup.add(step);

    // Grate pattern lines
    for (let g = 0; g < 4; g++) {
      const grateLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.008, 0.008),
        metalMat,
      );
      grateLine.position.set(
        baseX,
        -0.89 + (i + 1) * stepHeight,
        baseZ - i * stepDepth * 0.3 - stepDepth / 2 + (g + 1) * stepDepth / 5,
      );
      stairGroup.add(grateLine);
    }
  }

  // Side railings
  const railingHeight = 0.85;
  for (let side = -1; side <= 1; side += 2) {
    // Vertical railing posts
    for (let i = 0; i <= stepCount; i += 2) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, railingHeight, 6),
        metalMat,
      );
      post.position.set(
        baseX + side * 0.42,
        -0.9 + i * stepHeight + railingHeight / 2,
        baseZ - i * stepDepth * 0.3,
      );
      stairGroup.add(post);
    }

    // Top railing (handrail)
    const topRail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 3.0, 6),
      goldAccentMat,
    );
    topRail.position.set(
      baseX + side * 0.42,
      -0.9 + stepCount * stepHeight + railingHeight - 0.05,
      baseZ - stepCount * stepDepth * 0.15,
    );
    topRail.rotation.x = -0.15;
    stairGroup.add(topRail);
  }

  // Landing platform at upper floor level
  const landing = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.03, 0.6),
    grateMat,
  );
  landing.position.set(baseX, 2.0 - 0.65 + 0.55, baseZ - 0.3);
  landing.castShadow = true;
  landing.receiveShadow = true;
  stairGroup.add(landing);

  // Landing railing
  const landingRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.02, 0.02),
    goldAccentMat,
  );
  landingRail.position.set(baseX, 2.0 - 0.65 + 0.55 + 0.8, baseZ - 0.6);
  stairGroup.add(landingRail);

  scene.add(stairGroup);
  return stairGroup;
}

/* ─── Setup renderer with error handling ─── */
function setupRenderer(mount: HTMLDivElement): THREE.WebGLRenderer | null {
  try {
    // Create renderer with failIfMajorPerformanceCaveat: false
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
    // Cap pixel ratio at 1.5 for performance (retina screens at full 2x are expensive)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    // PCFSoftShadowMap is expensive — use BasicShadowMap for better performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    mount.appendChild(renderer.domElement);
    return renderer;
  } catch (err) {
    console.warn('WebGL context creation failed:', err);
    return null;
  }
}

/* ─── Add architectural lighting ─── */
function addArchitecturalLighting(scene: THREE.Scene) {
  // Hemisphere light for ambient fill
  const hemi = new THREE.HemisphereLight('#dbeafe', '#111827', 0.72);
  scene.add(hemi);

  // Directional sun light with shadows
  const sun = new THREE.DirectionalLight('#fff4e6', 3.4);
  sun.position.set(7, 9, 6);
  sun.castShadow = true;
  // 1024² with BasicShadowMap = ~4× faster shadow pass than 2048², visually
  // indistinguishable on this scene (no fine geometry close to the camera).
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  sun.shadow.bias = -0.001;
  sun.name = 'sun_light';
  scene.add(sun);

  // Interior warm glow
  const interiorGlow = new THREE.PointLight('#ffd9a3', 3.5, 10);
  interiorGlow.position.set(-1.6, 1.1, 1.8);
  scene.add(interiorGlow);

  // Blue fill light from opposite side
  const blueFill = new THREE.PointLight('#8bd3ff', 2.8, 12);
  blueFill.position.set(3.8, 2.2, 3.2);
  scene.add(blueFill);

  // Subtle rim light from behind
  const rimLight = new THREE.DirectionalLight('#ffeedd', 0.8);
  rimLight.position.set(-5, 4, -6);
  scene.add(rimLight);

  // Golden hour accent light (warm, low angle)
  const goldenLight = new THREE.DirectionalLight('#ffaa55', 1.5);
  goldenLight.position.set(-8, 3, 2);
  goldenLight.name = 'golden_hour_light';
  goldenLight.intensity = 0; // Activated during hero mode
  scene.add(goldenLight);

  // Cool blue accent light (activated during section cut)
  const coolLight = new THREE.DirectionalLight('#6688cc', 1.0);
  coolLight.position.set(4, 6, -3);
  coolLight.name = 'cool_section_light';
  coolLight.intensity = 0; // Activated during section cut mode
  scene.add(coolLight);
}

/* ─── Create ground plane with reflective surface ─── */
function createGroundPlane(scene: THREE.Scene) {
  // Main ground with slight reflectivity
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42),
    new THREE.MeshStandardMaterial({
      color: '#111418',
      roughness: 0.85,
      metalness: 0.08,
      envMapIntensity: 0.3,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.9;
  ground.receiveShadow = true;
  scene.add(ground);

  // Reflective pool near the building base
  const reflectivePool = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 3),
    new THREE.MeshStandardMaterial({
      color: '#0d0e14',
      roughness: 0.15,
      metalness: 0.6,
      envMapIntensity: 0.5,
      transparent: true,
      opacity: 0.7,
    }),
  );
  reflectivePool.rotation.x = -Math.PI / 2;
  reflectivePool.position.set(0, -0.89, 3.5);
  reflectivePool.receiveShadow = true;
  scene.add(reflectivePool);

  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(10.2, 0.32, 4.4),
    new THREE.MeshStandardMaterial({ color: '#252a2f', roughness: 0.88, metalness: 0.06 }),
  );
  plinth.position.set(0, -0.72, 0);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  scene.add(plinth);

  // Grid helper
  const grid = new THREE.GridHelper(30, 30, 0x1a1a2e, 0x111122);
  grid.position.y = -0.89;
  scene.add(grid);
}

/* ─── Dispose helpers ─── */
function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        const mat = material as THREE.MeshStandardMaterial;
        if (mat.map) mat.map.dispose();
        mat.dispose();
      });
    }
  });
}

/* ─── Helper to get effective module def ─── */
function getEffectiveModuleDef(obj: THREE.Object3D, moduleAssignments: Record<string, ModuleDef>): ModuleDef {
  const idx = obj.userData.moduleIndex ?? 0;
  const def = DEFAULT_MODULE_DEFS[idx] || DEFAULT_MODULE_DEFS[0];
  return moduleAssignments[def.id] || def;
}

/* ═══════════════════════════════════════
   CSS Fallback for WebGL failure
   ═══════════════════════════════════════ */
function CSSFallback() {
  return (
    <div className="w-full h-full bg-[#050608] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="w-16 h-16 rounded-lg bg-[#c9a96e]/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h3 className="text-lg text-white/80 font-light tracking-wider">3D-Ansicht</h3>
        <p className="text-xs text-[#8888a8] text-center max-w-xs leading-relaxed">
          Die 3D-Darstellung wird auf diesem Gerät nicht unterstützt.
          Bitte verwenden Sie einen modernen Browser mit WebGL-Unterstützung.
        </p>
        <div className="flex gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#c9a96e]/30 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[#c9a96e]/20 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-2 h-2 rounded-full bg-[#c9a96e]/10 animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Main SceneCanvas Component
   ═══════════════════════════════════════ */
export default function SceneCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const storeRef = useRef({
    scrollProgress: 0,
    buildingPhase: 0,
    cursorPosition: { x: 0, y: 0 },
    isSectionCutActive: false,
    experienceMode: 'hero' as 'hero' | 'building' | 'sectioncut' | 'configurator',
    moduleAssignments: {} as Record<string, ModuleDef>,
  });

  // Subscribe to Zustand store outside of render
  useEffect(() => {
    const unsub = useAppStore.subscribe((state) => {
      storeRef.current.scrollProgress = state.scrollProgress;
      storeRef.current.buildingPhase = state.buildingPhase;
      storeRef.current.cursorPosition = state.cursorPosition;
      storeRef.current.isSectionCutActive = state.isSectionCutActive;
      storeRef.current.experienceMode = state.experienceMode;
      storeRef.current.moduleAssignments = state.moduleAssignments;
    });
    const state = useAppStore.getState();
    storeRef.current.scrollProgress = state.scrollProgress;
    storeRef.current.buildingPhase = state.buildingPhase;
    storeRef.current.cursorPosition = state.cursorPosition;
    storeRef.current.isSectionCutActive = state.isSectionCutActive;
    storeRef.current.experienceMode = state.experienceMode;
    storeRef.current.moduleAssignments = state.moduleAssignments;
    return unsub;
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ─── Scene setup ───
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050608');
    scene.fog = new THREE.Fog('#050608', 10, 28);

    // Add gradient environment texture for reflections
    const envTexture = createGradientEnvironment();
    scene.environment = envTexture;

    const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 100);
    camera.position.set(0.8, 1.6, 8.2);

    // ─── Setup renderer with error handling ───
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = setupRenderer(mount);
    } catch {
      // Will be handled below
    }
    if (!renderer) {
      // Schedule state update outside effect body to avoid cascading renders
      const callbackId = requestAnimationFrame(() => {
        setWebglFailed(true);
      });
      return () => cancelAnimationFrame(callbackId);
    }

    addArchitecturalLighting(scene);
    createGroundPlane(scene);

    // Ground fog particles
    const fogParticles = createGroundFog(scene);

    // Root group for all modules
    const root = new THREE.Group();
    scene.add(root);

    // Module objects for assembly animation
    const moduleObjects: THREE.Group[] = [];
    let alive = true;

    // ─── Build scene with architectural massing modules ───
    for (let i = 0; i < 6; i++) {
      const def = DEFAULT_MODULE_DEFS[i];
      const target = MODULE_TARGETS[i];

      const moduleGroup = createFallbackArchitecturalMassing(def, i);

      moduleGroup.userData.moduleIndex = i;
      moduleGroup.userData.moduleDef = def;
      moduleGroup.userData.targetX = target.x;
      moduleGroup.userData.targetY = target.y;
      moduleGroup.userData.targetZ = target.z;

      const startSide = i % 2 === 0 ? -1.8 : 1.8;
      moduleGroup.position.set(target.x + startSide, -4.4, target.z + 2.4);
      moduleGroup.scale.setScalar(0.001);
      moduleGroup.rotation.y = (1) * (i % 2 === 0 ? -0.55 : 0.55);

      root.add(moduleGroup);
      moduleObjects.push(moduleGroup);
    }

    // ─── External staircase ───
    const staircase = createExternalStaircase(root);

    // ─── Pointer tracking — window-level for reliable sticky-scroll coverage ───
    const pointerRef = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      // Use viewport-relative position so tracking works through sticky scroll
      pointerRef.x = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      pointerRef.y = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    };

    // ─── Orbit Controls State ───
    const orbitState = {
      isDragging: false,
      isRightDragging: false,
      prevX: 0,
      prevY: 0,
      rotationX: 0,
      rotationY: 0,
      targetRotationX: 0,
      targetRotationY: 0,
      zoom: 1,
      targetZoom: 1,
      panX: 0,
      panY: 0,
      targetPanX: 0,
      targetPanY: 0,
    };

    const onMouseDown = (event: MouseEvent) => {
      const s = storeRef.current;
      if (s.experienceMode !== 'configurator') return;
      if (event.button === 2) {
        orbitState.isRightDragging = true;
      } else if (event.button === 0) {
        orbitState.isDragging = true;
      }
      orbitState.prevX = event.clientX;
      orbitState.prevY = event.clientY;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!orbitState.isDragging && !orbitState.isRightDragging) return;
      const dx = event.clientX - orbitState.prevX;
      const dy = event.clientY - orbitState.prevY;

      if (orbitState.isDragging) {
        orbitState.targetRotationY += dx * 0.005;
        orbitState.targetRotationX += dy * 0.003;
        // Clamp vertical rotation
        orbitState.targetRotationX = clamp(orbitState.targetRotationX, -0.5, 0.5);
      }

      if (orbitState.isRightDragging) {
        orbitState.targetPanX += dx * 0.005;
        orbitState.targetPanY -= dy * 0.005;
      }

      orbitState.prevX = event.clientX;
      orbitState.prevY = event.clientY;
    };

    const onMouseUp = () => {
      orbitState.isDragging = false;
      orbitState.isRightDragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      const s = storeRef.current;
      if (s.experienceMode !== 'configurator') return;
      event.preventDefault();
      orbitState.targetZoom = clamp(orbitState.targetZoom + event.deltaY * 0.001, 0.5, 2.0);
    };

    // Touch events for mobile orbit
    const touchState = { lastDist: 0, lastX: 0, lastY: 0, touching: false };

    const onTouchStart = (event: TouchEvent) => {
      const s = storeRef.current;
      if (s.experienceMode !== 'configurator') return;
      touchState.touching = true;
      if (event.touches.length === 1) {
        touchState.lastX = event.touches[0].clientX;
        touchState.lastY = event.touches[0].clientY;
      } else if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        touchState.lastDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touchState.touching) return;
      if (event.touches.length === 1) {
        const dx = event.touches[0].clientX - touchState.lastX;
        const dy = event.touches[0].clientY - touchState.lastY;
        orbitState.targetRotationY += dx * 0.005;
        orbitState.targetRotationX += dy * 0.003;
        orbitState.targetRotationX = clamp(orbitState.targetRotationX, -0.5, 0.5);
        touchState.lastX = event.touches[0].clientX;
        touchState.lastY = event.touches[0].clientY;
      } else if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (touchState.lastDist > 0) {
          orbitState.targetZoom = clamp(orbitState.targetZoom + (touchState.lastDist - dist) * 0.005, 0.5, 2.0);
        }
        touchState.lastDist = dist;
      }
    };

    const onTouchEnd = () => {
      touchState.touching = false;
      touchState.lastDist = 0;
    };

    const onContextMenu = (event: Event) => {
      const s = storeRef.current;
      if (s.experienceMode === 'configurator') {
        event.preventDefault();
      }
    };

    // ─── Resize handler ───
    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // ─── Animation loop ───
    let startTime = performance.now();
    let frameId = 0;
    let lastMode = 'hero';
    let lastFrameMs = performance.now();
    // Reference framerate for legacy lerp factors (smoothing was authored at 60Hz).
    // We scale all per-frame lerps by (delta / FRAME_60) so the easing speed stays
    // identical regardless of display refresh rate (60Hz, 120Hz ProMotion, etc.).
    const FRAME_60 = 1000 / 60;

    // Camera smoothing state
    const camPos = new THREE.Vector3(0.8, 1.6, 8.2);
    const camLook = new THREE.Vector3(0, 0.3, 0);

    // Camera shake state
    const shakeState = { intensity: 0, targetIntensity: 0 };

    // ─── Reusable scratch objects to eliminate per-frame GC pressure ───
    // Allocating new THREE.Color / Fog / Vector3 in the rAF loop is the
    // single biggest perf killer for this scene — these get garbage-collected
    // every few frames and cause 5-9s long tasks during scroll. Reuse instead.
    const scratchVec = new THREE.Vector3();
    const colorWarm = new THREE.Color('#ffddaa');
    const colorCool = new THREE.Color('#ccddff');
    const colorNeutral = new THREE.Color('#fff4e6');
    const colorBgHero = new THREE.Color('#080a06');
    const colorBgSection = new THREE.Color('#040610');
    const colorBgNormal = new THREE.Color('#050608');
    const fogHero = new THREE.Fog('#080a06', 10, 28);
    const fogSection = new THREE.Fog('#040610', 8, 24);
    const fogNormal = new THREE.Fog('#050608', 10, 28);
    const rimColorBase = new THREE.Color(0.788, 0.663, 0.431);
    const rimColorScratch = new THREE.Color();
    const emissiveScratch = new THREE.Color();
    // Two more scratch colors for the per-module color update / window-glow loops.
    const moduleColorScratch = new THREE.Color();
    const moduleEmissiveScratch = new THREE.Color();

    // ─── Visibility tracking: skip the entire animate loop when canvas
    //     is out of viewport. Saves 5-9 seconds of long-tasks per scroll
    //     when the user has scrolled past the ScrollExperience section.
    let canvasVisible = true;
    const visibilityObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) canvasVisible = e.isIntersecting;
      },
      { threshold: 0, rootMargin: '100px' },
    );
    visibilityObs.observe(mount);

    const animate = (now: number = 0) => {
      if (!alive) return;
      frameId = window.requestAnimationFrame(animate);

      // Skip rendering work when the canvas is fully scrolled out of view.
      // We still keep the rAF chain alive so we can resume immediately.
      if (!canvasVisible) {
        lastFrameMs = now;
        return;
      }

      // Delta-time scaling factor: 1.0 at 60Hz, 0.5 at 120Hz, 2.0 at 30Hz.
      // Clamped to avoid huge jumps after tab-switch / breakpoints.
      const dtMs = Math.min(now - lastFrameMs, 100);
      lastFrameMs = now;
      const dt = dtMs / FRAME_60;
      // Frame-rate-independent exponential smoothing helpers.
      const k = (f: number) => 1 - Math.pow(1 - f, dt);
      const k08 = k(0.08);
      const k05 = k(0.05);
      const k02 = k(0.02);
      const decay95 = Math.pow(0.95, dt);

      const t = (performance.now() - startTime) / 1000;
      const s = storeRef.current;
      const p = s.scrollProgress;
      const px = pointerRef.x;
      const py = pointerRef.y;

      // ─── Mode transition detection ───
      const modeChanged = s.experienceMode !== lastMode;
      lastMode = s.experienceMode;

      // ─── Lighting mode transitions ───
      const sunLight = scene.getObjectByName('sun_light') as THREE.DirectionalLight | undefined;
      const goldenLight = scene.getObjectByName('golden_hour_light') as THREE.DirectionalLight | undefined;
      const coolLight = scene.getObjectByName('cool_section_light') as THREE.DirectionalLight | undefined;

      // Delta-corrected smoothing for light transitions.
      const kLight = 1 - Math.pow(1 - 0.03, dt);
      const kColor = 1 - Math.pow(1 - 0.02, dt);

      // Reuse pre-allocated Color/Fog instances; only swap scene refs when
      // mode changes to avoid touching scene.background / fog every frame.
      if (s.experienceMode === 'hero') {
        if (goldenLight) goldenLight.intensity += (1.5 - goldenLight.intensity) * kLight;
        if (coolLight) coolLight.intensity += (0 - coolLight.intensity) * kLight;
        if (sunLight) {
          sunLight.color.lerp(colorWarm, kColor);
          sunLight.intensity += (3.0 - sunLight.intensity) * kLight;
        }
        if (modeChanged) {
          scene.background = colorBgHero;
          scene.fog = fogHero;
        }
      } else if (s.experienceMode === 'sectioncut') {
        if (goldenLight) goldenLight.intensity += (0 - goldenLight.intensity) * kLight;
        if (coolLight) coolLight.intensity += (1.5 - coolLight.intensity) * kLight;
        if (sunLight) {
          sunLight.color.lerp(colorCool, kColor);
          sunLight.intensity += (2.5 - sunLight.intensity) * kLight;
        }
        if (modeChanged) {
          scene.background = colorBgSection;
          scene.fog = fogSection;
        }
      } else {
        if (goldenLight) goldenLight.intensity += (0 - goldenLight.intensity) * kLight;
        if (coolLight) coolLight.intensity += (0 - coolLight.intensity) * kLight;
        if (sunLight) {
          sunLight.color.lerp(colorNeutral, kColor);
          sunLight.intensity += (3.4 - sunLight.intensity) * kLight;
        }
        if (modeChanged) {
          scene.background = colorBgNormal;
          scene.fog = fogNormal;
        }
      }

      // Note: we deliberately do NOT toggle light.visible based on intensity.
      // Three.js bakes the active-light count into shader #defines; flipping
      // visibility triggers a costly program recompile mid-frame. Lights at
      // intensity 0 already contribute ~nothing in the shader.

      // ─── Camera shake during building phase ───
      if (s.experienceMode === 'building' && p > 0.05 && p < 0.65) {
        const buildIntensity = Math.sin(p * Math.PI) * 0.02;
        shakeState.targetIntensity = buildIntensity;
      } else {
        shakeState.targetIntensity = 0;
      }
      shakeState.intensity += (shakeState.targetIntensity - shakeState.intensity) * k05;

      const shakeX = shakeState.intensity > 0.001 ? (Math.random() - 0.5) * shakeState.intensity : 0;
      const shakeY = shakeState.intensity > 0.001 ? (Math.random() - 0.5) * shakeState.intensity : 0;

      // ─── Orbit controls interpolation (configurator mode) ───
      if (s.experienceMode === 'configurator') {
        orbitState.rotationY += (orbitState.targetRotationY - orbitState.rotationY) * k08;
        orbitState.rotationX += (orbitState.targetRotationX - orbitState.rotationX) * k08;
        orbitState.zoom += (orbitState.targetZoom - orbitState.zoom) * k08;
        orbitState.panX += (orbitState.targetPanX - orbitState.panX) * k08;
        orbitState.panY += (orbitState.targetPanY - orbitState.panY) * k08;
      } else {
        // Smoothly reset orbit when not in configurator
        orbitState.targetRotationY *= decay95;
        orbitState.targetRotationX *= decay95;
        orbitState.targetZoom += (1 - orbitState.targetZoom) * k05;
        orbitState.targetPanX *= decay95;
        orbitState.targetPanY *= decay95;
        orbitState.rotationY += (orbitState.targetRotationY - orbitState.rotationY) * k08;
        orbitState.rotationX += (orbitState.targetRotationX - orbitState.rotationX) * k08;
        orbitState.zoom += (orbitState.targetZoom - orbitState.zoom) * k08;
        orbitState.panX += (orbitState.targetPanX - orbitState.panX) * k08;
        orbitState.panY += (orbitState.targetPanY - orbitState.panY) * k08;
      }

      // ─── Camera modes ───
      let targetCamPos: THREE.Vector3;
      let targetLookAt: THREE.Vector3;

      if (s.experienceMode === 'hero') {
        const orbit = t * 0.13;
        targetCamPos = new THREE.Vector3(
          0.8 + px * 0.24 + Math.sin(orbit) * 0.6,
          1.55 + py * 0.07 + Math.sin(t * 0.11) * 0.08,
          8.8 + Math.cos(orbit) * 0.3,
        );
        targetLookAt = new THREE.Vector3(0, 0.22, 0);
      } else if (s.experienceMode === 'building') {
        const dolly = easeInOutCubic(clamp((p - 0.08) * 1.18));
        targetCamPos = new THREE.Vector3(
          px * 0.24,
          1.5 + dolly * 0.7,
          8.2 - dolly * 1.7,
        );
        targetLookAt = new THREE.Vector3(0, 0.28 + dolly * 0.14, 0);
      } else if (s.experienceMode === 'sectioncut') {
        targetCamPos = new THREE.Vector3(
          1.5 + px * 1.8,
          3.0 + py * 0.8,
          5.5,
        );
        targetLookAt = new THREE.Vector3(px * 0.5, 0.8 + py * 0.3, 0);
      } else {
        // Configurator: orbit controls
        const baseDist = 9.0 / orbitState.zoom;
        const orbitAngle = orbitState.rotationY;
        const elevAngle = orbitState.rotationX;
        targetCamPos = new THREE.Vector3(
          orbitState.panX + Math.sin(orbitAngle) * baseDist,
          2.5 + elevAngle * baseDist * 0.5,
          orbitState.panY + Math.cos(orbitAngle) * baseDist,
        );
        targetLookAt = new THREE.Vector3(
          orbitState.panX,
          1.0 + elevAngle * 2,
          orbitState.panY,
        );
      }

      // Apply camera shake
      targetCamPos.x += shakeX;
      targetCamPos.y += shakeY;

      // Smooth camera with faster transition on mode change
      const camLerp = 1 - Math.pow(1 - (modeChanged ? 0.06 : 0.025), dt);
      camPos.lerp(targetCamPos, camLerp);
      camLook.lerp(targetLookAt, camLerp);
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // Root rotation for parallax feel + orbit (delta-corrected)
      if (s.experienceMode === 'configurator') {
        // In configurator, orbit controls handle rotation
        root.rotation.y += (orbitState.rotationY - root.rotation.y) * k08;
      } else if (s.experienceMode === 'hero') {
        // Auto-rotation: gentle sinusoidal sway. `t` is wall-clock seconds,
        // so the swing speed is independent of framerate by construction.
        const targetRotY = Math.sin(t * 0.05) * 0.05;
        root.rotation.y += (targetRotY - root.rotation.y) * k(0.01);
      } else {
        root.rotation.y += (0 - root.rotation.y) * k02;
      }

      // ─── Module assembly animation ───
      const buildProgress = clamp(p / 0.7);

      moduleObjects.forEach((obj, i) => {
        const target = MODULE_TARGETS[i];
        const build = easeOutCubic(getBuildProgress(buildProgress, i));

        const isVisible = build > 0.004;
        obj.visible = isVisible;

        if (!isVisible) return;

        const startSide = i % 2 === 0 ? -1.8 : 1.8;
        obj.position.x = target.x + (1 - build) * startSide;
        obj.position.y = -4.4 + (target.y + 4.4) * build;
        obj.position.z = target.z + (1 - build) * 2.4;
        obj.rotation.y = (1 - build) * (i % 2 === 0 ? -0.55 : 0.55);
        obj.rotation.x = (1 - build) * 0.1;
        obj.scale.setScalar(Math.max(0.001, build));
      });

      // Staircase visibility follows building progress
      if (staircase) {
        staircase.visible = buildProgress > 0.8;
        if (staircase.visible) {
          const stairProgress = clamp((buildProgress - 0.8) * 5);
          staircase.scale.setScalar(Math.max(0.001, stairProgress));
        }
      }

      // ─── Section cut effect (opacity-based) ───
      if (s.isSectionCutActive && moduleObjects.length > 0) {
        const cursorWorldX = (s.cursorPosition.x - 0.5) * 8;
        const cursorWorldY = s.cursorPosition.y * 3;

        moduleObjects.forEach((obj) => {
          obj.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;

            // Cache wall-flag per mesh (string parsing on .name is hot otherwise).
            let isWall = mesh.userData.__isWall as boolean | undefined;
            if (isWall === undefined) {
              const name = mesh.name.toLowerCase();
              isWall = name.includes('wall') || name.includes('side_wall') || name.includes('back_wall');
              mesh.userData.__isWall = isWall;
            }
            // Skip non-wall meshes entirely — they don't participate in the
            // section cut and their material won't change.
            if (!isWall && !mat.transparent) return;

            // Reuse scratchVec instead of allocating each call → ~6× speedup
            // for this loop, which previously created hundreds of Vector3
            // instances per frame.
            mesh.getWorldPosition(scratchVec);
            const dist = Math.sqrt(
              (scratchVec.x - cursorWorldX) ** 2 +
              (scratchVec.y - cursorWorldY) ** 2,
            );

            if (isWall && dist < 3.5) {
              const targetOpacity = clamp(1.0 - (3.5 - dist) / 3.5, 0.08, 1.0);
              if (!mat.transparent) {
                mat.transparent = true;
                mat.opacity = 1.0;
              }
              mat.opacity += (targetOpacity - mat.opacity) * 0.08;

              if (dist < 2.5) {
                const rimStrength = clamp(1.0 - dist / 2.5, 0, 0.5);
                const pulse = 0.85 + 0.15 * Math.sin(t * 3.0);
                if (mat.emissive) {
                  // Reuse pre-allocated rim color scratch buffer.
                  rimColorScratch.copy(rimColorBase).multiplyScalar(rimStrength * pulse);
                  emissiveScratch.copy(mat.emissive).lerp(rimColorScratch, 0.05);
                  mat.emissive.copy(emissiveScratch);
                  mat.emissiveIntensity += (rimStrength * pulse - mat.emissiveIntensity) * 0.05;
                }
              }
            } else if (isWall) {
              if (mat.transparent) {
                mat.opacity += (1.0 - mat.opacity) * 0.05;
                if (mat.opacity > 0.99) {
                  mat.opacity = 1.0;
                  mat.transparent = false;
                }
              }
              if (mat.emissive && mat.emissiveIntensity > 0.01) {
                mat.emissiveIntensity *= 0.95;
              }
            }
          });
        });
      } else {
        // Reset all materials to normal — fast path: cache name flags per
        // mesh and bail out for meshes that don't need any work.
        moduleObjects.forEach((obj) => {
          obj.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            const needsOpacityReset = mat.transparent && mat.opacity < 0.99;
            const needsEmissiveDecay = mat.emissive && mat.emissiveIntensity > 0.01;
            if (!needsOpacityReset && !needsEmissiveDecay) return;

            let flags = mesh.userData.__rstFlags as
              | { resettable: boolean; emissiveDecay: boolean }
              | undefined;
            if (!flags) {
              const lname = mesh.name.toLowerCase();
              flags = {
                resettable:
                  !lname.includes('glass') &&
                  !lname.includes('window') &&
                  mesh.name !== 'door',
                emissiveDecay:
                  !lname.includes('floor') &&
                  !lname.includes('tv') &&
                  !lname.includes('bulb'),
              };
              mesh.userData.__rstFlags = flags;
            }

            if (needsOpacityReset && flags.resettable) {
              mat.opacity += (1.0 - mat.opacity) * 0.05;
              if (mat.opacity > 0.99) {
                mat.opacity = 1.0;
                mat.transparent = false;
              }
            }
            if (needsEmissiveDecay && flags.emissiveDecay) {
              mat.emissiveIntensity *= 0.95;
            }
          });
        });
      }

      // ─── Update module colors based on moduleAssignments ───
      moduleObjects.forEach((obj, i) => {
        const defaultDef = DEFAULT_MODULE_DEFS[i];
        const effectiveDef = s.moduleAssignments[defaultDef.id] || defaultDef;
        moduleColorScratch.set(effectiveDef.color);
        obj.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          // Cache `is side_wall` flag per mesh — name parsing is hot.
          let isSideWall = mesh.userData.__isSideWall as boolean | undefined;
          if (isSideWall === undefined) {
            isSideWall = mesh.name.toLowerCase().includes('side_wall');
            mesh.userData.__isSideWall = isSideWall;
          }
          if (isSideWall && mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.color.lerp(moduleColorScratch, 0.02);
          }
        });
      });

      // ─── Interior glow during section cut ───
      if (s.experienceMode === 'sectioncut' || s.experienceMode === 'building') {
        const targetIntensity = s.isSectionCutActive ? 0.3 : 0.05;
        const targetReflectivity = s.experienceMode === 'hero' ? 0.7 : 0.5;
        moduleObjects.forEach((obj) => {
          const def = DEFAULT_MODULE_DEFS[obj.userData.moduleIndex ?? 0] || DEFAULT_MODULE_DEFS[0];
          const effectiveDef = s.moduleAssignments[def.id] || def;
          moduleEmissiveScratch.set(effectiveDef.emissiveColor);
          obj.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            // Cache flags per mesh.
            let kind = mesh.userData.__glowKind as 0 | 1 | 2 | undefined;
            if (kind === undefined) {
              const lname = mesh.name.toLowerCase();
              if (lname.includes('interior_floor') || lname.includes('floor_slab')) kind = 1;
              else if (lname.includes('window_glass')) kind = 2;
              else kind = 0;
              mesh.userData.__glowKind = kind;
            }
            if (kind === 0) return;

            if (kind === 1 && mesh.material instanceof THREE.MeshStandardMaterial) {
              const mat = mesh.material;
              if (mat.emissiveIntensity !== undefined) {
                mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * 0.06;
                mat.emissive.lerp(moduleEmissiveScratch, 0.05);
              }
              return;
            }
            if (kind === 2 && mesh.material instanceof THREE.MeshPhysicalMaterial) {
              const mat = mesh.material;
              const glowIntensity = s.isSectionCutActive
                ? 0.15
                : 0.05 + Math.sin(t * 0.5 + (obj.userData.moduleIndex ?? 0)) * 0.02;
              if (mat.emissive) {
                mat.emissive.lerp(moduleEmissiveScratch, 0.02);
                mat.emissiveIntensity += (glowIntensity - mat.emissiveIntensity) * 0.05;
              }
              mat.reflectivity += (targetReflectivity - mat.reflectivity) * 0.02;
            }
          });
        });
      }

      // ─── Animate ground fog ───
      if (fogParticles) {
        const positions = fogParticles.geometry.attributes.position;
        if (positions) {
          for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            positions.setY(i, y + Math.sin(t * 0.3 + i) * 0.0005);
          }
          positions.needsUpdate = true;
        }
        // Fog opacity varies by mode
        const fogMat = fogParticles.material as THREE.PointsMaterial;
        const targetOpacity = s.experienceMode === 'hero' ? 0.2 : s.experienceMode === 'sectioncut' ? 0.08 : 0.12;
        fogMat.opacity += (targetOpacity - fogMat.opacity) * 0.02;
      }

      renderer.render(scene, camera);
    };

    // ─── Start ───
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('touchstart', onTouchStart, { passive: true });
    mount.addEventListener('touchmove', onTouchMove, { passive: true });
    mount.addEventListener('touchend', onTouchEnd);
    mount.addEventListener('contextmenu', onContextMenu);
    resize();

    // ─── Pre-compile all materials/shaders before first paint.
    // Without this, Three.js compiles GLSL on first encounter of each
    // material — that synchronous compile causes the ~1.5s long task
    // measured on Hero. Doing it up front amortizes the cost into the
    // initial mount, so the very first animate() frame already has
    // every program linked. ───
    try {
      renderer.compile(scene, camera);
    } catch (err) {
      console.warn('[SceneCanvas] renderer.compile failed', err);
    }

    animate();

    // ─── Cleanup ───
    return () => {
      alive = false;
      window.cancelAnimationFrame(frameId);
      visibilityObs.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('touchstart', onTouchStart);
      mount.removeEventListener('touchmove', onTouchMove);
      mount.removeEventListener('touchend', onTouchEnd);
      mount.removeEventListener('contextmenu', onContextMenu);
      disposeObject3D(scene);
      if (envTexture) envTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglFailed) {
    return <CSSFallback />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      />
      {/* Orbit controls hint for configurator mode */}
      <OrbitHint />
    </div>
  );
}

/* ─── Orbit controls hint overlay ─── */
function OrbitHint() {
  const experienceMode = useAppStore((s) => s.experienceMode);

  if (experienceMode !== 'configurator') return null;

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      style={{ animation: 'fadeIn 0.8s ease-out' }}
    >
      <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
        <p className="text-[11px] text-white/60 tracking-wider whitespace-nowrap">
          Ziehen zum Drehen &bull; Scrollen zum Zoomen
        </p>
      </div>
    </div>
  );
}
