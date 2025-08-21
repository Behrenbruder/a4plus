'use client';

import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Legend as ReLegend,
} from 'recharts';

// ---------------- Types ----------------

export interface ReportData {
  inputs: {
    roofType: string;
    defaultTilt: number;
    center: { lat: number; lng: number };
    address: string;
    faces: Array<{
      id: string;
      name: string;
      azimuthDeg: number;
      tiltDeg: number;
      areaHorizM2?: number;
      buildFactor?: number;
      shadingFactor?: number;
    }>;
    annualKnownKWh?: number;
    econ: {
      electricityPriceCtPerKWh: number;
      feedInTariffCtPerKWh: number;
      capexPerKWpEUR?: number;
      capexBatteryPerKWhEUR?: number;
      opexPctOfCapexPerYear?: number;
    };
    module: {
      name: string;
      wpPerModule: number;
      moduleLengthM: number;
      moduleWidthM: number;
    };
    packing: {
      orientation: 'portrait' | 'landscape';
      setbackM: number;
      rowGapM: number;
      colGapM: number;
    };
    settings: {
      buildFactor: number;
      shadingFactor: number;
      systemLossFactor: number;
      degradationPctPerYear: number; // 0.006 = 0.6%/a
      horizonYears: number;
    };
    batteryKWh: number;
    ev: { kmPerYear: number; consumptionKWhPer100km: number; homeChargePercent: number };
    kwpOverrideByFace?: Record<string, number>;
    packTotal?: { modules: number; kWp: number };
    pvgisSource?: string | null;
    perFaceYield?: number[];
    perFaceGTI?: number[];
    pvgisWeightedGTI?: number | null;
  };
  results: {
    perFaceKWp: number[];
    annualPVPerFace: number[];
    totalKWp: number;
    annualPV: number;                   // kWh/a
    annualConsumption: number;          // kWh/a
    eigenverbrauchKWh: number;          // kWh/a
    eigenverbrauchPct: number;          // 0..100 oder 0..1 (wird normalisiert)
    autarkiePct: number;                // 0..100 oder 0..1 (wird normalisiert)
    feedInKWh: number;                  // kWh/a
    gridImportKWh: number;              // kWh/a
    batteryChargeKWh: number | null;
    batteryDischargeKWh: number | null; // wichtig für "Batterie aus"
    priceCt: number;                    // Strompreis (ct/kWh)
    feedinCt: number;                   // Vergütung (ct/kWh)
    co2SavingsTons: number;
    einsparungJahrEUR: number;
  };
}

// ---------------- Utils ----------------

const fmt = (n: number, digits = 0) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(n);

const pct = (x: number) => (x <= 1 ? Math.round(x * 100) : Math.round(x));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Deutscher Richtwert als Vergleich (konservativ)
const DE_GTI_BASELINE = 1100; // kWh/m²·a

const COLORS = ['#16a34a', '#94a3b8']; // grün / grau

function npv(rate: number, cashflows: number[]) {
  // cashflows: t=0..N (t=0 z.B. -CAPEX)
  return cashflows.reduce((pv, c, i) => pv + c / Math.pow(1 + rate, i), 0);
}

function irr(cashflows: number[]): number | null {
  // robuste Bisektionssuche in [−0.95, 0.95]
  let low = -0.95, high = 0.95;
  const f = (r: number) => npv(r, cashflows);
  let fLow = f(low), fHigh = f(high);
  if (isNaN(fLow) || isNaN(fHigh)) return null;
  if (fLow * fHigh > 0) return null; // kein Vorzeichenwechsel

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLow * fMid < 0) {
      high = mid; fHigh = fMid;
    } else {
      low = mid; fLow = fMid;
    }
  }
  return (low + high) / 2;
}

// ---------------- Component ----------------

