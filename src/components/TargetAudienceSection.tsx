'use client';

import { motion } from 'framer-motion';
import { Building2, User, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const audiences = [
  {
    icon: Building2,
    title: 'Kommunen',
    description:
      'Schnelle Schaffung von Wohnraum für Bürger. Ferienwohnungen, Saisonarbeiterunterkünfte oder temporäre Unterkünfte – flexibel und genehmigungsfähig nach Landesbauordnung.',
    accent: '#c9a96e',
  },
  {
    icon: User,
    title: 'Eigentümer',
    description:
      'Pacht, Kauf oder individuelle Kombination. Fassade, Dachform, Farben und Materialien auf Ortsbild und Standort abgestimmt. Erweiterbar und versetzbar.',
    accent: '#4aff9e',
  },
  {
    icon: Shield,
    title: 'Bundeswehr',
    description:
      'Robuste, schnell aufbaubare Unterkünfte für militärische Standorte. Dauerhaft oder zeitlich befristete Lösungen, serielle Vorfertigung für kurze Realisierungszeiten.',
    accent: '#4a9eff',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export default function TargetAudienceSection() {
  return (
    <section id="target-audience" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            Zielgruppen
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Für <span className="text-gradient-gold">wen</span> wir bauen
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Modulare Wohnlösungen für Kommunen, Eigentümer und die Bundeswehr.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {audiences.map((audience) => {
            const Icon = audience.icon;
            return (
              <motion.div key={audience.title} variants={cardVariants}>
                <Card className="group hover-lift bg-[#12121f]/60 border border-white/5 hover:border-white/10 transition-all duration-500 rounded-lg overflow-hidden h-full">
                  <div className="p-6 sm:p-8">
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110"
                      style={{
                        backgroundColor: `${audience.accent}15`,
                        border: `1px solid ${audience.accent}30`,
                      }}
                    >
                      <Icon
                        size={26}
                        className="transition-colors duration-500"
                        style={{ color: audience.accent }}
                      />
                    </div>
                    <h3 className="text-xl font-medium tracking-wide text-white mb-3">
                      {audience.title}
                    </h3>
                    <p className="text-sm text-[#8888a8] leading-relaxed">
                      {audience.description}
                    </p>
                    <div
                      className="w-0 h-[2px] mt-6 transition-all duration-500 group-hover:w-full"
                      style={{
                        background: `linear-gradient(to right, ${audience.accent}, transparent)`,
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
