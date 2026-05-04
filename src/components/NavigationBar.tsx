'use client';

import { useState, useEffect, useCallback } from 'react';
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
  { label: 'Konfigurator', href: '#module-selector' },
  { label: 'Entdecken', href: '#reveal' },
  { label: 'Vorteile', href: '#features' },
  { label: 'Kontakt', href: '#contact' },
];

export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver
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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 20, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(201, 169, 110, 0.15)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#hero');
            }}
            className="flex items-center gap-2 group"
          >
            <img
              src="/images/logo-omniliving.png"
              alt="Omniliving"
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-sm tracking-[0.3em] text-white font-light uppercase group-hover:text-[#c9a96e] transition-colors duration-300">
              OMNILIVING
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="relative px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
                  style={{
                    color: isActive ? '#c9a96e' : '#8888a8',
                  }}
                >
                  {link.label}
                  {/* Active indicator */}
                  <motion.div
                    className="absolute bottom-0 left-4 right-4 h-[1px]"
                    style={{ backgroundColor: '#c9a96e' }}
                    initial={false}
                    animate={{
                      scaleX: isActive ? 1 : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </a>
              );
            })}
          </div>

          {/* Mobile hamburger */}
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
                className="bg-[#0a0a14] border-l border-[#c9a96e]/15 w-[280px]"
              >
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-left text-sm tracking-[0.3em] text-white font-light uppercase">
                    OMNILIVING
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link, index) => {
                    const sectionId = link.href.replace('#', '');
                    const isActive = activeSection === sectionId;
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                      >
                        <SheetClose asChild>
                          <a
                            href={link.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavClick(link.href);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm tracking-[0.1em] uppercase transition-all duration-300"
                            style={{
                              color: isActive ? '#c9a96e' : '#8888a8',
                              backgroundColor: isActive
                                ? 'rgba(201, 169, 110, 0.08)'
                                : 'transparent',
                              borderLeft: isActive
                                ? '2px solid #c9a96e'
                                : '2px solid transparent',
                            }}
                          >
                            {link.label}
                          </a>
                        </SheetClose>
                      </motion.div>
                    );
                  })}
                </nav>
                {/* Decorative bottom */}
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
