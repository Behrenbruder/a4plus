import Link from "next/link";
import ProductCarousel from "@/components/ProductCarousel";
import { LogoBadge } from "@/components/LogoBadge";

const slides = [
  { title: "PV-Anlagen", img: "/images/pv/pv.jpg", href: "produkte/pv/", caption: "Eigenen Strom erzeugen" },
  { title: "Wärmepumpen", img: "/images/waermepumpe/pumpe.jpg", href: "/produkte/waermepumpen", caption: "Nachhaltig heizen" },
  { title: "Batteriespeicher", img: "/images/batterie/speicher.jpg", href: "/produkte/batterie", caption: "Mehr Eigenverbrauch" },
  { title: "Fenster", img: "/images/fenster/window.webp", href: "/produkte/fenster", caption: "Wärmeschutz & Komfort" },
  { title: "Türen", img: "/images/tueren/tuer.jpg", href: "/produkte/tueren", caption: "Sicher & stilvoll" },
  { title: "Rolläden", img: "/images/beschattung/rollaeden/Aluprof SKO Vorwand.jpg", href: "/produkte/rollaeden", caption: "Sicht- & Hitzeschutz" },
  { title: "Dämmmaterial", img: "/images/daemmung/daemmung.jpg", href: "/produkte/daemmung", caption: "Energie sparen" },
];

export default function Home() {
  return (
    <div>

      {/* HERO */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: "url('/images/landing/Haus6.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Ihr Haus – Rundum Effizient</h1>
          <p className="text-lg md:text-xl text-gray-200">
            Fenster, Türen, Dämmung, PV, Speicher & Wärmepumpen – fair beraten, sauber montiert.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100">PV-Rechner starten</Link>
            <Link href="/kontakt" className="btn-primary">Angebot anfordern</Link>
          </div>
        </div>
      </section>

            {/* PRODUKT-KARUSSELL */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="h2 text-center mb-8">Unsere Produkte</h2>
          <ProductCarousel slides={slides} />
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
                Wir begleiten Sie bei der Beantragung – einfach, transparent und zuverlässig.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Niedrige Preise</h3>
              <p className="text-gray-600 text-sm">
                Durch regionale Zusammenarbeit mit Herstellern und Monteuren erzielen wir ein starkes Preis‑Leistungs‑Verhältnis.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Schnelle Amortisation</h3>
              <p className="text-gray-600 text-sm">
                Optimierte Komponenten‑Kombinationen sorgen für deutlich kürzere Amortisationszeiten.
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Familienunternehmen</h3>
              <p className="text-gray-600 text-sm">
                Persönliche Beratung und feste Ansprechpartner – bei uns zählt Handschlagqualität.
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
  </div>
  );
}
