'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Expand, Leaf, Recycle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: Zap,
    title: 'Schnell realisiert',
    description:
      'Bis zu 70% kürzere Bauzeiten durch serielle Vorfertigung in der Halle. Montage vor Ort in wenigen Tagen.',
    accent: '#c9a96e',
  },
  {
    icon: ShieldCheck,
    title: 'Genehmigungsfähig',
    description:
      'Genehmigungsfähig nach Landesbauordnung. Weniger als sechs Monate von Planung bis Einzug.',
    accent: '#4aff9e',
  },
  {
    icon: Expand,
    title: 'Erweiterbar',
    description:
      'Modul anbauen oder versetzen – flexible Erweiterbarkeit für wachsende Anforderungen.',
    accent: '#4a9eff',
  },
  {
    icon: Leaf,
    title: 'Energieeffizient',
    description:
      'Hohe Energieeffizienz durch modernste Dämmung und Bautechnik. CO₂-neutral wohnen.',
    accent: '#4aff9e',
  },
  {
    icon: Recycle,
    title: 'Nachhaltig',
    description:
      'Wiederverwendbarkeit der Module. Nachhaltiges Bauen mit minimaler Ressourcenverschwendung.',
    accent: '#c9a96e',
  },
  {
    icon: Clock,
    title: 'Flexibel einsetzbar',
    description:
      'Dauerhaft als Gebäude oder zeitlich befristete Lösung. Ferienwohnungen, Seniorenwohnen, und mehr.',
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
  return (
    <section id="features" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      {/* Diagonal line pattern overlay */}
      <div className="absolute inset-0 diagonal-lines pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Vorteile
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Warum <span className="text-gradient-gold">Omniliving</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Modulare Bauweise, die überzeugt – schnell, nachhaltig und flexibel.
          </p>
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
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <TiltCard>
                  <Card className="group bg-[#12121f]/60 border border-white/5 hover:border-white/10 transition-all duration-500 rounded-lg overflow-hidden h-full hover:shadow-[0_16px_50px_rgba(0,0,0,0.4),0_0_20px_rgba(201,169,110,0.06)]">
                    <div className="p-6 sm:p-8 relative overflow-hidden">
                      {/* Animated icon background (subtle rotating gradient) */}
                      <div
                        className="icon-animated-bg w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 relative"
                        style={{
                          backgroundColor: `${feature.accent}15`,
                          border: `1px solid ${feature.accent}30`,
                        }}
                      >
                        <Icon
                          size={22}
                          className="transition-colors duration-500 relative z-10"
                          style={{ color: feature.accent }}
                        />
                      </div>
                      <h3 className="text-lg font-medium tracking-wide text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#8888a8] leading-relaxed">
                        {feature.description}
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
