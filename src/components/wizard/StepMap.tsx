'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ensureGoogleMaps } from '@/lib/googleMaps';
import type { RoofFace, LatLng } from '@/lib/types';

type Mode = 'preset' | 'map';

/** Zusätzliche Felder, die wir lokal an ein Face hängen dürfen */
type FaceExtras = {
  buildFactor?: number;
  shadingFactor?: number;
  isPreset?: boolean;  // <— wichtig für Anzeige/Logik
};

type Props = {
  center: LatLng;
  defaultTilt: number;
  faces: RoofFace[];
  onFacesChange: (faces: RoofFace[]) => void;
};

const PRESETS_M2 = [40, 60, 80];

const ORIENTATIONS = [
  { label: 'Süd', value: 0 },
  { label: 'Südost', value: -45 },
  { label: 'Ost', value: -90 },
  { label: 'Nordost', value: -135 },
  { label: 'Nord', value: 180 },
  { label: 'Nordwest', value: 135 },
  { label: 'West', value: 90 },
  { label: 'Südwest', value: 45 },
];

const FACE_COLORS = [
  { fill: '#FDE68A', stroke: '#F59E0B' },
  { fill: '#BFDBFE', stroke: '#3B82F6' },
  { fill: '#C7F9CC', stroke: '#10B981' },
  { fill: '#FBCFE8', stroke: '#EC4899' },
  { fill: '#FCA5A5', stroke: '#EF4444' },
  { fill: '#DDD6FE', stroke: '#8B5CF6' },
];

const DEFAULT_FACE_BUILD = 0.70;
const DEFAULT_FACE_SHADING = 0.95;

const deg2rad = (d: number) => (d * Math.PI) / 180;
const deg = (x: number) => Math.max(-180, Math.min(180, Math.round(x)));

function horizToSlopeArea(areaHorizM2: number, tiltDeg: number) {
  const c = Math.cos(deg2rad(tiltDeg));
  return c > 0.001 ? areaHorizM2 / c : areaHorizM2;
}

