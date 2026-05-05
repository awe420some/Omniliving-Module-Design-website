'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Recycle, Building, Award } from 'lucide-react';

interface StatItem {
  icon: typeof Leaf;
  label: string;
  value: number;
  suffix: string;
  description: string;
  color: string;
}

const STATS: StatItem[] = [
  {
    icon: Leaf,
    label: 'CO₂ Neutral',
    value: 100,
    suffix: '%',
    description: 'Kohlenstoffneutraler Bau und Betrieb aller Module',
    color: '#22c55e',
  },
  {
    icon: Recycle,
    label: 'Weniger Bauabfall',
    value: 70,
    suffix: '%',
    description: 'Reduzierung von Bauabfall durch Vorfertigung im Werk',
    color: '#4ade80',
  },
  {
    icon: Building,
    label: 'Recyclebar',
    value: 95,
    suffix: '%',
    description: 'Der verwendeten Materialien sind wiederverwertbar',
    color: '#86efac',
  },
  {
    icon: Award,
    label: 'DGNB-zertifiziert',
    value: 100,
    suffix: '%',
    description: 'Entspricht den höchsten Nachhaltigkeitsstandards',
    color: '#c9a96e',
  },
];

function CircularProgress({
  value,
  color,
  suffix,
  inView,
}: {
  value: number;
  color: string;
  suffix: string;
  inView: boolean;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setAnimatedValue(start);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [inView, value]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-light text-white tabular-nums">
          {animatedValue}
        </span>
        <span className="text-xs text-[#8888a8]">{suffix}</span>
      </div>
    </div>
  );
}

export default function SustainabilitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section
      id="sustainability"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Green-tinted gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a10] via-[#0a0a14] to-[#0a0a14]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_70%)]" />

      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-green-400 uppercase mb-4">
            NACHHALTIGKEIT
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Bauen für die <span className="text-gradient-gold">Zukunft</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Nachhaltigkeit ist kein Trend – es ist unser Fundament. Jedes Modul wird
            ressourcenschonend gefertigt und ist vollständig recyclebar.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group"
              >
                <div className="bg-[#12121f]/40 border border-white/5 rounded-xl p-6 text-center hover:border-green-500/20 hover:bg-[#12121f]/60 transition-all duration-500">
                  {/* Icon */}
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon size={20} style={{ color: stat.color }} />
                    </div>
                  </div>

                  {/* Circular progress */}
                  <CircularProgress
                    value={stat.value}
                    color={stat.color}
                    suffix={stat.suffix}
                    inView={inView}
                  />

                  {/* Label */}
                  <h3 className="text-base sm:text-lg font-light text-white mt-4 tracking-wide">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-[#8888a8] mt-2 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[#8888a8] max-w-xl mx-auto">
            Modulbauweise reduziert den ökologischen Fußabdruck erheblich im Vergleich zur
            konventionellen Bauweise – bei gleicher oder besserer Qualität.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
