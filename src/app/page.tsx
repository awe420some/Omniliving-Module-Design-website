'use client';

import dynamic from 'next/dynamic';
import NavigationBar from '@/components/NavigationBar';
import HeroSection from '@/components/HeroSection';
import ConfiguratorSection from '@/components/ConfiguratorSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import ProcessSection from '@/components/ProcessSection';
import ContactSection from '@/components/ContactSection';
import TargetAudienceSection from '@/components/TargetAudienceSection';
import GallerySection from '@/components/GallerySection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import LoadingScreen from '@/components/LoadingScreen';
import BackToTopButton from '@/components/BackToTopButton';
import { Phone, Mail, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';

// Dynamic import for ScrollExperience (uses GSAP ScrollTrigger)
const ScrollExperience = dynamic(() => import('@/components/ScrollExperience'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#0a0a14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
        <span className="text-xs text-[#8888a8] tracking-wider">3D-Erfahrung wird geladen...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen flex flex-col bg-[#0a0a14]">
        {/* Navigation Bar */}
        <NavigationBar />

        {/* Hero Section with 3D Canvas */}
        <HeroSection />

        {/* Scroll-driven 3D Building Experience */}
        <div id="scroll-experience">
          <ScrollExperience />
        </div>

        {/* Module Configurator */}
        <ConfiguratorSection />

        {/* Target Audiences */}
        <TargetAudienceSection />

        {/* Stats with Real Data */}
        <StatsSection />

        {/* Process with 6 Steps */}
        <ProcessSection />

        {/* Features with 6 Real Features */}
        <FeaturesSection />

        {/* Gallery */}
        <GallerySection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* FAQ */}
        <FAQSection />

        {/* Contact with REAL Data */}
        <ContactSection />

        {/* Footer with REAL Data */}
        <footer id="footer-section" className="relative bg-[#060610] border-t border-white/5 mt-auto">
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
                  Modulare Wohnungen für Kommunen & Eigentümer. Nachhaltig, flexibel und
                  schnell realisiert – bis zu 70% kürzere Bauzeiten.
                </p>
              </div>

              {/* Contact - REAL DATA */}
              <div>
                <h4 className="text-sm font-medium tracking-[0.15em] text-white uppercase mb-5">
                  Kontakt
                </h4>
                <div className="flex flex-col gap-4">
                  <a
                    href="tel:+4915129530369"
                    className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300"
                  >
                    <Phone size={16} className="text-[#c9a96e]" />
                    +49 151 29530369
                  </a>
                  <a
                    href="mailto:kontakt@omniliving-moduledesign-gmbh.com"
                    className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300"
                  >
                    <Mail size={16} className="text-[#c9a96e]" />
                    kontakt@omniliving-moduledesign-gmbh.com
                  </a>
                  <div className="flex items-start gap-3 text-sm text-[#8888a8]">
                    <MapPin size={16} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span>
                      Teutoburger Straße 23 a
                      <br />
                      33330 Gütersloh, Deutschland
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
                    { label: 'Konfigurator', href: '#configurator' },
                    { label: 'Entdecken', href: '#scroll-experience' },
                    { label: 'Vorteile', href: '#features' },
                    { label: 'Referenzen', href: '#testimonials' },
                    { label: 'FAQ', href: '#faq' },
                    { label: 'Kontakt', href: '#contact' },
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
                {/* Social Media */}
                <h4 className="text-sm font-medium tracking-[0.15em] text-white uppercase mb-4 mt-8">
                  Folgen Sie uns
                </h4>
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center hover:border-[#c9a96e]/30 hover:bg-[#1a1a2e] transition-all duration-300 group"
                  >
                    <Instagram size={16} className="text-[#8888a8] group-hover:text-[#c9a96e] transition-colors" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center hover:border-[#c9a96e]/30 hover:bg-[#1a1a2e] transition-all duration-300 group"
                  >
                    <Linkedin size={16} className="text-[#8888a8] group-hover:text-[#c9a96e] transition-colors" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center hover:border-[#c9a96e]/30 hover:bg-[#1a1a2e] transition-all duration-300 group"
                  >
                    <Facebook size={16} className="text-[#8888a8] group-hover:text-[#c9a96e] transition-colors" />
                  </a>
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

        {/* Back to Top Button */}
        <BackToTopButton />
      </div>
    </>
  );
}
