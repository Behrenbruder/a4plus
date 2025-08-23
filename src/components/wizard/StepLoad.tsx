'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { CustomLoadProfile, HouseholdScenario } from '@/lib/types';
import { getScenarioDisplayName } from '@/lib/loadProfiles';

export type StepLoadSubmit = {
  annualKnownKWh?: number;
  persons?: number;
  customProfile?: CustomLoadProfile;
  scenario?: HouseholdScenario;
};

type Props = {
  annualKnownKWh?: number;
  persons?: number;
  resolvedAnnualKWh?: number;
  customProfile?: CustomLoadProfile;
  scenario?: HouseholdScenario;
  onNext: (vals: StepLoadSubmit) => void;
};

export function StepLoad({ annualKnownKWh, persons, resolvedAnnualKWh, customProfile, scenario, onNext }: Props) {
  const [mode, setMode] = useState<'known' | 'unknown' | 'csv' | 'scenario'>(
    customProfile ? 'csv' : scenario ? 'scenario' : annualKnownKWh ? 'known' : 'unknown'
  );
  const [kwh, setKwh] = useState<number | ''>(annualKnownKWh ?? '');
  const [p, setP] = useState<number>(persons ?? 2);
  const [selectedScenario, setSelectedScenario] = useState<HouseholdScenario>(scenario ?? 'household_only');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<number[] | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (customProfile) {
      setMode('csv');
      setCsvData(customProfile.data);
      return;
    }
    if (typeof annualKnownKWh === 'number') {
      setMode('known');
      setKwh(annualKnownKWh);
      return;
    }
    setMode('unknown');
  }, [annualKnownKWh, customProfile]);

  useEffect(() => {
    if (typeof persons === 'number') setP(persons);
  }, [persons]);

  const canSubmit = useMemo(() => {
    if (mode === 'known') return typeof kwh === 'number' && kwh > 0;
    if (mode === 'unknown') return p > 0;
    if (mode === 'csv') return csvData !== null && csvData.length === 8760;
    if (mode === 'scenario') return true;
    return false;
  }, [mode, kwh, p, csvData]);

  const parseCsvFile = async (file: File): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').map(line => line.trim()).filter(line => line);
          
          // Try to parse as CSV (comma or semicolon separated)
          let values: number[] = [];
          
          // Check if it's a single column or multiple columns
          const firstLine = lines[0];
          if (firstLine.includes(',') || firstLine.includes(';')) {
            // Multi-column CSV - take first column that contains numbers
            const separator = firstLine.includes(',') ? ',' : ';';
            for (const line of lines) {
              const columns = line.split(separator);
              for (const col of columns) {
                const num = parseFloat(col.replace(',', '.'));
                if (!isNaN(num)) {
                  values.push(Math.max(0, num)); // Ensure non-negative
                  break;
                }
              }
            }
          } else {
            // Single column
            values = lines.map(line => {
              const num = parseFloat(line.replace(',', '.'));
              return isNaN(num) ? 0 : Math.max(0, num);
            });
          }

          if (values.length !== 8760) {
            reject(new Error(`CSV muss genau 8760 Stundenwerte enthalten (gefunden: ${values.length})`));
            return;
          }

          // Validate that values are reasonable (not all zero, not extremely high)
          const sum = values.reduce((a, b) => a + b, 0);
          if (sum === 0) {
            reject(new Error('CSV enthält nur Nullwerte'));
            return;
          }

          const maxValue = Math.max(...values);
          if (maxValue > 100) { // More than 100 kW seems unrealistic for household
            reject(new Error('CSV enthält unrealistisch hohe Werte (>100 kW)'));
            return;
          }

          resolve(values);
        } catch (error) {
          reject(new Error('Fehler beim Parsen der CSV-Datei'));
        }
      };
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvError(null);
    setIsProcessing(true);

    try {
      const data = await parseCsvFile(file);
      setCsvData(data);
      setCsvError(null);
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : 'Unbekannter Fehler');
      setCsvData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    
    if (mode === 'known' && typeof kwh === 'number') {
      onNext({ annualKnownKWh: kwh });
    } else if (mode === 'unknown') {
      onNext({ persons: p });
    } else if (mode === 'scenario') {
      onNext({ scenario: selectedScenario });
    } else if (mode === 'csv' && csvData && csvFile) {
      const customProfile: CustomLoadProfile = {
        source: 'CUSTOM',
        data: csvData,
        filename: csvFile.name,
        uploadDate: new Date(),
      };
      onNext({ customProfile });
    }
  };

  const scenarios: HouseholdScenario[] = [
    'household_only',
    'household_pv',
    'household_pv_storage',
    'household_ev',
    'household_pv_ev',
    'household_pv_ev_storage'
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 mb-4">
        <div className="text-sm text-amber-800">
          <strong>Wichtiger Hinweis:</strong> Geben Sie hier nur den Haushaltsverbrauch ohne Wärmepumpe und E-Auto an. 
          Diese werden in den späteren Schritten separat erfasst.
        </div>
      </div>

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
          <span>Personen im Haushalt</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === 'csv'}
            onChange={() => setMode('csv')}
          />
          <span>Eigenes Lastprofil (CSV)</span>
        </label>
      </div>


      {mode === 'known' && (
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
      )}

      {mode === 'unknown' && (
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

      {mode === 'csv' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">
                CSV-Datei mit 8760 Stundenwerten (kW)
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <div className="text-xs text-gray-500 mt-1">
                Unterstützte Formate: CSV mit Komma oder Semikolon als Trennzeichen
              </div>
            </div>
            <div className="flex items-end">
              <button
                className="px-4 py-2 rounded-lg border bg-emerald-600 text-white disabled:opacity-50"
                disabled={!canSubmit || isProcessing}
                onClick={handleSubmit}
              >
                {isProcessing ? 'Verarbeite...' : 'Übernehmen'}
              </button>
            </div>
          </div>

          {csvError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="text-sm text-red-700">
                <strong>Fehler:</strong> {csvError}
              </div>
            </div>
          )}

          {csvData && csvFile && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-sm text-green-700">
                <strong>✓ Erfolgreich geladen:</strong> {csvFile.name}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {csvData.length.toLocaleString()} Stundenwerte, 
                Jahresverbrauch: {Math.round(csvData.reduce((a, b) => a + b, 0)).toLocaleString()} kWh
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Hinweise zum CSV-Format:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Die Datei muss genau 8760 Zeilen enthalten (ein Jahr mit Stundenwerten)</li>
                <li>Jede Zeile sollte einen Leistungswert in kW enthalten</li>
                <li>Dezimaltrennzeichen: Punkt oder Komma</li>
                <li>Bei mehreren Spalten wird die erste numerische Spalte verwendet</li>
                <li>Negative Werte werden auf 0 gesetzt</li>
              </ul>
            </div>
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
