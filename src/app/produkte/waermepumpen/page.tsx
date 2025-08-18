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
      className={`grid items-center gap-6 md:gap-10 md:grid-cols-2 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Bild */}
      <figure className="w-full">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 520px, 100vw"
          />
        </div>
      </figure>

      {/* Text */}
      <div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h3>
        <div className="mt-3 text-gray-700 leading-relaxed text-[15px]">
          {children}
        </div>
      </div>
    </article>
  );
}

/* --- Small helper “badge” for number chips --- */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

export default function WaermepumpenPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 space-y-12">
      {/* Intro */}
      <header className="max-w-3xl">
        <h2 className="h2">Wärmepumpen</h2>
        <p className="muted mt-2">
          Effizient heizen, sauber kühlen und unabhängiger von fossilen Preisen werden –
          dafür sind Wärmepumpen die Schlüsseltechnologie. Wir bieten Varianten, die
          sich in bestehende Gebäude ebenso integrieren lassen wie in den Neubau –
          ohne dass Sie sich an einen Herstellernamen binden müssen.
        </p>
      </header>

      <div className="space-y-16">
        {/* Luft-Luft */}
        <ProductRow
          title="Luft‑Luft‑Wärmepumpe (Multi‑Split / VRF)"
          img="/images/waermepumpen/luft-luft.jpg"
        >
          <p>
            Mehrere Innengeräte versorgen die Räume, ein Außengerät sitzt an der
            Fassade.{" "}
            <strong>Heizen und Kühlen</strong> erfolgen über Klimageräte
            (z. B. Wand‑/Deckengeräte) – die bestehende Heizungsinstallation
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

        {/* Luft-Wasser */}
        <ProductRow
          title="Luft‑Wasser‑Wärmepumpe"
          img="/images/waermepumpen/luft-wasser.jpg"
          reverse
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

        {/* Brauchwasser-WP */}
        <ProductRow
          title="Brauchwasser‑Wärmepumpe"
          img="/images/waermepumpen/bwwp.jpg"
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

      {/* ETS2 / Preisprognose */}
      <section className="space-y-6">
        <h3 className="h2">Warum jetzt umrüsten? – ETS 2 & künftige Heizkosten</h3>
        <p className="text-gray-700 max-w-4xl">
          Ab Mitte/Ende der 2020er Jahre wird der europäische Emissionshandel
          (<strong>ETS 2</strong>) auf Gebäude und Verkehr ausgeweitet. Das bedeutet:
          Für jede Tonne CO₂, die beim Verbrennen von Erdgas oder Heizöl entsteht,
          fällt ein Zertifikatspreis an – und verteuert so fossiles Heizen. Strom
          profitiert dagegen zunehmend von erneuerbaren Quellen.
        </p>

        {/* Modellhafte, ETS-bezogene Aufschläge */}
        <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
          <h4 className="font-semibold mb-2">Modellhafte ETS‑Aufschläge je kWh Wärme</h4>
          <p className="text-sm text-gray-600">
            Nur ETS‑Anteil (ohne Grund-/Beschaffungspreise). Annahmen: CO₂‑Preis 2027 ≈{" "}
            <b>45 €/t</b>, 2030 ≈ <b>100 €/t</b>, 2035 ≈ <b>150 €/t</b>. Emissionsfaktoren:
            Gas ~ <b>0,202 kg/kWh</b>, Heizöl ~ <b>0,266 kg/kWh</b>.
          </p>

          {/* Tabelle */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Energieträger</th>
                  <th className="py-2 pr-4">2027 (45 €/t)</th>
                  <th className="py-2 pr-4">2030 (100 €/t)</th>
                  <th className="py-2 pr-4">2035 (150 €/t)</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(odd)]:bg-gray-50">
                <tr>
                  <td className="py-2 pr-4 font-medium">Erdgas</td>
                  <td className="py-2 pr-4">~ <b>0,9 ct/kWh</b></td>
                  <td className="py-2 pr-4">~ <b>2,0 ct/kWh</b></td>
                  <td className="py-2 pr-4">~ <b>3,0 ct/kWh</b></td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Heizöl</td>
                  <td className="py-2 pr-4">~ <b>1,2 ct/kWh</b></td>
                  <td className="py-2 pr-4">~ <b>2,7 ct/kWh</b></td>
                  <td className="py-2 pr-4">~ <b>4,0 ct/kWh</b></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Hinweis: Werte sind <em>modellhaft</em> und dienen der Einordnung. Tatsächliche
            Endkundenpreise hängen zusätzlich von Beschaffung, Steuern, Netzentgelten,
            Marge, Effizienz der Wärmeerzeugung u. a. ab.
          </p>
        </div>

        {/* Fazit */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h4 className="font-semibold mb-2">Was bedeutet das?</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Fossiles Heizen wird durch ETS 2 planbar teurer.</li>
              <li>Wärmepumpen nutzen Strom – mit wachsendem Anteil erneuerbarer Energie.</li>
              <li>In guter Auslegung erreichen WPs niedrige Heizkosten (hohe JAZ/COP).</li>
            </ul>
          </div>
          <div className="card p-6">
            <h4 className="font-semibold mb-2">Ihr Vorteil mit Wärmepumpe</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Unabhängiger von Öl/Gas‑Preisen & CO₂‑Kosten</li>
              <li>Förderchancen & attraktiver Klimanutzen</li>
              <li>Kühloption (Luft‑Luft) bzw. WW‑Aufbereitung (LWW/BWWP) möglich</li>
            </ul>
            <div className="mt-4">
              <Link href="/kontakt" className="btn-primary">Beratung & Angebot anfordern</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
