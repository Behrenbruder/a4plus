export default function LeistungenPage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="h1 mb-6">Leistungen</h1>
        <ul className="grid md:grid-cols-2 gap-6">
          <li className="card p-6">
            <div className="font-semibold">Beratung & Planung</div>
            <p className="muted mt-1">Bedarfsermittlung, Materialauswahl, PV-Vorauslegung.</p>
          </li>
          <li className="card p-6">
            <div className="font-semibold">Montage</div>
            <p className="muted mt-1">Eigene Teams, termingerecht, sauber dokumentiert.</p>
          </li>
          <li className="card p-6">
            <div className="font-semibold">Fördermittel-Hinweise*</div>
            <p className="muted mt-1">Transparenz zu gängigen Programmen (KfW/BAFA) – ohne Rechtsberatung.</p>
          </li>
          <li className="card p-6">
            <div className="font-semibold">Service & Wartung</div>
            <p className="muted mt-1">Inspektionen, Reparaturen, Garantieabwicklung.</p>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-4">*Unverbindliche Hinweise – verbindliche Klärung bleibt Kund:in/Behörden vorbehalten.</p>
      </div>
    </div>
  );
}
