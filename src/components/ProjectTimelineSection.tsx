'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, Pencil, Factory, Truck, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TimelinePhase {
  id: number;
  title: string;
  timeEstimate: string;
  percentage: number;
  description: string;
  icon: LucideIcon;
}

const phases: TimelinePhase[] = [
  {
    id: 1,
    title: 'Erstgespräch',
    timeEstimate: '2 Wochen',
    percentage: 5,
    description: 'Kostenlose Erstberatung – wir lernen Ihre Wünsche, Bedürfnisse und Rahmenbedingungen kennen.',
    icon: MessageSquare,
  },
  {
    id: 2,
    title: 'Standortprüfung',
    timeEstimate: '1 Woche',
    percentage: 3,
    description: 'Prüfung der örtlichen Gegebenheiten, Bebaubarkeit und Genehmigungsfähigkeit.',
    icon: MapPin,
  },
  {
    id: 3,
    title: 'Entwurf & Planung',
    timeEstimate: '4 Wochen',
    percentage: 15,
    description: 'Individuelle Architekturplanung, 3D-Visualisierung und Modulkonfiguration.',
    icon: Pencil,
  },
  {
    id: 4,
    title: 'Produktion',
    timeEstimate: '6 Wochen',
    percentage: 30,
    description: 'Serielle Vorfertigung in unserer Halle mit strenger Qualitätskontrolle.',
    icon: Factory,
  },
  {
    id: 5,
    title: 'Transport & Montage',
    timeEstimate: '2 Wochen',
    percentage: 35,
    description: 'Logistik zum Standort und professionelle Montage innerhalb von 48 Stunden.',
    icon: Truck,
  },
  {
    id: 6,
    title: 'Übergabe',
    timeEstimate: '1 Woche',
    percentage: 12,
    description: 'Qualitätsabnahme, Schlüsselübergabe und Einzug in Ihr neues Zuhause.',
    icon: KeyRound,
  },
];

