'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function RevealScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -2, y: -2 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Load textures
    const textureLoader = new THREE.TextureLoader();

    const exteriorTexture = textureLoader.load('/images/hero-building.png', (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });

    const interiorTexture = textureLoader.load('/images/interior-1.png', (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });

    // Vertex Shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment Shader - organic blob reveal
    const fragmentShader = `
      uniform vec2 uMouse;
      uniform float uTime;
      uniform float uHover;
      uniform sampler2D uExterior;
      uniform sampler2D uInterior;
      uniform vec2 uResolution;

      varying vec2 vUv;

      // Simple noise function for organic edges
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec2 uv = vUv;
        
        // Adjust UV for aspect ratio
        float aspect = uResolution.x / uResolution.y;
        vec2 adjustedUv = uv;
        vec2 adjustedMouse = uMouse;
        
        // Distance from mouse position
        float dist = distance(adjustedUv, adjustedMouse);
        
        // Angle-based distortion for organic blob shape
        float angle = atan(adjustedUv.y - adjustedMouse.y, adjustedUv.x - adjustedMouse.x);
        
        // Multiple layers of noise for organic wobble
        float wobble1 = sin(angle * 3.0 + uTime * 2.0) * 0.025;
        float wobble2 = sin(angle * 5.0 - uTime * 1.5) * 0.018;
        float wobble3 = sin(angle * 7.0 + uTime * 3.0) * 0.012;
        float wobble4 = noise(adjustedUv * 8.0 + uTime * 0.5) * 0.03;
        
        // Dynamic radius with organic distortion
        float baseRadius = 0.22 * uHover;
        float radius = baseRadius + wobble1 + wobble2 + wobble3 + wobble4;
        
        // Soft edge with multi-step smoothstep for gaussian-like falloff
        float edgeSoftness = 0.04;
        float mask = 1.0 - smoothstep(radius - edgeSoftness, radius + edgeSoftness, dist);
        
        // Add inner glow
        float innerGlow = 1.0 - smoothstep(0.0, radius * 0.7, dist);
        float glowIntensity = innerGlow * 0.15;
        
        // Sample textures with slight parallax offset for interior
        vec2 interiorUv = uv + (uv - adjustedMouse) * 0.02 * uHover;
        vec4 exterior = texture2D(uExterior, uv);
        vec4 interior = texture2D(uInterior, interiorUv);
        
        // Darken exterior slightly
        exterior.rgb *= 0.7;
        
        // Brighten interior for warm feel
        interior.rgb *= 1.3;
        interior.rgb = mix(interior.rgb, vec3(1.0, 0.95, 0.85), glowIntensity);
        
        // Add subtle golden rim light at the edge of the mask
        float rimMask = smoothstep(radius - edgeSoftness * 2.0, radius - edgeSoftness, dist) 
                       * (1.0 - smoothstep(radius - edgeSoftness, radius, dist));
        vec3 rimColor = vec3(0.788, 0.663, 0.431) * rimMask * 2.0 * uHover;
        
        // Mix based on mask
        vec4 color = mix(exterior, interior, mask);
        color.rgb += rimColor;
        
        // Add vignette to exterior
        float vignette = 1.0 - smoothstep(0.3, 0.8, dist);
        color.rgb = mix(color.rgb, color.rgb * 0.6, (1.0 - mask) * (1.0 - vignette) * 0.3);
        
        gl_FragColor = color;
      }
    `;

    // Shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMouse: { value: new THREE.Vector2(-2, -2) },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uExterior: { value: exteriorTexture },
        uInterior: { value: interiorTexture },
        uResolution: {
          value: new THREE.Vector2(container.clientWidth, container.clientHeight),
        },
      },
    });

    // Full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    // Animation loop
    function animate() {
      frameRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      shaderMaterial.uniforms.uTime.value = time;

      // Smooth mouse position interpolation
      const currentMouse = shaderMaterial.uniforms.uMouse.value;
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;
      currentMouse.x += (targetX - currentMouse.x) * 0.08;
      currentMouse.y += (targetY - currentMouse.y) * 0.08;

      // Smooth hover transition
      const currentHover = shaderMaterial.uniforms.uHover.value;
      const targetHover = mousePosRef.current.x > -1 ? 1.0 : 0.0;
      shaderMaterial.uniforms.uHover.value += (targetHover - currentHover) * 0.05;

      renderer.render(scene, camera);
    }

    animate();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mousePosRef.current = { x, y };
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      mousePosRef.current = { x: -2, y: -2 };
    };

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = 1.0 - (touch.clientY - rect.top) / rect.height;
      mousePosRef.current = { x, y };
    };

    const handleTouchEnd = () => {
      mousePosRef.current = { x: -2, y: -2 };
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      shaderMaterial.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      shaderMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] cursor-none"
        style={{ touchAction: 'none' }}
      />
      {!isHovering && (
        <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none z-10">
          <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full">
            <p className="text-sm text-[#c9a96e] tracking-wider animate-pulse">
              Fahren Sie mit der Maus über das Gebäude
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
