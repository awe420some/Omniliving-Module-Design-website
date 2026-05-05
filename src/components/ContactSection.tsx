'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Loader2, MapPinned } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const contactSchema = z.object({
  vorname: z.string().min(1, 'Vorname ist erforderlich'),
  nachname: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  telefon: z.string().optional(),
  interesse: z.string().min(1, 'Bitte wählen Sie einen Interessentyp'),
  nachricht: z.string().min(1, 'Bitte geben Sie eine Nachricht ein'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const interestOptions = [
  { value: 'wohnmodul', label: 'Wohnmodul' },
  { value: 'schlafmodul', label: 'Schlafmodul' },
  { value: 'kuechenmodul', label: 'Küchenmodul' },
  { value: 'badmodul', label: 'Badmodul' },
  { value: 'komplett-wohnheim', label: 'Komplett-Wohnheim' },
  { value: 'beratung', label: 'Beratung' },
];

// Contact info card with hover lift effect
function ContactInfoCard({
  icon: Icon,
  href,
  children,
}: {
  icon: React.ElementType;
  href?: string;
  children: React.ReactNode;
}) {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, target: href.startsWith('http') ? '_blank' as const : undefined, rel: href.startsWith('http') ? 'noopener noreferrer' : undefined }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="contact-card-lift flex items-center gap-4 p-4 rounded-lg bg-[#12121f]/40 border border-white/5 cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center group-hover:border-[#c9a96e]/30 transition-colors duration-300 shrink-0">
        <Icon size={18} className="text-[#c9a96e]" />
      </div>
      <div className="text-sm text-[#8888a8] group-hover:text-[#c9a96e] transition-colors duration-300">
        {children}
      </div>
    </Wrapper>
  );
}

// Map placeholder with pin animation
function MapPlaceholder() {
  return (
    <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-white/5 bg-[#12121f]/30">
      {/* Stylized map grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 110, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 110, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
      {/* Stylized roads */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[70%] h-[1px] bg-white/5 rotate-12" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[1px] h-[60%] bg-white/5 -rotate-12" />
      </div>
      {/* Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pin-bounce">
        <div className="relative">
          <MapPinned size={32} className="text-[#c9a96e]" />
        </div>
      </div>
      {/* Pin shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1">
        <div className="w-4 h-1.5 rounded-full bg-[#c9a96e]/20 pin-shadow-pulse" />
      </div>
      {/* Address label */}
      <div className="absolute bottom-3 left-3 right-3 text-center">
        <p className="text-[10px] text-[#8888a8]/60 tracking-wider">
          Teutoburger Straße 23 a, 33330 Gütersloh
        </p>
      </div>
    </div>
  );
}

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendAnimating, setSendAnimating] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      interesse: '',
      nachricht: '',
    },
  });

  async function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);
    setSendAnimating(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.vorname,
          lastName: data.nachname,
          email: data.email,
          phone: data.telefon || undefined,
          interest: data.interesse || undefined,
          message: data.nachricht || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: 'Fehler',
          description: result.error || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setSendAnimating(false);
        return;
      }

      toast({
        title: 'Nachricht gesendet',
        description:
          'Vielen Dank für Ihre Anfrage. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.',
      });
      form.reset();
    } catch {
      toast({
        title: 'Fehler',
        description: 'Netzwerkfehler. Bitte versuchen Sie es später erneut.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
    setTimeout(() => setSendAnimating(false), 600);
  }

  const inputClasses =
    'bg-[#12121f] border border-white/10 text-white focus:border-[#c9a96e] focus-visible:border-[#c9a96e] focus-visible:ring-[#c9a96e]/20 focus-visible:ring-2 placeholder:text-[#8888a8] transition-all duration-300';

  return (
    <section id="contact" className="relative bg-[#0f0f20] px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden">
      {/* Top gold divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

      {/* Subtle background pattern */}
      <div className="absolute inset-0 diagonal-lines pointer-events-none" />

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-20 h-20 border-t border-l border-[#c9a96e]/10 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-b border-r border-[#c9a96e]/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left column: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <div className="decorative-corners p-1">
              <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">
                KONTAKT
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider text-white mb-6 leading-tight">
                Lassen Sie uns Ihr{' '}
                <span className="text-gradient-gold">Traumhaus</span> planen
              </h2>
              <p className="text-sm sm:text-base text-[#8888a8] leading-relaxed mb-10 max-w-md">
                Vereinbaren Sie ein unverbindliches Beratungsgespräch und erfahren
                Sie, wie Ihr modulares Zuhause Wirklichkeit werden kann.
              </p>
            </div>

            {/* Contact details with hover lift cards */}
            <div className="flex flex-col gap-4">
              <ContactInfoCard icon={Phone} href="tel:+4915129530369">
                +49 151 29530369
              </ContactInfoCard>
              <ContactInfoCard icon={Mail} href="mailto:kontakt@omniliving-moduledesign-gmbh.com">
                kontakt@omniliving-moduledesign-gmbh.com
              </ContactInfoCard>
              <ContactInfoCard icon={MapPin}>
                <span>
                  Teutoburger Straße 23 a
                  <br />
                  33330 Gütersloh, Deutschland
                </span>
              </ContactInfoCard>
            </div>

            {/* Map placeholder with pin animation */}
            <div className="mt-8">
              <MapPlaceholder />
            </div>
          </motion.div>

          {/* Right column: Form with gold accent line */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="gold-accent-left pl-6"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="vorname"
                    render={({ field }) => (
                      <FormItem className="floating-label-group">
                        <FormLabel className="text-xs text-[#8888a8] tracking-wider uppercase">
                          Vorname
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Max"
                            className={inputClasses}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nachname"
                    render={({ field }) => (
                      <FormItem className="floating-label-group">
                        <FormLabel className="text-xs text-[#8888a8] tracking-wider uppercase">
                          Nachname
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mustermann"
                            className={inputClasses}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="floating-label-group">
                        <FormLabel className="text-xs text-[#8888a8] tracking-wider uppercase">
                          E-Mail
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="max@beispiel.de"
                            className={inputClasses}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefon"
                    render={({ field }) => (
                      <FormItem className="floating-label-group">
                        <FormLabel className="text-xs text-[#8888a8] tracking-wider uppercase">
                          Telefon
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+49 151 ..."
                            className={inputClasses}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="interesse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#8888a8] tracking-wider uppercase">
                        Interesse
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`w-full ${inputClasses} h-9`}
                          >
                            <SelectValue placeholder="Bitte wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#12121f] border border-white/10 text-white">
                          {interestOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-white focus:bg-[#1a1a2e] focus:text-white"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nachricht"
                  render={({ field }) => (
                    <FormItem className="floating-label-group">
                      <FormLabel className="text-xs text-[#8888a8] tracking-wider uppercase">
                        Ihre Nachricht
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Erzählen Sie uns von Ihrem Traumhaus..."
                          className={`${inputClasses} min-h-[120px] resize-none`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] font-medium tracking-[0.1em] uppercase px-8 py-6 text-sm transition-all duration-500 rounded-none border-0 relative overflow-hidden ${isSubmitting ? 'btn-loading' : ''}`}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 size={16} className="animate-spin" />
                        Wird gesendet...
                      </motion.span>
                    ) : sendAnimating ? (
                      <motion.span
                        key="sent"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Send size={16} className="send-fly" />
                        Gesendet!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Send size={16} />
                        Nachricht senden
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
