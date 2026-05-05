'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, AlertTriangle, Clock, Volume2, Cloud, DollarSign, Expand, Leaf } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

interface ComparisonMetric {
  labelKey: string;
  conventionalKey: string;
  modularKey: string;
  conventionalPercent: number;
  modularPercent: number;
  icon: React.ElementType;
}

const metrics: ComparisonMetric[] = [
  {
    labelKey: 'compare.buildTime',
    conventionalKey: 'compare.conventional.buildTime',
    modularKey: 'compare.modular.buildTime',
    conventionalPercent: 85,
    modularPercent: 25,
    icon: Clock,
  },
  {
    labelKey: 'compare.noise',
    conventionalKey: 'compare.conventional.noise',
    modularKey: 'compare.modular.noise',
    conventionalPercent: 90,
    modularPercent: 15,
    icon: Volume2,
  },
  {
    labelKey: 'compare.process',
    conventionalKey: 'compare.conventional.process',
    modularKey: 'compare.modular.process',
    conventionalPercent: 80,
    modularPercent: 10,
    icon: Cloud,
  },
  {
    labelKey: 'compare.costUncertainty',
    conventionalKey: 'compare.conventional.costUncertainty',
    modularKey: 'compare.modular.costUncertainty',
    conventionalPercent: 75,
    modularPercent: 10,
    icon: DollarSign,
  },
  {
    labelKey: 'compare.expandability',
    conventionalKey: 'compare.conventional.expandability',
    modularKey: 'compare.modular.expandability',
    conventionalPercent: 70,
    modularPercent: 15,
    icon: Expand,
  },
  {
    labelKey: 'compare.sustainability',
    conventionalKey: 'compare.conventional.sustainability',
    modularKey: 'compare.modular.sustainability',
    conventionalPercent: 85,
    modularPercent: 10,
    icon: Leaf,
  },
];