export default function ProjectTimelineSection() {
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-play through phases on first view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayed) {
          setHasAutoPlayed(true);
          let i = 0;
          const interval = setInterval(() => {
            setActivePhase(phases[i].id);
            i++;
            if (i >= phases.length) {
              clearInterval(interval);
            }
          }, 800);
        }
      },
      { threshold: 0.3 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasAutoPlayed]);

  const selectedPhase = phases.find((p) => p.id === activePhase);

  return (
    <section id="project-timeline" ref={sectionRef} className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0f0f20] to-[#0a0a14]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Projektverlauf
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Ihr Weg zum <span className="text-gradient-gold">Zuhause</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-xl mx-auto mt-4">
            Von der ersten Idee bis zur Schlüsselübergabe – in sechs klar definierten Phasen.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Horizontal timeline - desktop */}
        <div className="hidden lg:block">
          {/* Connecting line */}
          <div className="relative mb-8">
            <div className="absolute top-[28px] left-[8%] right-[8%] h-[2px] bg-[#1a1a2e]" />
            <motion.div
              className="absolute top-[28px] left-[8%] h-[2px] bg-gradient-to-r from-[#c9a96e]/40 via-[#c9a96e]/60 to-[#c9a96e]/40"
              initial={{ width: '0%' }}
              whileInView={{ width: '84%' }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>

          {/* Phase nodes */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isActive = activePhase === phase.id;

              return (
                <motion.button
                  key={phase.id}
                  onClick={() => setActivePhase(isActive ? null : phase.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: phase.id * 0.1 }}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                  <div
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isActive
                        ? 'border-[#c9a96e] bg-[#c9a96e]/10 shadow-[0_0_20px_rgba(201,169,110,0.3)] phase-glow-active'
                        : 'border-[#c9a96e]/20 bg-[#0f0f20] group-hover:border-[#c9a96e]/50 group-hover:bg-[#c9a96e]/5'
                    }`}
                  >
                    <Icon
                      size={22}
                      className={`transition-colors duration-300 ${
                        isActive ? 'text-[#c9a96e]' : 'text-[#8888a8] group-hover:text-[#c9a96e]'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs tracking-[0.1em] uppercase transition-colors duration-300 text-center ${
                      isActive ? 'text-[#c9a96e]' : 'text-[#8888a8] group-hover:text-white'
                    }`}
                  >
                    {phase.title}
                  </span>
                  <span className="text-[10px] text-[#c9a96e]/40 tracking-wider">
                    {phase.timeEstimate}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Detail card */}
          <motion.div
            initial={false}
            animate={{
              opacity: selectedPhase ? 1 : 0,
              y: selectedPhase ? 0 : 10,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`min-h-[120px] ${selectedPhase ? '' : 'pointer-events-none'}`}
          >
            {selectedPhase && (
              <div className="bg-[#12121f]/60 border border-[#c9a96e]/20 rounded-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/30 flex items-center justify-center">
                      {(() => {
                        const PhaseIcon = selectedPhase.icon;
                        return <PhaseIcon size={20} className="text-[#c9a96e]" />;
                      })()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="text-lg font-medium text-white tracking-wide">
                        {selectedPhase.title}
                      </h3>
                      <span className="text-xs text-[#c9a96e]/60 tracking-wider px-3 py-1 rounded-full bg-[#c9a96e]/5 border border-[#c9a96e]/10">
                        {selectedPhase.timeEstimate}
                      </span>
                    </div>
                    <p className="text-sm text-[#8888a8] leading-relaxed mb-4">
                      {selectedPhase.description}
                    </p>
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#8888a8]/50 uppercase tracking-wider shrink-0">
                        Projektanteil
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedPhase.percentage}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                          className="h-full bg-gradient-to-r from-[#c9a96e] to-[#dbb980] rounded-full"
                        />
                      </div>
                      <span className="text-xs text-[#c9a96e] font-medium shrink-0">
                        {selectedPhase.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile/tablet: Vertical timeline */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-[#1a1a2e]" />
            <motion.div
              className="absolute left-[27px] top-0 w-[2px] bg-gradient-to-b from-[#c9a96e]/40 via-[#c9a96e]/60 to-[#c9a96e]/40 origin-top"
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
            />

            <div className="flex flex-col gap-6">
              {phases.map((phase) => {
                const Icon = phase.icon;
                const isActive = activePhase === phase.id;

                return (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: phase.id * 0.1 }}
                  >
                    <button
                      onClick={() => setActivePhase(isActive ? null : phase.id)}
                      className="flex gap-4 items-start w-full text-left group"
                    >
                      <div className="shrink-0 relative">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isActive
                              ? 'border-[#c9a96e] bg-[#c9a96e]/10 shadow-[0_0_20px_rgba(201,169,110,0.3)] phase-glow-active'
                              : 'border-[#c9a96e]/20 bg-[#0f0f20] group-hover:border-[#c9a96e]/50'
                          }`}
                        >
                          <Icon size={20} className={isActive ? 'text-[#c9a96e]' : 'text-[#8888a8] group-hover:text-[#c9a96e] transition-colors duration-300'} />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-base font-medium tracking-wide transition-colors duration-300 ${
                            isActive ? 'text-[#c9a96e]' : 'text-white group-hover:text-[#c9a96e]'
                          }`}>
                            {phase.title}
                          </h3>
                          <span className="text-[10px] text-[#c9a96e]/40 tracking-wider">
                            {phase.timeEstimate}
                          </span>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-sm text-[#8888a8] leading-relaxed mb-3">
                              {phase.description}
                            </p>
                            {/* Progress bar */}
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] text-[#8888a8]/40 uppercase tracking-wider shrink-0">
                                Projektanteil
                              </span>
                              <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${phase.percentage}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-[#c9a96e] to-[#dbb980] rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-[#c9a96e] font-medium shrink-0">
                                {phase.percentage}%
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
