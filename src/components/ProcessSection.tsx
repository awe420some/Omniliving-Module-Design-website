'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Settings, Factory, Key } from 'lucide-react';
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
    title: 'Beratung',
    description: 'Wir besprechen Ihre Wünsche und Anforderungen',
    icon: MessageSquare,
  },
  {
    number: '02',
    title: 'Konfiguration',
    description: 'Wählen Sie Module und gestalten Sie Ihr Zuhause',
    icon: Settings,
  },
  {
    number: '03',
    title: 'Produktion',
    description: 'Ihr Zuhause wird präzise vorgefertigt',
    icon: Factory,
  },
  {
    number: '04',
    title: 'Bezug',
    description: 'Schlüsselübergabe und Einzug in Ihr neues Zuhause',
    icon: Key,
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

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export default function ProcessSection() {
  return (
    <section id="process" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
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
            In vier einfachen Schritten zu Ihrem modularen Traumhaus.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Desktop: Horizontal timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="hidden lg:block relative"
        >
          {/* Horizontal connecting line */}
          <div className="absolute top-[72px] left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-[#c9a96e]/20 via-[#c9a96e]/40 to-[#c9a96e]/20" />

          <div className="grid grid-cols-4 gap-6 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon circle */}
                  <div className="relative mb-6">
                    <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center border border-[#c9a96e]/20 bg-[#0f0f20] transition-all duration-500 group-hover:border-[#c9a96e]/50 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.15)]">
                      <Icon
                        size={28}
                        className="text-[#c9a96e] transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#c9a96e] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#0a0a14] tracking-wider">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-medium tracking-wide text-white mb-2 group-hover:text-[#c9a96e] transition-colors duration-300">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#8888a8] leading-relaxed max-w-[220px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mobile/Tablet: Vertical timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="lg:hidden relative"
        >
          {/* Vertical connecting line */}
          <div className="absolute left-[43px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#c9a96e]/20 via-[#c9a96e]/40 to-[#c9a96e]/20" />

          <div className="flex flex-col gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className="flex gap-5 items-start group"
                >
                  {/* Icon circle */}
                  <div className="relative shrink-0">
                    <div className="w-[88px] h-[88px] sm:w-[80px] sm:h-[80px] rounded-full flex items-center justify-center border border-[#c9a96e]/20 bg-[#0f0f20] transition-all duration-500 group-hover:border-[#c9a96e]/50 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.15)]">
                      <Icon
                        size={26}
                        className="text-[#c9a96e] transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#c9a96e] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#0a0a14] tracking-wider">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Text content */}
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
