'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
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
  { x: -3.1, y: 0.65, z: 0 },   // ground-0
  { x: 0, y: 0.65, z: 0 },       // ground-1
  { x: 3.1, y: 0.65, z: 0 },     // ground-2
  { x: -3.1, y: 2.0, z: 0 },     // upper-0
  { x: 0, y: 2.0, z: 0 },        // upper-1
  { x: 3.1, y: 2.0, z: 0 },      // upper-2
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

/* ─── Create loaders ─── */
function createLoaders() {
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);

  const hdr = new HDRLoader();

  return { gltf, hdr, draco };
}

/* ─── Apply architectural materials to loaded GLB models ─── */
function applyArchitecturalMaterials(root: THREE.Object3D) {
  root.traverse((object) => {
    object.frustumCulled = false;
    if (!(object as THREE.Mesh).isMesh) return;

    const mesh = object as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const name = mesh.name.toLowerCase();
    const materialName = mesh.material && 'name' in mesh.material ? (mesh.material as THREE.MeshStandardMaterial).name?.toLowerCase?.() || '' : '';
    const tag = `${name} ${materialName}`;

    if (tag.includes('glass') || tag.includes('window')) {
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: '#d9f3ff',
        transparent: true,
        opacity: 0.36,
        roughness: 0.02,
        metalness: 0,
        transmission: 0.55,
        thickness: 0.18,
        ior: 1.45,
        side: THREE.DoubleSide,
      });
      return;
    }

    if (tag.includes('steel') || tag.includes('frame') || tag.includes('rail')) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: '#b8c0c8',
        roughness: 0.36,
        metalness: 0.82,
      });
      return;
    }

    if (tag.includes('concrete') || tag.includes('slab') || tag.includes('plinth')) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: '#9b9b95',
        roughness: 0.92,
        metalness: 0.02,
      });
      return;
    }

    if (tag.includes('wood') || tag.includes('floor') || tag.includes('deck')) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: '#8a6b4d',
        roughness: 0.82,
        metalness: 0.02,
      });
      return;
    }

    if (tag.includes('green') || tag.includes('plant') || tag.includes('moss')) {
      mesh.material = new THREE.MeshStandardMaterial({
        color: '#3f6346',
        roughness: 1,
        metalness: 0,
      });
      return;
    }

    if (!mesh.material || Array.isArray(mesh.material)) {
      mesh.material = new THREE.MeshStandardMaterial({ color: '#8f9698', roughness: 0.7, metalness: 0.16 });
    } else {
      mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.roughness = Math.max(mat.roughness ?? 0.55, 0.48);
      mat.metalness = Math.min(mat.metalness ?? 0.12, 0.55);
    }
  });
}

