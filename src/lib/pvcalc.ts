// /src/lib/pvcalc.ts
import type { RoofFace, ModuleConfig, PackingOptions, BatteryConfig, EconomicConfig, SystemLossBreakdown, FinancialMetrics } from "./types";

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
  const etaCharge = battery ? Math.sqrt(battery.roundTripEff) : 1;
  const etaDischarge = battery ? Math.sqrt(battery.roundTripEff) : 1;
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

    // Direktverbrauch zuerst
    const directUse = Math.min(prod, l);
    self += directUse;
    
    let surplus = prod - directUse;
    let deficit = l - directUse;

    // Überschuss in Batterie laden
    if (surplus > 0) {
      const room = max - SoC;
      const maxCharge = Math.min(pChg, room);
      const actualCharge = Math.min(surplus, maxCharge);
      SoC += actualCharge * etaCharge;
      surplus -= actualCharge;
      feed += surplus; // Rest ins Netz
    }

    // Defizit aus Batterie decken
    if (deficit > 0) {
      const available = Math.max(SoC - min, 0);
      const maxDischarge = Math.min(pDis, available);
      const actualDischarge = Math.min(deficit / etaDischarge, maxDischarge);
      const usableEnergy = actualDischarge * etaDischarge;
      SoC -= actualDischarge;
      self += usableEnergy;
      deficit -= usableEnergy;
      grid += deficit; // Rest aus Netz
    }
  }

  return {
    gridImportKWh: grid,
    feedInKWh: feed,
    selfConsumptionKWh: self,
  };
}

/* -------------------- Systemverluste Aufschlüsselung -------------------- */
export function calculateSystemLossBreakdown(
  inverterLoss = 3,
  wiringLoss = 2,
  soilingLoss = 2,
  shadingLoss = 3,
  temperatureLoss = 5,
  mismatchLoss = 2
): SystemLossBreakdown {
  const totalLoss = inverterLoss + wiringLoss + soilingLoss + shadingLoss + temperatureLoss + mismatchLoss;
  
  return {
    inverterLossPct: inverterLoss,
    wiringLossPct: wiringLoss,
    soilingLossPct: soilingLoss,
    shadingLossPct: shadingLoss,
    temperatureLossPct: temperatureLoss,
    mismatchLossPct: mismatchLoss,
    totalLossPct: totalLoss,
  };
}

export function systemLossFactorFromBreakdown(breakdown: SystemLossBreakdown): number {
  return (100 - breakdown.totalLossPct) / 100;
}

/* -------------------- Erweiterte Finanzberechnungen -------------------- */
export function calculateTotalCapex(
  totalKWp: number,
  batteryKWh: number,
  econ: EconomicConfig
): { pvCapex: number; batteryCapex: number; totalCapex: number } {
  // PV-System Kosten
  const pvCapex = econ.pvSystemCapexEUR ?? (totalKWp * econ.capexPerKWpEUR);
  
  // Batterie Kosten
  const batteryCapex = batteryKWh > 0 
    ? (econ.batteryCapexEUR ?? (batteryKWh * econ.capexBatteryPerKWhEUR))
    : 0;
  
  // Zusätzliche Kosten
  const installationCost = econ.installationCostEUR ?? 0;
  
  const totalCapex = pvCapex + batteryCapex + installationCost;
  
  return { pvCapex, batteryCapex, totalCapex };
}

