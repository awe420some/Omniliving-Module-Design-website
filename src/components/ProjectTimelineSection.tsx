'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, Pencil, Factory, Truck, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface TimelinePhase {
  id: number;
  title: string;
  timeEstimate: string;
  percentage: number;
  description: string;
  icon: LucideIcon;
}

const phaseKeys = [
  { id: 1, titleKey: 'timeline.phase1Title', timeKey: 'timeline.phase1Time', descKey: 'timeline.phase1Desc', percentage: 5, icon: MessageSquare },
  { id: 2, titleKey: 'timeline.phase2Title', timeKey: 'timeline.phase2Time', descKey: 'timeline.phase2Desc', percentage: 3, icon: MapPin },
  { id: 3, titleKey: 'timeline.phase3Title', timeKey: 'timeline.phase3Time', descKey: 'timeline.phase3Desc', percentage: 15, icon: Pencil },
  { id: 4, titleKey: 'timeline.phase4Title', timeKey: 'timeline.phase4Time', descKey: 'timeline.phase4Desc', percentage: 30, icon: Factory },
  { id: 5, titleKey: 'timeline.phase5Title', timeKey: 'timeline.phase5Time', descKey: 'timeline.phase5Desc', percentage: 35, icon: Truck },
  { id: 6, titleKey: 'timeline.phase6Title', timeKey: 'timeline.phase6Time', descKey: 'timeline.phase6Desc', percentage: 12, icon: KeyRound },
];

export default function ProjectTimelineSection() {
  const { t } = useTranslation();
  const phases = phaseKeys.map((p) => ({
    ...p,
    title: t(p.titleKey),
    timeEstimate: t(p.timeKey),
    description: t(p.descKey),
  }));
  // Compute cumulative percentages for the progress bar
  const cumulativePercent = phaseKeys.reduce<number[]>((acc, p) => {
    acc.push((acc[acc.length - 1] ?? 0) + p.percentage);
    return acc;
  }, []);

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
    <section id="project-timeline" ref={sectionRef} className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#1E3429]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1E3429] via-[#1E3429] to-[#1E3429]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-[#C3F8BD] uppercase mb-4">
            {t('timeline.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('timeline.title').split(t('timeline.titleAccent'))[0]}<span className="text-gradient-gold">{t('timeline.titleAccent')}</span>{t('timeline.title').split(t('timeline.titleAccent'))[1]}
          </h2>
          <p className="text-sm sm:text-base text-[#D4C5A0] max-w-xl mx-auto mt-4">
            {t('timeline.subtitle')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C3F8BD] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Horizontal timeline - desktop */}
        <div className="hidden lg:block">
          {/* Connecting line */}
          <div className="relative mb-8">
            <div className="absolute top-[28px] left-[8%] right-[8%] h-[2px] bg-[#3E6151]" />
            <motion.div
              className="absolute top-[28px] left-[8%] h-[2px] bg-gradient-to-r from-[#C3F8BD]/40 via-[#C3F8BD]/60 to-[#C3F8BD]/40"
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
                        ? 'border-[#C3F8BD] bg-[#C3F8BD]/10 shadow-[0_0_20px_rgba(195, 248, 189,0.3)] phase-glow-active'
                        : 'border-[#C3F8BD]/20 bg-[#1E3429] group-hover:border-[#C3F8BD]/50 group-hover:bg-[#C3F8BD]/5'
                    }`}
                  >
                    <Icon
                      size={22}
                      className={`transition-colors duration-300 ${
                        isActive ? 'text-[#C3F8BD]' : 'text-[#D4C5A0] group-hover:text-[#C3F8BD]'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs tracking-[0.1em] uppercase transition-colors duration-300 text-center ${
                      isActive ? 'text-[#C3F8BD]' : 'text-[#D4C5A0] group-hover:text-white'
                    }`}
                  >
                    {phase.title}
                  </span>
                  <span className="text-[10px] text-[#C3F8BD]/40 tracking-wider">
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
              <div className="bg-[#2D4A3E]/60 border border-[#C3F8BD]/20 rounded-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#C3F8BD]/10 border border-[#C3F8BD]/30 flex items-center justify-center">
                      {(() => {
                        const PhaseIcon = selectedPhase.icon;
                        return <PhaseIcon size={20} className="text-[#C3F8BD]" />;
                      })()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="text-lg font-medium text-white tracking-wide">
                        {selectedPhase.title}
                      </h3>
                      <span className="text-xs text-[#C3F8BD]/60 tracking-wider px-3 py-1 rounded-full bg-[#C3F8BD]/5 border border-[#C3F8BD]/10">
                        {selectedPhase.timeEstimate}
                      </span>
                    </div>
                    <p className="text-sm text-[#D4C5A0] leading-relaxed mb-4">
                      {selectedPhase.description}
                    </p>
                    {/* Progress bar — shows cumulative project progress */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#D4C5A0]/50 uppercase tracking-wider shrink-0">
                        {t('timeline.progress')}
                      </span>
                      <div className="flex-1 h-1.5 bg-[#3E6151] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cumulativePercent[selectedPhase.id - 1]}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                          className="h-full bg-gradient-to-r from-[#C3F8BD] to-[#DFFCD9] rounded-full"
                        />
                      </div>
                      <span className="text-xs text-[#C3F8BD] font-medium shrink-0">
                        {cumulativePercent[selectedPhase.id - 1]}%
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
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-[#3E6151]" />
            <motion.div
              className="absolute left-[27px] top-0 w-[2px] bg-gradient-to-b from-[#C3F8BD]/40 via-[#C3F8BD]/60 to-[#C3F8BD]/40 origin-top"
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
                              ? 'border-[#C3F8BD] bg-[#C3F8BD]/10 shadow-[0_0_20px_rgba(195, 248, 189,0.3)] phase-glow-active'
                              : 'border-[#C3F8BD]/20 bg-[#1E3429] group-hover:border-[#C3F8BD]/50'
                          }`}
                        >
                          <Icon size={20} className={isActive ? 'text-[#C3F8BD]' : 'text-[#D4C5A0] group-hover:text-[#C3F8BD] transition-colors duration-300'} />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-base font-medium tracking-wide transition-colors duration-300 ${
                            isActive ? 'text-[#C3F8BD]' : 'text-white group-hover:text-[#C3F8BD]'
                          }`}>
                            {phase.title}
                          </h3>
                          <span className="text-[10px] text-[#C3F8BD]/40 tracking-wider">
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
                            <p className="text-sm text-[#D4C5A0] leading-relaxed mb-3">
                              {phase.description}
                            </p>
                            {/* Progress bar — shows cumulative project progress */}
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] text-[#D4C5A0]/40 uppercase tracking-wider shrink-0">
                                {t('timeline.progress')}
                              </span>
                              <div className="flex-1 h-1.5 bg-[#3E6151] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cumulativePercent[phase.id - 1]}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-[#C3F8BD] to-[#DFFCD9] rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-[#C3F8BD] font-medium shrink-0">
                                {cumulativePercent[phase.id - 1]}%
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
