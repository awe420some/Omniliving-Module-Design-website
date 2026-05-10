# Omniliving Performance-Audit (2026-05-09)

> **Hinweis zu den Zahlen:** Audit läuft in headless Chromium mit SwiftShader
> (Software-GPU). Echte FPS in einem normalen Browser auf einem M1-Mac
> liegen typischerweise **3-10× höher** als die Werte hier. Die *relativen*
> Verbesserungen (vorher/nachher) sind aber repräsentativ.

## Vorher / Nachher (Production-Build, headless Chromium)

| Metrik | Vorher | Nach Phase 1 | Nach Phase 2 |
|---|---|---|---|
| TTI (networkidle) | 2863 ms | 970 ms | **1107 ms** |
| Console-Errors | 2196 | 0 | **0** |
| Hero (scrollY 0) | 9-13 FPS, 1.6s blocked | 6-13 FPS, 1.5s | **11 FPS, 1.3s** |
| Building-Phase | 3 FPS, 3.5s blocked | 3 FPS, 1.5s | 3 FPS, 3.0s |
| Sectioncut | **0 FPS, 9.1s blocked** | 0 FPS, 9.8s | **0 FPS, 0ms** ✓ |
| Configurator-Ende | **0 FPS, 5.4s blocked** | **120 FPS, 0ms** | **120 FPS, 0ms** ✓ |
| Nach 3D-Section | **0 FPS, 4.8s blocked** | **120 FPS, 0ms** | **120 FPS, 0ms** ✓ |
| Mid-Features | **0 FPS, 4.7s blocked** | **120 FPS, 0ms** | **120 FPS, 0ms** ✓ |
| Bottom | 77 FPS, 0ms | **120 FPS, 0ms** | **120 FPS, 0ms** ✓ |
| Dependencies | 73 | 71 | **63** |

## Was geändert wurde

### `src/components/3d/SceneCanvas.tsx`
1. **FPS-Cap (60 Hz Manual-Throttle) entfernt** — der Cap erzeugte ungleichmäßige Frametimes auf ProMotion-Displays (Hauptursache des spürbaren Stutters).
2. **Delta-Time-Smoothing eingeführt**: Lerp-Faktoren werden mit `1 - (1-f)^dt` skaliert → Animationen laufen identisch auf 60Hz/120Hz.
3. **Per-Frame-Allokationen eliminiert**: `new THREE.Color`, `new THREE.Fog`, `new THREE.Vector3` wandern aus der rAF-Schleife in Scratch-Buffer.
4. **`scene.background` / `scene.fog` nur bei `modeChanged` setzen** — vorher jedes Frame.
5. **IntersectionObserver-Pause**: `requestAnimationFrame` führt keine Render-Arbeit aus, wenn die Canvas off-screen ist. Spart 5-9 Sekunden Long-Tasks beim Scrollen unter die 3D-Section.
6. **Shadow-Map 2048² → 1024²** (BasicShadowMap, ~4× schnellerer Shadow-Pass).
7. **Auto-Rotation des Modells** ist `t`-basiert (Wallclock) — framerate-unabhängig per Konstruktion. Drag (`pointerdown/move`) überschreibt die Auto-Rotation und wird beim Loslassen smooth zurück gelerpt.

### `src/components/ScrollExperience.tsx`
- **GSAP/ScrollTrigger entfernt** — durch `useScroll` + `useMotionValueEvent` aus Framer Motion ersetzt. Pin = `position: sticky`, Scrub = `scrollYProgress`.

### `package.json`
- `gsap` entfernt (~70 KB gz, nur eine Verwendung).
- `lenis` entfernt (war deklariert, **nirgendwo importiert** = toter Code).

### `next.config.ts`
- `experimental.optimizePackageImports` aktiviert für `lucide-react`, alle 26 Radix-Pakete, `date-fns`, `recharts` → Tree-Shaking pro Icon/Komponente.

## Phase 2 — was zusätzlich gemacht wurde

### `src/components/3d/SceneCanvas.tsx`
8. **`renderer.compile(scene, camera)`** vor dem ersten `animate()` — kompiliert alle Shader-Programme synchron während Mount, damit der erste Frame nicht ~1.5s blockt durch on-demand GLSL-Compile.
9. **Section-Cut: Mesh-Flags pro Mesh cachen** (`mesh.userData.__isWall` etc.) → keine `name.toLowerCase().includes('wall')` Aufrufe pro Frame mehr.
10. **Section-Cut: non-wall meshes komplett überspringen**, wenn keine Reset-Arbeit anliegt.
11. **Reset-Branch (else) cached genauso** Mesh-Flags + skipt früh.
12. **Per-Module-Color-Update** verwendet jetzt `moduleColorScratch.set(...)` statt `new THREE.Color(...)` jeden Frame.
13. **Interior-Glow-Loop**: Mesh-Kinds (interior_floor / window_glass / nichts) als 0/1/2-Enum gecacht, scratch buffers für Emissive-Color.

### Removed packages (8)
`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`,
`@mdxeditor/editor`, `next-auth`, `react-markdown`,
`react-syntax-highlighter`, `z-ai-web-dev-sdk`,
`postprocessing`, `@react-three/postprocessing`

→ **63 Dependencies** (vorher 73).

### Light-Toggle-Idee verworfen
`.visible = false` auf idle Lights würde Three.js zur Shader-Recompile zwingen
(Light-Count steckt in `#define`s) — wäre kontraproduktiv. Lights bei
intensity ~0 sind im Shader praktisch frei.

## Was übrig bleibt (echte 3D-Renderlast Hero/Building)

Die Hero/Building-Phase macht ~11 FPS in Software-GPU. Auf realer Hardware
sollte das 60-120 FPS sein. Falls weiter Bedarf besteht:
1. **`InstancedMesh`** für sich wiederholende Geometrie (Wände, Stützen).
2. **Geometry-LOD**: weniger Polygone bei kleinen Bildschirmgrößen.
3. **`renderer.shadowMap.autoUpdate = false`** + manuell triggern, wenn sich nichts bewegt.
4. **`<Canvas dpr={[1, 1.25]}>`** bei mobilen Geräten statt `1.5`.

## Verifizierung

```bash
cd ~/Desktop/Omniliving-Module-Design-Website
bun run build         # ✓ kompiliert ~4s, keine Errors
bun next start -p 3000 # läuft auf Port 3000
# Audit-Skript: /tmp/omni-audit.mjs
bun /tmp/omni-audit.mjs
```