/* ─── Create realistic fallback architectural massing module ─── */
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

  // Tint wall color based on module type
  const wallColor = new THREE.Color(def.color);
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.55, metalness: 0.45 });

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
  // Side walls
  add([0.1, 1.1, 1.3], [-1.35, 0, 0], wallMat, 'side_wall_left');
  add([0.1, 1.1, 1.3], [1.35, 0, 0], wallMat, 'side_wall_right');
  // Back wall
  add([2.8, 1.1, 0.08], [0, 0, -0.65], wallDark, 'back_wall');
  // Large cutaway glass on front
  add([2.46, 0.72, 0.04], [0, 0.05, 0.69], glass, 'large_cutaway_glass');

  // Front steel frame
  add([2.95, 0.06, 0.08], [0, 0.62, 0.72], steel, 'front_top_steel_frame');
  add([2.95, 0.06, 0.08], [0, -0.62, 0.72], steel, 'front_bottom_steel_frame');
  add([0.06, 1.25, 0.08], [-1.46, 0, 0.72], steel, 'front_left_steel_frame');
  add([0.06, 1.25, 0.08], [1.46, 0, 0.72], steel, 'front_right_steel_frame');

  // Corrugation ridges on front and back
  for (let i = 0; i < 10; i++) {
    const y = -0.45 + (i * 0.1);
    add([2.6, 0.008, 0.004], [0, y, 0.68], new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.85, roughness: 0.25 }), `corr-front-${i}`);
    add([2.6, 0.008, 0.004], [0, y, -0.68], new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.85, roughness: 0.25 }), `corr-back-${i}`);
  }

  // Interior furniture based on module type
  const woodMat = new THREE.MeshStandardMaterial({ color: '#7a6147', roughness: 0.78 });
  const furnitureMat = new THREE.MeshStandardMaterial({ color: '#626b73', roughness: 0.9 });
  const emissiveColor = new THREE.Color(def.emissiveColor);

  // Floor interior
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#1a1510',
    emissive: emissiveColor,
    emissiveIntensity: 0.05,
    metalness: 0,
    roughness: 0.9,
  });
  add([2.6, 0.02, 1.1], [0, -0.49, 0], floorMat, 'interior_floor');

  if (def.type === 'wohnen') {
    // Sofa
    add([0.8, 0.2, 0.35], [-0.5, -0.34, -0.15], furnitureMat, 'interior_sofa');
    // Sofa back
    add([0.8, 0.12, 0.06], [-0.5, -0.2, -0.3], furnitureMat, 'sofa_back');
    // Coffee table
    add([0.45, 0.04, 0.25], [-0.3, -0.43, 0.1], woodMat, 'interior_table');
    // TV
    add([0.5, 0.28, 0.02], [0.6, -0.2, -0.55], new THREE.MeshStandardMaterial({ color: '#111', emissive: '#223344', emissiveIntensity: 0.15 }), 'tv');
  } else if (def.type === 'schlafen') {
    // Bed
    add([0.9, 0.12, 0.55], [0.1, -0.38, 0], furnitureMat, 'bed');
    // Headboard
    add([0.05, 0.25, 0.55], [-0.35, -0.22, 0], woodMat, 'headboard');
    // Pillows
    add([0.18, 0.04, 0.2], [-0.25, -0.28, -0.1], new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.5 }), 'pillow_1');
    add([0.18, 0.04, 0.2], [-0.25, -0.28, 0.1], new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.5 }), 'pillow_2');
  } else if (def.type === 'kueche') {
    // Counter
    add([1.0, 0.16, 0.3], [0.3, -0.38, -0.3], furnitureMat, 'counter');
    // Counter top
    add([1.02, 0.02, 0.32], [0.3, -0.29, -0.3], new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.5 }), 'counter_top');
    // Upper cabinets
    add([0.8, 0.2, 0.12], [0.2, -0.08, -0.55], furnitureMat, 'upper_cabinets');
  } else if (def.type === 'bad') {
    // Shower glass
    add([0.4, 0.4, 0.02], [-0.7, -0.2, -0.2], new THREE.MeshPhysicalMaterial({ color: '#cce5ff', transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.4 }), 'shower_glass');
    // Shower base
    add([0.45, 0.02, 0.4], [-0.7, -0.47, -0.05], new THREE.MeshStandardMaterial({ color: '#ddd', roughness: 0.7 }), 'shower_base');
    // Vanity
    add([0.4, 0.1, 0.2], [0.6, -0.38, 0.2], woodMat, 'vanity');
    // Mirror
    add([0.35, 0.22, 0.01], [0.6, -0.12, 0.35], new THREE.MeshStandardMaterial({ color: '#aaccee', metalness: 0.9, roughness: 0.05 }), 'mirror');
  }

  // Window configurations based on type
  const windowFrameMat = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.8, roughness: 0.2 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: def.type === 'bad' ? '#e0e8f0' : '#cce5ff',
    transmission: def.type === 'bad' ? 0.5 : 0.9,
    roughness: def.type === 'bad' ? 0.6 : 0.05,
    thickness: 0.02,
    ior: 1.5,
    metalness: 0,
    transparent: true,
    opacity: 0.5,
  });

  const addWindow = (wx: number, wy: number, wz: number, ww: number, wh: number) => {
    // Frame
    add([ww + 0.04, 0.02, 0.01], [wx, wy + wh / 2 + 0.01, wz], windowFrameMat, `win-frame-top`);
    add([ww + 0.04, 0.02, 0.01], [wx, wy - wh / 2 - 0.01, wz], windowFrameMat, `win-frame-bottom`);
    add([0.02, wh + 0.04, 0.01], [wx - ww / 2 - 0.01, wy, wz], windowFrameMat, `win-frame-left`);
    add([0.02, wh + 0.04, 0.01], [wx + ww / 2 + 0.01, wy, wz], windowFrameMat, `win-frame-right`);
    // Glass
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
    // Door handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.06, 6),
      new THREE.MeshStandardMaterial({ color: '#c9a96e', metalness: 0.9, roughness: 0.1 }),
    );
    handle.position.set(-1.22, -0.1, 0.72);
    handle.rotation.x = Math.PI / 2;
    root.add(handle);
  }

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

