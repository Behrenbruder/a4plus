// src/app/ueber-uns/page.tsx
import Image from "next/image";
import type { Metadata } from "next";
import { LogoBadge } from "@/components/LogoBadge";

export const metadata: Metadata = {
  title: "Über uns | Arteplus e.K.",
  description:
    "Arteplus e.K. – Familienunternehmen für energetische Sanierungen: Fenster, Türen, Dämmung, PV, Speicher & Wärmepumpen. Kundenorientiert, herstellerunabhängig, mit schneller Amortisation.",
};

export default function UeberUnsPage() {
  return (
    <div>
      {/* HERO */}
      <section className="section bg-gray-50">
        <div className="container text-center">
          <h1 className="h1">Über uns</h1>
          <p className="muted mt-3 max-w-3xl mx-auto">
            Arteplus e.K. ist ein familiengeführtes Unternehmen aus Frankenthal.
            Wir planen und realisieren energetische Sanierungen – von Fenstern,
            Türen und Dämmung bis zu Photovoltaik, Batteriespeichern und
            Wärmepumpen. Unser Anspruch: <strong>höchste Effizienz</strong>,{" "}
            <strong>faire Preise</strong> und eine{" "}
            <strong>schnelle Amortisation</strong>.
          </p>
        </div>
      </section>

      {/* WER WIR SIND */}
      <section className="section">
        <div className="container grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="h2">Wer wir sind</h2>
            <p className="text-gray-700">
              Als unabhängiger Anbieter kombinieren wir ausschließlich Komponenten,
              die strenge Qualitätskriterien erfüllen und zugleich ein sehr gutes
              Preis‑Leistungs‑Verhältnis bieten. So stellen wir sicher, dass sich
              Investitionen für unsere Kundinnen und Kunden <em>früh</em> lohnen –
              nicht erst in 20 Jahren.
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Kundenorientierte, herstellerunabhängige Beratung</li>
              <li>Transparente Unterstützung bei Förderprogrammen</li>
              <li>Persönliche Betreuung – direkte Ansprechpartner statt Hotline</li>
            </ul>
          </div>

          <div className="card overflow-hidden">
            <Image
              src="/images/ueber-uns/werkstatt.jpg"
              alt="Arteplus – Montage & Planung"
              width={1200}
              height={800}
              className="w-full h-72 md:h-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* MISSION / A4+ */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="max-w-4xl">
            <h2 className="h2 mb-3"><pre>Unsere Mission – <LogoBadge className="text-[0.8em]" /></pre></h2>
            <p className="text-gray-700 mb-4">
              Der Name <strong>a4+</strong> steht für höchste Effizienz
              (A+++) und eine besonders kurze Amortisationszeit (das vierte
              „Plus“). Wir setzen nicht auf die teuersten Produkte, sondern
              auf die <strong>passendsten</strong> – mit Fokus auf Qualität,
              Wirtschaftlichkeit und Nachhaltigkeit.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 mt-8">
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-2">Effizienz</h3>
              <p className="text-gray-700 text-sm">
                Lösungen, die messbar Energie sparen – auf Gebäude
                und Bedarf abgestimmt.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-2">Wirtschaftlichkeit</h3>
              <p className="text-gray-700 text-sm">
                Kurze Amortisation durch kluge Komponentenwahl
                und faire Paketpreise.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-2">Unabhängigkeit</h3>
              <p className="text-gray-700 text-sm">
                Keine Herstellerbindung – wir wählen, was zu Ihnen
                und Ihrem Projekt passt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section">
        <div className="container">
          <h2 className="h2 text-center mb-8">Unser Team</h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Benno */}
            <article className="card p-6 text-center">
              <div className="mx-auto w-36 h-36 relative mb-4">
                <Image
                  src="/images/team/benno.jpg"
                  alt="Benno Behr"
                  fill
                  className="rounded-full object-cover"
                  sizes="144px"
                />
              </div>
              <h3 className="font-semibold text-lg">Benno Behr</h3>
              <p className="text-emerald-600 font-medium">Geschäftsführer</p>
              <p className="text-gray-600 text-sm mt-2">
                Gründer und strategischer Kopf. Vom Ein‑Mann‑Betrieb zum
                Anbieter für effizienzorientierte Gesamtlösungen.
              </p>
            </article>

            {/* Larissa */}
            <article className="card p-6 text-center">
              <div className="mx-auto w-36 h-36 relative mb-4">
                <Image
                  src="/images/team/larissa.jpg"
                  alt="Larissa Behr"
                  fill
                  className="rounded-full object-cover"
                  sizes="144px"
                />
              </div>
              <h3 className="font-semibold text-lg">Larissa Behr</h3>
              <p className="text-emerald-600 font-medium">
                Dipl.-Betriebswirtin – Finanzen & Buchhaltung
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Entwicklerin der hauseigenen Buchhaltungssoftware.
                Sorgt für reibungslose Abläufe und Zahlenklarheit.
              </p>
            </article>

            {/* Samuel */}
            <article className="card p-6 text-center">
              <div className="mx-auto w-36 h-36 relative mb-4">
                <Image
                  src="/images/team/samuel.jpg"
                  alt="Samuel Behr"
                  fill
                  className="rounded-full object-cover"
                  sizes="144px"
                />
              </div>
              <h3 className="font-semibold text-lg">Samuel Behr</h3>
              <p className="text-emerald-600 font-medium">
                Werkstudent – Web & Automatisierung
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Verantwortlich für Website, Tools und digitale Prozesse –
                schnelle Reaktionszeiten inklusive.
              </p>
            </article>
          </div>

        </div>
      </section>

      {/* KONTAKT-TEASER */}
      <section className="section bg-gray-50">
        <div className="container text-center">
          <h2 className="h2">Lernen wir uns kennen</h2>
          <p className="muted mt-2">
            Sie planen eine energetische Sanierung oder möchten Optionen
            vergleichen? Wir beraten Sie gerne persönlich.
          </p>
          <a href="/kontakt" className="btn-primary mt-6 inline-flex">
            Kontakt aufnehmen
          </a>
        </div>
      </section>
    </div>
  );
}
