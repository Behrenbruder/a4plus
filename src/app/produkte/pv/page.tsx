// src/app/pv/page.tsx
import Link from "next/link";

export default function PVPage() {
  return (
    <div className="space-y-0">
      {/* HERO – Vollbreit mit Bildplatz und Overlay
         Motiv-Idee: Moderne Hausfassade in der Abendsonne mit PV auf Satteldach
         (warme Lichtstimmung, seriös, clean) */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center">
        {/* Hintergrundvideo */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/images/pvprodukte/hero.mp4" // Dein Video im public/videos-Ordner
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Overlay für Abdunklung */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Inhalt */}
        <div className="container relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-semibold">
            Solarenergie mit Arteplus – Ihre Energie, Ihre Zukunft
          </h1>
          <p className="mt-4 max-w-2xl text-gray-100">
            Produzieren Sie Ihren eigenen Strom, werden Sie unabhängiger von steigenden
            Energiepreisen und investieren Sie in eine saubere Zukunft.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/pv-rechner" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100">
              PV-Rechner starten
            </a>
          </div>
        </div>
      </section>


      {/* Intro */}
      <section className="section bg-white">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          {/* Bildplatz – Motiv: Luftaufnahme PV‑Dach + Grünfläche/Stadt */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src="/images/pvprodukte/pv2.jpg" // <-- Bild ablegen
              alt="Photovoltaik auf Einfamilienhaus"
              className="w-full h-[320px] object-cover"
            />
          </div>

          <div>
            <h2 className="h2">Ihre Unabhängigkeit beginnt auf dem Dach</h2>
            <p className="muted mt-2">
              Mit einer individuell geplanten Photovoltaikanlage erzeugen Sie Strom, genau dort, wo
              er gebraucht wird. Arteplus begleitet Sie von der Idee bis zum Betrieb – inklusive
              Fördermittel‑Beratung, fachgerechter Montage und Service.
            </p>

            <ul className="mt-6 grid gap-3">
              {[
                "Mehr Unabhängigkeit von Strompreisen",
                "Langfristige Ersparnis durch Eigenverbrauch",
                "Nachhaltig & CO₂‑frei",
                "Wertsteigerung der Immobilie",
                "Förderungen & steuerliche Vorteile",
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

      {/* Kombinationen */}
      <section className="section bg-white">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="h2">Mehr als nur Strom vom Dach</h2>
            <p className="muted mt-2">
              Solarstrom wirkt am stärksten, wenn Komponenten zusammenspielen: Speicher erhöht den
              Eigenverbrauch, Wärmepumpe nutzt Ihren Solarstrom für Wärme und eine Wallbox lädt Ihr
              Elektroauto zu Hause – sauber und günstig.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                "Batteriespeicher – höherer Eigenverbrauch",
                "Wärmepumpe – Strom wird Wärme",
                "Wallbox – Solarstrom fürs E‑Auto",
                "Smart‑Home – intelligente Steuerung",
              ].map((f) => (
                <div key={f} className="rounded-xl border p-3 text-sm">
                  {f}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Link href="/pv-rechner" className="btn-primary">
                Ertrag & Größe berechnen
              </Link>
              <Link href="/kontakt" className="btn-ghost">
                Kostenlose Beratung anfragen
              </Link>
            </div>
          </div>

          {/* Bildplatz – Motiv: Speicher im Technikraum + Wallbox in Garage (Diptych) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src="/images/pvprodukte/speicher.jpg" // <-- Bild ablegen
                alt="Batteriespeicher im Hauswirtschaftsraum"
                className="w-full h-[300px] object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src="/images/pvprodukte/wallbox.jpg" // <-- Bild ablegen
                alt="Wallbox für Elektroauto"
                className="w-full h-[300px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Förderungen */}
      <section className="section bg-emerald-50">
        <div className="container">
          <h2 className="h2">Förderungen & Finanzierung</h2>
          <p className="muted mt-2 max-w-3xl">
            Von bundesweiten Programmen bis zu Landes‑ und Kommunalförderungen: Wir prüfen
            Möglichkeiten, übernehmen auf Wunsch die Antragstellung und kombinieren Zuschüsse mit
            zinsgünstigen Krediten. Ziel: <b>Maximal fördern, minimal investieren.</b>
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

      {/* Use-Cases / Bildband */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="h2 text-center">Einsatzbeispiele</h2>
          <p className="muted text-center mt-2">
            Für Neubau, Bestandsgebäude oder Gewerbe – wir planen die passende Lösung.
          </p>

          {/* 3er Bildband – Motiv-Ideen:
              - Einfamilienhaus Satteldach
              - Flachdach mit Aufständerung
              - Kleines Gewerbedach oder Landwirtschaft (Scheune) */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { src: "/images/pvprodukte/haus.jpg", alt: "PV auf Einfamilienhaus" },
              { src: "/images/pvprodukte/flachdach.jpg", alt: "PV auf Flachdach mit Aufständerung" },
              { src: "/images/pvprodukte/gewerbe.jpg", alt: "PV auf Gewerbedach" },
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
