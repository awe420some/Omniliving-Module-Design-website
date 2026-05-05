'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Konfigurator', href: '#configurator' },
  { label: 'Entdecken', href: '#scroll-experience' },
  { label: 'Vorteile', href: '#features' },
  { label: 'Kontakt', href: '#contact' },
];

// Magnetic hover link component with sliding underline and gold glow
function MagneticNavLink({
  label,
  href,
  isActive,
  onClick,
}: {
  label: string;
  href: string;
  isActive: boolean;
  onClick: (href: string) => void;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;
    setOffset({ x: deltaX, y: deltaY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <a
      ref={linkRef}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick(href);
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
        isActive
          ? 'active text-[#c9a96e]'
          : 'text-[#8888a8] hover:text-white'
      }`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: offset.x === 0 ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.3s' : 'transform 0.15s ease-out, color 0.3s',
        textShadow: isActive ? '0 0 12px rgba(201, 169, 110, 0.4), 0 0 24px rgba(201, 169, 110, 0.15)' : 'none',
      }}
    >
      {label}
      {/* Smooth underline animation */}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] rounded-full transition-all duration-300 ease-out"
        style={{
          width: isActive || isHovered ? '80%' : '0%',
          background: 'linear-gradient(90deg, #c9a96e, #dbb980, #c9a96e)',
          opacity: isActive || isHovered ? 1 : 0,
        }}
      />
    </a>
  );
}

export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      const progress = Math.min(scrollY / 300, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace('#', ''));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = useCallback(
    (href: string) => {
      setMobileOpen(false);
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    []
  );

  // Dynamic blur: 0px → 20px based on scroll (glass morphism)
  const blurAmount = scrollProgress * 20;
  const borderGlowOpacity = scrollProgress * 0.15;

  // Gold glow intensity when scrolling
  const goldGlowIntensity = scrollProgress * 0.2;

  // Calculate overall scroll progress for the mini indicator
  const [pageScrollPercent, setPageScrollPercent] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
      setPageScrollPercent(percent);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-gradient-border' : ''}`}
      style={{
        backgroundColor: `rgba(10, 10, 20, ${0.3 + scrollProgress * 0.65})`,
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        borderBottom: `1px solid rgba(201, 169, 110, ${borderGlowOpacity})`,
        boxShadow: scrolled
          ? `0 4px 30px rgba(0, 0, 0, ${0.2 + scrollProgress * 0.3}), 0 0 20px rgba(201, 169, 110, ${borderGlowOpacity * 0.3}), 0 0 ${goldGlowIntensity * 40}px rgba(201, 169, 110, ${goldGlowIntensity * 0.15})`
          : 'none',
      }}
    >
      {/* Scroll progress mini indicator on left edge */}
      <div
        className="nav-scroll-indicator"
        style={{
          transform: `scaleY(${pageScrollPercent})`,
          opacity: pageScrollPercent > 0 ? 0.6 : 0,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with shimmer effect when scrolled */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#hero');
            }}
            className="flex items-center gap-2 group"
          >
            <div className={`relative ${scrolled ? 'logo-shimmer' : ''}`}>
              <img
                src="/images/logo-omniliving.png"
                alt="Omniliving"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm tracking-[0.3em] text-white font-light uppercase group-hover:text-[#c9a96e] transition-colors duration-300 ${scrolled ? 'text-[#c9a96e]/80' : ''}`}>
                OMNILIVING
              </span>
              <span className="text-[7px] tracking-[0.2em] text-[#8888a8]/50 uppercase leading-none">
                Modulares Bauen
              </span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <MagneticNavLink
                  key={link.label}
                  label={link.label}
                  href={link.href}
                  isActive={isActive}
                  onClick={handleNavClick}
                />
              );
            })}
          </div>

          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#8888a8] hover:text-[#c9a96e] hover:bg-transparent transition-colors duration-300"
                >
                  <Menu size={22} />
                  <span className="sr-only">Menü öffnen</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-[#0a0a14]/95 border-l border-[#c9a96e]/15 w-[280px]"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div className="absolute inset-0 bg-[#0a0a14]/80 -z-10" />

                <SheetHeader className="mb-8">
                  <SheetTitle className="text-left text-sm tracking-[0.3em] text-white font-light uppercase">
                    OMNILIVING
                  </SheetTitle>
                  <p className="text-left text-[9px] tracking-[0.2em] text-[#c9a96e]/40 uppercase">
                    Modulares Bauen
                  </p>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  <AnimatePresence>
                    {mobileOpen && navLinks.map((link, index) => {
                      const sectionId = link.href.replace('#', '');
                      const isActive = activeSection === sectionId;
                      return (
                        <motion.div
                          key={link.label}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{
                            delay: index * 0.06,
                            duration: 0.4,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                        >
                          <SheetClose asChild>
                            <a
                              href={link.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(link.href);
                              }}
                              className="flex items-center gap-3 px-4 py-3 rounded-md text-sm tracking-[0.1em] uppercase transition-all duration-300 animated-underline"
                              style={{
                                color: isActive ? '#c9a96e' : '#8888a8',
                                backgroundColor: isActive
                                  ? 'rgba(201, 169, 110, 0.08)'
                                  : 'transparent',
                                borderLeft: isActive
                                  ? '2px solid #c9a96e'
                                  : '2px solid transparent',
                                textShadow: isActive ? '0 0 10px rgba(201, 169, 110, 0.3)' : 'none',
                              }}
                            >
                              {link.label}
                            </a>
                          </SheetClose>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </nav>
                <div className="absolute bottom-8 left-6 right-6">
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent mb-4" />
                  <p className="text-[10px] text-[#8888a8] tracking-wider text-center">
                    Module Design GmbH
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
