'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { MapPin, Truck, Container, Link2, ArrowUpCircle, Home } from 'lucide-react';

// Register GSAP ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function SceneCanvasLoader() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full bg-[#0a0a14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
        <span className="text-xs text-[#8888a8] tracking-wider">{t('scroll.sceneLoading')}</span>
      </div>
    </div>
  );
}

const SceneCanvas = dynamic(() => import('@/components/3d/SceneCanvas'), {
  ssr: false,
  loading: () => <SceneCanvasLoader />,
});

/* ─── Phase descriptions with icons ─── */
const PHASE_ICONS = [MapPin, Truck, Container, Link2, ArrowUpCircle, Home];

/* ─── Module labels for configurator mode ─── */
const MODULE_LABEL_KEYS = [
  { id: 'ground-0', labelKey: 'module.wohnen', x: '18%', y: '68%' },
  { id: 'ground-1', labelKey: 'module.schlafen', x: '48%', y: '68%' },
  { id: 'ground-2', labelKey: 'module.kueche', x: '78%', y: '68%' },
  { id: 'upper-0', labelKey: 'module.bad', x: '18%', y: '42%' },
  { id: 'upper-1', labelKey: 'module.wohnen', x: '48%', y: '42%' },
  { id: 'upper-2', labelKey: 'module.schlafen', x: '78%', y: '42%' },
];

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const setScrollProgress = useAppStore((s) => s.setScrollProgress);
  const setBuildingPhase = useAppStore((s) => s.setBuildingPhase);
  const setExperienceMode = useAppStore((s) => s.setExperienceMode);
  const setSectionCutActive = useAppStore((s) => s.setSectionCutActive);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const totalScrollHeight = window.innerHeight * 5;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${totalScrollHeight}`,
        pin: stickyRef.current,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          setScrollProgress(progress);

          if (progress < 0.7) {
            const phaseProgress = progress / 0.7;
            const phase = Math.min(5, Math.floor(phaseProgress * 6));
            setBuildingPhase(phase);
            setExperienceMode('building');
            setSectionCutActive(false);
          } else if (progress < 0.85) {
            setBuildingPhase(5);
            setExperienceMode('sectioncut');
            setSectionCutActive(true);
          } else {
            setBuildingPhase(5);
            setExperienceMode('configurator');
            setSectionCutActive(false);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [setScrollProgress, setBuildingPhase, setExperienceMode, setSectionCutActive]);

  const currentPhase = useAppStore((s) => s.buildingPhase);
  const experienceMode = useAppStore((s) => s.experienceMode);
  const scrollProgress = useAppStore((s) => s.scrollProgress);

  const PhaseIcon = PHASE_ICONS[currentPhase] || MapPin;
  const phaseLabel = t(`scroll.phase${currentPhase}`);
  const phaseDesc = t(`scroll.phase${currentPhase}Desc`);

  return (
    <div ref={containerRef} className="relative" style={{ height: `${100 * 6}vh` }}>
      {/* Sticky 3D canvas */}
      <div
        ref={stickyRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden"
      >
        {/* 3D Canvas */}
        <div className="absolute inset-0">
          <SceneCanvas />
        </div>

        {/* Overlay UI */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Phase indicator - bottom left */}
          <div className="absolute bottom-8 left-8 sm:left-12 pointer-events-auto">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-black/60 backdrop-blur-md px-5 py-4 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#c9a96e]/15 flex items-center justify-center">
                  <PhaseIcon size={16} className="text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-[#c9a96e] uppercase">
                    Phase {currentPhase}/5
                  </p>
                  <p className="text-sm text-white font-light tracking-wide">
                    {phaseLabel}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#8888a8] ml-11">
                {phaseDesc}
              </p>
            </motion.div>
          </div>

          {/* Experience mode indicator - top right */}
          <div className="absolute top-24 right-8 sm:right-12 pointer-events-auto">
            <motion.div
              key={experienceMode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c9a96e] animate-pulse" />
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8888a8]">
                  {experienceMode === 'building' && t('scroll.building')}
                  {experienceMode === 'sectioncut' && t('scroll.sectionCut')}
                  {experienceMode === 'configurator' && t('scroll.configurator')}
                  {experienceMode === 'hero' && t('scroll.explore')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Section cut hint with cursor animation */}
          {experienceMode === 'sectioncut' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-[#c9a96e]/20">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#c9a96e]">
                      <path d="M1 1L6 6M6 6V2M6 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 15L10 10M10 10V14M10 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <p className="text-sm text-[#c9a96e] tracking-wider">
                    {t('scroll.cursorHint')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Module labels in configurator mode */}
          {experienceMode === 'configurator' && (
            <div className="absolute inset-0">
              {MODULE_LABEL_KEYS.map((mod) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="absolute"
                  style={{ left: mod.x, top: mod.y, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#c9a96e]/20">
                    <p className="text-[9px] text-[#c9a96e] tracking-wider whitespace-nowrap">
                      {t(mod.labelKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Vertical scroll progress bar - right side */}
          <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-[2px] h-32 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-[#c9a96e] to-[#c9a96e]/30 rounded-full"
              style={{ height: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Horizontal progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#c9a96e] via-[#dbb980] to-[#c9a96e]/30"
              style={{ width: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
