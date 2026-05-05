'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const faqItems = [
  {
    question: 'Wie lange dauert der Aufbau eines Modulhauses?',
    answer:
      'In der Regel beträgt die Bauzeit nur 6-8 Wochen ab Auftragserteilung. Die präzise Vorfertigung in unserer Fabrik ermöglicht kürzeste Bauzeiten ohne Kompromisse bei der Qualität.',
  },
  {
    question: 'Sind Modulhäuser genauso stabil wie konventionelle Häuser?',
    answer:
      'Absolut. Unsere Module erfüllen alle deutschen Baustandards und sind sogar erdbebensicher konstruiert. Die Stahlrahmenstruktur bietet maximale Stabilität bei minimalem Gewicht.',
  },
  {
    question: 'Kann ich mein Haus später erweitern?',
    answer:
      'Ja, das ist einer der größten Vorteile! Sie können jederzeit zusätzliche Module hinzufügen – ob nach oben oder zur Seite. Die modulare Bauweise macht Erweiterungen einfach und kosteneffizient.',
  },
  {
    question: 'Welche Finanzierungsmöglichkeiten gibt es?',
    answer:
      'Wir arbeiten mit verschiedenen Banken zusammen und bieten eigene Finanzierungsmodelle an. Von klassischen Baufinanzierungen bis zu Mietkauf-Modellen – wir finden die passende Lösung für Sie.',
  },
  {
    question: 'Ist ein Baugrundstück erforderlich?',
    answer:
      'Ja, Sie benötigen ein geeignetes Grundstück. Wir beraten Sie gerne bei der Auswahl und prüfen die Bebaubarkeit kostenlos für Sie.',
  },
  {
    question: 'Wie nachhaltig sind die Module?',
    answer:
      'Unsere Häuser sind CO₂-neutral im Betrieb. Wir verwenden recycelte Materialien, energieeffiziente Dämmung und erneuerbare Energiesysteme. Jedes Haus ist nach DGNB-Standard zertifizierbar.',
  },
];

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return faqItems;
    const query = searchQuery.toLowerCase();
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <section id="faq" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0f0f20]">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            Häufig gestellte <span className="text-gradient-gold">Fragen</span>
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Search/Filter input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888a8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fragen durchsuchen..."
              className="w-full pl-11 pr-4 py-3 bg-[#12121f]/60 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#8888a8]/50 focus:border-[#c9a96e]/40 focus:outline-none focus:ring-1 focus:ring-[#c9a96e]/20 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888a8] hover:text-[#c9a96e] text-xs transition-colors"
              >
                Zurücksetzen
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-[10px] text-[#8888a8]/60 mt-2 ml-1">
              {filteredItems.length} Ergebnis{filteredItems.length !== 1 ? 'se' : ''}
            </p>
          )}
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {filteredItems.length > 0 ? (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              onValueChange={(value) => setOpenItem(value || null)}
            >
              {filteredItems.map((item, index) => {
                const originalIndex = faqItems.indexOf(item);
                return (
                  <AccordionItem
                    key={`item-${originalIndex}`}
                    value={`item-${originalIndex}`}
                    className={`bg-[#12121f]/40 border-b border-white/5 px-4 sm:px-6 first:rounded-t-xl last:rounded-b-xl transition-all duration-500 ${
                      openItem === `item-${originalIndex}`
                        ? 'border-l-2 border-l-[#c9a96e] bg-[#12121f]/60'
                        : 'border-l-2 border-l-transparent hover:bg-[#12121f]/50'
                    }`}
                  >
                    <AccordionTrigger className="text-white hover:text-[#c9a96e] hover:no-underline tracking-wide text-sm sm:text-base py-5 [&>svg]:hidden transition-colors duration-300">
                      <span className="text-left pr-4">{item.question}</span>
                      <motion.div
                        animate={{ rotate: openItem === `item-${originalIndex}` ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="text-[#c9a96e] size-5 shrink-0 ml-auto" />
                      </motion.div>
                    </AccordionTrigger>
                    <AccordionContent className="text-[#8888a8] text-sm leading-relaxed faq-content-enter">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: openItem === `item-${originalIndex}` ? 1 : 0,
                          height: openItem === `item-${originalIndex}` ? 'auto' : 0,
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        {item.answer}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#8888a8] text-sm">Keine Ergebnisse für &ldquo;{searchQuery}&rdquo;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-[#c9a96e] hover:text-[#dbb980] transition-colors"
              >
                Suche zurücksetzen
              </button>
            </div>
          )}
        </motion.div>

        {/* Noch Fragen? CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="p-8 rounded-xl bg-[#12121f]/30 border border-white/5">
            <MessageCircle size={28} className="text-[#c9a96e]/60 mx-auto mb-4" />
            <h3 className="text-xl font-light text-white tracking-wide mb-2">
              Noch <span className="text-gradient-gold">Fragen</span>?
            </h3>
            <p className="text-sm text-[#8888a8] mb-6 max-w-md mx-auto">
              Wir beraten Sie gerne persönlich. Kontaktieren Sie uns für ein unverbindliches Gespräch.
            </p>
            <Button
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] px-8 py-3 text-xs tracking-[0.15em] uppercase transition-all duration-300"
            >
              Kontakt aufnehmen
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
