'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

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

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#12121f]/40 border-b border-white/5 px-4 sm:px-6 first:rounded-t-xl last:rounded-b-xl"
              >
                <AccordionTrigger className="text-white hover:text-[#c9a96e] hover:no-underline tracking-wide text-sm sm:text-base py-5 [&>svg]:hidden">
                  <span className="text-left pr-4">{item.question}</span>
                  <ChevronDown className="text-[#c9a96e] size-5 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180 ml-auto" />
                </AccordionTrigger>
                <AccordionContent className="text-[#8888a8] text-sm leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
