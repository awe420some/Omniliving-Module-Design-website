'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bed, UtensilsCrossed, Bath, Sun, Moon, Info } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Hotspot {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  depth: number; // 0=background, 1=midground, 2=foreground
}

interface ModuleInterior {
  id: string;
  label: string;
  icon: typeof Home;
  hotspots: Hotspot[];
  bgColor: string;
  furnitureColor: string;
  accentColor: string;
  windowColor: string;
}

const MODULE_INTERIORS: ModuleInterior[] = [
  {
    id: 'wohnen',
    label: 'Wohnmodul',
    icon: Home,
    bgColor: '#1a1a2e',
    furnitureColor: '#2a2a3e',
    accentColor: '#c9a96e',
    windowColor: 'rgba(135, 206, 235, 0.3)',
    hotspots: [
      { id: 'sofa', label: 'Sofa', detail: 'L-förmiges Sofa mit Stoffbezug', x: 30, y: 65, depth: 2 },
      { id: 'coffee', label: 'Couchtisch', detail: 'Eichentisch mit Goldakzenten', x: 40, y: 55, depth: 2 },
      { id: 'tv', label: 'TV-Wand', detail: '55" Smart TV mit Wandmontage', x: 15, y: 45, depth: 1 },
      { id: 'bookshelf', label: 'Bücherregal', detail: 'Maßgefertigtes Regal aus Eiche', x: 75, y: 40, depth: 1 },
      { id: 'window1', label: 'Panoramafenster', detail: 'Bodentiefe Verglasung 2,4m', x: 50, y: 25, depth: 0 },
    ],
  },
  {
    id: 'schlafen',
    label: 'Schlafmodul',
    icon: Bed,
    bgColor: '#1e1e30',
    furnitureColor: '#2e2e42',
    accentColor: '#c9a96e',
    windowColor: 'rgba(135, 206, 235, 0.2)',
    hotspots: [
      { id: 'bed', label: 'Doppelbett', detail: '1,80m × 2,00m Premium-Matratze', x: 35, y: 60, depth: 2 },
      { id: 'nightstand1', label: 'Nachttisch', detail: 'Mit integriertem USB-Anschluss', x: 18, y: 55, depth: 2 },
      { id: 'nightstand2', label: 'Nachttisch', detail: 'Mit Leselampe', x: 55, y: 55, depth: 2 },
      { id: 'wardrobe', label: 'Kleiderschrank', detail: 'Schwebetürschrank 2,40m', x: 78, y: 50, depth: 1 },
      { id: 'window2', label: 'Fenster', detail: 'Dreh-Kipp-Fenster mit Verdunkelung', x: 45, y: 20, depth: 0 },
    ],
  },
  {
    id: 'kueche',
    label: 'Küchenmodul',
    icon: UtensilsCrossed,
    bgColor: '#1c1c2e',
    furnitureColor: '#2c2c3e',
    accentColor: '#c9a96e',
    windowColor: 'rgba(135, 206, 235, 0.25)',
    hotspots: [
      { id: 'counter', label: 'Arbeitsfläche', detail: 'L-förmig, Granit-Arbeitsplatte', x: 35, y: 50, depth: 2 },
      { id: 'stove', label: 'Induktionsherd', detail: '4-Platten Ceran-Kochfeld', x: 25, y: 45, depth: 2 },
      { id: 'fridge', label: 'Kühlschrank', detail: 'Einbaukühlschrank 178cm', x: 70, y: 45, depth: 1 },
      { id: 'barstools', label: 'Barhocker', detail: '2 Stück mit Ledersitz', x: 55, y: 70, depth: 2 },
      { id: 'window3', label: 'Aussichtsfenster', detail: 'Über der Arbeitsfläche', x: 40, y: 20, depth: 0 },
    ],
  },
  {
    id: 'bad',
    label: 'Badmodul',
    icon: Bath,
    bgColor: '#1a1e2e',
    furnitureColor: '#2a2e3e',
    accentColor: '#c9a96e',
    windowColor: 'rgba(200, 220, 240, 0.15)',
    hotspots: [
      { id: 'shower', label: 'Walk-in Dusche', detail: 'Regenduschkopf + Handbrause', x: 25, y: 45, depth: 2 },
      { id: 'vanity', label: 'Doppelwaschbecken', detail: 'Mit Unterschrank & Spiegel', x: 60, y: 40, depth: 2 },
      { id: 'toilet', label: 'WC', detail: 'Hänge-WC mit Spülung', x: 75, y: 65, depth: 1 },
      { id: 'washer', label: 'Waschmaschine', detail: 'Unterbaugerät mit Trockner', x: 25, y: 75, depth: 1 },
      { id: 'window4', label: 'Oberlicht', detail: 'Milchglasoberlicht', x: 50, y: 15, depth: 0 },
    ],
  },
];

