'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageSquare, Search, PenTool, Wallet, Hammer, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: ProcessStep[] = [
  {
    number: '01',
    title: 'Erstgespräch',
    description: 'Wir besprechen Ihre Wünsche, Bedürfnisse und Rahmenbedingungen',
    icon: MessageSquare,
  },
  {
    number: '02',
    title: 'Standortprüfung',
    description: 'Prüfung der örtlichen Gegebenheiten und Genehmigungsfähigkeit',
    icon: Search,
  },
  {
    number: '03',
    title: 'Entwurf',
    description: 'Individuelle Planung und Gestaltung Ihres modularen Zuhauses',
    icon: PenTool,
  },
  {
    number: '04',
    title: 'Finanzierungsmodell',
    description: 'Pacht, Kauf oder individuelle Kombination – wir finden die passende Lösung',
    icon: Wallet,
  },
  {
    number: '05',
    title: 'Realisierung',
    description: 'Serielle Vorfertigung in der Halle, Montage vor Ort in wenigen Tagen',
    icon: Hammer,
  },
  {
    number: '06',
    title: 'Übergabe',
    description: 'Schlüsselübergabe und Einzug – weniger als sechs Monate Gesamtprojekt',
    icon: KeyRound,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

// SVG connecting line that draws itself
function AnimatedConnectingLine({ width }: { width: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <svg
      ref={ref}
      width={width}
      height="2"
      viewBox={`0 0 ${width} 2`}
      className="absolute top-[44px] left-0 right-0 pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <motion.line
        x1="0"
        y1="1"
        x2={width}
        y2="1"
        stroke="url(#goldGradient)"
        strokeWidth="1"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#c9a96e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c9a96e" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Progress dots along timeline
function ProgressDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className="hidden lg:flex items-center justify-center gap-8 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          className="relative"
        >
          <div
            className="w-2 h-2 rounded-full transition-all duration-500"
            style={{
              backgroundColor: i <= activeIndex ? '#c9a96e' : 'rgba(201, 169, 110, 0.15)',
              boxShadow: i <= activeIndex ? '0 0 8px rgba(201, 169, 110, 0.4)' : 'none',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Der Weg zu Ihrem Zuhause
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            So funktioniert<span className="text-gradient-gold">&apos;s</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-xl mx-auto mt-4">
            In sechs Schritten zu Ihrem modularen Zuhause – von der Idee bis zum Einzug.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Desktop: Horizontal timeline with animated SVG line */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="hidden lg:block relative"
        >
          <div className="grid grid-cols-3 gap-8 mb-8 relative">
            {/* Animated connecting line row 1 */}
            <div className="absolute top-[44px] left-[16%] right-[16%] h-[1px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                className="w-full h-full bg-gradient-to-r from-[#c9a96e]/20 via-[#c9a96e]/40 to-[#c9a96e]/20 origin-center"
              />
            </div>
            {steps.slice(0, 3).map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative mb-6">
                    <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center border border-[#c9a96e]/20 bg-[#0f0f20] transition-all duration-500 group-hover:border-[#c9a96e]/50 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.15)]">
                      <Icon size={28} className="text-[#c9a96e] icon-bounce" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#c9a96e] flex items-center justify-center step-number-rotate">
                      <span className="text-[10px] font-bold text-[#0a0a14] tracking-wider">{step.number}</span>
                    </div>
                    {/* Progress dot indicator */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.8 + i * 0.15 }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#c9a96e]/40"
                    />
                  </div>
                  <h3 className="text-lg font-medium tracking-wide text-white mb-2 group-hover:text-[#c9a96e] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#8888a8] leading-relaxed max-w-[220px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-8 relative">
            {/* Animated connecting line row 2 */}
            <div className="absolute top-[44px] left-[16%] right-[16%] h-[1px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 1.0, ease: 'easeOut' }}
                className="w-full h-full bg-gradient-to-r from-[#c9a96e]/20 via-[#c9a96e]/40 to-[#c9a96e]/20 origin-center"
              />
            </div>
            {steps.slice(3, 6).map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative mb-6">
                    <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center border border-[#c9a96e]/20 bg-[#0f0f20] transition-all duration-500 group-hover:border-[#c9a96e]/50 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.15)]">
                      <Icon size={28} className="text-[#c9a96e] icon-bounce" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#c9a96e] flex items-center justify-center step-number-rotate">
                      <span className="text-[10px] font-bold text-[#0a0a14] tracking-wider">{step.number}</span>
                    </div>
                    {/* Progress dot indicator */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 1.3 + i * 0.15 }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#c9a96e]/40"
                    />
                  </div>
                  <h3 className="text-lg font-medium tracking-wide text-white mb-2 group-hover:text-[#c9a96e] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#8888a8] leading-relaxed max-w-[220px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Progress dots */}
          <ProgressDots count={6} activeIndex={sectionInView ? 5 : -1} />
        </motion.div>

        {/* Mobile/Tablet: Vertical timeline with numbered step indicators */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="lg:hidden relative"
        >
          {/* Animated vertical connecting line */}
          <div className="absolute left-[43px] top-0 bottom-0 w-[1px]">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-full h-full bg-gradient-to-b from-[#c9a96e]/30 via-[#c9a96e]/50 to-[#c9a96e]/30 origin-top"
            />
          </div>
          <div className="flex flex-col gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className="flex gap-5 items-start group"
                >
                  <div className="relative shrink-0">
                    <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center border border-[#c9a96e]/20 bg-[#0f0f20] transition-all duration-500 group-hover:border-[#c9a96e]/50 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.15)]">
                      <Icon size={24} className="text-[#c9a96e] icon-bounce" />
                    </div>
                    {/* Numbered step indicator with rotate on hover */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#c9a96e] flex items-center justify-center step-number-rotate">
                      <span className="text-[10px] font-bold text-[#0a0a14] tracking-wider">{step.number}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-lg font-medium tracking-wide text-white mb-2 group-hover:text-[#c9a96e] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#8888a8] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
