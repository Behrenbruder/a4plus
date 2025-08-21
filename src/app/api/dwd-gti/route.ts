// app/api/dwd-gti/route.ts
import { NextResponse } from 'next/server';

// WICHTIG: verhindert, dass Next die Route statisch cached oder auf Edge ausführt
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { lat, lon, faces = [], pr } = await req.json();

    if (typeof lat !== 'number' || typeof lon !== 'number' || !Array.isArray(faces)) {
      return NextResponse.json({ error: 'lat, lon, faces[] required' }, { status: 400 });
    }
    const PR = typeof pr === 'number' && pr > 0 && pr <= 1 ? pr : 0.88;

    // 1) nächste Station (Brightsky)
    const stURL = new URL('https://api.brightsky.dev/stations');
    stURL.searchParams.set('lat', String(lat));
    stURL.searchParams.set('lon', String(lon));
    stURL.searchParams.set('max_dist', '25000');
    stURL.searchParams.set('limit', '1');

    const stRes = await fetch(stURL.toString(), { cache: 'no-store' });
    if (!stRes.ok) {
      const txt = await stRes.text().catch(() => '');
      return NextResponse.json({ error: 'stations failed', detail: txt || stRes.statusText }, { status: 502 });
    }
    const stData = await stRes.json().catch(() => ({}));
    const station = stData?.stations?.[0];
    if (!station?.id) {
      return NextResponse.json({ error: 'no station found near coordinates' }, { status: 404 });
    }

    // 2) Zeitraum: letztes volles Kalenderjahr
    const now = new Date();
    const lastFullYear = now.getUTCFullYear() - 1;
    const from = new Date(Date.UTC(lastFullYear, 0, 1, 0, 0, 0));
    const to   = new Date(Date.UTC(lastFullYear, 11, 31, 23, 59, 59));

    // 3) Stunden-Daten (sunshine in Minuten/Std)
    const wURL = new URL('https://api.brightsky.dev/weather');
    wURL.searchParams.set('lat', String(lat));
    wURL.searchParams.set('lon', String(lon));
    wURL.searchParams.set('date', from.toISOString().slice(0, 10));
    wURL.searchParams.set('last_date', to.toISOString().slice(0, 10));
    wURL.searchParams.set('tz', 'UTC');
    wURL.searchParams.set('source_id', String(station.id));

    const wRes = await fetch(wURL.toString(), { cache: 'no-store' });
    if (!wRes.ok) {
      const txt = await wRes.text().catch(() => '');
      return NextResponse.json(
        { error: 'weather fetch failed', detail: txt || wRes.statusText, url: wURL.toString() },
        { status: 502 }
      );
    }
    const wData = await wRes.json().catch(() => ({}));
    const rows: Array<{ timestamp: string; sunshine: number | null }> = wData?.weather ?? [];
    if (!rows.length) {
      return NextResponse.json({ error: 'no hourly rows returned from brightsky' }, { status: 404 });
    }

    // ------- Solar-Modelle (identisch wie zuvor, minimal gekürzt) -------
    const deg2rad = (d: number) => (d * Math.PI) / 180;

    function solarDeclEoT(date: Date) {
      const start = Date.UTC(date.getUTCFullYear(), 0, 0);
      const n = Math.floor((date.getTime() - start) / 86400000);
      const mins = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
      const gamma = 2 * Math.PI * (n - 1 + mins / 1440) / 365;
      const delta =
        0.006918 -
        0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) -
        0.006758 * Math.cos(2*gamma) + 0.000907 * Math.sin(2*gamma) -
        0.002697 * Math.cos(3*gamma) + 0.00148  * Math.sin(3*gamma);
      const EoT = 229.18 * (
        0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
        - 0.014615 * Math.cos(2*gamma) - 0.040849 * Math.sin(2*gamma)
      );
      return { delta, EoT };
    }
    function hourAngle(date: Date, lonDeg: number) {
      const { EoT } = solarDeclEoT(date);
      const minsUTC = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
      const trueSolarMins = (minsUTC + EoT + 4 * lonDeg) % 1440;
      const Hdeg = trueSolarMins / 4 - 180;
      return (Hdeg * Math.PI) / 180;
    }
    function I0n(date: Date) {
      const start = Date.UTC(date.getUTCFullYear(), 0, 0);
      const n = Math.floor((date.getTime() - start) / 86400000);
      const Gsc = 1367.7;
      const E0 = 1 + 0.033 * Math.cos((2 * Math.PI * n) / 365);
      return Gsc * E0;
    }
    function cosZ(date: Date, latDeg: number, lonDeg: number) {
      const { delta } = solarDeclEoT(date);
      const phi = (latDeg * Math.PI) / 180;
      const H = hourAngle(date, lonDeg);
      const cz = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(H);
      return Math.max(cz, 0);
    }
    function cosIncidence(date: Date, latDeg: number, lonDeg: number, tiltDeg: number, azDeg: number) {
      const { delta } = solarDeclEoT(date);
      const phi = (latDeg * Math.PI) / 180;
      const beta = (tiltDeg * Math.PI) / 180;
      const gamma = (azDeg * Math.PI) / 180; // Süd=0, Ost=-90, West=+90
      const H = hourAngle(date, lonDeg);
      const term =
        Math.sin(delta) * Math.sin(phi) * Math.cos(beta)
        - Math.sin(delta) * Math.cos(phi) * Math.sin(beta) * Math.cos(gamma)
        + Math.cos(delta) * Math.cos(phi) * Math.cos(beta) * Math.cos(H)
        + Math.cos(delta) * Math.sin(phi) * Math.sin(beta) * Math.cos(gamma) * Math.cos(H)
        + Math.cos(delta) * Math.sin(beta) * Math.sin(gamma) * Math.sin(H);
      return Math.max(term, 0);
    }
    function erbsDiffuseFraction(kt: number) {
      if (kt <= 0) return 1;
      if (kt <= 0.22) return 1 - 0.09 * kt;
      if (kt <= 0.80) {
        return 0.9511 - 0.1604 * kt + 4.388 * kt * kt - 16.638 * kt * kt * kt + 12.336 * Math.pow(kt, 4);
      }
      return 0.165;
    }

    const A_AP = 0.25, B_AP = 0.50;  // Ångström-Prescott
    const albedo = 0.2;
    const gtiWhPerM2_perFace = new Array(faces.length).fill(0);
    let sumGHIWhm2 = 0;

    for (const row of rows) {
      const ts = new Date(row.timestamp);
      const sMin = Math.max(0, Math.min(60, Number(row.sunshine ?? 0)));
      const sFrac = sMin / 60;
      const cz = cosZ(ts, lat, lon);
      if (cz <= 0) continue;

      const I0 = I0n(ts);
      const G0h_Whm2 = I0 * cz; // 1h-Mittel

      const kt = Math.max(0.02, Math.min(0.85, A_AP + B_AP * sFrac));
      const GHI = kt * G0h_Whm2;
      sumGHIWhm2 += GHI;

      const fd = Math.max(0.1, Math.min(0.9, erbsDiffuseFraction(kt)));
      const DHI = fd * GHI;
      const DNI = Math.max(0, (GHI - DHI) / Math.max(cz, 0.05));

      for (let i = 0; i < faces.length; i++) {
        const f = faces[i] || {};
        const tilt = Number(f.tiltDeg ?? 35);
        const az   = Number(f.azimuthDeg ?? 0);
        const cosTheta = cosIncidence(ts, lat, lon, tilt, az);
        const Ib_tilt = DNI * cosTheta;
        const Id_tilt = DHI * (1 + Math.cos(deg2rad(tilt))) / 2;
        const Ignd    = GHI * albedo * (1 - Math.cos(deg2rad(tilt))) / 2;
        const POA = Math.max(0, Ib_tilt) + Id_tilt + Ignd; // Wh/m²
        gtiWhPerM2_perFace[i] += POA;
      }
    }

    const gtiKWhm2_perFace = gtiWhPerM2_perFace.map(v => v / 1000);
    const ghiKWhm2 = sumGHIWhm2 / 1000;
    const specificYieldPerFace = gtiKWhm2_perFace.map(gti => gti * PR);

    return NextResponse.json({
      source: `DWD (via Brightsky) Station ${station.id} – ${station.name ?? 'unbekannt'} (${Math.round((station.distance ?? 0) / 1000)} km)`,
      station: {
        id: station.id, name: station.name ?? null,
        lat: station.latitude ?? null, lon: station.longitude ?? null,
        height_m: station.height ?? null, distance_m: station.distance ?? null,
      },
      period: { from: from.toISOString(), to: to.toISOString() },
      ghiKWhm2Year: ghiKWhm2,
      gtiKWhm2YearPerFace: gtiKWhm2_perFace,
      prUsed: PR,
      specificYieldPerFaceKWhPerKWp: specificYieldPerFace,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return NextResponse.json({ error: error.message || 'error', stack: error.stack ?? null }, { status: 500 });
  }
}
