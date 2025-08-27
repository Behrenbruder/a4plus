// src/app/pv/page.tsx
import Link from "next/link";

export default function PVPage() {
  return (
    <div className="space-y-0">
      {/* HERO – Vollbreit mit Bildplatz und Overlay */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-center">
        {/* Hintergrundbild */}
        <img
          className="absolute inset-0 w-full h-full object-cover object-center"
          src="/images/pvprodukte/Haus6.jpg"
          alt="Modernes Haus mit Photovoltaikanlage"
        />

        {/* Overlay für Abdunklung */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Inhalt */}
        <div className="container relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="h1 text-white">
              Solarenergie mit Arteplus – Ihre Energie, Ihre Zukunft
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl">
              Produzieren Sie Ihren eigenen Strom, werden Sie unabhängiger von steigenden
              Energiepreisen und investieren Sie in eine saubere Zukunft.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100 w-full sm:w-auto">
                PV-Rechner starten
              </a>
              <a href="/kontakt" className="btn-ghost bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto">
                Beratung anfragen
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Intro */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Bildplatz – Motiv: Luftaufnahme PV‑Dach + Grünfläche/Stadt */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src="/images/pvprodukte/dude.jpg"
                  alt="Photovoltaik auf Einfamilienhaus"
                  className="w-full h-[250px] sm:h-[320px] lg:h-[400px] object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="h2">Ihre Unabhängigkeit beginnt auf dem Dach</h2>
              <p className="muted mt-3 sm:mt-4 text-responsive">
                Mit einer individuell geplanten Photovoltaikanlage erzeugen Sie Strom, genau dort, wo
                er gebraucht wird. A4Plus begleitet Sie von der Idee bis zum Betrieb – inklusive
                Fördermittel‑Beratung, fachgerechter Montage und Service.
              </p>

              <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                {[
                  "Mehr Unabhängigkeit von Strompreisen",
                  "Langfristige Ersparnis durch maximierten Eigenverbrauch",
                  "Nachhaltig & CO₂-arm",
                  "Wertsteigerung der Immobilie",
                  "Förderungen & steuerliche Vorteile",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                    <span className="text-sm sm:text-base">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="h2">Unser Leistungspaket</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {LEISTUNGEN.map((c) => (
              <div key={c.title} className="card touch-spacing text-center">
                <div className="text-2xl sm:text-3xl mb-3">{c.icon}</div>
                <h3 className="h3 mb-2">{c.title}</h3>
                <p className="muted text-sm sm:text-base">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kombinationen */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="h2">Mehr als nur Strom vom Dach</h2>
              <p className="muted mt-3 sm:mt-4 text-responsive">
                Solarstrom wirkt am stärksten, wenn Komponenten zusammenspielen: Speicher erhöht den
                Eigenverbrauch, Wärmepumpe nutzt Ihren Solarstrom für Wärme und eine Wallbox lädt Ihr
                Elektroauto zu Hause – sauber und günstig.
              </p>
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  "Batteriespeicher – höherer Eigenverbrauch",
                  "Wärmepumpe – Strom wird Wärme",
                  "Wallbox – Solarstrom fürs E‑Auto",
                  "Smart‑Home – intelligente Steuerung",
                ].map((f) => (
                  <div key={f} className="rounded-xl border border-gray-200 p-3 sm:p-4 text-sm sm:text-base hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/pv-rechner" className="btn-primary w-full sm:w-auto">
                  Ertrag & Größe berechnen
                </Link>
                <Link href="/kontakt" className="btn-ghost w-full sm:w-auto">
                  Kostenlose Beratung anfragen
                </Link>
              </div>
            </div>

            {/* Bildplatz – Motiv: Speicher im Technikraum + Wallbox in Garage (Diptych) */}
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src="/images/pvprodukte/wallbox.jpg"
                  alt="Wallbox für Elektroauto"
                  className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src="/images/pvprodukte/speicher2.jpg"
                  alt="Batteriespeicher im Hauswirtschaftsraum"
                  className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Förderungen */}
      <section className="section bg-emerald-50">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="h2">Förderungen & Finanzierung</h2>
            <p className="muted mt-3 sm:mt-4 max-w-3xl mx-auto text-responsive">
              Von bundesweiten Programmen bis zu Landes‑ und Kommunalförderungen: Wir prüfen
              Möglichkeiten, übernehmen auf Wunsch die Antragstellung und kombinieren Zuschüsse mit
              zinsgünstigen Krediten. Ziel: <b>Maximal fördern, minimal investieren.</b>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FOERDERN.map((f) => (
              <div key={f.title} className="card touch-spacing">
                <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
                <h3 className="h3 mb-2">{f.title}</h3>
                <p className="muted text-sm sm:text-base mb-4">{f.text}</p>
                <div>
                  <Link href={f.href} className="text-emerald-700 hover:text-emerald-800 underline text-sm sm:text-base transition-colors">
                    Mehr erfahren
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/pv-rechner" className="btn-primary w-full sm:w-auto">
              Wirtschaftlichkeits‑Check starten
            </Link>
            <Link href="/faq-foerderungen" className="btn-ghost w-full sm:w-auto">
              Zum Förder‑Check
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const LEISTUNGEN = [
  {
    icon: "🧭",
    title: "Individuelle Beratung & Planung",
    text: "Wir analysieren Dachform, Ausrichtung und Verbrauch und erstellen ein passgenaues Konzept.",
  },
  {
    icon: "💶",
    title: "Fördermittel‑Check",
    text: "Bund, Land, Kommune & steuerliche Vorteile – wir finden die besten Programme für Ihr Projekt.",
  },
  {
    icon: "🛠️",
    title: "Fachgerechte Montage",
    text: "Montage durch geprüfte Partner – normgerecht, sicher und sauber.",
  },
  {
    icon: "🔧",
    title: "Service & Wartung",
    text: "Regelmäßige Überprüfung und Optimierung für dauerhafte Effizienz.",
  },
];

const FOERDERN = [
  {
    icon: "🏛️",
    title: "Bundesweite Programme",
    text: "Zuschüsse, Kredite und Steuererleichterungen – wir prüfen, was sich kombinieren lässt.",
    href: "/faq-foerderungen",
  },
  {
    icon: "🗺️",
    title: "Land & Kommune",
    text: "Zusätzliche Landes- und Stadtprogramme steigern die Förderquote weiter.",
    href: "/faq-foerderungen",
  },
  {
    icon: "📈",
    title: "Wirtschaftlichkeit",
    text: "Mit unserem PV‑Rechner erhalten Sie eine transparente Vorschau auf Ertrag & Amortisation.",
    href: "/pv-rechner",
  },
];
