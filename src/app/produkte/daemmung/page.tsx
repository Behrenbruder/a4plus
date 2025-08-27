import Image from "next/image";
import Link from "next/link";

export default function DaemmungPage() {
  return (
    <div className="space-y-0">
      {/* HERO */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/daemmung/daemmung2.jpg"
            alt="Hochwertige Dämmmaterialien"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="h1 text-white">Dämmung</h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl">
              Effizienter Wärmeschutz mit hochwertigen EPS-Materialien – schlanker,
              druckfester, langlebiger.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link href="/kontakt" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100 w-full sm:w-auto">
                Beratung & Angebot anfordern
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="h2">Hochwertige EPS Dämmmaterialien</h2>
            <p className="muted mt-4 sm:mt-6 text-responsive">
              Wir bieten besonders hochwertiges EPS-Dämmmaterial mit{" "}
              <strong>Wärmeleitwert 031</strong>. Damit erreichen Sie die gleiche
              Dämmwirkung bei deutlich geringerer Dicke im Vergleich zu herkömmlichen
              Produkten mit schlechterem Wirkungsgrad. Unsere Materialien zeichnen
              sich außerdem durch <strong>erhöhte Druckfestigkeit</strong> und eine
              exzellente <strong>Verarbeitungsqualität</strong> aus.
            </p>
          </div>
        </div>
      </section>

      {/* TABELLE */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="h2">Dämmstoff-Vergleich nach Standards</h2>
              <p className="muted mt-3 sm:mt-4 text-responsive">
                Übersicht der Eignung verschiedener EPS-Materialien für unterschiedliche Energiestandards
              </p>
            </div>
            
            <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full min-w-[500px] text-sm sm:text-base">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-left font-semibold">Dämmstoff</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-center font-semibold">EnEV</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-center font-semibold">KfW 70</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-center font-semibold">KfW 55</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-center font-semibold">KfW 40</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-emerald-700">EPS 031</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-lg">✔️</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-lg">✔️</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-lg">✔️</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-lg">✔️</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium">EPS 035</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-lg">✔️</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-lg">✔️</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-400">–</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-400">–</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium">EPS 040</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-lg">✔️</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-400">–</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-400">–</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-400">–</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                ✔️ = Geeignet für Standard | – = Nicht ausreichend für Standard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM PRODUKT */}
      <section className="section bg-emerald-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <Image
                    src="/images/daemmung.webp"
                    alt="Swisspor Lambda Weiß Dämmung"
                    width={600}
                    height={400}
                    className="w-full h-[250px] sm:h-[320px] lg:h-[400px] object-cover"
                  />
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <h2 className="h2">Premiumlösung: Swisspor Lambda Weiß</h2>
                <p className="muted mt-3 sm:mt-4 text-responsive">
                  Mit <strong>Swisspor Lambda Weiß</strong> erhalten Sie die
                  herausragenden Dämmeigenschaften eines Graphit-basierten EPS-Systems –
                  kombiniert mit einer besonderen <strong>Unempfindlichkeit gegenüber
                  Sonneneinstrahlung</strong>. So vereint dieses Premiumprodukt die
                  Vorteile verschiedener Dämmsysteme in einer Lösung und sorgt für
                  höchste Effizienz und Langlebigkeit.
                </p>
                
                <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  {[
                    "Wärmeleitwert 031 für optimale Dämmleistung",
                    "Erhöhte Druckfestigkeit und Langlebigkeit",
                    "Unempfindlich gegenüber Sonneneinstrahlung",
                    "Geringere Dämmdicke bei gleicher Wirkung",
                    "Exzellente Verarbeitungsqualität"
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                      <span className="text-sm sm:text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 sm:mt-8">
                  <Link href="/kontakt" className="btn-primary w-full sm:w-auto">
                    Beratung & Angebot anfordern
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VORTEILE */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="h2">Warum hochwertige Dämmung?</h2>
            <p className="muted mt-3 sm:mt-4 text-responsive max-w-3xl mx-auto">
              Investieren Sie in die Zukunft Ihres Gebäudes mit professioneller Dämmung
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: "🏠",
                title: "Energiekosten senken",
                description: "Reduzieren Sie Ihre Heiz- und Kühlkosten um bis zu 40% durch optimale Wärmedämmung."
              },
              {
                icon: "🌡️",
                title: "Wohnkomfort steigern",
                description: "Gleichmäßige Temperaturen und keine kalten Wände für behagliches Wohnen das ganze Jahr."
              },
              {
                icon: "🌱",
                title: "Umwelt schonen",
                description: "Weniger Energieverbrauch bedeutet weniger CO₂-Emissionen und aktiver Klimaschutz."
              },
              {
                icon: "💰",
                title: "Immobilienwert steigern",
                description: "Professionelle Dämmung erhöht den Marktwert Ihrer Immobilie nachhaltig."
              },
              {
                icon: "🛡️",
                title: "Bausubstanz schützen",
                description: "Schutz vor Feuchtigkeit und Temperaturschwankungen verlängert die Lebensdauer."
              },
              {
                icon: "📋",
                title: "Standards erfüllen",
                description: "Erfüllung aller aktuellen Energiestandards von EnEV bis KfW 40."
              }
            ].map((item) => (
              <div key={item.title} className="card touch-spacing text-center">
                <div className="text-2xl sm:text-3xl mb-3">{item.icon}</div>
                <h3 className="h3 mb-2">{item.title}</h3>
                <p className="muted text-sm sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="h2">Bereit für professionelle Dämmung?</h2>
            <p className="muted mt-3 sm:mt-4 text-responsive">
              Lassen Sie sich von unseren Experten beraten und finden Sie die optimale Dämmlösung für Ihr Projekt.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/kontakt" className="btn-primary w-full sm:w-auto">
                Kostenlose Beratung anfragen
              </Link>
              <Link href="/produkte" className="btn-ghost w-full sm:w-auto">
                Weitere Produkte entdecken
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
