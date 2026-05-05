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
import SectionDivider from '@/components/SectionDivider';
import ScrollProgress from '@/components/ScrollProgress';
import PricingCalculator from '@/components/PricingCalculator';
import CookieConsent from '@/components/CookieConsent';
import SustainabilitySection from '@/components/SustainabilitySection';
import PartnersSection from '@/components/PartnersSection';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import FloorPlanSection from '@/components/FloorPlanSection';
import VirtualTourSection from '@/components/VirtualTourSection';
import ProjectTimelineSection from '@/components/ProjectTimelineSection';
import { Phone, Mail, MapPin, Instagram, Linkedin, Facebook, ArrowUp, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

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
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const result = await response.json();

        if (response.ok) {
          toast({
            title: 'Newsletter abonniert',
            description: result.message || 'Vielen Dank! Sie erhalten bald die neuesten Updates.',
          });
          setEmail('');
        } else {
          toast({
            title: 'Hinweis',
            description: result.error || result.message || 'Ein Fehler ist aufgetreten.',
          });
        }
      } catch {
        toast({
          title: 'Fehler',
          description: 'Netzwerkfehler. Bitte versuchen Sie es später erneut.',
        });
      }
    }
  };

  return (
    <>
      <ScrollProgress />
      <LoadingScreen />
      <div className="min-h-screen flex flex-col bg-[#0a0a14]">
        {/* Navigation Bar */}
        <NavigationBar />

        {/* Hero Section with 3D Canvas */}
        <HeroSection />

        <SectionDivider variant="gradient" />

        {/* Scroll-driven 3D Building Experience */}
        <div id="scroll-experience">
          <ScrollExperience />
        </div>

        <SectionDivider variant="line" />

        {/* Module Configurator */}
        <ConfiguratorSection />

        <SectionDivider variant="dots" />

        {/* Floor Plan Viewer */}
        <FloorPlanSection />

        <SectionDivider variant="line" />

        {/* Virtual Tour / Module Explorer */}
        <VirtualTourSection />

        <SectionDivider variant="gradient" />

        {/* Target Audiences */}
        <TargetAudienceSection />

        <SectionDivider variant="gradient" />

        {/* Before/After Comparison */}
        <BeforeAfterSlider />

        <SectionDivider variant="gradient" />

        {/* Stats with Real Data */}
        <StatsSection />

        <SectionDivider variant="line" />

        {/* Sustainability */}
        <SustainabilitySection />

        <SectionDivider variant="gradient" />

        {/* Process with 6 Steps */}
        <ProcessSection />

        <SectionDivider variant="line" />

        {/* Interactive Project Timeline */}
        <ProjectTimelineSection />

        <SectionDivider variant="dots" />

        {/* Partners */}
        <PartnersSection />

        <SectionDivider variant="line" />

        {/* Features with 6 Real Features */}
        <FeaturesSection />

        <SectionDivider variant="gradient" />

        {/* Pricing Calculator */}
        <PricingCalculator />

        <SectionDivider variant="dots" />

        {/* Gallery */}
        <GallerySection />

        <SectionDivider variant="line" />

        {/* Testimonials */}
        <TestimonialsSection />

        <SectionDivider variant="dots" />

        {/* FAQ */}
        <FAQSection />

        <SectionDivider variant="gradient" />

        {/* Contact with REAL Data */}
        <ContactSection />

        {/* Footer with REAL Data and Enhanced Styling */}
        <footer id="footer-section" className="relative bg-[#060610] mt-auto geometric-border-top">
          {/* Decorative SVG pattern at top - elaborate geometric */}
          <div className="absolute -top-[60px] left-0 right-0 overflow-hidden">
            <svg
              viewBox="0 0 1440 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-[60px]"
              preserveAspectRatio="none"
            >
              <path
                d="M0 60L48 54C96 48 192 36 288 30C384 24 480 24 576 28C672 32 768 40 864 42C960 44 1056 40 1152 36C1248 32 1344 28 1392 26L1440 24V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
                fill="#060610"
              />
            </svg>
          </div>

          {/* Elaborate geometric top border */}
          <div className="absolute top-0 left-0 right-0 overflow-hidden">
            <svg width="100%" height="24" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.08]">
              <defs>
                <pattern id="geoBorder" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="12" height="12" fill="#c9a96e" />
                  <rect x="12" y="12" width="12" height="12" fill="#c9a96e" />
                </pattern>
              </defs>
              <rect width="100%" height="24" fill="url(#geoBorder)" />
            </svg>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <img
                      src="/images/logo-omniliving.png"
                      alt="Omniliving Logo"
                      className="w-10 h-10 object-contain"
                    />
                  </div>
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

                {/* Newsletter signup */}
                <div className="mt-6">
                  <p className="text-xs tracking-[0.15em] text-white uppercase mb-3">
                    Newsletter
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ihre E-Mail"
                      required
                      className="newsletter-input flex-1 px-3 py-2 rounded-md text-sm text-white placeholder:text-[#8888a8]"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-4 py-2 bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1.5"
                    >
                      <Send size={14} />
                      <span className="hidden sm:inline">Anmelden</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact - REAL DATA */}
              <div>
                <h4 className="text-sm font-medium tracking-[0.15em] text-white uppercase mb-5">
                  Kontakt
                </h4>
                <div className="flex flex-col gap-4">
                  <a
                    href="tel:+4915129530369"
                    className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300 animated-underline w-fit"
                  >
                    <Phone size={16} className="text-[#c9a96e]" />
                    +49 151 29530369
                  </a>
                  <a
                    href="mailto:kontakt@omniliving-moduledesign-gmbh.com"
                    className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300 animated-underline w-fit"
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
                    { label: 'Nachhaltigkeit', href: '#sustainability' },
                    { label: 'Kostenrechner', href: '#pricing' },
                    { label: 'Referenzen', href: '#testimonials' },
                    { label: 'FAQ', href: '#faq' },
                    { label: 'Kontakt', href: '#contact' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300 tracking-wide animated-underline w-fit"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                {/* Social Media with enhanced animated icons */}
                <h4 className="text-sm font-medium tracking-[0.15em] text-white uppercase mb-4 mt-8">
                  Folgen Sie uns
                </h4>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                  ].map((social) => {
                    const SocialIcon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="w-9 h-9 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center social-icon-hover hover:border-[#c9a96e]/30 hover:bg-[#1a1a2e] hover:shadow-[0_0_15px_rgba(201,169,110,0.15)] group"
                      >
                        <SocialIcon size={16} className="text-[#8888a8] group-hover:text-[#c9a96e] transition-colors duration-300" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Certifications Row */}
            <div className="mt-10 pt-8 border-t border-white/5">
              <p className="text-[10px] tracking-[0.2em] text-[#c9a96e]/40 uppercase mb-4 text-center">
                Zertifizierungen & Standards
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="cert-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  TÜV Geprüft
                </div>
                <div className="cert-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  DIN 18040
                </div>
                <div className="cert-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  ISO 9001
                </div>
                <div className="cert-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  DGNB
                </div>
                <div className="cert-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  EN 1090
                </div>
              </div>
            </div>

            {/* Bottom bar with animated top border */}
            <div className="mt-12 pt-8 relative">
              {/* Animated shimmer border */}
              <div className="absolute top-0 left-0 right-0 h-[1px] border-shimmer" />

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-[#8888a8] tracking-wide">
                  © {new Date().getFullYear()} Omniliving Module Design GmbH. Alle Rechte
                  vorbehalten.
                </p>
                <div className="flex items-center gap-6">
                  <a
                    href="#footer-section"
                    onClick={(e) => { e.preventDefault(); document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-xs text-[#8888a8] hover:text-[#c9a96e] transition-colors tracking-wide animated-underline"
                  >
                    Impressum
                  </a>
                  <a
                    href="#footer-section"
                    onClick={(e) => { e.preventDefault(); document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-xs text-[#8888a8] hover:text-[#c9a96e] transition-colors tracking-wide animated-underline"
                  >
                    Datenschutz
                  </a>
                  {/* Back to top button with smooth scroll */}
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs text-[#8888a8] hover:text-[#c9a96e] transition-colors tracking-wide flex items-center gap-1.5 group back-to-top-hover"
                  >
                    Nach oben
                    <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Back to Top Button */}
        <BackToTopButton />

        {/* Cookie Consent Banner */}
        <CookieConsent />
      </div>
    </>
  );
}
