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
import { useTranslation } from '@/lib/i18n';

const faqKeyList = [
  { qKey: 'faq.q1', aKey: 'faq.a1' },
  { qKey: 'faq.q2', aKey: 'faq.a2' },
  { qKey: 'faq.q3', aKey: 'faq.a3' },
  { qKey: 'faq.q4', aKey: 'faq.a4' },
  { qKey: 'faq.q5', aKey: 'faq.a5' },
  { qKey: 'faq.q6', aKey: 'faq.a6' },
];

export default function FAQSection() {
  const { t } = useTranslation();
  const faqItems = faqKeyList.map((item) => ({
    ...item,
    question: t(item.qKey),
    answer: t(item.aKey),
  }));
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
  }, [searchQuery, faqItems]);

  return (
    <section id="faq" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-omni-forest-deep">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-omni-mint uppercase mb-4">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('faq.label').split(' ').slice(0, -1).join(' ')} <span className="text-gradient-gold">{t('faq.title')}</span>
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-omni-mint to-transparent mx-auto mt-6" />
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
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-omni-cream" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('faq.search')}
              className="w-full pl-11 pr-4 py-3 bg-omni-forest/60 border border-white/10 rounded-lg text-sm text-white placeholder:text-omni-cream/50 focus:border-omni-mint/40 focus:outline-none focus:ring-1 focus:ring-omni-mint/20 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-omni-cream hover:text-omni-mint text-xs transition-colors"
              >
                {t('faq.reset')}
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-[10px] text-omni-cream/60 mt-2 ml-1">
              {filteredItems.length} {filteredItems.length !== 1 ? t('faq.results') : t('faq.result')}
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
                    className={`bg-omni-forest/40 border-b border-white/5 px-4 sm:px-6 first:rounded-t-xl last:rounded-b-xl transition-all duration-500 ${
                      openItem === `item-${originalIndex}`
                        ? 'border-l-2 border-l-[#C3F8BD] bg-omni-forest/60'
                        : 'border-l-2 border-l-transparent hover:bg-omni-forest/50'
                    }`}
                  >
                    <AccordionTrigger className="text-white hover:text-omni-mint hover:no-underline tracking-wide text-sm sm:text-base py-5 [&>svg]:hidden transition-colors duration-300">
                      <span className="text-left pr-4">{item.question}</span>
                      <motion.div
                        animate={{ rotate: openItem === `item-${originalIndex}` ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="text-omni-mint size-5 shrink-0 ml-auto" />
                      </motion.div>
                    </AccordionTrigger>
                    <AccordionContent className="text-omni-cream text-sm leading-relaxed faq-content-enter">
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
              <p className="text-omni-cream text-sm">{t('faq.noResults')} &ldquo;{searchQuery}&rdquo;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-omni-mint hover:text-omni-mint-soft transition-colors"
              >
                {t('faq.resetSearch')}
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
          <div className="p-8 rounded-xl bg-omni-forest/30 border border-white/5">
            <MessageCircle size={28} className="text-omni-mint/60 mx-auto mb-4" />
            <h3 className="text-xl font-light text-white tracking-wide mb-2">
              {t('faq.moreQuestions').split(' ').slice(0, -1).join(' ')} <span className="text-gradient-gold">{t('faq.title')}</span>?
            </h3>
            <p className="text-sm text-omni-cream mb-6 max-w-md mx-auto">
              {t('faq.contactUs')}
            </p>
            <Button
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-omni-mint to-omni-mint-deep hover:from-omni-mint-soft hover:to-omni-mint text-omni-forest-deep px-8 py-3 text-xs tracking-[0.15em] uppercase transition-all duration-300"
            >
              {t('faq.contactCta')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
