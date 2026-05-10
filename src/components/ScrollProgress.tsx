'use client';

import { useState, useEffect } from 'react';

export default function ScrollProgress() {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollPercent((scrollTop / docHeight) * 100);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[2px] pointer-events-none"
      style={{ opacity: scrollPercent > 0 ? 1 : 0, transition: 'opacity 0.3s ease' }}
    >
      <div
        className="h-full"
        style={{
          width: `${scrollPercent}%`,
          background: 'linear-gradient(to right, #C3F8BD, #DFFCD9)',
          transition: 'width 0.15s ease-out',
        }}
      />
    </div>
  );
}
