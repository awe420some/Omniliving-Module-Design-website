'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type ModuleDef } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Home, Bed, UtensilsCrossed, Bath, RotateCcw, Check } from 'lucide-react';

const MODULE_TYPES: { id: ModuleDef['type']; label: string; icon: typeof Home; color: string; description: string; defaultDef: Omit<ModuleDef, 'id'> }[] = [
  {
    id: 'wohnen',
    label: 'Wohnmodul',
    icon: Home,
    color: '#c9a96e',
    description: 'Großzügige Fenster, warmer Holzboden',
    defaultDef: { label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  },
  {
    id: 'schlafen',
    label: 'Schlafmodul',
    icon: Bed,
    color: '#4a9eff',
    description: 'Gemütliches Interieur, kleinere Fenster',
    defaultDef: { label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
  },
  {
    id: 'kueche',
    label: 'Küchenmodul',
    icon: UtensilsCrossed,
    color: '#ff6b4a',
    description: 'Helle Belüftung, praktische Ausstattung',
    defaultDef: { label: 'Küchenmodul', type: 'kueche', color: '#3a3535', windowColor: '#ffffdd', emissiveColor: '#ffdd66' },
  },
  {
    id: 'bad',
    label: 'Badmodul',
    icon: Bath,
    color: '#4aff9e',
    description: 'Milchglasscheiben, fliesenartige Wände',
    defaultDef: { label: 'Badmodul', type: 'bad', color: '#2d3a4a', windowColor: '#ddeeff', emissiveColor: '#88bbff' },
  },
];

const MODULE_POSITIONS = [
  { id: 'ground-0', label: 'Erdgeschoss Links', floor: 'Erdgeschoss' },
  { id: 'ground-1', label: 'Erdgeschoss Mitte', floor: 'Erdgeschoss' },
  { id: 'ground-2', label: 'Erdgeschoss Rechts', floor: 'Erdgeschoss' },
  { id: 'upper-0', label: 'Obergeschoss Links', floor: 'Obergeschoss' },
  { id: 'upper-1', label: 'Obergeschoss Mitte', floor: 'Obergeschoss' },
  { id: 'upper-2', label: 'Obergeschoss Rechts', floor: 'Obergeschoss' },
];

// Default module assignments
const DEFAULT_ASSIGNMENTS: Record<string, ModuleDef> = {
  'ground-0': { id: 'ground-0', label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  'ground-1': { id: 'ground-1', label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
  'ground-2': { id: 'ground-2', label: 'Küchenmodul', type: 'kueche', color: '#3a3535', windowColor: '#ffffdd', emissiveColor: '#ffdd66' },
  'upper-0': { id: 'upper-0', label: 'Badmodul', type: 'bad', color: '#2d3a4a', windowColor: '#ddeeff', emissiveColor: '#88bbff' },
  'upper-1': { id: 'upper-1', label: 'Wohnmodul', type: 'wohnen', color: '#2d4a3e', windowColor: '#cce5ff', emissiveColor: '#ffcc88' },
  'upper-2': { id: 'upper-2', label: 'Schlafmodul', type: 'schlafen', color: '#3d3d3d', windowColor: '#cce5ff', emissiveColor: '#88aaff' },
};

// CSS Module Building Illustration Component
function BuildingIllustration({
  moduleAssignments,
  activeType,
  onPositionClick,
  flashPosition,
}: {
  moduleAssignments: Record<string, ModuleDef>;
  activeType: ModuleDef['type'] | null;
  onPositionClick: (positionId: string) => void;
  flashPosition: string | null;
}) {
  const getPositionData = (positionId: string) => {
    return moduleAssignments[positionId] || DEFAULT_ASSIGNMENTS[positionId];
  };

  const renderModuleBlock = (positionId: string, position: string) => {
    const data = getPositionData(positionId);
    const isFlashing = flashPosition === positionId;
    const isInteractive = activeType !== null;

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
          backgroundColor: data.color,
          minWidth: '90px',
          minHeight: '65px',
        }}
        whileHover={isInteractive ? { scale: 1.05 } : {}}
        whileTap={isInteractive ? { scale: 0.98 } : {}}
      >
        {/* Window cutouts */}
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none">
          <div
            className="w-4 h-5 rounded-[1px] border border-white/20"
            style={{ backgroundColor: data.windowColor + '30' }}
          />
          <div
            className="w-4 h-5 rounded-[1px] border border-white/20"
            style={{ backgroundColor: data.windowColor + '30' }}
          />
        </div>
        {/* Module type label */}
        <span className="relative z-10 text-[9px] sm:text-[10px] font-medium text-white/80 tracking-wide mt-5">
          {data.label}
        </span>
        {/* Position label */}
        <span className="relative z-10 text-[7px] text-white/40 tracking-wider uppercase">
          {position}
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

  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-md">
        {/* Roof */}
        <div className="relative mx-auto mb-0" style={{ width: 'calc(100% + 20px)' }}>
          <svg viewBox="0 0 320 35" className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2d4a3e" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1a2e26" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <polygon points="0,35 10,8 310,8 320,35" fill="url(#roofGrad)" />
            {/* Standing seam lines on roof */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1={40 + i * 32}
                y1="12"
                x2={40 + i * 32}
                y2="35"
                stroke="rgba(201,169,110,0.08)"
                strokeWidth="1"
              />
            ))}
            {/* Roof edge highlight */}
            <line x1="10" y1="8" x2="310" y2="8" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
          </svg>
        </div>

        {/* Upper floor modules */}
        <div className="flex gap-1 sm:gap-1.5 justify-center relative">
          {renderModuleBlock('upper-0', 'Links')}
          {renderModuleBlock('upper-1', 'Mitte')}
          {renderModuleBlock('upper-2', 'Rechts')}
        </div>

        {/* Connection line between floors */}
        <div className="relative h-3 flex items-center justify-center">
          <div className="w-[calc(100%-20px)] h-[2px] bg-gradient-to-r from-[#c9a96e]/10 via-[#c9a96e]/25 to-[#c9a96e]/10" />
          {/* Connection dots */}
          <div className="absolute left-[16%] w-1.5 h-1.5 rounded-full bg-[#c9a96e]/30" />
          <div className="absolute left-[50%] -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#c9a96e]/30" />
          <div className="absolute right-[16%] w-1.5 h-1.5 rounded-full bg-[#c9a96e]/30" />
        </div>

        {/* Ground floor modules */}
        <div className="flex gap-1 sm:gap-1.5 justify-center relative">
          {renderModuleBlock('ground-0', 'Links')}
          {renderModuleBlock('ground-1', 'Mitte')}
          {renderModuleBlock('ground-2', 'Rechts')}
        </div>

        {/* Foundation */}
        <div className="relative mt-0">
          <div
            className="w-[calc(100%+10px)] mx-auto h-5 rounded-b-sm"
            style={{
              background: 'linear-gradient(to bottom, #606060, #4a4a4a)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {/* Concrete texture lines */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-1 h-[1px]"
                style={{
                  left: `${5 + i * 10}%`,
                  width: '6%',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}
              />
            ))}
            <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white/30 tracking-[0.2em] uppercase">
              Fundament
            </span>
          </div>
        </div>

        {/* Floor labels */}
        <div className="absolute left-0 top-[52%] -translate-y-1/2 -translate-x-full pr-2 hidden sm:block">
          <span className="text-[8px] tracking-[0.15em] text-[#c9a96e]/40 uppercase whitespace-nowrap">OG</span>
        </div>
        <div className="absolute left-0 top-[82%] -translate-y-1/2 -translate-x-full pr-2 hidden sm:block">
          <span className="text-[8px] tracking-[0.15em] text-[#c9a96e]/40 uppercase whitespace-nowrap">EG</span>
        </div>

        {/* Module count badge */}
        <div className="absolute -top-2 -right-2 bg-[#c9a96e] text-[#0a0a14] text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          6
        </div>
      </div>
    </div>
  );
}

