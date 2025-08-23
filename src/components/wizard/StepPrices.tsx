'use client';

import { useState } from 'react';

export type StepPricesSubmit = {
  priceCt: number;
  feedinCt: number;
  capexPerKWpEUR: number;
  capexBatteryPerKWhEUR: number;
};

export function StepPrices({
  priceCt,
  feedinCt,
  capexPerKWpEUR,
  capexBatteryPerKWhEUR,
  onNext,
}: {
  priceCt?: number;
  feedinCt?: number;
  capexPerKWpEUR?: number;
  capexBatteryPerKWhEUR?: number;
  onNext: (vals: StepPricesSubmit) => void;
}) {
  const [values, setValues] = useState({
    priceCt: priceCt ?? 35,
    feedinCt: feedinCt ?? 8.2,
    capexPerKWpEUR: capexPerKWpEUR ?? 1350,
    capexBatteryPerKWhEUR: capexBatteryPerKWhEUR ?? 800,
  });

  const handleChange = (field: keyof typeof values, value: number) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onNext(newValues);
  };

  return (
    <div className="space-y-6">
      {/* Strompreise */}
      <div>
        <h3 className="text-lg font-medium mb-4">Strompreise</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Strompreis (ct/kWh)</label>
            <input
              type="number"
              step="0.1"
              value={values.priceCt}
              onChange={(e) => handleChange('priceCt', Number(e.target.value || 0))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Einspeisevergütung (ct/kWh)</label>
            <input
              type="number"
              step="0.1"
              value={values.feedinCt}
              onChange={(e) => handleChange('feedinCt', Number(e.target.value || 0))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* CAPEX Preise */}
      <div>
        <h3 className="text-lg font-medium mb-4">Investitionskosten (CAPEX)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">PV-Anlage (€/kWp)</label>
            <input
              type="number"
              step="50"
              value={values.capexPerKWpEUR}
              onChange={(e) => handleChange('capexPerKWpEUR', Number(e.target.value || 0))}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Inkl. Module, Wechselrichter, Montage</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Batteriespeicher (€/kWh)</label>
            <input
              type="number"
              step="50"
              value={values.capexBatteryPerKWhEUR}
              onChange={(e) => handleChange('capexBatteryPerKWhEUR', Number(e.target.value || 0))}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Inkl. Batterie, BMS, Installation</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Tipp: Die Werte werden automatisch gespeichert, wenn du sie änderst.
      </p>
    </div>
  );
}
