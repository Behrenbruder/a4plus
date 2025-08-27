import Link from "next/link";

export default function BatteriespeicherPage() {
  return (
    <div className="space-y-0">
      {/* HERO – Video-Hintergrund */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-center">
        {/* Hintergrundbild */}
        <img
          className="absolute inset-0 w-full h-full object-cover object-center"
          src="/images/batterie/himmel.jpg"
          alt="Batteriespeicher Hintergrund"
        />
        {/* Abdunklung für Lesbarkeit */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Inhalt */}
        <div className="container relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="h1 text-white">
              Batteriespeicher – mehr Unabhängigkeit, mehr Eigenverbrauch
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl">
              Speichern Sie Ihren Solarstrom und nutzen Sie ihn dann, wenn Sie ihn brauchen – abends,
              nachts oder bei Wolken. So senken Sie Ihre Stromkosten nachhaltig.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100 w-full sm:w-auto">
                PV‑Rechner starten
              </Link>
              <Link href="/faq-foerderungen" className="btn-ghost bg-white/10 hover:bg-white/20 text-white w-full sm:w-auto">
                Förder‑Check
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro – Nutzen + Bildplatz */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Bildplatz */}
            <div className="order-2 lg:order-1">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <video
                  src="/images/batterie/charging.mp4"
                  className="w-full h-[250px] sm:h-[320px] lg:h-[400px] object-cover"
                  autoPlay
                  loop 
                  muted
                  playsInline
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="h2">Ihr Solarstrom – jederzeit verfügbar</h2>
              <p className="muted mt-3 sm:mt-4 text-responsive">
                Ein Batteriespeicher erhöht Ihren Eigenverbrauch und macht Solarenergie planbar.
                Wir beraten technologieoffen, planen passend zu Verbrauch und Dachanlage und übernehmen
                auf Wunsch auch die Fördermittel‑Prüfung.
              </p>

              <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                {[
                  "Höherer Eigenverbrauch statt Netzeinspeisung",
                  "Unabhängiger von Strompreisschwankungen",
                  "Optimale Nutzung Ihrer PV‑Anlage",
                  "Vorbereitung für Lastmanagement & Smart‑Home",
                  "Förderungen & attraktive Finanzierung kombinierbar",
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

      {/* Zusammenspiel – Speicher + PV + Wärmepumpe + Wallbox */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="h2">Das perfekte Team: Speicher, PV & Co.</h2>
              <p className="muted mt-3 sm:mt-4 text-responsive">
                Mit Speicher heben Sie das volle Potenzial Ihrer PV‑Anlage. In Kombination mit
                Wärmepumpe und Wallbox entsteht ein starkes System – Strom, Wärme und Mobilität
                intelligent vernetzt.
              </p>
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  "PV + Speicher – maximaler Eigenverbrauch",
                  "Speicher + Wärmepumpe – Strom wird Wärme",
                  "Wallbox – Laden mit eigenem Solarstrom",
                  "Smart‑Home – flexible Lastverschiebung",
                ].map((f) => (
                  <div key={f} className="rounded-xl border border-gray-200 p-3 sm:p-4 text-sm sm:text-base hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/pv-rechner" className="btn-primary w-full sm:w-auto">
                  Größe & Wirtschaftlichkeit prüfen
                </Link>
                <Link href="/kontakt" className="btn-ghost w-full sm:w-auto">
                  Kostenlose Beratung anfragen
                </Link>
              </div>
            </div>

            {/* Bildplätze (Diptych) */}
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src="/images/pvprodukte/wallbox.jpg"
                  alt="PV‑Module – Detailaufnahme"
                  className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover"
                />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src="/images/pvprodukte/speicher2.jpg"
                  alt="Wallbox mit E‑Auto"
                  className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Förderungen – kompakt, mit Links/CTA */}
      <section className="section bg-emerald-50">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="h2">Förderungen & Finanzierung</h2>
            <p className="muted mt-3 sm:mt-4 max-w-3xl mx-auto text-responsive">
              Wir prüfen Zuschüsse und Kredite für Speicher und PV – von Bundes‑ bis Landesprogrammen
              und steuerlichen Vorteilen. Unser Ziel: <b>Maximale Förderung, minimaler Eigenanteil.</b>
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
              Förder‑ & Wirtschaftlichkeits‑Check starten
            </Link>
            <Link href="/faq-foerderungen" className="btn-ghost w-full sm:w-auto">
              Zu den Förder‑FAQs
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
    title: "Individuelle Beratung & Dimensionierung",
    text: "Wir analysieren Verbrauchsprofile und empfehlen eine passende Speichergröße.",
  },
  {
    icon: "🔌",
    title: "Integration & Installation",
    text: "Fachgerechte Einbindung in bestehende PV‑Anlagen und Hausnetz durch Partnerbetriebe.",
  },
  {
    icon: "💶",
    title: "Fördermittel‑Check",
    text: "Wir prüfen förderfähige Zuschüsse & Kredite und kombinieren sinnvoll.",
  },
  {
    icon: "📈",
    title: "Service & Monitoring",
    text: "Laufende Effizienz, Sicherheit und Transparenz durch regelmäßige Checks.",
  },
];

const FOERDERN = [
  {
    icon: "🏛️",
    title: "Bundesweite Programme",
    text: "Zuschüsse, Ergänzungskredite und steuerliche Vorteile für Speicher & PV.",
    href: "/faq-foerderungen",
  },
  {
    icon: "🗺️",
    title: "Länderförderung",
    text: "Zusätzliche Zuschüsse in einzelnen Bundesländern erhöhen die Förderung.",
    href: "/faq-foerderungen",
  },
  {
    icon: "🧮",
    title: "Wirtschaftlichkeit",
    text: "Mit unserem PV‑Rechner skizzieren wir Ersparnis und Amortisation.",
    href: "/pv-rechner",
  },
];
