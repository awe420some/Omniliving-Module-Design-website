import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

const MODULE_DATA = [
  { id: "A", x: -2, y: 0.35, z: 0, color: "#4fd1c5" },
  { id: "B", x: 0, y: 0.35, z: 0, color: "#63b3ed" },
  { id: "C", x: 2, y: 0.35, z: 0, color: "#9f7aea" },
  { id: "D", x: -2, y: -1.05, z: 0, color: "#f6ad55" },
  { id: "E", x: 0, y: -1.05, z: 0, color: "#68d391" },
  { id: "F", x: 2, y: -1.05, z: 0, color: "#fc8181" },
];

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0));

function Container({ module, progress, index }) {
  const build = clamp((progress - index * 0.1) * 1.8);
  if (build <= 0.001) return null;
  const startY = -2.6;
  const y = startY + (module.y - startY) * build;

  return (
    <group position={[module.x, y, module.z]} scale={[build, build, build]} rotation={[0, build * 0.35, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={module.color} transparent opacity={0.15 + build * 0.35} metalness={0.24} roughness={0.36} />
      </mesh>
      <mesh>
        <boxGeometry args={[1.05, 1.05, 1.05]} />
        <meshStandardMaterial color="#09090f" side={THREE.BackSide} roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.49, 0]}>
        <boxGeometry args={[0.9, 0.035, 0.9]} />
        <meshStandardMaterial color="#191926" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CursorRevealPlane({ mouse }) {
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uMouse.value.lerp(new THREE.Vector2(mouse.current.x, mouse.current.y), 0.08);
  });

  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      void main() {
        float d = distance(vUv, uMouse);
        float ripple = sin((d * 35.0) - (uTime * 2.8)) * 0.02;
        float reveal = smoothstep(0.38 + ripple, 0.02, d);
        vec3 base = vec3(0.03,0.05,0.09);
        vec3 glow = vec3(0.17,0.88,1.0) * reveal;
        gl_FragColor = vec4(base + glow, 0.55 - reveal * 0.35);
      }
    `
  }), []);

  return (
    <mesh position={[0, 0, 1.2]}>
      <planeGeometry args={[10, 6]} />
      <shaderMaterial ref={matRef} args={[shader]} transparent depthWrite={false} />
    </mesh>
  );
}

function Scene({ progress, mouse }) {
  return (
    <>
      <color attach="background" args={["#020204"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <pointLight position={[0, 2, 2]} intensity={1.3} color="#7dd3fc" />
      {MODULE_DATA.map((m, i) => <Container key={m.id} module={m} progress={progress} index={i} />)}
      <CursorRevealPlane mouse={mouse} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

export default function App() {
  const [progress, setProgress] = useState(0);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(max ? clamp(window.scrollY / max) : 0);
    };
    const onMove = (e) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="app">
      <section className="hero"><p>Modular Architecture System</p><h1>Omniliving Module Design</h1></section>
      <section className="reveal">
        <div className="sticky">
          <Canvas camera={{ position: [0, 0.2, 6], fov: 45 }}><Scene progress={progress} mouse={mouse} /></Canvas>
          <div className="progress"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        </div>
      </section>
      <motion.section className="panel" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2>Module Configurator</h2><p>3D-Container formen begehbare Wohneinheiten.</p>
      </motion.section>
      <section className="panel"><h2>Features</h2><ul><li>Assembly animation</li><li>GLSL cursor reveal peek-inside</li><li>Smooth scrolling storytelling</li></ul></section>
      <footer>Omniliving Module Design GmbH</footer>
    </div>
  );
}
