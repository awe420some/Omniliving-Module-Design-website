'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
            Vergleich
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Konventionell vs. <span className="text-gradient-gold">Modular</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Erleben Sie den Unterschied: Vergleichen Sie herkömmliche Bauweise mit unserem
            innovativen modularen System.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

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
            className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-lg overflow-hidden border border-white/5 cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={(e) => isDragging && handleMove(e.clientX)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            role="slider"
            aria-label="Before/After Vergleichsschieberegler"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderPosition)}
          >
            {/* AFTER image (Modular) - full width behind */}
            <div className="absolute inset-0">
              <Image
                src="/images/hero-building.png"
                alt="Modularer Bau - Omniliving Modulhaus"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1152px"
                priority={false}
              />
              {/* Slight warm tint for modular */}
              <div className="absolute inset-0 bg-[#c9a96e]/5" />
            </div>

            {/* BEFORE image (Conventional) - clipped by slider position */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              {/* Dark placeholder for conventional construction */}
              <div className="absolute inset-0 bg-[#1a1a24]">
                {/* Simulate a conventional construction site */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px),
                      repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)
                    `,
                  }} />
                </div>
                {/* Scaffolding representation */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 400" preserveAspectRatio="none">
                  {/* Scaffolding frame */}
                  <rect x="200" y="50" width="400" height="300" fill="none" stroke="#888" strokeWidth="2" />
                  <line x1="200" y1="120" x2="600" y2="120" stroke="#888" strokeWidth="1" />
                  <line x1="200" y1="190" x2="600" y2="190" stroke="#888" strokeWidth="1" />
                  <line x1="200" y1="260" x2="600" y2="260" stroke="#888" strokeWidth="1" />
                  <line x1="300" y1="50" x2="300" y2="350" stroke="#888" strokeWidth="1" />
                  <line x1="400" y1="50" x2="400" y2="350" stroke="#888" strokeWidth="1" />
                  <line x1="500" y1="50" x2="500" y2="350" stroke="#888" strokeWidth="1" />
                  {/* Cross braces */}
                  <line x1="200" y1="50" x2="300" y2="120" stroke="#666" strokeWidth="0.5" />
                  <line x1="300" y1="50" x2="200" y2="120" stroke="#666" strokeWidth="0.5" />
                  <line x1="500" y1="190" x2="600" y2="260" stroke="#666" strokeWidth="0.5" />
                  <line x1="600" y1="190" x2="500" y2="260" stroke="#666" strokeWidth="0.5" />
                  {/* Crane */}
                  <line x1="700" y1="350" x2="700" y2="30" stroke="#999" strokeWidth="3" />
                  <line x1="700" y1="30" x2="550" y2="30" stroke="#999" strokeWidth="2" />
                  <line x1="700" y1="30" x2="700" y2="80" stroke="#666" strokeWidth="1" />
                  <line x1="700" y1="30" x2="650" y2="60" stroke="#666" strokeWidth="0.5" />
                  {/* Dirt/mess indicators */}
                  <circle cx="150" cy="340" r="20" fill="#3a3a2a" opacity="0.4" />
                  <circle cx="650" cy="350" r="15" fill="#3a3a2a" opacity="0.3" />
                </svg>
                {/* Concrete/mess texture */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#2a2a1a]/40 to-transparent" />
              </div>
              {/* Cool tint for conventional */}
              <div className="absolute inset-0 bg-[#4a6a8a]/8" />
            </div>

            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              {/* Line */}
              <div className="w-[2px] h-full bg-white/80 mx-auto shadow-[0_0_8px_rgba(255,255,255,0.3)]" />

              {/* Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0a0a14] border-2 border-[#c9a96e] flex items-center justify-center shadow-lg shadow-[#c9a96e]/20 pointer-events-auto cursor-col-resize">
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

            {/* Labels */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className="px-3 py-1.5 rounded-md bg-[#0a0a14]/80 backdrop-blur-sm border border-white/10 text-xs tracking-[0.15em] text-white/70 uppercase">
                Konventioneller Bau
              </span>
            </div>
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="px-3 py-1.5 rounded-md bg-[#0a0a14]/80 backdrop-blur-sm border border-[#c9a96e]/20 text-xs tracking-[0.15em] text-[#c9a96e] uppercase">
                Modularer Bau
              </span>
            </div>
          </div>

          {/* Comparison stats below slider */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 sm:p-6 rounded-lg bg-[#12121f]/40 border border-white/5">
              <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase mb-3">
                Konventioneller Bau
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-lg sm:text-xl font-light text-white/60">12–24 Monate</p>
                  <p className="text-[10px] text-white/30">Bauzeit</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-light text-white/60">Hoch</p>
                  <p className="text-[10px] text-white/30">Lärmbelastung</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-light text-white/60">Wetterabhängig</p>
                  <p className="text-[10px] text-white/30">Bauablauf</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 rounded-lg bg-[#12121f]/40 border border-[#c9a96e]/10">
              <p className="text-[10px] tracking-[0.2em] text-[#c9a96e]/60 uppercase mb-3">
                Modularer Bau
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-lg sm:text-xl font-light text-gradient-gold">&lt;6 Monate</p>
                  <p className="text-[10px] text-[#c9a96e]/50">Bauzeit</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-light text-gradient-gold">Minimal</p>
                  <p className="text-[10px] text-[#c9a96e]/50">Lärmbelastung</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-light text-gradient-gold">Wetterunabhängig</p>
                  <p className="text-[10px] text-[#c9a96e]/50">Bauablauf</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
