'use client';

import { motion } from 'framer-motion';
import { Puzzle, Leaf, Zap, Gem } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: Puzzle,
    title: 'Modular Flexibel',
    description:
      'Unsere Module lassen sich frei kombinieren – vom Studio bis zum Familienhaus. Erweitern Sie jederzeit nach Bedarf.',
    accent: '#c9a96e',
  },
  {
    icon: Leaf,
    title: 'Nachhaltig',
    description:
      'Ökologische Materialien, energieeffiziente Bauweise und minimaler Fußabdruck. Bauen Sie mit Verantwortung.',
    accent: '#4aff9e',
  },
  {
    icon: Zap,
    title: 'Schnell Aufgebaut',
    description:
      'In nur wenigen Wochen bezugsfertig. Präzise Vorfertigung garantiert kürzeste Bauzeiten ohne Kompromisse.',
    accent: '#4a9eff',
  },
  {
    icon: Gem,
    title: 'Premium Qualität',
    description:
      'Hochwertigste Materialien und handwerkliche Perfektion. Jedes Detail wird mit Sorgfalt gefertigt.',
    accent: '#ff6b4a',
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Warum Omniliving
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Vorsprung durch <span className="text-gradient-gold">Innovation</span>
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <Card className="group bg-[#12121f]/60 border border-white/5 hover:border-white/10 transition-all duration-500 rounded-lg overflow-hidden h-full">
                  <div className="p-6 sm:p-8">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110"
                      style={{
                        backgroundColor: `${feature.accent}15`,
                        border: `1px solid ${feature.accent}30`,
                      }}
                    >
                      <Icon
                        size={22}
                        className="transition-colors duration-500"
                        style={{ color: feature.accent }}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium tracking-wide text-white mb-3">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-[#8888a8] leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Bottom accent line */}
                    <div
                      className="w-0 h-[2px] mt-6 transition-all duration-500 group-hover:w-full"
                      style={{
                        background: `linear-gradient(to right, ${feature.accent}, transparent)`,
                      }}
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
