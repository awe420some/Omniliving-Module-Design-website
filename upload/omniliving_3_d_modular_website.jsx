import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const ASSETS = {
  heroBuilding: "/models/omniliving/hero-building.glb",
  site: "/models/omniliving/site-context.glb",
  modules: [
    { id: "living", label: "Living", url: "/models/omniliving/modules/living.glb", target: [-3.2, 1.55, 0] },
    { id: "kitchen", label: "Kitchen", url: "/models/omniliving/modules/kitchen.glb", target: [0, 1.55, 0] },
    { id: "studio", label: "Studio", url: "/models/omniliving/modules/studio.glb", target: [3.2, 1.55, 0] },
    { id: "sleep", label: "Sleep", url: "/models/omniliving/modules/sleep.glb", target: [-3.2, 0, 0] },
    { id: "bath", label: "Bath", url: "/models/omniliving/modules/bath.glb", target: [0, 0, 0] },
    { id: "terrace", label: "Terrace", url: "/models/omniliving/modules/terrace.glb", target: [3.2, 0, 0] }
  ],
  hdri: "/hdr/architectural_studio_2k.hdr"
};

function clamp(value, min = 0, max = 1) {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.min(max, Math.max(min, safe));
}

function easeOutCubic(value) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(value) {
  const t = clamp(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getBuildProgress(progress, index) {
  return clamp((progress - index * 0.075) * 1.65);
}

function runTests() {
  console.assert(Array.isArray(ASSETS.modules), "ASSETS.modules must be an array");
  console.assert(ASSETS.modules.length === 6, "There should be 6 module assets");
  console.assert(ASSETS.modules.every((module) => typeof module.url === "string"), "Every module needs a GLB url");
  console.assert(ASSETS.modules.every((module) => Array.isArray(module.target) && module.target.length === 3), "Every module needs a 3D target");
  console.assert(getBuildProgress(-1, 0) === 0, "Build progress clamps below 0");
  console.assert(getBuildProgress(2, 0) === 1, "Build progress clamps above 1");
  console.assert(easeOutCubic(0) === 0, "easeOutCubic starts at 0");
  console.assert(easeOutCubic(1) === 1, "easeOutCubic ends at 1");
  console.assert(easeInOut(0) === 0, "easeInOut starts at 0");
  console.assert(easeInOut(1) === 1, "easeInOut ends at 1");
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(clamp(window.scrollY / maxScroll));
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return progress;
}

function createLoaders() {
  const draco = new DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);

  const rgbe = new RGBELoader();

  return { gltf, rgbe, draco };
}

function applyArchitecturalMaterials(root) {
  root.traverse((object) => {
    object.frustumCulled = false;

    if (!object.isMesh) return;

    object.castShadow = true;
    object.receiveShadow = true;

    const name = object.name.toLowerCase();
    const materialName = object.material?.name?.toLowerCase?.() || "";
    const tag = `${name} ${materialName}`;

    if (tag.includes("glass") || tag.includes("window")) {
      object.material = new THREE.MeshPhysicalMaterial({
        color: "#d9f3ff",
        transparent: true,
        opacity: 0.36,
        roughness: 0.02,
        metalness: 0,
        transmission: 0.55,
        thickness: 0.18,
        ior: 1.45,
        side: THREE.DoubleSide
      });
      return;
    }

    if (tag.includes("steel") || tag.includes("frame") || tag.includes("rail")) {
      object.material = new THREE.MeshStandardMaterial({
        color: "#b8c0c8",
        roughness: 0.36,
        metalness: 0.82
      });
      return;
    }

    if (tag.includes("concrete") || tag.includes("slab") || tag.includes("plinth")) {
      object.material = new THREE.MeshStandardMaterial({
        color: "#9b9b95",
        roughness: 0.92,
        metalness: 0.02
      });
      return;
    }

    if (tag.includes("wood") || tag.includes("floor") || tag.includes("deck")) {
      object.material = new THREE.MeshStandardMaterial({
        color: "#8a6b4d",
        roughness: 0.82,
        metalness: 0.02
      });
      return;
    }

    if (tag.includes("green") || tag.includes("plant") || tag.includes("moss")) {
      object.material = new THREE.MeshStandardMaterial({
        color: "#3f6346",
        roughness: 1,
        metalness: 0
      });
      return;
    }

    if (!object.material || Array.isArray(object.material)) {
      object.material = new THREE.MeshStandardMaterial({ color: "#8f9698", roughness: 0.7, metalness: 0.16 });
    } else {
      object.material = object.material.clone();
      object.material.roughness = Math.max(object.material.roughness ?? 0.55, 0.48);
      object.material.metalness = Math.min(object.material.metalness ?? 0.12, 0.55);
    }
  });
}

function frameObject(object, camera, controlsTarget = new THREE.Vector3(0, 0.25, 0), distance = 7.8) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1);

  object.position.sub(center);
  object.position.y += 0.2;

  camera.position.set(0.35, maxDim * 0.32, distance);
  camera.lookAt(controlsTarget);
}

