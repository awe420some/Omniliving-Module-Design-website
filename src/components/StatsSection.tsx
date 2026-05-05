'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingDown, Clock, Calendar, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
  icon: LucideIcon;
  description: string;
}

const stats: StatItem[] = [
  { value: 70, suffix: '%', label: 'kürzere Bauzeiten', prefix: 'bis zu', icon: TrendingDown, description: 'Durch serielle Vorfertigung' },
  { value: 48, suffix: '', label: 'Stunden Montage vor Ort', prefix: '', icon: Clock, description: 'Assembly am Stück' },
  { value: 6, suffix: '', label: 'Monate Gesamtprojekt', prefix: '<', icon: Calendar, description: 'Von Planung bis Einzug' },
  { value: 100, suffix: '', label: 'Neutral Wohnen', prefix: 'CO₂', icon: Leaf, description: 'Nachhaltig & energieeffizient' },
];

function AnimatedNumber({
  value,
  suffix,
  prefix,
  duration = 2,
  delay = 0,
  inView,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  inView: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const totalMs = duration * 1000;
    const delayMs = delay * 1000;

    const timeout = setTimeout(() => {
      const animate = (now: number) => {
        const elapsed = now - startTime - delayMs;
        if (elapsed < 0) {
          requestAnimationFrame(animate);
          return;
        }
        const progress = Math.min(elapsed / totalMs, 1);
        // Eased animation with cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [inView, value, duration, delay]);

  const isCO2 = prefix === 'CO₂';

  return (
    <span className="text-4xl sm:text-5xl md:text-6xl font-light tracking-wider text-white stat-glow inline-block">
      {isCO2 ? (
        <>
          <span className="text-[#c9a96e]">CO</span>
          <sub className="text-2xl sm:text-3xl align-baseline text-[#c9a96e]">₂</sub>
        </>
      ) : (
        <>
          {prefix && <span className="text-lg sm:text-xl text-[#c9a96e] mr-1">{prefix}</span>}
          {displayValue}
        </>
      )}
      {suffix && <span className="text-[#c9a96e]">{suffix}</span>}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stats" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0f0f20] to-[#0a0a14]" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-transparent via-[#c9a96e]/20 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-t from-transparent via-[#c9a96e]/20 to-transparent" />
      </div>

      <div ref={ref} className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            In Zahlen
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Das spricht für <span className="text-gradient-gold">sich</span>
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative"
        >
          {/* Connecting gold lines on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] h-[1px] -translate-y-1/2 pointer-events-none">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#c9a96e]/15 to-transparent origin-center"
            />
            {/* Dots at stat positions */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1 + i * 0.15 }}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c9a96e]/30"
                style={{ left: `${i * 33.33}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className={`relative flex flex-col items-center text-center group ${index < 3 ? 'golden-divider-v' : ''}`}
                >
                  {/* Subtle pulse/glow behind stat number */}
                  <div
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pulse-glow"
                    style={{
                      background: 'radial-gradient(circle, rgba(201, 169, 110, 0.08) 0%, transparent 70%)',
                    }}
                  />

                  {/* Icon illustration */}
                  <div className="w-10 h-10 rounded-lg bg-[#12121f]/60 border border-[#c9a96e]/15 flex items-center justify-center mb-4 group-hover:border-[#c9a96e]/30 group-hover:bg-[#12121f]/80 transition-all duration-500">
                    <Icon size={18} className="text-[#c9a96e]/60 group-hover:text-[#c9a96e] transition-colors duration-500" />
                  </div>

                  <div className="w-8 h-[1px] bg-[#c9a96e]/30 mb-6 group-hover:w-12 transition-all duration-500" />

                  <div className="relative">
                    <AnimatedNumber
                      value={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      inView={isInView}
                      delay={index * 0.15}
                      duration={2}
                    />
                  </div>

                  <p className="mt-3 text-xs sm:text-sm tracking-[0.1em] text-[#8888a8] uppercase">
                    {stat.label}
                  </p>

                  {/* Description below stat */}
                  <p className="mt-1.5 text-[10px] tracking-wider text-[#8888a8]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {stat.description}
                  </p>

                  <div className="w-8 h-[1px] bg-[#c9a96e]/30 mt-6 group-hover:w-12 transition-all duration-500" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
