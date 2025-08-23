'use client';

import React, { useState, useRef } from 'react';
import { parseCSVLoadProfile, validateLoadProfile } from '@/lib/pvcalc';
import type { CustomLoadProfile } from '@/lib/types';

type Props = {
  onImport: (profile: CustomLoadProfile) => void;
  onUseStandard: () => void;
  currentProfile?: CustomLoadProfile | null;
};

export default function StepLoadImport({ onImport, onUseStandard, currentProfile }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ filename: string; dataPoints: number; annualKWh: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Bitte wählen Sie eine CSV-Datei aus.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const content = await file.text();
      const data = parseCSVLoadProfile(content);

      if (!data) {
        setError('CSV-Datei konnte nicht geparst werden. Überprüfen Sie das Format.');
        return;
      }

      const validation = validateLoadProfile(data);
      if (!validation.valid) {
        setError(`Validierungsfehler: ${validation.errors.join(', ')}`);
        return;
      }

      const annualKWh = data.reduce((a, b) => a + b, 0);
      setPreview({
        filename: file.name,
        dataPoints: data.length,
        annualKWh: Math.round(annualKWh)
      });

      const profile: CustomLoadProfile = {
        source: 'CUSTOM',
        data,
        filename: file.name,
        uploadDate: new Date()
      };

      onImport(profile);
    } catch (err) {
      setError('Fehler beim Lesen der Datei: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Lastprofil importieren
        </h3>
        <p className="text-sm text-gray-600">
          Laden Sie Ihr eigenes 8760-Stunden Lastprofil hoch oder verwenden Sie ein Standardprofil
        </p>
      </div>

      {/* Aktuelles Profil anzeigen */}
      {currentProfile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">Aktuelles Profil</span>
          </div>
          <div className="text-sm text-green-700">
            <div>Datei: {currentProfile.filename || 'Unbekannt'}</div>
            <div>Datenpunkte: {currentProfile.data.length.toLocaleString()}</div>
            <div>Jahresverbrauch: {Math.round(currentProfile.data.reduce((a, b) => a + b, 0)).toLocaleString()} kWh</div>
            {currentProfile.uploadDate && (
              <div>Hochgeladen: {currentProfile.uploadDate.toLocaleDateString('de-DE')}</div>
            )}
          </div>
        </div>
      )}

      {/* Upload-Bereich */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Datei wird verarbeitet...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📊</div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                CSV-Datei hier ablegen oder auswählen
              </p>
              <p className="text-sm text-gray-600 mb-4">
                8760 Stunden-Werte (ein Jahr), Trennzeichen: Komma, Semikolon oder Tab
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Datei auswählen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fehler anzeigen */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-500">⚠️</div>
            <span className="text-sm font-medium text-red-800">Fehler</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Vorschau */}
      {preview && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-blue-500">✅</div>
            <span className="text-sm font-medium text-blue-800">Datei erfolgreich geladen</span>
          </div>
          <div className="text-sm text-blue-700">
            <div>Datei: {preview.filename}</div>
            <div>Datenpunkte: {preview.dataPoints.toLocaleString()}</div>
            <div>Jahresverbrauch: {preview.annualKWh.toLocaleString()} kWh</div>
          </div>
        </div>
      )}

      {/* Format-Hinweise */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Format-Anforderungen:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• CSV-Datei mit 8760 Werten (ein Jahr, stündlich)</li>
          <li>• Trennzeichen: Komma (,), Semikolon (;) oder Tab</li>
          <li>• Dezimaltrennzeichen: Punkt (.) oder Komma (,)</li>
          <li>• Werte in kWh pro Stunde</li>
          <li>• Kommentarzeilen mit # oder // werden ignoriert</li>
          <li>• Beispiel: 0.5;0.3;0.4;...</li>
        </ul>
      </div>

      {/* Aktionen */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onUseStandard}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Standardprofil verwenden
        </button>
        
        {currentProfile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Neues Profil hochladen
          </button>
        )}
      </div>
    </div>
  );
}
