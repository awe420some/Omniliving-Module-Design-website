'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sofa, Bed, ChefHat, Bath, Combine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModuleSelectorProps {
  selectedModules: string[];
  onToggleModule: (moduleId: string) => void;
  onAssemble: () => void;
  isAssembling: boolean;
}

const modules = [
  {
    id: 'wohnmodul',
    name: 'Wohnmodul',
    description: 'Geräumiger Wohnbereich mit großen Fenstern und offenem Grundriss',
    icon: Sofa,
    accentColor: '#4a9eff',
    image: '/images/interior-1.png',
  },
  {
    id: 'schlafmodul',
    name: 'Schlafmodul',
    description: 'Ruhiger Rückzugsort mit integriertem Stauraum und Tageslicht',
    icon: Bed,
    accentColor: '#c9a96e',
    image: '/images/interior-bedroom.png',
  },
  {
    id: 'kuechenmodul',
    name: 'Küchenmodul',
    description: 'Voll ausgestattete Premium-Küche mit Hochleistungselektronik',
    icon: ChefHat,
    accentColor: '#ff6b4a',
    image: '/images/interior-kitchen.png',
  },
  {
    id: 'badmodul',
    name: 'Badmodul',
    description: 'Designer-Badzimmer mit Regenwald-Dusche und Naturmaterialien',
    icon: Bath,
    accentColor: '#4aff9e',
    image: '/images/interior-bathroom.png',
  },
];

export default function ModuleSelector({
  selectedModules,
  onToggleModule,
  onAssemble,
  isAssembling,
}: ModuleSelectorProps) {
  return (
    <div className="flex flex-col gap-3 h-full justify-center">
      <div className="mb-2">
        <h3 className="text-lg font-light tracking-wider text-white/90 mb-1">
          Module auswählen
        </h3>
        <p className="text-xs text-[#8888a8] tracking-wide">
          Wählen Sie mindestens 2 Module zum Zusammenfügen
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {modules.map((mod) => {
          const isSelected = selectedModules.includes(mod.id);
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`module-card-glow cursor-pointer transition-all duration-300 border-l-2 bg-[#12121f]/80 backdrop-blur-sm ${
                  isSelected
                    ? 'border-l-[3px] bg-[#1a1a2e]'
                    : 'border-l-transparent hover:bg-[#1a1a2e]/60'
                }`}
                style={{
                  borderLeftColor: isSelected ? mod.accentColor : 'transparent',
                }}
                onClick={() => onToggleModule(mod.id)}
              >
                <div className="p-3 sm:p-4 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: isSelected
                        ? `${mod.accentColor}20`
                        : '#1a1a2e',
                      borderColor: isSelected ? mod.accentColor : 'transparent',
                    }}
                  >
                    <Icon
                      size={20}
                      style={{
                        color: isSelected ? mod.accentColor : '#8888a8',
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-sm font-medium tracking-wide transition-colors duration-300"
                        style={{
                          color: isSelected ? mod.accentColor : '#e8e8f0',
                        }}
                      >
                        {mod.name}
                      </h4>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: mod.accentColor }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-[#8888a8] mt-1 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedModules.length >= 2 && !isAssembling && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            <Button
              onClick={onAssemble}
              className="w-full bg-gradient-to-r from-[#c9a96e] to-[#dbb980] text-[#0a0a14] hover:from-[#dbb980] hover:to-[#c9a96e] py-5 text-sm tracking-[0.1em] uppercase font-medium rounded-sm transition-all duration-300"
            >
              <Combine size={16} className="mr-2" />
              Zusammenfügen
            </Button>
          </motion.div>
        )}

        {isAssembling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[#c9a96e]">
              <motion.div
                className="w-2 h-2 rounded-full bg-[#c9a96e]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm tracking-wider">Module werden zusammengefügt...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
