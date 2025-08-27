import Link from "next/link";
import Image from "next/image";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCarouselWide from "@/components/ProductCarouselWide";
import { LogoBadge } from "@/components/LogoBadge";


export default function Home() {
  return (
    <div>

      {/* HERO – stabil und fokussiert */}
      <section className="relative min-h-[50vh] sm:min-h-[70vh] md:min-h-[70vh] lg:min-h-[72vh] flex items-center justify-center text-center text-white overflow-hidden">
        {/* Bild als <Image> mit responsive Fokus */}
        <Image
          src="/images/landing/Haus.jpg"
          alt="Modernes Haus mit Photovoltaikanlage - Arteplus Energieeffizienz"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="
            object-cover
            object-[50%_20%]     /* Mobile: Fokus etwas höher */
            sm:object-[50%_35%]  /* Small: mittlerer Fokus */
            md:object-[50%_40%]  /* Tablet: noch ein Stück höher */
            lg:object-[50%_80%]  /* Desktop: zentriert */
          "
        />

        {/* Overlay für Lesbarkeit */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Inhalt */}
        <div className="relative z-20 container max-w-4xl">
          <h1 className="h1 mb-4 sm:mb-6">Ihr Haus – Rundum Effizient</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Fenster, Türen, Dämmung, PV, Speicher & Wärmepumpen – fair beraten, sauber montiert.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100 w-full sm:w-auto">
              PV‑Rechner starten
            </Link>
            <Link href="/kontakt" className="btn-primary w-full sm:w-auto">
              Angebot anfordern
            </Link>
          </div>
        </div>
      </section>



      {/* PRODUKT-ICONS GRID */}
      <section className="py- sm:py- md:py-2 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <Link href="/produkte/fenster" className="flex flex-col items-center group touch-spacing">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/fenster.png" alt="Fenster" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors leading-tight">
                Fenster & Beschattung
              </span>
            </Link>

            <Link href="/produkte/pv" className="flex flex-col items-center group touch-spacing">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/pv2.png" alt="PV-Anlagen" className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors leading-tight">
                PV-Anlagen
              </span>
            </Link>

            <Link href="/produkte/batterie" className="flex flex-col items-center group touch-spacing">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/battery2.png" alt="Solarspeicher" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors leading-tight">
                Solarspeicher
              </span>
            </Link>

            <Link href="/produkte/waermepumpen" className="flex flex-col items-center group touch-spacing">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/waermepumpe2.png" alt="Wärmepumpen" className="w-13 h-13 sm:w-17 sm:h-17 object-contain" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors leading-tight">
                Wärmepumpen
              </span>
            </Link>

            <Link href="/produkte/tueren" className="flex flex-col items-center group touch-spacing col-span-2 sm:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/tür.png" alt="Türen" className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors leading-tight">
                Türen
              </span>
            </Link>

          </div>
        </div>
      </section>

            {/* UNSER AUFTRAG */}
      <section className="section bg-white">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="h2">Unser Auftrag – Eure Energieeffizienz</h2>
            <p className="muted mt-3 sm:mt-4 max-w-2xl mx-auto text-responsive">
              Warum energetisch sanieren? Weil es heute wichtiger ist als je zuvor. 
              Wir zeigen, welche Vorteile Sie direkt nutzen können – für Ihr Haus, 
              Ihren Geldbeutel und unsere gemeinsame Zukunft.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Grund 1 */}
            <div className="card touch-spacing text-center">
              <div className="text-2xl sm:text-3xl mb-3">💡</div>
              <h3 className="h3 mb-2">Energie & Kosten sparen</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Moderne Dämmung, effiziente Fenster, PV und Wärmepumpen reduzieren
                Energieverluste drastisch und senken dauerhaft Ihre Heiz- und Stromkosten.
              </p>
            </div>

            {/* Grund 2 */}
            <div className="card touch-spacing text-center">
              <div className="text-2xl sm:text-3xl mb-3">🌍</div>
              <h3 className="h3 mb-2">Klimaschutz aktiv leben</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Jede eingesparte Kilowattstunde verringert den CO₂-Ausstoß. 
                Mit Ihrer Sanierung leisten Sie einen direkten Beitrag zu einer sauberen Zukunft.
              </p>
            </div>

            {/* Grund 3 */}
            <div className="card touch-spacing text-center">
              <div className="text-2xl sm:text-3xl mb-3">📈</div>
              <h3 className="h3 mb-2">Wert steigern</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Energetisch sanierte Gebäude sind attraktiver, erzielen höhere Marktwerte 
                und bleiben langfristig konkurrenzfähig – ein Gewinn für Eigentümer und Erben.
              </p>
            </div>

            {/* Grund 4 */}
            <div className="card touch-spacing text-center">
              <div className="text-2xl sm:text-3xl mb-3">⏱️</div>
              <h3 className="h3 mb-2">Jetzt handeln lohnt sich</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Staatliche Förderungen und steigende Energiepreise machen eine Sanierung 
                aktuell besonders wirtschaftlich. Wer wartet, riskiert höhere Kosten.
              </p>
            </div>

            {/* Grund 5 */}
            <div className="card touch-spacing text-center">
              <div className="text-2xl sm:text-3xl mb-3">🤝</div>
              <h3 className="h3 mb-2">Komplettservice</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Von Beratung über Planung bis zur Montage – wir begleiten Sie 
                herstellerunabhängig und sorgen für eine reibungslose Umsetzung.
              </p>
            </div>

            {/* Grund 6 */}
            <div className="card touch-spacing text-center">
              <div className="text-2xl sm:text-3xl mb-3">🚀</div>
              <h3 className="h3 mb-2">Schnelle Amortisation</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Durch effiziente Systeme und kluge Kombinationen erreichen Sie 
                die Investitionsrückzahlung schneller, als viele denken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="section bg-emerald-600 text-white text-center">
        <div className="container max-w-3xl mx-auto">
          <h2 className="h2 mb-4 sm:mb-6">Starten Sie Ihre Sanierung noch heute</h2>
          <p className="text-responsive mb-6 sm:mb-8">Nutzen Sie unseren PV-Rechner oder fordern Sie direkt Ihr Angebot an.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100 w-full sm:w-auto">
              PV-Rechner starten
            </Link>
            <Link href="/kontakt" className="btn-primary bg-emerald-500 hover:bg-emerald-700 text-white w-full sm:w-auto">
              Angebot anfordern
            </Link>
          </div>
        </div>
      </section>
          {/* Monteure gesucht Sektion */}
      <section className="section bg-emerald-50">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="h2 text-emerald-800 mb-4">
            🚧 Monteure gesucht – Werde Teil unseres Teams!
          </h2>
          <p className="text-responsive text-gray-700 max-w-2xl mx-auto mb-6 sm:mb-8">
            Wir suchen motivierte Monteure (m/w/d) für die Montage von Fenstern, Türen, 
            Wärmepumpen, Photovoltaikanlagen und mehr. Egal ob selbstständig oder festangestellt – 
            wir bieten dir spannende Projekte, faire Bezahlung und ein starkes Team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-4 sm:mb-6">
            <a
              href="/downloads/monteur-fragenbogen.pdf"
              download
              className="btn-primary w-full sm:w-auto"
            >
              📄 Fragebogen herunterladen
            </a>
            <a
              href="mailto:montage@arteplus.de?subject=Bewerbung%20als%20Monteur&body=Sehr%20geehrtes%20Arteplus-Team,%0A%0Aich%20möchte%20mich%20als%20Monteur%20bewerben%20und%20habe%20den%20Fragebogen%20ausgefüllt.%0A%0AAnbei%20finden%20Sie%20meine%20Unterlagen."
              className="btn-ghost w-full sm:w-auto"
            >
              📧 Per E-Mail einsenden
            </a>
            <a
              href="tel:+4962333898860"
              className="btn-ghost w-full sm:w-auto"
            >
              📞 Anrufen
            </a>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Bitte laden Sie den Fragebogen herunter und senden Ihn 
            anschließend ausgefüllt per E-Mail an <a href="mailto:montage@arteplus.de" className="underline hover:text-emerald-600 transition-colors">montage@arteplus.de</a> oder rufen Sie uns einfach an.
          </p>
        </div>
      </section>

      {/* WARUM a4+ */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="h2 mb-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span>Warum</span>
              <LogoBadge className="text-[0.8em]" />
            </h2>
            <p className="muted mt-2 text-responsive">
              Höchste Effizienz, faire Preise und eine schnelle Amortisation – unabhängig von Herstellern und konsequent auf Ihr Projekt zugeschnitten.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="card touch-spacing text-center">
              <h3 className="h3 mb-2">Kundenorientiert</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Wir wählen herstellerübergreifend die passende Lösung für Ihre individuellen Anforderungen.
              </p>
            </div>

            <div className="card touch-spacing text-center">
              <h3 className="h3 mb-2">Gesamtpaket</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Von Rollläden und Dämmung bis Wärmepumpen und PV – alles aus einer Hand.
              </p>
            </div>

            <div className="card touch-spacing text-center">
              <h3 className="h3 mb-2">Fördergeld‑Beratung</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Für ihre individuelle Projektanfrage prüfen und informieren wir Sie über alle geltenden Förderprogramme.
              </p>
            </div>

            <div className="card touch-spacing text-center">
              <h3 className="h3 mb-2">Niedrige Preise</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Durch regionale Zusammenarbeit mit Herstellern und Monteuren erzielen wir ein starkes Preis-Leistungs‑Verhältnis.
              </p>
            </div>

            <div className="card touch-spacing text-center">
              <h3 className="h3 mb-2">Schnelle Amortisation</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Effiziente PV-Komponenten und hohe Isolationsstandards sorgen für eine schnelle Amortisationszeit.
              </p>
            </div>

            <div className="card touch-spacing text-center">
              <h3 className="h3 mb-2">Familienunternehmen</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Persönliche Beratung und feste Ansprechpartner sorgen für eine vertraute und angenehme Kundenatmosphäre.
              </p>
            </div>
          </div>
        </div>
      </section>
  </div>
  );
}
