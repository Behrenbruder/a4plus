// lib/loadProfiles.ts
// Standard-Haushaltslastprofil (H0) + optionale EV-Ladeprofile als Add-on.
// Exportiert:
// - HouseholdProfile, STANDARD_ANNUAL_KWH
// - hourlyLoadProfileFromHousehold(profile)
// - hourlyEVProfile(annualKWh, mode, wallboxKW?)
// - buildCombinedLoadProfile({ annualHouseholdKWh, profile, evAnnualKWh, evMode, wallboxKW })

export type HouseholdProfile = '1p' | '2p' | '3_4p' | '5plus';

export const STANDARD_ANNUAL_KWH: Record<HouseholdProfile, number> = {
  '1p': 2000,
  '2p': 3000,
  '3_4p': 4000,
  '5plus': 5000,
};

// --- Hilfsfunktionen für synthetisches H0-Profil (8760 Werte) ---

function dailyShape(hour: number, isWeekend: boolean): number {
  // grobe H0-Form:
  // Nacht niedrig, Morgen-Schulter, Mittags-Tal, Abend-Peak
  const h = hour;
  const baseNight = 0.3;
  const morning = Math.max(0, 1 - Math.abs(h - 7) / 2);   // 5–9
  const evening = Math.max(0, 1 - Math.abs(h - 20) / 3);  // 17–23
  const noonDip = Math.max(0, 1 - Math.abs(h - 13) / 4);  // 9–17 (negativ)
  const v = baseNight + 1.2 * morning + 2.2 * evening - 0.5 * noonDip;
  // Wochenende etwas “mittäglicher”
  return isWeekend ? v * (h >= 11 && h <= 16 ? 1.10 : 1.0) : v;
}

function monthSeasonFactor(month: number): number {
  // grobe Saisonalität: Winter höher, Sommer niedriger (ohne Heizung)
  // Jan=0 … Dez=11
  const winterBoost = [0, 1, 11].includes(month) ? 1.08 : 1.0;
  const summerDip = [5, 6, 7].includes(month) ? 0.95 : 1.0; // Jun-Jul-Aug
  return winterBoost * summerDip;
}

function buildBaseH0(): number[] {
  const H = 8760;
  const arr = new Array<number>(H).fill(0);
  let t = 0;
  for (let m = 0; m < 12; m++) {
    const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31][m];
    const season = monthSeasonFactor(m);
    for (let d = 0; d < daysInMonth; d++) {
      const weekday = (d + 4) % 7; // “ungefähr”: 0=Mo … 6=So (egal für Form)
      const isWeekend = weekday >= 5;
      for (let h = 0; h < 24; h++, t++) {
        arr[t] = season * dailyShape(h, isWeekend);
      }
    }
  }
  // normalisieren auf Summe 1
  const sum = arr.reduce((a, b) => a + b, 0) || 1;
  for (let i = 0; i < H; i++) arr[i] /= sum;
  return arr;
}

let _H0_CACHE: number[] | null = null;

/**
 * Liefert ein normiertes 8760er H0-Profil (Summe=1).
 */
export function hourlyLoadProfileFromHousehold(_profile: HouseholdProfile, _seed?: number): number[] {
  if (!_H0_CACHE) _H0_CACHE = buildBaseH0();
  return _H0_CACHE.slice(); // Kopie
}

// --- EV-Profile ---

export type EVMode = 'day_12_16' | 'evening_18_22' | 'night_22_06' | 'custom_wallbox';

/**
 * EV-Lastprofil (8760) aus JahreskWh.
 * - mode bestimmt die Belegungsstunden.
 * - wallboxKW begrenzt die stündliche Leistung (nur bei custom_wallbox relevant).
 * Gibt kWh/h je Stunde zurück, Summe ≈ annualKWh.
 */
export function hourlyEVProfile(
  annualKWh: number,
  mode: EVMode = 'night_22_06',
  wallboxKW?: number
): number[] {
  const H = 8760;
  const arr = new Array<number>(H).fill(0);
  if (!Number.isFinite(annualKWh) || annualKWh <= 0) return arr;

  const days = 365;

  let hours: number[] = [];
  if (mode === 'day_12_16') hours = [12, 13, 14, 15];
  else if (mode === 'evening_18_22') hours = [18, 19, 20, 21];
  else if (mode === 'night_22_06') hours = [22, 23, 0, 1, 2, 3, 4, 5, 6];
  else if (mode === 'custom_wallbox') hours = [18, 19, 20, 21, 22, 23, 0, 1]; // Beispiel: 18–01

  // Verteilung pro Tag
  const daily = annualKWh / days;

  if (mode === 'custom_wallbox' && wallboxKW && wallboxKW > 0) {
    // begrenze pro Stunde auf wallboxKW
    const maxPerDay = wallboxKW * hours.length;
    const factor = Math.min(1, daily / maxPerDay);
    for (let d = 0; d < days; d++) {
      for (const h of hours) {
        const hour = (h + 24) % 24;
        const idx = d * 24 + hour;
        if (idx < H) arr[idx] += wallboxKW * factor;
      }
    }
    // falls daily > maxPerDay, bleibt Rest “ungeladen” (konservativ)
  } else {
    const perHour = daily / hours.length;
    for (let d = 0; d < days; d++) {
      for (const h of hours) {
        const hour = (h + 24) % 24;
        const idx = d * 24 + hour;
        if (idx < H) arr[idx] += perHour;
      }
    }
  }

  return arr;
}

// --- Kombinierte Profile ---

export function buildCombinedLoadProfile(opts: {
  annualHouseholdKWh: number;
  profile: HouseholdProfile;
  evAnnualKWh?: number;
  evMode?: EVMode;
  wallboxKW?: number;
}): number[] {
  const { annualHouseholdKWh, profile, evAnnualKWh = 0, evMode = 'night_22_06', wallboxKW } = opts;

  const base = hourlyLoadProfileFromHousehold(profile);
  const baseSum = base.reduce((a, b) => a + b, 0) || 1;
  const household = base.map((v) => v * (annualHouseholdKWh / baseSum));

  if (evAnnualKWh > 0) {
    const ev = hourlyEVProfile(evAnnualKWh, evMode, wallboxKW);
    return household.map((v, i) => v + (ev[i] || 0));
  }
  return household;
}
