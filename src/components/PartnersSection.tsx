'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

interface Partner {
  name: string;
  initials: string;
  tagline: string;
}

const partnerKeys = [
  { name: 'Stahlwerk GmbH', initials: 'SW', taglineKey: 'partners.tagline1' },
  { name: 'GreenEnergy AG', initials: 'GE', taglineKey: 'partners.tagline2' },
  { name: 'ModulTech Solutions', initials: 'MT', taglineKey: 'partners.tagline3' },
  { name: 'BauVision Partner', initials: 'BV', taglineKey: 'partners.tagline4' },
  { name: 'EcoInstall GmbH', initials: 'EI', taglineKey: 'partners.tagline5' },
  { name: 'LieferKette Logistics', initials: 'LK', taglineKey: 'partners.tagline6' },
];

function PartnerLogo({ partner, index, t }: { partner: typeof partnerKeys[number]; index: number; t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col items-center"
    >
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#2D4A3E]/60 border border-white/5 flex flex-col items-center justify-center gap-1 px-3 transition-all duration-500 group-hover:border-[#C3F8BD]/30 group-hover:bg-[#2D4A3E]/80 group-hover:shadow-lg group-hover:shadow-[#C3F8BD]/5 cursor-pointer">
        {/* Initials badge */}
        <span className="text-xs font-bold tracking-[0.25em] text-[#D4C5A0] group-hover:text-[#C3F8BD] transition-colors duration-500 uppercase">
          {partner.initials}
        </span>
        {/* Full name */}
        <span className="text-[10px] sm:text-[11px] text-white/60 group-hover:text-white transition-colors duration-500 text-center font-light tracking-wide leading-tight">
          {partner.name}
        </span>
        {/* Gold accent line */}
        <div className="w-6 h-[1px] bg-[#D4C5A0]/30 group-hover:bg-[#C3F8BD]/60 transition-colors duration-500 mt-1" />
      </div>
      <p className="text-xs text-[#D4C5A0] mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {t(partner.taglineKey)}
      </p>
    </motion.div>
  );
}

export default function PartnersSection() {
  const { t } = useTranslation();
  return (
    <section id="partners" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#1E3429]">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3F8BD]/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-[#C3F8BD] uppercase mb-4">
            {t('partners.label').toUpperCase()}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('partners.title').split(t('partners.titleAccent'))[0]}<span className="text-gradient-gold">{t('partners.titleAccent')}</span>{t('partners.title').split(t('partners.titleAccent'))[1]}
          </h2>
          <p className="text-sm sm:text-base text-[#D4C5A0] max-w-2xl mx-auto mt-4">
            {t('partners.descFull')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C3F8BD] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Partners grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {partnerKeys.map((partner, index) => (
            <PartnerLogo key={partner.name} partner={partner} index={index} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
