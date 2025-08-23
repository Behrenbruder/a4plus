'use client';

import React, { useState } from 'react';

export type HeatPumpConfig = {
  hasHeatPump: boolean;
  annualConsumptionKWh: number;
};

type Props = {
  value?: HeatPumpConfig;
  onNext: (config: HeatPumpConfig) => void;
};

const DEFAULT_CONFIG: HeatPumpConfig = {
  hasHeatPump: false,
  annualConsumptionKWh: 4000, // Typischer elektrischer Verbrauch einer Wärmepumpe
};

export function StepHeatPump({ value, onNext }: Props) {
  const [config, setConfig] = useState<HeatPumpConfig>(value || DEFAULT_CONFIG);

  const toggle = () => {
    const newConfig = config.hasHeatPump 
      ? { hasHeatPump: false, annualConsumptionKWh: 0 }
      : { hasHeatPump: true, annualConsumptionKWh: 4000 };
    
    setConfig(newConfig);
    onNext(newConfig);
  };

  const updateConsumption = (consumption: number) => {
    const newConfig = { ...config, annualConsumptionKWh: consumption };
    setConfig(newConfig);
    onNext(newConfig);
  };

  return (
    <div className="space-y-4">
      {/* Switch */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
        <label className="text-sm font-medium">Wärmepumpe berücksichtigen?</label>
        <button
          type="button"
          aria-pressed={config.hasHeatPump}
          onClick={toggle}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            config.hasHeatPump ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.hasHeatPump ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Verbrauch */}
      {config.hasHeatPump && (
        <div className="p-4 rounded-xl bg-gray-50">
          <label className="block text-sm text-gray-600 mb-1">
            Jährlicher Stromverbrauch (kWh/Jahr)
          </label>
          <input
            type="number"
            min={0}
            step={500}
            value={config.annualConsumptionKWh}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateConsumption(Number.isFinite(v) ? v : 4000);
            }}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Typisch: 3.000-6.000 kWh für Einfamilienhaus
          </p>
        </div>
      )}
    </div>
  );
}
