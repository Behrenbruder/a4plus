export type RoofType = 'Flachdach'|'Satteldach'|'Walmdach'|'Pultdach'|'Mansarddach';

export type LatLng = { lat: number; lng: number };
export type RoofFace = {
  id: string; name: string;
  azimuthDeg: number; tiltDeg: number;
  areaHorizM2: number; polygon: LatLng[];
};

export type ModuleConfig = { name: string; wpPerModule: number; moduleLengthM: number; moduleWidthM: number; effPct?: number; depreciationPct?: number };
export type PackingOptions = { orientation: 'portrait'|'landscape'; setbackM: number; rowGapM: number; colGapM: number };
export type BatteryConfig = { usableKWh: number; chargePowerKW: number; dischargePowerKW: number; roundTripEff: number; minSoCFrac: number };
export type EVConfig = { kmPerYear: number; kWhPer100km: number; homeChargingShare: number; arrivalHour: number; chargerPowerKW: number };
export type SystemLossBreakdown = {
  inverterLossPct: number;
  wiringLossPct: number;
  soilingLossPct: number;
  shadingLossPct: number;
  temperatureLossPct: number;
  mismatchLossPct: number;
  totalLossPct: number;
};

export type EconomicConfig = { 
  electricityPriceCtPerKWh: number; 
  feedInTariffCtPerKWh: number; 
  baseFeeEURPerMonth?: number; 
  // Erweiterte CapEx Struktur
  pvSystemCapexEUR?: number;        // Gesamtkosten PV-System
  capexPerKWpEUR: number;           // Alternative: pro kWp
  batteryCapexEUR?: number;         // Gesamtkosten Batterie
  capexBatteryPerKWhEUR: number;    // Alternative: pro kWh
  // Zusätzliche Kosten
  installationCostEUR?: number;     // Installationskosten
  maintenanceCostPerYearEUR?: number; // Wartungskosten
  insuranceCostPerYearEUR?: number;   // Versicherungskosten
  opexPctOfCapexPerYear: number; 
  priceEscalationPct?: number; 
  feedEscalationPct?: number;
};

export type SimulationSettings = { 
  buildFactor: number; 
  shadingFactor: number; 
  systemLossFactor: number;
  systemLossBreakdown?: SystemLossBreakdown; // Detaillierte Aufschlüsselung
  degradationPctPerYear: number; 
  horizonYears: number;
};

export type LoadProfileSource = 'BDEW' | 'OPSD' | 'SYNTH' | 'CUSTOM';

export type CustomLoadProfile = {
  source: 'CUSTOM';
  data: number[]; // 8760 Stunden-Werte
  filename?: string;
  uploadDate?: Date;
};

// Haushaltsszenarien für realistische Lastprofile
export type HouseholdScenario = 
  | 'household_only'           // Haushalt ohne PV und Speicher
  | 'household_pv'             // Haushalt mit PV ohne Speicher
  | 'household_pv_storage'     // Haushalt mit PV und Speicher
  | 'household_ev'             // Haushalt ohne PV und Speicher mit EV
  | 'household_pv_ev'          // Haushalt mit PV und EV ohne Speicher
  | 'household_pv_ev_storage'; // Haushalt mit PV, EV und Speicher

export type FinancialMetrics = {
  paybackTimeYears: number;        // Amortisationszeit
  npvEUR: number;                  // Kapitalwert (Net Present Value)
  irrPct: number;                  // Interne Zinsfuß (Internal Rate of Return)
  roiPct: number;                  // Return on Investment
  lcoeCtPerKWh: number;           // Levelized Cost of Energy
};

export type WizardState = {
  roofType?: RoofType;
  annualLoadKWh?: number; persons?: number;
  priceCt?: number; feedinCt?: number;
  center?: LatLng;
  faces: RoofFace[];
  module: ModuleConfig;
  packing: PackingOptions;
  settings: SimulationSettings;
  battery?: BatteryConfig;
  ev?: EVConfig;
};
