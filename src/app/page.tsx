import Link from "next/link";
import Image from "next/image";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCarouselWide from "@/components/ProductCarouselWide";
import { LogoBadge } from "@/components/LogoBadge";


export default function Home() {
  return (
    <div>

      {/* HERO – stabil und fokussiert */}
      <section className="relative min-h-[60svh] md:min-h-[72vh] flex items-center justify-center text-center text-white overflow-hidden">
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
            object-[50%_20%]     /* Handy: Fokus etwas höher */
            sm:object-[50%_38%]
            md:object-[50%_35%]  /* Tablet: noch ein Stück höher */
            lg:object-[50%_80%]    /* Desktop: zentriert */
          "
        />

        {/* Overlay für Lesbarkeit */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Inhalt */}
        <div className="relative z-20 px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Ihr Haus – Rundum Effizient</h1>
          <p className="text-lg md:text-xl text-gray-200">
            Fenster, Türen, Dämmung, PV, Speicher & Wärmepumpen – fair beraten, sauber montiert.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100">
              PV‑Rechner starten
            </Link>
            <Link href="/kontakt" className="btn-primary">
              Angebot anfordern
            </Link>
          </div>
        </div>
      </section>



      {/* PRODUKT-ICONS GRID */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            <Link href="/produkte/fenster" className="flex flex-col items-center group">
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/fenster.png" alt="Fenster" className="w-16 h-16 object-contain" />
              </div>
              <span className="text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors">
                Fenster & Beschattung
              </span>
            </Link>

            <Link href="/produkte/pv" className="flex flex-col items-center group">
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/pv2.png" alt="PV-Anlagen" className="w-20 h-20 object-contain" />
              </div>
              <span className="text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors">
                PV-Anlagen
              </span>
            </Link>

            <Link href="/produkte/batterie" className="flex flex-col items-center group">
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/battery2.png" alt="Solarspeicher" className="w-16 h-16 object-contain" />
              </div>
              <span className="text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors">
                Solarspeicher
              </span>
            </Link>

            <Link href="/produkte/waermepumpen" className="flex flex-col items-center group">
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/waermepumpe2.png" alt="Wärmepumpen" className="w-17 h-17 object-contain" />
              </div>
              <span className="text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors">
                Wärmepumpen
              </span>
            </Link>

            <Link href="/produkte/tueren" className="flex flex-col items-center group">
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/icons/tür.png" alt="Türen" className="w-20 h-20 object-contain" />
              </div>
              <span className="text-sm font-medium text-center text-gray-700 group-hover:text-emerald-600 transition-colors">
                Türen
              </span>
            </Link>

          </div>
        </div>
      </section>

            {/* UNSER AUFTRAG */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="h2">Unser Auftrag – Eure Energieeffizienz</h2>
            <p className="muted mt-3 max-w-2xl mx-auto">
              Warum energetisch sanieren? Weil es heute wichtiger ist als je zuvor. 
              Wir zeigen, welche Vorteile Sie direkt nutzen können – für Ihr Haus, 
              Ihren Geldbeutel und unsere gemeinsame Zukunft.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Grund 1 */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-semibold text-lg mb-2">Energie & Kosten sparen</h3>
              <p className="text-gray-600 text-sm">
                Moderne Dämmung, effiziente Fenster, PV und Wärmepumpen reduzieren
                Energieverluste drastisch und senken dauerhaft Ihre Heiz- und Stromkosten.
              </p>
            </div>

            {/* Grund 2 */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-semibold text-lg mb-2">Klimaschutz aktiv leben</h3>
              <p className="text-gray-600 text-sm">
                Jede eingesparte Kilowattstunde verringert den CO₂-Ausstoß. 
                Mit Ihrer Sanierung leisten Sie einen direkten Beitrag zu einer sauberen Zukunft.
              </p>
            </div>

            {/* Grund 3 */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-lg mb-2">Wert steigern</h3>
              <p className="text-gray-600 text-sm">
                Energetisch sanierte Gebäude sind attraktiver, erzielen höhere Marktwerte 
                und bleiben langfristig konkurrenzfähig – ein Gewinn für Eigentümer und Erben.
              </p>
            </div>

            {/* Grund 4 */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-semibold text-lg mb-2">Jetzt handeln lohnt sich</h3>
              <p className="text-gray-600 text-sm">
                Staatliche Förderungen und steigende Energiepreise machen eine Sanierung 
                aktuell besonders wirtschaftlich. Wer wartet, riskiert höhere Kosten.
              </p>
            </div>

            {/* Grund 5 */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold text-lg mb-2">Komplettservice</h3>
              <p className="text-gray-600 text-sm">
                Von Beratung über Planung bis zur Montage – wir begleiten Sie 
                herstellerunabhängig und sorgen für eine reibungslose Umsetzung.
              </p>
            </div>

            {/* Grund 6 */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-lg mb-2">Schnelle Amortisation</h3>
              <p className="text-gray-600 text-sm">
                Durch effiziente Systeme und kluge Kombinationen erreichen Sie 
                die Investitionsrückzahlung schneller, als viele denken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 bg-emerald-600 text-white text-center">
        <h2 className="text-3xl font-semibold mb-4">Starten Sie Ihre Sanierung noch heute</h2>
        <p className="mb-8">Nutzen Sie unseren PV-Rechner oder fordern Sie direkt Ihr Angebot an.</p>
        <div className="flex justify-center gap-4">
          <Link href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100">
            PV-Rechner starten
          </Link>
          <Link href="/kontakt" className="btn-primary bg-emerald-500 hover:bg-emerald-700 text-white">
            Angebot anfordern
          </Link>
        </div>
      </section>
          {/* Monteure gesucht Sektion */}
      <section className="bg-emerald-50 py-12 mt-16">
        <div className="max-w-screen-lg mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-emerald-800">
            🚧 Monteure gesucht – Werde Teil unseres Teams!
          </h2>
          <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
            Wir suchen motivierte Monteure (m/w/d) für die Montage von Fenstern, Türen, 
            Wärmepumpen, Photovoltaikanlagen und mehr. Egal ob selbstständig oder festangestellt – 
            wir bieten dir spannende Projekte, faire Bezahlung und ein starkes Team.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/downloads/monteur-fragenbogen.pdf"
              download
              className="btn-primary px-6 py-3 text-lg rounded-xl"
            >
              📄 Fragebogen herunterladen
            </a>
            <a
              href="mailto:montage@arteplus.de?subject=Bewerbung%20als%20Monteur&body=Sehr%20geehrtes%20Arteplus-Team,%0A%0Aich%20möchte%20mich%20als%20Monteur%20bewerben%20und%20habe%20den%20Fragebogen%20ausgefüllt.%0A%0AAnbei%20finden%20Sie%20meine%20Unterlagen."
              className="btn-ghost px-6 py-3 text-lg rounded-xl"
            >
              📧 Per E-Mail einsenden
            </a>
            <a
              href="tel:+4962333898860"
              className="btn-ghost px-6 py-3 text-lg rounded-xl"
            >
              📞 Anrufen
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Bitte laden Sie den Fragebogen herunter und senden Ihn 
            anschließend ausgefüllt per E-Mail an <a href="mailto:montage@arteplus.de" className="underline">montage@arteplus.de </a>oder rufen Sie uns einfach an.
          </p>
        </div>
      </section>

      {/* WARUM a4+ */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="h2 mb-2 flex items-center justify-center gap-3">
              <span>Warum</span>
              <LogoBadge className="text-[0.8em]" />
            </h2>
            <p className="muted mt-2">
              Höchste Effizienz, faire Preise und eine schnelle Amortisation – unabhängig von Herstellern und konsequent auf Ihr Projekt zugeschnitten.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Kundenorientiert</h3>
              <p className="text-gray-600 text-sm">
                Wir wählen herstellerübergreifend die passende Lösung für Ihre individuellen Anforderungen.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Gesamtpaket</h3>
              <p className="text-gray-600 text-sm">
                Von Rollläden und Dämmung bis Wärmepumpen und PV – alles aus einer Hand.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Fördergeld‑Beratung</h3>
              <p className="text-gray-600 text-sm">
                Für ihre individuelle Projektanfrgae prüfen und informieren wir Sie über alle geltenden Förderprogramme.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Niedrige Preise</h3>
              <p className="text-gray-600 text-sm">
                Durch regionale Zusammenarbeit mit Herstellern und Monteuren erzielen wir ein starkes Preis-Leistungs‑Verhältnis.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Schnelle Amortisation</h3>
              <p className="text-gray-600 text-sm">
                Effiziente PV-Komponenten und hohe Isolationsstandards Sorgen für eine schnelle Amortisationszeit.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Familienunternehmen</h3>
              <p className="text-gray-600 text-sm">
                Persönliche Beratung und feste Ansprechpartner sorgen für eine vertraute und angenehme Kundenatmospähre.
              </p>
            </div>
          </div>
        </div>
      </section>
  </div>
  );
}
