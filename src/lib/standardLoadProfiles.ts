// /src/lib/standardLoadProfiles.ts
// Realistische stündliche Standardlastprofile basierend auf VDI 4655, BDEW und aktuellen Studien

/**
 * Standardlastprofile für verschiedene Haushaltstypen
 * Alle Profile sind auf 24h normalisiert (Summe = 1.0)
 * Basierend auf deutschen Verbrauchsmustern
 */

// Basis-Haushaltsprofil (VDI 4655 H0 - Standard Haushalt)
export function generateStandardHouseholdProfile(): number[] {
  return [
    // 0-5 Uhr: Nachtruhe (sehr geringer Verbrauch)
    0.020, 0.018, 0.016, 0.015, 0.016, 0.018,
    // 6-11 Uhr: Morgenroutine und Vormittag
    0.035, 0.055, 0.065, 0.050, 0.042, 0.038,
    // 12-17 Uhr: Mittag und Nachmittag
    0.045, 0.048, 0.042, 0.040, 0.045, 0.052,
    // 18-23 Uhr: Abendspitze (Kochen, TV, Beleuchtung)
    0.068, 0.075, 0.072, 0.065, 0.055, 0.045
  ];
}

// Haushalt mit PV-Anlage (bewussterer Verbrauch, leichte Verschiebung zu Tagesstunden)
export function generatePVOptimizedHouseholdProfile(): number[] {
  return [
    // 0-5 Uhr: Reduzierter Nachtverbrauch
    0.018, 0.016, 0.014, 0.013, 0.014, 0.016,
    // 6-11 Uhr: Verstärkter Morgenverbrauch (Waschmaschine, etc.)
    0.040, 0.060, 0.070, 0.055, 0.048, 0.045,
    // 12-17 Uhr: Erhöhter Tagesverbrauch (PV-Nutzung)
    0.052, 0.055, 0.050, 0.048, 0.050, 0.055,
    // 18-23 Uhr: Leicht reduzierte Abendspitze
    0.065, 0.070, 0.068, 0.062, 0.052, 0.042
  ];
}

// E-Auto Ladeprofil (intelligentes Laden)
export function generateSmartEVProfile(): number[] {
  return [
    // 0-5 Uhr: Nachtladung (günstige Tarife)
    0.08, 0.08, 0.08, 0.08, 0.08, 0.06,
    // 6-11 Uhr: Morgens wenig (Auto wird genutzt)
    0.02, 0.01, 0.01, 0.02, 0.03, 0.04,
    // 12-17 Uhr: PV-Überschuss-Ladung
    0.06, 0.08, 0.10, 0.08, 0.06, 0.04,
    // 18-23 Uhr: Abendladung nach Heimkehr
    0.08, 0.10, 0.08, 0.06, 0.04, 0.02
  ];
}

// E-Auto Ladeprofil (konventionelles Laden)
export function generateConventionalEVProfile(): number[] {
  return [
    // 0-5 Uhr: Starke Nachtladung
    0.12, 0.12, 0.12, 0.12, 0.10, 0.08,
    // 6-11 Uhr: Minimale Ladung (Auto unterwegs)
    0.01, 0.01, 0.01, 0.01, 0.02, 0.02,
    // 12-17 Uhr: Gelegentliche Ladung
    0.03, 0.03, 0.04, 0.04, 0.05, 0.06,
    // 18-23 Uhr: Abendladung
    0.08, 0.10, 0.08, 0.06, 0.04, 0.03
  ];
}

// Wärmepumpe Profil (Heizung + Warmwasser)
export function generateHeatPumpProfile(): number[] {
  return [
    // 0-5 Uhr: Reduzierte Heizung (Nachtabsenkung)
    0.035, 0.032, 0.030, 0.030, 0.032, 0.038,
    // 6-11 Uhr: Morgenspitze (Aufheizen + Warmwasser)
    0.055, 0.065, 0.060, 0.050, 0.045, 0.042,
    // 12-17 Uhr: Moderate Heizung (PV-Nutzung möglich)
    0.048, 0.050, 0.048, 0.045, 0.048, 0.052,
    // 18-23 Uhr: Abendspitze (Komforttemperatur + Warmwasser)
    0.058, 0.062, 0.060, 0.055, 0.050, 0.045
  ];
}

