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
export type EconomicConfig = { electricityPriceCtPerKWh: number; feedInTariffCtPerKWh: number; baseFeeEURPerMonth?: number; capexPerKWpEUR: number; capexBatteryPerKWhEUR: number; opexPctOfCapexPerYear: number; priceEscalationPct?: number; feedEscalationPct?: number };
export type SimulationSettings = { buildFactor: number; shadingFactor: number; systemLossFactor: number; degradationPctPerYear: number; horizonYears: number };

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