function InteriorSVG({
  module,
  isNight,
  mousePos,
  hoveredHotspot,
  onHotspotHover,
}: {
  module: ModuleInterior;
  isNight: boolean;
  mousePos: { x: number; y: number };
  hoveredHotspot: string | null;
  onHotspotHover: (id: string | null) => void;
}) {
  const offsetX = (mousePos.x - 0.5) * -15;
  const offsetY = (mousePos.y - 0.5) * -10;
  const ambientLight = isNight ? 0.3 : 0.8;
  const wallColor = isNight ? '#0d0d1a' : module.bgColor;
  const floorColor = isNight ? '#0a0a15' : '#15152a';

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ maxHeight: '450px' }}
    >
      {/* Background / Walls */}
      <rect x="0" y="0" width="100" height="70" fill={wallColor} />
      {/* Floor */}
      <rect x="0" y="70" width="100" height="30" fill={floorColor} />
      {/* Floor line */}
      <line x1="0" y1="70" x2="100" y2="70" stroke={module.accentColor} strokeWidth="0.3" opacity="0.3" />

      {/* Window - parallax background layer */}
      <g style={{ transform: `translate(${offsetX * 0.3}px, ${offsetY * 0.3}px)`, transition: 'transform 0.1s ease-out' }}>
        {module.id === 'wohnen' && (
          <rect x="30" y="10" width="40" height="30" rx="1" fill={isNight ? 'rgba(30,30,60,0.6)' : module.windowColor} stroke={module.accentColor} strokeWidth="0.4" opacity="0.8" />
        )}
        {module.id === 'schlafen' && (
          <rect x="35" y="12" width="25" height="22" rx="1" fill={isNight ? 'rgba(30,30,60,0.5)' : module.windowColor} stroke={module.accentColor} strokeWidth="0.4" opacity="0.7" />
        )}
        {module.id === 'kueche' && (
          <rect x="25" y="10" width="30" height="25" rx="1" fill={isNight ? 'rgba(30,30,60,0.5)' : module.windowColor} stroke={module.accentColor} strokeWidth="0.4" opacity="0.7" />
        )}
        {module.id === 'bad' && (
          <rect x="40" y="5" width="15" height="12" rx="1" fill={isNight ? 'rgba(30,30,60,0.4)' : module.windowColor} stroke={module.accentColor} strokeWidth="0.4" opacity="0.5" />
        )}
        {/* Stars at night through window */}
        {isNight && (
          <>
            <circle cx="40" cy="18" r="0.5" fill="#fff" opacity="0.6" />
            <circle cx="55" cy="15" r="0.3" fill="#fff" opacity="0.4" />
            <circle cx="48" cy="22" r="0.4" fill="#fff" opacity="0.5" />
          </>
        )}
      </g>

      {/* Midground furniture - parallax mid layer */}
      <g style={{ transform: `translate(${offsetX * 0.6}px, ${offsetY * 0.5}px)`, transition: 'transform 0.1s ease-out' }}>
        {module.id === 'wohnen' && (
          <>
            {/* TV on wall */}
            <rect x="10" y="35" width="15" height="10" rx="0.5" fill={isNight ? '#1a1a2a' : '#1a1a2e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
            <rect x="11" y="36" width="13" height="8" rx="0.3" fill={isNight ? '#0a0a15' : '#333'} />
            {/* Bookshelf */}
            <rect x="68" y="20" width="18" height="45" rx="0.5" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" opacity="0.6" />
            <line x1="68" y1="32" x2="86" y2="32" stroke={module.accentColor} strokeWidth="0.2" opacity="0.4" />
            <line x1="68" y1="44" x2="86" y2="44" stroke={module.accentColor} strokeWidth="0.2" opacity="0.4" />
            <line x1="68" y1="56" x2="86" y2="56" stroke={module.accentColor} strokeWidth="0.2" opacity="0.4" />
          </>
        )}
        {module.id === 'schlafen' && (
          <>
            {/* Wardrobe */}
            <rect x="68" y="18" width="22" height="48" rx="0.5" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.3" opacity="0.7" />
            <line x1="79" y1="18" x2="79" y2="66" stroke={module.accentColor} strokeWidth="0.2" opacity="0.3" />
            <circle cx="77" cy="42" r="0.6" fill={module.accentColor} opacity="0.5" />
            <circle cx="81" cy="42" r="0.6" fill={module.accentColor} opacity="0.5" />
          </>
        )}
        {module.id === 'kueche' && (
          <>
            {/* Fridge */}
            <rect x="62" y="25" width="12" height="40" rx="0.5" fill={isNight ? '#1a1a2a' : '#e0e0e0'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.8" />
            <line x1="62" y1="40" x2="74" y2="40" stroke={module.accentColor} strokeWidth="0.2" opacity="0.3" />
            <rect x="64" y="27" width="8" height="11" rx="0.2" fill={isNight ? '#0d0d1a' : '#888'} opacity="0.5" />
          </>
        )}
        {module.id === 'bad' && (
          <>
            {/* Toilet */}
            <rect x="68" y="55" width="10" height="12" rx="2" fill={isNight ? '#1a1a2a' : '#f0f0f0'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.8" />
            <rect x="70" y="58" width="6" height="6" rx="1.5" fill={isNight ? '#0d0d1a' : '#ddd'} />
            {/* Washing machine */}
            <rect x="15" y="62" width="12" height="12" rx="0.5" fill={isNight ? '#1a1a2a' : '#e8e8e8'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.7" />
            <circle cx="21" cy="68" r="3.5" fill={isNight ? '#0d0d1a' : '#ccc'} />
          </>
        )}
      </g>

      {/* Foreground furniture - parallax front layer */}
      <g style={{ transform: `translate(${offsetX * 1}px, ${offsetY * 0.8}px)`, transition: 'transform 0.1s ease-out' }}>
        {module.id === 'wohnen' && (
          <>
            {/* Sofa */}
            <rect x="20" y="50" width="30" height="18" rx="1.5" fill={isNight ? '#1a1a2a' : '#2a3a4e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
            <rect x="20" y="48" width="6" height="20" rx="1" fill={isNight ? '#151528' : '#2a3a4e'} stroke={module.accentColor} strokeWidth="0.2" opacity={ambientLight} />
            {/* Cushions */}
            <rect x="28" y="51" width="8" height="6" rx="1" fill={module.accentColor} opacity="0.15" />
            <rect x="38" y="51" width="8" height="6" rx="1" fill={module.accentColor} opacity="0.15" />
            {/* Coffee table */}
            <rect x="28" y="42" width="14" height="6" rx="0.5" fill={isNight ? '#1a1a2a' : '#3a2a1e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
          </>
        )}
        {module.id === 'schlafen' && (
          <>
            {/* Double bed */}
            <rect x="15" y="48" width="40" height="20" rx="1" fill={isNight ? '#1a1a2a' : '#2a2a3e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
            {/* Headboard */}
            <rect x="15" y="44" width="40" height="5" rx="0.5" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" />
            {/* Pillows */}
            <rect x="18" y="46" width="10" height="4" rx="1" fill={isNight ? '#1a1e2a' : '#e8e0d0'} opacity="0.7" />
            <rect x="32" y="46" width="10" height="4" rx="1" fill={isNight ? '#1a1e2a' : '#e8e0d0'} opacity="0.7" />
            {/* Blanket */}
            <rect x="16" y="54" width="38" height="12" rx="0.5" fill={module.accentColor} opacity="0.08" />
            {/* Nightstands */}
            <rect x="8" y="50" width="6" height="8" rx="0.3" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" />
            <rect x="56" y="50" width="6" height="8" rx="0.3" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" />
          </>
        )}
        {module.id === 'kueche' && (
          <>
            {/* L-shaped counter */}
            <rect x="8" y="38" width="42" height="8" rx="0.3" fill={isNight ? '#1a1a2a' : '#3a3a4e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
            <rect x="8" y="38" width="8" height="28" rx="0.3" fill={isNight ? '#1a1a2a' : '#3a3a4e'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
            {/* Counter top */}
            <rect x="8" y="36" width="42" height="3" rx="0.2" fill={isNight ? '#1a1e2a' : '#888'} stroke={module.accentColor} strokeWidth="0.2" opacity="0.6" />
            {/* Stove */}
            <circle cx="25" cy="37.5" r="1.2" fill={isNight ? '#c9a96e' : '#666'} opacity="0.6" />
            <circle cx="30" cy="37.5" r="1.2" fill={isNight ? '#c9a96e' : '#666'} opacity="0.6" />
            {/* Upper cabinets */}
            <rect x="8" y="15" width="42" height="8" rx="0.3" fill={module.furnitureColor} stroke={module.accentColor} strokeWidth="0.2" opacity="0.5" />
            {/* Bar stools */}
            <circle cx="35" cy="62" r="3" fill={isNight ? '#1a1a2a' : '#4a4a5e'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.6" />
            <circle cx="45" cy="62" r="3" fill={isNight ? '#1a1a2a' : '#4a4a5e'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.6" />
          </>
        )}
        {module.id === 'bad' && (
          <>
            {/* Walk-in shower */}
            <rect x="8" y="25" width="22" height="32" rx="0.5" fill={isNight ? '#0d0d1a' : '#e8f4f8'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
            <rect x="8" y="25" width="22" height="32" rx="0.5" fill="none" stroke="rgba(200,220,240,0.3)" strokeWidth="0.5" />
            {/* Shower head */}
            <circle cx="19" cy="30" r="2" fill={isNight ? '#1a1a2a' : '#ccc'} stroke={module.accentColor} strokeWidth="0.2" />
            {/* Double vanity */}
            <rect x="40" y="30" width="30" height="12" rx="0.5" fill={isNight ? '#1a1a2a' : '#f0f0f0'} stroke={module.accentColor} strokeWidth="0.3" opacity={ambientLight} />
            {/* Sinks */}
            <ellipse cx="50" cy="36" rx="4" ry="2.5" fill={isNight ? '#0d0d1a' : '#ddd'} />
            <ellipse cx="62" cy="36" rx="4" ry="2.5" fill={isNight ? '#0d0d1a' : '#ddd'} />
            {/* Mirror */}
            <rect x="42" y="15" width="26" height="14" rx="0.5" fill={isNight ? '#0d0d1a' : 'rgba(200,220,240,0.2)'} stroke={module.accentColor} strokeWidth="0.3" opacity="0.5" />
          </>
        )}
      </g>

      {/* Night mode warm lighting overlay */}
      {isNight && (
        <>
          <circle cx="50" cy="35" r="25" fill="rgba(201, 169, 110, 0.06)" />
          <circle cx="50" cy="35" r="15" fill="rgba(201, 169, 110, 0.04)" />
          <circle cx="50" cy="35" r="8" fill="rgba(201, 169, 110, 0.03)" />
        </>
      )}

      {/* Hotspots */}
      {module.hotspots.map((hotspot) => {
        const isHovered = hoveredHotspot === hotspot.id;
        const depthOffset = hotspot.depth === 0 ? 0.3 : hotspot.depth === 1 ? 0.6 : 1;
        const hx = hotspot.x + offsetX * depthOffset * 0.15;
        const hy = hotspot.y + offsetY * depthOffset * 0.1;

        return (
          <g key={hotspot.id}>
            {/* Hotspot circle */}
            <circle
              cx={hx}
              cy={hy}
              r={isHovered ? 3 : 2}
              fill={isHovered ? module.accentColor : 'rgba(201, 169, 110, 0.5)'}
              stroke={module.accentColor}
              strokeWidth="0.3"
              opacity={isHovered ? 1 : 0.6}
              className="cursor-pointer"
              onMouseEnter={() => onHotspotHover(hotspot.id)}
              onMouseLeave={() => onHotspotHover(null)}
              style={{ transition: 'all 0.2s ease' }}
            />
            {/* Pulse ring */}
            {isHovered && (
              <circle
                cx={hx}
                cy={hy}
                r="4"
                fill="none"
                stroke={module.accentColor}
                strokeWidth="0.3"
                opacity="0.4"
              >
                <animate attributeName="r" from="2" to="6" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Label + detail on hover */}
            {isHovered && (
              <g>
                <rect
                  x={hx - 20}
                  y={hy - 14}
                  width="40"
                  height="12"
                  rx="1"
                  fill="rgba(18, 18, 31, 0.95)"
                  stroke="rgba(201, 169, 110, 0.3)"
                  strokeWidth="0.3"
                />
                <text
                  x={hx}
                  y={hy - 8}
                  textAnchor="middle"
                  fill="#c9a96e"
                  fontSize="3"
                  fontWeight="600"
                  fontFamily="system-ui"
                >
                  {hotspot.label}
                </text>
                <rect
                  x={hx - 25}
                  y={hy + 4}
                  width="50"
                  height="8"
                  rx="1"
                  fill="rgba(18, 18, 31, 0.9)"
                  stroke="rgba(201, 169, 110, 0.2)"
                  strokeWidth="0.2"
                />
                <text
                  x={hx}
                  y={hy + 9.5}
                  textAnchor="middle"
                  fill="#aaa"
                  fontSize="2.2"
                  fontFamily="system-ui"
                >
                  {hotspot.detail}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Room label */}
      <text x="50" y="95" textAnchor="middle" fill="#8888a8" fontSize="3" fontFamily="system-ui" opacity="0.5">
        {module.label} · 6,0 m × 2,5 m
      </text>
    </svg>
  );
}

export default function VirtualTourSection() {
  const [activeModule, setActiveModule] = useState('wohnen');
  const [isNight, setIsNight] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentModule = MODULE_INTERIORS.find((m) => m.id === activeModule) || MODULE_INTERIORS[0];

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <section id="virtual-tour" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Virtueller Rundgang
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Module <span className="text-gradient-gold">erkunden</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Bewegen Sie die Maus für den Parallax-Effekt. Entdecken Sie die Ausstattung der einzelnen Module.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Tabs
            value={activeModule}
            onValueChange={(val) => {
              setActiveModule(val);
              setHoveredHotspot(null);
            }}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <TabsList className="bg-[#12121f] border border-white/5 h-auto p-1 flex-wrap gap-1">
                {MODULE_INTERIORS.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <TabsTrigger
                      key={mod.id}
                      value={mod.id}
                      className="data-[state=active]:bg-[#c9a96e]/10 data-[state=active]:text-[#c9a96e] data-[state=active]:border-[#c9a96e]/30 text-[#8888a8] px-4 py-2.5 text-xs tracking-[0.1em] uppercase border border-transparent transition-all duration-300 flex items-center gap-2"
                    >
                      <Icon size={16} />
                      {mod.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Tag/Nacht toggle */}
              <button
                onClick={() => setIsNight(!isNight)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-xs tracking-[0.1em] uppercase transition-all duration-300 ${
                  isNight
                    ? 'bg-[#0a0a1a] border-[#c9a96e]/30 text-[#c9a96e]'
                    : 'bg-[#12121f]/60 border-white/10 text-[#8888a8] hover:border-white/20'
                }`}
              >
                {isNight ? <Moon size={14} /> : <Sun size={14} />}
                {isNight ? 'Nachtmodus' : 'Tagmodus'}
              </button>
            </div>

            {MODULE_INTERIORS.map((mod) => (
              <TabsContent key={mod.id} value={mod.id}>
                <div className="relative bg-[#12121f]/40 border border-white/5 rounded-lg overflow-hidden">
                  {/* Interior view with parallax */}
                  <div
                    ref={containerRef}
                    className="tour-parallax-container relative p-4 sm:p-8"
                  >
                    <InteriorSVG
                      module={mod}
                      isNight={isNight}
                      mousePos={mousePos}
                      hoveredHotspot={hoveredHotspot}
                      onHotspotHover={setHoveredHotspot}
                    />

                    {/* Instruction hint */}
                    <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[#8888a8]/40 pointer-events-none">
                      <Info size={10} />
                      <span className="text-[9px] tracking-wider uppercase">Maus bewegen für Parallax</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
