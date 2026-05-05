'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    quote:
      'Unser modulares Zuhause von Omniliving hat alle Erwartungen übertroffen. Die Qualität ist erstklassig und der Aufbau war unglaublich schnell.',
    name: 'Thomas M.',
    location: 'Berlin',
    initials: 'TM',
    stars: 5,
  },
  {
    quote:
      'Von der ersten Beratung bis zur Schlüsselübergabe – alles lief reibungslos. Das Design ist modern und durchdacht.',
    name: 'Sarah K.',
    location: 'München',
    initials: 'SK',
    stars: 5,
  },
  {
    quote:
      'Die Flexibilität der Module hat uns begeistert. Wir konnten genau das Zuhause gestalten, das wir uns immer gewünscht haben.',
    name: 'Michael R.',
    location: 'Hamburg',
    initials: 'MR',
    stars: 5,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Animated star rating component
function AnimatedStars({ count, delay }: { count: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex gap-1 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`fill-[#c9a96e] text-[#c9a96e] ${isInView ? 'star-animated' : 'opacity-0'}`}
          style={{ animationDelay: `${delay + i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            KUNDENSTIMMEN
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Was unsere <span className="text-gradient-gold">Kunden</span> sagen
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Testimonial cards grid with gradient edge overlays */}
        <div className="relative gradient-edge-overlay">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                className="relative bg-[#12121f]/60 border border-white/5 rounded-xl p-6 sm:p-8 hover:border-[#c9a96e]/20 hover:shadow-[0_0_30px_rgba(201,169,110,0.05)] transition-all duration-500 group shimmer-sweep"
              >
                {/* Decorative quote mark with rotation animation */}
                <span className="absolute top-4 right-6 text-6xl font-serif text-[#c9a96e] opacity-20 leading-none select-none pointer-events-none quote-animate">
                  &ldquo;
                </span>

                {/* Star rating with fill animation */}
                <AnimatedStars count={testimonial.stars} delay={index * 0.2} />

                {/* Quote text */}
                <p className="text-[#8888a8] text-sm leading-relaxed italic mb-6 relative z-10">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Customer info with gold border avatar */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="avatar-gold-border rounded-full">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-[#1a1a2e] text-[#c9a96e] text-xs font-medium">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium tracking-wide">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[#8888a8]">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
