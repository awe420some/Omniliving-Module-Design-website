'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface GalleryImage {
  src: string;
  title: string;
  aspect: 'tall' | 'standard' | 'wide';
  description: string;
}

const galleryImages: GalleryImage[] = [
  {
    src: '/images/hero-building.png',
    title: 'Modulhaus Berlin-Mitte',
    aspect: 'tall',
    description: 'Modernstes Modulhaus im Herzen von Berlin – nachhaltig und elegant gestaltet.',
  },
  {
    src: '/images/interior-1.png',
    title: 'Wohnbereich Premium',
    aspect: 'standard',
    description: 'Geräumiger Wohnbereich mit hochwertigen Materialien und durchdachtem Lichtkonzept.',
  },
  {
    src: '/images/interior-kitchen.png',
    title: 'Designer-Küche',
    aspect: 'wide',
    description: 'Komplett ausgestattete Designer-Küche mit intelligenter Raumnutzung.',
  },
  {
    src: '/images/interior-bedroom.png',
    title: 'Schlafzimmer Oasis',
    aspect: 'tall',
    description: 'Ruhiges Schlafzimmer-Oasis mit natürlichen Materialien und warmen Akzenten.',
  },
  {
    src: '/images/interior-bathroom.png',
    title: 'Wellness-Bad',
    aspect: 'standard',
    description: 'Wellness-Badezimmer mit Regendusche und eleganter Ausstattung.',
  },
  {
    src: '/images/container-cutaway.png',
    title: 'Modularer Aufbau',
    aspect: 'wide',
    description: 'Einblick in den modularen Aufbau – präzise Fertigung für maximale Qualität.',
  },
];

const aspectClasses: Record<string, string> = {
  tall: 'aspect-[3/4]',
  standard: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
};

export default function GallerySection() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToPrev, goToNext]);

  const currentImage = galleryImages[selectedIndex];

  return (
    <section id="gallery" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      <div className="max-w-7xl mx-auto">
        {/* Section header with image count indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase">
              Galerie
            </p>
            <span className="text-[10px] text-[#8888a8]/50 tracking-wider">
              ({galleryImages.length} Bilder)
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Unsere <span className="text-gradient-gold">Projekte</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            Einblicke in realisierte Modulhäuser und Innenräume.
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Masonry Grid with better gap handling */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="break-inside-avoid group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className={`relative rounded-lg overflow-hidden border border-white/5 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-[#c9a96e]/20 group-hover:shadow-lg group-hover:shadow-black/30 ${aspectClasses[image.aspect]}`}>
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Hover overlay with magnifying glass */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end">
                  {/* Magnifying glass icon center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-[#c9a96e]/50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-500 scale-50 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                    <Search size={20} className="text-[#c9a96e]" />
                  </div>
                  {/* Title and hint at bottom */}
                  <div className="p-4 sm:p-6 w-full">
                    <p className="text-sm sm:text-base font-light tracking-wider text-white">
                      {image.title}
                    </p>
                    <p className="text-xs text-[#c9a96e] mt-1 tracking-wide">
                      Anklicken zum Vergrößern
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent
          className="sm:max-w-5xl bg-[#0a0a14] border-white/10 p-0 overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{currentImage.title}</DialogTitle>
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-[#c9a96e]/30 transition-all duration-300"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>

          {/* Navigation arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-[#c9a96e]/30 transition-all duration-300"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-[#c9a96e]/30 transition-all duration-300"
            aria-label="Nächstes Bild"
          >
            <ChevronRight size={20} />
          </button>

          {/* Image */}
          <div className="relative flex flex-col items-center">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full"
            >
              <img
                src={currentImage.src}
                alt={currentImage.title}
                className="w-full max-h-[70vh] object-contain"
              />
            </motion.div>

            {/* Title and description */}
            <div className="w-full px-6 py-5 border-t border-white/5">
              <h3 className="text-lg font-light tracking-wider text-white">
                {currentImage.title}
              </h3>
              <p className="text-sm text-[#8888a8] mt-1 leading-relaxed">
                {currentImage.description}
              </p>
              <p className="text-xs text-[#c9a96e]/60 mt-2 tracking-wide">
                {selectedIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
