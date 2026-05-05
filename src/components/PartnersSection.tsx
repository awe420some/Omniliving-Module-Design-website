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
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#12121f]/60 border border-white/5 flex flex-col items-center justify-center transition-all duration-500 group-hover:border-[#c9a96e]/30 group-hover:bg-[#12121f]/80 group-hover:shadow-lg group-hover:shadow-[#c9a96e]/5 cursor-pointer">
        {/* Placeholder SVG logo - grayscale to color on hover */}
        <svg
          viewBox="0 0 80 80"
          className="w-14 h-14 sm:w-16 sm:h-16 transition-all duration-500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle
            cx="40"
            cy="40"
            r="32"
            className="stroke-[#8888a8] group-hover:stroke-[#c9a96e] transition-all duration-500"
            strokeWidth="2"
            fill="none"
          />
          {/* Inner shape */}
          <rect
            x="24"
            y="24"
            width="32"
            height="32"
            rx="4"
            className="fill-[#8888a8]/20 group-hover:fill-[#c9a96e]/20 transition-all duration-500"
          />
          {/* Initials */}
          <text
            x="40"
            y="44"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#8888a8] group-hover:fill-[#c9a96e] transition-all duration-500"
            fontSize="14"
            fontWeight="300"
            letterSpacing="2"
          >
            {partner.initials}
          </text>
          {/* Decorative accent */}
          <line
            x1="28"
            y1="52"
            x2="52"
            y2="52"
            className="stroke-[#8888a8]/30 group-hover:stroke-[#c9a96e]/50 transition-all duration-500"
            strokeWidth="1"
          />
        </svg>
      </div>
      <p className="text-sm text-white mt-3 tracking-wide font-light text-center">
        {partner.name}
      </p>
      <p className="text-xs text-[#8888a8] mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {t(partner.taglineKey)}
      </p>
    </motion.div>
  );
}

export default function PartnersSection() {
  const { t } = useTranslation();
  return (
    <section id="partners" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/20 to-transparent" />

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
            {t('partners.label').toUpperCase()}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('partners.title').split(t('partners.titleAccent'))[0]}<span className="text-gradient-gold">{t('partners.titleAccent')}</span>{t('partners.title').split(t('partners.titleAccent'))[1]}
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            {t('partners.descFull')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
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
