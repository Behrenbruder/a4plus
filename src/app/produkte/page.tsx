export default function ProduktePage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="h1 mb-6">Produkte</h1>
        <section id="daemmung" className="mb-12">
          <h2 className="h2">Dämmmaterial</h2>
          <p className="muted mt-2">Mineralwolle, Holzfaser, EPS/XPS u.v.m. – für Dach, Fassade, Boden.</p>
        </section>
        <section id="fenster-tueren" className="mb-12">
          <h2 className="h2">Fenster & Türen</h2>
          <p className="muted mt-2">Kunststoff, Holz, Alu – mit Montage und Entsorgung Ihrer Altbauteile.</p>
        </section>
        <section id="pv" className="mb-12">
          <h2 className="h2">Photovoltaik & Speicher</h2>
          <p className="muted mt-2">Module, Wechselrichter, Montagesysteme und Batteriespeicher – passend ausgelegt.</p>
        </section>
      </div>
    </div>
  );
}

<section id="rollaeden" className="mb-12">
  <h2 className="h2">Rolläden & Blinos‑Rollos</h2>
  <p className="muted mt-2">
    Mehr Komfort, Sicht‑ und Hitzeschutz: Klassische Rolläden oder innovative Blinos‑Rollos zur Nachrüstung ohne Bohren.
    Perfekt zur energetischen Sanierung – weniger Hitze im Sommer, bessere Dämmung im Winter.
  </p>
  <ul className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
    <li className="card p-4"><strong>Nachrüstung leicht gemacht:</strong> Blinos‑Rollos in Minuten montiert.</li>
    <li className="card p-4"><strong>Wärmeschutz & Privatsphäre:</strong> spürbar angenehmer Wohnkomfort.</li>
    <li className="card p-4"><strong>Automatisierung:</strong> optional mit Funk/Smart‑Home steuerbar.</li>
    <li className="card p-4"><strong>Beratung & Montage:</strong> wir vermessen, liefern und bauen ein.</li>
  </ul>
</section>
