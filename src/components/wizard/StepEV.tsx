'use client';

import React, { useState } from 'react';

type Props = {
  value?: { kmPerYear: number; consumptionKWhPer100km: number; homeChargePercent: number };
  onChange?: (vals: { kmPerYear: number; consumptionKWhPer100km: number; homeChargePercent: number }) => void;
  onNext?: (vals: { kmPerYear: number; consumptionKWhPer100km: number; homeChargePercent: number }) => void;
};

export function StepEV({
  value = { kmPerYear: 0, consumptionKWhPer100km: 0, homeChargePercent: 0 },
  onChange,
  onNext,
}: Props) {
  const [kmPerYear, setKmPerYear] = useState<number>(value.kmPerYear);
  const [consumption, setConsumption] = useState<number>(value.consumptionKWhPer100km);
  const [homeCharge, setHomeCharge] = useState<number>(value.homeChargePercent);

  const enabled = kmPerYear > 0 && consumption > 0 && homeCharge > 0;

  const toggle = () => {
    if (enabled) {
      setKmPerYear(0);
      setConsumption(0);
      setHomeCharge(0);
      onChange?.({ kmPerYear: 0, consumptionKWhPer100km: 0, homeChargePercent: 0 });
      onNext?.({ kmPerYear: 0, consumptionKWhPer100km: 0, homeChargePercent: 0 });
    } else {
      const vals = { kmPerYear: 15000, consumptionKWhPer100km: 15, homeChargePercent: 80 };
      setKmPerYear(vals.kmPerYear);
      setConsumption(vals.consumptionKWhPer100km);
      setHomeCharge(vals.homeChargePercent);
      onChange?.(vals);
      onNext?.(vals);
    }
  };

  const update = (newKm: number, newConsumption: number, newHome: number) => {
    const vals = { kmPerYear: newKm, consumptionKWhPer100km: newConsumption, homeChargePercent: newHome };
    onChange?.(vals);
    onNext?.(vals);
  };

  return (
    <div className="space-y-4">
      {/* Switch */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
        <label className="text-sm font-medium">E-Auto berücksichtigen?</label>
        <button
          type="button"
          aria-pressed={enabled}
          onClick={toggle}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            enabled ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Felder */}
      {enabled && (
        <div className="space-y-4 p-4 rounded-xl bg-gray-50">
          {/* km/Jahr */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Fahrleistung pro Jahr (km)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={kmPerYear}
              onChange={(e) => {
                const v = Number(e.target.value);
                const safe = Number.isFinite(v) ? v : 15000;
                setKmPerYear(safe);
                update(safe, consumption, homeCharge);
              }}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Verbrauch */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Verbrauch (kWh/100 km)
            </label>
            <input
              type="number"
              min={5}
              step={0.1}
              value={consumption}
              onChange={(e) => {
                const v = Number(e.target.value);
                const safe = Number.isFinite(v) ? v : 15;
                setConsumption(safe);
                update(kmPerYear, safe, homeCharge);
              }}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Home-Ladeanteil */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Anteil Heimladung (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={homeCharge}
              onChange={(e) => {
                const v = Number(e.target.value);
                const safe = Number.isFinite(v) ? v : 80;
                setHomeCharge(safe);
                update(kmPerYear, consumption, safe);
              }}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StepEV;