export default function ConfiguratorSection() {
  const selectedModules = useAppStore((s) => s.selectedModules);
  const setSelectedModules = useAppStore((s) => s.setSelectedModules);
  const setExperienceMode = useAppStore((s) => s.setExperienceMode);
  const moduleAssignments = useAppStore((s) => s.moduleAssignments);
  const setModuleAssignment = useAppStore((s) => s.setModuleAssignment);
  const [activeType, setActiveType] = useState<ModuleDef['type'] | null>(null);
  const [flashPosition, setFlashPosition] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Pre-populate selectedModules with all 6 default positions on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setSelectedModules([
        'ground-0', 'ground-1', 'ground-2',
        'upper-0', 'upper-1', 'upper-2',
      ]);
      // Also set default module assignments in the store
      Object.entries(DEFAULT_ASSIGNMENTS).forEach(([posId, modDef]) => {
        setModuleAssignment(posId, modDef);
      });
    }
  }, [setSelectedModules, setModuleAssignment]);

  useEffect(() => {
    setExperienceMode('configurator');
  }, [setExperienceMode]);

  const handleTypeSelect = useCallback((typeId: ModuleDef['type']) => {
    setActiveType(typeId);
  }, []);

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

  const handleReset = useCallback(() => {
    setSelectedModules([]);
    setActiveType(null);
    // Re-populate after reset with defaults
    setTimeout(() => {
      setSelectedModules([
        'ground-0', 'ground-1', 'ground-2',
        'upper-0', 'upper-1', 'upper-2',
      ]);
      Object.entries(DEFAULT_ASSIGNMENTS).forEach(([posId, modDef]) => {
        setModuleAssignment(posId, modDef);
      });
    }, 100);
  }, [setSelectedModules, setModuleAssignment]);

  const getPositionLabel = useCallback((positionId: string): string => {
    const assignment = moduleAssignments[positionId];
    if (assignment) return assignment.label;
    return DEFAULT_ASSIGNMENTS[positionId]?.label || '—';
  }, [moduleAssignments]);

  // Merge default assignments with user assignments for the illustration
  const mergedAssignments: Record<string, ModuleDef> = {
    ...DEFAULT_ASSIGNMENTS,
    ...moduleAssignments,
  };

  return (
    <section id="configurator" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="max-w-7xl mx-auto">
        {/* Section header with animated line */}
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
            Wählen Sie Ihre Module und sehen Sie, wie sie sich zu einem einzigartigen
            Wohnraum zusammenfügen.
          </motion.p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Configurator layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          {/* CSS Building Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 h-[400px] sm:h-[500px] lg:h-[550px] rounded-lg overflow-hidden border border-white/5 bg-[#0d0d1a] relative"
          >
            <BuildingIllustration
              moduleAssignments={mergedAssignments}
              activeType={activeType}
              onPositionClick={handlePositionClick}
              flashPosition={flashPosition}
            />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5">
              <p className="text-[10px] tracking-[0.2em] text-[#8888a8] uppercase">Modul-Vorschau</p>
            </div>
            {activeType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-[#c9a96e]/10 backdrop-blur-sm px-4 py-2.5 rounded-md border border-[#c9a96e]/20"
              >
                <p className="text-[10px] tracking-[0.15em] text-[#c9a96e]">
                  Klicken Sie auf eine Position im Gebäude, um das {MODULE_TYPES.find(m => m.id === activeType)?.label} zuzuweisen
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
            className="lg:col-span-2 h-[400px] sm:h-[500px] lg:h-[550px] overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(201, 169, 110, 0.3) transparent',
            }}
          >
            <div className="space-y-6">
              {/* Module Type Selection */}
              <div>
                <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-4">
                  Modultyp wählen
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {MODULE_TYPES.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeType === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleTypeSelect(mod.id)}
                        className={`group p-4 rounded-lg border transition-all duration-300 text-left ${
                          isActive
                            ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                            : 'border-white/5 bg-[#12121f]/60 hover:border-white/10'
                        }`}
                      >
                        <Icon
                          size={20}
                          className="mb-2 transition-colors duration-300"
                          style={{ color: isActive ? mod.color : '#8888a8' }}
                        />
                        <p className="text-xs font-medium text-white tracking-wide">
                          {mod.label}
                        </p>
                        <p className="text-[10px] text-[#8888a8] mt-1 leading-relaxed">
                          {mod.description}
                        </p>
                        {isActive && (
                          <div className="mt-2">
                            <Check size={14} className="text-[#c9a96e]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Module Position Selection */}
              <div>
                <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-4">
                  Position wählen
                </h3>
                {['Erdgeschoss', 'Obergeschoss'].map((floor) => (
                  <div key={floor} className="mb-4">
                    <p className="text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase mb-2">
                      {floor}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {MODULE_POSITIONS.filter((p) => p.floor === floor).map((pos) => {
                        const isSelected = selectedModules.includes(pos.id);
                        const currentLabel = getPositionLabel(pos.id);
                        const currentAssignment = mergedAssignments[pos.id];
                        const isFlashing = flashPosition === pos.id;
                        return (
                          <button
                            key={pos.id}
                            onClick={() => handlePositionClick(pos.id)}
                            disabled={!activeType}
                            className={`p-3 rounded-md border text-center transition-all duration-300 relative overflow-hidden ${
                              isFlashing
                                ? 'border-[#c9a96e] bg-[#c9a96e]/20 scale-105'
                                : isSelected
                                  ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                                  : activeType
                                    ? 'border-white/5 bg-[#12121f]/40 hover:border-white/10 cursor-pointer'
                                    : 'border-white/5 bg-[#12121f]/20 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {currentAssignment && (
                              <div
                                className="absolute top-0 left-0 w-1 h-full rounded-l-md"
                                style={{ backgroundColor: currentAssignment.color }}
                              />
                            )}
                            <p className="text-[10px] text-white/80 tracking-wide relative z-10">
                              {pos.label.split(' ').pop()}
                            </p>
                            {currentLabel && (
                              <p className="text-[8px] text-[#c9a96e]/70 mt-0.5 truncate relative z-10">
                                {currentLabel}
                              </p>
                            )}
                            {isSelected && (
                              <Check size={12} className="mx-auto mt-1 text-[#c9a96e] relative z-10" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-sm tracking-[0.15em] text-white uppercase mb-4">
                  Zusammenfassung
                </h3>
                <div className="bg-[#12121f]/40 border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#8888a8]">Konfigurierte Module</span>
                    <span className="text-sm text-white font-light">{selectedModules.length}/6</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-[#c9a96e] to-[#dbb980] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(selectedModules.length / 6) * 100}%` }}
                    />
                  </div>
                  {/* Show assignment details */}
                  {selectedModules.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {selectedModules.map((modId) => {
                        const posData = MODULE_POSITIONS.find((p) => p.id === modId);
                        const assignment = mergedAssignments[modId];
                        return (
                          <div key={modId} className="flex items-center justify-between text-[10px]">
                            <span className="text-[#8888a8]">{posData?.label}</span>
                            <span className="flex items-center gap-1.5">
                              {assignment && (
                                <span
                                  className="w-2 h-2 rounded-sm inline-block"
                                  style={{ backgroundColor: assignment.color }}
                                />
                              )}
                              <span className="text-[#c9a96e]">{assignment?.label || '—'}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 border-white/10 text-[#8888a8] hover:text-white hover:border-white/20 tracking-wider text-xs uppercase"
                >
                  <RotateCcw size={14} className="mr-2" />
                  Zurücksetzen
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] font-medium tracking-[0.1em] uppercase text-xs"
                >
                  Konfiguration anfragen
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