export function calculateFinancialMetrics(
  annualSavingsEUR: number,
  totalCapexEUR: number,
  annualMaintenanceEUR: number,
  annualInsuranceEUR: number,
  horizonYears: number,
  discountRate = 0.04 // 4% Diskontierungssatz
): FinancialMetrics {
  const annualNetSavings = annualSavingsEUR - annualMaintenanceEUR - annualInsuranceEUR;
  
  // Amortisationszeit (einfach)
  const paybackTimeYears = totalCapexEUR / Math.max(annualNetSavings, 1);
  
  // NPV Berechnung
  let npv = -totalCapexEUR; // Anfangsinvestition
  for (let year = 1; year <= horizonYears; year++) {
    const presentValue = annualNetSavings / Math.pow(1 + discountRate, year);
    npv += presentValue;
  }
  
  // IRR Berechnung (vereinfacht durch Iteration)
  let irr = 0;
  if (annualNetSavings > 0) {
    let low = 0, high = 1;
    for (let i = 0; i < 100; i++) {
      const rate = (low + high) / 2;
      let testNPV = -totalCapexEUR;
      for (let year = 1; year <= horizonYears; year++) {
        testNPV += annualNetSavings / Math.pow(1 + rate, year);
      }
      if (Math.abs(testNPV) < 1) {
        irr = rate;
        break;
      }
      if (testNPV > 0) low = rate;
      else high = rate;
    }
  }
  
  // ROI
  const totalReturns = annualNetSavings * horizonYears;
  const roiPct = ((totalReturns - totalCapexEUR) / totalCapexEUR) * 100;
  
  // LCOE (vereinfacht)
  const totalEnergyKWh = annualSavingsEUR * horizonYears / (35 / 100); // Annahme 35ct/kWh
  const lcoeCtPerKWh = (totalCapexEUR + (annualMaintenanceEUR + annualInsuranceEUR) * horizonYears) / totalEnergyKWh;
  
  return {
    paybackTimeYears: Math.max(0, paybackTimeYears),
    npvEUR: npv,
    irrPct: irr * 100,
    roiPct,
    lcoeCtPerKWh: lcoeCtPerKWh * 100, // in ct/kWh
  };
}

/* -------------------- CSV Import Hilfsfunktionen -------------------- */
export function parseCSVLoadProfile(csvContent: string): number[] | null {
  try {
    const lines = csvContent.trim().split('\n');
    const data: number[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;
      
      // Versuche verschiedene Trennzeichen
      const values = line.split(/[,;\t]/).map(v => v.trim());
      
      for (const value of values) {
        const num = parseFloat(value.replace(',', '.'));
        if (!isNaN(num) && isFinite(num)) {
          data.push(Math.max(0, num)); // Negative Werte auf 0 setzen
        }
      }
    }
    
    // Validierung: Sollte 8760 Werte haben
    if (data.length === 8760) {
      return data;
    } else if (data.length > 8760) {
      // Zu viele Werte - nehme die ersten 8760
      return data.slice(0, 8760);
    } else if (data.length >= 8000) {
      // Nahe genug - fülle mit Durchschnittswerten auf
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      while (data.length < 8760) {
        data.push(avg);
      }
      return data;
    }
    
    return null; // Zu wenige Daten
  } catch (error) {
    console.error('Fehler beim Parsen der CSV-Daten:', error);
    return null;
  }
}

export function validateLoadProfile(data: number[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Daten sind kein Array');
    return { valid: false, errors };
  }
  
  if (data.length !== 8760) {
    errors.push(`Falsche Anzahl Datenpunkte: ${data.length} (erwartet: 8760)`);
  }
  
  const invalidValues = data.filter(v => !Number.isFinite(v) || v < 0);
  if (invalidValues.length > 0) {
    errors.push(`${invalidValues.length} ungültige Werte gefunden`);
  }
  
  const sum = data.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    errors.push('Summe aller Werte ist 0 oder negativ');
  }
  
  // Plausibilitätsprüfung: Jahresverbrauch zwischen 500 und 50000 kWh
  if (sum < 500 || sum > 50000) {
    errors.push(`Jahresverbrauch ${Math.round(sum)} kWh erscheint unplausibel (500-50000 kWh erwartet)`);
  }
  
  return { valid: errors.length === 0, errors };
}

/* -------------------- Hybrid Autarkie/Eigenverbrauch Berechnung -------------------- */

