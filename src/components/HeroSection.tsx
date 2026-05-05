'use client';

import { useEffect, useRef, useState, useSyncExternalStore, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { ChevronDown, Home, Bed, UtensilsCrossed, Bath } from 'lucide-react';

// Seeded pseudo-random for consistent SSR/client values (avoids hydration mismatch)
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// CSS floating golden particles - client-only to avoid hydration mismatch
function FloatingParticles() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isClient) return null;

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${seededRandom(i) * 100}%`,
    duration: `${6 + seededRandom(i + 100) * 8}s`,
    delay: `${seededRandom(i + 200) * 8}s`,
    size: `${2 + seededRandom(i + 300) * 3}px`,
    opacity: 0.3 + seededRandom(i + 400) * 0.5,
  }));

  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="golden-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            '--duration': p.duration,
            '--delay': p.delay,
            opacity: p.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// Floating module icons that orbit the center
function FloatingModuleIcons() {
  const { t } = useTranslation();
  const icons = [
    { Icon: Home, label: t('module.wohnen'), angle: 0, radius: 28 },
    { Icon: Bed, label: t('module.schlafen'), angle: 90, radius: 32 },
    { Icon: UtensilsCrossed, label: t('module.kueche'), angle: 180, radius: 26 },
    { Icon: Bath, label: t('module.bad'), angle: 270, radius: 30 },
  ];

  return (
    <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
      {icons.map((item, i) => (
        <motion.div
          key={item.label}
          className="absolute top-1/2 left-1/2"
          animate={{
            x: [
              Math.cos(((item.angle + 0) * Math.PI) / 180) * `${item.radius}` + 'vw',
              Math.cos(((item.angle + 360) * Math.PI) / 180) * `${item.radius}` + 'vw',
            ],
            y: [
              Math.sin(((item.angle + 0) * Math.PI) / 180) * `${item.radius * 0.5}` + 'vh',
              Math.sin(((item.angle + 360) * Math.PI) / 180) * `${item.radius * 0.5}` + 'vh',
            ],
          }}
          transition={{
            duration: 40 + i * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ opacity: 0.15 }}
        >
          <div className="flex flex-col items-center gap-1">
            <item.Icon size={20} className="text-[#c9a96e]" />
            <span className="text-[8px] text-[#c9a96e]/60 tracking-widest uppercase">{item.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Typewriter effect for subtitle
function TypewriterText({ text, delay = 0 }: { text: string; delay: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayedText}
      {started && displayedText.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-[#c9a96e] ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

export default function HeroSection() {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [letterboxOpacity, setLetterboxOpacity] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const setExperienceMode = useAppStore((s) => s.setExperienceMode);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setExperienceMode('hero');
  }, [setExperienceMode]);

  // Parallax scroll effect + letterbox fade + scroll progress
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setLetterboxOpacity(Math.max(0, 1 - window.scrollY / 300));
      // Calculate how far user has scrolled through the hero (100vh)
      const heroHeight = window.innerHeight;
      const progress = Math.min(window.scrollY / heroHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Animated gold line draw effect
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2000;

    function animateLine() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setLineProgress(eased);
      if (progress < 1) {
        requestAnimationFrame(animateLine);
      }
    }

    const frame = requestAnimationFrame(animateLine);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Canvas particle animation with constellation lines and glow halos
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number;
      isLarge: boolean;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles - some large with glow
    for (let i = 0; i < 80; i++) {
      const isLarge = i < 8; // 8 large particles with glow halos
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: isLarge ? Math.random() * 3 + 2.5 : Math.random() * 2 + 0.5,
        opacity: isLarge ? Math.random() * 0.4 + 0.3 : Math.random() * 0.5 + 0.1,
        life: Math.random(),
        isLarge,
      });
    }

    const CONNECTION_DISTANCE = 120;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update particles
      particles.forEach((p) => {
        p.x += p.vx + (mousePos.x - 0.5) * 0.15;
        p.y += p.vy;
        p.life += 0.002;

        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });

      // Draw connecting lines (constellation effect)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        const flicker = Math.sin(p.life * 4) * 0.15 + 0.85;
        const alpha = p.opacity * flicker;

        // Soft glow halo for large particles
        if (p.isLarge) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201, 169, 110, ${alpha * 0.08})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201, 169, 110, ${alpha * 0.15})`;
          ctx.fill();
        }

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${alpha})`;
        ctx.fill();

        // Standard glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${alpha * 0.15})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [mousePos.x, mousePos.y]);

  // Parallax offset for hero text
  const parallaxX = (mousePos.x - 0.5) * -12;
  const parallaxY = (mousePos.y - 0.5) * -8;

  // Scroll depth indicator - circular progress ring around chevron
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (scrollProgress * circumference);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background video — intro flythrough */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.18, filter: 'brightness(0.6) saturate(0.7)' }}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* Animated particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.6 }}
      />

      {/* Floating CSS golden particles */}
      <FloatingParticles />

      {/* Floating module icons orbiting */}
      <FloatingModuleIcons />

      {/* Background gradient with parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at ${50 + (mousePos.x - 0.5) * 10}% ${40 + (mousePos.y - 0.5) * 10}%, rgba(45, 74, 62, 0.3) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(201, 169, 110, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(74, 158, 255, 0.05) 0%, transparent 50%),
            #0a0a14
          `,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 110, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 110, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Dark gradient overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14]/60 via-transparent to-[#0a0a14]/60 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-[#0a0a14]/40 pointer-events-none z-[1]" />

      {/* Cinematic letterbox bars */}
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none transition-opacity duration-800"
        style={{ opacity: letterboxOpacity }}
      >
        <div
          className="h-[8vh]"
          style={{
            background: 'linear-gradient(to bottom, #0a0a14 40%, rgba(10,10,20,0.6) 75%, transparent 100%)',
          }}
        />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none transition-opacity duration-800"
        style={{ opacity: letterboxOpacity }}
      >
        <div
          className="h-[8vh]"
          style={{
            background: 'linear-gradient(to top, #0a0a14 40%, rgba(10,10,20,0.6) 75%, transparent 100%)',
          }}
        />
      </div>

      {/* Animated gold vertical line on the left */}
      <div
        className="absolute left-8 sm:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-10"
        aria-hidden="true"
      >
        <svg width="2" height="300" viewBox="0 0 2 300" className="overflow-visible">
          <line
            x1="1" y1="300" x2="1" y2={300 - 300 * lineProgress}
            stroke="url(#heroGoldLineGradient)" strokeWidth="1.5" strokeLinecap="round"
          />
          <defs>
            <linearGradient id="heroGoldLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#c9a96e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c9a96e" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {lineProgress > 0.05 && (
            <circle cx="1" cy={300 - 300 * lineProgress} r="3" fill="#c9a96e" opacity={0.8 * lineProgress}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      </div>

      {/* Right side decorative line */}
      <div
        className="absolute right-8 sm:right-12 lg:right-16 top-1/2 -translate-y-1/2 z-10"
        aria-hidden="true"
      >
        <svg width="2" height="200" viewBox="0 0 2 200" className="overflow-visible">
          <line x1="1" y1="0" x2="1" y2={200 * lineProgress}
            stroke="url(#heroGoldLineGradient2)" strokeWidth="1" strokeLinecap="round" />
          <defs>
            <linearGradient id="heroGoldLineGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#c9a96e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c9a96e" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Sound wave animation - concentric rings from OMNILIVING text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] pointer-events-none">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a96e]/10"
            animate={{
              scale: [1, 1.5 + i * 0.3],
              opacity: [0.12 / i, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
            style={{
              width: 100 + i * 60,
              height: 100 + i * 60,
            }}
          />
        ))}
      </div>

      {/* Content with parallax mouse-follow */}
      <div
        className="relative z-10 text-center px-4"
        style={{
          transform: `translate(${parallaxX}px, ${parallaxY + scrollY * 0.1}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <p className="text-[10px] sm:text-xs tracking-[0.4em] text-[#c9a96e]/60 uppercase mb-6">
            {t('hero.sublabel')}
          </p>
        </motion.div>

        {/* Pulsing gold circle + title with shimmer on LIVING */}
        <div className="relative inline-block">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full pointer-events-none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'radial-gradient(circle, rgba(201, 169, 110, 0.15) 0%, transparent 70%)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-[0.2em] sm:tracking-[0.3em] text-white mb-4 relative">
              OMNI<span className="text-gradient-gold-shimmer">LIVING</span>
            </h1>
          </motion.div>
        </div>

        {/* Typewriter subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
        >
          <p className="text-base sm:text-lg md:text-xl tracking-[0.15em] sm:tracking-[0.2em] text-white/70 mb-2 font-light">
            <TypewriterText text={t('hero.description')} delay={1800} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <p className="text-[10px] sm:text-xs tracking-[0.3em] text-[#c9a96e]/50 font-light">
            {t('hero.company')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent mx-auto mb-10 mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
        >
          <div className="inline-block gold-border-animate rounded-sm">
            <Button
              size="lg"
              className="group relative bg-[#0a0a14] border-0 text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a0a14] px-10 py-7 text-xs tracking-[0.2em] uppercase transition-all duration-500 rounded-sm overflow-hidden"
              onClick={() => {
                document.getElementById('scroll-experience')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="relative z-10">{t('hero.cta')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#c9a96e] to-[#dbb980] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll down indicator with circular progress ring */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <span className="text-[9px] sm:text-[10px] tracking-[0.3em] text-[#c9a96e]/50 uppercase">
          {t('hero.scroll')}
        </span>
        <div className="relative">
          {/* Circular progress ring */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="rgba(201, 169, 110, 0.15)"
              strokeWidth="1.5"
            />
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="rgba(201, 169, 110, 0.6)"
              strokeWidth="1.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
              style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
            />
          </svg>
          <div className="bounce-down flex items-center justify-center w-10 h-10">
            <ChevronDown size={16} className="text-[#c9a96e]/60" />
          </div>
        </div>
        <motion.div
          className="w-[1px] h-10 bg-gradient-to-b from-[#c9a96e]/60 to-transparent"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
        />
      </motion.div>

      {/* Elaborate bottom gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none">
        <div className="h-32" style={{
          background: `
            linear-gradient(to top,
              #0a0a14 0%,
              rgba(10, 10, 20, 0.9) 30%,
              rgba(10, 10, 20, 0.6) 60%,
              rgba(10, 10, 20, 0.2) 85%,
              transparent 100%
            )
          `
        }} />
        {/* Decorative gold accent lines at the transition */}
        <div className="absolute bottom-24 left-0 right-0">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/15 to-transparent" />
        </div>
        <div className="absolute bottom-28 left-0 right-0">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/8 to-transparent" />
        </div>
        <div className="absolute bottom-20 left-0 right-0">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/5 to-transparent" />
        </div>
      </div>

      {/* Bottom decorative accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/20 to-transparent z-10" />
    </section>
  );
}
