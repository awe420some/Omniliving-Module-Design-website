'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Expand, Leaf, Recycle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

const featureKeys = [
  {
    icon: Zap,
    titleKey: 'features.fast',
    descKey: 'features.fast.desc',
    accent: '#c9a96e',
  },
  {
    icon: ShieldCheck,
    titleKey: 'features.permitted',
    descKey: 'features.permitted.desc',
    accent: '#4aff9e',
  },
  {
    icon: Expand,
    titleKey: 'features.expandable',
    descKey: 'features.expandable.desc',
    accent: '#4a9eff',
  },
  {
    icon: Leaf,
    titleKey: 'features.energy',
    descKey: 'features.energy.desc',
    accent: '#4aff9e',
  },
  {
    icon: Recycle,
    titleKey: 'features.sustainable',
    descKey: 'features.sustainable.desc',
    accent: '#c9a96e',
  },
  {
    icon: Clock,
    titleKey: 'features.flexible',
    descKey: 'features.flexible.desc',
    accent: '#ff6b4a',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// 3D tilt card wrapper
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: 'transform 0.2s ease-out' }}
    >
      {children}
    </div>
  );
}

export default function FeaturesSection() {
  const { t } = useTranslation();
  return (
    <section id="features" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      {/* Diagonal line pattern overlay */}
      <div className="absolute inset-0 diagonal-lines pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header with animated line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mb-4 origin-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4"
          >
            {t('features.label')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4"
          >
            {t('features.title')} <span className="text-gradient-gold">{t('features.titleAccent')}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4"
          >
            {t('features.subtitle')}
          </motion.p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {featureKeys.map((feature, index) => {
            const Icon = feature.icon;
            const badgeNumber = String(index + 1).padStart(2, '0');
            return (
              <motion.div key={feature.titleKey} variants={cardVariants}>
                <TiltCard>
                  <Card className="group bg-[#12121f]/60 border border-white/5 hover:border-[#c9a96e]/20 transition-all duration-500 rounded-lg overflow-hidden h-full shimmer-sweep feature-card-glow hover:shadow-[0_16px_50px_rgba(0,0,0,0.4),0_0_20px_rgba(201,169,110,0.06)] relative">
                    {/* Numbered badge */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-[#0a0a14]/50 group-hover:border-[#c9a96e]/30 group-hover:bg-[#c9a96e]/10 transition-all duration-500">
                      <span className="text-[10px] font-medium text-[#8888a8] group-hover:text-[#c9a96e] tracking-wider transition-colors duration-300">
                        {badgeNumber}
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 relative overflow-hidden">
                      {/* Animated icon background (subtle rotating gradient) */}
                      <div
                        className="icon-animated-bg w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-125 group-hover:-rotate-6 relative"
                        style={{
                          backgroundColor: `${feature.accent}15`,
                          border: `1px solid ${feature.accent}30`,
                        }}
                      >
                        <Icon
                          size={22}
                          className="transition-all duration-500 relative z-10 group-hover:scale-110 group-hover:-rotate-12"
                          style={{ color: feature.accent }}
                        />
                      </div>
                      <h3 className="text-lg font-medium tracking-wide text-white mb-3 group-hover:text-[#dbb980] transition-colors duration-300">
                        {t(feature.titleKey)}
                      </h3>
                      <p className="text-sm text-[#8888a8] leading-relaxed">
                        {t(feature.descKey)}
                      </p>
                      {/* Progress bar at bottom of card that fills on hover */}
                      <div className="mt-6 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full w-0 group-hover:w-full transition-all duration-700 rounded-full"
                          style={{
                            background: `linear-gradient(to right, ${feature.accent}, ${feature.accent}60)`,
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