import { 
  generateRealisticLoadProfile,
  generateStandardHouseholdProfile,
  generateSmartEVProfile,
  generateConventionalEVProfile,
  generatePVOptimizedHeatPumpProfile,
  generateHeatPumpProfile,
  getSeasonalEVFactors,
  getSeasonalHeatPumpFactors
} from './standardLoadProfiles';

import { 
  calculateBDEWMetrics,
  generateH25YearProfile,
  generateS25YearProfile
} from './bdewProfiles';

// Generiere vereinfachte PV-Profile (24h, normalisiert)
function generateSimplePVProfile(): number[] {
  const profile = new Array(24).fill(0);
  for (let h = 0; h < 24; h++) {
    if (h >= 6 && h <= 18) {
      // Sinus-Kurve zwischen 6 und 18 Uhr
      const x = (h - 6) / 12; // 0 bis 1
      profile[h] = Math.pow(Math.sin(Math.PI * x), 2);
    }
  }
  // Normalisieren auf Summe = 1
  const sum = profile.reduce((a, b) => a + b, 0);
  return profile.map(v => v / sum);
}

// Generiere realistische Lastprofile basierend auf Konfiguration
function generateRealisticProfiles(
  hasEV: boolean,
  hasHeatPump: boolean,
  month: number
): {
  household: number[];
  ev: number[];
  heatPump: number[];
} {
  // Basis-Haushaltsprofil (VDI 4655 konform)
  const household = generateStandardHouseholdProfile();
  
  // E-Auto Profil (intelligent vs. konventionell)
  let ev = new Array(24).fill(0);
  if (hasEV) {
    ev = generateSmartEVProfile(); // Verwende intelligentes Laden
    const seasonalEVFactor = getSeasonalEVFactors()[month];
    ev = ev.map(v => v * seasonalEVFactor);
  }
  
  // Wärmepumpen Profil (PV-optimiert)
  let heatPump = new Array(24).fill(0);
  if (hasHeatPump) {
    heatPump = generatePVOptimizedHeatPumpProfile();
    const seasonalHPFactor = getSeasonalHeatPumpFactors()[month];
    heatPump = heatPump.map(v => v * seasonalHPFactor);
  }
  
  return { household, ev, heatPump };
}

// Simuliere einen Tag mit Batterie-Dispatch
function simulateDay(
  pvHourly: number[],
  householdHourly: number[],
  evHourly: number[],
  heatPumpHourly: number[],
  batteryKWh: number
): { autarky: number; selfConsumption: number } {
  
  let batterySOC = batteryKWh * 0.5; // Start bei 50%
  let totalConsumption = 0;
  let totalPV = 0;
  let totalGridImport = 0;
  let totalSelfConsumption = 0;
  
  for (let hour = 0; hour < 24; hour++) {
    const pv = pvHourly[hour];
    const consumption = householdHourly[hour] + evHourly[hour] + heatPumpHourly[hour];
    
    totalPV += pv;
    totalConsumption += consumption;
    
    // Direktverbrauch
    const directUse = Math.min(pv, consumption);
    let remainingPV = pv - directUse;
    let remainingConsumption = consumption - directUse;
    
    // Batterie laden
    if (remainingPV > 0 && batteryKWh > 0) {
      const maxChargeRate = batteryKWh * 0.5; // Max 0.5C
      const chargeAmount = Math.min(remainingPV, batteryKWh - batterySOC, maxChargeRate);
      batterySOC += chargeAmount * 0.95; // 95% Ladeeffizienz
      remainingPV -= chargeAmount;
    }
    
    // Batterie entladen
    if (remainingConsumption > 0 && batteryKWh > 0) {
      const maxDischargeRate = batteryKWh * 0.5; // Max 0.5C
      const dischargeAmount = Math.min(remainingConsumption, batterySOC, maxDischargeRate);
      batterySOC -= dischargeAmount;
      const usableDischarge = dischargeAmount * 0.95; // 95% Entladeeffizienz
      remainingConsumption -= usableDischarge;
      totalSelfConsumption += usableDischarge;
    }
    
    totalGridImport += remainingConsumption;
    totalSelfConsumption += directUse;
  }
  
  const autarky = totalConsumption > 0 ? 1 - (totalGridImport / totalConsumption) : 0;
  const selfConsumption = totalPV > 0 ? totalSelfConsumption / totalPV : 0;
  
  return { autarky, selfConsumption };
}

