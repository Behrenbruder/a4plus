'use client';

import React, { useState } from 'react';

type Props = {
  value?: number; // Kapazität in kWh, 0 = kein Speicher
  onChange?: (capacityKWh: number) => void;
  onNext?: (capacityKWh: number) => void;
};

export function StepBattery({ value = 0, onChange, onNext }: Props) {
  const [capacity, setCapacity] = useState<number>(value);

  const toggle = () => {
    const newCap = capacity > 0 ? 0 : 10; // Standardwert 10 kWh bei Aktivierung
    setCapacity(newCap);
    onChange?.(newCap);
    onNext?.(newCap);
  };

  const updateCapacity = (newCap: number) => {
    setCapacity(newCap);
    onChange?.(newCap);
    onNext?.(newCap);
  };

  return (
    <div className="space-y-4">
      {/* Switch */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
        <label className="text-sm font-medium">Speicher hinzufügen?</label>
        <button
          type="button"
          aria-pressed={capacity > 0}
          onClick={toggle}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            capacity > 0 ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              capacity > 0 ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Kapazität */}
      {capacity > 0 && (
        <div className="p-4 rounded-xl bg-gray-50">
          <label className="block text-sm text-gray-600 mb-1">
            Speicherkapazität (kWh)
          </label>
          <input
            type="number"
            min={1}
            step={0.5}
            value={capacity}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateCapacity(Number.isFinite(v) ? v : 10);
            }}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

export default StepBattery;
