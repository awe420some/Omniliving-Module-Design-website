'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [scrollY, setScrollY] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const particleCount = 80;
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas.width, canvas.height));

    function createParticle(w: number, h: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Fade in and out
        const lifeRatio = p.life / p.maxLife;
        const fadeOpacity = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.opacity * fadeOpacity})`;
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((p2, j) => {
          if (j <= i) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(201, 169, 110, ${0.05 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Reset particle if out of bounds or life ended
        if (p.life >= p.maxLife || p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) {
          particlesRef.current[i] = createParticle(canvas.width, canvas.height);
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animated gold line draw effect
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2000; // 2 seconds to draw

    function animateLine() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setLineProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animateLine);
      }
    }

    const frame = requestAnimationFrame(animateLine);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14] via-[#0f0f20] to-[#0a0a14]" />

      {/* Parallax background image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          willChange: 'transform',
        }}
      >
        <div className="absolute inset-0 scale-110">
          <img
            src="/images/hero-building.png"
            alt=""
            className="w-full h-full object-cover object-right center opacity-[0.17]"
            aria-hidden="true"
          />
        </div>
        {/* Gradient overlay to keep text readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14]/50 via-transparent to-[#0a0a14]/80" />
      </div>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* Animated gold vertical line on the left */}
      <div
        className="absolute left-8 sm:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-10"
        aria-hidden="true"
      >
        <svg
          width="2"
          height="300"
          viewBox="0 0 2 300"
          className="overflow-visible"
        >
          <line
            x1="1"
            y1="300"
            x2="1"
            y2={300 - 300 * lineProgress}
            stroke="url(#goldLineGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="goldLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#c9a96e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c9a96e" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Glowing dot at the tip */}
          {lineProgress > 0.05 && (
            <circle
              cx="1"
              cy={300 - 300 * lineProgress}
              r="3"
              fill="#c9a96e"
              opacity={0.8 * lineProgress}
            >
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.3em] sm:tracking-[0.4em] text-white mb-4">
            OMNILIVING
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        >
          <p className="text-lg sm:text-xl md:text-2xl tracking-[0.2em] sm:tracking-[0.3em] text-[#c9a96e] mb-2 font-light">
            Modul. Design. Leben.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p className="text-xs sm:text-sm tracking-[0.25em] text-white/40 font-light">
            MODULE DESIGN GMBH
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mb-8 mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
        >
          <Button
            size="lg"
            className="bg-transparent border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a0a14] px-8 py-6 text-sm tracking-[0.15em] uppercase transition-all duration-500 rounded-none"
            onClick={() => {
              document.getElementById('module-selector')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Entdecken Sie Ihr Zuhause
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <span className="text-[10px] tracking-[0.2em] text-[#8888a8] uppercase">Scroll</span>
        <motion.div
          className="w-[1px] h-8 bg-gradient-to-b from-[#c9a96e] to-transparent"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
        />
      </motion.div>
    </section>
  );
}
