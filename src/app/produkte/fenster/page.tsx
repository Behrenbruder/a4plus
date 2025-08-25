// src/app/produkte/fenster-beschattung/page.tsx
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
      className="flex-1 min-w-[220px] rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm hover:shadow transition flex items-center justify-between"
    >
      <span className="font-semibold text-gray-900">{label}</span>
      <span className="text-emerald-600">{icon}</span>
    </a>
  );
}

/** Reusable Mini-Komponenten */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium">
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
      className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:shadow-md hover:text-emerald-700 transition"
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
  imgContain?: boolean; // z.B. für Renderings/Produktbilder
}) {
  return (
    <article
      className={`grid items-center gap-6 md:gap-10 md:grid-cols-2 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <figure className="w-full">
        <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <Image
            src={img}
            alt={title}
            fill
            className={imgContain ? "object-contain p-4" : "object-cover"}
            sizes="(min-width: 1024px) 600px, 100vw"
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5"></div>
        </div>
      </figure>

      <div>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h3>
        <div className="mt-3 text-gray-700 leading-relaxed">{children}</div>
      </div>
    </article>
  );
}

/** Produktkarte (Beschattung) */
function ProductCard({
  href,
  title,
  img,
  alt,
}: { href: string; title: string; img: string; alt: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
    >
      <div className="relative aspect-[4/3] bg-gray-50">
        <Image src={img} alt={alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
      </div>
      <div className="px-4 py-3">
        <div className="font-medium text-gray-800 group-hover:text-emerald-700">{title}</div>
      </div>
    </Link>
  );
}

export default function FensterUndBeschattungPage() {
  useSmoothScroll();

  return (
    <div className="max-w-screen-xl mx-auto px-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl mt-4">
        <div className="absolute inset-0">
          <Image
            src="/images/fenster/clean.jpg"
            alt="Modernisiertes Haus mit effizienten Fenstern und Beschattung"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-black/20" />
        </div>

        <div className="relative min-h-[48vh] md:min-h-[56vh] flex items-center">
          <div className="w-full text-center text-white px-6 py-12">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Fenster & Beschattung – Effizienz, Komfort, Design
            </h1>
            <p className="mt-3 text-gray-100 max-w-3xl mx-auto">
              Bessere U‑Werte, mehr Sicherheit und angenehmes Raumklima.
              Perfekt abgestimmt – von Fenstern bis Raffstore & Rollos.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <JumpButton href="#fenster" label="Zu Fenstern" />
              <JumpButton href="#beschattung" label="Zu Beschattung" />
              <Link href="/kontakt" className="btn-primary bg-white text-emerald-700 hover:bg-gray-100 font-semibold rounded-xl px-4 py-2">
                Angebot anfordern
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY SPRUNGLEISTE */}
      <section className="flex flex-wrap gap-4 justify-center">
          <JumpCard href="#fenster" label="Zu den Fenstern" />
          <JumpCard href="#beschattung" label="Zur Beschattung" />
      </section>

      {/* FENSTER */}
      <section id="fenster" className="space-y-10 py-12">
        <header className="max-w-4xl">
          <h2 className="h2 mt-3 text-3xl md:text-4xl font-semibold">Von unseren Kunden gelobte Fenster</h2>
          <p className="muted mt-2 text-[15px] md:text-base">
            Wir bieten vorwiegend Fenster des Weltmarktführers <strong>Kömmerling</strong> aus Pirmasens.
            Dank des innovativen Produktportfolios lassen sich selbst anspruchsvolle Projekte
            wirtschaftlich realisieren. Außerdem bieten wir in Zusammenarbeit mit der Schweizer FEYCO AG ein breites Farbfolien‑Programm und können die Fenster
            für eine hochwertige Aluminiumoptik in <strong>RAL‑Farben</strong> sowie in <strong>DB‑703</strong> lackieren lassen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill>Großes Farb‑/Designprogramm</Pill>
            <Pill>Sehr gute Uw‑Werte</Pill>
            <Pill>Markenbeschläge</Pill>
            <Pill>RC‑Sicherheitsoptionen</Pill>
          </div>
        </header>

        <div className="grid gap-12">
          <div>
            <h2 className="h2 mt-3 text-3xl md:text-4xl font-semibold mb-8">Worauf Sie bei Ihren Fenster achten sollten</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Uw-Wert Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <span className="text-2xl">🌡️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Uw-Wert</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Wärmedämmkoeffizient des gesamten Fensters – je niedriger, desto besser. Ein <strong className="text-blue-600">Uw ≤ 0,80 W/m²K</strong> entspricht modernem Stand der Technik und unterbietet den von der KfW geforderten Wert <strong>0,95 W/m²K</strong> deutlich.
                    </p>
                  </div>
                </div>
              </div>

              {/* BAFA-Förderung Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <span className="text-2xl">💨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Lüftungskonzept</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Um eine <strong className="text-green-600">BAFA-Förderung</strong> beantragen zu können, ist seit 2024 ein passendes Lüftungskonzept erforderlich. Wir setzen <strong>werkseitige Fensterlüfter</strong> ein, die eine Mindestluftzirkulation sicherstellen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Beschläge Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Markenbeschläge</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Hochwertige Marken wie <em className="text-purple-600">Siegenia Titan</em> oder <em className="text-purple-600">ROTO Designo</em> sind langlebig, gut nachrüstbar und bieten sichere Dreh-/Kipp-Funktion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Einbruchhemmung Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">RC-Sicherheitsoptionen</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Im EG/UG empfehlen wir Sicherheitsbeschläge nach <strong className="text-red-600">RC-2N</strong> für optimalen Einbruchschutz und Ihre Sicherheit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Komfort & Sicherheit Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Komfort & Sicherheit</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Spaltlüftung, Fehlbediensperre und <em className="text-amber-600">Secustik</em>-Griffe erhöhen Bedienkomfort und Schutz erheblich.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hebeschiebetüren Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <span className="text-2xl">🚪</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Hebeschiebetüren</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <strong className="text-emerald-600">Lux-Version</strong> mit schlankeren Rahmen, mehr Licht und verbesserter Energieeffizienz für moderne Wohnkonzepte.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Beispielhafte Modelle – du kannst diese Reihen anpassen/erweitern */}
          <ProductRow title="Kömmerling 88" img="/images/fenster/Kömmerling 88.jpg" imgContain>
            <ul className="list-disc pl-5 space-y-1">
              <li>88&nbsp;mm Bautiefe – sehr gute Statik und Dichtheit</li>
              <li>Sehr niedrige Uw‑Werte (je nach Verglasung bis Passivhaus‑Niveau)</li>
              <li>6‑Kammer‑Profil, Mehrfachdichtung, große Glasdicken möglich</li>
              <li>Ideal für Neubau mit hohen Effizienzanforderungen</li>
            </ul>
          </ProductRow>

          <ProductRow title="Kömmerling 76 AD / 76 MD" img="/images/fenster/Kömmerling 76 MD.jpg" imgContain reverse>
            <ul className="list-disc pl-5 space-y-1">
              <li>76&nbsp;mm Bautiefe mit Anschlagdichtung (AD)</li>
              <li>Sehr gutes Preis‑Leistungs‑Verhältnis für Neubau &amp; Sanierung</li>
              <li>Optimierte Wärme‑ &amp; Schalldämmung bei schlanker Optik</li>
              <li>Großes Zubehör‑ &amp; Farbprogramm</li>
            </ul>
          </ProductRow>

          <ProductRow title="Kömmerling Premidoor 76 Standard" img="/images/fenster/Premidoor.jpg" imgContain>
            <ul className="list-disc pl-5 space-y-1">
              <li>Profilstabilität für geschosshohe Elemente bis 2,60 m</li>
              <li>Uf = 1,4 W/(m²K), mit Ug = 0,5 W/m²K und Warmer Kante</li>
              <li>Barrierefreier Übergang, hochdämmende WPC-Bodenschwelle</li>
              <li>Unsichtbare Befestigung, bleifreie Ca/Zn-Stabilisatoren</li>
              <li>Optional Aluminiumschalen</li>
            </ul>
          </ProductRow>

          <div className="flex flex-wrap gap-3">
            <Link href="/kontakt" className="btn-primary rounded-xl">Beratung & Angebot anfordern</Link>
            <a href="/pdfs/kommerling-88.pdf" className="btn-ghost rounded-xl">Datenblatt 88</a>
            <a href="/pdfs/kommerling-76-ad.pdf" className="btn-ghost rounded-xl">Datenblatt 76&nbsp;AD</a>
            <a href="/pdfs/kommerling-76-md.pdf" className="btn-ghost rounded-xl">Datenblatt 76&nbsp;MD</a>
            <a href="/pdfs/kommerling-premidoor.pdf" className="btn-ghost rounded-xl">Datenblatt Premidoor</a>
          </div>
        </div>
      </section>

      {/* VISUELLE TRENNER */}
      <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* BESCHATTUNG */}
      <section id="beschattung" className="space-y-10 py-12">
        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2">
            <Pill>Beschattung</Pill>
          </div>
          <h2 className="h2 mt-3 text-3xl md:text-4xl font-semibold">Raffstore & Blinos – Klima & Licht im Griff</h2>
          <p className="muted mt-2 text-[15px] md:text-base">
            Außenliegender Sonnenschutz hält Hitze effektiv <em>vor</em> der Scheibe,
            erlaubt blendfreies Tageslicht und verbessert die Energieeffizienz.
            Von integrierten Raffstores bis zu nachrüstbaren Blinos‑Rollos – wir beraten objektbezogen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill>Passiv kühlen</Pill>
            <Pill>Tageslicht steuern</Pill>
            <Pill>Nachrüstbar</Pill>
          </div>
        </header>

        {/* Raffstore – Text + Facts */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Raffstore</h3>
            <p className="mt-2 text-gray-700">
              Verstellbare, lackierte Alulamellen halten Sommerhitze ab und lassen Licht hinein.
              Die Lamellenstellung sorgt für Sichtschutz bei guter Durchsicht.
            </p>
            <ul className="mt-4 list-disc pl-5 space-y-1 text-gray-700">
              <li>Einbauvarianten: Vorbau‑Unterputz, Sichtkasten, Aufsatzkasten</li>
              <li>Getriebe oder Motor, Bedienung per Funk/Wandtaster</li>
              <li>Kombinierbar mit Insektenschutz, viele RAL‑Farben</li>
              <li>Architektonisch clean, wartungsarm</li>
            </ul>
            <div className="mt-5">
              <Link href="/kontakt" className="btn-primary rounded-xl">Projekt besprechen</Link>
            </div>
          </div>

          {/* Produktgrid Raffstore */}
          <div className="grid gap-5 sm:grid-cols-2">
            <ProductCard
              href="/produkte/rollaeden/raffstore/retrolux"
              title="RETROLux Tageslichtraffstore"
              img="/images/raffstore/retrolux.jpg"
              alt="RETROLux Tageslichtraffstore"
            />
            <ProductCard
              href="/produkte/rollaeden/raffstore/vorbau-unterputz"
              title="Vorbau Unterputz"
              img="/images/raffstore/vorbau-unterputz.jpg"
              alt="Vorbau Unterputz Raffstore"
            />
            <ProductCard
              href="/produkte/rollaeden/raffstore/sichtkasten"
              title="Sichtkasten"
              img="/images/raffstore/sichtkasten.jpg"
              alt="Sichtkasten Raffstore"
            />
            <ProductCard
              href="/produkte/rollaeden/raffstore/aufsatzkasten"
              title="Aufsatzkasten"
              img="/images/raffstore/aufsatzkasten.jpg"
              alt="Aufsatzkasten Raffstore"
            />
          </div>
        </div>

        {/* Blinos – klemmbare Lösung */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <Image src="/images/blinos/hero.jpg" alt="Blinos Rollo" fill className="object-cover" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Blinos‑Rollos (zum Klemmen)</h3>
            <p className="mt-2 text-gray-700">
              Das einzige <strong>außenliegende Sonnenschutz‑Rollo zum Klemmen</strong> –
              werkzeuglos montiert, ohne Bohren. Ideal für Mietwohnungen und schnelle Nachrüstung:
              geringer Platzbedarf, wind‑/wetterfest und diebstahlsicher.
            </p>
            <ul className="mt-4 list-disc pl-5 space-y-1 text-gray-700">
              <li>Kühlt spürbar, bleibt von innen gut durchsichtig</li>
              <li>Montage ohne Beschädigung von Fenster/Fassade – in Minuten</li>
              <li>Passt auf ~90 % der Fenster, auch für Türen</li>
              <li>Viele RAL‑Farben, optional Insektenschutz</li>
            </ul>
            <div className="mt-5">
              <Link href="/kontakt" className="btn-primary rounded-xl">Beratung & Angebot</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA GESAMT */}
      <section className="my-14 rounded-3xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-8 md:p-10 text-center shadow-sm">
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Starten Sie Ihr Effizienz‑Projekt</h3>
        <p className="muted mt-2 max-w-2xl mx-auto">
          Wir planen fenster‑ und beschattungsübergreifend – für bestes Raumklima, niedrige Energiekosten
          und eine starke Optik. Auf Wunsch inkl. Förder‑Check.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/kontakt" className="btn-primary rounded-xl">Kostenlose Erstberatung</Link>
          <Link href="/pv-rechner" className="btn-ghost rounded-xl">PV‑Rechner (optional)</Link>
        </div>
      </section>

      {/* ZURÜCK NACH OBEN */}
      <div className="mb-16 flex justify-center">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
           className="text-sm text-emerald-700 hover:underline">
          ↑ Zurück nach oben
        </a>
      </div>
    </div>
  );
}
