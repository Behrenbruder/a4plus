import Image from "next/image";
import Link from "next/link";
import * as React from "react";


type RowProps = {
  title: string;
  img: string;                 // Pfad zum Bild
  imgAlt?: string;             // optional anderer Alt-Text
  pdf?: string;                // optional: Link zum Datenblatt
  reverse?: boolean;           // Bild/Text tauschen
  children: React.ReactNode;   // Technische Daten / Beschreibung
  imgClassName?: string;       // optional: zusätzliche Klassen fürs <img>, z.B. "scale-125"
};

export function ProductRow({
  title,
  img,
  imgAlt,
  pdf,
  reverse = false,
  children,
  imgClassName,
}: RowProps) {
  return (
    <article
      className={`group grid items-center gap-8 md:gap-12 md:grid-cols-2 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Bild */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* 4:3-Aspect für einheitliche Höhe, kann angepasst werden */}
        <div className="aspect-[4/3] w-full">
          <img
            src={img}
            alt={imgAlt ?? title}
            className={[
              // Basis-Styles
              "h-full w-full object-contain transition-transform duration-500 will-change-transform",
              // leichter Grund-Zoom + stärkerer Zoom bei Hover
              "scale-[1.0] group-hover:scale-1.0",
              // falls du eigenen Stil übergeben willst
              imgClassName ?? "",
            ].join(" ")}
            loading="lazy"
          />
        </div>
      </div>

      {/* Text / Daten */}
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
          {title}
        </h3>

        <div className="prose prose-gray max-w-none text-gray-700">
          {children}
        </div>

        {pdf && (
          <a
            href={pdf}
            target="_blank"
            rel="noreferrer"
          >
            Datenblatt (PDF) herunterladen →
          </a>
        )}
      </div>
    </article>
  );
}

export default function FensterPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 space-y-12">
      {/* Einleitung */}
      <header className="max-w-3xl">
        <h2 className="h2">Fenster</h2>
        <p className="muted mt-2">
          Wir setzen bei Kunststoff‑Fenstern auf <strong>Kömmerling</strong>. Die
          Systeme 88, 76&nbsp;AD und 76&nbsp;MD verbinden starke Wärmedämmung mit hoher
          Stabilität und langlebiger Dichtungstechnik. Kömmerling produziert
          seit Jahren konsequent ressourcenschonend (u.&nbsp;a. Recycleteinsatz im
          Profilkern), bietet ausgereifte Beschläge und ein großes Spektrum an
          Design‑Optionen – damit Technik, Optik und Wirtschaftlichkeit zusammenpassen.
        </p>
      </header>

      <div className="space-y-16">
        {/* Kömmerling 88 */}
        <ProductRow
          title="Kömmerling 88"
          img="/images/fenster/Kömmerling 88.jpg"
          imgClassName="transform scale-100 object-contain"
          pdf="/pdfs/kommerling-88.pdf"
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>88&nbsp;mm Bautiefe – sehr gute Statik und Dichtheit</li>
            <li>sehr niedrige Uw‑Werte (je nach Verglasung bis Passivhaus‑Niveau)</li>
            <li>6‑Kammer‑Profil, Mehrfachdichtung, große Glasdicken möglich</li>
            <li>Ideal für Neubau mit hohen Effizienzanforderungen</li>
          </ul>
        </ProductRow>

        {/* Kömmerling 76 AD */}
        <ProductRow
          title="Kömmerling 76 AD"
          img="/images/fenster/Kömmerling 76 AD.jpg"
          pdf="/pdfs/kommerling-76-ad.pdf"
          reverse
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>76&nbsp;mm Bautiefe mit Anschlagdichtung (AD)</li>
            <li>sehr gutes Preis‑Leistungs‑Verhältnis für Neubau & Sanierung</li>
            <li>optimierte Wärmedämmung und Schalldämmung bei schlanker Optik</li>
            <li>großes Zubehör‑ und Farbprogramm</li>
          </ul>
        </ProductRow>

        {/* Kömmerling 76 MD */}
        <ProductRow
          title="Kömmerling 76 MD"
          img="/images/fenster/Kömmerling 76 MD.jpg"
          pdf="/pdfs/kommerling-76-md.pdf"
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>76&nbsp;mm Bautiefe mit <strong>Mitteldichtung (MD)</strong> – Plus an Dämmung</li>
            <li>sehr gute Uw‑Werte bei hoher Dichtheit, auch akustisch stark</li>
            <li>robuste Lösung für anspruchsvolle Modernisierungen</li>
            <li>umfangreiche Beschlag‑ und Sicherheitsoptionen</li>
          </ul>
        </ProductRow>

        <ProductRow
          title="Kömmerling Premidoor 76 Standard"
          img="/images/fenster/Premidoor.jpg"
          pdf="/pdfs/koemmerling-premidoor76.pdf"
          reverse
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>Hohe Profilstabilität für geschosshohe Elemente bis 2,60 m</li>
            <li>Erstklassiger Wärmedurchgangskoeffizient Uf = 1,4 W/(m²K)</li>
            <li>Hochwärmegedämmte Verglasung mit Ug = 0,5 W/m²K und Warme Kante</li>
            <li>Barrierefreier Übergang von innen nach außen – hochdämmende WPC Bodenschwelle</li>
            <li>Sichere Funktion, hoher Bedienungskomfort, leicht zu öffnen und schließen</li>
            <li>Tiefe Montagekanäle für unsichtbare Befestigung</li>
            <li>PVC-Profile mit bleifreien Calcium/Zink-Stabilisatoren</li>
            <li>Optional erhältliche Aluminiumschalen</li>
          </ul>
        </ProductRow>

        {/* Lackierte Fenster */}
        <ProductRow
          title="Lackierte Fenster (RAL‑Farben)"
          img="/images/fenster/farbenfenster.jpg"
        >
          <p className="mb-3">
            Unsere Lackierungstechnik für PVC‑Profile ermöglicht Fenster und Türen
            in Originalfarben – für ein durchgängiges Farbkonzept am Gebäude.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 p-4">
              <h4 className="font-medium">Vorteile</h4>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-[15px]">
                <li>Perfekte Farbanpassung an Dach, Tore & Türen (RAL‑Palette)</li>
                <li>Witterungs‑, chemisch und mechanisch beständig</li>
                <li>saubere, hochwertige Oberfläche</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <h4 className="font-medium">Lacke</h4>
              <p className="mt-2 text-[15px]">
                Hochwertige Produkte der Schweizer <strong>FEYCO&nbsp;AG</strong> – Pionier
                moderner PVC‑Lackiertechnologie.
              </p>
            </div>
          </div>
        </ProductRow>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/kontakt" className="btn-primary">
          Beratung & Angebot anfordern
        </Link>
      </div>
    </div>
  );
}
