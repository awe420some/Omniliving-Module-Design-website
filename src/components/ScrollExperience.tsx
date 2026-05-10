'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { MapPin, Truck, Container, Link2, ArrowUpCircle, Home } from 'lucide-react';

function SceneCanvasLoader() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full bg-omni-forest-deep flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-omni-mint/30 border-t-[#C3F8BD] rounded-full animate-spin" />
        <span className="text-xs text-omni-cream tracking-wider">{t('scroll.sceneLoading')}</span>
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

  // Direct scroll-listener replaces GSAP ScrollTrigger AND Framer's useScroll.
  // Framer's useScroll was returning progress=1.0 throughout (the `target` ref
  // resolution against a sticky-positioned scroll container is brittle when
  // the page is wrapped in another sticky/relative parent), causing the 3D
  // scene to think the user was always at the "Fertigstellung" phase. A plain
  // rAF-throttled scroll listener is dead simple, framework-independent, and
  // the perf cost is one IntersectionObserver + a few additions per scroll.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;

    const update = () => {
      if (!mounted) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Progress = how far the user has scrolled inside the container,
      // mapped 0→1 across (containerHeight - viewportHeight). At progress=0
      // the container's top hits viewport-top; at progress=1 the container's
      // bottom hits viewport-bottom (matches Framer's 'start start' / 'end end').
      const scrollable = Math.max(1, rect.height - vh);
      const scrolled = -rect.top; // positive once the container's top has gone above viewport
      const progress = Math.min(1, Math.max(0, scrolled / scrollable));

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
    };

    // We deliberately do NOT throttle through requestAnimationFrame: in
    // headless / hidden tabs rAF can stall, leaving the scroll listener wired
    // but never updating the store. Direct dispatch is cheap (a few math ops
    // and one zustand set) and runs every native scroll event regardless of
    // tab visibility — exactly what we need for a scroll-driven scene.
    update(); // run once for current scroll position
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      mounted = false;
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [setScrollProgress, setBuildingPhase, setExperienceMode, setSectionCutActive]);

  const currentPhase = useAppStore((s) => s.buildingPhase);
  const experienceMode = useAppStore((s) => s.experienceMode);
  const scrollProgress = useAppStore((s) => s.scrollProgress);

  const PhaseIcon = PHASE_ICONS[currentPhase] || MapPin;
  const phaseLabel = t(`scroll.phase${currentPhase}`);
  const phaseDesc = t(`scroll.phase${currentPhase}Desc`);

  return (
    <div ref={containerRef} className="relative" style={{ height: `${100 * 6}vh`, position: 'relative' }}>
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
                <div className="w-8 h-8 rounded-lg bg-omni-mint/15 flex items-center justify-center">
                  <PhaseIcon size={16} className="text-omni-mint" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-omni-mint uppercase">
                    Phase {currentPhase}/5
                  </p>
                  <p className="text-sm text-white font-light tracking-wide">
                    {phaseLabel}
                  </p>
                </div>
              </div>
              <p className="text-xs text-omni-cream ml-11">
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
                <div className="w-2 h-2 rounded-full bg-omni-mint animate-pulse" />
                <p className="text-[10px] tracking-[0.2em] uppercase text-omni-cream">
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
              <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-omni-mint/20">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ x: [0, 5, 0], y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-omni-mint">
                      <path d="M1 1L6 6M6 6V2M6 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 15L10 10M10 10V14M10 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <p className="text-sm text-omni-mint tracking-wider">
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
                  <div className="bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md border border-omni-mint/20">
                    <p className="text-[9px] text-omni-mint tracking-wider whitespace-nowrap">
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
              className="w-full bg-gradient-to-b from-omni-mint to-omni-mint/30 rounded-full"
              style={{ height: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Horizontal progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-omni-mint via-omni-mint-soft to-omni-mint/30"
              style={{ width: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
