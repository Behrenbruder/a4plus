// /src/lib/pvcalc.ts
import type { RoofFace, ModuleConfig, PackingOptions, BatteryConfig } from "./types";

/* -------------------- kleine Utils -------------------- */
const toRad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/* -------------------- Dichte je Dachtyp -------------------- */
/** kompakter Dachtyp für heuristische Regeln */
export type RoofTypeSlim =
  | "Flachdach"
  | "Satteldach"
  | "Walmdach"
  | "Pultdach"
  | "Mansarddach";

/**
 * konservative kWp/m² (bezogen auf HORIZONTAL projizierte Fläche)
 * für den Fallback, falls kein sinnvolles Packing möglich ist.
 */
export function densityKWpPerM2Horiz(
  roofType: RoofTypeSlim,
  tiltDeg: number,
  flatOW = false
) {
  if (roofType === "Flachdach") {
    // Süd-Aufständerung (große Reihenabstände) vs. Ost/West (dichter)
    return flatOW ? 0.14 : 0.10;
  }
  const base = 0.155; // Sattel/Pult 25–40° realistisch-konservativ
  if (roofType === "Walmdach" || roofType === "Mansarddach") return base * 0.85;
  return base; // Sattel / Pult
}

/* --------- Heuristik: Setbacks/Gaps je Dachtyp (Mittelwerte) --------- */
function layoutParamsByRoof(roof: RoofTypeSlim, tiltDeg: number) {
  if (roof === "Flachdach") {
    return { rowGapM: 2.5, colGapM: 0.07, setbackM: 0.6 };
  }
  if (roof === "Walmdach" || roof === "Mansarddach") {
    return { rowGapM: 0.04, colGapM: 0.04, setbackM: 0.6 };
  }
  // Sattel / Pult
  return { rowGapM: 0.03, colGapM: 0.03, setbackM: 0.4 };
}

function inferRoofTypeFromFace(face: RoofFace): RoofTypeSlim {
  if (face.tiltDeg <= 10) return "Flachdach";
  return "Satteldach";
}

/* -------------------- Packing auf Polygon -------------------- */
function packModulesOnPolygon(
  face: RoofFace,
  module: ModuleConfig,
  roofType: RoofTypeSlim
) {
  if (!face.polygon || face.polygon.length < 3) return 0;

  // lokale equirect-Koordinaten
  const R = 6378137;
  const lat0 = face.polygon.reduce((s, p) => s + p.lat, 0) / face.polygon.length;
  const lng0 = face.polygon.reduce((s, p) => s + p.lng, 0) / face.polygon.length;
  const lat0r = toRad(lat0);
  const toXY = (p: { lat: number; lng: number }) => ({
    x: R * toRad(p.lng - lng0) * Math.cos(lat0r),
    y: R * toRad(p.lat - lat0),
  });
  const pts = face.polygon.map(toXY);

  // Rotation: X entlang First (≈ Azimut + 90°)
  const theta = toRad(face.azimuthDeg + 90);
  const ct = Math.cos(theta),
    st = Math.sin(theta);
  const rot = (pt: { x: number; y: number }) => ({
    x: ct * pt.x - st * pt.y,
    y: st * pt.x + ct * pt.y,
  });
  const rp = pts.map(rot);

  // Bounding-Box + Setbacks
  const xs = rp.map((p) => p.x),
    ys = rp.map((p) => p.y);
  let minX = Math.min(...xs),
    maxX = Math.max(...xs);
  let minY = Math.min(...ys),
    maxY = Math.max(...ys);

  const { rowGapM, colGapM, setbackM } = layoutParamsByRoof(
    roofType,
    face.tiltDeg
  );

  minX += setbackM;
  maxX -= setbackM;
  minY += setbackM;
  maxY -= setbackM;

  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0) return 0;

  // Modul footprint (Horizontalprojektion)
  const tiltCos = Math.cos(toRad(face.tiltDeg));
  const modLong = module.moduleLengthM; // entlang Neigung
  const modShort = module.moduleWidthM; // quer zur Neigung

  // Portrait als robuster Default
  const projAlong = modLong * tiltCos;
  const projAcross = modShort;

  const pitchX = projAcross + colGapM;
  const pitchY = projAlong + rowGapM * tiltCos;

  const cols = Math.max(0, Math.floor((width + colGapM) / pitchX));
  const rows = Math.max(0, Math.floor((height + rowGapM) / pitchY));

  return cols * rows;
}

/* -------------------- öffentliches API -------------------- */
export type ComputeKWpResult = {
  modules: number;
  kWp: number;
  slopeAreaM2: number;
  method: "packed" | "density_fallback";
};

