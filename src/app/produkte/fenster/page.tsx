"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

/** Kleiner Helfer: sanftes Scrollen global aktivieren */
function useSmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = prev;
    };
  }, []);
}

function JumpCard({
  href, label, icon = "→",
}: { href: string; label: string; icon?: string }) {
  return (
    <a
      href={href}
      className="flex-1 min-w-[200px] sm:min-w-[220px] rounded-xl sm:rounded-2xl border border-gray-100 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm hover:shadow transition flex items-center justify-between touch-spacing"
    >
      <span className="font-semibold text-gray-900 text-sm sm:text-base">{label}</span>
      <span className="text-emerald-600">{icon}</span>
    </a>
  );
}

/** Reusable Mini-Komponenten */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium touch-spacing">
      {children}
    </span>
  );
}

function JumpButton({
  href,
  label,
  icon = "↓",
}: { href: string; label: string; icon?: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 sm:px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:shadow-md hover:text-emerald-700 transition touch-spacing"
    >
      <span>{label}</span>
      <span className="text-emerald-600 group-hover:translate-y-0.5 transition">{icon}</span>
    </a>
  );
}

/** Bild/Text-Reihe */
function ProductRow({
  title,
  img,
  reverse,
  children,
  imgContain = false,
}: {
  title: string;
  img: string;
  reverse?: boolean;
  children: React.ReactNode;
  imgContain?: boolean;
}) {
  return (
    <article
      className={`grid items-center gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-2 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <figure className="w-full">
        <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white shadow-sm">
          <Image
            src={img}
            alt={title}
            fill
            className={imgContain ? "object-contain p-2 sm:p-4" : "object-cover"}
            sizes="(min-width: 1024px) 600px, 100vw"
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-black/5"></div>
        </div>
      </figure>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">{title}</h3>
        <div className="text-gray-700 leading-relaxed text-sm sm:text-base">{children}</div>
      </div>
    </article>
  );
}

/** Produktkarte (Beschattung) */
type ProductCardProps = {
  href: string;
  title: string;
  img: string;
  alt: string;
  fillMode?: "contain" | "cover";
};

function ProductCard({
  href,
  title,
  img,
  alt,
  fillMode = "contain",
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition touch-spacing"
    >
      {/* Bildcontainer */}
      <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`transition-transform duration-300 group-hover:scale-105 ${
            fillMode === "cover" ? "object-cover p-0" : "object-contain p-2"
          }`}
        />
      </div>

      {/* Titel */}
      <div className="px-3 sm:px-4 py-3">
        <h3 className="font-medium text-gray-800 group-hover:text-emerald-700 text-sm sm:text-base">
          {title}
        </h3>
      </div>
    </Link>
  );
}

export default function FensterUndBeschattungPage() {
  useSmoothScroll();

  return (
    <div className="space-y-0">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/fenster/hero.jpg"
            alt="Modernisiertes Haus mit effizienten Fenstern und Beschattung"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-black/20" />
        </div>

        <div className="container relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-center">
          <div className="max-w-4xl text-white">
            <h1 className="h1 text-white">
              Fenster & Beschattung – Effizienz, Komfort, Design
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-3xl">
              Bessere U‑Werte, mehr Sicherheit und angenehmes Raumklima.
              Perfekt abgestimmt – von Fenstern bis Raffstore & Rollos.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <JumpButton href="#fenster" label="Zu Fenstern" />
              <JumpButton href="#beschattung" label="Zu Beschattung" />
              <Link href="/kontakt" className="btn-primary bg-white text-emerald-700 hover:bg-gray-100 font-semibold rounded-xl px-4 py-2 w-full sm:w-auto">
                Angebot anfordern
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY SPRUNGLEISTE */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <JumpCard href="#fenster" label="Zu den Fenstern" />
            <JumpCard href="#beschattung" label="Zur Beschattung" />
          </div>
        </div>
      </section>

      {/* FENSTER */}
      <section id="fenster" className="section bg-white">
        <div className="container space-y-8 sm:space-y-12">
          <header className="max-w-4xl">
            <h2 className="h2">Von unseren Kunden gelobte Fenster</h2>
            <p className="muted mt-3 sm:mt-4 text-responsive">
              Wir bieten vorwiegend Fenster des Weltmarktführers <strong>Kömmerling</strong> aus Pirmasens.
              Dank des innovativen Produktportfolios lassen sich selbst anspruchsvolle Projekte
              wirtschaftlich realisieren. Außerdem bieten wir in Zusammenarbeit mit der Schweizer FEYCO AG ein breites Farbfolien‑Programm und können die Fenster
              für eine hochwertige Aluminiumoptik in <strong>RAL‑Farben</strong> sowie in <strong>DB‑703</strong> lackieren lassen.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
              <Pill>Großes Farb‑/Designprogramm</Pill>
              <Pill>Sehr gute Uw‑Werte</Pill>
              <Pill>Markenbeschläge</Pill>
              <Pill>RC‑Sicherheitsoptionen</Pill>
            </div>
          </header>

          <div>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="h2">Worauf Sie bei Ihren Fenster achten sollten</h2>
            </div>
            
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Uw-Wert Card */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 touch-spacing">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <span className="text-xl sm:text-2xl">🌡️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Uw-Wert</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Wärmedämmkoeffizient des gesamten Fensters – je niedriger, desto besser. Ein <strong className="text-blue-600">Uw ≤ 0,80 W/m²K</strong> entspricht modernem Stand der Technik und unterbietet den von der KfW geforderten Wert <strong>0,95 W/m²K</strong> deutlich.
                    </p>
                  </div>
                </div>
              </div>

              {/* BAFA-Förderung Card */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 touch-spacing">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <span className="text-xl sm:text-2xl">💨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Lüftungskonzept</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Um eine <strong className="text-green-600">BAFA-Förderung</strong> beantragen zu können, ist seit 2024 ein passendes Lüftungskonzept erforderlich. Wir setzen <strong>werkseitige Fensterlüfter</strong> ein, die eine Mindestluftzirkulation sicherstellen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Beschläge Card */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 touch-spacing">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <span className="text-xl sm:text-2xl">⚙️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Markenbeschläge</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Hochwertige Marken wie <em className="text-purple-600">Siegenia Titan</em> oder <em className="text-purple-600">ROTO Designo</em> sind langlebig, gut nachrüstbar und bieten sichere Dreh-/Kipp-Funktion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Einbruchhemmung Card */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 touch-spacing">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <span className="text-xl sm:text-2xl">🔒</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">RC-Sicherheitsoptionen</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Im EG/UG empfehlen wir Sicherheitsbeschläge nach <strong className="text-red-600">RC-2N</strong> für optimalen Einbruchschutz und Ihre Sicherheit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Komfort & Sicherheit Card */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 touch-spacing">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <span className="text-xl sm:text-2xl">✨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Komfort & Sicherheit</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Spaltlüftung, Fehlbediensperre und <em className="text-amber-600">Secustik</em>-Griffe erhöhen Bedienkomfort und Schutz erheblich.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hebeschiebetüren Card */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 touch-spacing">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <span className="text-xl sm:text-2xl">🚪</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Hebeschiebetüren</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <strong className="text-emerald-600">Lux-Version</strong> mit schlankeren Rahmen, mehr Licht und verbesserter Energieeffizienz für moderne Wohnkonzepte.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Beispielhafte Modelle */}
          <div className="space-y-8 sm:space-y-12">
            <ProductRow title="Kömmerling 88" img="/images/fenster/Kömmerling 88.jpg" imgContain>
              <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
                <li>88&nbsp;mm Bautiefe – sehr gute Statik und Dichtheit</li>
                <li>Sehr niedrige Uw‑Werte (je nach Verglasung bis Passivhaus‑Niveau)</li>
                <li>6‑Kammer‑Profil, Mehrfachdichtung, große Glasdicken möglich</li>
                <li>Ideal für Neubau mit hohen Effizienzanforderungen</li>
              </ul>
            </ProductRow>

            <ProductRow title="Kömmerling 76 AD / 76 MD" img="/images/fenster/Kömmerling 76 MD.jpg" imgContain reverse>
              <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
                <li>76&nbsp;mm Bautiefe mit Anschlagdichtung (AD)</li>
                <li>76&nbsp;mm Bautiefe mit Mitteldichtung (MD)</li>
                <li>Sehr gutes Preis‑Leistungs‑Verhältnis für Neubau &amp; Sanierung</li>
                <li>Optimierte Wärme‑ &amp; Schalldämmung bei schlanker Optik</li>
                <li>Großes Zubehör‑ &amp; Farbprogramm</li>
              </ul>
            </ProductRow>

            <ProductRow title="Kömmerling Premidoor 76 Standard" img="/images/fenster/Premidoor.jpg" imgContain>
              <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
                <li>Profilstabilität für geschosshohe Elemente bis 2,60 m</li>
                <li>Uf = 1,4 W/(m²K), mit Ug = 0,5 W/m²K und Warmer Kante</li>
                <li>Barrierefreier Übergang, hochdämmende WPC-Bodenschwelle</li>
                <li>Unsichtbare Befestigung, bleifreie Ca/Zn-Stabilisatoren</li>
                <li>Optional Aluminiumschalen</li>
              </ul>
            </ProductRow>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            <Link href="/kontakt" className="btn-primary rounded-xl w-full sm:w-auto">Beratung & Angebot anfordern</Link>
            <a href="/pdfs/kommerling-88.pdf" className="btn-ghost rounded-xl w-full sm:w-auto">Datenblatt 88</a>
            <a href="/pdfs/kommerling-76-ad.pdf" className="btn-ghost rounded-xl w-full sm:w-auto">Datenblatt 76&nbsp;AD</a>
            <a href="/pdfs/kommerling-76-md.pdf" className="btn-ghost rounded-xl w-full sm:w-auto">Datenblatt 76&nbsp;MD</a>
            <a href="/pdfs/kommerling-premidoor.pdf" className="btn-ghost rounded-xl w-full sm:w-auto">Datenblatt Premidoor</a>
          </div>
        </div>
      </section>

      {/* BESCHATTUNG */}
      <section id="beschattung" className="section bg-gray-50">
        <div className="container space-y-8 sm:space-y-12">
          <header className="max-w-4xl">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <Pill>Beschattung</Pill>
            </div>
            <h2 className="h2">Raffstore & Blinos – Klima & Licht im Griff</h2>
            <p className="muted mt-3 sm:mt-4 text-responsive">
              Außenliegender Sonnenschutz hält Hitze effektiv <em>vor</em> der Scheibe,
              erlaubt blendfreies Tageslicht und verbessert die Energieeffizienz.
              Von integrierten Raffstores bis zu nachrüstbaren Blinos‑Rollos – wir beraten objektbezogen.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
              <Pill>Passiv kühlen</Pill>
              <Pill>Tageslicht steuern</Pill>
              <Pill>Nachrüstbar</Pill>
            </div>
          </header>

          {/* Raffstore – Text + Facts */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">Raffstore</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Verstellbare, lackierte Alulamellen halten Sommerhitze ab und lassen Licht hinein.
                Die Lamellenstellung sorgt für Sichtschutz bei guter Durchsicht.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm sm:text-base">
                <li>Einbauvarianten: Vorbau‑Unterputz, Sichtkasten, Aufsatzkasten</li>
                <li>Getriebe oder Motor, Bedienung per Funk/Wandtaster</li>
                <li>Kombinierbar mit Insektenschutz, viele RAL‑Farben</li>
                <li>Architektonisch clean, wartungsarm</li>
              </ul>
              <div>
                <Link href="/kontakt" className="btn-primary rounded-xl w-full sm:w-auto">Projekt besprechen</Link>
              </div>
            </div>

            {/* Produktgrid Raffstore */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <ProductCard
                href="/produkte/rollaeden/raffstore/retrolux"
                title="RETROLux Tageslichtraffstore"
                img="/images/beschattung/retro.jpg"
                alt="RETROLux Tageslichtraffstore"
                fillMode="cover"
              />
              <ProductCard
                href="/produkte/rollaeden/raffstore/vorbau-unterputz"
                title="Vorbau Unterputz"
                img="/images/beschattung/Raff S Putz.jpg"
                alt="Vorbau Unterputz Raffstore"
              />
              <ProductCard
                href="/produkte/rollaeden/raffstore/sichtkasten"
                title="Sichtkasten"
                img="/images/beschattung/Raff S Kasten.jpg"
                alt="Sichtkasten Raffstore"
              />
              <ProductCard
                href="/produkte/rollaeden/raffstore/aufsatzkasten"
                title="Aufsatzkasten"
                img="/images/beschattung/Resa-Kasten.jpg"
                alt="Aufsatzkasten Raffstore"
              />
            </div>
          </div>

          {/* Blinos – klemmbare Lösung */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <Image src="/images/beschattung/außenklemmrollo.png" alt="Blinos Rollo" fill className="object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">Außenklemmrollos</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Das einzige <strong>außenliegende Sonnenschutz‑Rollo zum Klemmen</strong> –
                werkzeuglos montiert, ohne Bohren. Ideal für Mietwohnungen und schnelle Nachrüstung:
                geringer Platzbedarf, wind‑/wetterfest und diebstahlsicher.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm sm:text-base">
                <li>Kühlt spürbar, bleibt von innen gut durchsichtig</li>
                <li>Montage ohne Beschädigung von Fenster/Fassade – in Minuten</li>
                <li>Passt auf ~90 % der Fenster, auch für Türen</li>
                <li>Viele RAL‑Farben, optional Insektenschutz</li>
              </ul>
              <div>
                <Link href="/kontakt" className="btn-primary rounded-xl w-full sm:w-auto">Beratung & Angebot</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA GESAMT */}
      <section className="section bg-white">
        <div className="container">
          <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 lg:p-10 text-center shadow-sm">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">Starten Sie Ihr Effizienz‑Projekt</h3>
            <p className="muted mt-3 sm:mt-4 max-w-2xl mx-auto text-responsive">
              Wir planen fenster‑ und beschattungsübergreifend – für bestes Raumklima, niedrige Energiekosten
              und eine starke Optik. Auf Wunsch inkl. Förder‑Check.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/kontakt" className="btn-primary rounded-xl w-full sm:w-auto">Kostenlose Erstberatung</Link>
              <Link href="/pv-rechner" className="btn-ghost rounded-xl w-full sm:w-auto">PV‑Rechner (optional)</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ZURÜCK NACH OBEN */}
      <div className="section bg-gray-50">
        <div className="container text-center">
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
             className="text-sm text-emerald-700 hover:underline">
            ↑ Zurück nach oben
          </a>
        </div>
      </div>
    </div>
  );
}
