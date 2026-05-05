'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

const stats: StatItem[] = [
  { value: 70, suffix: '%', label: 'kürzere Bauzeiten', prefix: 'bis zu' },
  { value: 48, suffix: '', label: 'Stunden Montage vor Ort', prefix: '' },
  { value: 6, suffix: '', label: 'Monate Gesamtprojekt', prefix: '<' },
  { value: 100, suffix: '', label: 'Neutral Wohnen', prefix: 'CO₂' },
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
    <span className="text-4xl sm:text-5xl md:text-6xl font-light tracking-wider text-white">
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
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-8 h-[1px] bg-[#c9a96e]/30 mb-6 group-hover:w-12 transition-all duration-500" />
              <AnimatedNumber
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                inView={isInView}
                delay={index * 0.15}
                duration={2}
              />
              <p className="mt-3 text-xs sm:text-sm tracking-[0.1em] text-[#8888a8] uppercase">
                {stat.label}
              </p>
              <div className="w-8 h-[1px] bg-[#c9a96e]/30 mt-6 group-hover:w-12 transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