// PV-optimierte Wärmepumpe (mit intelligentem Energiemanagement)
export function generatePVOptimizedHeatPumpProfile(): number[] {
  return [
    // 0-5 Uhr: Minimaler Verbrauch (Speicher nutzen)
    0.025, 0.022, 0.020, 0.020, 0.022, 0.028,
    // 6-11 Uhr: Moderate Morgenspitze
    0.045, 0.055, 0.050, 0.042, 0.038, 0.040,
    // 12-17 Uhr: Verstärkte PV-Nutzung (Speicher laden)
    0.065, 0.070, 0.068, 0.065, 0.062, 0.058,
    // 18-23 Uhr: Reduzierte Abendspitze (Speicher nutzen)
    0.050, 0.052, 0.048, 0.045, 0.042, 0.038
  ];
}

// Kombiniertes Profil: Haushalt + E-Auto + Wärmepumpe (PV-optimiert)
export function generateCombinedOptimizedProfile(): number[] {
  return [
    // 0-5 Uhr: Nachtladung E-Auto, minimale WP
    0.045, 0.042, 0.040, 0.038, 0.040, 0.042,
    // 6-11 Uhr: Morgenroutine + WP Aufheizen
    0.048, 0.065, 0.070, 0.055, 0.048, 0.045,
    // 12-17 Uhr: Maximale PV-Nutzung (WP + EV Laden)
    0.058, 0.065, 0.068, 0.062, 0.058, 0.055,
    // 18-23 Uhr: Abendverbrauch optimiert
    0.055, 0.060, 0.058, 0.052, 0.048, 0.042
  ];
}

// Saisonale Anpassungsfaktoren für Wärmepumpen
export function getSeasonalHeatPumpFactors(): number[] {
  // Monatliche Faktoren für Wärmepumpen-Verbrauch
  return [
    1.8, 1.6, 1.3, 1.0, 0.6, 0.4, // Jan-Jun (Winter hoch, Sommer niedrig)
    0.3, 0.4, 0.7, 1.1, 1.4, 1.7  // Jul-Dez
  ];
}

// Saisonale Anpassungsfaktoren für E-Auto (Effizienz-Verluste im Winter)
export function getSeasonalEVFactors(): number[] {
  // Monatliche Faktoren für E-Auto Verbrauch (Heizung/Kühlung)
  return [
    1.3, 1.2, 1.1, 1.0, 0.9, 0.95, // Jan-Jun
    1.0, 0.95, 0.9, 1.0, 1.1, 1.25  // Jul-Dez
  ];
}

// Wochentag vs. Wochenende Faktoren
export function getWeekdayFactors(): { weekday: number[]; weekend: number[] } {
  return {
    // Werktag: Morgen- und Abendspitzen ausgeprägter
    weekday: [
      0.8, 0.7, 0.7, 0.7, 0.8, 0.9,  // 0-5: Weniger Verbrauch
      1.2, 1.3, 1.1, 0.9, 0.8, 0.8,  // 6-11: Morgenspitze
      0.9, 0.9, 0.8, 0.8, 0.9, 1.0,  // 12-17: Arbeitszeit
      1.3, 1.4, 1.3, 1.2, 1.0, 0.9   // 18-23: Abendspitze
    ],
    // Wochenende: Gleichmäßigere Verteilung, später Start
    weekend: [
      0.9, 0.8, 0.8, 0.8, 0.8, 0.8,  // 0-5: Ähnlich
      0.8, 0.9, 1.0, 1.1, 1.2, 1.2,  // 6-11: Später Start
      1.2, 1.2, 1.1, 1.0, 1.0, 1.0,  // 12-17: Aktiver Tag
      1.1, 1.2, 1.2, 1.1, 1.0, 0.9   // 18-23: Entspannterer Abend
    ]
  };
}