// Temperaturkorrektur für PV-Module
function calculatePVWithTemperature(
  nominalPower: number, 
  irradiance: number, 
  ambientTemp: number = 15 // Durchschnittstemperatur Deutschland
): number {
  const tempCoeff = -0.004; // -0.4%/K für kristalline Module
  const NOCT = 45; // Nominal Operating Cell Temperature
  const cellTemp = ambientTemp + (irradiance / 800) * (NOCT - 20);
  const tempFactor = 1 + tempCoeff * (cellTemp - 25);
  return nominalPower * (irradiance / 1000) * tempFactor;
}

// Verbesserte Batterie-Simulation mit realistischen Parametern
function simulateDayImproved(
  pvHourly: number[],
  householdHourly: number[],
  evHourly: number[],
  heatPumpHourly: number[],
  batteryKWh: number,
  ambientTemp: number = 15
): { autarky: number; selfConsumption: number } {
  
  // Realistische Batterie-Parameter
  const batteryEfficiency = 0.92; // Realistischer Round-Trip-Wirkungsgrad
  const maxCRate = 0.8; // Realistische C-Rate für Li-Ion
  const monthlyStandbyLoss = 0.025; // 2.5% pro Monat
  const hourlyStandbyLoss = monthlyStandbyLoss / (30 * 24);
  
  let batterySOC = batteryKWh * 0.5; // Start bei 50%
  let totalConsumption = 0;
  let totalPV = 0;
  let totalGridImport = 0;
  let totalSelfConsumption = 0;
  
  for (let hour = 0; hour < 24; hour++) {
    // Temperaturkorrigierte PV-Leistung
    const irradiance = pvHourly[hour] > 0 ? 800 : 0; // Vereinfachte Annahme
    const pvRaw = pvHourly[hour];
    const pv = pvRaw > 0 ? calculatePVWithTemperature(pvRaw, irradiance, ambientTemp) : 0;
    
    const consumption = householdHourly[hour] + evHourly[hour] + heatPumpHourly[hour];
    
    totalPV += pv;
    totalConsumption += consumption;
    
    // Standby-Verluste der Batterie
    if (batteryKWh > 0) {
      batterySOC *= (1 - hourlyStandbyLoss);
    }
    
    // Direktverbrauch
    const directUse = Math.min(pv, consumption);
    let remainingPV = pv - directUse;
    let remainingConsumption = consumption - directUse;
    
    // Batterie laden mit verbesserter Effizienz
    if (remainingPV > 0 && batteryKWh > 0) {
      const maxChargeRate = batteryKWh * maxCRate;
      const chargeAmount = Math.min(remainingPV, batteryKWh - batterySOC, maxChargeRate);
      batterySOC += chargeAmount * Math.sqrt(batteryEfficiency); // Lade-Effizienz
      remainingPV -= chargeAmount;
    }
    
    // Batterie entladen mit verbesserter Effizienz
    if (remainingConsumption > 0 && batteryKWh > 0) {
      const maxDischargeRate = batteryKWh * maxCRate;
      const dischargeAmount = Math.min(remainingConsumption, batterySOC, maxDischargeRate);
      batterySOC -= dischargeAmount;
      const usableDischarge = dischargeAmount * Math.sqrt(batteryEfficiency); // Entlade-Effizienz
      remainingConsumption -= usableDischarge;
      totalSelfConsumption += usableDischarge;
    }
    
    totalGridImport += remainingConsumption;
    totalSelfConsumption += directUse;
  }
  
  const autarky = totalConsumption > 0 ? 1 - (totalGridImport / totalConsumption) : 0;
  const selfConsumption = totalPV > 0 ? totalSelfConsumption / totalPV : 0;
  
  return { autarky, selfConsumption };
}