async function loadGLB(loader, url) {
  const gltf = await loader.loadAsync(url);
  const scene = gltf.scene || gltf.scenes?.[0];
  if (!scene) throw new Error(`No scene found in ${url}`);
  applyArchitecturalMaterials(scene);
  return scene;
}

async function loadHDRI(loader, renderer, scene, url) {
  try {
    const texture = await loader.loadAsync(url);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    renderer.toneMappingExposure = 1.08;
    return texture;
  } catch (error) {
    console.warn("HDRI missing, using procedural lighting only:", url, error);
    return null;
  }
}

function createFallbackArchitecturalMassing(label = "MODULE") {
  const root = new THREE.Group();
  root.name = `fallback_${label}`;

  const concrete = new THREE.MeshStandardMaterial({ color: "#8d918d", roughness: 0.88, metalness: 0.04 });
  const steel = new THREE.MeshStandardMaterial({ color: "#aeb6bd", roughness: 0.42, metalness: 0.72 });
  const glass = new THREE.MeshPhysicalMaterial({ color: "#d7f3ff", transparent: true, opacity: 0.34, roughness: 0.04, transmission: 0.45, thickness: 0.14 });
  const shadow = new THREE.MeshStandardMaterial({ color: "#20252a", roughness: 0.9, metalness: 0.08 });

  const add = (size, position, material, name) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };

  add([2.8, 0.1, 1.3], [0, -0.55, 0], concrete, "floor_slab");
  add([2.8, 0.1, 1.3], [0, 0.55, 0], concrete, "roof_slab");
  add([0.1, 1.1, 1.3], [-1.35, 0, 0], shadow, "side_wall_left");
  add([0.1, 1.1, 1.3], [1.35, 0, 0], shadow, "side_wall_right");
  add([2.8, 1.1, 0.08], [0, 0, -0.65], shadow, "back_wall");
  add([2.46, 0.72, 0.04], [0, 0.05, 0.69], glass, "large_cutaway_glass");

  add([2.95, 0.06, 0.08], [0, 0.62, 0.72], steel, "front_top_steel_frame");
  add([2.95, 0.06, 0.08], [0, -0.62, 0.72], steel, "front_bottom_steel_frame");
  add([0.06, 1.25, 0.08], [-1.46, 0, 0.72], steel, "front_left_steel_frame");
  add([0.06, 1.25, 0.08], [1.46, 0, 0.72], steel, "front_right_steel_frame");

  add([0.8, 0.06, 0.42], [-0.35, -0.34, 0.05], new THREE.MeshStandardMaterial({ color: "#7a6147", roughness: 0.78 }), "interior_table" );
  add([0.64, 0.22, 0.42], [0.58, -0.28, -0.05], new THREE.MeshStandardMaterial({ color: "#626b73", roughness: 0.9 }), "interior_sofa" );

  root.userData.isFallback = true;
  return root;
}

function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
    }
  });
}

function setupRenderer(mount) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);
  return renderer;
}

