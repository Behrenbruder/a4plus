import Link from "next/link";
import Image from "next/image";

// Product card component for consistent styling
function ProductCard({
  title,
  description,
  features,
  image,
  href,
  badge,
}: {
  title: string;
  description: string;
  features: string[];
  image: string;
  href: string;
  badge?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg">
      {badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-medium">
            {badge}
          </span>
        </div>
      )}
      
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 350px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
        
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Link 
          href={href}
          className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          Mehr erfahren
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Service highlight component
function ServiceHighlight({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export default function ProduktePage() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 to-blue-50 py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Unsere Produkte & Leistungen
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Von der energetischen Sanierung bis zur modernen Haustechnik – wir bieten 
              Ihnen hochwertige Lösungen für mehr Komfort, Effizienz und Nachhaltigkeit 
              in Ihrem Zuhause.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/kontakt" className="btn-primary">
                Kostenlose Beratung
              </Link>
              <Link href="/pv-rechner" className="btn-ghost">
                PV-Rechner starten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ServiceHighlight
              icon="🏠"
              title="Komplettlösungen"
              description="Alles aus einer Hand – von der Planung bis zur Montage"
            />
            <ServiceHighlight
              icon="💰"
              title="Förderberatung"
              description="Wir finden die besten Förderprogramme für Ihr Projekt"
            />
            <ServiceHighlight
              icon="🔧"
              title="Fachgerechte Montage"
              description="Qualifizierte Partner sorgen für professionelle Installation"
            />
            <ServiceHighlight
              icon="📞"
              title="Persönlicher Service"
              description="Individuelle Beratung und langfristige Betreuung"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="h2 mb-4">Unsere Produktbereiche</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Entdecken Sie unser umfassendes Sortiment für die energetische Modernisierung 
              und den Komfort Ihres Zuhauses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProductCard
              title="Photovoltaik & Speicher"
              description="Produzieren Sie Ihren eigenen Strom und werden Sie unabhängiger von steigenden Energiepreisen."
              features={[
                "Individuelle Anlagenplanung",
                "Hochwertige Module & Wechselrichter",
                "Batteriespeicher für höheren Eigenverbrauch",
                "Förderberatung & Wirtschaftlichkeitsrechnung"
              ]}
              image="/images/pv.png"
              href="/produkte/pv"
              badge="Bestseller"
            />

            <ProductCard
              title="Wärmepumpen"
              description="Effizient heizen und kühlen mit umweltfreundlicher Technologie – für Neubau und Sanierung."
              features={[
                "Luft-Wasser & Luft-Luft Systeme",
                "Heizen & Kühlen in einem System",
                "Hohe Effizienz (COP > 4)",
                "Unabhängigkeit von fossilen Brennstoffen"
              ]}
              image="/images/waermepumpe.png"
              href="/produkte/waermepumpen"
              badge="Zukunftstechnologie"
            />

            <ProductCard
              title="Fenster & Türen"
              description="Hochwertige Kömmerling-Systeme für optimale Wärmedämmung, Sicherheit und Design."
              features={[
                "Kömmerling 88, 76 AD & 76 MD Systeme",
                "Sehr niedrige Uw-Werte",
                "Große Auswahl an Farben & Designs",
                "Inklusive Montage & Altbauteile-Entsorgung"
              ]}
              image="/images/fenster.jpg"
              href="/produkte/fenster"
            />

            <ProductCard
              title="Batteriespeicher"
              description="Maximieren Sie Ihren Eigenverbrauch und nutzen Sie Solarstrom auch nach Sonnenuntergang."
              features={[
                "Lithium-Ionen Technologie",
                "Modulare Erweiterbarkeit",
                "Intelligente Steuerung",
                "10+ Jahre Garantie"
              ]}
              image="/images/speicher.jpg"
              href="/produkte/batterie"
            />

            <ProductCard
              title="Dämmung"
              description="Professionelle Dämmung für Dach, Fassade und Boden – für weniger Energieverbrauch."
              features={[
                "Mineralwolle, Holzfaser, EPS/XPS",
                "Dach-, Fassaden- & Bodendämmung",
                "Wärmebrückenfreie Ausführung",
                "Bis zu 40% Heizkostenersparnis"
              ]}
              image="/images/daemmung.webp"
              href="/produkte/daemmung"
            />

            <ProductCard
              title="Türen"
              description="Hochwertige Haustüren für Sicherheit, Wärmedämmung und ein einladendes Erscheinungsbild."
              features={[
                "Aluminium & Kunststoff-Türen",
                "RC2 Sicherheitsausstattung",
                "Sehr gute Wärmedämmwerte",
                "Individuelle Gestaltungsmöglichkeiten"
              ]}
              image="/images/tueren.webp"
              href="/produkte/tueren"
            />

            <ProductCard
              title="Rolläden & Sonnenschutz"
              description="Mehr Komfort und Energieeffizienz durch modernen Sonnen- und Sichtschutz."
              features={[
                "Klassische Rolläden & Blinos-Rollos",
                "Nachrüstung ohne Bohren möglich",
                "Automatisierung & Smart-Home Integration",
                "Verbesserter Wärme- & Einbruchschutz"
              ]}
              image="/images/karusell/rolladen.jpg"
              href="/produkte/rollaeden"
            />
          </div>
        </div>
      </section>

      {/* Combination Benefits */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="h2 mb-4">Mehr als die Summe der Teile</h2>
              <p className="text-gray-700 mb-6">
                Die wahre Stärke liegt in der intelligenten Kombination unserer Produkte. 
                Photovoltaik mit Speicher und Wärmepumpe, gedämmte Gebäudehülle mit 
                effizienten Fenstern – so entstehen Gesamtlösungen, die Ihre Energiekosten 
                drastisch senken.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">PV + Speicher + Wärmepumpe</h4>
                    <p className="text-sm text-gray-600">Solarstrom für Heizung und Warmwasser nutzen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Dämmung + neue Fenster</h4>
                    <p className="text-sm text-gray-600">Optimale Gebäudehülle für minimalen Energiebedarf</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium">Rolläden + Smart Home</h4>
                    <p className="text-sm text-gray-600">Automatischer Sonnenschutz spart Kühlenergie</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/images/karusell/pv.png"
                    alt="Photovoltaik"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/images/karusell/fenster.jpg"
                    alt="Fenster"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/images/karusell/waermepumpe.png"
                    alt="Wärmepumpe"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/images/karusell/speicher.jpg"
                    alt="Speicher"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing & Support */}
      <section className="section bg-emerald-50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="h2 mb-4">Finanzierung & Förderung</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Wir unterstützen Sie dabei, die optimale Finanzierung für Ihr Projekt zu finden 
              und alle verfügbaren Fördermittel auszuschöpfen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <div className="text-3xl mb-4">🏛️</div>
              <h3 className="font-semibold mb-2">Staatliche Förderung</h3>
              <p className="text-sm text-gray-600 mb-4">
                KfW-Kredite, BAFA-Zuschüsse und regionale Programme – 
                wir kennen alle Möglichkeiten.
              </p>
              <Link href="/faq-foerderungen" className="text-emerald-700 text-sm font-medium hover:underline">
                Förder-FAQ ansehen
              </Link>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="font-semibold mb-2">Flexible Finanzierung</h3>
              <p className="text-sm text-gray-600 mb-4">
                Von Sofortfinanzierung bis Ratenkauf – 
                wir finden die passende Lösung für Ihr Budget.
              </p>
              <Link href="/kontakt" className="text-emerald-700 text-sm font-medium hover:underline">
                Beratung anfragen
              </Link>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold mb-2">Wirtschaftlichkeit</h3>
              <p className="text-sm text-gray-600 mb-4">
                Transparente Kostenrechnung und Amortisationsanalyse 
                für fundierte Entscheidungen.
              </p>
              <Link href="/pv-rechner" className="text-emerald-700 text-sm font-medium hover:underline">
                PV-Rechner nutzen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-white">
        <div className="container text-center">
          <h2 className="h2 mb-4">Bereit für Ihr Projekt?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Lassen Sie uns gemeinsam die beste Lösung für Ihr Zuhause finden. 
            Unsere Experten beraten Sie gerne kostenlos und unverbindlich.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/kontakt" className="btn-primary">
              Kostenlose Beratung vereinbaren
            </Link>
            <Link href="/pv-rechner" className="btn-ghost">
              PV-Potenzial berechnen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
