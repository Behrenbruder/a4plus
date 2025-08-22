// src/app/produkte/fenster/page.tsx
import Link from "next/link";
import ProductRow from "@/components/ProductRow";

export default function FensterPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 space-y-12">
      {/* Einleitung */}
      <header className="max-w-3xl">
        <h2 className="h2">Fenster</h2>
        <p className="muted mt-2">
          Wir setzen bei Kunststoff-Fenstern auf <strong>Kömmerling</strong>. 
          Die Systeme 88, 76&nbsp;AD und 76&nbsp;MD verbinden starke Wärmedämmung 
          mit hoher Stabilität und langlebiger Dichtungstechnik. Kömmerling produziert 
          seit Jahren konsequent ressourcenschonend und bietet ausgereifte Beschläge 
          sowie ein großes Spektrum an Design-Optionen.
        </p>
      </header>

      <div className="space-y-16">
        {/* Kömmerling 88 */}
        <ProductRow
          title="Kömmerling 88"
          img="/images/fenster/Kömmerling 88.jpg"
          pdf="/pdfs/kommerling-88.pdf"
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>88 mm Bautiefe – sehr gute Statik und Dichtheit</li>
            <li>Sehr niedrige Uw-Werte (je nach Verglasung bis Passivhaus-Niveau)</li>
            <li>6-Kammer-Profil, Mehrfachdichtung, große Glasdicken möglich</li>
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
            <li>76 mm Bautiefe mit Anschlagdichtung (AD)</li>
            <li>Sehr gutes Preis-Leistungs-Verhältnis für Neubau & Sanierung</li>
            <li>Optimierte Wärme- und Schalldämmung bei schlanker Optik</li>
            <li>Großes Zubehör- und Farbprogramm</li>
          </ul>
        </ProductRow>

        {/* Kömmerling 76 MD */}
        <ProductRow
          title="Kömmerling 76 MD"
          img="/images/fenster/Kömmerling 76 MD.jpg"
          pdf="/pdfs/kommerling-76-md.pdf"
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>76 mm Bautiefe mit <strong>Mitteldichtung (MD)</strong></li>
            <li>Sehr gute Uw-Werte bei hoher Dichtheit</li>
            <li>Robuste Lösung für anspruchsvolle Modernisierungen</li>
            <li>Umfangreiche Beschlag- und Sicherheitsoptionen</li>
          </ul>
        </ProductRow>

        {/* Premidoor */}
        <ProductRow
          title="Kömmerling Premidoor 76 Standard"
          img="/images/fenster/Premidoor.jpg"
          pdf="/pdfs/koemmerling-premidoor76.pdf"
          reverse
        >
          <ul className="list-disc pl-5 space-y-1">
            <li>Hohe Profilstabilität für geschosshohe Elemente bis 2,60 m</li>
            <li>Uf = 1,4 W/(m²K), Ug = 0,5 W/m²K mit Warmer Kante</li>
            <li>Barrierefreier Übergang, hochdämmende WPC-Bodenschwelle</li>
            <li>Unsichtbare Befestigung dank tiefer Montagekanäle</li>
            <li>Bleifreie Ca/Zn-Stabilisatoren, optional Aluminiumschalen</li>
          </ul>
        </ProductRow>

        {/* Lackierte Fenster */}
        <ProductRow
          title="Lackierte Fenster (RAL-Farben)"
          img="/images/fenster/farbenfenster.jpg"
        >
          <p className="mb-3">
            Unsere Lackierungstechnik für PVC-Profile ermöglicht Fenster und Türen
            in Originalfarben – für ein durchgängiges Farbkonzept am Gebäude.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 p-4">
              <h4 className="font-medium">Vorteile</h4>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-[15px]">
                <li>Perfekte Farbanpassung an Dach, Tore & Türen (RAL-Palette)</li>
                <li>Witterungs-, chemisch und mechanisch beständig</li>
                <li>Saubere, hochwertige Oberfläche</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <h4 className="font-medium">Lacke</h4>
              <p className="mt-2 text-[15px]">
                Hochwertige Produkte der Schweizer <strong>FEYCO AG</strong>.
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