// Hauptfunktion: Verbesserte Hybrid-Berechnung von Autarkie und Eigenverbrauch
export function calculateHybridMetrics(
  annualPV: number,
  annualConsumption: number,
  batteryKWh: number,
  evConsumption: number,
  heatPumpConsumption: number
): { autarky: number; selfConsumption: number } {
  
  // 1. Generiere optimierte Tagesprofile (24h)
  const pvProfile = generateSimplePVProfile();
  
  // 2. Skaliere auf Jahreswerte
  const dailyPV = annualPV / 365;
  const dailyHousehold = annualConsumption / 365;
  const dailyEV = evConsumption / 365;
  const dailyHeatPump = heatPumpConsumption / 365;
  
  // 3. Verbesserte 12-Monats-Simulation statt 4 Jahreszeiten
  const monthlyFactors = [
    0.25, 0.35, 0.55, 0.75, 0.95, 1.15, // Jan-Jun
    1.25, 1.15, 0.85, 0.65, 0.35, 0.25  // Jul-Dez
  ];
  
  // Monatliche Durchschnittstemperaturen für Deutschland
  const monthlyTemperatures = [
    2, 4, 8, 13, 18, 21, // Jan-Jun
    23, 22, 18, 12, 6, 3  // Jul-Dez
  ];
  
  let totalAutarky = 0;
  let totalSelfConsumption = 0;
  
  for (let month = 0; month < 12; month++) {
    // Generiere realistische Profile für diesen Monat
    const profiles = generateRealisticProfiles(
      evConsumption > 0,
      heatPumpConsumption > 0,
      month
    );
    
    const monthResult = simulateDayImproved(
      pvProfile.map((h: number) => h * dailyPV * monthlyFactors[month]),
      profiles.household.map((h: number) => h * dailyHousehold),
      profiles.ev.map((h: number) => h * dailyEV),
      profiles.heatPump.map((h: number) => h * dailyHeatPump),
      batteryKWh,
      monthlyTemperatures[month]
    );
    
    totalAutarky += monthResult.autarky;
    totalSelfConsumption += monthResult.selfConsumption;
  }
  
  // Realistische Obergrenzen basierend auf deutschen Erfahrungswerten
  const avgAutarky = totalAutarky / 12;
  const avgSelfConsumption = totalSelfConsumption / 12;
  
  // Anpassung basierend auf PV/Verbrauch-Verhältnis
  const totalConsumption = annualConsumption + evConsumption + heatPumpConsumption;
  const pvToConsumptionRatio = annualPV / totalConsumption;
  
  let autarkyCorrection = 1.0;
  let selfConsumptionCorrection = 1.0;
  
  if (pvToConsumptionRatio < 0.8) {
    // Zu kleine PV-Anlage
    autarkyCorrection = 0.9;
    selfConsumptionCorrection = 1.05;
  } else if (pvToConsumptionRatio > 1.5) {
    // Zu große PV-Anlage
    autarkyCorrection = 0.95;
    selfConsumptionCorrection = 0.8;
  }
  
  return {
    autarky: Math.min(0.95, avgAutarky * autarkyCorrection), // Max 95% Autarkie (angepasst)
    selfConsumption: Math.min(0.90, avgSelfConsumption * selfConsumptionCorrection) // Max 90% Eigenverbrauch (angepasst)
  };
}

/**
 * BDEW-basierte Berechnung von Autarkie und Eigenverbrauch
 * Automatische Profilauswahl: H25 ohne Speicher, S25 mit Speicher
 */
