import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung – Omniliving Module Design GmbH',
  description: 'Datenschutzerklärung gemäß DSGVO',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#1E3429] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#1E3429]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/logo-omniliving.png"
              alt="Omniliving"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
            <span className="text-sm tracking-[0.2em] text-[#C3F8BD]/80 uppercase font-light group-hover:text-[#C3F8BD] transition-colors">
              Omniliving
            </span>
          </Link>
          <span className="text-white/10">|</span>
          <span className="text-sm text-[#D4C5A0] tracking-wider">Datenschutz</span>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] text-[#C3F8BD] uppercase mb-4">Rechtliches</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-white mb-4">
            Datenschutzerklärung
          </h1>
          <p className="text-sm text-[#D4C5A0]">Gemäß DSGVO, BDSG und TMG</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C3F8BD] to-transparent mt-6" />
        </div>

        <div className="space-y-10 text-[#D4C5A0] text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-white/70 font-medium mb-2">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
              persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">2. Verantwortliche Stelle</h2>
            <p>
              Omniliving Module Design GmbH<br />
              Teutoburger Straße 23a<br />
              33330 Gütersloh<br />
              Deutschland<br /><br />
              E-Mail: <a href="mailto:kontakt@omniliving-moduledesign-gmbh.com" className="text-[#C3F8BD] hover:underline">kontakt@omniliving-moduledesign-gmbh.com</a><br />
              Telefon: <a href="tel:+4915129530369" className="text-[#C3F8BD] hover:underline">+49 151 29530369</a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">3. Datenerfassung auf dieser Website</h2>
            <h3 className="text-white/70 font-medium mb-2">Wer ist verantwortlich für die Datenerfassung?</h3>
            <p>
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
              können Sie dem Abschnitt „Verantwortliche Stelle" in dieser Datenschutzerklärung entnehmen.
            </p>
            <h3 className="text-white/70 font-medium mb-2 mt-4">Wie erfassen wir Ihre Daten?</h3>
            <p>
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen – beispielsweise durch
              Eingabe in unser Kontaktformular. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim
              Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten
              (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">4. Hosting (Vercel)</h2>
            <p>
              Diese Website wird bei Vercel Inc., 340 Pine Street, Suite 1601, San Francisco, CA 94104, USA
              gehostet. Vercel ist ein Auftragsverarbeiter nach Art. 28 DSGVO. Beim Aufruf unserer Website
              erfasst Vercel automatisch Serverlogdaten (IP-Adresse, Zeitpunkt, aufgerufene URL). Diese Daten
              werden zur Bereitstellung und Absicherung des Dienstes verarbeitet. Details entnehmen Sie der{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C3F8BD] hover:underline"
              >
                Datenschutzerklärung von Vercel
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">5. Kontaktformular</h2>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
              Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der
              Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht
              ohne Ihre Einwilligung weiter.<br /><br />
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) sowie Art. 6 Abs. 1 lit. f
              DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">6. Cookies</h2>
            <p>
              Diese Website verwendet funktionale Cookies, um Ihre Sprachpräferenz zu speichern
              (localStorage-Key: <code className="bg-white/5 px-1 rounded text-xs">omniliving-locale</code>).
              Diese Daten verlassen Ihr Gerät nicht. Darüber hinaus werden keine Tracking- oder
              Analyse-Cookies eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">7. Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht auf kostenlose Auskunft über Ihre gespeicherten personenbezogenen
              Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie das Recht auf
              Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema
              Datenschutz können Sie sich jederzeit an uns wenden.<br /><br />
              Sie haben zudem das Recht auf Einschränkung der Verarbeitung sowie ein Widerspruchsrecht
              (Art. 21 DSGVO) und das Recht auf Datenübertragbarkeit (Art. 20 DSGVO).<br /><br />
              Darüber hinaus steht Ihnen das Recht zu, sich bei einer Datenschutz-Aufsichtsbehörde
              zu beschweren – in Berlin ist das die{' '}
              <a
                href="https://www.datenschutz-berlin.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C3F8BD] hover:underline"
              >
                Berliner Beauftragte für Datenschutz und Informationsfreiheit
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">8. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
              rechtlichen Anforderungen entspricht. Die jeweils aktuelle Version finden Sie unter
              /datenschutz auf dieser Website.
            </p>
          </section>

          <p className="text-xs text-[#D4C5A0]/50 pt-4 border-t border-white/5">
            Stand: Mai 2026
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <Link
            href="/"
            className="text-sm text-[#C3F8BD] hover:text-[#DFFCD9] transition-colors tracking-wide"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>
    </div>
  );
}
