// src/app/daemmung/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function DaemmungPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 space-y-16">
      {/* HERO */}
     <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src="/images/daemmung/daemmung2.jpg"
          alt="Hochwertige Dämmmaterialien"
          fill
          priority
          className="object-cover rounded-2xl shadow-lg border border-gray-200"
        />
        <div className="absolute inset-0 bg-black/40 rounded-2xl" />
      </div>
      <div className="relative z-10 text-center text-white max-w-3xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Dämmung</h1>
        <p className="text-lg md:text-xl text-gray-100">
          Effizienter Wärmeschutz mit hochwertigen EPS-Materialien – schlanker,
          druckfester, langlebiger.
        </p>
      </div>
      </section>

      {/* INTRO */}
      <section>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="h2 mb-4">Hochwertige EPS Dämmmaterialien</h2>
          <p className="muted text-lg">
            Wir bieten besonders hochwertiges EPS-Dämmmaterial mit{" "}
            <strong>Wärmeleitwert 031</strong>. Damit erreichen Sie die gleiche
            Dämmwirkung bei deutlich geringerer Dicke im Vergleich zu herkömmlichen
            Produkten mit schlechterem Wirkungsgrad. Unsere Materialien zeichnen
            sich außerdem durch <strong>erhöhte Druckfestigkeit</strong> und eine
            exzellente <strong>Verarbeitungsqualität</strong> aus.
          </p>
        </div>
      </section>

      {/* TABELLE */}
      <section>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="px-4 py-3">Dämmstoff</th>
                <th className="px-4 py-3">EnEV</th>
                <th className="px-4 py-3">KfW 70</th>
                <th className="px-4 py-3">KfW 55</th>
                <th className="px-4 py-3">KfW 40</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 font-medium">EPS 031</td>
                <td className="px-4 py-3">✔️</td>
                <td className="px-4 py-3">✔️</td>
                <td className="px-4 py-3">✔️</td>
                <td className="px-4 py-3">✔️</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">EPS 035</td>
                <td className="px-4 py-3">✔️</td>
                <td className="px-4 py-3">✔️</td>
                <td className="px-4 py-3">–</td>
                <td className="px-4 py-3">–</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">EPS 040</td>
                <td className="px-4 py-3">✔️</td>
                <td className="px-4 py-3">–</td>
                <td className="px-4 py-3">–</td>
                <td className="px-4 py-3">–</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* PREMIUM PRODUKT */}
      <section className="bg-gray-50 py-16 rounded-2xl">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="h2 mb-4">Premiumlösung: Swisspor Lambda Weiß</h2>
          <p className="muted text-lg">
            Mit <strong>Swisspor Lambda Weiß</strong> erhalten Sie die
            herausragenden Dämmeigenschaften eines Graphit-basierten EPS-Systems –
            kombiniert mit einer besonderen <strong>Unempfindlichkeit gegenüber
            Sonneneinstrahlung</strong>. So vereint dieses Premiumprodukt die
            Vorteile verschiedener Dämmsysteme in einer Lösung und sorgt für
            höchste Effizienz und Langlebigkeit.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link href="/kontakt" className="btn-primary">
          Beratung & Angebot anfordern
        </Link>
      </section>
    </div>
  );
}