export function computeFaceKWp(
  face: RoofFace,
  module: ModuleConfig,
  _packing: PackingOptions, // bleibt für Abwärtskompatibilität erhalten
  buildFactor: number,
  roofTypeHint?: RoofTypeSlim,
  flatOW?: boolean
): ComputeKWpResult {
  const roofType = roofTypeHint ?? inferRoofTypeFromFace(face);

  // 1) Versuch: Packing
  const packed = packModulesOnPolygon(face, module, roofType);
  // geneigte Fläche (zur Info/Anzeige)
  const slopeAreaM2 =
    (face.areaHorizM2 || 0) / Math.max(Math.cos(toRad(face.tiltDeg)), 0.2);

  if (packed > 0) {
    const kWp = (packed * module.wpPerModule) / 1000;
    return { modules: packed, kWp, slopeAreaM2, method: "packed" };
  }

  // 2) Fallback über Dachtyp-Dichte * buildFactor
  const dens = densityKWpPerM2Horiz(roofType, face.tiltDeg, flatOW);
  const kWpFallback =
    dens * (face.areaHorizM2 || 0) * clamp(buildFactor, 0.5, 0.95);
  const modules = Math.max(
    0,
    Math.floor((kWpFallback * 1000) / module.wpPerModule)
  );

  return {
    modules,
    kWp: kWpFallback,
    slopeAreaM2,
    method: "density_fallback",
  };
}

export function summarizeKWp(
  faces: RoofFace[],
  module: ModuleConfig,
  buildFactor: number,
  roofTypeHint?: RoofTypeSlim,
  flatOW?: boolean
) {
  let sumKWp = 0;
  let sumModules = 0;
  const perFace: ComputeKWpResult[] = [];

  for (const f of faces) {
    const res = computeFaceKWp(
      f,
      module,
      { orientation: "portrait", setbackM: 0, rowGapM: 0, colGapM: 0 },
      buildFactor,
      roofTypeHint,
      flatOW
    );
    perFace.push(res);
    sumKWp += res.kWp;
    sumModules += res.modules;
  }
  return { sumKWp, sumModules, perFace };
}

/* -------------------- einfache PV/Last & Dispatch -------------------- */
// Verteilung (vereinfacht) – identisch zu deiner bisherigen Logik
const PV_MONTHLY_SHARE = [2, 4, 8, 10, 12, 13, 13, 12, 9, 7, 5, 5].map(
  (x) => x / 100
);
const DAYLIGHT_HOURS = [8, 10, 12, 14, 16, 17, 16.5, 15, 13, 11, 8.5, 7.5];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** erzeugt ein 8760‑h PV‑Profil aus der Jahresenergie */
export function hourlyPVFromAnnual(annualPVKWh: number) {
  const hours = 8760;
  const pv = new Array<number>(hours).fill(0);
  let hourIdx = 0;
  for (let m = 0; m < 12; m++) {
    const days = DAYS_IN_MONTH[m];
    const monthEnergy = annualPVKWh * PV_MONTHLY_SHARE[m];
    const daylight = DAYLIGHT_HOURS[m];
    const sunrise = 12 - daylight / 2;
    const sunset = 12 + daylight / 2;
    const daily = monthEnergy / days;

    for (let d = 0; d < days; d++) {
      const shape: number[] = new Array(24).fill(0);
      let sum = 0;
      for (let h = 0; h < 24; h++) {
        if (h >= sunrise && h <= sunset) {
          const x = (h - sunrise) / (sunset - sunrise);
          const v = Math.pow(Math.sin(Math.PI * x), 2);
          shape[h] = v;
          sum += v;
        }
      }
      const scale = daily / (sum || 1);
      for (let h = 0; h < 24; h++) pv[hourIdx + h] += shape[h] * scale;
      hourIdx += 24;
    }
  }
  return pv;
}

/** sehr einfache Batterie‑/Last‑Bilanz (greedy) */
export function dispatchGreedy(
  pv: number[],
  load: number[],
  battery?: BatteryConfig
) {
  let grid = 0,
    feed = 0,
    self = 0;

  let SoC = (battery?.usableKWh || 0) * (battery?.minSoCFrac || 0);
  const eta = battery ? Math.sqrt(battery.roundTripEff) : 1;
  const pChg = battery?.chargePowerKW || Infinity;
  const pDis = battery?.dischargePowerKW || Infinity;
  const cap = battery?.usableKWh || 0;
  const min = cap * (battery?.minSoCFrac || 0);
  const max = cap;

  for (let i = 0; i < pv.length; i++) {
    const prod = pv[i];
    const l = load[i];

    if (!battery || cap <= 0) {
      const d = Math.min(prod, l);
      self += d;
      feed += Math.max(prod - l, 0);
      grid += Math.max(l - prod, 0);
      continue;
    }

    if (prod >= l) {
      self += l;
      let surplus = prod - l;
      const room = max - SoC;
      const can = Math.min(pChg, room / eta);
      const store = Math.min(surplus, can);
      SoC += store * eta;
      surplus -= store;
      feed += Math.max(surplus, 0);
    } else {
      const direct = prod;
      let remain = l - direct;
      const avail = Math.max(SoC - min, 0);
      const dis = Math.min(pDis, avail);
      const deliver = dis * eta;
      const used = Math.min(deliver, remain);
      SoC -= used / eta;
      remain -= used;
      self += direct + used;
      grid += Math.max(remain, 0);
    }
  }

  return {
    gridImportKWh: grid,
    feedInKWh: feed,
    selfConsumptionKWh: self,
  };
}
