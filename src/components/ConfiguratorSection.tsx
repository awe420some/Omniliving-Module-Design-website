'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAppStore, type ModuleDef } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Bed, UtensilsCrossed, Bath, RotateCcw, Check } from 'lucide-react';

const SceneCanvas = dynamic(() => import('@/components/3d/SceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
        <span className="text-xs text-[#8888a8] tracking-wider">Konfigurator lädt...</span>
      </div>
    </div>
  ),
});

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

export default function ConfiguratorSection() {
  const selectedModules = useAppStore((s) => s.selectedModules);
  const setSelectedModules = useAppStore((s) => s.setSelectedModules);
  const setExperienceMode = useAppStore((s) => s.setExperienceMode);
  const setSectionCutActive = useAppStore((s) => s.setSectionCutActive);
  const moduleAssignments = useAppStore((s) => s.moduleAssignments);
  const setModuleAssignment = useAppStore((s) => s.setModuleAssignment);
  const [activeType, setActiveType] = useState<ModuleDef['type'] | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [flashPosition, setFlashPosition] = useState<string | null>(null);

  const handleTypeSelect = useCallback((typeId: ModuleDef['type']) => {
    setActiveType(typeId);
  }, []);

  const handlePositionClick = useCallback((positionId: string) => {
    if (!activeType) return;

    // Find the module type data
    const moduleTypeData = MODULE_TYPES.find((m) => m.id === activeType);
    if (!moduleTypeData) return;

    // Create the full module def for this position
    const newModuleDef: ModuleDef = {
      id: positionId,
      ...moduleTypeData.defaultDef,
    };

    // Update the store assignment so the 3D scene reflects the change
    setModuleAssignment(positionId, newModuleDef);

    // Track selected modules for the summary
    setSelectedModules(
      selectedModules.includes(positionId)
        ? selectedModules.filter((id) => id !== positionId)
        : [...selectedModules, positionId]
    );
    setSelectedPosition(positionId);

    // Brief flash animation feedback
    setFlashPosition(positionId);
    setTimeout(() => setFlashPosition(null), 600);
  }, [activeType, selectedModules, setSelectedModules, setModuleAssignment]);

  const handleReset = useCallback(() => {
    setSelectedModules([]);
    setActiveType(null);
    setSelectedPosition(null);
    // We don't clear moduleAssignments on reset since those affect the 3D scene
    // But if we want to fully reset:
    // The store's moduleAssignments would need a clearAll function
  }, [setSelectedModules]);

  // Get the current assignment label for a position
  const getPositionLabel = useCallback((positionId: string): string | null => {
    const assignment = moduleAssignments[positionId];
    if (assignment) return assignment.label;
    // Default assignments
    const defaults: Record<string, string> = {
      'ground-0': 'Wohnmodul',
      'ground-1': 'Schlafmodul',
      'ground-2': 'Küchenmodul',
      'upper-0': 'Badmodul',
      'upper-1': 'Wohnmodul',
      'upper-2': 'Schlafmodul',
    };
    return defaults[positionId] || null;
  }, [moduleAssignments]);

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
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Konfigurator
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Ihr <span className="text-gradient-gold">modulares</span> Zuhause
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Wählen Sie Ihre Module und sehen Sie, wie sie sich zu einem einzigartigen
            Wohnraum zusammenfügen.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Configurator layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 h-[400px] sm:h-[500px] lg:h-[550px] rounded-lg overflow-hidden border border-white/5 bg-[#0a0a14] relative"
          >
            <SceneCanvas />
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5">
              <p className="text-[10px] tracking-[0.2em] text-[#8888a8] uppercase">3D-Vorschau</p>
            </div>
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
                        const isFlashing = flashPosition === pos.id;
                        return (
                          <button
                            key={pos.id}
                            onClick={() => handlePositionClick(pos.id)}
                            disabled={!activeType}
                            className={`p-3 rounded-md border text-center transition-all duration-300 ${
                              isFlashing
                                ? 'border-[#c9a96e] bg-[#c9a96e]/20 scale-105'
                                : isSelected
                                  ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10'
                                  : activeType
                                    ? 'border-white/5 bg-[#12121f]/40 hover:border-white/10 cursor-pointer'
                                    : 'border-white/5 bg-[#12121f]/20 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <p className="text-[10px] text-white/80 tracking-wide">
                              {pos.label.split(' ').pop()}
                            </p>
                            {currentLabel && (
                              <p className="text-[8px] text-[#c9a96e]/70 mt-0.5 truncate">
                                {currentLabel}
                              </p>
                            )}
                            {isSelected && (
                              <Check size={12} className="mx-auto mt-1 text-[#c9a96e]" />
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
                        const assignment = moduleAssignments[modId];
                        return (
                          <div key={modId} className="flex items-center justify-between text-[10px]">
                            <span className="text-[#8888a8]">{posData?.label}</span>
                            <span className="text-[#c9a96e]">{assignment?.label || '—'}</span>
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
