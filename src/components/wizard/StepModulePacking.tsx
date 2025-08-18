'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { RoofFace } from '@/lib/types';
import type { RoofType } from '@/components/wizard/StepRoof';

/** Feste Modulgeometrie */
const MODULE_LENGTH_M = 1.75;
const MODULE_WIDTH_M = 1.10;
const MODULE_AREA_M2 = MODULE_LENGTH_M * MODULE_WIDTH_M;

/** Auswahloptionen */
const WATTPEAK_OPTIONS = [400, 420, 430, 450];
const EFFICIENCY_OPTIONS = [19.5, 20.0, 20.5, 21.0, 21.5, 22.0];

/** kleine Helfer */
const RAD = Math.PI / 180;
const cos = (deg: number) => Math.cos(deg * RAD);

/** Heuristik: Ist es ein Preset? (keine Polygonpunkte & spezielle ID) */
function isPresetFace(f: RoofFace) {
  const isPoly = Array.isArray((f as any).polygon) && (f as any).polygon.length >= 3;
  return !isPoly && typeof f.id === 'string' && f.id.startsWith('preset-');
}

/** Nutzbare Fläche ermitteln */
function usableAreaM2(face: RoofFace): number {
  const tilt = face.tiltDeg || 0;
  const buildFactor =
    (face as any).buildFactor !== undefined ? (face as any).buildFactor : 0.7;

  if (isPresetFace(face)) {
    const base = face.areaHorizM2 || 0;
    return Math.max(0, base * buildFactor);
  }

  const baseHoriz = face.areaHorizM2 || 0;
  const slope = cos(tilt) > 1e-6 ? baseHoriz / cos(tilt) : baseHoriz;
  return Math.max(0, slope * buildFactor);
}

/** Module auf Fläche */
function modulesOnFace(face: RoofFace) {
  const usable = usableAreaM2(face);
  return Math.max(0, Math.floor(usable / MODULE_AREA_M2));
}

type Props = {
  faces: RoofFace[];
  roofType: RoofType;
  onNext?: (res: {
    perFace: Array<{ id: string; kWp: number; modules: number }>;
    total: { kWp: number; modules?: number };
    scheme: string;
    wp: number;
    efficiency: number;
  }) => void;
};

export function StepModulePacking({ faces, roofType, onNext }: Props) {
  const [wp, setWp] = useState<number>(430);
  const [eff, setEff] = useState<number>(21.0);

  const perFaceModules = useMemo(() => {
    if (!faces?.length) return [];
    return faces.map((f) => modulesOnFace(f));
  }, [faces]);

  const perFaceResult = useMemo(
    () =>
      faces.map((f, i) => {
        const modules = perFaceModules[i] ?? 0;
        const kWp = (modules * wp) / 1000;
        return { id: String(f.id), kWp, modules };
      }),
    [faces, perFaceModules, wp]
  );

  const totalModules = useMemo(
    () => perFaceModules.reduce((s, v) => s + v, 0),
    [perFaceModules]
  );

  const totalKWp = useMemo(
    () => perFaceResult.reduce((s, r) => s + r.kWp, 0),
    [perFaceResult]
  );

  // onNext per Ref (sonst Endlos-Schleife, wenn Parent jedes Render eine neue Funktion gibt)
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  // onNext live senden – aber stabil ohne onNext in deps
  useEffect(() => {
    onNextRef.current?.({
      perFace: perFaceResult,
      total: { kWp: totalKWp, modules: totalModules },
      scheme: 'area-only',
      wp,
      efficiency: eff,
    });
  }, [perFaceResult, totalKWp, totalModules, wp, eff]);

  return (
    <div className="space-y-6">
      {/* Auswahllisten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600">Modulleistung (Wp)</label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            value={wp}
            onChange={(e) => setWp(Number(e.target.value))}
          >
            {WATTPEAK_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v} Wp
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Modul‑Effizienz</label>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            value={eff}
            onChange={(e) => setEff(Number(e.target.value))}
          >
            {EFFICIENCY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v.toFixed(1)} %
              </option>
            ))}
          </select>
        </div>

        <div className="hidden md:block" />
      </div>

      {/* Ergebnis je Dachfläche */}
      <div>
        <div className="text-base font-semibold mb-2">Ergebnis je Dachfläche</div>
        {faces.length === 0 && (
          <div className="text-sm text-gray-500">Noch keine Dachflächen markiert.</div>
        )}

        <div className="space-y-3">
          {faces.map((f, i) => {
            const modules = perFaceModules[i] ?? 0;
            const kWp = (modules * wp) / 1000;
            return (
              <div
                key={f.id}
                className="p-3 rounded-xl bg-gray-50 grid grid-cols-2 md:grid-cols-6 gap-3 items-end"
              >
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-600">Dachfläche</div>
                  <div className="font-medium">{f.name || `Dachfläche ${i + 1}`}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Module (geschätzt)</div>
                  <div className="font-medium">{modules}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">kWp (geschätzt)</div>
                  <div className="font-medium">{kWp.toFixed(2)} kWp</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gesamt */}
      <div className="p-4 rounded-xl bg-gray-50 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Gesamt (alle markierten Flächen)</div>
          <div className="text-sm">
            Module: <b>{totalModules}</b>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">Gesamt kWp</div>
          <div className="text-2xl font-bold">{totalKWp.toFixed(2)} kWp</div>
        </div>
      </div>
    </div>
  );
}

export default StepModulePacking;