export function StepMap({
  center,
  defaultTilt,
  faces,
  onFacesChange,
}: Props) {
  const [mode, setMode] = useState<Mode>('map');
  const [preset, setPreset] = useState<number>(PRESETS_M2[0]);
  const [azimuthDeg, setAzimuthDeg] = useState<number>(0); // Süd

  /** Preset übernehmen – isPreset: true, areaHorizM2 = reale nutzbare Vorgabe */
  const applyPresetImmediate = (m2: number) => {
    setMode('preset');
    setPreset(m2);

    const face: RoofFace & FaceExtras = {
      id: `preset-${m2}`,
      name: `Dachfläche (Preset ${m2} m²)`,
      azimuthDeg: deg(azimuthDeg),
      tiltDeg: defaultTilt,
      areaHorizM2: m2,       // <- wird als "reale Fläche" geführt
      polygon: [],
      buildFactor: DEFAULT_FACE_BUILD,
      shadingFactor: DEFAULT_FACE_SHADING,
      isPreset: true,
    };
    onFacesChange([face as unknown as RoofFace]);
  };

  /** Preset live mitführen (Titel/Ausrichtung/Neigung/Fläche) */
  useEffect(() => {
    if (mode !== 'preset') return;
    const singlePreset =
      faces.length === 1 && (faces[0].id?.startsWith?.('preset-') ?? false);

    if (singlePreset) {
      const f0 = faces[0] as RoofFace & FaceExtras;
      const updated: RoofFace & FaceExtras = {
        ...f0,
        name: `Dachfläche (Preset ${preset} m²)`,
        azimuthDeg: deg(azimuthDeg),
        tiltDeg: defaultTilt,
        areaHorizM2: preset,       // <- unverändert als reale Fläche
        polygon: [],
        buildFactor: f0.buildFactor ?? DEFAULT_FACE_BUILD,
        shadingFactor: f0.shadingFactor ?? DEFAULT_FACE_SHADING,
        isPreset: true,
      };
      onFacesChange([updated as unknown as RoofFace]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, preset, azimuthDeg, defaultTilt]);

  // Patch Helper
  const patchFace = (
    id: string,
    patch: Partial<RoofFace & FaceExtras>
  ) => {
    const next = (faces as (RoofFace & FaceExtras)[]).map((f) =>
      f.id === id ? ({ ...f, ...patch } as RoofFace & FaceExtras) : f
    );
    onFacesChange(next as unknown as RoofFace[]);
  };

  return (
    <div className="space-y-6">
      {/* Auswahl: Map zuerst, dann Presets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          className={`px-4 py-3 rounded-xl border text-center transition ${
            mode === 'map'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => setMode('map')}
        >
          Per Satellitenbild bemessen
        </button>

        {PRESETS_M2.map((m2) => (
          <button
            key={m2}
            className={`px-4 py-3 rounded-xl border text-center transition ${
              mode === 'preset' && preset === m2
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => applyPresetImmediate(m2)}
          >
            ca. {m2} m²
          </button>
        ))}
      </div>

      {/* Preset-Parameter (keine gesonderte Flächen-Differenzierung) */}
      {mode === 'preset' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <div className="text-sm text-gray-600">Ausgewählte Größe</div>
            <div className="text-xl font-semibold">≈ {preset} m²</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Ausrichtung</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={azimuthDeg}
              onChange={(e) => setAzimuthDeg(Number(e.target.value))}
            >
              {ORIENTATIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Map-Modus */}
      {mode === 'map' && (
        <MapDrawer
          center={center}
          defaultTilt={defaultTilt}
          faces={faces}
          onFacesChange={onFacesChange}
        />
      )}

      {/* Liste der Flächen */}
      {faces.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Dachflächen – individuelle Einstellungen</div>

          {(faces as (RoofFace & FaceExtras)[]).map((f, i) => {
            const buildFactor = f.buildFactor ?? DEFAULT_FACE_BUILD;
            const shadingFactor = f.shadingFactor ?? DEFAULT_FACE_SHADING;

            const isPreset = !!f.isPreset;
            const slopeArea = isPreset
              ? (f.areaHorizM2 || 0)               // Preset: reale Fläche zeigen
              : horizToSlopeArea(f.areaHorizM2 || 0, f.tiltDeg || 0);

            return (
              <div
                key={f.id}
                className="p-3 rounded-xl bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-3"
              >
                <div className="md:col-span-3">
                  <div className="text-xs text-gray-600">Name</div>
                  <div className="font-medium flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ background: FACE_COLORS[i % FACE_COLORS.length].fill }}
                    />
                    {f.name || `Dachfläche ${i + 1}`}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600">Ausrichtung</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={f.azimuthDeg}
                    onChange={(e) => patchFace(f.id, { azimuthDeg: Number(e.target.value) })}
                  >
                    {ORIENTATIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600">Neigung (°)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={Math.round(f.tiltDeg)}
                    onChange={(e) =>
                      patchFace(f.id, {
                        tiltDeg: Math.max(0, Math.min(60, Number(e.target.value))),
                      })
                    }
                  />
                </div>

                {/* Preset: nur eine Fläche anzeigen; Polygon: horiz + geneigt */}
                {isPreset ? (
                  <div className="md:col-span-4">
                    <div className="text-xs text-gray-600">Fläche</div>
                    <div>{(f.areaHorizM2 || 0).toFixed(1)} m²</div>
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-600">Fläche (horiz.)</div>
                      <div>{(f.areaHorizM2 || 0).toFixed(1)} m²</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-600">Fläche (geneigt)</div>
                      <div>{slopeArea.toFixed(1)} m²</div>
                    </div>
                  </>
                )}

                <div className="md:col-span-1 flex items-end justify-end">
                  <button
                    className="px-3 py-2 rounded-lg border"
                    onClick={() => onFacesChange(faces.filter((x) => x.id !== f.id))}
                  >
                    Entfernen
                  </button>
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs text-gray-600">Bebauungsfaktor</label>
                  <input
                    type="range"
                    min={0.60}
                    max={0.90}
                    step={0.01}
                    value={buildFactor}
                    onChange={(e) => patchFace(f.id, { buildFactor: Number(e.target.value) })}
                    className="w-full accent-black"
                  />
                  <div className="text-xs">{Math.round(buildFactor * 100)}%</div>
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs text-gray-600">Beschattungsfaktor</label>
                  <input
                    type="range"
                    min={0.80}
                    max={1.0}
                    step={0.01}
                    value={shadingFactor}
                    onChange={(e) => patchFace(f.id, { shadingFactor: Number(e.target.value) })}
                    className="w-full accent-black"
                  />
                  <div className="text-xs">{Math.round(shadingFactor * 100)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Map Drawer (unverändert in der Funktionalität) ---------------- */

function MapDrawer({
  center,
  defaultTilt,
  faces,
  onFacesChange,
}: {
  center: LatLng;
  defaultTilt: number;
  faces: RoofFace[];
  onFacesChange: (faces: RoofFace[]) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const drawingRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const overlaysRef = useRef<google.maps.Polygon[]>([]);
  const facesRef = useRef<RoofFace[]>(faces);
  facesRef.current = faces;

  const [showIntro, setShowIntro] = useState(true);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [drawingActive, setDrawingActive] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await ensureGoogleMaps(['drawing', 'geometry']);
      if (!mounted || !mapDivRef.current) return;

      const map = new google.maps.Map(mapDivRef.current, {
        center,
        zoom: 19,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        tilt: 0,
        fullscreenControl: false,
        streetViewControl: false,
        rotateControl: false,
        mapTypeControl: false,
        gestureHandling: 'greedy',
      });
      mapRef.current = map;

      const drawing = new google.maps.drawing.DrawingManager({
        drawingControl: false,
        drawingMode: null,
        polygonOptions: {
          fillColor: '#4285F4',
          fillOpacity: 0.25,
          strokeColor: '#4285F4',
          strokeOpacity: 0.95,
          strokeWeight: 2,
          clickable: false,
          editable: false,
          draggable: false,
          zIndex: 2,
        },
      });
      drawing.setMap(map);
      drawingRef.current = drawing;

      google.maps.event.addListener(
        drawing,
        'overlaycomplete',
        (evt: google.maps.drawing.OverlayCompleteEvent) => {
          if (evt.type !== google.maps.drawing.OverlayType.POLYGON) return;

          drawing.setDrawingMode(null);
          setDrawingActive(false);

          const poly = evt.overlay as google.maps.Polygon;
          overlaysRef.current.push(poly);

          const idx = facesRef.current.length;
          const colors = FACE_COLORS[idx % FACE_COLORS.length];
          poly.setOptions({
            fillColor: colors.fill,
            strokeColor: colors.stroke,
            fillOpacity: 0.35,
            strokeOpacity: 0.95,
            zIndex: 2,
          });

          const path = poly.getPath().getArray();
          const areaHoriz =
            Math.abs(google.maps.geometry?.spherical?.computeArea(path) || 0);
          const az = estimateAzimuthFromPolygon(path);

          const newFace = {
            id: `F${Date.now()}`,
            name: `Dachfläche ${idx + 1}`,
            azimuthDeg: az,
            tiltDeg: defaultTilt,
            areaHorizM2: areaHoriz,
            polygon: path.map((p) => ({ lat: p.lat(), lng: p.lng() })),
            buildFactor: DEFAULT_FACE_BUILD,
            shadingFactor: DEFAULT_FACE_SHADING,
          } as RoofFace & FaceExtras;

          onFacesChange([...(facesRef.current as (RoofFace & FaceExtras)[]), newFace] as unknown as RoofFace[]);
          setShowNextPrompt(true);
        }
      );
    })();

    return () => {
      mounted = false;
      overlaysRef.current.forEach((p) => p.setMap(null));
      overlaysRef.current = [];
      drawingRef.current?.setMap(null);
      drawingRef.current = null;
      mapRef.current = null;
    };
  }, [center, defaultTilt, onFacesChange]);

  const startDrawing = () => {
    setShowIntro(false);
    if (!drawingRef.current) return;
    drawingRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    setDrawingActive(true);
  };

  const handleWeiter = () => {
    setShowNextPrompt(false);
    setTimeout(() => {
      drawingRef.current?.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setDrawingActive(true);
    }, 80);
  };

  const handleNein = () => {
    setShowNextPrompt(false);
    drawingRef.current?.setDrawingMode(null);
    setDrawingActive(false);
  };

  const addAnother = () => {
    setShowNextPrompt(false);
    setTimeout(() => {
      drawingRef.current?.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setDrawingActive(true);
    }, 40);
  };

  return (
    <div className="relative">
      <div
        ref={mapDivRef}
        style={{ width: '100%', height: 420, borderRadius: 16 }}
        className="overflow-hidden"
      />

      {showIntro && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md text-center">
            <h3 className="text-lg font-semibold mb-2">Bitte einzelne Dachflächen markieren</h3>
            <p className="text-sm text-gray-600 mb-4">
              Zeichnen Sie jede Dachfläche als Polygon direkt auf der Karte.
            </p>
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
              onClick={startDrawing}
            >
              Los geht’s
            </button>
          </div>
        </div>
      )}

      {showNextPrompt && (
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-[min(92vw,460px)] text-center">
            <div className="text-base font-semibold mb-1">Weitere Dachfläche einzeichnen?</div>
            <p className="text-sm text-gray-600 mb-4">
              Bereits markierte Flächen bleiben sichtbar (in unterschiedlichen Farben).
            </p>
            <div className="flex items-center justify-center gap-2">
              <button className="px-3 py-2 rounded-lg border" onClick={handleNein}>
                Nein
              </button>
              <button className="px-3 py-2 rounded-lg bg-emerald-600 text-white" onClick={handleWeiter}>
                Weiter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-md text-xs ${
            drawingActive ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-white'
          }`}
        >
          {drawingActive ? 'Zeichnen aktiv' : 'Zeichnen aus'}
        </span>
        {!showIntro && !drawingActive && !showNextPrompt && (
          <button
            className="px-2 py-1 rounded-md text-xs border bg-white"
            onClick={addAnother}
          >
            Weitere Fläche
          </button>
        )}
      </div>
    </div>
  );
}

function estimateAzimuthFromPolygon(path: google.maps.LatLng[]): number {
  if (!path.length) return 0;
  let minLat = path[0].lat(), maxLat = minLat;
  let minLng = path[0].lng(), maxLng = minLng;
  for (const p of path) {
    minLat = Math.min(minLat, p.lat());
    maxLat = Math.max(maxLat, p.lat());
    minLng = Math.min(minLng, p.lng());
    maxLng = Math.max(maxLng, p.lng());
  }
  const dLat = maxLat - minLat;
  const dLng = maxLng - minLng;
  const eastWest = Math.abs(dLng) > Math.abs(dLat);
  return eastWest ? 90 : 0;
}

export default StepMap;
