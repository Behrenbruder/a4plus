'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/* Abschnitt-Wrapper */
import Section from '@/components/wizard/Section';

/* Steps */
import { StepRoof } from '@/components/wizard/StepRoof';
import type { RoofType } from '@/components/wizard/StepRoof';
import { StepLoad } from '@/components/wizard/StepLoad';
import StepAddress from '@/components/wizard/StepAddress';
import { StepMap } from '@/components/wizard/StepMap';
import { StepModulePacking } from '@/components/wizard/StepModulePacking';
import { StepBattery } from '@/components/wizard/StepBattery';
import { StepEV } from '@/components/wizard/StepEV';
import { StepHeatPump, type HeatPumpConfig } from '@/components/wizard/StepHeatPump';
import { StepPrices, type StepPricesSubmit } from '@/components/wizard/StepPrices';
import { StepErgebnisse } from '@/components/wizard/StepErgebnisse';
import Report from '@/components/report/Report';

/* Typen & Helfer aus deiner Logik */
import {
  RoofFace,
  ModuleConfig,
  PackingOptions,
  SimulationSettings,
  EconomicConfig,
  LatLng,
  BatteryConfig,
  SystemLossBreakdown,
  FinancialMetrics,
  CustomLoadProfile,
  LoadProfileSource,
} from '@/lib/types';

import {
  computeFaceKWp,
  hourlyPVFromAnnual,
  dispatchGreedy,
  calculateSystemLossBreakdown,
  systemLossFactorFromBreakdown,
  calculateTotalCapex,
  calculateFinancialMetrics,
  calculateHybridMetrics,
  calculateBDEWBasedMetrics,
} from '@/lib/pvcalc';

/* Synthetisches H0 (nur Fallback) + Standardwerte */
import {
  hourlyLoadProfileFromHousehold, // nur Fallback
  STANDARD_ANNUAL_KWH,
  getScenarioLoadProfile,
  type HouseholdProfile,
  type HouseholdScenario,
} from '@/lib/loadProfiles';

/* -------------------------- Konstanten/Defaults -------------------------- */

const DEFAULT_MODULE: ModuleConfig = {
  name: 'Standard 430 Wp',
  wpPerModule: 430,
  moduleLengthM: 1.77,
  moduleWidthM: 1.09,
};

const DEFAULT_PACK: PackingOptions = {
  orientation: 'portrait',
  setbackM: 0.4,
  rowGapM: 0.02,
  colGapM: 0.02,
};

const DEFAULT_SETT: SimulationSettings = {
  buildFactor: 0.65,
  shadingFactor: 0.97,
  systemLossFactor: 0.90, // konservativ
  degradationPctPerYear: 0.006,
  horizonYears: 30,
};

const DEFAULT_ECON: EconomicConfig = {
  electricityPriceCtPerKWh: 35,
  feedInTariffCtPerKWh: 8.2,
  capexPerKWpEUR: 1350,
  capexBatteryPerKWhEUR: 800,
  opexPctOfCapexPerYear: 0.01, // Legacy field, now using fixed 12€/kWp/year
};

type PackTotals = { modules: number; kWp: number };

function personsToProfile(n?: number): HouseholdProfile {
  if (!Number.isFinite(n as number)) return '3_4p';
  const v = Number(n);
  if (v <= 1) return '1p';
  if (v === 2) return '2p';
  if (v <= 4) return '3_4p';
  return '5plus';
}

/* -------------------------- EV-Ladeprofil -------------------------- */

type EVMode = 'day_12_16' | 'evening_18_22' | 'night_22_06' | 'custom_wallbox';

