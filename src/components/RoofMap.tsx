'use client';
/// <reference types="@types/google.maps" />
/* global google */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  type Libraries,
} from '@react-google-maps/api';

export type LatLng = { lat: number; lng: number };

export type RoofFace = {
  id: string;
  name: string;
  azimuthDeg: number;   // PVGIS: 0=Süd, +90=West, -90=Ost
  tiltDeg: number;
  areaHorizM2: number;
  polygon: LatLng[];
};

type Props = {
  center: LatLng;
  defaultTilt?: number;
  faces: RoofFace[];
  onFacesChange: (faces: RoofFace[]) => void;
};

// WICHTIG: überall dieselben Libraries verwenden!
const LIBS: Libraries = ['drawing', 'geometry', 'places'];

function normalize180(deg: number) {
  let d = deg;
  while (d > 180) d -= 360;
  while (d <= -180) d += 360;
  return d;
}
function headingToPVGISAzimuth(headingFromNorth: number) {
  const normalFromNorth = normalize180(headingFromNorth + 90);
  return normalize180(normalFromNorth - 180); // 0=Süd
}

export function RoofMap({ center, defaultTilt = 35, faces, onFacesChange }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBS, // 👈 identisch zu StepAddress
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const onLoad = useCallback((m: google.maps.Map) => { mapRef.current = m; }, []);

  const mapOptions = useMemo<google.maps.MapOptions | undefined>(() => {
    if (!isLoaded) return undefined;
    return {
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      keyboardShortcuts: false,
      tilt: 0,
      rotateControl: false,
      heading: 0,
      clickableIcons: false,
      styles: [
        { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    };
  }, [isLoaded]);

  const [drawingMode, setDrawingMode] = useState<google.maps.drawing.OverlayType | null>(null);
  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);

  const addPolygon = useCallback((poly: google.maps.Polygon) => {
    const pathLatLng = poly.getPath().getArray();
    const polygon: LatLng[] = pathLatLng.map(p => ({ lat: p.lat(), lng: p.lng() }));
    const areaHoriz = google.maps.geometry.spherical.computeArea(poly.getPath());

    let longest = 0, bestHeading = 0;
    for (let i = 0; i < pathLatLng.length; i++) {
      const a = pathLatLng[i];
      const b = pathLatLng[(i + 1) % pathLatLng.length];
      const d = google.maps.geometry.spherical.computeDistanceBetween(a, b);
      if (d > longest) { longest = d; bestHeading = google.maps.geometry.spherical.computeHeading(a, b); }
    }
    const azimuth = headingToPVGISAzimuth(bestHeading);

    const newFace: RoofFace = {
      id: `F${Date.now()}`,
      name: `Dachfläche ${faces.length + 1}`,
      azimuthDeg: azimuth,
      tiltDeg: defaultTilt,
      areaHorizM2: areaHoriz,
      polygon,
    };

    onFacesChange([...faces, newFace]);
    setDrawingMode(null);
    setShowContinuePrompt(true);
    poly.setMap(null);
  }, [faces, defaultTilt, onFacesChange]);

  if (loadError) return <div className="text-red-600">Google Maps konnte nicht geladen werden.</div>;
  if (!isLoaded) return <div className="text-gray-500">Map lädt…</div>;

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '420px', borderRadius: 16 }}
        center={center}
        zoom={19}
        onLoad={onLoad}
        options={mapOptions}
      >
        <DrawingManager
          options={{
            drawingControl: false,
            polygonOptions: {
              fillColor: '#4285F4',
              fillOpacity: 0.2,
              strokeColor: '#4285F4',
              strokeOpacity: 0.9,
              strokeWeight: 2,
            },
          }}
          drawingMode={drawingMode ?? undefined}
          onPolygonComplete={addPolygon}
        />

        {faces.map((f) => (
          <Polygon
            key={f.id}
            paths={f.polygon}
            options={{ fillColor: '#34A853', fillOpacity: 0.15, strokeColor: '#34A853', strokeWeight: 2 }}
          />
        ))}
      </GoogleMap>

      {/* Start-Overlay */}
      {showInitialPrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-5 rounded-2xl shadow-xl w-[min(92vw,420px)] text-center">
            <div className="text-lg font-semibold mb-2">Bitte markieren Sie Ihre einzelnen Dachflächen</div>
            <div className="text-sm text-gray-600 mb-4">Klicken & mehrere Punkte setzen, doppelklick zum Schließen.</div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => { setShowInitialPrompt(false); setDrawingMode(google.maps.drawing.OverlayType.POLYGON); }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
              >
                Jetzt markieren
              </button>
              <button
                type="button"
                onClick={() => setShowInitialPrompt(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Später
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folge-Overlay */}
      {showContinuePrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-5 rounded-2xl shadow-xl w-[min(92vw,420px)] text-center">
            <div className="text-lg font-semibold mb-2">Weitere Dachfläche markieren?</div>
            <div className="text-sm text-gray-600 mb-4">Sie können beliebig viele Flächen nacheinander einzeichnen.</div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => { setShowContinuePrompt(false); setDrawingMode(google.maps.drawing.OverlayType.POLYGON); }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
              >
                Ja, weitere Fläche
              </button>
              <button
                type="button"
                onClick={() => setShowContinuePrompt(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Nein, fertig
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Tipp: Ausrichtung wird automatisch geschätzt; Sie können sie unten manuell anpassen.
      </div>
    </div>
  );
}
