'use client';

import { Suspense, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, SSAO, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import ModularBuilding from './ModularBuilding';
import { useAppStore } from '@/lib/store';

function PostProcessing() {
  const chromaOffset = new THREE.Vector2(0.0008, 0.0008);

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        intensity={0.25}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.15} darkness={0.5} />
      <SSAO
        radius={0.04}
        intensity={8}
        luminanceInfluence={0.6}
        color="#0a0a14"
      />
      <ChromaticAberration
        offset={chromaOffset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={true}
        modulationOffset={0.5}
      />
    </EffectComposer>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2d4a3e" wireframe />
    </mesh>
  );
}

function CursorTracker() {
  const setCursorPosition = useAppStore((s) => s.setCursorPosition);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setCursorPosition({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, [setCursorPosition]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return null;
}

export default function SceneCanvas() {
  return (
    <>
      <CursorTracker />
      <Canvas
        shadows
        camera={{ position: [0, 3, 10], fov: 40, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: '#0a0a14' }}
        dpr={[1, 2]}
      >
        <fog attach="fog" args={['#0a0a14', 15, 40]} />
        <Suspense fallback={<LoadingFallback />}>
          <Environment preset="sunset" background={false} />
          <ModularBuilding />
          <PostProcessing />
        </Suspense>
      </Canvas>
    </>
  );
}