function hourlyEVProfile(annualKWh: number, mode: EVMode, wallboxKW?: number): number[] {
  const H = 8760;
  const arr = new Array<number>(H).fill(0);
  if (!Number.isFinite(annualKWh) || annualKWh <= 0) return arr;

  const days = 365;
  let hours: number[] = [];
  if (mode === 'day_12_16') hours = [12, 13, 14, 15];
  else if (mode === 'evening_18_22') hours = [18, 19, 20, 21];
  else if (mode === 'night_22_06') hours = [22, 23, 0, 1, 2, 3, 4, 5, 6];
  else hours = [18, 19, 20, 21, 22, 23, 0, 1]; // Beispiel 18–01

  const daily = annualKWh / days;

  if (mode === 'custom_wallbox' && wallboxKW && wallboxKW > 0) {
    const maxPerDay = wallboxKW * hours.length;
    const factor = Math.min(1, daily / maxPerDay);
    for (let d = 0; d < days; d++) {
      for (const h of hours) {
        const hour = (h + 24) % 24;
        const idx = d * 24 + hour;
        if (idx < H) arr[idx] += wallboxKW * factor;
      }
    }
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

/* -------------------------- Wärmepumpen-Profil -------------------------- */

function hourlyHeatPumpProfile(config: HeatPumpConfig): number[] {
  const H = 8760;
  const arr = new Array<number>(H).fill(0);
  
  if (!config.hasHeatPump || !config.annualConsumptionKWh || config.annualConsumptionKWh <= 0) {
    return arr;
  }

  // Simple distribution over heating season (Oct-Apr)
  const heatingSeasonMonths = [1, 2, 3, 4, 10, 11, 12];
  const heatingSeasonSet = new Set(heatingSeasonMonths);
  
  // Count heating season days
  let heatingSeasonDays = 0;
  for (let day = 0; day < 365; day++) {
    const date = new Date(2024, 0, 1 + day);
    const month = date.getMonth() + 1;
    if (heatingSeasonSet.has(month)) {
      heatingSeasonDays++;
    }
  }
  
  if (heatingSeasonDays === 0) return arr;
  
  // Daily electrical consumption during heating season
  const dailyElectricalKWh = config.annualConsumptionKWh / heatingSeasonDays;
  
  // Typical heat pump operation pattern (higher during morning and evening)
  const hourlyPattern = [
    0.8, 0.7, 0.6, 0.6, 0.7, 0.9, // 0-5: Night/early morning
    1.2, 1.5, 1.3, 1.0, 0.8, 0.7, // 6-11: Morning peak
    0.6, 0.5, 0.5, 0.6, 0.8, 1.2, // 12-17: Afternoon
    1.5, 1.4, 1.2, 1.1, 1.0, 0.9  // 18-23: Evening peak
  ];
  
  const patternSum = hourlyPattern.reduce((a, b) => a + b, 0);
  const normalizedPattern = hourlyPattern.map(v => v / patternSum);
  
  // Apply pattern to each day
  for (let day = 0; day < 365; day++) {
    const date = new Date(2024, 0, 1 + day);
    const month = date.getMonth() + 1;
    
    if (heatingSeasonSet.has(month)) {
      for (let hour = 0; hour < 24; hour++) {
        const idx = day * 24 + hour;
        if (idx < H) {
          arr[idx] = dailyElectricalKWh * normalizedPattern[hour];
        }
      }
    }
  }
  
  return arr;
}

/* -------------------------- Hilfsfunktionen -------------------------- */

function normalize8760(arr: unknown): number[] {
  if (!Array.isArray(arr) || arr.length < 8760) return [];
  const nums = arr.map((x) => (Number.isFinite(Number(x)) ? Number(x) : 0));
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum <= 0) return [];
  return nums.map((v) => v / sum);
}

function average24(arr: number[]): number[] {
  const out = new Array(24).fill(0);
  if (!arr || arr.length < 24) return out;
  const days = Math.floor(arr.length / 24);
  for (let d = 0; d < days; d++) {
    for (let h = 0; h < 24; h++) {
      out[h] += arr[d * 24 + h];
    }
  }
  for (let h = 0; h < 24; h++) out[h] = out[h] / days;
  return out;
}

/* -------------------------- Seite -------------------------- */

export default function Page() {
  /* Wizard State */
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  /* Grunddaten */
  const [roofType, setRoofType] = useState<RoofType>('Satteldach');
  const [defaultTilt, setDefaultTilt] = useState<number>(35);

  const [center, setCenter] = useState<LatLng>({ lat: 49.534, lng: 8.353 });
  const [address, setAddress] = useState<string>('');
  const [faces, setFaces] = useState<RoofFace[]>([]);

  /* Verbrauch (manuell ODER Personen ODER custom CSV ODER Szenario) */
  const [annualKnownKWh, setAnnualKnownKWh] = useState<number | undefined>(undefined);
  const [persons, setPersons] = useState<number | undefined>(undefined);
  const [customLoadProfile, setCustomLoadProfile] = useState<CustomLoadProfile | null>(null);
  const [householdScenario, setHouseholdScenario] = useState<HouseholdScenario | undefined>(undefined);

  /* Preise, Module, Settings */
  const [econ, setEcon] = useState<EconomicConfig>({ ...DEFAULT_ECON });
  const [module, setModule] = useState<ModuleConfig>({ ...DEFAULT_MODULE });
  const [packing, setPacking] = useState<PackingOptions>({ ...DEFAULT_PACK });
  const [settings, setSettings] = useState<SimulationSettings>({ ...DEFAULT_SETT });
  
  /* Neue Features */
  const [systemLossBreakdown, setSystemLossBreakdown] = useState<SystemLossBreakdown>(
    calculateSystemLossBreakdown()
  );

  /* Batterie / EV / Wärmepumpe */
  const [batteryKWh, setBatteryKWh] = useState<number>(25);
  const [ev, setEV] = useState({
    kmPerYear: 20000,
    consumptionKWhPer100km: 22,
    homeChargePercent: 80,
  });
  
  const [heatPump, setHeatPump] = useState<HeatPumpConfig>({
    hasHeatPump: false,
    annualConsumptionKWh: 4000,
  });

  /* Paketierung */
  const [kwpOverrideByFace, setKwpOverrideByFace] = useState<Record<string, number>>({});
  const [packTotal, setPackTotal] = useState<PackTotals>({ modules: 0, kWp: 0 });


  /* Lastprofil: externe Quelle laden */
  const [householdBase8760, setHouseholdBase8760] = useState<number[] | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [profileSource, setProfileSource] = useState<'BDEW' | 'OPSD' | 'SYNTH'>('BDEW');

  /* PVGIS */
  const [perFaceYield, setPerFaceYield] = useState<number[]>([]);
  const [perFaceGTI, setPerFaceGTI] = useState<number[]>([]);
  const [pvgisWeightedGTI, setPvgisWeightedGTI] = useState<number | null>(null);
  const [pvgisSource, setPvgisSource] = useState<string | null>('PVGIS v5.3 (SARAH3)');
  const [pvgisError, setPvgisError] = useState<string | null>(null);



  /* ---------------------- Autosave laden ---------------------- */
  useEffect(() => {
    try {
      const s = localStorage.getItem('pvwizard');
      if (!s) return;
      const v = JSON.parse(s);
      if (v.roofType) setRoofType(v.roofType as RoofType);
      if (typeof v.defaultTilt === 'number') setDefaultTilt(v.defaultTilt);
      v.center && setCenter(v.center);
      v.address && setAddress(v.address);
      v.faces && setFaces(v.faces);
      if (typeof v.annualKnownKWh === 'number') setAnnualKnownKWh(v.annualKnownKWh);
      if (typeof v.persons === 'number') setPersons(v.persons);
      if (v.householdScenario) setHouseholdScenario(v.householdScenario as HouseholdScenario);
      v.econ && setEcon(v.econ);
      v.module && setModule(v.module);
      v.packing && setPacking(v.packing);
      v.settings && setSettings(v.settings);
      if (typeof v.batteryKWh === 'number') setBatteryKWh(v.batteryKWh);
      if (v.ev) setEV(v.ev);
      v.kwpOverrideByFace && setKwpOverrideByFace(v.kwpOverrideByFace);
      v.packTotal && setPackTotal(v.packTotal);

      if (Array.isArray(v.perFaceYield)) setPerFaceYield(v.perFaceYield);
      if (Array.isArray(v.perFaceGTI)) setPerFaceGTI(v.perFaceGTI);
      if (typeof v.pvgisWeightedGTI === 'number') setPvgisWeightedGTI(v.pvgisWeightedGTI);
      if (v.pvgisSource) setPvgisSource(v.pvgisSource);

      if (Array.isArray(v.householdBase8760)) setHouseholdBase8760(v.householdBase8760);
      if (v.profileSource) setProfileSource(v.profileSource);
      if (v.heatPump) setHeatPump(v.heatPump);
    } catch {}
  }, []);

  /* ---------------------- Autosave speichern ---------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(
        'pvwizard',
        JSON.stringify({
          roofType,
          defaultTilt,
          center,
          address,
          faces,
          annualKnownKWh,
          persons,
          econ,
          module,
          packing,
          settings,
          batteryKWh,
          ev,
          kwpOverrideByFace,
          packTotal,
          perFaceYield,
          perFaceGTI,
          pvgisWeightedGTI,
          pvgisSource,
          householdBase8760,
          profileSource,
          heatPump,
        }),
      );
    } catch {}
  }, [
    roofType,
    defaultTilt,
    center,
    address,
    faces,
    annualKnownKWh,
    persons,
    econ,
    module,
    packing,
    settings,
    batteryKWh,
    ev,
    kwpOverrideByFace,
    packTotal,
    perFaceYield,
    perFaceGTI,
    pvgisWeightedGTI,
    pvgisSource,
    householdBase8760,
    profileSource,
    heatPump,
  ]);

  /* ---------------------- BDEW/OPSD/SYNTH Profil laden ---------------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setProfileLoadError(null);

        // 1) BDEW bevorzugt
        if (profileSource === 'BDEW') {
          const r = await fetch('/data/bdew_h25_8760.json', { cache: 'force-cache' });
          if (!r.ok) throw new Error(`BDEW JSON nicht gefunden (HTTP ${r.status})`);
          const j = await r.json();
          const n = normalize8760(j);
          if (n.length !== 8760) throw new Error('BDEW: 8760 Werte erwartet.');
          if (!cancelled) setHouseholdBase8760(n);
          return;
        }

        // 2) OPSD
        if (profileSource === 'OPSD') {
          const r = await fetch('/data/opsd_household_median_8760.json', { cache: 'force-cache' });
          if (!r.ok) throw new Error(`OPSD JSON nicht gefunden (HTTP ${r.status})`);
          const j = await r.json();
          const n = normalize8760(j);
          if (n.length !== 8760) throw new Error('OPSD: 8760 Werte erwartet.');
          if (!cancelled) setHouseholdBase8760(n);
          return;
        }

        // 3) SYNTH – Fallback
        const h0 = hourlyLoadProfileFromHousehold('3_4p', undefined);
        const n = normalize8760(h0);
        if (!cancelled) setHouseholdBase8760(n);
      } catch (e: unknown) {
        // harter Fallback
        const h0 = hourlyLoadProfileFromHousehold('3_4p', undefined);
        if (!cancelled) {
          setHouseholdBase8760(normalize8760(h0));
          const error = e instanceof Error ? e : new Error('Unknown error');
          setProfileLoadError(error.message || 'Profil konnte nicht geladen werden.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileSource]);

  /* ---------------------- Verbrauch bestimmen ---------------------- */
  const chosenProfile: HouseholdProfile = personsToProfile(persons);
  const annualHouseholdKWh: number = useMemo(() => {
    if (Number.isFinite(annualKnownKWh) && (annualKnownKWh as number) > 0) {
      return Number(annualKnownKWh);
    }
    const byProfile = STANDARD_ANNUAL_KWH[chosenProfile];
    return Number.isFinite(byProfile) ? byProfile : 3000;
  }, [annualKnownKWh, chosenProfile]);

  const handleStepLoadNext = (vals: { annualKnownKWh?: number; persons?: number; customProfile?: CustomLoadProfile; scenario?: HouseholdScenario }) => {
    if (vals.customProfile) {
      setCustomLoadProfile(vals.customProfile);
      setAnnualKnownKWh(undefined);
      setPersons(undefined);
      setHouseholdScenario(undefined);
      return;
    }
    if (vals.scenario) {
      setHouseholdScenario(vals.scenario);
      setAnnualKnownKWh(undefined);
      setPersons(undefined);
      setCustomLoadProfile(null);
      return;
    }
    if (Number.isFinite(vals.annualKnownKWh)) {
      setAnnualKnownKWh(Number(vals.annualKnownKWh));
      setPersons(undefined);
      setCustomLoadProfile(null);
      setHouseholdScenario(undefined);
      return;
    }
    if (Number.isFinite(vals.persons)) {
      setPersons(Number(vals.persons));
      setAnnualKnownKWh(undefined);
      setCustomLoadProfile(null);
      setHouseholdScenario(undefined);
      return;
    }
  };

  /* ---------------------- kWp je Fläche (HORIZ -> TILT) ---------------------- */
  const perFaceKWp: number[] = useMemo(() => {
    return faces.map((f) => {
      const key = String((f as { id?: string | number }).id ?? '');
      const override = kwpOverrideByFace[key];
      if (Number.isFinite(override)) return Number(override);

      let tempFace: RoofFace = f;
      if (f.areaHorizM2 && Number.isFinite(f.tiltDeg)) {
        const rad = (f.tiltDeg * Math.PI) / 180;
        const cos = Math.max(0.01, Math.cos(rad));
        const areaTiltM2 = f.areaHorizM2 / cos; // HORIZ -> TILT
        tempFace = { ...f, areaHorizM2: areaTiltM2 };
      }
      return computeFaceKWp(tempFace, module, packing, settings.buildFactor).kWp;
    });
  }, [faces, module, packing, settings.buildFactor, kwpOverrideByFace]);

  /* ---------------------- PVGIS je Fläche ---------------------- */
  useEffect(() => {
    if (!center?.lat || !center?.lng || faces.length === 0) return;

    let abort = false;
    (async () => {
      try {
        setPvgisError(null);
        const PR = (settings.systemLossFactor || 1) * (settings.shadingFactor || 1);
        const lossPct = Math.max(0, Math.min(40, Math.round((1 - PR) * 100)));

        const payload = {
          lat: center.lat,
          lon: center.lng,
          loss: lossPct,
          faces: faces.map((_f, i) => ({
            tiltDeg: _f.tiltDeg,
            azimuthDeg: _f.azimuthDeg,
            weight: perFaceKWp[i] || 1,
          })),
        };

        const res = await fetch('/api/pvgis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          if (!abort) {
            setPvgisError(`HTTP ${res.status}: ${text || 'Fehler bei /api/pvgis'}`);
            setPerFaceYield(new Array(faces.length).fill(1000));
            setPerFaceGTI(new Array(faces.length).fill(0));
            setPvgisWeightedGTI(null);
          }
          return;
        }

        const data = await res.json();

        const yields = faces.map((_f, i) => {
          const v = Number(data?.perFace?.[i]?.specificYield);
          const w = Number(data?.weightedSpecificYieldKWhPerKWp);
          return Number.isFinite(v) ? v : Number.isFinite(w) ? w : 1000;
        });

        const gtis = faces.map((_f, i) => {
          const v = Number(data?.perFace?.[i]?.gtiKWhm2Year);
          const w = Number(data?.weightedGtiKWhm2Year);
          return Number.isFinite(v) ? v : Number.isFinite(w) ? w : 0;
        });

        if (!abort) {
          setPerFaceYield(yields as number[]);
          setPerFaceGTI(gtis as number[]);
          setPvgisWeightedGTI(
            Number.isFinite(Number(data?.weightedGtiKWhm2Year))
              ? Number(data?.weightedGtiKWhm2Year)
              : null,
          );
          setPvgisSource('PVGIS v5.3 (SARAH3)');
        }
      } catch (e: unknown) {
        if (!abort) {
          const error = e instanceof Error ? e : new Error('Unknown error');
          setPvgisError(error.message || 'Unbekannter Fehler bei /api/pvgis');
          setPerFaceYield(new Array(faces.length).fill(1000));
          setPerFaceGTI(new Array(faces.length).fill(0));
          setPvgisWeightedGTI(null);
        }
      }
    })();

    return () => {
      abort = true;
    };
  }, [center.lat, center.lng, faces, perFaceKWp, settings.systemLossFactor, settings.shadingFactor]);


  /* ---------------------- Jahreswerte PV ---------------------- */
  const annualPVPerFace = useMemo(
    () => perFaceKWp.map((k, i) => Math.round(k * (perFaceYield[i] ?? 1000))),
    [perFaceKWp, perFaceYield],
  );

  /* ---------------------- EV-JahreskWh ---------------------- */
  const annualEVHomeKWh = useMemo(() => {
    const km = Math.max(0, Number(ev?.kmPerYear) || 0);
    const kwhPer100 = Math.max(0, Number(ev?.consumptionKWhPer100km) || 0);
    const homePct = Math.max(0, Math.min(100, Number(ev?.homeChargePercent) || 0));
    return (km / 100) * kwhPer100 * (homePct / 100);
  }, [ev]);

  /* ---------------------- Lastprofil (Haushalt + EV + Wärmepumpe) ---------------------- */
  const loadProfile = useMemo(() => {
    // Use custom CSV profile if available
    if (customLoadProfile && customLoadProfile.data && customLoadProfile.data.length === 8760) {
      // Add heat pump consumption to custom profile
      const heatPumpProf = hourlyHeatPumpProfile(heatPump);
      return customLoadProfile.data.map((v, i) => v + (heatPumpProf[i] || 0));
    }
    
    // Use scenario-based profile if selected
    if (householdScenario) {
      const scenarioProfile = getScenarioLoadProfile(householdScenario, chosenProfile);
      const heatPumpProf = hourlyHeatPumpProfile(heatPump);
      return scenarioProfile.map((v, i) => v + (heatPumpProf[i] || 0));
    }
    
    // Fallback to legacy method (BDEW/OPSD/SYNTH + EV + Heat Pump)
    let baseNorm = householdBase8760;
    if (!baseNorm || baseNorm.length !== 8760) {
      baseNorm = normalize8760(hourlyLoadProfileFromHousehold('3_4p', undefined));
    }
    const household = baseNorm.map((v) => v * annualHouseholdKWh);
    
    const evProf = hourlyEVProfile(annualEVHomeKWh, 'night_22_06');
    const heatPumpProf = hourlyHeatPumpProfile(heatPump);
    return household.map((v, i) => v + (evProf[i] || 0) + (heatPumpProf[i] || 0));
  }, [customLoadProfile, householdScenario, chosenProfile, householdBase8760, annualHouseholdKWh, annualEVHomeKWh, heatPump]);

  /* ---------------------- PV stündlich ---------------------- */
  const pvProfile = useMemo(() => {
    const H = 8760;
    const sum = new Array<number>(H).fill(0);
    for (let i = 0; i < annualPVPerFace.length; i++) {
      const prof = hourlyPVFromAnnual(annualPVPerFace[i] || 0);
      for (let h = 0; h < H; h++) sum[h] += prof[h];
    }
    return sum;
  }, [annualPVPerFace]);

  /* ---------------------- Batterie-Dispatch ---------------------- */
  const batteryCfg: BatteryConfig = useMemo(() => {
    const kWh = Math.max(0, Number(batteryKWh) || 0);
    const p = kWh > 0 ? Math.max(2.5, 0.25 * kWh) : 0; // 0.25 C, min 2.5 kW
    return {
      usableKWh: kWh,
      chargePowerKW: p,
      dischargePowerKW: p,
      roundTripEff: 0.88,
      minSoCFrac: 0.10,
    };
  }, [batteryKWh]);

  const dispatch = useMemo(
    () => dispatchGreedy(pvProfile, loadProfile, batteryCfg),
    [pvProfile, loadProfile, batteryCfg],
  );

  /* ---------------------- KPIs ---------------------- */
  const perFaceKWpSum = useMemo(() => perFaceKWp.reduce((a, b) => a + b, 0), [perFaceKWp]);
  const annualPV = useMemo(() => annualPVPerFace.reduce((a, b) => a + b, 0), [annualPVPerFace]);
  const annualConsumption = useMemo(() => loadProfile.reduce((a, b) => a + b, 0), [loadProfile]);

  // BDEW-basierte Berechnung für Autarkie und Eigenverbrauch
  // Automatische Profilauswahl: H25 ohne Speicher, S25 mit Speicher
  const hybridMetrics = useMemo(() => {
    const annualHeatPumpKWh = heatPump.hasHeatPump ? heatPump.annualConsumptionKWh : 0;
    
    return calculateBDEWBasedMetrics(
      annualPV,
      annualHouseholdKWh, // Nur Haushalt ohne EV und Wärmepumpe
      batteryKWh,
      annualEVHomeKWh,
      annualHeatPumpKWh
    );
  }, [annualPV, annualHouseholdKWh, batteryKWh, annualEVHomeKWh, heatPump]);

  // Verwende Hybrid-Metriken für Autarkie und Eigenverbrauch
  const autarkie = hybridMetrics.autarky;
  const eigenverbrauchQuote = hybridMetrics.selfConsumption;
  
  // Berechne Eigenverbrauch in kWh basierend auf der Quote
  const eigenverbrauchKWh = annualPV * eigenverbrauchQuote;

  const priceEUR = (econ.electricityPriceCtPerKWh || 0) / 100;
  const feedEUR = (econ.feedInTariffCtPerKWh || 0) / 100;
  const einsparungKostenEUR = eigenverbrauchKWh * priceEUR;
  const einspeiseVerguetungEUR = dispatch.feedInKWh * feedEUR;
  const einsparungJahr = einsparungKostenEUR + einspeiseVerguetungEUR;

  const co2SavingsTons = (annualPV * 0.4) / 1000;

  const batteryChargeKWh = Number((dispatch as { batteryChargeKWh?: number }).batteryChargeKWh) || 0;
  const batteryDischargeKWh = Number((dispatch as { batteryDischargeKWh?: number }).batteryDischargeKWh) || 0;
  const batteryUsage =
    batteryKWh > 0 && batteryChargeKWh > 0
      ? (batteryDischargeKWh / batteryChargeKWh) * 100
      : null;

  /* ---------------------- Erweiterte Finanzberechnungen ---------------------- */
  const totalCapex = useMemo(() => {
    return calculateTotalCapex(perFaceKWpSum, batteryKWh, econ);
  }, [perFaceKWpSum, batteryKWh, econ]);

  const financialMetrics = useMemo(() => {
    // Fixed OPEX: 12€ per kWp per year (replaces old percentage-based calculation)
    const annualOpexEUR = perFaceKWpSum * 12;
    const annualMaintenance = econ.maintenanceCostPerYearEUR || 0;
    const annualInsurance = econ.insuranceCostPerYearEUR || 0;
    const totalAnnualOpex = annualOpexEUR + annualMaintenance + annualInsurance;
    
    return calculateFinancialMetrics(
      einsparungJahr,
      totalCapex.totalCapex,
      totalAnnualOpex,
      0, // Insurance is already included in totalAnnualOpex
      settings.horizonYears
    );
  }, [einsparungJahr, totalCapex.totalCapex, perFaceKWpSum, econ.maintenanceCostPerYearEUR, econ.insuranceCostPerYearEUR, settings.horizonYears]);

  // Systemverluste aus Breakdown aktualisieren
  useEffect(() => {
    const newSystemLossFactor = systemLossFactorFromBreakdown(systemLossBreakdown);
    if (Math.abs(newSystemLossFactor - settings.systemLossFactor) > 0.001) {
      setSettings(prev => ({
        ...prev,
        systemLossFactor: newSystemLossFactor
      }));
    }
  }, [systemLossBreakdown, settings.systemLossFactor]);

  /* ---------------------- 24h-Mittel fürs Debug ---------------------- */
  const householdOnlyProfile = useMemo(() => {
    let baseNorm = householdBase8760;
    if (!baseNorm || baseNorm.length !== 8760) {
      baseNorm = normalize8760(hourlyLoadProfileFromHousehold('3_4p', undefined));
    }
    return baseNorm.map((v) => v * annualHouseholdKWh);
  }, [householdBase8760, annualHouseholdKWh]);

  const evHourlyProfileArr = useMemo(
    () => hourlyEVProfile(annualEVHomeKWh, 'night_22_06'),
    [annualEVHomeKWh],
  );

  const dailyLoadAvg24 = useMemo(() => average24(loadProfile), [loadProfile]);
  const dailyLoadHouseholdAvg24 = useMemo(
    () => average24(householdOnlyProfile),
    [householdOnlyProfile],
  );
  const dailyEVAvg24 = useMemo(() => average24(evHourlyProfileArr), [evHourlyProfileArr]);

  /* ---------------------- Debug/Report Bundle ---------------------- */
  const debugData = useMemo(
    () => ({
      inputs: {
        roofType,
        defaultTilt,
        center,
        address,
        faces,
        annualKnownKWh,
        econ,
        module,
        packing,
        settings,
        batteryKWh,
        ev,
        kwpOverrideByFace,
        packTotal,
        pvgisSource,
        perFaceYield,
        perFaceGTI,
        pvgisWeightedGTI,
        profileSource,
        profileLoadError,
      },
      results: {
        perFaceKWp,
        annualPVPerFace,
        totalKWp: perFaceKWpSum,
        annualPV,
        annualConsumption,
        eigenverbrauchKWh,
        eigenverbrauchPct: Math.round(eigenverbrauchQuote * 100),
        autarkiePct: Math.round(autarkie * 100),
        feedInKWh: dispatch.feedInKWh,
        gridImportKWh: dispatch.gridImportKWh,
        batteryChargeKWh,
        batteryDischargeKWh,
        priceCt: econ.electricityPriceCtPerKWh,
        feedinCt: econ.feedInTariffCtPerKWh,
        co2SavingsTons,
        einsparungJahrEUR: einsparungJahr,
        einspeiseVerguetungEUR,
        ersparnisKostenEUR: einsparungKostenEUR,
      },
      profiles: {
        dailyLoadAvg24,            // Haushalt + EV
        dailyLoadHouseholdAvg24,   // nur Haushalt
        dailyEVAvg24,              // nur EV
      },
    }),
    [
      roofType,
      defaultTilt,
      center,
      address,
      faces,
      annualKnownKWh,
      econ,
      module,
      packing,
      settings,
      batteryKWh,
      ev,
      kwpOverrideByFace,
      packTotal,
      pvgisSource,
      perFaceYield,
      perFaceGTI,
      pvgisWeightedGTI,
      profileSource,
      profileLoadError,
      perFaceKWp,
      perFaceKWpSum,
      annualPVPerFace,
      annualPV,
      annualConsumption,
      eigenverbrauchKWh,
      eigenverbrauchQuote,
      autarkie,
      dispatch.feedInKWh,
      dispatch.gridImportKWh,
      batteryChargeKWh,
      batteryDischargeKWh,
      co2SavingsTons,
      einsparungJahr,
      einspeiseVerguetungEUR,
      einsparungKostenEUR,
      dailyLoadAvg24,
      dailyLoadHouseholdAvg24,
      dailyEVAvg24,
    ],
  );

  /* ---------------------- UI ---------------------- */
  const sections = [
    { id: 's1-dachart', title: 'Dachart', done: !!roofType },
    { id: 's2-verbrauch', title: 'Verbrauch', done: !!annualHouseholdKWh || !!customLoadProfile },
    { id: 's3-preise', title: 'Preise', done: true },
    { id: 's4-adresse', title: 'Adresse', done: !!address },
    { id: 's5-dachflaechen', title: 'Dachflächen markieren', done: faces.length > 0 },
    { id: 's6-bebauung', title: 'Bebauung & Beschattung', done: true },
    { id: 's7-module', title: 'Modul & Paketierung', done: true },
    { id: 's8-speicher', title: 'Speicher', done: true },
    { id: 's9-ev', title: 'E-Auto', done: true },
    { id: 's10-waermepumpe', title: 'Wärmepumpe', done: true },
    { id: 's11-ergebnisse', title: 'Ergebnisse', done: true },
  ];
  const pct = Math.round((sections.filter((s) => s.done).length / sections.length) * 100);
  const containerRef = useRef<HTMLDivElement>(null);


  return (
    <div className="container max-w-6xl mx-auto pb-20" ref={containerRef}>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="container max-w-6xl mx-auto py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-semibold">PV-Rechner</h1>
              <div className="hidden sm:block text-sm text-gray-600">
                {pct}% abgeschlossen
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 sm:hidden">
              {pct}%
            </div>
          </div>
        </div>
        <div className="h-1 bg-gray-200">
          <div className="h-1 bg-emerald-600 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-8 sm:space-y-12 mt-6 sm:mt-8">
        <Section number={1} title="Dachart" idAnchor="s1-dachart" done={!!roofType}>
          <StepRoof
            value={roofType}
            onNext={(type, tilt) => {
              setRoofType(type);
              setDefaultTilt(tilt);
            }}
          />
        </Section>

        <Section number={2} title="Verbrauch" idAnchor="s2-verbrauch" done={!!annualHouseholdKWh || !!customLoadProfile || !!householdScenario}>
          <StepLoad
            annualKnownKWh={annualKnownKWh}
            persons={persons}
            resolvedAnnualKWh={annualHouseholdKWh}
            customProfile={customLoadProfile || undefined}
            scenario={householdScenario}
            onNext={handleStepLoadNext}
          />
        </Section>

        <Section number={3} title="Preise" idAnchor="s3-preise" done>
          <StepPrices
            priceCt={econ.electricityPriceCtPerKWh}
            feedinCt={econ.feedInTariffCtPerKWh}
            capexPerKWpEUR={econ.capexPerKWpEUR}
            capexBatteryPerKWhEUR={econ.capexBatteryPerKWhEUR}
            onNext={({ priceCt, feedinCt, capexPerKWpEUR, capexBatteryPerKWhEUR }) =>
              setEcon({
                ...econ,
                electricityPriceCtPerKWh: priceCt,
                feedInTariffCtPerKWh: feedinCt,
                capexPerKWpEUR,
                capexBatteryPerKWhEUR,
              })
            }
          />
        </Section>

        <Section number={4} title="Adresse" idAnchor="s4-adresse" done={!!address}>
          <StepAddress
            value={address}
            defaultCenter={center}
            countryRestriction="de"
            onNext={(c, a) => {
              setCenter(c);
              setAddress(a);
            }}
          />

          {(pvgisSource || pvgisWeightedGTI != null) && (
            <div className="mt-3 p-3 rounded-xl bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  Quelle
                  <div className="relative group">
                    <svg 
                      className="w-3 h-3 text-gray-400 cursor-help" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      PVGIS (Photovoltaic Geographical Information System) ist ein kostenloser Service der Europäischen Kommission zur Berechnung der Solarstrahlung und PV-Erträge.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="font-medium">{pvgisSource ?? 'PVGIS'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Ø GTI (gewichtet)</div>
                <div className="font-medium">
                  {pvgisWeightedGTI != null
                    ? `${Math.round(pvgisWeightedGTI).toLocaleString()} kWh/m²·a`
                    : faces.length > 0
                    ? '—'
                    : 'Flächen markieren'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600">PR</div>
                <div className="font-medium">
                  {Math.round(
                    ((settings.systemLossFactor || 1) * (settings.shadingFactor || 1)) * 100,
                  )}
                  %
                </div>
              </div>
            </div>
          )}

          {pvgisError && (
            <div className="mt-2 text-xs text-red-600">
              PVGIS-Daten konnten nicht geladen werden: {pvgisError}
            </div>
          )}
        </Section>

        <Section
          number={5}
          title="Dachflächen & Annahmen"
          idAnchor="s5-dachflaechen"
          done={faces.length > 0}
        >
          <StepMap 
            center={center} 
            defaultTilt={defaultTilt} 
            faces={faces} 
            onFacesChange={setFaces}
            perFaceGTI={perFaceGTI}
          />
        </Section>

        <Section number={6} title="Bebauung & Beschattung" idAnchor="s6-bebauung" done>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-800">
              <strong>Hinweis:</strong> Die Standardwerte für Bebauung (65%) und Beschattung (97%) sind bereits optimiert. 
              Diese können in späteren Versionen angepasst werden.
            </div>
          </div>
        </Section>

        <Section number={7} title="Modul & Paketierung" idAnchor="s7-module" done>
          <StepModulePacking
            faces={faces}
            roofType={roofType}
            onNext={({ perFace = [], total }) => {
              setKwpOverrideByFace(
                Object.fromEntries(
                  perFace.map((r: { id?: string | number; kWp?: number }) => [String(r.id), Number(r.kWp) || 0] as const),
                ),
              );
              setPackTotal({
                modules:
                  Number(total?.modules) ||
                  perFace.reduce((a: number, b: { modules?: number }) => a + (b.modules || 0), 0),
                kWp:
                  Number(total?.kWp) ||
                  perFace.reduce((a: number, b: { kWp?: number }) => a + (b.kWp || 0), 0),
              });
            }}
          />
        </Section>

        <Section number={8} title="Speicher" idAnchor="s8-speicher" done>
          <StepBattery value={batteryKWh} onNext={(cap) => setBatteryKWh(cap)} />
        </Section>

        <Section number={9} title="E-Auto" idAnchor="s9-ev" done>
          <StepEV value={ev} onNext={(vals) => setEV(vals)} />
        </Section>

        <Section number={10} title="Wärmepumpe" idAnchor="s10-waermepumpe" done>
          <StepHeatPump
            value={heatPump}
            onNext={(config) => setHeatPump(config)}
          />
        </Section>

        <Section number={11} title="Ergebnisse" idAnchor="s11-ergebnisse" done>
          <StepErgebnisse
            totalKWp={perFaceKWpSum}
            annualPV={annualPV}
            eigenverbrauchKWh={eigenverbrauchKWh}
            feedInKWh={dispatch.feedInKWh}
            einsparungJahrEUR={einsparungJahr}
            co2SavingsTons={co2SavingsTons}
            batteryUsagePct={batteryUsage}
            autarkie={autarkie}
            eigenverbrauch={eigenverbrauchQuote}
            financialMetrics={financialMetrics}
            totalCapexEUR={totalCapex.totalCapex}
            systemLossBreakdown={systemLossBreakdown}
            annualMaintenanceEUR={econ.maintenanceCostPerYearEUR}
            annualInsuranceEUR={econ.insuranceCostPerYearEUR}
            pvCalculatorData={{
              roofType,
              roofTilt: defaultTilt,
              annualConsumption: annualConsumption,
              electricityPrice: econ.electricityPriceCtPerKWh,
              roofFaces: faces,
              batteryKWh,
              evData: {
                kmPerYear: ev.kmPerYear,
                kWhPer100km: ev.consumptionKWhPer100km,
                homeChargingShare: ev.homeChargePercent / 100,
                arrivalHour: 18, // Default arrival hour
                chargerPowerKW: 11, // Default charger power
              },
              heatPumpConsumption: heatPump.hasHeatPump ? heatPump.annualConsumptionKWh : undefined,
            }}
          />
          <div className="mt-6">
            <Report data={debugData} />
          </div>
        </Section>
      </div>
    </div>
  );
}