export function calculateBDEWBasedMetrics(
  annualPVKWh: number,
  householdConsumptionKWh: number,
  batteryCapacityKWh: number = 0,
  evConsumptionKWh: number = 0,
  heatPumpConsumptionKWh: number = 0,
  year: number = new Date().getFullYear()
): { autarky: number; selfConsumption: number; gridImport: number; feedIn: number; profileUsed: 'H25' | 'S25' } {
  
  // Automatische Profilauswahl basierend auf Speicher-Konfiguration
  const profileType: 'H25' | 'S25' = batteryCapacityKWh > 0 ? 'S25' : 'H25';
  
  // Gesamtverbrauch
  const totalConsumptionKWh = householdConsumptionKWh + evConsumptionKWh + heatPumpConsumptionKWh;
  
  // Generiere das entsprechende BDEW-Profil für das ganze Jahr
  const loadProfile = profileType === 'H25' 
    ? generateH25YearProfile(year) 
    : generateS25YearProfile(year);
  
  // Normiere Profil auf tatsächlichen Jahresverbrauch
  const profileSum = loadProfile.reduce((sum, value) => sum + value, 0);
  const normalizedLoadProfile = loadProfile.map(value => 
    (value / profileSum) * totalConsumptionKWh
  );
  
  // Generiere PV-Profil (8760 Stunden)
  const pvProfile = hourlyPVFromAnnual(annualPVKWh);
  
  // Simuliere Batterieverhalten mit BDEW-Profilen
  const dispatch = dispatchGreedy(
    pvProfile,
    normalizedLoadProfile,
    batteryCapacityKWh > 0 ? {
      usableKWh: batteryCapacityKWh,
      chargePowerKW: batteryCapacityKWh * 0.5, // 0.5C
      dischargePowerKW: batteryCapacityKWh * 0.5, // 0.5C
      roundTripEff: 0.92,
      minSoCFrac: 0.1
    } : undefined
  );
  
  // Berechne Kennzahlen
  const autarky = 1 - (dispatch.gridImportKWh / totalConsumptionKWh);
  const selfConsumption = dispatch.selfConsumptionKWh / annualPVKWh;
  
  return {
    autarky: Math.max(0, Math.min(1, autarky)),
    selfConsumption: Math.max(0, Math.min(1, selfConsumption)),
    gridImport: dispatch.gridImportKWh,
    feedIn: dispatch.feedInKWh,
    profileUsed: profileType
  };
}

/**
 * Erweiterte Hybrid-Berechnung mit BDEW-Fallback
 * Kombiniert die bestehende Hybrid-Logik mit BDEW-Profilen für bessere Genauigkeit
 */
export function calculateEnhancedHybridMetrics(
  annualPV: number,
  annualConsumption: number,
  batteryKWh: number,
  evConsumption: number,
  heatPumpConsumption: number,
  useBDEW: boolean = true
): { autarky: number; selfConsumption: number; method: 'hybrid' | 'bdew' } {
  
  if (useBDEW) {
    try {
      // Versuche BDEW-basierte Berechnung
      const bdewResult = calculateBDEWBasedMetrics(
        annualPV,
        annualConsumption,
        batteryKWh,
        evConsumption,
        heatPumpConsumption
      );
      
      return {
        autarky: bdewResult.autarky,
        selfConsumption: bdewResult.selfConsumption,
        method: 'bdew'
      };
    } catch (error) {
      console.warn('BDEW-Berechnung fehlgeschlagen, verwende Hybrid-Fallback:', error);
    }
  }
  
  // Fallback auf bestehende Hybrid-Berechnung
  const hybridResult = calculateHybridMetrics(
    annualPV,
    annualConsumption,
    batteryKWh,
    evConsumption,
    heatPumpConsumption
  );
  
  return {
    autarky: hybridResult.autarky,
    selfConsumption: hybridResult.selfConsumption,
    method: 'hybrid'
  };
}
