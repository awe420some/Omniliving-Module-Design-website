'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'loading' | 'fading' | 'sliding' | 'done'>('loading');

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout>;
    let fadeTimer: ReturnType<typeof setTimeout>;
    let slideTimer: ReturnType<typeof setTimeout>;

    function scheduleDismiss(minDelay: number) {
      dismissTimer = setTimeout(() => {
        setPhase('fading');
        // After fade out completes (0.8s), start slide
        fadeTimer = setTimeout(() => {
          setPhase('sliding');
          // After slide completes (0.6s), mark as done
          slideTimer = setTimeout(() => {
            setPhase('done');
          }, 600);
        }, 800);
      }, minDelay);
    }

    // Listen for window load event to dismiss earlier if page loads fast
    const handleWindowLoad = () => {
      scheduleDismiss(2000);
    };

    if (document.readyState === 'complete') {
      scheduleDismiss(2000);
    } else {
      window.addEventListener('load', handleWindowLoad);
    }

    // Fallback: ensure dismissal after 3.5 seconds regardless
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

  // Once fully dismissed, return null (no DOM footprint)
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
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* OMNILIVING text */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        transition={{ duration: isFading ? 0.8 : 0.8, delay: isFading ? 0 : 0.2 }}
        className="text-2xl sm:text-3xl md:text-4xl tracking-[0.4em] font-light text-white"
      >
        OMNILIVING
      </motion.h1>

      {/* Gold horizontal line expanding from center */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '6rem', opacity: isFading ? 0 : 1 }}
        transition={{
          width: { duration: 0.8, delay: 0.8, ease: 'easeOut' },
          opacity: { duration: isFading ? 0.8 : 0, delay: isFading ? 0 : 0 },
        }}
        className="h-[1px] bg-[#c9a96e] mt-6"
      />

      {/* Subtitle text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        transition={{ duration: isFading ? 0.8 : 0.6, delay: isFading ? 0 : 1.4 }}
        className="tracking-[0.2em] text-[#c9a96e] text-xs sm:text-sm mt-4 uppercase"
      >
        Modul. Design. Leben.
      </motion.p>
    </motion.div>
  );
}
