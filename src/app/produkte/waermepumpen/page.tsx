import Image from "next/image";
import Link from "next/link";

/* --- Reusable compact row, alternates with `reverse` --- */
function ProductRow({
  title,
  img,
  reverse,
  children,
}: {
  title: string;
  img: string;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      className={`grid items-center gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-2 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Bild */}
      <figure className="w-full">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 520px, (min-width: 640px) 80vw, 100vw"
          />
        </div>
      </figure>

      {/* Text */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">{title}</h3>
        <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
          {children}
        </div>
      </div>
    </article>
  );
}

/* --- Small helper "badge" for number chips --- */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium touch-spacing">
      {children}
    </span>
  );
}

export default function WaermepumpenPage() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="section bg-white">
        <div className="container">
          <header className="max-w-4xl mx-auto text-center">
            <h1 className="h1">Wärmepumpen</h1>
            <p className="muted mt-4 sm:mt-6 text-responsive max-w-3xl mx-auto">
              Effizient heizen, sauber kühlen und unabhängiger von fossilen Preisen werden –
              dafür sind Wärmepumpen die Schlüsseltechnologie. Wir bieten Varianten, die
              sich in bestehende Gebäude ebenso integrieren lassen wie in den Neubau –
              ohne dass Sie sich an einen Herstellernamen binden müssen.
            </p>
          </header>
        </div>
      </section>

      {/* Product Sections */}
      <section className="section bg-gray-50">
        <div className="container space-y-12 sm:space-y-16">
          {/* Luft-Wasser */}
          <ProductRow
            title="Luft‑Wasser‑Wärmepumpe"
            img="/images/waermepumpe/pumpe2.jpg"
          >
            <p>
              Ersetzt Öl‑ oder Gasheizungen: Die Wärmepumpe erwärmt{" "}
              <strong>Heizungs‑ und optional Brauchwasser</strong>. Die Wärmeverteilung
              erfolgt über Ihr bestehendes Heizsystem (Heizkörper/Fußbodenheizung).
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Kompletter Kesseltausch möglich (fossil → elektrisch)</li>
              <li>Nutzung der vorhandenen Wärmeverteilung</li>
              <li>Optional mit integriertem/externem Speicher für Brauchwasser</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>Kesseltausch</Chip>
              <Chip>Brauchwasser optional</Chip>
              <Chip>Förderfähig*</Chip>
            </div>
          </ProductRow>

          {/* Luft-Luft */}
          <ProductRow
            title="Luft‑Luft‑Wärmepumpe (Multi‑Split / VRF)"
            img="/images/waermepumpe/pumpe.jpg"
            reverse
          >
            <p>
              Mehrere Innengeräte versorgen die Räume, ein Außengerät sitzt an der
              Fassade.{" "}
              <strong>Heizen und Kühlen</strong> erfolgen über Klimageräte
              (z. B. Wand‑/Deckengeräte) – die bestehende Heizungsinstallation
              bleibt unberührt.
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Sehr effizient zum Heizen & Kühlen, schnelle Reaktionszeiten</li>
              <li>Keine Eingriffe in Heizkreis/Heizkörper erforderlich</li>
              <li>Einzelraum‑Regelung, gute Nachrüstbarkeit</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>Heizen &amp; Kühlen</Chip>
              <Chip>Bestand geeignet</Chip>
              <Chip>Einzelraumsteuerung</Chip>
            </div>
          </ProductRow>

          {/* Brauchwasser-WP */}
          <ProductRow
            title="Brauchwasser‑Wärmepumpe"
            img="/images/waermepumpe/brauchwasser.jpg"
          >
            <p>
              Ideal als <strong>Ergänzung</strong> zur Luft‑Luft‑Wärmepumpe, um
              Warmwasser effizient bereitzustellen. Auch als Ergänzung zur
              Luft‑Wasser‑Wärmepumpe sinnvoll, wenn diese primär in der Heizsaison
              laufen soll.
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Sehr effizient bei ganzjährigem Warmwasserbedarf</li>
              <li>Entlastet die Hauptwärmepumpe im Sommer</li>
              <li>Gute Nachrüstlösung bei beengten Platzverhältnissen</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>WW‑Ergänzung</Chip>
              <Chip>Sommerbetrieb</Chip>
              <Chip>Nachrüstbar</Chip>
            </div>
          </ProductRow>
        </div>
      </section>

      {/* ETS2 / Preisprognose */}
      <section className="section bg-white">
        <div className="container space-y-6 sm:space-y-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="h2">Warum jetzt umrüsten? – ETS 2 & künftige Heizkosten</h2>
            <p className="text-gray-700 mt-4 sm:mt-6 text-responsive">
              Ab Mitte/Ende der 2020er Jahre wird der europäische Emissionshandel
              (<strong>ETS 2</strong>) auf Gebäude und Verkehr ausgeweitet. Das bedeutet:
              Für jede Tonne CO₂, die beim Verbrennen von Erdgas oder Heizöl entsteht,
              fällt ein Zertifikatspreis an – und verteuert so fossiles Heizen. Strom
              profitiert dagegen zunehmend von erneuerbaren Quellen.
            </p>
          </div>

          {/* Modellhafte, ETS-bezogene Aufschläge */}
          <div className="card p-4 sm:p-6 max-w-5xl mx-auto">
            <h3 className="font-semibold mb-3 sm:mb-4 text-lg sm:text-xl">Modellhafte ETS‑Aufschläge je kWh Wärme</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Nur ETS‑Anteil (ohne Grund-/Beschaffungspreise). Annahmen: CO₂‑Preis 2027 ≈{" "}
              <b>45 €/t</b>, 2030 ≈ <b>100 €/t</b>, 2035 ≈ <b>150 €/t</b>. Emissionsfaktoren:
              Gas ~ <b>0,202 kg/kWh</b>, Heizöl ~ <b>0,266 kg/kWh</b>.
            </p>

            {/* Tabelle */}
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm sm:text-base">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="py-3 pr-4 font-medium">Energieträger</th>
                    <th className="py-3 pr-4 font-medium">2027 (45 €/t)</th>
                    <th className="py-3 pr-4 font-medium">2030 (100 €/t)</th>
                    <th className="py-3 pr-4 font-medium">2035 (150 €/t)</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(odd)]:bg-gray-50">
                  <tr>
                    <td className="py-3 pr-4 font-medium">Erdgas</td>
                    <td className="py-3 pr-4">~ <b>0,9 ct/kWh</b></td>
                    <td className="py-3 pr-4">~ <b>2,0 ct/kWh</b></td>
                    <td className="py-3 pr-4">~ <b>3,0 ct/kWh</b></td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Heizöl</td>
                    <td className="py-3 pr-4">~ <b>1,2 ct/kWh</b></td>
                    <td className="py-3 pr-4">~ <b>2,7 ct/kWh</b></td>
                    <td className="py-3 pr-4">~ <b>4,0 ct/kWh</b></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-4">
              Hinweis: Werte sind <em>modellhaft</em> und dienen der Einordnung. Tatsächliche
              Endkundenpreise hängen zusätzlich von Beschaffung, Steuern, Netzentgelten,
              Marge, Effizienz der Wärmeerzeugung u. a. ab.
            </p>
          </div>

          {/* Fazit */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            <div className="card p-4 sm:p-6 touch-spacing">
              <h3 className="font-semibold mb-3 sm:mb-4 text-lg sm:text-xl">Was bedeutet das?</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
                <li>Fossiles Heizen wird durch ETS 2 planbar teurer.</li>
                <li>Wärmepumpen nutzen Strom – mit wachsendem Anteil erneuerbarer Energie.</li>
                <li>In guter Auslegung erreichen WPs niedrige Heizkosten (hohe JAZ/COP).</li>
              </ul>
            </div>
            <div className="card p-4 sm:p-6 touch-spacing">
              <h3 className="font-semibold mb-3 sm:mb-4 text-lg sm:text-xl">Ihr Vorteil mit Wärmepumpe</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
                <li>Unabhängiger von Öl/Gas‑Preisen & CO₂‑Kosten</li>
                <li>Förderchancen & attraktiver Klimanutzen</li>
                <li>Kühloption (Luft‑Luft) bzw. WW‑Aufbereitung (LWW/BWWP) möglich</li>
              </ul>
              <Link href="/kontakt" className="btn-primary w-full sm:w-auto">
                Beratung & Angebot anfordern
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
