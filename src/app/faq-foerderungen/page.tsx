"use client";
import { useState, useMemo } from "react";

type ResultItem = {
  id: string;
  level: "BUND" | "LAND";
  name: string;
  categories: string[];
  target: "PRIVAT" | "GEWERBLICH" | "BEIDES";
  type: "ZUSCHUSS" | "KREDIT" | "STEUER" | "VERGUETUNG";
  summary: string;
  amount: string;
  criteria: string;
  validity: string;
  authority: string;
  url: string;
  regions?: { bundesland: string }[];
};

type Result = { bundesweit: ResultItem[]; land: ResultItem[] };

const PRODUCT_CATEGORIES = [
  { key: "PV", label: "PV-Anlage", img: "/images/icons/pv2.png" },
  { key: "Speicher", label: "Batteriespeicher", img: "/images/icons/battery.png" },
  { key: "Dämmung", label: "Dämmung", img: "/images/icons/dämmung.png" },
  { key: "Fenster", label: "Fenster", img: "/images/icons/fenster.png" },
  { key: "Türen", label: "Türen", img: "/images/icons/tür.png" },
  { key: "Beschattung", label: "Beschattung", img: "/images/icons/rolladen.png" },
  { key: "Wärmepumpe", label: "Wärmepumpe", img: "/images/icons/waermepumpe.png" },
] as const;

// Checkboxen: hübsche Labels, Backend-Keys als value
const TYPE_OPTIONS = [
  { value: "ZUSCHUSS", label: "Zuschuss" },
  { value: "KREDIT", label: "Kredit" },
  { value: "VERGÜTUNG", label: "Vergütung" },
  { value: "STEUER", label: "Steuererleichterung" },
] as const;

const TYPE_LABEL: Record<ResultItem["type"], string> = {
  ZUSCHUSS: "Zuschuss",
  KREDIT: "Kredit",
  VERGUETUNG: "Vergütung",
  STEUER: "Steuererleichterung",
};

export default function FoerderCheckPage() {
  const [plz, setPlz] = useState("");
  const [bundesland, setBundesland] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const [product, setProduct] = useState<string>("PV");
  const [typeFilter, setTypeFilter] = useState<string[]>([]); // enthält Backend-Keys

  async function resolvePlz() {
    try {
      if (!plz || plz.length < 5) return;
      const r = await fetch(`https://api.zippopotam.us/de/${plz}`);
      if (!r.ok) return;
      const j = await r.json();
      const place = j.places?.[0];
      if (place?.state) setBundesland(place.state);
    } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setNote(null);

    const body = {
      plz,
      bundesland,
      categories: [product],
      types: typeFilter.length ? typeFilter : undefined,
    };

    const r = await fetch("/api/foerderungen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    setResult(j.result);
    setNote(j.municipalNote || null);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const byType = (arr: ResultItem[]) =>
      typeFilter.length === 0
        ? arr
        : arr.filter((p) => typeFilter.includes((p.type || "").toUpperCase()));

    return result
      ? {
          bundesweit: byType(result.bundesweit || []),
          land: byType(result.land || []),
        }
      : null;
  }, [result, typeFilter]);

  function toggleType(t: string) {
    setTypeFilter((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-10 space-y-8">
      <header className="text-center">
        <h1 className="h1">Förder-Check (Bund & Länder)</h1>
        <p className="muted mt-2">
          Gib deine PLZ ein – wir zeigen bundesweite und landesweite Förderungen. Kommunale Programme prüfen wir anschließend manuell.
        </p>
      </header>

      <form onSubmit={submit} className="card p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm text-gray-600">PLZ</label>
            <input
              className="mt-1 w-full rounded-xl border p-2"
              value={plz}
              onChange={(e) => setPlz(e.target.value)}
              maxLength={5}
              placeholder="z. B. 79104"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600">Bundesland (automatisch oder manuell)</label>
            <input
              className="mt-1 w-full rounded-xl border p-2"
              value={bundesland}
              onChange={(e) => setBundesland(e.target.value)}
              placeholder="z. B. Baden-Württemberg"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="button" onClick={resolvePlz} className="btn-ghost w-full">
              PLZ auflösen
            </button>
          </div>
        </div>

        {/* Produktauswahl als Karten */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Produkt auswählen</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRODUCT_CATEGORIES.map((p) => (
              <div
                key={p.key}
                onClick={() => setProduct(p.key)}
                className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center text-center ${
                  product === p.key ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-300"
                }`}
              >
                <img src={p.img} alt={p.label} className="w-12 h-12 object-contain mb-2" />
                <span className="text-sm">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Type-Filter als Checkboxes */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Förderarten auswählen</label>
          <div className="flex flex-wrap gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="inline-flex items-center gap-2 text-sm border rounded-xl px-3 py-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={typeFilter.includes(opt.value)}
                  onChange={() => toggleType(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Check starten
          </button>
        </div>
      </form>

      {loading && <p>Suche Förderprogramme…</p>}

      {filtered && (
        <div className="space-y-10">
          <Section title="Bundesweit" items={filtered.bundesweit} selectedProduct={product} />
          <Section
            title={bundesland ? `Land – ${bundesland}` : "Land (bitte Bundesland setzen)"}
            items={filtered.land}
            selectedProduct={product}
          />
          {note && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">{note}</p>
          )}
          <div className="text-center">
            <a href="/kontakt" className="btn-primary">
              Kostenlose Förderberatung anfragen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  selectedProduct,
}: {
  title: string;
  items: ResultItem[];
  selectedProduct: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="h2">{title}</h2>
      {!items?.length ? (
        <p className="muted">Keine Einträge gefunden.</p>
      ) : (
        <div className="grid gap-4">
          {items.map((p) => {
            const cats: string[] = Array.isArray(p.categories) ? p.categories : [];
            const otherCats = cats.filter((c) => c !== selectedProduct);
            const multi = cats.length > 1;

            return (
              <article key={p.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    {multi && (
                      <span className="text-xs rounded-full bg-blue-50 text-blue-700 px-2 py-1">
                        mehrere Kategorien
                      </span>
                    )}
                  </div>
                  <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
                    {TYPE_LABEL[p.type] ?? p.type}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-700">{p.summary}</div>

                {multi && (
                  <div className="mt-1 text-xs text-gray-600">
                    <b>Gilt auch für:</b> {otherCats.join(", ") || "—"}
                  </div>
                )}

                <div className="mt-2 text-sm">
                  <b>Förderhöhe:</b> {p.amount}
                </div>
                <div className="mt-1 text-sm">
                  <b>Kriterien:</b> {p.criteria}
                </div>
                <div className="mt-1 text-sm">
                  <b>Gültig:</b> {p.validity}
                </div>
                <div className="mt-2 text-sm">
                  <b>Träger:</b> {p.authority} —{" "}
                  <a className="text-emerald-700 underline" href={p.url} target="_blank" rel="noreferrer">
                    Offizielle Infos
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
