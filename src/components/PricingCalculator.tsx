'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';

const MODULE_TYPES = {
  standard: { label: 'Standard', pricePerModule: 25000 },
  premium: { label: 'Premium', pricePerModule: 32000 },
  luxus: { label: 'Luxus', pricePerModule: 35000 },
} as const;

type ModuleType = keyof typeof MODULE_TYPES;

const EXTRAS = [
  { id: 'klimaanlage', label: 'Klimaanlage', price: 5000 },
  { id: 'smarthome', label: 'Smart Home', price: 8000 },
  { id: 'solaranlage', label: 'Solaranlage', price: 12000 },
  { id: 'terrasse', label: 'Terrasse', price: 6000 },
  { id: 'einbaukueche', label: 'Einbauküche', price: 7000 },
] as const;

type ExtraId = (typeof EXTRAS)[number]['id'];

const LOCATIONS = {
  land: { label: 'Land', modifier: 1.0 },
  stadt: { label: 'Stadt', modifier: 1.1 },
} as const;

type Location = keyof typeof LOCATIONS;

function formatEuro(value: number): string {
  return value.toLocaleString('de-DE') + ' €';
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.5, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="inline-block"
    >
      {formatEuro(value)}
    </motion.span>
  );
}

export default function PricingCalculator() {
  const { t } = useTranslation();
  const [moduleCount, setModuleCount] = useState(3);
  const [moduleType, setModuleType] = useState<ModuleType>('standard');
  const [hasUpperFloor, setHasUpperFloor] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<Set<ExtraId>>(new Set());
  const [location, setLocation] = useState<Location>('land');

  const toggleExtra = useCallback((id: ExtraId) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const calculation = useMemo(() => {
    const pricePerModule = MODULE_TYPES[moduleType].pricePerModule;
    const basePrice = pricePerModule * moduleCount;
    const upperFloorAddition = hasUpperFloor ? Math.round(basePrice * 0.2) : 0;
    const extrasTotal = EXTRAS.filter((e) => selectedExtras.has(e.id)).reduce(
      (sum, e) => sum + e.price,
      0,
    );
    const locationModifier = LOCATIONS[location].modifier;
    const locationAddition = locationModifier > 1 ? Math.round((basePrice + upperFloorAddition) * 0.1) : 0;

    const subtotal = basePrice + upperFloorAddition + extrasTotal;
    const total = Math.round(subtotal * locationModifier);

    return {
      basePrice,
      upperFloorAddition,
      extrasTotal,
      locationAddition,
      total,
    };
  }, [moduleCount, moduleType, hasUpperFloor, selectedExtras, location]);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a14]">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
            {t('pricing.label').toUpperCase()}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-4">
            {t('pricing.title').split(t('pricing.titleAccent'))[0]}<span className="text-gradient-gold">{t('pricing.titleAccent')}</span>{t('pricing.title').split(t('pricing.titleAccent'))[1]}
          </h2>
          <p className="text-sm sm:text-base text-[#8888a8] max-w-2xl mx-auto mt-4">
            {t('pricing.subtitle')}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Module Count Slider */}
            <div className="bg-[#12121f]/60 border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm text-white tracking-wide">{t('pricing.moduleCount')}</Label>
                <span className="text-lg font-light text-[#c9a96e] tabular-nums">{moduleCount}</span>
              </div>
              <Slider
                value={[moduleCount]}
                min={1}
                max={6}
                step={1}
                onValueChange={(v) => setModuleCount(v[0])}
                className="w-full [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[#c9a96e] [&_[data-slot=slider-range]]:to-[#dbb980] [&_[data-slot=slider-thumb]]:bg-[#c9a96e] [&_[data-slot=slider-thumb]]:border-[#c9a96e] [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-5"
              />
              <div className="flex justify-between mt-2 text-xs text-[#8888a8]">
                <span>1</span>
                <span>6</span>
              </div>
              <p className="text-xs text-[#8888a8] mt-3">
                {t('pricing.perModule')} {formatEuro(MODULE_TYPES[moduleType].pricePerModule)}/{t('pricing.perModule').split(' ')[0]}
              </p>
            </div>

            {/* Module Type Select */}
            <div className="bg-[#12121f]/60 border border-white/5 rounded-xl p-6">
              <Label className="text-sm text-white tracking-wide mb-3 block">{t('pricing.moduleType')}</Label>
              <Select value={moduleType} onValueChange={(v) => setModuleType(v as ModuleType)}>
                <SelectTrigger className="w-full bg-[#0a0a14] border border-white/10 text-white h-11 hover:border-[#c9a96e]/30 focus:border-[#c9a96e] [&_svg]:text-[#c9a96e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12121f] border border-white/10 text-white">
                  {Object.entries(MODULE_TYPES).map(([key, val]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-white focus:bg-[#1a1a2e] focus:text-white"
                    >
                      {val.label} – ab {formatEuro(val.pricePerModule)}/{t('pricing.perModule').split(' ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Floor Toggle */}
            <div className="bg-[#12121f]/60 border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm text-white tracking-wide">{t('pricing.stories')}</Label>
                  <p className="text-xs text-[#8888a8] mt-1">
                    {hasUpperFloor ? t('pricing.groundUpper') : t('pricing.groundOnly')}
                  </p>
                </div>
                <Switch
                  checked={hasUpperFloor}
                  onCheckedChange={setHasUpperFloor}
                  className="data-[state=checked]:bg-[#c9a96e] data-[state=unchecked]:bg-white/10 w-11 h-6 [&>span]:h-5 [&>span]:w-5"
                />
              </div>
            </div>

            {/* Extras Checkboxes */}
            <div className="bg-[#12121f]/60 border border-white/5 rounded-xl p-6">
              <Label className="text-sm text-white tracking-wide mb-4 block">{t('pricing.equipment')}</Label>
              <div className="space-y-3">
                {EXTRAS.map((extra) => (
                  <div key={extra.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        id={extra.id}
                        checked={selectedExtras.has(extra.id)}
                        onCheckedChange={() => toggleExtra(extra.id)}
                        className="data-[state=checked]:bg-[#c9a96e] data-[state=checked]:border-[#c9a96e] data-[state=checked]:text-[#0a0a14] border-white/20 h-4 w-4"
                      />
                      <Label
                        htmlFor={extra.id}
                        className="text-sm text-[#8888a8] cursor-pointer hover:text-white transition-colors"
                      >
                        {extra.label}
                      </Label>
                    </div>
                    <span className="text-xs text-[#c9a96e]/70 tabular-nums shrink-0">
                      +{formatEuro(extra.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Select */}
            <div className="bg-[#12121f]/60 border border-white/5 rounded-xl p-6">
              <Label className="text-sm text-white tracking-wide mb-3 block">{t('pricing.location')}</Label>
              <Select value={location} onValueChange={(v) => setLocation(v as Location)}>
                <SelectTrigger className="w-full bg-[#0a0a14] border border-white/10 text-white h-11 hover:border-[#c9a96e]/30 focus:border-[#c9a96e] [&_svg]:text-[#c9a96e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12121f] border border-white/10 text-white">
                  {Object.entries(LOCATIONS).map(([key, val]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-white focus:bg-[#1a1a2e] focus:text-white"
                    >
                      {val.label}
                      {val.modifier > 1 ? ' (+10%)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Right: Price Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex flex-col"
          >
            {/* Total Price Card */}
            <div className="bg-[#12121f]/80 border border-[#c9a96e]/20 rounded-xl p-8 text-center mb-6 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9a96e]/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Calculator size={20} className="text-[#c9a96e]" />
                  <span className="text-xs tracking-[0.2em] text-[#c9a96e] uppercase">
                    {t('pricing.estimatedCost')}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={calculation.total}
                    initial={{ scale: 0.95, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <p className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-wider">
                      <AnimatedNumber value={calculation.total} />
                    </p>
                  </motion.div>
                </AnimatePresence>
                <p className="text-xs text-[#8888a8] mt-3 tracking-wide">
                  {t('pricing.unbinding')}
                </p>
              </div>
            </div>

            {/* Price Breakdown Table */}
            <div className="bg-[#12121f]/60 border border-white/5 rounded-xl p-6 flex-1">
              <h4 className="text-sm font-medium text-white tracking-wider uppercase mb-5">
                {t('pricing.breakdown')}
              </h4>
              <div className="space-y-3">
                {/* Base price */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#8888a8]">
                    {t('pricing.basePrice')} ({moduleCount} × {MODULE_TYPES[moduleType].label})
                  </span>
                  <span className="text-sm text-white tabular-nums">
                    <AnimatedNumber value={calculation.basePrice} />
                  </span>
                </div>

                {/* Upper floor */}
                {calculation.upperFloorAddition > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between py-2 border-b border-white/5"
                  >
                    <span className="text-sm text-[#8888a8]">{t('pricing.upperFloor')}</span>
                    <span className="text-sm text-white tabular-nums">
                      +<AnimatedNumber value={calculation.upperFloorAddition} />
                    </span>
                  </motion.div>
                )}

                {/* Extras */}
                {selectedExtras.size > 0 && (
                  <div className="py-2 border-b border-white/5">
                    <span className="text-sm text-[#8888a8]">{t('pricing.equipment')}</span>
                    <div className="mt-2 space-y-1 pl-3">
                      {EXTRAS.filter((e) => selectedExtras.has(e.id)).map((extra) => (
                        <div key={extra.id} className="flex items-center justify-between">
                          <span className="text-xs text-[#8888a8]/70">{extra.label}</span>
                          <span className="text-xs text-[#8888a8] tabular-nums">
                            +{formatEuro(extra.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {calculation.locationAddition > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between py-2 border-b border-white/5"
                  >
                    <span className="text-sm text-[#8888a8]">{t('pricing.citySurcharge')}</span>
                    <span className="text-sm text-white tabular-nums">
                      +<AnimatedNumber value={calculation.locationAddition} />
                    </span>
                  </motion.div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-base font-medium text-white tracking-wide">{t('pricing.total')}</span>
                  <span className="text-lg font-light text-[#c9a96e] tabular-nums">
                    <AnimatedNumber value={calculation.total} />
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={scrollToContact}
              className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] font-medium tracking-[0.1em] uppercase text-sm transition-all duration-500 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#c9a96e]/20"
            >
              {t('pricing.requestEstimate')}
              <ArrowDown size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
