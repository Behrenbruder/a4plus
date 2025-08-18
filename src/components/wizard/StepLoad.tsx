'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type StepLoadSubmit = {
  annualKnownKWh?: number;
  persons?: number;
};

type Props = {
  annualKnownKWh?: number;
  persons?: number;
  resolvedAnnualKWh?: number;
  onNext: (vals: StepLoadSubmit) => void;
};

export function StepLoad({ annualKnownKWh, persons, resolvedAnnualKWh, onNext }: Props) {
  const [mode, setMode] = useState<'known' | 'unknown'>(annualKnownKWh ? 'known' : 'unknown');
  const [kwh, setKwh] = useState<number | ''>(annualKnownKWh ?? '');
  const [p, setP] = useState<number>(persons ?? 2);

  useEffect(() => {
    if (typeof annualKnownKWh === 'number') {
      setMode('known');
      setKwh(annualKnownKWh);
      return;
    }
    setMode('unknown');
  }, [annualKnownKWh]);

  useEffect(() => {
    if (typeof persons === 'number') setP(persons);
  }, [persons]);

  const canSubmit = useMemo(() => {
    return mode === 'known' ? typeof kwh === 'number' && kwh > 0 : p > 0;
  }, [mode, kwh, p]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (mode === 'known' && typeof kwh === 'number') {
      onNext({ annualKnownKWh: kwh });
    } else {
      onNext({ persons: p });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === 'known'}
            onChange={() => setMode('known')}
          />
          <span>Ich kenne meinen Jahresverbrauch</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === 'unknown'}
            onChange={() => setMode('unknown')}
          />
          <span>Ich weiß es nicht (Personen im Haushalt)</span>
        </label>
      </div>

      {mode === 'known' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Jahresverbrauch (kWh/a)</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="number"
              min={0}
              value={kwh}
              onChange={(e) => setKwh(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              className="px-4 py-2 rounded-lg border bg-emerald-600 text-white disabled:opacity-50"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Übernehmen
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Personen im Haushalt</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
            >
              <option value={1}>1 Person</option>
              <option value={2}>2 Personen</option>
              <option value={3}>3 Personen</option>
              <option value={4}>4 Personen</option>
              <option value={5}>5+ Personen</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="px-4 py-2 rounded-lg border bg-emerald-600 text-white disabled:opacity-50"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Übernehmen
            </button>
          </div>
        </div>
      )}

      {typeof resolvedAnnualKWh === 'number' && (
        <p className="text-sm text-gray-600">
          Verwendete Annahme: <b>{resolvedAnnualKWh.toLocaleString()} kWh/a</b>
        </p>
      )}
    </div>
  );
}
