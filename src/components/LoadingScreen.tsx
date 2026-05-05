'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { translations } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'loading' | 'fading' | 'sliding' | 'done'>('loading');

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout>;
    let fadeTimer: ReturnType<typeof setTimeout>;
    let slideTimer: ReturnType<typeof setTimeout>;

    function scheduleDismiss(minDelay: number) {
      dismissTimer = setTimeout(() => {
        setPhase('fading');
        fadeTimer = setTimeout(() => {
          setPhase('sliding');
          slideTimer = setTimeout(() => {
            setPhase('done');
          }, 600);
        }, 800);
      }, minDelay);
    }

    const handleWindowLoad = () => {
      scheduleDismiss(1800);
    };

    if (document.readyState === 'complete') {
      scheduleDismiss(1800);
    } else {
      window.addEventListener('load', handleWindowLoad);
    }

    const fallbackTimer = setTimeout(() => {
      if (phase === 'loading') {
        setPhase('fading');
        fadeTimer = setTimeout(() => {
          setPhase('sliding');
          slideTimer = setTimeout(() => {
            setPhase('done');
          }, 600);
        }, 800);
      }
    }, 3500);

    return () => {
      window.removeEventListener('load', handleWindowLoad);
      clearTimeout(fallbackTimer);
      clearTimeout(dismissTimer);
      clearTimeout(fadeTimer);
      clearTimeout(slideTimer);
    };
  }, []);

  if (phase === 'done') {
    return null;
  }

  const isFading = phase === 'fading';
  const isSliding = phase === 'sliding';

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0a0a14] flex flex-col items-center justify-center"
      initial={{ y: 0 }}
      animate={isSliding ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 110, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 110, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* OMNILIVING text */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isFading ? 0 : 1, y: isFading ? -10 : 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="text-2xl sm:text-3xl md:text-4xl tracking-[0.4em] font-extralight text-white"
      >
        OMNI<span className="text-gradient-gold">LIVING</span>
      </motion.h1>

      {/* Gold horizontal line expanding from center */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '6rem', opacity: isFading ? 0 : 1 }}
        transition={{
          width: { duration: 0.8, delay: 0.8, ease: 'easeOut' },
          opacity: { duration: isFading ? 0.6 : 0.3, delay: isFading ? 0 : 0.8 },
        }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mt-6"
      />

      {/* Subtitle text */}
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isFading ? 0 : 1, y: isFading ? -5 : 0 }}
        transition={{ duration: 0.6, delay: isFading ? 0 : 1.4, ease: 'easeOut' }}
        className="tracking-[0.25em] text-[#c9a96e]/70 text-[10px] sm:text-xs mt-4 uppercase"
      >
        {(() => {
          const locale = (typeof window !== 'undefined' && localStorage.getItem('omniliving-locale')) || 'de';
          return translations[locale as Locale]['loading.subtitle'];
        })()}
      </motion.p>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFading ? 0 : 0.4 }}
        transition={{ duration: 0.4, delay: 1.8 }}
        className="flex gap-1.5 mt-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-[#c9a96e]"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