export default function BeforeAfterSlider() {
  const { t } = useTranslation();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const sparkleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Show badges when slider reveals more modular side
  const showModularBadges = sliderPosition > 50;

  // Rain animation on conventional side
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const drops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    // Initialize drops
    for (let i = 0; i < 80; i++) {
      drops.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        speed: 4 + Math.random() * 6,
        length: 8 + Math.random() * 16,
        opacity: 0.15 + Math.random() * 0.25,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (const drop of drops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1, drop.y + drop.length);
        ctx.strokeStyle = `rgba(150, 180, 220, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.3;
        if (drop.y > canvas.clientHeight) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.clientWidth;
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Sparkle animation on modular side
  useEffect(() => {
    const canvas = sparkleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const sparkles: { x: number; y: number; size: number; opacity: number; speed: number; phase: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    for (let i = 0; i < 30; i++) {
      sparkles.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        size: 1 + Math.random() * 2.5,
        opacity: 0,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const time = Date.now() * 0.001;
      for (const s of sparkles) {
        const currentOpacity = (Math.sin(time * s.speed + s.phase) + 1) / 2 * 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(219, 185, 128, ${currentOpacity})`;
        ctx.fill();
        // Cross sparkle
        ctx.beginPath();
        ctx.moveTo(s.x - s.size * 2.5, s.y);
        ctx.lineTo(s.x + s.size * 2.5, s.y);
        ctx.moveTo(s.x, s.y - s.size * 2.5);
        ctx.lineTo(s.x, s.y + s.size * 2.5);
        ctx.strokeStyle = `rgba(219, 185, 128, ${currentOpacity * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);



  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      setSliderPosition(percent);
    },
    [],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      handleMove(e.touches[0].clientX);
    },
    [handleMove],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse events for dragging outside container
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleGlobalUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDragging, handleMove]);

  return (
    <section id="comparison" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
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
            {t('compare.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('compare.title').split(' vs. ')[0]} vs. <span className="text-gradient-gold">{t('compare.titleAccent')}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            {t('compare.desc')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Instruction text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-xs sm:text-sm text-[#8888a8]/60 tracking-wider mb-6"
        >
          ← {t('compare.drag')} →
        </motion.p>

        {/* Before/After Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-lg overflow-hidden border border-white/10 cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            role="slider"
            aria-label={t('compare.label')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPosition)}
          >
            {/* AFTER image (Modular) - clean, warm, full quality */}
            <div className="absolute inset-0">
              <Image
                src="/images/hero-building.png"
                alt={t('compare.modular')}
                fill
                sizes="100vw"
                className="object-cover"
                style={{ filter: 'brightness(1.05) saturate(1.1)' }}
                priority
              />
              {/* Sparkle animation */}
              <canvas
                ref={sparkleCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: 'screen', opacity: 0.6 }}
              />
            </div>

            {/* BEFORE image (Conventional) - clipped by slider position */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              {/* Base image — CSS filter makes it look cold, gray, under-construction */}
              <Image
                src="/images/hero-building.png"
                alt={t('compare.conventional')}
                fill
                sizes="100vw"
                className="object-cover"
                style={{ filter: 'saturate(0.25) brightness(0.75) hue-rotate(195deg)' }}
                priority
              />

              {/* Concrete/mess texture noise overlay */}
              <div className="absolute inset-0 opacity-[0.12]" style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,100,100,0.15) 2px, rgba(100,100,100,0.15) 3px),
                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(80,80,80,0.1) 2px, rgba(80,80,80,0.1) 3px)
                `,
              }} />

              {/* Scaffolding overlay using CSS - more prominent */}
              <div className="absolute inset-0 opacity-35" style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(180,180,180,0.5) 60px, rgba(180,180,180,0.5) 62px),
                  repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(180,180,180,0.4) 40px, rgba(180,180,180,0.4) 42px)
                `,
              }} />

              {/* Diagonal cross braces for scaffolding */}
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(150,150,150,0.4) 50px, rgba(150,150,150,0.4) 52px),
                  repeating-linear-gradient(-45deg, transparent, transparent 50px, rgba(150,150,150,0.4) 50px, rgba(150,150,150,0.4) 52px)
                `,
              }} />

              {/* Rain canvas overlay */}
              <canvas
                ref={rainCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Muddy/brown ground effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#3a2a1a]/60 via-[#4a3a2a]/30 to-transparent" />

              {/* Construction debris/piles at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-[15%]">
                <div className="absolute bottom-0 left-[10%] w-[12%] h-[60%] bg-[#4a3a2a]/40 rounded-t-full blur-sm" />
                <div className="absolute bottom-0 left-[35%] w-[8%] h-[40%] bg-[#3a3020]/35 rounded-t-full blur-sm" />
                <div className="absolute bottom-0 left-[55%] w-[15%] h-[70%] bg-[#4a3a2a]/35 rounded-t-full blur-sm" />
                <div className="absolute bottom-0 right-[15%] w-[10%] h-[50%] bg-[#3a3020]/30 rounded-t-full blur-sm" />
              </div>

              {/* Red/gray construction warning stripes at top - more visible */}
              <div className="absolute top-0 left-0 right-0 h-10 opacity-45" style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  #8a2020,
                  #8a2020 10px,
                  #6a6a6a 10px,
                  #6a6a6a 20px
                )`,
              }} />
              <div className="absolute top-10 left-0 right-0 h-[1px] bg-[#8a2020]/30" />

              {/* Construction crane silhouette - top right - more visible */}
              <svg className="absolute top-0 right-[5%] w-[30%] h-[80%] opacity-22" viewBox="0 0 200 400" preserveAspectRatio="xMidYMin">
                {/* Crane mast */}
                <rect x="95" y="20" width="10" height="360" fill="#777" />
                {/* Crane jib (horizontal arm) */}
                <rect x="10" y="20" width="180" height="5" fill="#777" />
                {/* Counter jib */}
                <rect x="100" y="20" width="80" height="4" fill="#666" />
                {/* Counter weight */}
                <rect x="155" y="25" width="20" height="15" fill="#555" />
                {/* Cable from jib to load */}
                <line x1="40" y1="25" x2="40" y2="120" stroke="#666" strokeWidth="1" />
                {/* Load (concrete block) */}
                <rect x="30" y="120" width="20" height="15" fill="#555" />
                {/* Crane cabin */}
                <rect x="88" y="25" width="24" height="18" fill="#666" rx="1" />
                {/* Support cables */}
                <line x1="100" y1="20" x2="40" y2="18" stroke="#555" strokeWidth="0.5" />
                <line x1="100" y1="20" x2="160" y2="18" stroke="#555" strokeWidth="0.5" />
                {/* Lattice on mast */}
                <line x1="95" y1="50" x2="105" y2="80" stroke="#666" strokeWidth="0.5" />
                <line x1="105" y1="50" x2="95" y2="80" stroke="#666" strokeWidth="0.5" />
                <line x1="95" y1="80" x2="105" y2="110" stroke="#666" strokeWidth="0.5" />
                <line x1="105" y1="80" x2="95" y2="110" stroke="#666" strokeWidth="0.5" />
                <line x1="95" y1="110" x2="105" y2="140" stroke="#666" strokeWidth="0.5" />
                <line x1="105" y1="110" x2="95" y2="140" stroke="#666" strokeWidth="0.5" />
              </svg>

              {/* Warning icon elements */}
              <div className="absolute top-14 left-4 sm:left-6 opacity-40">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a5020]" />
              </div>
              <div className="absolute bottom-[20%] left-[15%] opacity-30">
                <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-[#6a7a9a]" />
              </div>

              {/* Additional construction mess elements */}
              <div className="absolute bottom-[25%] left-[5%] w-[8%] h-[3%] bg-[#6a5a4a]/25 rotate-12 rounded-sm" />
              <div className="absolute bottom-[30%] left-[25%] w-[5%] h-[2%] bg-[#5a5a5a]/20 -rotate-6 rounded-sm" />
              <div className="absolute bottom-[22%] right-[20%] w-[6%] h-[2.5%] bg-[#6a5a4a]/20 rotate-3 rounded-sm" />

              {/* Concrete mixer silhouette */}
              <svg className="absolute bottom-[15%] right-[8%] w-[8%] opacity-20" viewBox="0 0 60 40" preserveAspectRatio="xMidYMax">
                <rect x="5" y="30" width="50" height="5" fill="#555" rx="1" />
                <circle cx="45" cy="20" r="12" fill="none" stroke="#555" strokeWidth="2" />
                <line x1="20" y1="30" x2="20" y2="35" stroke="#555" strokeWidth="2" />
                <line x1="40" y1="30" x2="40" y2="35" stroke="#555" strokeWidth="2" />
              </svg>

              {/* Extra cold vignette */}
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(20,30,50,0.4) 100%)',
              }} />
            </div>

            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              {/* Glow behind the line */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {/* Main line */}
              <div className="w-[2px] h-full bg-white/90 mx-auto shadow-[0_0_12px_rgba(255,255,255,0.4),0_0_24px_rgba(201,169,110,0.2)]" />

              {/* Handle with glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-col-resize">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-[-8px] rounded-full"
                  animate={{
                    boxShadow: isDragging
                      ? '0 0 20px rgba(201,169,110,0.5), 0 0 40px rgba(201,169,110,0.2)'
                      : '0 0 10px rgba(201,169,110,0.3), 0 0 20px rgba(201,169,110,0.1)',
                  }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0a0a14] border-2 border-[#c9a96e] flex items-center justify-center shadow-lg shadow-[#c9a96e]/30">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="sm:w-6 sm:h-6">
                    <path d="M6 10L2 10" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M2 10L4 8" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M2 10L4 12" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M14 10L18 10" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M18 10L16 8" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M18 10L16 12" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Labels - prominent and animated */}
            <motion.div
              className="absolute top-4 left-4 z-20 pointer-events-none"
              animate={{ x: sliderPosition < 15 ? -60 : 0, opacity: sliderPosition < 15 ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md bg-[#0a0a14]/85 backdrop-blur-md border border-[#6a7a9a]/20 text-xs sm:text-sm tracking-[0.15em] text-[#8a9aaa] uppercase shadow-lg shadow-black/30">
                <CloudRain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6a7a9a]" />
                {t('compare.conventional')}
              </span>
            </motion.div>
            <motion.div
              className="absolute top-4 right-4 z-20 pointer-events-none"
              animate={{ x: sliderPosition > 85 ? 60 : 0, opacity: sliderPosition > 85 ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md bg-[#0a0a14]/85 backdrop-blur-md border border-[#c9a96e]/25 text-xs sm:text-sm tracking-[0.15em] text-[#c9a96e] uppercase shadow-lg shadow-black/30">
                {t('compare.modular')}
                <span className="w-2 h-2 rounded-full bg-[#c9a96e] shadow-[0_0_6px_rgba(201,169,110,0.6)]" />
              </span>
            </motion.div>

            {/* Animated badges when slider > 50% */}
            <AnimatePresence>
              {showModularBadges && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.8 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                    className="absolute top-1/2 right-[8%] -translate-y-1/2 z-20 pointer-events-none"
                  >
                    <div className="px-4 py-2 sm:px-5 sm:py-3 rounded-lg bg-[#c9a96e]/20 backdrop-blur-md border border-[#c9a96e]/30 shadow-[0_0_20px_rgba(201,169,110,0.2)]">
                      <p className="text-lg sm:text-2xl font-light text-gradient-gold">70%</p>
                      <p className="text-[10px] sm:text-xs tracking-[0.1em] text-[#c9a96e]/80 uppercase">{t('compare.faster')}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.8 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 200, delay: 0.15 }}
                    className="absolute top-[70%] right-[5%] z-20 pointer-events-none"
                  >
                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-[#2d4a3e]/30 backdrop-blur-md border border-[#2d4a3e]/40 shadow-[0_0_12px_rgba(45,74,62,0.2)]">
                      <p className="text-[10px] sm:text-xs tracking-[0.1em] text-[#6aaa8a] uppercase font-medium">{t('compare.weatherIndependent')}</p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Conventional side warning badge */}
            <AnimatePresence>
              {sliderPosition > 30 && sliderPosition < 55 && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="absolute top-[65%] left-[5%] z-20 pointer-events-none"
                >
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-[#8a3020]/25 backdrop-blur-md border border-[#8a3020]/30 shadow-[0_0_12px_rgba(138,48,32,0.15)]">
                    <p className="text-[10px] sm:text-xs tracking-[0.1em] text-[#aa6a5a] uppercase font-medium">{t('compare.weatherDependent')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comparison Metrics Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 sm:mt-12"
          >
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 mb-4 px-2">
              <div className="text-center">
                <p className="text-[10px] sm:text-xs tracking-[0.2em] text-[#6a7a9a]/80 uppercase">
                  {t('compare.conventional').split(' ')[0]}
                </p>
              </div>
              <div />
              <div className="text-center">
                <p className="text-[10px] sm:text-xs tracking-[0.2em] text-[#c9a96e]/80 uppercase">
                  {t('compare.modular').split(' ')[0]}
                </p>
              </div>
            </div>

            {/* Metric rows */}
            <div className="space-y-3 sm:space-y-4">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.labelKey}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="grid grid-cols-[1fr_1fr_1fr] gap-2 sm:gap-4 items-center group"
                >
                  {/* Conventional side */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <metric.icon className="w-3.5 h-3.5 text-[#6a7a9a]/60 shrink-0" />
                      <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider">{t(metric.labelKey)}</p>
                    </div>
                    <p className="text-sm sm:text-base font-light text-[#8a9aaa]/80">{t(metric.conventionalKey)}</p>
                    {/* Progress bar - conventional (red/gray) */}
                    <div className="h-1 sm:h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${metric.conventionalPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[#6a4a3a] to-[#8a5a4a]"
                      />
                    </div>
                  </div>

                  {/* Center - metric label */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/5 flex items-center justify-center bg-[#12121f]/40 group-hover:border-[#c9a96e]/20 transition-colors duration-300">
                      <metric.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/30 group-hover:text-[#c9a96e]/60 transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Modular side */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 justify-end">
                      <p className="text-[10px] sm:text-xs text-[#c9a96e]/50 uppercase tracking-wider">{t(metric.labelKey)}</p>
                      <metric.icon className="w-3.5 h-3.5 text-[#c9a96e]/40 shrink-0" />
                    </div>
                    <p className="text-sm sm:text-base font-light text-gradient-gold text-right">{t(metric.modularKey)}</p>
                    {/* Progress bar - modular (gold/green) */}
                    <div className="h-1 sm:h-1.5 bg-[#1a1a24] rounded-full overflow-hidden flex justify-end">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - metric.modularPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[#2d4a3e] to-[#c9a96e]"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 sm:mt-10 grid grid-cols-2 gap-4"
            >
              {/* Conventional summary */}
              <div className="p-4 sm:p-6 rounded-lg bg-[#12121f]/40 border border-[#3a4a5a]/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6a4a3a] via-[#8a5a4a] to-[#6a4a3a] opacity-40" />
                <p className="text-[10px] tracking-[0.2em] text-[#6a7a9a]/60 uppercase mb-3">
                  {t('compare.conventional')}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8a5a4a]" />
                    <p className="text-xs sm:text-sm text-[#8a9aaa]/70">{t('compare.conventional.longBuild')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8a5a4a]" />
                    <p className="text-xs sm:text-sm text-[#8a9aaa]/70">{t('compare.conventional.unpredictableCosts')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8a5a4a]" />
                    <p className="text-xs sm:text-sm text-[#8a9aaa]/70">{t('compare.conventional.highEmission')}</p>
                  </div>
                </div>
              </div>

              {/* Modular summary */}
              <div className="p-4 sm:p-6 rounded-lg bg-[#12121f]/40 border border-[#c9a96e]/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c9a96e] via-[#dbb980] to-[#c9a96e] opacity-40" />
                <p className="text-[10px] tracking-[0.2em] text-[#c9a96e]/60 uppercase mb-3">
                  {t('compare.modular')}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                    <p className="text-xs sm:text-sm text-[#c9a96e]/80">{t('compare.modular.fastCompletion')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                    <p className="text-xs sm:text-sm text-[#c9a96e]/80">{t('compare.modular.fixedPrice')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                    <p className="text-xs sm:text-sm text-[#c9a96e]/80">{t('compare.modular.sustainableLiving')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
