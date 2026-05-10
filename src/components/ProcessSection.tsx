'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageSquare, Search, PenTool, Wallet, Hammer, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ProcessStep {
  number: string;
  titleKey: string;
  descKey: string;
  tooltipKey: string;
  icon: LucideIcon;
}

const steps: ProcessStep[] = [
  {
    number: '01',
    titleKey: 'process.step1',
    descKey: 'process.step1Desc',
    tooltipKey: 'process.step1Tooltip',
    icon: MessageSquare,
  },
  {
    number: '02',
    titleKey: 'process.step2',
    descKey: 'process.step2Desc',
    tooltipKey: 'process.step2Tooltip',
    icon: Search,
  },
  {
    number: '03',
    titleKey: 'process.step3',
    descKey: 'process.step3Desc',
    tooltipKey: 'process.step3Tooltip',
    icon: PenTool,
  },
  {
    number: '04',
    titleKey: 'process.step4',
    descKey: 'process.step4Desc',
    tooltipKey: 'process.step4Tooltip',
    icon: Wallet,
  },
  {
    number: '05',
    titleKey: 'process.step5',
    descKey: 'process.step5Desc',
    tooltipKey: 'process.step5Tooltip',
    icon: Hammer,
  },
  {
    number: '06',
    titleKey: 'process.step6',
    descKey: 'process.step6Desc',
    tooltipKey: 'process.step6Tooltip',
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

// Step card component with tooltip and highlight
function StepCard({
  step,
  index,
  isCurrent,
}: {
  step: ProcessStep;
  index: number;
  isCurrent: boolean;
}) {
  const { t } = useTranslation();
  const Icon = step.icon;

  return (
    <motion.div
      key={step.number}
      variants={stepVariants}
      className="flex flex-col items-center text-center group relative"
    >
      {/* Tooltip on hover */}
      <div className="process-tooltip">
        {t(step.tooltipKey)}
      </div>

      <div className="relative mb-6">
        <div
          className={`w-[88px] h-[88px] rounded-full flex items-center justify-center border bg-omni-forest-deep transition-all duration-500 ${
            isCurrent
              ? 'border-omni-mint/60 shadow-[0_0_30px_rgba(195, 248, 189,0.2)] current-step-ring'
              : 'border-omni-mint/20 group-hover:border-omni-mint/50 group-hover:shadow-[0_0_30px_rgba(195, 248, 189,0.15)]'
          }`}
        >
          <Icon size={28} className="text-omni-mint icon-bounce" />
        </div>
        <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center step-number-rotate ${
          isCurrent ? 'bg-omni-mint-soft' : 'bg-omni-mint'
        }`}>
          <span className="text-[10px] font-bold text-omni-forest-deep tracking-wider">{step.number}</span>
        </div>
        {/* Progress dot indicator */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.8 + index * 0.15 }}
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
            isCurrent ? 'bg-omni-mint' : 'bg-omni-mint/40'
          }`}
        />
      </div>
      <h3 className={`text-lg font-medium tracking-wide mb-2 transition-colors duration-300 ${
        isCurrent ? 'text-omni-mint' : 'text-white group-hover:text-omni-mint'
      }`}>
        {step.titleKey ? t(step.titleKey) : ''}
      </h3>
      <p className="text-sm text-omni-cream leading-relaxed max-w-[220px]">
        {t(step.descKey)}
      </p>
    </motion.div>
  );
}

export default function ProcessSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-omni-forest-deep dot-pattern"
    >
      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="text-xs tracking-[0.3em] text-omni-mint uppercase mb-4">
            {t('process.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('process.title').replace("'s", '')}<span className="text-gradient-gold">&apos;s</span>
          </h2>
          <p className="text-sm sm:text-base text-omni-cream max-w-xl mx-auto mt-4">
            {t('process.subtitle')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-omni-mint to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Desktop: Horizontal timeline with animated SVG line */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="hidden lg:block relative"
        >
          <div
            className="grid grid-cols-3 gap-8 mb-8 relative"
            onMouseLeave={() => setHoveredStep(null)}
          >
            {/* Animated connecting line row 1 - glowing */}
            <div className="absolute top-[44px] left-[16%] right-[16%] h-[2px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                className="w-full h-full bg-gradient-to-r from-omni-mint/20 via-omni-mint/40 to-omni-mint/20 origin-center timeline-glow"
              />
            </div>
            {steps.slice(0, 3).map((step, i) => (
              <div
                key={step.number}
                onMouseEnter={() => setHoveredStep(i)}
              >
                <StepCard
                  step={step}
                  index={i}
                  isCurrent={hoveredStep === i}
                />
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-3 gap-8 relative"
            onMouseLeave={() => setHoveredStep(null)}
          >
            {/* Animated connecting line row 2 - glowing */}
            <div className="absolute top-[44px] left-[16%] right-[16%] h-[2px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 1.0, ease: 'easeOut' }}
                className="w-full h-full bg-gradient-to-r from-omni-mint/20 via-omni-mint/40 to-omni-mint/20 origin-center timeline-glow"
              />
            </div>
            {steps.slice(3, 6).map((step, i) => (
              <div
                key={step.number}
                onMouseEnter={() => setHoveredStep(i + 3)}
              >
                <StepCard
                  step={step}
                  index={i + 3}
                  isCurrent={hoveredStep === i + 3}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile/Tablet: Vertical timeline with numbered step indicators */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="lg:hidden relative"
        >
          {/* Animated vertical connecting line - glowing */}
          <div className="absolute left-[43px] top-0 bottom-0 w-[2px]">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-full h-full bg-gradient-to-b from-omni-mint/30 via-omni-mint/50 to-omni-mint/30 origin-top timeline-glow"
            />
          </div>
          <div className="flex flex-col gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isCurrent = hoveredStep === i;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className="flex gap-5 items-start group relative"
                  onMouseEnter={() => setHoveredStep(i)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-[80px] h-[80px] rounded-full flex items-center justify-center border bg-omni-forest-deep transition-all duration-500 ${
                        isCurrent
                          ? 'border-omni-mint/60 shadow-[0_0_30px_rgba(195, 248, 189,0.2)] current-step-ring'
                          : 'border-omni-mint/20 group-hover:border-omni-mint/50 group-hover:shadow-[0_0_30px_rgba(195, 248, 189,0.15)]'
                      }`}
                    >
                      <Icon size={24} className="text-omni-mint icon-bounce" />
                    </div>
                    {/* Numbered step indicator with rotate on hover */}
                    <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center step-number-rotate ${
                      isCurrent ? 'bg-omni-mint-soft' : 'bg-omni-mint'
                    }`}>
                      <span className="text-[10px] font-bold text-omni-forest-deep tracking-wider">{step.number}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className={`text-lg font-medium tracking-wide mb-2 transition-colors duration-300 ${
                      isCurrent ? 'text-omni-mint' : 'text-white group-hover:text-omni-mint'
                    }`}>
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-sm text-omni-cream leading-relaxed">
                      {t(step.descKey)}
                    </p>
                    <p className="text-[10px] text-omni-mint/50 mt-1 tracking-wider">
                      {t(step.tooltipKey)}
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