function addArchitecturalLighting(scene) {
  scene.add(new THREE.HemisphereLight("#dbeafe", "#111827", 0.72));

  const sun = new THREE.DirectionalLight("#fff4e6", 3.4);
  sun.position.set(7, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 10;
  sun.shadow.camera.bottom = -10;
  scene.add(sun);

  const interiorGlow = new THREE.PointLight("#ffd9a3", 3.5, 10);
  interiorGlow.position.set(-1.6, 1.1, 1.8);
  scene.add(interiorGlow);

  const blueFill = new THREE.PointLight("#8bd3ff", 2.8, 12);
  blueFill.position.set(3.8, 2.2, 3.2);
  scene.add(blueFill);
}

function createGroundPlane(scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42),
    new THREE.MeshStandardMaterial({ color: "#111418", roughness: 0.94, metalness: 0.02 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.9;
  ground.receiveShadow = true;
  scene.add(ground);

  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(10.2, 0.32, 4.4),
    new THREE.MeshStandardMaterial({ color: "#252a2f", roughness: 0.88, metalness: 0.06 })
  );
  plinth.position.set(0, -0.72, 0);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  scene.add(plinth);
}

function useImperativeScene({ mode, progress = 0 }) {
  const mountRef = useRef(null);
  const progressRef = useRef(progress);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const { gltf, rgbe, draco } = createLoaders();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050608");
    scene.fog = new THREE.Fog("#050608", 10, 28);

    const camera = new THREE.PerspectiveCamera(mode === "hero" ? 30 : 36, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 100);
    camera.position.set(0.8, 1.6, mode === "hero" ? 9.4 : 8.2);

    const renderer = setupRenderer(mount);
    addArchitecturalLighting(scene);
    createGroundPlane(scene);

    const root = new THREE.Group();
    scene.add(root);

    const moduleObjects = [];
    let heroObject = null;
    let environmentTexture = null;
    let alive = true;

    const loadScene = async () => {
      environmentTexture = await loadHDRI(rgbe, renderer, scene, ASSETS.hdri);

      if (mode === "hero") {
        try {
          heroObject = await loadGLB(gltf, ASSETS.heroBuilding);
        } catch (error) {
          console.warn("Hero GLB missing, using architectural fallback. Add:", ASSETS.heroBuilding, error);
          heroObject = new THREE.Group();
          ASSETS.modules.slice(0, 5).forEach((module, index) => {
            const fallback = createFallbackArchitecturalMassing(module.label);
            fallback.position.set(module.target[0] * 0.82, module.target[1] - 0.2, module.target[2]);
            fallback.scale.setScalar(0.82);
            heroObject.add(fallback);
          });
        }

        if (!alive) return;
        root.add(heroObject);
        frameObject(heroObject, camera, new THREE.Vector3(0, 0.3, 0), 8.6);
        return;
      }

      const loadedModules = await Promise.all(
        ASSETS.modules.map(async (module, index) => {
          try {
            const object = await loadGLB(gltf, module.url);
            object.userData.module = module;
            object.userData.index = index;
            return object;
          } catch (error) {
            console.warn("Module GLB missing, using fallback. Add:", module.url, error);
            const fallback = createFallbackArchitecturalMassing(module.label);
            fallback.userData.module = module;
            fallback.userData.index = index;
            return fallback;
          }
        })
      );

      if (!alive) return;

      loadedModules.forEach((object, index) => {
        const module = ASSETS.modules[index];
        object.position.set(module.target[0], -4.4, 2.4);
        object.scale.setScalar(0.001);
        root.add(object);
        moduleObjects.push(object);
      });
    };

    loadScene();

    const clock = new THREE.Clock();
    let frame = 0;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      pointerRef.current.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    };

    const animate = () => {
      const t = clock.getElapsedTime();
      const p = progressRef.current;
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      root.rotation.y = px * 0.045 + Math.sin(t * 0.13) * 0.018;
      root.rotation.x = py * 0.012;

      if (mode === "hero") {
        camera.position.x = 0.8 + px * 0.24 + Math.sin(t * 0.11) * 0.08;
        camera.position.y = 1.55 + py * 0.07;
        camera.position.z = 8.8 + Math.cos(t * 0.1) * 0.16;
        camera.lookAt(0, 0.22, 0);
      } else {
        const dolly = easeInOut(clamp((p - 0.08) * 1.18));
        camera.position.x = px * 0.24;
        camera.position.y = 1.5 + dolly * 0.7;
        camera.position.z = 8.2 - dolly * 1.7;
        camera.lookAt(0, 0.28 + dolly * 0.14, 0);

        moduleObjects.forEach((object, index) => {
          const module = object.userData.module;
          const build = easeOutCubic(getBuildProgress(p, index));
          const startSide = index % 2 === 0 ? -1.8 : 1.8;

          object.visible = build > 0.004;
          object.position.x = module.target[0] + (1 - build) * startSide;
          object.position.y = -4.4 + (module.target[1] + 4.4) * build;
          object.position.z = 2.4 + (module.target[2] - 2.4) * build;
          object.rotation.y = (1 - build) * (index % 2 === 0 ? -0.55 : 0.55);
          object.rotation.x = (1 - build) * 0.1;
          object.scale.setScalar(Math.max(0.001, build));
        });
      }

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", onPointerMove);
    resize();
    animate();

    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onPointerMove);
      disposeObject3D(scene);
      if (environmentTexture) environmentTexture.dispose();
      draco.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [mode]);

  return mountRef;
}

