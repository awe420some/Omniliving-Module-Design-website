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
  Minus, Plus, ArrowDown,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/* ────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────── */

const MODULE_TYPES: {
  id: ModuleDef['type'];
  label: string;
  icon: typeof Home;
  interiorIcon: typeof Sofa;
  color: string;
  emissiveColor: string;
  windowCount: number;
  windowSize: 'large' | 'medium' | 'small';
  description: string;
  defaultDef: Omit<ModuleDef, 'id'>;
}[] = [
  {
    id: 'wohnen',
    label: 'Wohnmodul',
    icon: Home,
    interiorIcon: Sofa,
    color: '#c9a96e',
    emissiveColor: '#ffcc88',
    windowCount: 2,
    windowSize: 'large',
    description: 'Großzügige Fenster, warmer Holzboden',
    defaultDef: { label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  },
  {
    id: 'schlafen',
    label: 'Schlafmodul',
    icon: Bed,
    interiorIcon: Moon,
    color: '#4a9eff',
    emissiveColor: '#88aaff',
    windowCount: 2,
    windowSize: 'medium',
    description: 'Gemütliches Interieur, kleinere Fenster',
    defaultDef: { label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
  },
  {
    id: 'kueche',
    label: 'Küchenmodul',
    icon: UtensilsCrossed,
    interiorIcon: CookingPot,
    color: '#ff6b4a',
    emissiveColor: '#ffdd66',
    windowCount: 1,
    windowSize: 'large',
    description: 'Helle Belüftung, praktische Ausstattung',
    defaultDef: { label: 'Küchenmodul', type: 'kueche', color: '#3a3535', windowColor: '#ffffdd', emissiveColor: '#ffdd66' },
  },
  {
    id: 'bad',
    label: 'Badmodul',
    icon: Bath,
    interiorIcon: Droplets,
    color: '#4aff9e',
    emissiveColor: '#88bbff',
    windowCount: 1,
    windowSize: 'small',
    description: 'Milchglasscheiben, fliesenartige Wände',
    defaultDef: { label: 'Badmodul', type: 'bad', color: '#2d3a4a', windowColor: '#ddeeff', emissiveColor: '#88bbff' },
  },
];

const WALL_COLORS: { id: WallColor; label: string; hex: string; premium: number }[] = [
  { id: 'anthrazit', label: 'Anthrazit', hex: '#2d4a3e', premium: 0 },
  { id: 'schwarz', label: 'Schwarz', hex: '#1a1a1a', premium: 0 },
  { id: 'weiss', label: 'Weiß', hex: '#e8e8e8', premium: 2000 },
  { id: 'holzoptik', label: 'Holzoptik', hex: '#8B6914', premium: 3000 },
  { id: 'rost', label: 'Rost', hex: '#8B4513', premium: 0 },
  { id: 'blaugrau', label: 'Blaugrau', hex: '#4a5568', premium: 0 },
];

const ROOF_COLORS: { id: RoofColor; label: string; hex: string }[] = [
  { id: 'anthrazit', label: 'Anthrazit', hex: '#2d4a3e' },
  { id: 'schwarz', label: 'Schwarz', hex: '#1a1a1a' },
  { id: 'ziegelrot', label: 'Ziegelrot', hex: '#8B2500' },
  { id: 'gruen', label: 'Grün', hex: '#2d5a3e' },
];

const WINDOW_STYLES: { id: WindowStyle; label: string; description: string; premiumPerModule: number }[] = [
  { id: 'standard', label: 'Standard', description: 'Klare Verglasung', premiumPerModule: 0 },
  { id: 'panorama', label: 'Panoramaverglasung', description: 'Bodenbiss-Fenster', premiumPerModule: 1500 },
  { id: 'sprossen', label: 'Sprossenfenster', description: 'Klassische Unterteilung', premiumPerModule: 0 },
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

function getPositionsForSize(size: SizeConfig) {
  const ground = Array.from({ length: size.groundModules }, (_, i) => ({
    id: `ground-${i}`,
    label: size.groundModules === 1 ? 'Erdgeschoss' : ['Links', 'Mitte-links', 'Mitte', 'Mitte-rechts', 'Rechts'][i] || `Pos ${i + 1}`,
    floor: 'Erdgeschoss' as const,
  }));
  const upper = size.upperModules > 0
    ? Array.from({ length: size.upperModules }, (_, i) => ({
        id: `upper-${i}`,
        label: size.upperModules === 1 ? 'Obergeschoss' : ['Links', 'Mitte-links', 'Mitte', 'Mitte-rechts', 'Rechts'][i] || `Pos ${i + 1}`,
        floor: 'Obergeschoss' as const,
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

  const breakdown: { label: string; value: number }[] = [
    { label: 'Grundpreis Module', value: baseTotal },
  ];
  if (upperSurcharge > 0) {
    breakdown.push({ label: 'Obergeschosszuschlag (20%)', value: upperSurcharge });
  }
  if (colorPremium > 0) {
    breakdown.push({ label: 'Farbzuschlag', value: colorPremium });
  }
  if (windowPremium > 0) {
    breakdown.push({ label: 'Fensterzuschlag', value: windowPremium });
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
   Enhanced Building Illustration
   ──────────────────────────────────────────── */

function BuildingIllustration({
  moduleAssignments,
  activeType,
  onPositionClick,
  flashPosition,
  sizeConfig,
  materialConfig,
}: {
  moduleAssignments: Record<string, ModuleDef>;
  activeType: ModuleDef['type'] | null;
  onPositionClick: (positionId: string) => void;
  flashPosition: string | null;
  sizeConfig: SizeConfig;
  materialConfig: MaterialConfig;
}) {
  const positions = useMemo(() => getPositionsForSize(sizeConfig), [sizeConfig]);
  const wallHex = WALL_COLORS.find(c => c.id === materialConfig.wallColor)?.hex ?? '#2d4a3e';
  const roofHex = ROOF_COLORS.find(c => c.id === materialConfig.roofColor)?.hex ?? '#2d4a3e';
  const isPanorama = materialConfig.windowStyle === 'panorama';
  const isSprossen = materialConfig.windowStyle === 'sprossen';

  const getPositionData = (positionId: string) => {
    return moduleAssignments[positionId] || DEFAULT_ASSIGNMENTS[positionId];
  };

  const renderModuleIcon = (type: ModuleDef['type']) => {
    const modType = MODULE_TYPES.find(m => m.id === type);
    if (!modType) return null;
    const Icon = modType.interiorIcon;
    return (
      <div className="relative z-10 mb-0.5">
        <Icon size={16} className="opacity-60" style={{ color: modType.emissiveColor }} />
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
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none" style={{ marginTop: isPanorama ? '4px' : '8px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${dims.w} ${dims.h} rounded-[1px] border relative overflow-hidden`}
            style={{
              backgroundColor: isFrosted ? data.windowColor + '18' : data.windowColor + '30',
              borderColor: isFrosted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
            }}
          >
            {/* Interior glow */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, ${data.emissiveColor}25 0%, transparent 70%)`,
              }}
            />
            {/* Sprossen cross */}
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

  const renderModuleBlock = (positionId: string, positionLabel: string, isUpper: boolean) => {
    const data = getPositionData(positionId);
    if (!data) return null;

    const isFlashing = flashPosition === positionId;
    const isInteractive = activeType !== null;
    const hasHood = data.type === 'kueche' && isUpper;

    return (
      <motion.button
        key={positionId}
        onClick={() => onPositionClick(positionId)}
        disabled={!activeType}
        className={`relative flex flex-col items-center justify-center rounded-sm transition-all duration-300 border-2 ${
          isFlashing
            ? 'border-[#c9a96e] shadow-[0_0_20px_rgba(201,169,110,0.3)]'
            : isInteractive
              ? 'border-white/10 hover:border-[#c9a96e]/50 hover:shadow-[0_0_15px_rgba(201,169,110,0.15)] hover:-translate-y-1 cursor-pointer'
              : 'border-white/5 cursor-default'
        }`}
        style={{
          backgroundColor: wallHex,
          minWidth: `${Math.max(60, 240 / Math.max(sizeConfig.groundModules, sizeConfig.upperModules, 1))}px`,
          minHeight: isUpper ? '55px' : '65px',
        }}
        whileHover={isInteractive ? { scale: 1.05 } : {}}
        whileTap={isInteractive ? { scale: 0.98 } : {}}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Interior glow overlay */}
        <div
          className="absolute inset-0 rounded-sm pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center bottom, ${data.emissiveColor}15 0%, transparent 60%)`,
          }}
        />

        {/* Shadow beneath module */}
        <div
          className="absolute -bottom-1 left-1 right-1 h-2 rounded-b-sm pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
          }}
        />

        {/* Ventilation hood for kitchen on upper floor */}
        {hasHood && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-t-sm bg-[#555] border-t border-x border-white/10" />
        )}

        {/* Windows */}
        {renderWindows(data)}

        {/* Interior icon */}
        <div className="relative z-10 mt-4">
          {renderModuleIcon(data.type)}
        </div>

        {/* Module type label */}
        <span className="relative z-10 text-[8px] sm:text-[9px] font-medium text-white/80 tracking-wide">
          {data.label}
        </span>

        {/* Position label */}
        <span className="relative z-10 text-[6px] sm:text-[7px] text-white/40 tracking-wider uppercase">
          {positionLabel}
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
    );
  };

  const totalModules = sizeConfig.groundModules + sizeConfig.upperModules;
  const roofWidth = Math.max(sizeConfig.groundModules, sizeConfig.upperModules);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-md">
        {/* Roof */}
        <div className="relative mx-auto mb-0" style={{ width: `calc(${roofWidth * 33 + 5}% )`, maxWidth: '100%' }}>
          <svg viewBox={`0 0 ${roofWidth * 100 + 40} 35`} className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roofGradConfig" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={roofHex} stopOpacity="0.9" />
                <stop offset="100%" stopColor={roofHex} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,35 15,8 ${roofWidth * 100 + 25},8 ${roofWidth * 100 + 40},35`}
              fill="url(#roofGradConfig)"
            />
            {/* Standing seam lines */}
            {Array.from({ length: roofWidth * 3 }).map((_, i) => (
              <line
                key={i}
                x1={25 + i * (roofWidth * 100 / (roofWidth * 3))}
                y1="12"
                x2={25 + i * (roofWidth * 100 / (roofWidth * 3))}
                y2="35"
                stroke="rgba(201,169,110,0.08)"
                strokeWidth="1"
              />
            ))}
            {/* Roof edge highlight */}
            <line x1="15" y1="8" x2={`${roofWidth * 100 + 25}`} y2="8" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
          </svg>
        </div>

        {/* Upper floor modules (if any) */}
        <AnimatePresence mode="popLayout">
          {sizeConfig.upperModules > 0 && (
            <motion.div
              className="flex gap-1 sm:gap-1.5 justify-center relative"
              layout
            >
              {positions.upper.map((pos) => renderModuleBlock(pos.id, pos.label, true))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balcony railing for upper floor */}
        {sizeConfig.upperModules > 0 && (
          <div className="relative h-2 flex items-center justify-center">
            <div
              className="flex items-end gap-[3px] justify-center relative"
              style={{ width: `${sizeConfig.upperModules * 33}%` }}
            >
              {Array.from({ length: Math.max(sizeConfig.upperModules * 4, 8) }).map((_, i) => (
                <div key={i} className="w-[1px] h-2 bg-[#8a8a8a]/40" />
              ))}
              <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-[#8a8a8a]/30" />
            </div>
          </div>
        )}

        {/* Connection line between floors */}
        <div className="relative h-3 flex items-center justify-center">
          <div
            className="h-[2px] bg-gradient-to-r from-[#c9a96e]/10 via-[#c9a96e]/25 to-[#c9a96e]/10"
            style={{ width: `${Math.max(sizeConfig.groundModules, sizeConfig.upperModules) * 33}%` }}
          />
          {Array.from({ length: Math.max(sizeConfig.groundModules, sizeConfig.upperModules) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#c9a96e]/30"
              style={{
                left: `${50 + (i - (Math.max(sizeConfig.groundModules, sizeConfig.upperModules) - 1) / 2) * 33}%`,
                transform: 'translateX(-50%)',
              }}
            />
          ))}
        </div>

        {/* Ground floor modules */}
        <AnimatePresence mode="popLayout">
          <motion.div className="flex gap-1 sm:gap-1.5 justify-center relative" layout>
            {positions.ground.map((pos) => renderModuleBlock(pos.id, pos.label, false))}
          </motion.div>
        </AnimatePresence>

        {/* Foundation */}
        <div className="relative mt-0">
          <div
            className="mx-auto h-5 rounded-b-sm relative"
            style={{
              width: `${sizeConfig.groundModules * 33 + 5}%`,
              background: 'linear-gradient(to bottom, #606060, #4a4a4a)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-b-sm">
              {Array.from({ length: sizeConfig.groundModules * 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1 h-[1px]"
                  style={{
                    left: `${5 + i * (90 / (sizeConfig.groundModules * 3))}%`,
                    width: '6%',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white/30 tracking-[0.2em] uppercase">
              Fundament
            </span>
          </div>
        </div>

        {/* Floor labels */}
        {sizeConfig.upperModules > 0 && (
          <div className="absolute left-0 top-[52%] -translate-y-1/2 -translate-x-full pr-2 hidden sm:block">
            <span className="text-[8px] tracking-[0.15em] text-[#c9a96e]/40 uppercase whitespace-nowrap">OG</span>
          </div>
        )}
        <div className="absolute left-0 top-[82%] -translate-y-1/2 -translate-x-full pr-2 hidden sm:block">
          <span className="text-[8px] tracking-[0.15em] text-[#c9a96e]/40 uppercase whitespace-nowrap">EG</span>
        </div>

        {/* Module count badge */}
        <div className="absolute -top-2 -right-2 bg-[#c9a96e] text-[#0a0a14] text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {totalModules}
        </div>

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
            ? 'bg-[#c9a96e] text-[#0a0a14]'
            : isCompleted
              ? 'bg-[#c9a96e]/30 text-[#c9a96e]'
              : 'bg-white/5 text-white/30 border border-white/10'
        }`}
      >
        {isCompleted ? <Check size={14} /> : step}
      </div>
      <span
        className={`text-xs tracking-wide transition-colors duration-300 hidden sm:inline ${
          isActive ? 'text-[#c9a96e]' : isCompleted ? 'text-white/60' : 'text-white/30'
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
          Größe konfigurieren
        </h3>
        <p className="text-[11px] text-[#8888a8] leading-relaxed mb-6">
          Wählen Sie die Anzahl der Module pro Geschoss. Jedes Modul bietet {MODULE_AREA} m² Wohnfläche.
        </p>
      </div>

      {/* Ground floor modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white tracking-wide">Erdgeschoss</span>
          <span className="text-sm text-[#c9a96e] font-light">{sizeConfig.groundModules} Module</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSizeConfig({ groundModules: Math.max(1, sizeConfig.groundModules - 1) })}
            disabled={sizeConfig.groundModules <= 1}
            className="w-10 h-10 rounded-lg border border-white/10 bg-[#12121f]/60 flex items-center justify-center text-white/60 hover:border-[#c9a96e]/30 hover:text-[#c9a96e] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ein Modul weniger im Erdgeschoss"
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c9a96e] to-[#dbb980] rounded-full transition-all duration-300"
              style={{ width: `${((sizeConfig.groundModules - 1) / 3) * 100}%` }}
            />
          </div>
          <button
            onClick={() => setSizeConfig({ groundModules: Math.min(4, sizeConfig.groundModules + 1) })}
            disabled={sizeConfig.groundModules >= 4}
            className="w-10 h-10 rounded-lg border border-white/10 bg-[#12121f]/60 flex items-center justify-center text-white/60 hover:border-[#c9a96e]/30 hover:text-[#c9a96e] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
          <span className="text-xs text-white tracking-wide">Obergeschoss</span>
          <span className="text-sm text-[#c9a96e] font-light">
            {sizeConfig.upperModules === 0 ? 'Keins' : `${sizeConfig.upperModules} Module`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSizeConfig({ upperModules: Math.max(0, sizeConfig.upperModules - 1) })}
            disabled={sizeConfig.upperModules <= 0}
            className="w-10 h-10 rounded-lg border border-white/10 bg-[#12121f]/60 flex items-center justify-center text-white/60 hover:border-[#c9a96e]/30 hover:text-[#c9a96e] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ein Modul weniger im Obergeschoss"
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c9a96e] to-[#dbb980] rounded-full transition-all duration-300"
              style={{ width: `${(sizeConfig.upperModules / 4) * 100}%` }}
            />
          </div>
          <button
            onClick={() => setSizeConfig({ upperModules: Math.min(4, sizeConfig.upperModules + 1) })}
            disabled={sizeConfig.upperModules >= 4}
            className="w-10 h-10 rounded-lg border border-white/10 bg-[#12121f]/60 flex items-center justify-center text-white/60 hover:border-[#c9a96e]/30 hover:text-[#c9a96e] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
          <p className="text-[10px] text-[#c9a96e]/50 mt-2 flex items-center gap-1">
            <ArrowDown size={10} /> Einstöckiges Gebäude
          </p>
        )}
      </div>

      {/* Summary card */}
      <div className="bg-[#12121f]/40 border border-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[#8888a8]">Gesamtfläche</span>
          <span className="text-lg text-[#c9a96e] font-light">
            {(sizeConfig.groundModules + sizeConfig.upperModules) * MODULE_AREA} m²
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8888a8]">Gesamtmodule</span>
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
}: {
  activeType: ModuleDef['type'] | null;
  setActiveType: (type: ModuleDef['type'] | null) => void;
}) {
  const sizeConfig = useAppStore((s) => s.sizeConfig);
  const moduleAssignments = useAppStore((s) => s.moduleAssignments);
  const setModuleAssignment = useAppStore((s) => s.setModuleAssignment);
  const setSelectedModules = useAppStore((s) => s.setSelectedModules);
  const selectedModules = useAppStore((s) => s.selectedModules);
  const [flashPosition, setFlashPosition] = useState<string | null>(null);

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
          Module zuweisen
        </h3>
        <p className="text-[11px] text-[#8888a8] leading-relaxed mb-4">
          Wählen Sie einen Modultyp, dann klicken Sie auf eine Position im Gebäude, um ihn zuzuweisen.
        </p>
      </div>

      {/* Module Type Selection */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {MODULE_TYPES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeType === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveType(isActive ? null : mod.id)}
              className={`group p-3 sm:p-4 rounded-lg border transition-all duration-300 text-left min-h-[44px] ${
                isActive
                  ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                  : 'border-white/5 bg-[#12121f]/60 hover:border-white/10'
              }`}
            >
              <Icon
                size={18}
                className="mb-1.5 transition-colors duration-300"
                style={{ color: isActive ? mod.color : '#8888a8' }}
              />
              <p className="text-[10px] sm:text-xs font-medium text-white tracking-wide">
                {mod.label}
              </p>
              {isActive && (
                <Check size={12} className="mt-1 text-[#c9a96e]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Position buttons by floor */}
      {['Erdgeschoss', 'Obergeschoss'].map((floor) => {
        const floorPositions = floor === 'Erdgeschoss' ? positions.ground : positions.upper;
        if (floor === 'Obergeschoss' && sizeConfig.upperModules === 0) return null;

        return (
          <div key={floor}>
            <p className="text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase mb-2">
              {floor}
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
                        ? 'border-[#c9a96e] bg-[#c9a96e]/20 scale-105'
                        : activeType
                          ? 'border-white/5 bg-[#12121f]/40 hover:border-white/10 cursor-pointer'
                          : 'border-white/5 bg-[#12121f]/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {assignment && (
                      <div
                        className="absolute top-0 left-0 w-1 h-full rounded-l-md"
                        style={{ backgroundColor: assignment.emissiveColor }}
                      />
                    )}
                    <p className="text-[9px] sm:text-[10px] text-white/80 tracking-wide relative z-10 truncate">
                      {pos.label}
                    </p>
                    {assignment && (
                      <p className="text-[7px] sm:text-[8px] text-[#c9a96e]/70 mt-0.5 truncate relative z-10">
                        {assignment.label}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {activeType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#c9a96e]/10 backdrop-blur-sm px-4 py-2.5 rounded-md border border-[#c9a96e]/20"
        >
          <p className="text-[10px] tracking-[0.15em] text-[#c9a96e]">
            Klicken Sie auf eine Position im Gebäude, um das {MODULE_TYPES.find(m => m.id === activeType)?.label} zuzuweisen
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
          Farbe & Material
        </h3>
        <p className="text-[11px] text-[#8888a8] leading-relaxed">
          Passen Sie die Optik Ihres Modulhauses an.
        </p>
      </div>

      {/* Module Quality */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase mb-3">Ausstattungslinie</p>
        <div className="grid grid-cols-2 gap-2">
          {(['standard', 'premium'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setModuleQuality(q)}
              className={`p-3 rounded-lg border transition-all duration-300 text-left min-h-[44px] ${
                moduleQuality === q
                  ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                  : 'border-white/5 bg-[#12121f]/60 hover:border-white/10'
              }`}
            >
              <p className="text-xs text-white tracking-wide">{q === 'standard' ? 'Standard' : 'Premium'}</p>
              <p className="text-[9px] text-[#8888a8] mt-0.5">
                {q === 'standard' ? 'ab 25.000 €/Modul' : 'ab 32.000 €/Modul'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Wall Color */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase mb-3">Außenwandfarbe</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {WALL_COLORS.map((color) => {
            const isSelected = materialConfig.wallColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => setMaterialConfig({ wallColor: color.id })}
                className={`relative flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg border transition-all duration-300 min-h-[44px] ${
                  isSelected
                    ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                    : 'border-white/5 bg-[#12121f]/60 hover:border-white/10'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md border-2 transition-all ${
                    isSelected ? 'border-[#c9a96e] shadow-[0_0_8px_rgba(201,169,110,0.2)]' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[8px] sm:text-[9px] text-white/70 tracking-wide">{color.label}</span>
                {color.premium > 0 && (
                  <span className="text-[7px] text-[#c9a96e]/60">+{formatPrice(color.premium)}</span>
                )}
                {isSelected && (
                  <Check size={10} className="absolute top-1 right-1 text-[#c9a96e]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roof Color */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase mb-3">Dachfarbe</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {ROOF_COLORS.map((color) => {
            const isSelected = materialConfig.roofColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => setMaterialConfig({ roofColor: color.id })}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-300 min-h-[44px] ${
                  isSelected
                    ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                    : 'border-white/5 bg-[#12121f]/60 hover:border-white/10'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md border-2 transition-all ${
                    isSelected ? 'border-[#c9a96e] shadow-[0_0_8px_rgba(201,169,110,0.2)]' : 'border-white/10'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[7px] sm:text-[8px] text-white/70 tracking-wide">{color.label}</span>
                {isSelected && (
                  <Check size={8} className="absolute top-0.5 right-0.5 text-[#c9a96e]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Window Style */}
      <div>
        <p className="text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase mb-3">Fensterstil</p>
        <div className="space-y-2">
          {WINDOW_STYLES.map((style) => {
            const isSelected = materialConfig.windowStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setMaterialConfig({ windowStyle: style.id })}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 min-h-[44px] ${
                  isSelected
                    ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                    : 'border-white/5 bg-[#12121f]/60 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Window style icon */}
                  <div className="w-10 h-7 rounded border flex items-center justify-center" style={{
                    borderColor: isSelected ? '#c9a96e50' : 'rgba(255,255,255,0.15)',
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
                    <p className="text-[10px] sm:text-xs text-white tracking-wide">{style.label}</p>
                    <p className="text-[8px] sm:text-[9px] text-[#8888a8]">{style.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {style.premiumPerModule > 0 && (
                    <span className="text-[8px] text-[#c9a96e]/60">+{formatPrice(style.premiumPerModule)}/Mod.</span>
                  )}
                  {isSelected && <Check size={14} className="text-[#c9a96e]" />}
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
      className="bg-[#12121f]/40 border border-white/5 rounded-lg p-4 sm:p-6 mt-6"
    >
      <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-4">
        Zusammenfassung
      </h3>

      {/* Module breakdown */}
      <div className="space-y-2 mb-4">
        {positions.ground.map((pos) => {
          const assignment = mergedAssignments[pos.id];
          return (
            <div key={pos.id} className="flex items-center justify-between text-[10px]">
              <span className="text-[#8888a8]">EG – {pos.label}</span>
              <span className="flex items-center gap-1.5">
                {assignment && (
                  <span
                    className="w-2 h-2 rounded-sm inline-block"
                    style={{ backgroundColor: assignment.emissiveColor }}
                  />
                )}
                <span className="text-[#c9a96e]">{assignment?.label || '—'}</span>
                <span className="text-white/30">{MODULE_AREA} m²</span>
              </span>
            </div>
          );
        })}
        {positions.upper.map((pos) => {
          const assignment = mergedAssignments[pos.id];
          return (
            <div key={pos.id} className="flex items-center justify-between text-[10px]">
              <span className="text-[#8888a8]">OG – {pos.label}</span>
              <span className="flex items-center gap-1.5">
                {assignment && (
                  <span
                    className="w-2 h-2 rounded-sm inline-block"
                    style={{ backgroundColor: assignment.emissiveColor }}
                  />
                )}
                <span className="text-[#c9a96e]">{assignment?.label || '—'}</span>
                <span className="text-white/30">{MODULE_AREA} m²</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8888a8]">Wohnfläche gesamt</span>
          <span className="text-sm text-white">{totalArea} m²</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8888a8]">Geschosse</span>
          <span className="text-sm text-white">{sizeConfig.upperModules > 0 ? '2' : '1'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8888a8]">Geschätzte Bauzeit</span>
          <span className="text-sm text-white">~{estimatedWeeks} Wochen</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8888a8]">Außenwand</span>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block border border-white/10"
              style={{ backgroundColor: WALL_COLORS.find(c => c.id === materialConfig.wallColor)?.hex }}
            />
            <span className="text-sm text-white">{WALL_COLORS.find(c => c.id === materialConfig.wallColor)?.label}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8888a8]">Dach</span>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block border border-white/10"
              style={{ backgroundColor: ROOF_COLORS.find(c => c.id === materialConfig.roofColor)?.hex }}
            />
            <span className="text-sm text-white">{ROOF_COLORS.find(c => c.id === materialConfig.roofColor)?.label}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8888a8]">Fenster</span>
          <span className="text-sm text-white">{WINDOW_STYLES.find(w => w.id === materialConfig.windowStyle)?.label}</span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="border-t border-white/5 pt-3 mt-3 space-y-1.5">
        {priceData.breakdown.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-[10px] text-[#8888a8]">{item.label}</span>
            <span className="text-[10px] text-white/60">{formatPrice(item.value)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t border-[#c9a96e]/20">
          <span className="text-xs text-[#c9a96e] font-medium tracking-wide">Geschätzter Preis</span>
          <span className="text-lg text-[#c9a96e] font-light">
            <AnimatedPrice value={priceData.total} />
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button
          onClick={handleRequestConfiguration}
          className="flex-1 bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] font-medium tracking-[0.1em] uppercase text-xs min-h-[44px]"
        >
          <FileText size={14} className="mr-2" />
          Konfiguration anfragen
        </Button>
        <Button
          onClick={handleDownloadPdf}
          variant="outline"
          className="flex-1 border-white/10 text-[#8888a8] hover:text-white hover:border-white/20 tracking-wider text-xs uppercase min-h-[44px]"
        >
          <Download size={14} className="mr-2" />
          PDF herunterladen
        </Button>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Main ConfiguratorSection Component
   ──────────────────────────────────────────── */

export default function ConfiguratorSection() {
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
    }
    setConfiguratorStep(newStep);
  }, [setConfiguratorStep]);

  const steps = [
    { step: 1, label: 'Größe wählen' },
    { step: 2, label: 'Module zuweisen' },
    { step: 3, label: 'Farbe & Material' },
  ];

  return (
    <section id="configurator" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
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
            className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mb-4 origin-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4"
          >
            Konfigurator
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4"
          >
            Ihr <span className="text-gradient-gold">modulares</span> Zuhause
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4"
          >
            Konfigurieren Sie Ihr Zuhause in drei einfachen Schritten.
          </motion.p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Wizard Step Indicators */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center">
              <StepIndicator step={s.step} currentStep={configuratorStep} label={s.label} />
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-12 h-[1px] mx-2 transition-colors duration-300 ${
                  configuratorStep > s.step ? 'bg-[#c9a96e]/50' : 'bg-white/10'
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
            className="lg:col-span-3 h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg overflow-hidden border border-white/5 bg-[#0d0d1a] relative"
          >
            <BuildingIllustration
              moduleAssignments={mergedAssignments}
              activeType={configuratorStep === 2 ? activeType : null}
              onPositionClick={handleIllustrationClick}
              flashPosition={flashPosition}
              sizeConfig={sizeConfig}
              materialConfig={materialConfig}
            />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5">
              <p className="text-[10px] tracking-[0.2em] text-[#8888a8] uppercase">Modul-Vorschau</p>
            </div>

            {/* Floating price indicator on illustration */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2.5 rounded-md border border-[#c9a96e]/20"
            >
              <p className="text-[8px] tracking-[0.15em] text-[#8888a8] uppercase mb-0.5">Geschätzter Preis</p>
              <p className="text-sm text-[#c9a96e] font-light tracking-wide">
                <AnimatedPrice value={priceData.total} />
              </p>
            </motion.div>

            {/* Step hint on illustration */}
            {configuratorStep === 2 && activeType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-20 bg-[#c9a96e]/10 backdrop-blur-sm px-4 py-2.5 rounded-md border border-[#c9a96e]/20"
              >
                <p className="text-[10px] tracking-[0.15em] text-[#c9a96e]">
                  Klicken Sie auf eine Position, um das {MODULE_TYPES.find(m => m.id === activeType)?.label} zuzuweisen
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
              scrollbarColor: 'rgba(201, 169, 110, 0.3) transparent',
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
                    className="flex-1 border-white/10 text-[#8888a8] hover:text-white hover:border-white/20 tracking-wider text-xs uppercase min-h-[44px]"
                  >
                    <ChevronLeft size={14} className="mr-1" />
                    Zurück
                  </Button>
                )}
                {configuratorStep < 3 ? (
                  <Button
                    onClick={() => changeStep(configuratorStep + 1)}
                    className="flex-1 bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] font-medium tracking-[0.1em] uppercase text-xs min-h-[44px]"
                  >
                    Weiter
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-white/10 text-[#8888a8] hover:text-white hover:border-white/20 tracking-wider text-xs uppercase min-h-[44px]"
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