/* ─── Setup renderer ─── */
function setupRenderer(mount: HTMLDivElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  mount.appendChild(renderer.domElement);
  return renderer;
}

/* ─── Add architectural lighting ─── */
function addArchitecturalLighting(scene: THREE.Scene) {
  // Hemisphere light for ambient fill
  scene.add(new THREE.HemisphereLight('#dbeafe', '#111827', 0.72));

  // Directional sun light with shadows
  const sun = new THREE.DirectionalLight('#fff4e6', 3.4);
  sun.position.set(7, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // Interior warm glow
  const interiorGlow = new THREE.PointLight('#ffd9a3', 3.5, 10);
  interiorGlow.position.set(-1.6, 1.1, 1.8);
  scene.add(interiorGlow);

  // Blue fill light from opposite side
  const blueFill = new THREE.PointLight('#8bd3ff', 2.8, 12);
  blueFill.position.set(3.8, 2.2, 3.2);
  scene.add(blueFill);
}

/* ─── Create ground plane + concrete plinth ─── */
function createGroundPlane(scene: THREE.Scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42),
    new THREE.MeshStandardMaterial({ color: '#111418', roughness: 0.94, metalness: 0.02 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.9;
  ground.receiveShadow = true;
  scene.add(ground);

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

/* ─── Load GLB model ─── */
async function loadGLB(loader: GLTFLoader, url: string): Promise<THREE.Group> {
  const gltf = await loader.loadAsync(url);
  const scene = gltf.scene || gltf.scenes?.[0];
  if (!scene) throw new Error(`No scene found in ${url}`);
  applyArchitecturalMaterials(scene);
  return scene;
}

/* ─── Load HDRI environment ─── */
async function loadHDRI(
  loader: HDRLoader,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  url: string,
): Promise<THREE.Texture | null> {
  try {
    const texture = await loader.loadAsync(url);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    renderer.toneMappingExposure = 1.08;
    return texture;
  } catch {
    // HDRI missing - use procedural lighting only
    return null;
  }
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

/* ═══════════════════════════════════════
   Main SceneCanvas Component
   ═══════════════════════════════════════ */
export default function SceneCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
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
    // Initialize with current state
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
    const { gltf, hdr, draco } = createLoaders();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050608');
    scene.fog = new THREE.Fog('#050608', 10, 28);

    const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 100);
    camera.position.set(0.8, 1.6, 8.2);

    const renderer = setupRenderer(mount);
    addArchitecturalLighting(scene);
    createGroundPlane(scene);

    // Root group for all modules
    const root = new THREE.Group();
    scene.add(root);

    // Module objects for assembly animation
    const moduleObjects: THREE.Group[] = [];
    let environmentTexture: THREE.Texture | null = null;
    let alive = true;

    // ─── Load scene assets ───
    const loadScene = async () => {
      // Try HDRI
      environmentTexture = await loadHDRI(hdr, renderer, scene, '/hdr/architectural_studio_2k.hdr');

      if (!alive) return;

      // Create 6 fallback modules (since we don't have actual GLB models)
      for (let i = 0; i < 6; i++) {
        const def = DEFAULT_MODULE_DEFS[i];
        const target = MODULE_TARGETS[i];

        let moduleGroup: THREE.Group;

        // Try to load GLB, fall back to architectural massing
        try {
          const moduleUrl = `/models/omniliving/modules/${def.type}.glb`;
          moduleGroup = await loadGLB(gltf, moduleUrl);
        } catch {
          moduleGroup = createFallbackArchitecturalMassing(def, i);
        }

        if (!alive) return;

        moduleGroup.userData.moduleIndex = i;
        moduleGroup.userData.moduleDef = def;
        moduleGroup.userData.targetX = target.x;
        moduleGroup.userData.targetY = target.y;
        moduleGroup.userData.targetZ = target.z;

        // Start off-screen with rotation
        const startSide = i % 2 === 0 ? -1.8 : 1.8;
        moduleGroup.position.set(target.x + startSide, -4.4, target.z + 2.4);
        moduleGroup.scale.setScalar(0.001);
        moduleGroup.rotation.y = (1) * (i % 2 === 0 ? -0.55 : 0.55);

        root.add(moduleGroup);
        moduleObjects.push(moduleGroup);
      }
    };

    loadScene();

    // ─── Pointer tracking ───
    const pointerRef = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerRef.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      pointerRef.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
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

    // Camera smoothing state
    const camPos = new THREE.Vector3(0.8, 1.6, 8.2);
    const camLook = new THREE.Vector3(0, 0.3, 0);

    const animate = () => {
      if (!alive) return;

      const t = (performance.now() - startTime) / 1000;
      const s = storeRef.current;
      const p = s.scrollProgress;
      const px = pointerRef.x;
      const py = pointerRef.y;

      // ─── Camera modes ───
      let targetCamPos: THREE.Vector3;
      let targetLookAt: THREE.Vector3;

      if (s.experienceMode === 'hero') {
        // Cinematic slow orbit with mouse parallax
        const orbit = t * 0.13;
        targetCamPos = new THREE.Vector3(
          0.8 + px * 0.24 + Math.sin(orbit) * 0.6,
          1.55 + py * 0.07 + Math.sin(t * 0.11) * 0.08,
          8.8 + Math.cos(orbit) * 0.3,
        );
        targetLookAt = new THREE.Vector3(0, 0.22, 0);
      } else if (s.experienceMode === 'building') {
        // Dolly in as modules assemble
        const dolly = easeInOutCubic(clamp((p - 0.08) * 1.18));
        targetCamPos = new THREE.Vector3(
          px * 0.24,
          1.5 + dolly * 0.7,
          8.2 - dolly * 1.7,
        );
        targetLookAt = new THREE.Vector3(0, 0.28 + dolly * 0.14, 0);
      } else if (s.experienceMode === 'sectioncut') {
        // Closer camera from above for section cut view
        targetCamPos = new THREE.Vector3(
          1.5 + px * 0.3,
          3.0 + py * 0.15,
          5.5,
        );
        targetLookAt = new THREE.Vector3(0, 0.8, 0);
      } else {
        // Configurator: slow orbit with mouse parallax
        const orbit = t * 0.1;
        targetCamPos = new THREE.Vector3(
          5 + Math.sin(orbit) * 2 + px * 1.5,
          3 + py * 0.5,
          7 + Math.cos(orbit) * 1.5,
        );
        targetLookAt = new THREE.Vector3(0, 1.0, 0);
      }

      // Smooth camera
      camPos.lerp(targetCamPos, 0.025);
      camLook.lerp(targetLookAt, 0.025);
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // Subtle root rotation for parallax feel
      if (s.experienceMode === 'configurator') {
        const targetRotY = Math.sin(t * 0.1) * 0.15;
        root.rotation.y += (targetRotY - root.rotation.y) * 0.02;
      } else if (s.experienceMode === 'hero') {
        const targetRotY = Math.sin(t * 0.05) * 0.05;
        root.rotation.y += (targetRotY - root.rotation.y) * 0.01;
      } else {
        root.rotation.y += (0 - root.rotation.y) * 0.02;
      }

      // ─── Module assembly animation ───
      // Compute building progress from scroll (0-0.7 range → 0-1 build)
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

      // ─── Section cut effect (opacity-based) ───
      if (s.isSectionCutActive && moduleObjects.length > 0) {
        // Compute cursor world position approximation
        const cursorWorldX = (s.cursorPosition.x - 0.5) * 8;
        const cursorWorldY = s.cursorPosition.y * 3;

        moduleObjects.forEach((obj) => {
          obj.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;

            // Compute distance from cursor to mesh center in world
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            const dist = Math.sqrt(
              (worldPos.x - cursorWorldX) ** 2 +
              (worldPos.y - cursorWorldY) ** 2,
            );

            // Make walls/side_walls/back_wall near cursor transparent
            const name = mesh.name.toLowerCase();
            const isWall = name.includes('wall') || name.includes('side_wall') || name.includes('back_wall');

            if (isWall && dist < 3.5) {
              const targetOpacity = clamp(1.0 - (3.5 - dist) / 3.5, 0.08, 1.0);
              if (!mat.transparent) {
                mat.transparent = true;
                mat.opacity = 1.0;
              }
              mat.opacity += (targetOpacity - mat.opacity) * 0.08;

              // Add golden rim for close modules
              if (dist < 2.5) {
                const rimStrength = clamp(1.0 - dist / 2.5, 0, 0.5);
                const pulse = 0.85 + 0.15 * Math.sin(t * 3.0);
                const rimColor = new THREE.Color(0.788, 0.663, 0.431);
                if (mat.emissive) {
                  const currentEmissive = mat.emissive.clone();
                  const targetEmissive = rimColor.multiplyScalar(rimStrength * pulse);
                  mat.emissive.copy(currentEmissive.lerp(targetEmissive, 0.05));
                  mat.emissiveIntensity += (rimStrength * pulse - mat.emissiveIntensity) * 0.05;
                }
              }
            } else if (isWall) {
              // Restore full opacity
              if (mat.transparent) {
                mat.opacity += (1.0 - mat.opacity) * 0.05;
                if (mat.opacity > 0.99) {
                  mat.opacity = 1.0;
                  mat.transparent = false;
                }
              }
              // Reset emissive
              if (mat.emissive && mat.emissiveIntensity > 0.01) {
                mat.emissiveIntensity *= 0.95;
              }
            }
          });
        });
      } else {
        // Reset all materials to normal
        moduleObjects.forEach((obj) => {
          obj.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.transparent && !mesh.name.includes('glass') && !mesh.name.includes('window') && mesh.name !== 'door') {
              mat.opacity += (1.0 - mat.opacity) * 0.05;
              if (mat.opacity > 0.99) {
                mat.opacity = 1.0;
                mat.transparent = false;
              }
            }
            if (mat.emissive && mat.emissiveIntensity > 0.01 && !mesh.name.includes('floor') && !mesh.name.includes('tv')) {
              mat.emissiveIntensity *= 0.95;
            }
          });
        });
      }

      // ─── Update module colors based on moduleAssignments ───
      moduleObjects.forEach((obj, i) => {
        const defaultDef = DEFAULT_MODULE_DEFS[i];
        const effectiveDef = s.moduleAssignments[defaultDef.id] || defaultDef;
        // If the module def changed, we'd rebuild - for now just tint
        obj.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          const name = mesh.name.toLowerCase();
          if (name.includes('side_wall') && mesh.material instanceof THREE.MeshStandardMaterial) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            const targetColor = new THREE.Color(effectiveDef.color);
            mat.color.lerp(targetColor, 0.02);
          }
        });
      });

      // ─── Interior glow during section cut ───
      if (s.experienceMode === 'sectioncut' || s.experienceMode === 'building') {
        moduleObjects.forEach((obj) => {
          obj.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            const name = mesh.name.toLowerCase();
            if ((name.includes('interior_floor') || name.includes('floor_slab')) && mesh.material instanceof THREE.MeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              const def = DEFAULT_MODULE_DEFS[obj.userData.moduleIndex ?? 0] || DEFAULT_MODULE_DEFS[0];
              const effectiveDef = s.moduleAssignments[def.id] || def;
              const targetIntensity = s.isSectionCutActive ? 0.3 : 0.05;
              if (mat.emissiveIntensity !== undefined) {
                mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * 0.06;
                const targetEmissive = new THREE.Color(effectiveDef.emissiveColor);
                mat.emissive.lerp(targetEmissive, 0.05);
              }
            }
          });
        });
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    // ─── Start ───
    window.addEventListener('resize', resize);
    mount.addEventListener('pointermove', onPointerMove);
    resize();
    animate();

    // ─── Cleanup ───
    return () => {
      alive = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      mount.removeEventListener('pointermove', onPointerMove);
      disposeObject3D(scene);
      if (environmentTexture) environmentTexture.dispose();
      draco.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
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
  );
}
