// app/api/specific-yield-dwd/route.ts
import { NextResponse } from 'next/server';

/**
 * DWD-nahe "Spezifischer Ertrag"-Skalierung:
 * - findet nächste DWD-Station über Brightsky
 * - aggregiert Sonnenscheindauer (letzte 5 volle Jahre)
 * - gibt avgSunHours + scalingFactor (0.7..1.3) zurück
 */
export async function POST(req: Request) {
  try {
    const { lat, lon } = await req.json();
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return NextResponse.json({ error: 'lat/lon required' }, { status: 400 });
    }

    // 1) nächste Station (Brightsky JSON, kein Key notwendig)
    const stURL = new URL('https://api.brightsky.dev/stations');
    stURL.searchParams.set('lat', String(lat));
    stURL.searchParams.set('lon', String(lon));
    stURL.searchParams.set('max_dist', '25000');
    stURL.searchParams.set('limit', '1');

    const stRes = await fetch(stURL.toString(), { next: { revalidate: 86400 } });
    if (!stRes.ok) {
      return NextResponse.json({ error: 'station lookup failed' }, { status: 502 });
    }
    const stData = await stRes.json();
    const station = stData?.stations?.[0];
    if (!station?.id) {
      return NextResponse.json({ error: 'no station found' }, { status: 404 });
    }

    // 2) Zeitraum: letzte 5 volle Kalenderjahre
    const now = new Date();
    const lastFullYear = now.getUTCFullYear() - 1;
    const startYear = lastFullYear - 4;

    const perYear: Array<{ year: number; hours: number }> = [];

    // Brightsky: sunshine = Minuten pro Stunde
    for (let y = startYear; y <= lastFullYear; y++) {
      const wURL = new URL('https://api.brightsky.dev/weather');
      wURL.searchParams.set('lat', String(lat));
      wURL.searchParams.set('lon', String(lon));
      wURL.searchParams.set('date', `${y}-01-01`);
      wURL.searchParams.set('last_date', `${y}-12-31`);
      wURL.searchParams.set('tz', 'UTC');
      wURL.searchParams.set('source_id', String(station.id));

      const wRes = await fetch(wURL.toString(), { next: { revalidate: 86400 } });
      if (!wRes.ok) continue;
      const wData = await wRes.json();
      const rows: Array<{ sunshine: number | null }> = wData?.weather ?? [];
      const minutes = rows.reduce((s, r) => s + (Number(r.sunshine ?? 0) || 0), 0);
      const hours = minutes / 60;
      if (hours > 0) perYear.push({ year: y, hours });
    }

    const avgSunHours =
      perYear.length > 0
        ? perYear.reduce((a, b) => a + b.hours, 0) / perYear.length
        : 1600; // fallback

    // 3) Standort-Skalierung gegen EU-Basis
    const baseline = 1600;
    const raw = avgSunHours / baseline;
    const scalingFactor = Math.max(0.7, Math.min(1.3, raw));

    return NextResponse.json({
      source: `DWD (via Brightsky) Station ${station.id} – ${station.name ?? 'unbekannt'}`,
      station: {
        id: station.id,
        name: station.name ?? null,
        distance_m: station.distance ?? null,
        lat: station.latitude ?? null,
        lon: station.longitude ?? null,
        height_m: station.height ?? null,
      },
      years: perYear,
      avgSunHours,
      scalingFactor,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message || 'error' }, { status: 500 });
  }
}
