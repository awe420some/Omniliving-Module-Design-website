'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useAppStore,
  type ModuleDef,
  type WallColor,
  type RoofColor,
  type WindowStyle,
  type MaterialConfig,
  type SizeConfig,
} from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Home, Bed, UtensilsCrossed, Bath, RotateCcw, Check,
  Sofa, Moon, CookingPot, Droplets,
  ChevronRight, ChevronLeft, Download, FileText,
  Minus, Plus, ArrowDown, GripVertical, Move,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

/* ────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────── */

const MODULE_TYPES: {
  id: ModuleDef['type'];
  labelKey: string;
  descKey: string;
  icon: typeof Home;
  interiorIcon: typeof Sofa;
  color: string;
  emissiveColor: string;
  windowCount: number;
  windowSize: 'large' | 'medium' | 'small';
  defaultDef: Omit<ModuleDef, 'id'>;
}[] = [
  {
    id: 'wohnen',
    labelKey: 'module.wohnen',
    descKey: 'module.wohnen.desc',
    icon: Home,
    interiorIcon: Sofa,
    color: '#C3F8BD',
    emissiveColor: '#ffcc88',
    windowCount: 2,
    windowSize: 'large',
    defaultDef: { label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  },
  {
    id: 'schlafen',
    labelKey: 'module.schlafen',
    descKey: 'module.schlafen.desc',
    icon: Bed,
    interiorIcon: Moon,
    color: '#4a9eff',
    emissiveColor: '#88aaff',
    windowCount: 2,
    windowSize: 'medium',
    defaultDef: { label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
  },
  {
    id: 'kueche',
    labelKey: 'module.kueche',
    descKey: 'module.kueche.desc',
    icon: UtensilsCrossed,
    interiorIcon: CookingPot,
    color: '#ff6b4a',
    emissiveColor: '#ffdd66',
    windowCount: 1,
    windowSize: 'large',
    defaultDef: { label: 'Küchenmodul', type: 'kueche', color: '#3a3535', windowColor: '#ffffdd', emissiveColor: '#ffdd66' },
  },
  {
    id: 'bad',
    labelKey: 'module.bad',
    descKey: 'module.bad.desc',
    icon: Bath,
    interiorIcon: Droplets,
    color: '#4aff9e',
    emissiveColor: '#88bbff',
    windowCount: 1,
    windowSize: 'small',
    defaultDef: { label: 'Badmodul', type: 'bad', color: '#2d3a4a', windowColor: '#ddeeff', emissiveColor: '#88bbff' },
  },
];

const WALL_COLORS: { id: WallColor; labelKey: string; hex: string; premium: number }[] = [
  { id: 'anthrazit', labelKey: 'config.colorAnthrazit', hex: '#2d4a3e', premium: 0 },
  { id: 'schwarz', labelKey: 'config.colorSchwarz', hex: '#1a1a1a', premium: 0 },
  { id: 'weiss', labelKey: 'config.colorWeiss', hex: '#e8e8e8', premium: 2000 },
  { id: 'holzoptik', labelKey: 'config.colorHolzoptik', hex: '#8B6914', premium: 3000 },
  { id: 'rost', labelKey: 'config.colorRost', hex: '#8B4513', premium: 0 },
  { id: 'blaugrau', labelKey: 'config.colorBlaugrau', hex: '#4a5568', premium: 0 },
];

const ROOF_COLORS: { id: RoofColor; labelKey: string; hex: string }[] = [
  { id: 'anthrazit', labelKey: 'config.colorAnthrazit', hex: '#2d4a3e' },
  { id: 'schwarz', labelKey: 'config.colorSchwarz', hex: '#1a1a1a' },
  { id: 'ziegelrot', labelKey: 'config.colorZiegelrot', hex: '#8B2500' },
  { id: 'gruen', labelKey: 'config.colorGruen', hex: '#2d5a3e' },
];

const WINDOW_STYLES: { id: WindowStyle; labelKey: string; descKey: string; premiumPerModule: number }[] = [
  { id: 'standard', labelKey: 'config.windowStandard', descKey: 'config.windowStandardDesc', premiumPerModule: 0 },
  { id: 'panorama', labelKey: 'config.windowPanorama', descKey: 'config.windowPanoramaDesc', premiumPerModule: 1500 },
  { id: 'sprossen', labelKey: 'config.windowSprossen', descKey: 'config.windowSprossenDesc', premiumPerModule: 0 },
];

const MODULE_AREA = 15; // m² per module

const DEFAULT_ASSIGNMENTS: Record<string, ModuleDef> = {
  'ground-0': { id: 'ground-0', label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  'ground-1': { id: 'ground-1', label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
  'ground-2': { id: 'ground-2', label: 'Küchenmodul', type: 'kueche', color: '#3a3535', windowColor: '#ffffdd', emissiveColor: '#ffdd66' },
  'upper-0': { id: 'upper-0', label: 'Badmodul', type: 'bad', color: '#2d3a4a', windowColor: '#ddeeff', emissiveColor: '#88bbff' },
  'upper-1': { id: 'upper-1', label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  'upper-2': { id: 'upper-2', label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
};

/* ────────────────────────────────────────────
   Helper: get positions for current size
   ──────────────────────────────────────────── */

const POSITION_KEYS = ['pos.links', 'pos.midLeft', 'pos.mid', 'pos.midRight', 'pos.rechts'] as const;

function getPositionsForSize(size: SizeConfig) {
  const ground = Array.from({ length: size.groundModules }, (_, i) => ({
    id: `ground-${i}`,
    labelKey: size.groundModules === 1 ? 'config.groundFloor' : POSITION_KEYS[i] || `Pos ${i + 1}`,
    floor: 'ground' as const,
  }));
  const upper = size.upperModules > 0
    ? Array.from({ length: size.upperModules }, (_, i) => ({
        id: `upper-${i}`,
        labelKey: size.upperModules === 1 ? 'config.upperFloor' : POSITION_KEYS[i] || `Pos ${i + 1}`,
        floor: 'upper' as const,
      }))
    : [];
  return { ground, upper };
}

/* ────────────────────────────────────────────
   Price Calculator
   ──────────────────────────────────────────── */

function calculatePrice(
  size: SizeConfig,
  quality: 'standard' | 'premium',
  material: MaterialConfig,
) {
  const basePerModule = quality === 'premium' ? 32000 : 25000;
  const totalModules = size.groundModules + size.upperModules;

  const baseTotal = totalModules * basePerModule;
  const upperSurcharge = size.upperModules * basePerModule * 0.2;
  const wallPremium = WALL_COLORS.find(c => c.id === material.wallColor)?.premium ?? 0;
  const colorPremium = wallPremium * totalModules;
  const windowPremiumPerModule = WINDOW_STYLES.find(w => w.id === material.windowStyle)?.premiumPerModule ?? 0;
  const windowPremium = windowPremiumPerModule * totalModules;
  const total = baseTotal + upperSurcharge + colorPremium + windowPremium;

  const breakdown: { labelKey: string; value: number }[] = [
    { labelKey: 'config.basePrice', value: baseTotal },
  ];
  if (upperSurcharge > 0) {
    breakdown.push({ labelKey: 'config.upperSurcharge', value: upperSurcharge });
  }
  if (colorPremium > 0) {
    breakdown.push({ labelKey: 'config.colorSurcharge', value: colorPremium });
  }
  if (windowPremium > 0) {
    breakdown.push({ labelKey: 'config.windowSurcharge', value: windowPremium });
  }

  return { baseTotal, upperSurcharge, colorPremium, windowPremium, total, breakdown };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value) + ' €';
}

/* ────────────────────────────────────────────
   Animated Price Display
   ──────────────────────────────────────────── */

function AnimatedPrice({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    prevValue.current = value;
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{formatPrice(displayed)}</span>;
}

/* ────────────────────────────────────────────
   Grid layout constants
   ──────────────────────────────────────────── */

const GRID_COLS = 5;
const GRID_ROWS = 3; // row 0-1 = upper area, row 2 = ground
const CELL_W = 96;
const CELL_H = 68;
const CELL_GAP = 4;
const DEFAULT_MODULE_LAYOUT: Record<string, { col: number; row: number }> = {
  'ground-0': { col: 1, row: 2 },
  'ground-1': { col: 2, row: 2 },
  'ground-2': { col: 3, row: 2 },
  'upper-0': { col: 1, row: 0 },
  'upper-1': { col: 2, row: 0 },
  'upper-2': { col: 3, row: 0 },
};

/* ────────────────────────────────────────────
   Enhanced Building Illustration (Drag-and-Drop Grid)
   ──────────────────────────────────────────── */

function BuildingIllustration({
  moduleAssignments,
  activeType,
  onPositionClick,
  flashPosition,
  sizeConfig,
  materialConfig,
  arrangeMode,
}: {
  moduleAssignments: Record<string, ModuleDef>;
  activeType: ModuleDef['type'] | null;
  onPositionClick: (positionId: string) => void;
  flashPosition: string | null;
  sizeConfig: SizeConfig;
  materialConfig: MaterialConfig;
  arrangeMode: boolean;
}) {
  const { t } = useTranslation();
  const positions = useMemo(() => getPositionsForSize(sizeConfig), [sizeConfig]);
  const wallHex = WALL_COLORS.find(c => c.id === materialConfig.wallColor)?.hex ?? '#2d4a3e';
  const roofHex = ROOF_COLORS.find(c => c.id === materialConfig.roofColor)?.hex ?? '#2d4a3e';
  const isPanorama = materialConfig.windowStyle === 'panorama';
  const isSprossen = materialConfig.windowStyle === 'sprossen';

  const moduleLayout = useAppStore((s) => s.moduleLayout);
  const setModuleLayout = useAppStore((s) => s.setModuleLayout);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [ghostPos, setGhostPos] = useState<{ col: number; row: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute layout for each module, falling back to defaults
  const layout = useMemo(() => {
    const result: Record<string, { col: number; row: number }> = {};
    const allPos = [...positions.ground, ...positions.upper];
    allPos.forEach((pos, idx) => {
      if (moduleLayout[pos.id]) {
        result[pos.id] = moduleLayout[pos.id];
      } else if (DEFAULT_MODULE_LAYOUT[pos.id]) {
        result[pos.id] = DEFAULT_MODULE_LAYOUT[pos.id];
      } else {
        // Assign to next available position. Row 0 = upper floor,
        // row 1 is a visual gap (see handleDragEnd snap logic), row 2 = ground.
        // Bug previously: ground modules defaulted to row 1 → new modules
        // landed in the gap and visually dropped out of the foundation.
        const col = idx % GRID_COLS;
        const row = pos.floor === 'upper' ? 0 : 2;
        result[pos.id] = { col, row };
      }
    });
    return result;
  }, [moduleLayout, positions]);

  const getPositionData = (positionId: string) => {
    // DEFAULT_ASSIGNMENTS only covers positions ground-0..2 and upper-0..2.
    // When the user adds a 4th/5th module, ground-3 etc. has no entry until
    // the parent's useEffect populates moduleAssignments — which happens one
    // render later. Without a fallback the tile is dropped entirely (returns
    // null), so the new module visually disappears. Fall back to a deterministic
    // default by stable index so the tile renders immediately.
    const direct = moduleAssignments[positionId] || DEFAULT_ASSIGNMENTS[positionId];
    if (direct) return direct;
    const match = positionId.match(/^(ground|upper)-(\d+)$/);
    if (!match) return undefined;
    const idx = parseInt(match[2], 10);
    const fallbackType = MODULE_TYPES[idx % MODULE_TYPES.length];
    if (!fallbackType) return undefined;
    return { id: positionId, ...fallbackType.defaultDef };
  };

  const renderModuleIcon = (type: ModuleDef['type']) => {
    const modType = MODULE_TYPES.find(m => m.id === type);
    if (!modType) return null;
    const Icon = modType.interiorIcon;
    return (
      <div className="relative z-10 mb-0.5">
        <Icon size={14} className="opacity-60" style={{ color: modType.emissiveColor }} />
      </div>
    );
  };

  const renderWindows = (data: ModuleDef) => {
    const modType = MODULE_TYPES.find(m => m.id === data.type);
    const count = modType?.windowCount ?? 2;
    const winSize = modType?.windowSize ?? 'medium';

    const dims = {
      large: isPanorama ? { w: 'w-5', h: 'h-8' } : { w: 'w-4', h: 'h-6' },
      medium: isPanorama ? { w: 'w-4', h: 'h-7' } : { w: 'w-3.5', h: 'h-5' },
      small: isPanorama ? { w: 'w-3', h: 'h-6' } : { w: 'w-3', h: 'h-4' },
    }[winSize];

    const isFrosted = data.type === 'bad';

    return (
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none" style={{ marginTop: isPanorama ? '2px' : '4px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${dims.w} ${dims.h} rounded-[1px] border relative overflow-hidden`}
            style={{
              backgroundColor: isFrosted ? data.windowColor + '18' : data.windowColor + '30',
              borderColor: isFrosted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, ${data.emissiveColor}25 0%, transparent 70%)`,
              }}
            />
            {isSprossen && (
              <>
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 -translate-x-1/2" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 -translate-y-1/2" />
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleDragEnd = useCallback((positionId: string, _event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    setDraggingId(null);
    setGhostPos(null);

    const currentLayout = layout[positionId];
    if (!currentLayout) return;

    const offsetX = info.offset.x;
    const offsetY = info.offset.y;

    // Calculate how many cells the module was dragged
    const colDelta = Math.round(offsetX / (CELL_W + CELL_GAP));
    const rowDelta = Math.round(offsetY / (CELL_H + CELL_GAP));

    let newCol = currentLayout.col + colDelta;
    let newRow = currentLayout.row + rowDelta;

    // Clamp to grid bounds
    newCol = Math.max(0, Math.min(GRID_COLS - 1, newCol));
    newRow = Math.max(0, Math.min(GRID_ROWS - 1, newRow));

    // Row 1 is a visual gap — snap to nearest valid floor row (0=upper, 2=ground)
    if (newRow === 1) {
      newRow = rowDelta >= 0 ? 2 : 0;
    }

    // If position didn't change, do nothing
    if (newCol === currentLayout.col && newRow === currentLayout.row) return;

    // Check if target cell is occupied by another module — swap them
    const newLayout = { ...layout };
    const occupyingModuleId = Object.entries(newLayout).find(
      ([id, pos]) => id !== positionId && pos.col === newCol && pos.row === newRow
    )?.[0];

    if (occupyingModuleId) {
      // Swap positions
      newLayout[occupyingModuleId] = { col: currentLayout.col, row: currentLayout.row };
    }
    newLayout[positionId] = { col: newCol, row: newRow };

    setModuleLayout(newLayout);
  }, [layout, setModuleLayout]);

  const handleDrag = useCallback((_positionId: string, info: { offset: { x: number; y: number } }) => {
    const currentLayout = layout[_positionId];
    if (!currentLayout) return;

    const colDelta = Math.round(info.offset.x / (CELL_W + CELL_GAP));
    const rowDelta = Math.round(info.offset.y / (CELL_H + CELL_GAP));

    let newCol = currentLayout.col + colDelta;
    let newRow = currentLayout.row + rowDelta;

    newCol = Math.max(0, Math.min(GRID_COLS - 1, newCol));
    newRow = Math.max(0, Math.min(GRID_ROWS - 1, newRow));

    // Skip row 1 (visual gap between floors)
    if (newRow === 1) {
      newRow = rowDelta >= 0 ? 2 : 0;
    }

    setGhostPos({ col: newCol, row: newRow });
  }, [layout]);

  const totalModules = sizeConfig.groundModules + sizeConfig.upperModules;

  // Dynamic roof: find leftmost and rightmost columns with modules in upper row
  const upperModules = [...positions.ground, ...positions.upper].filter(pos => {
    const posLayout = layout[pos.id];
    return posLayout && posLayout.row === 0;
  });

  const roofMinCol = upperModules.length > 0 ? Math.min(...upperModules.map(p => layout[p.id].col)) : 0;
  const roofMaxCol = upperModules.length > 0 ? Math.max(...upperModules.map(p => layout[p.id].col)) : Math.max(sizeConfig.groundModules, sizeConfig.upperModules) - 1;
  const roofSpan = roofMaxCol - roofMinCol + 1;

  // For non-arrange mode, also consider ground floor for roof width
  const groundModules = [...positions.ground].filter(pos => {
    const posLayout = layout[pos.id];
    return posLayout && posLayout.row === 2;
  });
  const groundMaxCol = groundModules.length > 0 ? Math.max(...groundModules.map(p => layout[p.id].col)) : sizeConfig.groundModules - 1;
  const groundMinCol = groundModules.length > 0 ? Math.min(...groundModules.map(p => layout[p.id].col)) : 0;

  // Roof covers the wider of upper or ground floor
  const effectiveRoofMin = upperModules.length > 0 ? Math.min(roofMinCol, groundMinCol) : groundMinCol;
  const effectiveRoofMax = upperModules.length > 0 ? Math.max(roofMaxCol, groundMaxCol) : groundMaxCol;
  const effectiveRoofSpan = effectiveRoofMax - effectiveRoofMin + 1;

  const gridTotalW = GRID_COLS * CELL_W + (GRID_COLS - 1) * CELL_GAP;
  const gridTotalH = GRID_ROWS * CELL_H + (GRID_ROWS - 1) * CELL_GAP;

  const allPos = [...positions.ground, ...positions.upper];

  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
      <div className="relative" style={{ width: gridTotalW + 40 }}>
        {/* Roof - dynamic based on module positions */}
        <div className="relative mx-auto mb-0" style={{ width: `${(effectiveRoofSpan / GRID_COLS) * 100 + 5}%`, marginLeft: `${(effectiveRoofMin / GRID_COLS) * 100 - 2}%` }}>
          <svg viewBox={`0 0 ${effectiveRoofSpan * 100 + 40} 35`} className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roofGradConfig" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={roofHex} stopOpacity="0.9" />
                <stop offset="100%" stopColor={roofHex} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,35 15,8 ${effectiveRoofSpan * 100 + 25},8 ${effectiveRoofSpan * 100 + 40},35`}
              fill="url(#roofGradConfig)"
            />
            {Array.from({ length: effectiveRoofSpan * 3 }).map((_, i) => (
              <line
                key={i}
                x1={25 + i * (effectiveRoofSpan * 100 / (effectiveRoofSpan * 3))}
                y1="12"
                x2={25 + i * (effectiveRoofSpan * 100 / (effectiveRoofSpan * 3))}
                y2="35"
                stroke="rgba(195, 248, 189,0.08)"
                strokeWidth="1"
              />
            ))}
            <line x1="15" y1="8" x2={`${effectiveRoofSpan * 100 + 25}`} y2="8" stroke="rgba(195, 248, 189,0.2)" strokeWidth="1" />
          </svg>
        </div>

        {/* Grid container for modules */}
        <div
          ref={containerRef}
          className="relative mx-auto"
          style={{ width: gridTotalW, height: gridTotalH }}
        >
          {/* Grid overlay lines - always visible for drag guidance */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Column dividers */}
            {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
              <div
                key={`col-${i}`}
                className="absolute top-0 bottom-0 w-[1px]"
                style={{
                  left: i * (CELL_W + CELL_GAP) - CELL_GAP / 2,
                  backgroundColor: arrangeMode ? 'rgba(195, 248, 189,0.1)' : 'rgba(195, 248, 189,0.04)',
                }}
              />
            ))}
            {/* Row dividers */}
            {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
              <div
                key={`row-${i}`}
                className="absolute left-0 right-0 h-[1px]"
                style={{
                  top: i * (CELL_H + CELL_GAP) - CELL_GAP / 2,
                  backgroundColor: arrangeMode ? 'rgba(195, 248, 189,0.1)' : 'rgba(195, 248, 189,0.04)',
                }}
              />
            ))}
            {/* Cell backgrounds */}
            {Array.from({ length: GRID_ROWS }).map((_, row) =>
              Array.from({ length: GRID_COLS }).map((_, col) => (
                <div
                  key={`cell-${row}-${col}`}
                  className="absolute rounded-sm border border-dashed"
                  style={{
                    left: col * (CELL_W + CELL_GAP),
                    top: row * (CELL_H + CELL_GAP),
                    width: CELL_W,
                    height: CELL_H,
                    borderColor: ghostPos && ghostPos.col === col && ghostPos.row === row
                      ? 'rgba(195, 248, 189,0.4)'
                      : arrangeMode
                        ? 'rgba(195, 248, 189,0.1)'
                        : 'rgba(195, 248, 189,0.03)',
                    backgroundColor: ghostPos && ghostPos.col === col && ghostPos.row === row
                      ? 'rgba(195, 248, 189,0.06)'
                      : 'rgba(195, 248, 189,0.01)',
                  }}
                />
              ))
            )}
          </div>

          {/* Ghost position (drop preview) - always show when dragging */}
          {ghostPos && draggingId && (
            <motion.div
              className="absolute rounded-sm border-2 border-dashed border-omni-mint/50 pointer-events-none"
              style={{
                left: ghostPos.col * (CELL_W + CELL_GAP),
                top: ghostPos.row * (CELL_H + CELL_GAP),
                width: CELL_W,
                height: CELL_H,
                backgroundColor: 'rgba(195, 248, 189,0.08)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
            />
          )}

          {/* Module blocks */}
          {allPos.map((pos) => {
            const data = getPositionData(pos.id);
            if (!data) return null;

            const posLayout = layout[pos.id];
            if (!posLayout) return null;

            const isFlashing = flashPosition === pos.id;
            const isInteractive = activeType !== null && !arrangeMode;
            const isDragging = draggingId === pos.id;
            const isUpper = posLayout.row === 0;
            const hasHood = data.type === 'kueche' && isUpper;

            return (
              <motion.div
                key={pos.id}
                className="absolute"
                style={{
                  left: posLayout.col * (CELL_W + CELL_GAP),
                  top: posLayout.row * (CELL_H + CELL_GAP),
                  width: CELL_W,
                  height: CELL_H,
                  zIndex: isDragging ? 50 : 1,
                }}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <motion.button
                  onClick={() => { if (!arrangeMode && activeType) onPositionClick(pos.id); }}
                  disabled={false}
                  drag={true}
                  dragMomentum={false}
                  dragElastic={0.1}
                  dragConstraints={containerRef}
                  onDragStart={() => setDraggingId(pos.id)}
                  onDrag={(_, info) => handleDrag(pos.id, info)}
                  onDragEnd={(_e, info) => handleDragEnd(pos.id, _e, info)}
                  className={`relative flex flex-col items-center justify-center rounded-sm transition-colors duration-200 border-2 w-full h-full ${
                    isDragging
                      ? 'border-omni-mint shadow-[0_0_24px_rgba(195, 248, 189,0.35)] scale-105 cursor-grabbing'
                      : isFlashing
                        ? 'border-omni-mint shadow-[0_0_20px_rgba(195, 248, 189,0.3)]'
                        : arrangeMode
                          ? 'border-omni-mint/30 cursor-grab active:cursor-grabbing hover:border-omni-mint/50 hover:shadow-[0_0_12px_rgba(195, 248, 189,0.15)]'
                          : isInteractive
                            ? 'border-white/10 hover:border-omni-mint/50 hover:shadow-[0_0_15px_rgba(195, 248, 189,0.15)] cursor-grab active:cursor-grabbing'
                            : 'border-white/5 cursor-grab active:cursor-grabbing hover:border-omni-mint/20'
                  }`}
                  style={{ backgroundColor: wallHex }}
                  whileHover={isInteractive ? { scale: 1.05 } : arrangeMode ? { scale: 1.02 } : { scale: 1.02 }}
                  whileTap={isDragging ? { scale: 1.05 } : { scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: isDragging ? 1.05 : 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {/* Interior glow overlay */}
                  <div
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at center bottom, ${data.emissiveColor}15 0%, transparent 60%)`,
                    }}
                  />

                  {/* Drag handle - always visible */}
                  <div className="absolute top-0.5 right-0.5 z-20">
                    <Move size={10} className="text-omni-mint/40 group-hover:text-omni-mint/70 transition-colors" />
                  </div>

                  {/* Ventilation hood for kitchen on upper floor */}
                  {hasHood && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-t-sm bg-[#555] border-t border-x border-white/10" />
                  )}

                  {/* Windows */}
                  {renderWindows(data)}

                  {/* Interior icon */}
                  <div className="relative z-10 mt-3">
                    {renderModuleIcon(data.type)}
                  </div>

                  {/* Module type label */}
                  <span className="relative z-10 text-[7px] sm:text-[8px] font-medium text-white/80 tracking-wide truncate max-w-full px-1">
                    {MODULE_TYPES.find(m => m.id === data.type) ? t(MODULE_TYPES.find(m => m.id === data.type)!.labelKey) : data.label}
                  </span>

                  {/* Corrugation lines */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-[1px]"
                        style={{
                          top: `${15 + i * 15}%`,
                          backgroundColor: 'rgba(255,255,255,0.04)',
                        }}
                      />
                    ))}
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Connection line between floors */}
        <div className="relative h-3 flex items-center justify-center">
          <div
            className="h-[2px] bg-gradient-to-r from-omni-mint/10 via-omni-mint/25 to-omni-mint/10"
            style={{ width: `${effectiveRoofSpan / GRID_COLS * 100}%` }}
          />
        </div>

        {/* Foundation */}
        <div className="relative mt-0">
          <div
            className="mx-auto h-5 rounded-b-sm relative"
            style={{
              width: `${(groundModules.length > 0 ? (groundMaxCol - groundMinCol + 1) : sizeConfig.groundModules) / GRID_COLS * 100 + 5}%`,
              marginLeft: `${(groundModules.length > 0 ? groundMinCol : 0) / GRID_COLS * 100 - 2}%`,
              background: 'linear-gradient(to bottom, #606060, #4a4a4a)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-b-sm">
              {Array.from({ length: (groundMaxCol - groundMinCol + 1) * 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1 h-[1px]"
                  style={{
                    left: `${5 + i * (90 / ((groundMaxCol - groundMinCol + 1) * 3))}%`,
                    width: '6%',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white/30 tracking-[0.2em] uppercase">
              {t('config.fundament')}
            </span>
          </div>
        </div>

        {/* Floor labels */}
        {sizeConfig.upperModules > 0 && (
          <div className="absolute left-0 top-[30%] -translate-y-1/2 -translate-x-full pr-2 hidden sm:block">
            <span className="text-[8px] tracking-[0.15em] text-omni-mint/40 uppercase whitespace-nowrap">{t('config.floorOG')}</span>
          </div>
        )}
        <div className="absolute left-0 top-[75%] -translate-y-1/2 -translate-x-full pr-2 hidden sm:block">
          <span className="text-[8px] tracking-[0.15em] text-omni-mint/40 uppercase whitespace-nowrap">{t('config.floorEG')}</span>
        </div>

        {/* Module count badge */}
        <div className="absolute -top-2 -right-2 bg-omni-mint text-omni-forest-deep text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {totalModules}
        </div>

        {/* Drag hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none"
        >
          <Move size={10} className="text-omni-mint/30" />
          <span className="text-[8px] tracking-[0.15em] text-omni-mint/30 uppercase">{t('config.dragHint')}</span>
        </motion.div>

        {/* Scale reference - person silhouette */}
        <div className="absolute -right-6 bottom-5 hidden sm:flex flex-col items-center opacity-15">
          <svg width="12" height="35" viewBox="0 0 12 35" fill="white">
            <circle cx="6" cy="4" r="3.5" />
            <line x1="6" y1="7" x2="6" y2="22" stroke="white" strokeWidth="2" />
            <line x1="6" y1="12" x2="1" y2="18" stroke="white" strokeWidth="1.5" />
            <line x1="6" y1="12" x2="11" y2="18" stroke="white" strokeWidth="1.5" />
            <line x1="6" y1="22" x2="2" y2="34" stroke="white" strokeWidth="1.5" />
            <line x1="6" y1="22" x2="10" y2="34" stroke="white" strokeWidth="1.5" />
          </svg>
          <span className="text-[6px] text-white/20 tracking-wider">1,75m</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Step Indicator
   ──────────────────────────────────────────── */

function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
          isActive
            ? 'bg-omni-mint text-omni-forest-deep'
            : isCompleted
              ? 'bg-omni-mint/30 text-omni-mint'
              : 'bg-white/5 text-white/30 border border-white/10'
        }`}
      >
        {isCompleted ? <Check size={14} /> : step}
      </div>
      <span
        className={`text-xs tracking-wide transition-colors duration-300 hidden sm:inline ${
          isActive ? 'text-omni-mint' : isCompleted ? 'text-white/60' : 'text-white/30'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────
   Step 1: Size Configuration
   ──────────────────────────────────────────── */

function StepSizeConfig() {
  const { t } = useTranslation();
  const sizeConfig = useAppStore((s) => s.sizeConfig);
  const setSizeConfig = useAppStore((s) => s.setSizeConfig);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-2">
          {t('config.sizeTitle')}
        </h3>
        <p className="text-[11px] text-omni-cream leading-relaxed mb-6">
          {t('config.sizeDesc', { area: MODULE_AREA })}
        </p>
      </div>

      {/* Ground floor modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white tracking-wide">{t('config.groundFloor')}</span>
          <span className="text-sm text-omni-mint font-light">{sizeConfig.groundModules} {t('config.modules')}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSizeConfig({ groundModules: Math.max(1, sizeConfig.groundModules - 1) })}
            disabled={sizeConfig.groundModules <= 1}
            className="w-10 h-10 rounded-lg border border-white/10 bg-omni-forest/60 flex items-center justify-center text-white/60 hover:border-omni-mint/30 hover:text-omni-mint transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ein Modul weniger im Erdgeschoss"
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-omni-mint to-omni-mint-soft rounded-full transition-all duration-300"
              style={{ width: `${((sizeConfig.groundModules - 1) / 3) * 100}%` }}
            />
          </div>
          <button
            onClick={() => setSizeConfig({ groundModules: Math.min(4, sizeConfig.groundModules + 1) })}
            disabled={sizeConfig.groundModules >= 4}
            className="w-10 h-10 rounded-lg border border-white/10 bg-omni-forest/60 flex items-center justify-center text-white/60 hover:border-omni-mint/30 hover:text-omni-mint transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ein Modul mehr im Erdgeschoss"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-white/20">{sizeConfig.groundModules * MODULE_AREA} m²</span>
          <span className="text-[9px] text-white/20">max. {4 * MODULE_AREA} m²</span>
        </div>
      </div>

      {/* Upper floor modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white tracking-wide">{t('config.upperFloor')}</span>
          <span className="text-sm text-omni-mint font-light">
            {sizeConfig.upperModules === 0 ? t('config.none') : `${sizeConfig.upperModules} ${t('config.modules')}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSizeConfig({ upperModules: Math.max(0, sizeConfig.upperModules - 1) })}
            disabled={sizeConfig.upperModules <= 0}
            className="w-10 h-10 rounded-lg border border-white/10 bg-omni-forest/60 flex items-center justify-center text-white/60 hover:border-omni-mint/30 hover:text-omni-mint transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ein Modul weniger im Obergeschoss"
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-omni-mint to-omni-mint-soft rounded-full transition-all duration-300"
              style={{ width: `${(sizeConfig.upperModules / 4) * 100}%` }}
            />
          </div>
          <button
            onClick={() => setSizeConfig({ upperModules: Math.min(4, sizeConfig.upperModules + 1) })}
            disabled={sizeConfig.upperModules >= 4}
            className="w-10 h-10 rounded-lg border border-white/10 bg-omni-forest/60 flex items-center justify-center text-white/60 hover:border-omni-mint/30 hover:text-omni-mint transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ein Modul mehr im Obergeschoss"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-white/20">{sizeConfig.upperModules * MODULE_AREA} m²</span>
          <span className="text-[9px] text-white/20">max. {4 * MODULE_AREA} m²</span>
        </div>
        {sizeConfig.upperModules === 0 && (
          <p className="text-[10px] text-omni-mint/50 mt-2 flex items-center gap-1">
            <ArrowDown size={10} /> {t('config.singleStory')}
          </p>
        )}
      </div>

      {/* Summary card */}
      <div className="bg-omni-forest/40 border border-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-omni-cream">{t('config.totalArea')}</span>
          <span className="text-lg text-omni-mint font-light">
            {(sizeConfig.groundModules + sizeConfig.upperModules) * MODULE_AREA} m²
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-omni-cream">{t('config.totalModules')}</span>
          <span className="text-sm text-white">{sizeConfig.groundModules + sizeConfig.upperModules}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Step 2: Module Assignment
   ──────────────────────────────────────────── */

function StepModuleAssignment({
  activeType,
  setActiveType,
  arrangeMode,
  setArrangeMode,
}: {
  activeType: ModuleDef['type'] | null;
  setActiveType: (type: ModuleDef['type'] | null) => void;
  arrangeMode: boolean;
  setArrangeMode: (mode: boolean) => void;
}) {
  const sizeConfig = useAppStore((s) => s.sizeConfig);
  const moduleAssignments = useAppStore((s) => s.moduleAssignments);
  const setModuleAssignment = useAppStore((s) => s.setModuleAssignment);
  const setSelectedModules = useAppStore((s) => s.setSelectedModules);
  const selectedModules = useAppStore((s) => s.selectedModules);
  const [flashPosition, setFlashPosition] = useState<string | null>(null);

  const { t } = useTranslation();
  const positions = useMemo(() => getPositionsForSize(sizeConfig), [sizeConfig]);

  // Initialize assignments for new positions when size changes
  useEffect(() => {
    const allPositionIds = [...positions.ground.map(p => p.id), ...positions.upper.map(p => p.id)];
    setSelectedModules(allPositionIds);

    allPositionIds.forEach(posId => {
      if (!moduleAssignments[posId] && !DEFAULT_ASSIGNMENTS[posId]) {
        const defaultType = posId.startsWith('ground')
          ? MODULE_TYPES[positions.ground.findIndex(p => p.id === posId) % MODULE_TYPES.length]
          : MODULE_TYPES[positions.upper.findIndex(p => p.id === posId) % MODULE_TYPES.length];
        if (defaultType) {
          setModuleAssignment(posId, {
            id: posId,
            ...defaultType.defaultDef,
          });
        }
      } else if (!moduleAssignments[posId] && DEFAULT_ASSIGNMENTS[posId]) {
        setModuleAssignment(posId, DEFAULT_ASSIGNMENTS[posId]);
      }
    });
  }, [sizeConfig, positions, setModuleAssignment, setSelectedModules, moduleAssignments]);

  const handlePositionClick = useCallback((positionId: string) => {
    if (!activeType) return;
    const moduleTypeData = MODULE_TYPES.find((m) => m.id === activeType);
    if (!moduleTypeData) return;

    const newModuleDef: ModuleDef = {
      id: positionId,
      ...moduleTypeData.defaultDef,
    };

    setModuleAssignment(positionId, newModuleDef);

    if (!selectedModules.includes(positionId)) {
      setSelectedModules([...selectedModules, positionId]);
    }

    setFlashPosition(positionId);
    setTimeout(() => setFlashPosition(null), 600);
  }, [activeType, selectedModules, setSelectedModules, setModuleAssignment]);

  const mergedAssignments: Record<string, ModuleDef> = {
    ...DEFAULT_ASSIGNMENTS,
    ...moduleAssignments,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-2">
          {t('config.assignTitle')}
        </h3>
        <p className="text-[11px] text-omni-cream leading-relaxed mb-4">
          {arrangeMode
            ? t('config.arrangeDesc')
            : t('config.assignDesc')}
        </p>
      </div>

      {/* Arrange mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setArrangeMode(!arrangeMode); if (!arrangeMode) setActiveType(null); }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 text-[10px] tracking-wider uppercase min-h-[44px] ${
            arrangeMode
              ? 'border-omni-mint/50 bg-omni-mint/15 text-omni-mint'
              : 'border-white/10 bg-omni-forest/60 text-white/50 hover:border-white/20 hover:text-white/70'
          }`}
        >
          <Move size={14} />
          {t('config.arrangeToggle')}
        </button>
        {arrangeMode && (
          <button
            onClick={() => {
              const defaultLayout: Record<string, { col: number; row: number }> = {};
              const allPos = [...getPositionsForSize(sizeConfig).ground, ...getPositionsForSize(sizeConfig).upper];
              allPos.forEach((pos) => {
                if (DEFAULT_MODULE_LAYOUT[pos.id]) {
                  defaultLayout[pos.id] = DEFAULT_MODULE_LAYOUT[pos.id];
                } else {
                  const idx = allPos.indexOf(pos);
                  defaultLayout[pos.id] = { col: idx % GRID_COLS, row: pos.floor === 'Obergeschoss' ? 0 : 1 };
                }
              });
              useAppStore.getState().setModuleLayout(defaultLayout);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-omni-forest/60 text-white/50 hover:border-white/20 hover:text-white/70 transition-all duration-300 text-[10px] tracking-wider uppercase min-h-[44px]"
          >
            <RotateCcw size={12} />
            {t('config.arrangeReset')}
          </button>
        )}
      </div>

      {/* Module Type Selection (disabled in arrange mode) */}
      <div className={`grid grid-cols-2 gap-2 sm:gap-3 transition-opacity duration-300 ${arrangeMode ? 'opacity-30 pointer-events-none' : ''}`}>
        {MODULE_TYPES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeType === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveType(isActive ? null : mod.id)}
              className={`group p-3 sm:p-4 rounded-lg border transition-all duration-300 text-left min-h-[44px] ${
                isActive
                  ? 'border-omni-mint/50 bg-omni-mint/10'
                  : 'border-white/5 bg-omni-forest/60 hover:border-white/10'
              }`}
            >
              <Icon
                size={18}
                className="mb-1.5 transition-colors duration-300"
                style={{ color: isActive ? mod.color : '#D4C5A0' }}
              />
              <p className="text-[10px] sm:text-xs font-medium text-white tracking-wide">
                {t(mod.labelKey)}
              </p>
              {isActive && (
                <Check size={12} className="mt-1 text-omni-mint" />
              )}
            </button>
          );
        })}
      </div>

      {/* Position buttons by floor (disabled in arrange mode) */}
      {!arrangeMode && ([
        { key: 'ground', label: t('config.groundFloor') },
        { key: 'upper', label: t('config.upperFloor') },
      ] as const).map(({ key, label }) => {
        const floorPositions = key === 'ground' ? positions.ground : positions.upper;
        if (key === 'upper' && sizeConfig.upperModules === 0) return null;

        return (
          <div key={key}>
            <p className="text-[10px] tracking-[0.2em] text-omni-mint uppercase mb-2">
              {label}
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${floorPositions.length}, 1fr)` }}>
              {floorPositions.map((pos) => {
                const assignment = mergedAssignments[pos.id];
                const isFlashing = flashPosition === pos.id;

                return (
                  <button
                    key={pos.id}
                    onClick={() => handlePositionClick(pos.id)}
                    disabled={!activeType}
                    className={`p-2 sm:p-3 rounded-md border text-center transition-all duration-300 relative overflow-hidden min-h-[44px] ${
                      isFlashing
                        ? 'border-omni-mint bg-omni-mint/20 scale-105'
                        : activeType
                          ? 'border-white/5 bg-omni-forest/40 hover:border-white/10 cursor-pointer'
                          : 'border-white/5 bg-omni-forest/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {assignment && (
                      <div
                        className="absolute top-0 left-0 w-1 h-full rounded-l-md"
                        style={{ backgroundColor: assignment.emissiveColor }}
                      />
                    )}
                    <p className="text-[9px] sm:text-[10px] text-white/80 tracking-wide relative z-10 truncate">
                      {t(pos.labelKey)}
                    </p>
                    {assignment && (
                      <p className="text-[7px] sm:text-[8px] text-omni-mint/70 mt-0.5 truncate relative z-10">
                        {t(MODULE_TYPES.find(m => m.id === assignment.type)?.labelKey || '')}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {activeType && !arrangeMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-omni-mint/10 backdrop-blur-sm px-4 py-2.5 rounded-md border border-omni-mint/20"
        >
          <p className="text-[10px] tracking-[0.15em] text-omni-mint">
            {t('config.assignHint', { module: t(MODULE_TYPES.find(m => m.id === activeType)?.labelKey || '') })}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Step 3: Material / Color Customization
   ──────────────────────────────────────────── */

function StepMaterial() {
  const { t } = useTranslation();
  const materialConfig = useAppStore((s) => s.materialConfig);
  const setMaterialConfig = useAppStore((s) => s.setMaterialConfig);
  const moduleQuality = useAppStore((s) => s.moduleQuality);
  const setModuleQuality = useAppStore((s) => s.setModuleQuality);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-2">
          {t('config.materialTitle')}
        </h3>
        <p className="text-[11px] text-omni-cream leading-relaxed">
          {t('config.materialDesc')}
        </p>
      </div>

      {/* Module Quality */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-omni-mint uppercase mb-3">{t('config.quality')}</p>
        <div className="grid grid-cols-2 gap-2">
          {(['standard', 'premium'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setModuleQuality(q)}
              className={`p-3 rounded-lg border transition-all duration-300 text-left min-h-[44px] ${
                moduleQuality === q
                  ? 'border-omni-mint/50 bg-omni-mint/10'
                  : 'border-white/5 bg-omni-forest/60 hover:border-white/10'
              }`}
            >
              <p className="text-xs text-white tracking-wide">{t(q === 'standard' ? 'config.qualityStandard' : 'config.qualityPremium')}</p>
              <p className="text-[9px] text-omni-cream mt-0.5">
                {t(q === 'standard' ? 'config.qualityStandardPrice' : 'config.qualityPremiumPrice')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Wall Color */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-omni-mint uppercase mb-3">{t('config.wallColor')}</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {WALL_COLORS.map((color) => {
            const isSelected = materialConfig.wallColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => setMaterialConfig({ wallColor: color.id })}
                className={`relative flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg border transition-all duration-300 min-h-[44px] ${
                  isSelected
                    ? 'border-omni-mint/50 bg-omni-mint/10'
                    : 'border-white/5 bg-omni-forest/60 hover:border-white/10'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md border-2 transition-all ${
                    isSelected ? 'border-omni-mint shadow-[0_0_8px_rgba(195, 248, 189,0.2)]' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[8px] sm:text-[9px] text-white/70 tracking-wide">{t(color.labelKey)}</span>
                {color.premium > 0 && (
                  <span className="text-[7px] text-omni-mint/60">+{formatPrice(color.premium)}</span>
                )}
                {isSelected && (
                  <Check size={10} className="absolute top-1 right-1 text-omni-mint" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roof Color */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-omni-mint uppercase mb-3">{t('config.roofColor')}</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {ROOF_COLORS.map((color) => {
            const isSelected = materialConfig.roofColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => setMaterialConfig({ roofColor: color.id })}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-300 min-h-[44px] ${
                  isSelected
                    ? 'border-omni-mint/50 bg-omni-mint/10'
                    : 'border-white/5 bg-omni-forest/60 hover:border-white/10'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md border-2 transition-all ${
                    isSelected ? 'border-omni-mint shadow-[0_0_8px_rgba(195, 248, 189,0.2)]' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[7px] sm:text-[8px] text-white/70 tracking-wide">{t(color.labelKey)}</span>
                {isSelected && (
                  <Check size={8} className="absolute top-0.5 right-0.5 text-omni-mint" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Window Style */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-omni-mint uppercase mb-3">{t('config.windowStyle')}</p>
        <div className="space-y-2">
          {WINDOW_STYLES.map((style) => {
            const isSelected = materialConfig.windowStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setMaterialConfig({ windowStyle: style.id })}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 min-h-[44px] ${
                  isSelected
                    ? 'border-omni-mint/50 bg-omni-mint/10'
                    : 'border-white/5 bg-omni-forest/60 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Window style icon */}
                  <div className="w-10 h-7 rounded border flex items-center justify-center" style={{
                    borderColor: isSelected ? '#C3F8BD50' : 'rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(200,220,255,0.08)',
                  }}>
                    {style.id === 'panorama' ? (
                      <div className="w-7 h-5 border border-white/20 rounded-sm bg-[#cce5ff]/10" />
                    ) : style.id === 'sprossen' ? (
                      <div className="w-6 h-5 border border-white/20 rounded-sm bg-[#cce5ff]/10 relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 -translate-x-1/2" />
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 -translate-y-1/2" />
                      </div>
                    ) : (
                      <div className="w-5 h-4 border border-white/20 rounded-sm bg-[#cce5ff]/10" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] sm:text-xs text-white tracking-wide">{t(style.labelKey)}</p>
                    <p className="text-[8px] sm:text-[9px] text-omni-cream">{t(style.descKey)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {style.premiumPerModule > 0 && (
                    <span className="text-[8px] text-omni-mint/60">+{formatPrice(style.premiumPerModule)}/Mod.</span>
                  )}
                  {isSelected && <Check size={14} className="text-omni-mint" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Summary Panel (shown in step 3)
   ──────────────────────────────────────────── */

function SummaryPanel() {
  const { t } = useTranslation();
  const sizeConfig = useAppStore((s) => s.sizeConfig);
  const materialConfig = useAppStore((s) => s.materialConfig);
  const moduleQuality = useAppStore((s) => s.moduleQuality);
  const moduleAssignments = useAppStore((s) => s.moduleAssignments);
  const mergedAssignments: Record<string, ModuleDef> = { ...DEFAULT_ASSIGNMENTS, ...moduleAssignments };

  const positions = useMemo(() => getPositionsForSize(sizeConfig), [sizeConfig]);
  const priceData = useMemo(
    () => calculatePrice(sizeConfig, moduleQuality, materialConfig),
    [sizeConfig, moduleQuality, materialConfig],
  );

  const totalArea = (sizeConfig.groundModules + sizeConfig.upperModules) * MODULE_AREA;
  const estimatedWeeks = Math.max(8, Math.ceil(totalArea / 10) * 2);

  const handleRequestConfiguration = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDownloadPdf = () => {
    toast({
      title: 'Coming soon',
      description: 'Der PDF-Download wird in Kürze verfügbar sein.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-omni-forest/40 border border-white/5 rounded-lg p-4 sm:p-6 mt-6"
    >
      <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-4">
        {t('config.summary')}
      </h3>

      {/* Module breakdown */}
      <div className="space-y-2 mb-4">
        {positions.ground.map((pos) => {
          const assignment = mergedAssignments[pos.id];
          return (
            <div key={pos.id} className="flex items-center justify-between text-[10px]">
              <span className="text-omni-cream">{t('config.floorEG')} – {t(pos.labelKey)}</span>
              <span className="flex items-center gap-1.5">
                {assignment && (
                  <span
                    className="w-2 h-2 rounded-sm inline-block"
                    style={{ backgroundColor: assignment.emissiveColor }}
                  />
                )}
                <span className="text-omni-mint">{assignment ? t(MODULE_TYPES.find(m => m.id === assignment.type)?.labelKey || '') : '—'}</span>
                <span className="text-white/30">{MODULE_AREA} m²</span>
              </span>
            </div>
          );
        })}
        {positions.upper.map((pos) => {
          const assignment = mergedAssignments[pos.id];
          return (
            <div key={pos.id} className="flex items-center justify-between text-[10px]">
              <span className="text-omni-cream">{t('config.floorOG')} – {t(pos.labelKey)}</span>
              <span className="flex items-center gap-1.5">
                {assignment && (
                  <span
                    className="w-2 h-2 rounded-sm inline-block"
                    style={{ backgroundColor: assignment.emissiveColor }}
                  />
                )}
                <span className="text-omni-mint">{assignment ? t(MODULE_TYPES.find(m => m.id === assignment.type)?.labelKey || '') : '—'}</span>
                <span className="text-white/30">{MODULE_AREA} m²</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-omni-cream">{t('config.livingArea')}</span>
          <span className="text-sm text-white">{totalArea} m²</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-omni-cream">{t('config.floors')}</span>
          <span className="text-sm text-white">{sizeConfig.upperModules > 0 ? '2' : '1'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-omni-cream">{t('config.estimatedBuildTime')}</span>
          <span className="text-sm text-white">~{estimatedWeeks} {t('config.weeks')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-omni-cream">{t('config.exteriorWall')}</span>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block border border-white/10"
              style={{ backgroundColor: WALL_COLORS.find(c => c.id === materialConfig.wallColor)?.hex }}
            />
            <span className="text-sm text-white">{t(WALL_COLORS.find(c => c.id === materialConfig.wallColor)?.labelKey || '')}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-omni-cream">{t('config.roof')}</span>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block border border-white/10"
              style={{ backgroundColor: ROOF_COLORS.find(c => c.id === materialConfig.roofColor)?.hex }}
            />
            <span className="text-sm text-white">{t(ROOF_COLORS.find(c => c.id === materialConfig.roofColor)?.labelKey || '')}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-omni-cream">{t('config.windows')}</span>
          <span className="text-sm text-white">{t(WINDOW_STYLES.find(w => w.id === materialConfig.windowStyle)?.labelKey || '')}</span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="border-t border-white/5 pt-3 mt-3 space-y-1.5">
        {priceData.breakdown.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-[10px] text-omni-cream">{t(item.labelKey)}</span>
            <span className="text-[10px] text-white/60">{formatPrice(item.value)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t border-omni-mint/20">
          <span className="text-xs text-omni-mint font-medium tracking-wide">{t('config.estimatedPrice')}</span>
          <span className="text-lg text-omni-mint font-light">
            <AnimatedPrice value={priceData.total} />
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button
          onClick={handleRequestConfiguration}
          className="flex-1 bg-gradient-to-r from-omni-mint to-omni-mint-deep hover:from-omni-mint-soft hover:to-omni-mint text-omni-forest-deep font-medium tracking-[0.1em] uppercase text-xs min-h-[44px]"
        >
          <FileText size={14} className="mr-2" />
          {t('config.requestConfig')}
        </Button>
        <Button
          onClick={handleDownloadPdf}
          variant="outline"
          className="flex-1 border-white/10 text-omni-cream hover:text-white hover:border-white/20 tracking-wider text-xs uppercase min-h-[44px]"
        >
          <Download size={14} className="mr-2" />
          {t('config.downloadPdf')}
        </Button>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Main ConfiguratorSection Component
   ──────────────────────────────────────────── */

export default function ConfiguratorSection() {
  const { t } = useTranslation();
  const selectedModules = useAppStore((s) => s.selectedModules);
  const setSelectedModules = useAppStore((s) => s.setSelectedModules);
  const setExperienceMode = useAppStore((s) => s.setExperienceMode);
  const moduleAssignments = useAppStore((s) => s.moduleAssignments);
  const setModuleAssignment = useAppStore((s) => s.setModuleAssignment);
  const configuratorStep = useAppStore((s) => s.configuratorStep);
  const setConfiguratorStep = useAppStore((s) => s.setConfiguratorStep);
  const sizeConfig = useAppStore((s) => s.sizeConfig);
  const materialConfig = useAppStore((s) => s.materialConfig);
  const resetConfigurator = useAppStore((s) => s.resetConfigurator);
  const moduleQuality = useAppStore((s) => s.moduleQuality);
  const arrangeMode = useAppStore((s) => s.arrangeMode);
  const setArrangeMode = useAppStore((s) => s.setArrangeMode);

  // Lifted state - activeType is shared between StepModuleAssignment and BuildingIllustration
  const [activeType, setActiveType] = useState<ModuleDef['type'] | null>(null);
  const [flashPosition, setFlashPosition] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Initialize defaults on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setSelectedModules([
        'ground-0', 'ground-1', 'ground-2',
        'upper-0', 'upper-1', 'upper-2',
      ]);
      Object.entries(DEFAULT_ASSIGNMENTS).forEach(([posId, modDef]) => {
        setModuleAssignment(posId, modDef);
      });
    }
  }, [setSelectedModules, setModuleAssignment]);

  useEffect(() => {
    setExperienceMode('configurator');
  }, [setExperienceMode]);

  const handleReset = useCallback(() => {
    resetConfigurator();
    setActiveType(null);
    setFlashPosition(null);
    setTimeout(() => {
      setSelectedModules([
        'ground-0', 'ground-1', 'ground-2',
        'upper-0', 'upper-1', 'upper-2',
      ]);
      Object.entries(DEFAULT_ASSIGNMENTS).forEach(([posId, modDef]) => {
        setModuleAssignment(posId, modDef);
      });
    }, 100);
  }, [resetConfigurator, setSelectedModules, setModuleAssignment]);

  const mergedAssignments: Record<string, ModuleDef> = {
    ...DEFAULT_ASSIGNMENTS,
    ...moduleAssignments,
  };

  const priceData = useMemo(
    () => calculatePrice(sizeConfig, moduleQuality, materialConfig),
    [sizeConfig, moduleQuality, materialConfig],
  );

  // Handler for clicking on building illustration positions
  const handleIllustrationClick = useCallback((positionId: string) => {
    if (!activeType) return;
    const moduleTypeData = MODULE_TYPES.find((m) => m.id === activeType);
    if (!moduleTypeData) return;

    const newModuleDef: ModuleDef = { id: positionId, ...moduleTypeData.defaultDef };
    setModuleAssignment(positionId, newModuleDef);

    if (!selectedModules.includes(positionId)) {
      setSelectedModules([...selectedModules, positionId]);
    }

    setFlashPosition(positionId);
    setTimeout(() => setFlashPosition(null), 600);
  }, [activeType, selectedModules, setSelectedModules, setModuleAssignment]);

  // Helper to change step and clear activeType if leaving step 2
  const changeStep = useCallback((newStep: number) => {
    if (newStep !== 2) {
      setActiveType(null);
      setArrangeMode(false);
    }
    setConfiguratorStep(newStep);
  }, [setConfiguratorStep, setArrangeMode]);

  const steps = [
    { step: 1, label: t('config.step1') },
    { step: 2, label: t('config.step2') },
    { step: 3, label: t('config.step3') },
  ];

  return (
    <section id="configurator" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-omni-forest-deep">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-12 h-[1px] bg-gradient-to-r from-transparent via-omni-mint to-transparent mx-auto mb-4 origin-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs tracking-[0.3em] text-omni-mint uppercase mb-4"
          >
            {t('config.label')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4"
          >
            {t('config.title').split(t('config.titleAccent')).map((part, i, arr) =>
              i < arr.length - 1
                ? <span key={i}>{part}<span className="text-gradient-gold">{t('config.titleAccent')}</span></span>
                : <span key={i}>{part}</span>
            )}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm sm:text-base text-omni-cream max-w-2xl mx-auto mt-4"
          >
            {t('config.subtitle')}
          </motion.p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-omni-mint to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Wizard Step Indicators */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center">
              <StepIndicator step={s.step} currentStep={configuratorStep} label={s.label} />
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-12 h-[1px] mx-2 transition-colors duration-300 ${
                  configuratorStep > s.step ? 'bg-omni-mint/50' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Configurator layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          {/* Building Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg overflow-hidden border border-white/5 bg-omni-forest-deep relative"
          >
            <BuildingIllustration
              moduleAssignments={mergedAssignments}
              activeType={configuratorStep === 2 ? activeType : null}
              onPositionClick={handleIllustrationClick}
              flashPosition={flashPosition}
              sizeConfig={sizeConfig}
              materialConfig={materialConfig}
              arrangeMode={configuratorStep === 2 && arrangeMode}
            />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5">
              <p className="text-[10px] tracking-[0.2em] text-omni-cream uppercase">
                {arrangeMode && configuratorStep === 2 ? t('config.arrangeToggle') : t('config.modulePreview')}
              </p>
            </div>

            {/* Floating price indicator on illustration */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2.5 rounded-md border border-omni-mint/20"
            >
              <p className="text-[8px] tracking-[0.15em] text-omni-cream uppercase mb-0.5">{t('config.estimatedPrice')}</p>
              <p className="text-sm text-omni-mint font-light tracking-wide">
                <AnimatedPrice value={priceData.total} />
              </p>
            </motion.div>

            {/* Arrange mode hint on illustration */}
            {configuratorStep === 2 && arrangeMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-20 bg-omni-mint/10 backdrop-blur-sm px-4 py-2.5 rounded-md border border-omni-mint/20"
              >
                <p className="text-[10px] tracking-[0.15em] text-omni-mint">
                  {t('config.dragHint')}
                </p>
              </motion.div>
            )}

            {/* Step hint on illustration */}
            {configuratorStep === 2 && activeType && !arrangeMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-20 bg-omni-mint/10 backdrop-blur-sm px-4 py-2.5 rounded-md border border-omni-mint/20"
              >
                <p className="text-[10px] tracking-[0.15em] text-omni-mint">
                  {t('config.clickPosition', { module: t(MODULE_TYPES.find(m => m.id === activeType)?.labelKey || '') })}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Configurator Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] overflow-y-auto max-h-[700px]"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(195, 248, 189, 0.3) transparent',
            }}
          >
            <div className="space-y-4">
              {/* Step content */}
              <AnimatePresence mode="wait">
                {configuratorStep === 1 && <StepSizeConfig key="step1" />}
                {configuratorStep === 2 && (
                  <StepModuleAssignment
                    key="step2"
                    activeType={activeType}
                    setActiveType={setActiveType}
                    arrangeMode={arrangeMode}
                    setArrangeMode={setArrangeMode}
                  />
                )}
                {configuratorStep === 3 && <StepMaterial key="step3" />}
              </AnimatePresence>

              {/* Summary in step 3 */}
              {configuratorStep === 3 && <SummaryPanel />}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-4">
                {configuratorStep > 1 && (
                  <Button
                    onClick={() => changeStep(configuratorStep - 1)}
                    variant="outline"
                    className="flex-1 border-white/10 text-omni-cream hover:text-white hover:border-white/20 tracking-wider text-xs uppercase min-h-[44px]"
                  >
                    <ChevronLeft size={14} className="mr-1" />
                    Zurück
                  </Button>
                )}
                {configuratorStep < 3 ? (
                  <Button
                    onClick={() => changeStep(configuratorStep + 1)}
                    className="flex-1 bg-gradient-to-r from-omni-mint to-omni-mint-deep hover:from-omni-mint-soft hover:to-omni-mint text-omni-forest-deep font-medium tracking-[0.1em] uppercase text-xs min-h-[44px]"
                  >
                    Weiter
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-white/10 text-omni-cream hover:text-white hover:border-white/20 tracking-wider text-xs uppercase min-h-[44px]"
                  >
                    <RotateCcw size={14} className="mr-2" />
                    Neu starten
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
