import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PVGIS_BASE = "https://re.jrc.ec.europa.eu/api/v5_2/PVcalc";

async function fetchPVGISOnce(params: URLSearchParams) {
  const url = `${PVGIS_BASE}?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } }); // 30 Tage
  if (!res.ok) throw new Error(`PVGIS error ${res.status}`);
  return res.json();
}

function buildParams({
  lat, lon, tiltDeg, azimuthDeg, lossPercent,
}: {
  lat: number; lon: number; tiltDeg: number; azimuthDeg: number; lossPercent: number;
}) {
  const p = new URLSearchParams();
  p.set("lat", String(lat));
  p.set("lon", String(lon));
  p.set("angle", String(tiltDeg));      // Modulneigung
  p.set("aspect", String(azimuthDeg));  // 0=Süd, +90=West, -90=Ost
  p.set("peakpower", "1");              // 1 kWp → E_y = kWh/kWp·a
  p.set("loss", String(Math.max(0, Math.min(40, lossPercent))));
  p.set("pvtechchoice", "crystSi");
  p.set("mountingplace", "building");
  p.set("usehorizon", "1");
  p.set("outputformat", "json");
  p.set("raddatabase", "PVGIS-SARAH2"); // Europa
  return p;
}

// robuste Extraktion aus PVGIS (PVcalc)
function extract(json: any) {
  const totals = json?.outputs?.totals?.fixed ?? json?.outputs?.totals ?? {};

  // Spezifischer Ertrag (kWh/kWp·a)
  const E_y = Number(totals?.E_y);

  // GTI (kWh/m²·a) – PVcalc nutzt H(i)_y / H(i)_year
  let Hiy = Number(totals?.["H(i)_y"]);
  if (!Number.isFinite(Hiy)) Hiy = Number(totals?.["H(i)_year"]);
  if (!Number.isFinite(Hiy)) Hiy = Number(totals?.["H(i)"]);
  if (!Number.isFinite(Hiy)) Hiy = Number(totals?.["G(i)"]);

  return {
    specificYield: Number.isFinite(E_y) ? E_y : undefined,
    gtiKWhm2Year: Number.isFinite(Hiy) ? Hiy : undefined,
  };
}

// ---------- GET: eine Fläche ----------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));
    const tilt = Number(searchParams.get("tilt"));
    const azimuth = Number(searchParams.get("azimuth"));
    const loss = Number(searchParams.get("loss") ?? 14);

    if (![lat, lon, tilt, azimuth].every(Number.isFinite)) {
      return NextResponse.json({ ok: false, error: "Missing lat/lon/tilt/azimuth" }, { status: 400 });
    }

    const p = buildParams({ lat, lon, tiltDeg: tilt, azimuthDeg: azimuth, lossPercent: loss });
    const data = await fetchPVGISOnce(p);
    const ext = extract(data);

    if (!Number.isFinite(ext.specificYield)) {
      return NextResponse.json({ ok: false, error: "PVGIS response missing E_y", raw: data }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      inputs: { lat, lon, tilt, azimuth, loss },
      specificYieldKWhPerKWp: ext.specificYield,
      gtiKWhm2Year: ext.gtiKWhm2Year ?? null,
      pvgis: { meta: data?.meta },
    }, { headers: { "Cache-Control": "s-maxage=2592000, stale-while-revalidate=86400" } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "PVGIS GET failed" }, { status: 500 });
  }
}

// ---------- POST: mehrere Flächen ----------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lat = Number(body?.lat);
    const lon = Number(body?.lon);
    const loss = Number.isFinite(Number(body?.loss)) ? Number(body?.loss) : 14;
    const faces: Array<{ tiltDeg: number; azimuthDeg: number; weight?: number }> =
      Array.isArray(body?.faces) ? body.faces : [];

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || faces.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing lat/lon or faces[]" }, { status: 400 });
    }

    const results = await Promise.all(
      faces.map(async (f, i) => {
        const tilt = Number(f?.tiltDeg);
        const az = Number(f?.azimuthDeg);
        const weight = Number.isFinite(Number(f?.weight)) ? Number(f?.weight) : 1;
        if (!Number.isFinite(tilt) || !Number.isFinite(az)) {
          return { index: i, ok: false, error: "invalid tilt/azimuth", weight };
        }

        try {
          const p = buildParams({ lat, lon, tiltDeg: tilt, azimuthDeg: az, lossPercent: loss });
          const data = await fetchPVGISOnce(p);
          const ext = extract(data);
          return {
            index: i,
            ok: Number.isFinite(ext.specificYield),
            specificYield: ext.specificYield ?? null,   // kWh/kWp·a
            gtiKWhm2Year: ext.gtiKWhm2Year ?? null,     // kWh/m²·a
            weight,
            meta: { tilt, az, loss, pvgisMeta: data?.meta },
          };
        } catch (e: any) {
          return { index: i, ok: false, error: e?.message || "PVGIS fetch failed", weight };
        }
      })
    );

    const validY = results.filter(r => r.ok && Number.isFinite((r as any).specificYield)) as any[];
    const totalW  = validY.reduce((s, r) => s + (r.weight || 1), 0) || 1;
    const weightedSpecificYield =
      validY.reduce((s, r) => s + (r.specificYield || 0) * (r.weight || 1), 0) / totalW;

    const validG = results.filter(r => r.ok && Number.isFinite((r as any).gtiKWhm2Year)) as any[];
    const weightedGtiKWhm2Year =
      validG.length > 0
        ? validG.reduce((s, r) => s + (r.gtiKWhm2Year || 0) * (r.weight || 1), 0) / totalW
        : null;

    return NextResponse.json({
      ok: true,
      perFace: results,
      weightedSpecificYieldKWhPerKWp: Number.isFinite(weightedSpecificYield) ? weightedSpecificYield : null,
      weightedGtiKWhm2Year,
    }, { headers: { "Cache-Control": "s-maxage=2592000, stale-while-revalidate=86400" } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "PVGIS POST failed" }, { status: 500 });
  }
}