function HeroScene() {
  const mountRef = useImperativeScene({ mode: "hero" });
  return <div ref={mountRef} className="hero-three" />;
}

function BuildScene({ progress }) {
  const mountRef = useImperativeScene({ mode: "build", progress });
  return <div ref={mountRef} className="three-mount" />;
}

function ProgressBar({ progress }) {
  return (
    <div className="progress-wrap" aria-label="Build progress">
      <div className="progress-topline">
        <span>Construction Timeline</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}

function AssetChecklist() {
  return (
    <section className="asset-section">
      <div>
        <p className="eyebrow">Asset Pipeline</p>
        <h2>Real architecture needs real assets.</h2>
      </div>
      <div className="asset-grid">
        <code>/models/omniliving/hero-building.glb</code>
        <code>/models/omniliving/site-context.glb</code>
        <code>/models/omniliving/modules/living.glb</code>
        <code>/models/omniliving/modules/kitchen.glb</code>
        <code>/models/omniliving/modules/studio.glb</code>
        <code>/models/omniliving/modules/sleep.glb</code>
        <code>/models/omniliving/modules/bath.glb</code>
        <code>/models/omniliving/modules/terrace.glb</code>
        <code>/hdr/architectural_studio_2k.hdr</code>
      </div>
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; background: #050608; }

      .page {
        min-height: 100vh;
        overflow-x: hidden;
        color: white;
        background:
          radial-gradient(circle at 72% 18%, rgba(148, 163, 184, 0.13), transparent 30%),
          radial-gradient(circle at 18% 24%, rgba(96, 165, 250, 0.1), transparent 28%),
          linear-gradient(180deg, #050608 0%, #080a0e 48%, #0a0d12 100%);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .hero {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        display: grid;
        align-items: center;
        padding: 24px 7vw;
      }

      .hero-three, .three-mount {
        position: absolute;
        inset: 0;
      }

      .hero::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
        background:
          linear-gradient(90deg, rgba(5, 6, 8, 0.96) 0%, rgba(5, 6, 8, 0.78) 36%, rgba(5, 6, 8, 0.18) 70%, rgba(5, 6, 8, 0.72) 100%),
          linear-gradient(180deg, rgba(5, 6, 8, 0.2), rgba(5, 6, 8, 0.86));
        pointer-events: none;
      }

      .hero::after {
        content: "";
        position: absolute;
        inset: auto 0 0;
        height: 190px;
        z-index: 2;
        background: linear-gradient(180deg, transparent, #050608);
        pointer-events: none;
      }

      .hero-inner {
        position: relative;
        z-index: 3;
        max-width: 860px;
        padding-top: 5vh;
      }

      .eyebrow {
        margin: 0 0 20px;
        color: rgba(226, 232, 240, 0.74);
        font-size: 12px;
        letter-spacing: 0.34em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        max-width: 940px;
        font-size: clamp(58px, 9vw, 132px);
        line-height: 0.88;
        letter-spacing: -0.085em;
      }

      .hero-copy, .section-copy {
        max-width: 760px;
        margin: 26px 0 0;
        color: rgba(255, 255, 255, 0.68);
        font-size: 18px;
        line-height: 1.62;
      }

      .hero-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 30px;
      }

      .primary-btn, .ghost-btn {
        border-radius: 999px;
        padding: 14px 18px;
        font-weight: 750;
        text-decoration: none;
      }

      .primary-btn {
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #081018;
        background: linear-gradient(90deg, #e5e7eb, #bae6fd);
      }

      .ghost-btn {
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: rgba(255, 255, 255, 0.78);
        background: rgba(255, 255, 255, 0.055);
        backdrop-filter: blur(14px);
      }

      .hero-note {
        position: absolute;
        right: 6vw;
        bottom: 9vh;
        z-index: 3;
        width: min(390px, 34vw);
        padding: 18px;
        border-radius: 26px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(8, 12, 18, 0.56);
        backdrop-filter: blur(18px);
        color: rgba(255,255,255,.72);
      }

      .hero-note b { display: block; margin-bottom: 8px; color: white; }

      .scroll-scene { height: 250vh; position: relative; }

      .sticky-scene {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgba(5, 6, 8, 0.12), rgba(5, 6, 8, 0.94)),
          radial-gradient(circle at 50% 48%, rgba(96, 165, 250, 0.13), transparent 44%);
      }

      .scene-caption {
        pointer-events: none;
        position: absolute;
        top: 28px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
        width: min(760px, 86vw);
        text-align: center;
        color: rgba(255,255,255,.66);
        font-size: 14px;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .progress-wrap {
        pointer-events: none;
        position: absolute;
        z-index: 2;
        left: 50%;
        bottom: 32px;
        width: min(640px, 84vw);
        transform: translateX(-50%);
        padding: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.055);
        backdrop-filter: blur(16px);
      }

      .progress-topline {
        display: flex;
        justify-content: space-between;
        margin: 0 4px 8px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        letter-spacing: .16em;
        text-transform: uppercase;
      }

      .progress-track { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.1); }
      .progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #cbd5e1, #93c5fd, #38bdf8); transition: width 120ms linear; }

      .content-section, .asset-section { padding: 108px 8vw; }
      .content-section.dark { background: #111318; }

      h2 { margin: 0; font-size: clamp(34px, 5vw, 66px); letter-spacing: -0.046em; }

      .features, .asset-grid {
        margin: 36px 0 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .features { list-style: none; }

      .features li, .asset-grid code {
        min-height: 132px;
        padding: 22px;
        border: 1px solid rgba(255, 255, 255, 0.11);
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.76);
        line-height: 1.45;
      }

      .asset-grid code {
        min-height: auto;
        font-size: 13px;
        overflow-wrap: anywhere;
        color: rgba(226, 232, 240, 0.82);
      }

      footer { padding: 42px; text-align: center; color: rgba(255, 255, 255, 0.48); }

      @media (max-width: 980px) {
        .hero-note { display: none; }
        .features, .asset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .hero::before { background: linear-gradient(180deg, rgba(5,6,8,.88), rgba(5,6,8,.76)); }
      }

      @media (max-width: 760px) {
        .features, .asset-grid { grid-template-columns: 1fr; }
        .scroll-scene { height: 230vh; }
        .hero-actions { justify-content: stretch; }
        .primary-btn, .ghost-btn { width: 100%; text-align: center; }
      }
    `}</style>
  );
}

export default function App() {
  const progress = useScrollProgress();

  useEffect(() => {
    runTests();
  }, []);

  return (
    <main className="page">
      <Styles />

      <section className="hero">
        <HeroScene />
        <div className="hero-inner">
          <p className="eyebrow">Photoreal Asset Pipeline</p>
          <h1>Omniliving Module Design</h1>
          <p className="hero-copy">
            Realistische Architektur-Website mit GLB-Modellen, PBR-Materiallogik, HDRI-Licht, Schatten und scrollgesteuerter Modulmontage. Keine Lego-Quader, sondern vorbereitete Asset-Pipeline für echte Architekturvisualisierung.
          </p>
          <div className="hero-actions">
            <a className="primary-btn" href="#build">Bau-Sequenz ansehen</a>
            <a className="ghost-btn" href="#assets">Asset-Struktur prüfen</a>
          </div>
        </div>

        <aside className="hero-note">
          <b>Wichtig</b>
          Fotorealismus kommt nicht aus Code-Boxen. Diese Version lädt echte GLB-Architekturmodelle und nutzt nur dann eine fallback massing preview, wenn Assets fehlen.
        </aside>
      </section>

      <section id="build" className="scroll-scene">
        <div className="sticky-scene">
          <BuildScene progress={progress} />
          <div className="scene-caption">GLB modules assemble into the building during scroll</div>
          <ProgressBar progress={progress} />
        </div>
      </section>

      <section className="content-section dark">
        <h2>Realistic architecture, not procedural boxes.</h2>
        <p className="section-copy">
          Die Szene ist jetzt für echte Blender/GLB-Modelle vorbereitet: Fassaden, Schnittmodelle, Fenster, Möbel, Texturen und Site-Kontext kommen als Assets rein. Der Code macht Licht, Kamera, Scroll-Choreografie und Material-Normalisierung.
        </p>
      </section>

      <AssetChecklist />

      <section id="features" className="content-section">
        <h2>Features</h2>
        <ul className="features">
          <li>GLTF/GLB based architecture scene instead of procedural Lego geometry</li>
          <li>DRACO-ready model loading for compressed production assets</li>
          <li>HDRI environment support with ACES tone mapping</li>
          <li>Scroll-driven module assembly with fallback previews for missing files</li>
        </ul>
      </section>

      <footer>Omniliving Module Design GmbH</footer>
    </main>
  );
}
