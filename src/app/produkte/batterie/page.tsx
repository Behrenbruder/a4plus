// src/app/batteriespeicher/page.tsx
import Link from "next/link";

export default function BatteriespeicherPage() {
  return (
    <div className="space-y-0">
      {/* HERO – Video-Hintergrund
         Motiv-Idee: Modernes Hauswirtschaftszimmer/Technikraum mit sauber montiertem Batteriespeicher,
         weiches Licht, leichte Kamerafahrt (Loop). */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center">
        {/* Hintergrundvideo */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero-speicher.mp4"  // <-- Video hier ablegen
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Abdunklung für Lesbarkeit */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Inhalt */}
        <div className="container relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Batteriespeicher – mehr Unabhängigkeit, mehr Eigenverbrauch
          </h1>
          <p className="mt-4 max-w-2xl text-gray-100">
            Speichern Sie Ihren Solarstrom und nutzen Sie ihn dann, wenn Sie ihn brauchen – abends,
            nachts oder bei Wolken. So senken Sie Ihre Stromkosten nachhaltig.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100">
              PV‑Rechner starten
            </Link>
            <Link href="/faq-foerderungen" className="btn-ghost bg-white/10 hover:bg-white/20 text-white">
              Förder‑Check
            </Link>
          </div>
        </div>
      </section>

      {/* Intro – Nutzen + Bildplatz */}
      <section className="section bg-white">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          {/* Bildplatz
             Motiv-Idee: Detailaufnahme eines Speicherschranks / Batterieschrankes,
             cleanes, modernes Design, evtl. Status‑LEDs. */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src="/images/speicher/intro-cabinet.jpg"  // <-- Bild ablegen
              alt="Moderner Batteriespeicher im Technikraum"
              className="w-full h-[320px] object-cover"
            />
          </div>

          <div>
            <h2 className="h2">Ihr Solarstrom – jederzeit verfügbar</h2>
            <p className="muted mt-2">
              Ein Batteriespeicher erhöht Ihren Eigenverbrauch und macht Solarenergie planbar.
              Wir beraten technologieoffen, planen passend zu Verbrauch und Dachanlage und übernehmen
              auf Wunsch auch die Fördermittel‑Prüfung.
            </p>

            <ul className="mt-6 grid gap-3">
              {[
                "Höherer Eigenverbrauch statt Netzeinspeisung",
                "Unabhängiger von Strompreisschwankungen",
                "Optimale Nutzung Ihrer PV‑Anlage",
                "Vorbereitung für Lastmanagement & Smart‑Home",
                "Förderungen & attraktive Finanzierung kombinierbar",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section className="section bg-gray-50">
        <div className="container">
          <h2 className="h2 text-center mb-10">Unser Leistungspaket</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEISTUNGEN.map((c) => (
              <div key={c.title} className="card p-6">
                <div className="text-3xl">{c.icon}</div>
                <h3 className="font-semibold mt-3">{c.title}</h3>
                <p className="muted mt-2">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zusammenspiel – Speicher + PV + Wärmepumpe + Wallbox */}
      <section className="section bg-white">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="h2">Das perfekte Team: Speicher, PV & Co.</h2>
            <p className="muted mt-2">
              Mit Speicher heben Sie das volle Potenzial Ihrer PV‑Anlage. In Kombination mit
              Wärmepumpe und Wallbox entsteht ein starkes System – Strom, Wärme und Mobilität
              intelligent vernetzt.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                "PV + Speicher – maximaler Eigenverbrauch",
                "Speicher + Wärmepumpe – Strom wird Wärme",
                "Wallbox – Laden mit eigenem Solarstrom",
                "Smart‑Home – flexible Lastverschiebung",
              ].map((f) => (
                <div key={f} className="rounded-xl border p-3 text-sm">
                  {f}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Link href="/pv-rechner" className="btn-primary">
                Größe & Wirtschaftlichkeit prüfen
              </Link>
              <Link href="/kontakt" className="btn-ghost">
                Kostenlose Beratung anfragen
              </Link>
            </div>
          </div>

          {/* Bildplätze (Diptych)
             Motive:
             - Links: PV‑Dach (Close‑up Modulstruktur)
             - Rechts: E‑Auto an Wallbox in Garage/Carport */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src="/images/speicher/pv-close.jpg"  // <-- Bild ablegen
                alt="PV‑Module – Detailaufnahme"
                className="w-full h-[300px] object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src="/images/speicher/wallbox-car.jpg"  // <-- Bild ablegen
                alt="Wallbox mit E‑Auto"
                className="w-full h-[300px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Förderungen – kompakt, mit Links/CTA */}
      <section className="section bg-emerald-50">
        <div className="container">
          <h2 className="h2">Förderungen & Finanzierung</h2>
          <p className="muted mt-2 max-w-3xl">
            Wir prüfen Zuschüsse und Kredite für Speicher und PV – von Bundes‑ bis Landesprogrammen
            und steuerlichen Vorteilen. Unser Ziel: <b>Maximale Förderung, minimaler Eigenanteil.</b>
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {FOERDERN.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-semibold mt-3">{f.title}</h3>
                <p className="muted mt-2">{f.text}</p>
                <div className="mt-4">
                  <Link href={f.href} className="text-emerald-700 underline">
                    Mehr erfahren
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pv-rechner" className="btn-primary">
              Förder‑ & Wirtschaftlichkeits‑Check starten
            </Link>
            <Link href="/faq-foerderungen" className="btn-ghost">
              Zu den Förder‑FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Use‑Cases / Bildband */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="h2 text-center">Einsatzbeispiele</h2>
          <p className="muted text-center mt-2">
            Passend für Einfamilienhaus, Mehrfamilienhaus und Gewerbe – wir planen skalierbar.
          </p>

          {/* 3er Bildband – Motive:
              - EFH Technikraum mit Speicher
              - MFH Keller mit mehreren Speichern/WR
              - Gewerbe (kleiner Betrieb) mit Energiespeicherlösung */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { src: "/images/speicher/case-efh.jpg", alt: "Batteriespeicher im Einfamilienhaus" },
              { src: "/images/speicher/case-mfh.jpg", alt: "Speicherlösung im Mehrfamilienhaus" },
              { src: "/images/speicher/case-commercial.jpg", alt: "Gewerblicher Speicher" },
            ].map((img) => (
              <div key={img.src} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img src={img.src} alt={img.alt} className="w-full h-[240px] object-cover" />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/pv-rechner" className="btn-primary">
              Jetzt PV‑Rechner öffnen
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