export default function Report({ data }: { data: ReportData }) {
  const { inputs, results } = data;

  // ------------- Szenarien ----------------
  const [priceScenario, setPriceScenario] = useState<'baseline' | 'plus30' | 'minus30'>('baseline');
  const [batteryEnabled, setBatteryEnabled] = useState<boolean>((inputs.batteryKWh || 0) > 0);
  const [discountRate, setDiscountRate] = useState<number>(0.04); // 4% Diskontsatz für NPV/LCOE/IRR

  // Preisfaktoren
  const priceMult = priceScenario === 'plus30' ? 1.3 : priceScenario === 'minus30' ? 0.7 : 1;

  // Strompreis & Vergütung (€/kWh) nach Szenario
  const priceEUR = ((results.priceCt || inputs.econ.electricityPriceCtPerKWh || 0) / 100) * priceMult;
  const feedEUR = ((results.feedinCt || inputs.econ.feedInTariffCtPerKWh || 0) / 100) * priceMult;

  // Pie-Percent fixen
  const autarkiePct = pct(results.autarkiePct);
  const eigenPct = pct(results.eigenverbrauchPct);

  // Modulanzahl ggf. schätzen
  const guessedModules =
    inputs.packTotal?.modules ??
    Math.round((results.totalKWp * 1000) / (inputs.module?.wpPerModule || 400));

  // GTI
  const gti = Number.isFinite(inputs.pvgisWeightedGTI || NaN)
    ? (inputs.pvgisWeightedGTI as number)
    : (inputs.perFaceGTI?.[0] ?? NaN);

  // ---- Batterie aus: EV/FeedIn anteilig korrigieren (grob: verschiebt Discharge in Einspeisung) ----
  const baseEV = Math.max(0, results.eigenverbrauchKWh);
  const baseFeed = Math.max(0, results.feedInKWh);
  const basePV = baseEV + baseFeed;

  const noBatteryAdj = useMemo(() => {
    if (!batteryEnabled && (results.batteryDischargeKWh || 0) > 0) {
      const discharge = Math.max(0, results.batteryDischargeKWh || 0);
      const evNoBatt = Math.max(0, baseEV - discharge); // grobe Näherung
      const fiNoBatt = basePV - evNoBatt;
      return { ev: evNoBatt, fi: fiNoBatt };
    }
    return { ev: baseEV, fi: baseFeed };
  }, [batteryEnabled, baseEV, baseFeed, basePV, results.batteryDischargeKWh]);

  // ---- CAPEX/OPEX ----
  const capexKWp = inputs.econ.capexPerKWpEUR ?? 1350;
  const capexBatt = inputs.econ.capexBatteryPerKWhEUR ?? 800;
  const opexPct = inputs.econ.opexPctOfCapexPerYear ?? 0.01;

  const capex =
    results.totalKWp * capexKWp +
    (batteryEnabled ? (inputs.batteryKWh || 0) * capexBatt : 0);

  const opexYear = capex * opexPct;

  // ---- Cashflows mit Degradation & Szenarien ----
  const horizon = inputs.settings.horizonYears || 30;
  const degr = clamp01(inputs.settings.degradationPctPerYear ?? 0);

  const cashRows = useMemo(() => {
    const rows: Array<{
      year: number;
      pvKWh: number;
      evKWh: number;
      fiKWh: number;
      savedEUR: number;
      feedEUR: number;
      opexEUR: number;
      totalEUR: number; // saved + feed - opex
    }> = [];

    for (let y = 1; y <= horizon; y++) {
      const f = Math.pow(1 - degr, y - 1);
      const ev = noBatteryAdj.ev * f;
      const fi = noBatteryAdj.fi * f;
      const pv = (noBatteryAdj.ev + noBatteryAdj.fi) * f;

      const saved = ev * priceEUR;
      const feed = fi * feedEUR;
      const total = saved + feed - opexYear;

      rows.push({
        year: y,
        pvKWh: pv,
        evKWh: ev,
        fiKWh: fi,
        savedEUR: saved,
        feedEUR: feed,
        opexEUR: opexYear,
        totalEUR: total,
      });
    }
    return rows;
  }, [horizon, degr, noBatteryAdj.ev, noBatteryAdj.fi, priceEUR, feedEUR, opexYear]);

  const totals = useMemo(() => {
    const sum = (k: keyof (typeof cashRows)[number]) =>
      cashRows.reduce((a, r) => a + (r[k] as number), 0);
    return {
      savedEUR: sum('savedEUR'),
      feedEUR: sum('feedEUR'),
      totalEUR: sum('totalEUR'),
      pvKWh: sum('pvKWh'),
    };
  }, [cashRows]);

  // ---- NPV / IRR / LCOE ----
  const discount = Math.max(0, discountRate);
  const cashflowsForNPV = useMemo(() => {
    // t=0: -CAPEX; t>=1: totalEUR (schon opex berücksichtigt)
    return [-capex, ...cashRows.map((r) => r.totalEUR)];
  }, [capex, cashRows]);

  const npvEUR = useMemo(() => npv(discount, cashflowsForNPV), [discount, cashflowsForNPV]);
  const irrPct = useMemo(() => {
    const v = irr(cashflowsForNPV);
    return v == null ? null : v * 100;
  }, [cashflowsForNPV]);
  const lcoeEURperKWh = useMemo(() => {
    // PV of costs / PV of energy
    const pvCosts =
      capex + cashRows.reduce((s, r, i) => s + opexYear / Math.pow(1 + discount, i + 1), 0);
    const pvEnergy = cashRows.reduce((s, r, i) => s + r.pvKWh / Math.pow(1 + discount, i + 1), 0);
    return pvEnergy > 0 ? pvCosts / pvEnergy : NaN;
  }, [capex, cashRows, discount, opexYear]);

  // ---- PDF Export (Deckblatt + Inhalt) ----
  const coverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  async function addElementAsPages(pdf: jsPDF, element: HTMLElement, topMarginMm = 10) {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 2 * topMarginMm;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = topMarginMm;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, 'PNG', topMarginMm, position, imgWidth, imgHeight, undefined, 'FAST');

    heightLeft -= (pageHeight - topMarginMm);
    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft + topMarginMm - imgHeight;
      pdf.addImage(imgData, 'PNG', topMarginMm, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - topMarginMm);
    }
  }

  const handlePdf = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Deckblatt
    if (coverRef.current) {
      await addElementAsPages(pdf, coverRef.current, 12);
    }

    // Hauptinhalt
    if (contentRef.current) {
      pdf.addPage();
      await addElementAsPages(pdf, contentRef.current, 10);
    }

    pdf.save('PV-Report.pdf');
  };

  // ----------- UI -----------

  return (
    <div className="space-y-6">
      {/* Kopf mit Aktionen */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl font-semibold">PV-Projektbericht</h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Szenario: Preis */}
          <label className="text-sm">Preisszenario:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={priceScenario}
            onChange={(e) => setPriceScenario(e.target.value as 'baseline' | 'plus30' | 'minus30')}
          >
            <option value="baseline">Baseline</option>
            <option value="plus30">+30% Preise</option>
            <option value="minus30">−30% Preise</option>
          </select>

          {/* Szenario: Batterie */}
          <label className="text-sm ml-2">Batterie:</label>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={batteryEnabled}
            onChange={(e) => setBatteryEnabled(e.target.checked)}
            disabled={(inputs.batteryKWh || 0) <= 0}
            title={(inputs.batteryKWh || 0) > 0 ? 'Batterie an/aus (vereinfachte Näherung)' : 'Keine Batterie konfiguriert'}
          />

          {/* Diskontsatz */}
          <label className="text-sm ml-2">Diskontsatz:</label>
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm w-20"
            step="0.1"
            value={(discountRate * 100).toFixed(1)}
            onChange={(e) => setDiscountRate(Math.max(0, Number(e.target.value) / 100))}
          />
          <span className="text-sm">%</span>

          <button
            onClick={handlePdf}
            className="ml-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Als PDF herunterladen
          </button>
        </div>
      </div>

      {/* --- Deckblatt --- */}
      <div ref={coverRef} className="space-y-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Adresse</div>
          <div className="font-medium">{inputs.address || '—'}</div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Installierbare Leistung</div>
            <div className="font-medium">{fmt(results.totalKWp, 2)} kWp</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Geschätzte Modulanzahl</div>
            <div className="font-medium">{fmt(guessedModules)}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Prognostizierte Jahresproduktion</div>
            <div className="font-medium">{fmt(basePV)} kWh/a</div>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Dachflächen</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Azimut</th>
                  <th className="py-2 pr-3">Neigung</th>
                  <th className="py-2 pr-3">kWp</th>
                  <th className="py-2 pr-3">GTI [kWh/m²·a]</th>
                  <th className="py-2 pr-3">Spez. Ertrag [kWh/kWp·a]</th>
                </tr>
              </thead>
              <tbody>
                {inputs.faces.map((f, i) => (
                  <tr key={f.id} className="border-b">
                    <td className="py-1 pr-3">{f.name || `Fläche ${i + 1}`}</td>
                    <td className="py-1 pr-3">{f.azimuthDeg}°</td>
                    <td className="py-1 pr-3">{f.tiltDeg}°</td>
                    <td className="py-1 pr-3">{fmt(results.perFaceKWp[i] || 0, 2)}</td>
                    <td className="py-1 pr-3">{fmt(inputs.perFaceGTI?.[i] || 0, 0)}</td>
                    <td className="py-1 pr-3">{fmt(inputs.perFaceYield?.[i] || 0, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Hauptinhalt --- */}
      <div ref={contentRef} className="space-y-6">
        {/* Inputs & Konstanten */}
        <div className="rounded-xl border">
          <div className="px-4 py-3 border-b font-medium">Eingaben & Konstanten</div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="[&_tr]:border-b [&_td]:py-2">
                <tr><td className="text-gray-500">Dachtyp</td><td>{inputs.roofType}</td></tr>
                <tr><td className="text-gray-500">Neigung (Standard)</td><td>{inputs.defaultTilt}°</td></tr>
                <tr><td className="text-gray-500">Modul</td><td>{inputs.module.name} ({inputs.module.wpPerModule} Wp)</td></tr>
                <tr><td className="text-gray-500">Paketierung</td><td>{inputs.packing.orientation}, Setback {inputs.packing.setbackM} m</td></tr>
                <tr><td className="text-gray-500">PR-Faktoren</td><td>Build {inputs.settings.buildFactor}, Shading {inputs.settings.shadingFactor}, System {inputs.settings.systemLossFactor}</td></tr>
                <tr><td className="text-gray-500">Degradation</td><td>{(inputs.settings.degradationPctPerYear*100).toFixed(2)} % / Jahr</td></tr>
                <tr><td className="text-gray-500">Horizont</td><td>{inputs.settings.horizonYears} Jahre</td></tr>
                <tr><td className="text-gray-500">Strompreis (Szenario)</td><td>{priceEUR.toFixed(2)} €/kWh</td></tr>
                <tr><td className="text-gray-500">Einspeisevergütung (Szenario)</td><td>{feedEUR.toFixed(2)} €/kWh</td></tr>
                <tr><td className="text-gray-500">Quelle Strahlung</td><td>{inputs.pvgisSource || '—'}</td></tr>
                <tr><td className="text-gray-500">CAPEX</td><td>{fmt(capex, 0)} € (kWp {capexKWp} €/kWp{inputs.batteryKWh ? ` + Batterie ${capexBatt} €/kWh` : ''})</td></tr>
                <tr><td className="text-gray-500">OPEX/Jahr</td><td>{fmt(opexYear, 0)} € ({( (inputs.econ.opexPctOfCapexPerYear ?? 0.01) * 100).toFixed(1)} % von CAPEX)</td></tr>
                <tr><td className="text-gray-500">Diskontsatz</td><td>{(discount*100).toFixed(1)} %</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sonnenintensität */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Sonnenintensität (GTI, gewichtet)</div>
            <div className="font-medium">
              {Number.isFinite(gti) ? `${fmt(gti, 0)} kWh/m²·a` : '—'}
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Deutschland-Richtwert (Vergleich)</div>
            <div className="font-medium">{fmt(DE_GTI_BASELINE)} kWh/m²·a</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Prognostizierte Jahresproduktion</div>
            <div className="font-medium">{fmt(basePV)} kWh/a</div>
          </div>
        </div>

        {/* Eigenverbrauch / Einspeisung */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Leistung Eigenverbrauch</div>
            <div className="font-medium">{fmt(noBatteryAdj.ev)} kWh/a</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">Leistung Einspeisung</div>
            <div className="font-medium">{fmt(noBatteryAdj.fi)} kWh/a</div>
          </div>
        </div>

        {/* Pies */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border p-4">
            <div className="mb-2 font-medium">Autarkiegrad</div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={[
                      { name: 'Autark', value: autarkiePct },
                      { name: 'Netzbezug', value: 100 - autarkiePct },
                    ]}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    <Cell fill={COLORS[0]} /><Cell fill={COLORS[1]} />
                  </Pie>
                  <ReTooltip /><ReLegend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 font-medium">Eigenverbrauchsquote</div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={[
                      { name: 'Eigenverbrauch', value: eigenPct },
                      { name: 'Einspeisung', value: 100 - eigenPct },
                    ]}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    <Cell fill={COLORS[0]} /><Cell fill={COLORS[1]} />
                  </Pie>
                  <ReTooltip /><ReLegend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cashflows */}
        <div className="rounded-xl border">
          <div className="px-4 py-3 border-b font-medium">Cashflows (mit Degradation & OPEX)</div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Jahr</th>
                  <th className="py-2 pr-3">PV [kWh]</th>
                  <th className="py-2 pr-3">Eigenverbrauch [kWh]</th>
                  <th className="py-2 pr-3">Einspeisung [kWh]</th>
                  <th className="py-2 pr-3">Gesparte Kosten [€]</th>
                  <th className="py-2 pr-3">Einspeisevergütung [€]</th>
                  <th className="py-2 pr-3">OPEX [€]</th>
                  <th className="py-2 pr-3">Summe [€]</th>
                </tr>
              </thead>
              <tbody>
                {cashRows.map((r) => (
                  <tr key={r.year} className="border-b">
                    <td className="py-1 pr-3">{r.year}</td>
                    <td className="py-1 pr-3">{fmt(r.pvKWh)}</td>
                    <td className="py-1 pr-3">{fmt(r.evKWh)}</td>
                    <td className="py-1 pr-3">{fmt(r.fiKWh)}</td>
                    <td className="py-1 pr-3">{fmt(r.savedEUR, 0)}</td>
                    <td className="py-1 pr-3">{fmt(r.feedEUR, 0)}</td>
                    <td className="py-1 pr-3">{fmt(r.opexEUR, 0)}</td>
                    <td className="py-1 pr-3 font-medium">{fmt(r.totalEUR, 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-2 pr-3 font-medium">Gesamt</td>
                  <td className="py-2 pr-3 font-medium">{fmt(totals.pvKWh)}</td>
                  <td className="py-2 pr-3"></td><td className="py-2 pr-3"></td>
                  <td className="py-2 pr-3 font-medium">{fmt(totals.savedEUR, 0)} €</td>
                  <td className="py-2 pr-3 font-medium">{fmt(totals.feedEUR, 0)} €</td>
                  <td className="py-2 pr-3"></td>
                  <td className="py-2 pr-3 font-bold">{fmt(totals.totalEUR, 0)} €</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* KPIs: NPV / IRR / LCOE */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">NPV (heutiger Gegenwert)</div>
            <div className={`font-bold ${npvEUR >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fmt(npvEUR, 0)} €
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">IRR (interner Zinsfuß)</div>
            <div className="font-bold">
              {irrPct == null ? '—' : `${irrPct.toFixed(2)} %`}
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-gray-500">LCOE (Stromgestehungskosten)</div>
            <div className="font-bold">
              {isFinite(lcoeEURperKWh) ? `${lcoeEURperKWh.toFixed(3)} €/kWh` : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