// Hauptfunktion: Generiere realistisches Lastprofil basierend auf Konfiguration
export function generateRealisticLoadProfile(config: {
  hasEV: boolean;
  hasHeatPump: boolean;
  hasPV: boolean;
  isSmartHome: boolean;
  householdSize: 'small' | 'medium' | 'large';
  month: number; // 0-11
  isWeekend?: boolean;
}): number[] {
  let profile: number[];
  
  // Basis-Haushaltsprofil wählen
  if (config.hasPV && config.isSmartHome) {
    profile = generatePVOptimizedHouseholdProfile();
  } else {
    profile = generateStandardHouseholdProfile();
  }
  
  // Haushaltsgröße berücksichtigen
  const sizeFactors = {
    small: 0.7,   // 1-2 Personen
    medium: 1.0,  // 3-4 Personen
    large: 1.4    // 5+ Personen
  };
  const sizeFactor = sizeFactors[config.householdSize];
  
  // E-Auto hinzufügen
  if (config.hasEV) {
    const evProfile = config.isSmartHome && config.hasPV 
      ? generateSmartEVProfile() 
      : generateConventionalEVProfile();
    
    const seasonalEVFactor = getSeasonalEVFactors()[config.month];
    
    for (let i = 0; i < 24; i++) {
      profile[i] += evProfile[i] * seasonalEVFactor;
    }
  }
  
  // Wärmepumpe hinzufügen
  if (config.hasHeatPump) {
    const hpProfile = config.isSmartHome && config.hasPV
      ? generatePVOptimizedHeatPumpProfile()
      : generateHeatPumpProfile();
    
    const seasonalHPFactor = getSeasonalHeatPumpFactors()[config.month];
    
    for (let i = 0; i < 24; i++) {
      profile[i] += hpProfile[i] * seasonalHPFactor;
    }
  }
  
  // Wochentag/Wochenende Anpassung
  const weekFactors = getWeekdayFactors();
  const dayFactors = config.isWeekend ? weekFactors.weekend : weekFactors.weekday;
  
  for (let i = 0; i < 24; i++) {
    profile[i] *= dayFactors[i] * sizeFactor;
  }
  
  // Normalisierung auf Summe = 1
  const sum = profile.reduce((a, b) => a + b, 0);
  return profile.map(v => v / sum);
}

// Hilfsfunktion: Validiere Profil
export function validateProfile(profile: number[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (profile.length !== 24) {
    errors.push(`Profil hat ${profile.length} Stunden, erwartet: 24`);
  }
  
  const sum = profile.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    errors.push(`Profil-Summe ist ${sum.toFixed(4)}, erwartet: 1.000`);
  }
  
  const negativeValues = profile.filter(v => v < 0).length;
  if (negativeValues > 0) {
    errors.push(`${negativeValues} negative Werte gefunden`);
  }
  
  const maxValue = Math.max(...profile);
  if (maxValue > 0.15) {
    errors.push(`Maximaler Wert ${(maxValue*100).toFixed(1)}% erscheint unrealistisch hoch`);
  }
  
  return { valid: errors.length === 0, errors };
}

// Export aller Profile für Tests und Validierung
export const STANDARD_PROFILES = {
  household: generateStandardHouseholdProfile(),
  householdPV: generatePVOptimizedHouseholdProfile(),
  evSmart: generateSmartEVProfile(),
  evConventional: generateConventionalEVProfile(),
  heatPump: generateHeatPumpProfile(),
  heatPumpPV: generatePVOptimizedHeatPumpProfile(),
  combined: generateCombinedOptimizedProfile()
};

// Beispiel-Konfigurationen für verschiedene Haushaltstypen
export const EXAMPLE_CONFIGS = {
  basicHousehold: {
    hasEV: false,
    hasHeatPump: false,
    hasPV: false,
    isSmartHome: false,
    householdSize: 'medium' as const,
    month: 6
  },
  pvHousehold: {
    hasEV: false,
    hasHeatPump: false,
    hasPV: true,
    isSmartHome: true,
    householdSize: 'medium' as const,
    month: 6
  },
  modernHousehold: {
    hasEV: true,
    hasHeatPump: true,
    hasPV: true,
    isSmartHome: true,
    householdSize: 'large' as const,
    month: 6
  }
};
