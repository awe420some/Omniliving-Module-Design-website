import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Impressum – Omniliving Module Design GmbH',
  description: 'Impressum gemäß § 5 TMG',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a14]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/logo-omniliving.png"
              alt="Omniliving"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-sm tracking-[0.2em] text-[#c9a96e]/80 uppercase font-light group-hover:text-[#c9a96e] transition-colors">
              Omniliving
            </span>
          </Link>
          <span className="text-white/10">|</span>
          <span className="text-sm text-[#8888a8] tracking-wider">Impressum</span>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] text-[#c9a96e] uppercase mb-4">Rechtliches</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-white mb-4">
            Impressum
          </h1>
          <p className="text-sm text-[#8888a8]">Angaben gemäß § 5 TMG</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent mt-6" />
        </div>

        <div className="space-y-10 text-[#8888a8] text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Unternehmensangaben</h2>
            <p>
              Omniliving Module Design GmbH<br />
              Teutoburger Straße 23a<br />
              33330 Gütersloh<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Kontakt</h2>
            <p>
              Telefon: <a href="tel:+4915129530369" className="text-[#c9a96e] hover:underline">+49 151 29530369</a><br />
              E-Mail: <a href="mailto:kontakt@omniliving-moduledesign-gmbh.com" className="text-[#c9a96e] hover:underline">kontakt@omniliving-moduledesign-gmbh.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Vertretungsberechtigte Geschäftsführung</h2>
            <p>
              Nicole-Christine von Hardenberg – Gründung &amp; Geschäftsführung, Projektierung<br />
              Ilhan Das – Gründung &amp; Geschäftsführung, Elektrotechnik &amp; Solar<br />
              Edip Das – Gründung &amp; Geschäftsführung, Bauleitung
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Handelsregister</h2>
            <p>
              Registergericht: Amtsgericht Gütersloh<br />
              Registernummer: wird nach Eintragung ergänzt
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              wird nach Erteilung ergänzt
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Nicole-Christine von Hardenberg<br />
              Teutoburger Straße 23a<br />
              33330 Gütersloh
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c9a96e] hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              <br /><br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium tracking-wide mb-3 text-base">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <Link
            href="/"
            className="text-sm text-[#c9a96e] hover:text-[#dbb980] transition-colors tracking-wide"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>
    </div>
  );
}
