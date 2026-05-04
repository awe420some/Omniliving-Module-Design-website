'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface ContainerSceneProps {
  selectedModules: string[];
  isAssembling: boolean;
  onModuleClick?: (moduleId: string) => void;
}

interface ModuleData {
  id: string;
  name: string;
  color: number;
  defaultPos: THREE.Vector3;
  selectedPos: THREE.Vector3;
  assembledPos: THREE.Vector3;
  mesh: THREE.Mesh | null;
  edges: THREE.LineSegments | null;
  label: string;
}

const MODULE_CONFIGS = [
  {
    id: 'wohnmodul',
    name: 'Wohnmodul',
    color: 0x4a9eff,
    defaultPos: new THREE.Vector3(-3.5, 0, 0),
    selectedPos: new THREE.Vector3(-2, 0, 0),
    assembledPos: new THREE.Vector3(-2.1, 0, 0),
  },
  {
    id: 'schlafmodul',
    name: 'Schlafmodul',
    color: 0xc9a96e,
    defaultPos: new THREE.Vector3(-1.2, 1.8, 0),
    selectedPos: new THREE.Vector3(-0.5, 1.2, 0),
    assembledPos: new THREE.Vector3(0, 0, 0),
  },
  {
    id: 'kuechenmodul',
    name: 'Küchenmodul',
    color: 0xff6b4a,
    defaultPos: new THREE.Vector3(1.2, -1.8, 0),
    selectedPos: new THREE.Vector3(0.5, -1.2, 0),
    assembledPos: new THREE.Vector3(2.1, 0, 0),
  },
  {
    id: 'badmodul',
    name: 'Badmodul',
    color: 0x4aff9e,
    defaultPos: new THREE.Vector3(3.5, 0, 0),
    selectedPos: new THREE.Vector3(2, 0, 0),
    assembledPos: new THREE.Vector3(0, 1.6, 0),
  },
];

export default function ContainerScene({
  selectedModules,
  isAssembling,
  onModuleClick,
}: ContainerSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modulesRef = useRef<ModuleData[]>([]);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const selectedModulesRef = useRef<string[]>(selectedModules);
  const isAssemblingRef = useRef(isAssembling);

  // Keep refs in sync with props via effect
  useEffect(() => {
    selectedModulesRef.current = selectedModules;
  }, [selectedModules]);
  useEffect(() => {
    isAssemblingRef.current = isAssembling;
  }, [isAssembling]);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);

      const meshes = modulesRef.current
        .map((m) => m.mesh)
        .filter(Boolean) as THREE.Mesh[];

      const intersects = raycasterRef.current.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const mod = modulesRef.current.find((m) => m.mesh === hitMesh);
        if (mod && onModuleClick) {
          onModuleClick(mod.id);
        }
      }
    },
    [onModuleClick]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.05);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xc9a96e, 1.5, 15);
    pointLight1.position.set(-5, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4a9eff, 1, 15);
    pointLight2.position.set(5, -2, 3);
    scene.add(pointLight2);

    // Ground plane
    const groundGeom = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a14,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.4;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create container modules
    const containerWidth = 2;
    const containerHeight = 1.4;
    const containerDepth = 1.2;

    modulesRef.current = MODULE_CONFIGS.map((config) => {
      // Main container body
      const geometry = new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth);
      const material = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.8,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(config.defaultPos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Accent edges
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.6,
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      mesh.add(edges);

      // Accent stripe on front face
      const stripeGeom = new THREE.PlaneGeometry(containerWidth * 0.9, 0.03);
      const stripeMat = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const stripe = new THREE.Mesh(stripeGeom, stripeMat);
      stripe.position.z = containerDepth / 2 + 0.01;
      stripe.position.y = -containerHeight * 0.25;
      mesh.add(stripe);

      // Second stripe
      const stripe2Geom = new THREE.PlaneGeometry(containerWidth * 0.9, 0.03);
      const stripe2Mat = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const stripe2 = new THREE.Mesh(stripe2Geom, stripe2Mat);
      stripe2.position.z = containerDepth / 2 + 0.01;
      stripe2.position.y = containerHeight * 0.15;
      mesh.add(stripe2);

      return {
        id: config.id,
        name: config.name,
        color: config.color,
        defaultPos: config.defaultPos.clone(),
        selectedPos: config.selectedPos.clone(),
        assembledPos: config.assembledPos.clone(),
        mesh,
        edges,
        label: config.name,
      };
    });

    // Floating particles around the scene
    const particlesCount = 200;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0xc9a96e,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // Animation
    function animate() {
      frameRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      const currentSelected = selectedModulesRef.current;
      const currentAssembling = isAssemblingRef.current;

      // Update target positions based on selection state
      modulesRef.current.forEach((mod) => {
        const isSelected = currentSelected.includes(mod.id);
        let targetPos: THREE.Vector3;

        if (currentAssembling && isSelected) {
          targetPos = mod.assembledPos;
        } else if (isSelected) {
          targetPos = mod.selectedPos;
        } else {
          targetPos = mod.defaultPos;
        }

        // Lerp position
        if (mod.mesh) {
          mod.mesh.position.lerp(targetPos, 0.05);

          // Add subtle floating animation
          mod.mesh.position.y = mod.mesh.position.y + Math.sin(time * 1.5 + mod.defaultPos.x) * 0.003;

          // Subtle rotation
          mod.mesh.rotation.y = Math.sin(time * 0.5 + mod.defaultPos.x) * 0.03;

          // Glow effect for selected modules
          const targetEmissiveIntensity = isSelected ? 0.3 : 0;
          const material = mod.mesh.material as THREE.MeshStandardMaterial;
          material.emissive = new THREE.Color(mod.color);
          material.emissiveIntensity = THREE.MathUtils.lerp(
            material.emissiveIntensity,
            targetEmissiveIntensity,
            0.05
          );

          // Edge opacity
          if (mod.edges) {
            const edgeMat = mod.edges.material as THREE.LineBasicMaterial;
            const targetOpacity = isSelected ? 1.0 : 0.6;
            edgeMat.opacity = THREE.MathUtils.lerp(edgeMat.opacity, targetOpacity, 0.05);
          }

          // Scale pulse for selected
          const targetScale = isSelected ? 1.05 : 1.0;
          mod.mesh.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            0.05
          );
        }
      });

      // Rotate particles slowly
      particles.rotation.y = time * 0.02;

      // Camera subtle orbit based on mouse
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        mouseRef.current.x * 1.5,
        0.02
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        2 + mouseRef.current.y * 0.5,
        0.02
      );
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse move for camera
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Click handler
    container.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] cursor-pointer"
      style={{ touchAction: 'none' }}
    />
  );
}
