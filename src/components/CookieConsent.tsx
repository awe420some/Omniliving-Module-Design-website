'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#12121f]/95 backdrop-blur-md border-t border-[#c9a96e]/20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 relative">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#c9a96e]/30 transition-all duration-300"
              aria-label={t('cookie.close')}
            >
              <X size={14} />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pr-8">
              <p className="text-sm text-[#8888a8] leading-relaxed flex-1">
                {t('cookie.desc')}
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleAccept}
                  className="px-5 py-2 rounded-md text-sm font-medium tracking-wide bg-gradient-to-r from-[#c9a96e] to-[#dbb980] text-[#0a0a14] hover:shadow-lg hover:shadow-[#c9a96e]/20 transition-all duration-300"
                >
                  {t('cookie.accept')}
                </button>
                <button
                  onClick={handleReject}
                  className="px-5 py-2 rounded-md text-sm font-medium tracking-wide border border-white/10 text-white/70 hover:border-[#c9a96e]/30 hover:text-white transition-all duration-300"
                >
                  {t('cookie.reject')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
