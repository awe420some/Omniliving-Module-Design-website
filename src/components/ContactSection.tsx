'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
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

export default function ContactSection() {
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

  function onSubmit(_data: ContactFormData) {
    toast({
      title: 'Nachricht gesendet',
      description:
        'Vielen Dank für Ihre Anfrage. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.',
    });
    form.reset();
  }

  const inputClasses =
    'bg-[#12121f] border border-white/10 text-white focus:border-[#c9a96e] focus-visible:border-[#c9a96e] focus-visible:ring-[#c9a96e]/20 placeholder:text-[#8888a8]';

  return (
    <section id="contact" className="relative bg-[#0f0f20] px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Top gold divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left column: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
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

            {/* Contact details */}
            <div className="flex flex-col gap-5">
              <a
                href="tel:+4930123456789"
                className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center group-hover:border-[#c9a96e]/30 transition-colors duration-300">
                  <Phone size={16} className="text-[#c9a96e]" />
                </div>
                +49 30 123 456 789
              </a>
              <a
                href="mailto:info@omniliving.de"
                className="flex items-center gap-3 text-sm text-[#8888a8] hover:text-[#c9a96e] transition-colors duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center group-hover:border-[#c9a96e]/30 transition-colors duration-300">
                  <Mail size={16} className="text-[#c9a96e]" />
                </div>
                info@omniliving.de
              </a>
              <div className="flex items-center gap-3 text-sm text-[#8888a8]">
                <div className="w-10 h-10 rounded-lg bg-[#12121f] border border-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-[#c9a96e]" />
                </div>
                <span>
                  Musterstraße 42
                  <br />
                  10115 Berlin, Deutschland
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Vorname */}
                  <FormField
                    control={form.control}
                    name="vorname"
                    render={({ field }) => (
                      <FormItem>
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

                  {/* Nachname */}
                  <FormField
                    control={form.control}
                    name="nachname"
                    render={({ field }) => (
                      <FormItem>
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
                  {/* E-Mail */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
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

                  {/* Telefon */}
                  <FormField
                    control={form.control}
                    name="telefon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-[#8888a8] tracking-wider uppercase">
                          Telefon
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+49 30 ..."
                            className={inputClasses}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Interesse */}
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

                {/* Nachricht */}
                <FormField
                  control={form.control}
                  name="nachricht"
                  render={({ field }) => (
                    <FormItem>
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

                {/* Submit button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#dbb980] hover:to-[#c9a96e] text-[#0a0a14] font-medium tracking-[0.1em] uppercase px-8 py-6 text-sm transition-all duration-500 rounded-none border-0"
                >
                  <Send size={16} className="mr-2" />
                  Nachricht senden
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
