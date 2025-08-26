import Image from "next/image";
import Link from "next/link";
import * as React from "react";

/* --- Helpers --- */
function Advantage({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 h-full">
      {kicker && <div className="text-sm text-emerald-700 font-medium mb-1">{kicker}</div>}
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="muted mt-2 text-[15px] leading-relaxed">{children}</p>
    </div>
  );
}

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
      className={`grid items-center gap-6 md:gap-10 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
    >
      {/* Bild */}
      <figure className="w-full">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
          <Image src={img} alt={title} fill className="object-cover" sizes="(min-width: 768px) 520px, 100vw" />
        </div>
      </figure>

      {/* Text */}
      <div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h3>
        <div className="mt-3 text-gray-700 leading-relaxed text-[15px]">{children}</div>
      </div>
    </article>
  );
}

const ROKA_URL = "https://pannontec.door-konfigurator.com/de/";

export default function TuerenPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 space-y-14">
      {/* HERO */}
      <section className="relative min-h-[46vh] md:min-h-[56vh] flex items-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/tueren/roka.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="container relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Haustüren mit ROKA – Design, Sicherheit & Komfort</h1>
          <p className="mt-3 max-w-2xl text-gray-100">
            Als Partner von <b>ROKA</b> planen und liefern wir Haustüren, die Architektur, Effizienz und
            Sicherheit elegant verbinden – präzise gefertigt und sauber montiert.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/kontakt" className="btn-primary bg-white text-emerald-700 hover:bg-gray-100">
              Beratung anfragen
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <header className="max-w-3xl">
        <h2 className="h2">Unsere Zusammenarbeit mit ROKA</h2>
        <p className="muted mt-2">
          Von der Gestaltung bis zur Montage arbeiten wir mit ROKA eng zusammen. Sie erhalten
          hochwertige Aluminium‑ und Kunststoff‑Haustüren mit Top‑Dämmwerten, geprüfter
          Einbruchhemmung und einer großen Auswahl an Oberflächen, Griffen und Gläsern. Über den
          Konfigurator stellen wir Ihre Wunsch‑Tür zusammen und veredeln sie auf Wunsch mit
          Smart‑Home‑Komfort und barrierearmen Schwellen.
        </p>
      </header>

      {/* Vorteile aus deinen Bildern */}
      <section className="space-y-8">
        <h3 className="h2">Warum ROKA‑Haustüren?</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Advantage title="Hydro CIRCAL" kicker="Umweltschutz & Design">
            Aluminiumprofile mit hohem Recycling‑Anteil (bis ~80 %) minimieren die Umweltbelastung –
            für Türen, die Nachhaltigkeit und Ästhetik verbinden.
          </Advantage>
          <Advantage title="RC2" kicker="Kompro­misslose Sicherheit">
            Die Widerstandsklasse RC2 bestätigt Widerstand gegen Einbruchversuche mit einfachen
            Werkzeugen – empfohlen für Einfamilienhäuser.
          </Advantage>
          <Advantage title="PAS 24" kicker="Geprüfte Einbruchhemmung">
            Strenger Standard für Türen und Fenster; typische Manipulationsversuche mit
            Hebelwerkzeugen werden im Test simuliert.
          </Advantage>
          <Advantage title="IFT Rosenheim" kicker="Qualität & Zuverlässigkeit">
            Prüfungen auf mechanische Beständigkeit sowie Luft‑/Schlagregendichtheit – für
            langlebige Funktion und Komfort.
          </Advantage>
          <Advantage title="German Design Award 2025" kicker="Form & Funktion">
            Das Modell <b>GRANO</b> wurde 2025 ausgezeichnet – elegante Gestaltung und
            Zukunftsorientierung in einem Produkt.
          </Advantage>
          <Advantage title="Archiproducts Award 2024" kicker="Design, das inspiriert">
            Internationale Anerkennung für GRANO: Verbindung aus Innovation und Funktionalität.
          </Advantage>
        </div>
      </section>

      {/* Beispiel-Modelle/Materialien */}
      <section className="space-y-10">
        <ProductRow title="ROKA GRANO – die ikonische Design‑Haustür" img="/images/tueren/grano.webp">
          <p>
            Prämiertes Design, starke Dämmwerte und viele Gestaltungsoptionen: flächenbündige Optik,
            Glasausschnitte, Designleisten, bündige Stoßgriffe und verdeckte Bänder.
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Wärmedämmung auf Top‑Niveau (je nach Aufbau)</li>
            <li>RC2‑Ausstattung möglich</li>
            <li>Individuelle Farben – auch Feinstruktur & Holzdekor</li>
          </ul>
        </ProductRow>

        <ProductRow title="Aluminium – robust & wertig" img="/images/tueren/essential.webp" reverse>
          <p>
            Aluminiumtüren stehen für hohe Stabilität, schlanke Ansichten und exzellente
            Witterungsbeständigkeit. Ideal für starke Farben und große Griffe.
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Langlebige Pulverlack‑Oberflächen</li>
            <li>Sehr gute Einbruchhemmung & Dichtheit</li>
            <li>Optional: Seitenteile/Oberlichter & Smart‑Zutritt</li>
          </ul>
        </ProductRow>

        <ProductRow title="Glas & Licht – mit Fingerspitzengefühl" img="/images/tueren/glas.jpg">
          <p>
            Ornament‑, Klarglas oder satinierte Flächen sorgen für Helligkeit im Eingangsbereich –
            mit Mehrfach‑Sicherheitsglas und warmer Kante für beste Werte.
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Wahl aus vielen Glasarten & Motiv‑Einlegern</li>
            <li>Sichtschutz ohne Verzicht auf Tageslicht</li>
            <li>Thermisch optimierte Verglasungen</li>
          </ul>
        </ProductRow>
      </section>

      {/* Abschluss‑CTA */}
      <div className="text-center">
        <Link href="/kontakt" className="btn-primary">Beratung & Angebot anfordern</Link>
      </div>
    </div>
  );
}
