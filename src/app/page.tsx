'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SmoothScroll from '@/components/SmoothScroll';
import HeroSection from '@/components/HeroSection';
import ModuleSelector from '@/components/ModuleSelector';
import FeaturesSection from '@/components/FeaturesSection';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

// Dynamic imports for Three.js components (SSR disabled)
const ContainerScene = dynamic(() => import('@/components/ContainerScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-[#0a0a14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
        <span className="text-xs text-[#8888a8] tracking-wider">3D-Szene wird geladen...</span>
      </div>
    </div>
  ),
});

const RevealScene = dynamic(() => import('@/components/RevealScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-[#0a0a14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
        <span className="text-xs text-[#8888a8] tracking-wider">Shader wird geladen...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isAssembling, setIsAssembling] = useState(false);
  const [hasAssembled, setHasAssembled] = useState(false);

  const handleToggleModule = useCallback((moduleId: string) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        setIsAssembling(false);
        setHasAssembled(false);
        return prev.filter((id) => id !== moduleId);
      }
      return [...prev, moduleId];
    });
  }, []);

  const handleAssemble = useCallback(() => {
    setIsAssembling(true);
    setTimeout(() => {
      setHasAssembled(true);
    }, 2000);
  }, []);

  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-[#0a0a14]">
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Module Selector with 3D Scene */}
        <section
          id="module-selector"
          className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
                Konfigurator
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
                Ihr <span className="text-gradient-gold">modulares</span> Zuhause
              </h2>
              <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
                Wählen Sie Ihre Module und sehen Sie, wie sie sich zu einem einzigartigen
                Wohnraum zusammenfügen.
              </p>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
            </motion.div>

            {/* 3D Scene + Module selector layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
              {/* 3D Container Scene */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-3 h-[400px] sm:h-[500px] lg:h-[550px] rounded-lg overflow-hidden border border-white/5 bg-[#0a0a14]"
              >
                <ContainerScene
                  selectedModules={selectedModules}
                  isAssembling={isAssembling}
                  onModuleClick={handleToggleModule}
                />
              </motion.div>

              {/* Module Selector Cards */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:col-span-2 h-[400px] sm:h-[500px] lg:h-[550px] overflow-y-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(201, 169, 110, 0.3) transparent',
                }}
              >
                <ModuleSelector
                  selectedModules={selectedModules}
                  onToggleModule={handleToggleModule}
                  onAssemble={handleAssemble}
                  isAssembling={isAssembling}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3: 3D Living Unit with Shader Reveal */}
        <section id="reveal" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
                Entdecken
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
                Blick <span className="text-gradient-gold">hinter die Fassade</span>
              </h2>
              <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
                Entdecken Sie das warme, einladende Interieur hinter der kühlen Metallfassade.
              </p>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
            </motion.div>

            {/* 3D Reveal Scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-[350px] sm:h-[450px] md:h-[550px] rounded-lg overflow-hidden border border-white/5 bg-[#0a0a14] relative"
            >
              <RevealScene />
            </motion.div>

            {/* Interior preview thumbnails */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6"
            >
              {[
                { src: '/images/interior-1.png', label: 'Wohnbereich' },
                { src: '/images/interior-bedroom.png', label: 'Schlafzimmer' },
                { src: '/images/interior-kitchen.png', label: 'Küche' },
                { src: '/images/interior-bathroom.png', label: 'Badzimmer' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="relative group overflow-hidden rounded-lg aspect-[4/3] border border-white/5"
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-xs tracking-wider text-[#c9a96e] uppercase">
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Section 4: Features */}
        <FeaturesSection />

        {/* Section 5: Contact / Footer */}
        <footer className="relative bg-[#060610] border-t border-white/5 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/images/logo-omniliving.png"
                    alt="Omniliving Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <h3 className="text-lg font-light tracking-[0.15em] text-white">
                      OMNILIVING
                    </h3>
                    <p className="text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase">
                      Module Design GmbH
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#8888a8] leading-relaxed mt-4">
                  Modulare Containerhäuser in Premium-Qualität. Nachhaltig, flexibel und
                  schnell aufgebaut – Ihr individuelles Zuhause.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-medium tracking-[0.15em] text-white uppercase mb-5">
                  Kontakt
                </h4>
                <div className="flex flex-col gap-4">
                  <a
                    href="tel:+4930123456789"
                    className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300"
                  >
                    <Phone size={16} className="text-[#c9a96e]" />
                    +49 30 123 456 789
                  </a>
                  <a
                    href="mailto:info@omniliving.de"
                    className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300"
                  >
                    <Mail size={16} className="text-[#c9a96e]" />
                    info@omniliving.de
                  </a>
                  <div className="flex items-start gap-3 text-sm text-[#8888a8]">
                    <MapPin size={16} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span>
                      Musterstraße 42
                      <br />
                      10115 Berlin, Deutschland
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-sm font-medium tracking-[0.15em] text-white uppercase mb-5">
                  Navigation
                </h4>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Home', href: '#hero' },
                    { label: 'Konfigurator', href: '#module-selector' },
                    { label: 'Entdecken', href: '#reveal' },
                    { label: 'Vorteile', href: '#features' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300 tracking-wide"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-[#8888a8] tracking-wide">
                © {new Date().getFullYear()} Omniliving Module Design GmbH. Alle Rechte
                vorbehalten.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="text-xs text-[#8888a8] hover:text-[#c9a96e] transition-colors tracking-wide"
                >
                  Impressum
                </a>
                <a
                  href="#"
                  className="text-xs text-[#8888a8] hover:text-[#c9a96e] transition-colors tracking-wide"
                >
                  Datenschutz
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
