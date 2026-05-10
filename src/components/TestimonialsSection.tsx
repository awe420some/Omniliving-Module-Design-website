'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/i18n';

const testimonialKeys = [
  { quoteKey: 'testimonials.quote1', nameKey: 'testimonials.name1', locationKey: 'testimonials.location1', initials: 'TM', stars: 5 },
  { quoteKey: 'testimonials.quote2', nameKey: 'testimonials.name2', locationKey: 'testimonials.location2', initials: 'SK', stars: 5 },
  { quoteKey: 'testimonials.quote3', nameKey: 'testimonials.name3', locationKey: 'testimonials.location3', initials: 'MR', stars: 5 },
];

// Animated star rating component with hover effect
function AnimatedStars({ count, delay }: { count: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div ref={ref} className="flex gap-1 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`fill-omni-mint text-omni-mint ${isInView ? 'star-animated' : 'opacity-0'} star-hover-animate cursor-pointer`}
          style={{ animationDelay: `${delay + i * 0.08}s` }}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(null)}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const testimonials = testimonialKeys.map((item) => ({
    ...item,
    quote: t(item.quoteKey),
    name: t(item.nameKey),
    location: t(item.locationKey),
  }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, [testimonials.length]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    }
    return stopAutoPlay;
  }, [isAutoPlaying, startAutoPlay, stopAutoPlay]);

  const goToPrev = () => {
    stopAutoPlay();
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    // Resume auto play after 10s
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    stopAutoPlay();
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    stopAutoPlay();
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonials" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-omni-forest-deep">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-omni-mint uppercase mb-4">
            {t('testimonials.label').toUpperCase()}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('testimonials.title').split(t('testimonials.titleAccent'))[0]}<span className="text-gradient-gold">{t('testimonials.titleAccent')}</span>{t('testimonials.title').split(t('testimonials.titleAccent'))[1]}
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-omni-mint to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Large decorative opening quote */}
          <div className="absolute -top-6 left-4 sm:left-8 pointer-events-none select-none z-10">
            <span className="text-[120px] sm:text-[160px] md:text-[200px] font-serif text-omni-mint opacity-[0.06] leading-none">
              &ldquo;
            </span>
          </div>

          {/* Large decorative closing quote */}
          <div className="absolute -bottom-12 right-4 sm:right-8 pointer-events-none select-none z-10">
            <span className="text-[120px] sm:text-[160px] md:text-[200px] font-serif text-omni-mint opacity-[0.06] leading-none">
              &rdquo;
            </span>
          </div>

          {/* Testimonial card */}
          <div className="relative bg-omni-forest/60 border border-white/5 rounded-xl p-8 sm:p-12 hover:border-omni-mint/20 hover:shadow-[0_0_30px_rgba(195, 248, 189,0.05)] transition-all duration-500 overflow-hidden shimmer-sweep">
            {/* Gold shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, transparent 40%, rgba(195, 248, 189,0.03) 50%, transparent 60%)',
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="relative z-10"
              >
                {/* Star rating */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] tracking-[0.15em] text-omni-mint/60 uppercase font-medium">
                    {t('testimonials.stars')}
                  </span>
                </div>
                <AnimatedStars count={currentTestimonial.stars} delay={0.2} />

                {/* Quote text - larger decorative */}
                <p className="text-[#c9c9d8] text-base sm:text-lg md:text-xl leading-relaxed italic mb-8 relative z-10">
                  &ldquo;{currentTestimonial.quote}&rdquo;
                </p>

                {/* Customer info */}
                <div className="flex items-center gap-4">
                  <div className="avatar-gold-border rounded-full">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-omni-forest-soft text-omni-mint text-sm font-medium">
                        {currentTestimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="text-base text-white font-medium tracking-wide">
                      {currentTestimonial.name}
                    </p>
                    <p className="text-sm text-omni-cream">
                      {currentTestimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-omni-forest/80 border border-white/10 flex items-center justify-center text-omni-cream hover:text-omni-mint hover:border-omni-mint/30 transition-all duration-300 z-20"
            aria-label={t('testimonials.prevReview')}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-omni-forest/80 border border-white/10 flex items-center justify-center text-omni-cream hover:text-omni-mint hover:border-omni-mint/30 transition-all duration-300 z-20"
            aria-label={t('testimonials.nextReview')}
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots navigation */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-omni-mint w-6'
                    : 'bg-omni-cream/30 hover:bg-omni-cream/50'
                }`}
                aria-label={`${t('testimonials.review')} ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
