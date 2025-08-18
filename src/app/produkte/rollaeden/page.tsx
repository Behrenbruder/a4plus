import Image from "next/image";
import Link from "next/link";

function JumpCard({
  href, label, icon = "→",
}: { href: string; label: string; icon?: string }) {
  return (
    <a
      href={href}
      className="flex-1 min-w-[220px] rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm hover:shadow transition flex items-center justify-between"
    >
      <span className="font-semibold text-gray-900">{label}</span>
      <span className="text-emerald-600">{icon}</span>
    </a>
  );
}

function ProductCard({
  href, title, img, alt,
}: { href: string; title: string; img: string; alt: string }) {
  return (
    <Link href={href} className="group block rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[4/3] bg-gray-50">
        <Image src={img} alt={alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
      </div>
      <div className="px-4 py-3">
        <div className="font-medium text-gray-800 group-hover:text-emerald-700">{title}</div>
      </div>
    </Link>
  );
}

export default function RollaedenPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 space-y-14">
      {/* Header */}
      <header className="text-center">
        <h2 className="h2">Rollläden & Blinos‑Rollos</h2>
        <p className="muted mt-2">
          Außenliegender Sonnenschutz – nachrüstbar, langlebig und in vielen Designs.
          Wählen Sie unten die gewünschte Produktart.
        </p>
      </header>

      {/* Sprungauswahl */}
      <section className="flex flex-wrap gap-4 justify-center">
        <JumpCard href="#raffstore" label="Raffstore" />
        <JumpCard href="#blinos" label="Blinos‑Rollos" />
      </section>

      {/* RAFFSTORE */}
      <section id="raffstore" className="space-y-8">
        <div className="max-w-3xl">
          <h3 className="h2">Raffstore</h3>
          <p className="text-gray-700 mt-2">
            <strong>Passiv kühlen, mit Tageslicht beleuchten und im Winter solar mitheizen.</strong>
            Außenjalousien mit verstellbaren, lackierten Alulamellen halten Sommerhitze
            vor der Scheibe ab, lassen aber Licht hinein. Flexible Lamellenstellung
            sorgt für Sichtschutz und gute Durchsicht zugleich.
          </p>
          <ul className="mt-3 list-disc pl-5 text-gray-700 space-y-1">
            <li>Drei Einbauvarianten: <em>Vorbau‑Unterputz</em>, <em>Sichtkasten</em>, <em>Aufsatzkasten</em></li>
            <li>Getriebe oder Motor, Bedienung per Funk/Wandtaster</li>
            <li>Kombinierbar mit Insektenschutz, viele RAL‑Farben</li>
            <li>Architektonisch clean, wartungsarm</li>
          </ul>
        </div>

        {/* Produkt-Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCard
            href="/produkte/rollaeden/raffstore/retrolux"
            title="RETROLux Tageslichtraffstore"
            img="/images/raffstore/retrolux.jpg"
            alt="RETROLux Tageslichtraffstore"
          />
          <ProductCard
            href="/produkte/rollaeden/raffstore/vorbau-unterputz"
            title="Vorbau Unterputz Raffstore"
            img="/images/raffstore/vorbau-unterputz.jpg"
            alt="Vorbau Unterputz Raffstore"
          />
          <ProductCard
            href="/produkte/rollaeden/raffstore/sichtkasten"
            title="Sichtkasten Raffstore"
            img="/images/raffstore/sichtkasten.jpg"
            alt="Sichtkasten Raffstore"
          />
          <ProductCard
            href="/produkte/rollaeden/raffstore/aufsatzkasten"
            title="Aufsatzkasten Raffstore"
            img="/images/raffstore/aufsatzkasten.jpg"
            alt="Aufsatzkasten Raffstore"
          />
        </div>
      </section>

      {/* BLINOS */}
      <section id="blinos" className="space-y-6">
        <div className="max-w-3xl">
          <h3 className="h2">Blinos‑Rollos (zum Klemmen)</h3>
          <p className="text-gray-700 mt-2">
            Das einzige <strong>außenliegende Sonnenschutz‑Rollo zum Klemmen</strong>:
            werkzeuglos montiert, ohne Bohrungen – perfekt für Mietwohnungen und
            die schnelle Nachrüstung. Geringer Platzbedarf, wind‑/wetterfest und
            diebstahlsicher.
          </p>
          <ul className="mt-3 list-disc pl-5 text-gray-700 space-y-1">
            <li>kühlt spürbar, bleibt dabei gut durchsichtig nach außen</li>
            <li>Montage ohne Beschädigung von Fenster/Fassade – in Minuten einsatzbereit</li>
            <li>passt auf ~90 % der Fenster, auch für Türen erhältlich</li>
            <li>viele RAL‑Farben, optional mit Insektenschutzgitter</li>
          </ul>
        </div>

        {/* kleines Bild + CTA optional */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100">
            <Image src="/images/blinos/hero.jpg" alt="Blinos Rollo" fill className="object-cover" />
          </div>
          <div>
            <p className="text-gray-700">
              Ideal, wenn bohren nicht erlaubt ist oder schnell nachgerüstet werden
              soll – Blinos lässt sich einfach klemmen, ist robust und sieht gut aus.
            </p>
            <div className="mt-4">
              <Link href="/kontakt" className="btn-primary">Beratung & Angebot anfordern</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
