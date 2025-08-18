'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ensureGoogleMaps } from '@/lib/googleMaps';

export type LatLng = { lat: number; lng: number };

type Props = {
  /** Bereits gespeicherte Adresse (Prefill) */
  value?: string;
  /** Optionaler Startpunkt (nur Info) */
  defaultCenter?: LatLng;
  /** Rückgabe: Koordinaten + normierte Adresse */
  onNext: (center: LatLng, address: string) => void;
  /** z. B. 'de'; wenn weggelassen → weltweit */
  countryRestriction?: string;
};

export default function StepAddress({
  value,
  defaultCenter,
  onNext,
  countryRestriction = 'de',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState<string>(value ?? '');
  const [gmReady, setGmReady] = useState(false);

  // onNext stabil halten, ohne es in die Dep-Liste zu nehmen
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await ensureGoogleMaps(['places']);
      if (!mounted || !inputRef.current) return;

      const el = inputRef.current;

      const componentRestrictions: google.maps.places.ComponentRestrictions | undefined =
        countryRestriction ? { country: countryRestriction as string | string[] } : undefined;

      const ac = new google.maps.places.Autocomplete(el, {
        fields: ['formatted_address', 'geometry'],
        types: ['address'],
        componentRestrictions,
      });

      const handler = () => {
        const place = ac.getPlace();
        const formatted = place.formatted_address ?? el.value;
        const loc = place.geometry?.location;
        setAddress(formatted);
        if (loc) {
          const center = { lat: loc.lat(), lng: loc.lng() };
          onNextRef.current?.(center, formatted);
        }
      };

      ac.addListener('place_changed', handler);
      setGmReady(true);
    })();

    return () => {
      mounted = false;
    };
    // WICHTIG: nur reagieren, wenn sich die Ländereinschränkung ändert
  }, [countryRestriction]);

  // Fallback: manuelles Geocoding (Enter/Knopf)
  const geocodeAddress = async () => {
    await ensureGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const r = results[0];
        const loc = r.geometry.location;
        const formatted = r.formatted_address || address;
        onNextRef.current?.({ lat: loc.lat(), lng: loc.lng() }, formatted);
      } else {
        alert('Adresse konnte nicht gefunden werden.');
      }
    });
  };

  return (
    <div className="space-y-3">
      {defaultCenter && (
        <div className="text-xs text-gray-500">
          Start: {defaultCenter.lat.toFixed(5)}, {defaultCenter.lng.toFixed(5)}
        </div>
      )}

      <label className="block text-sm text-gray-600">Ihre vollständige Adresse</label>
      <input
        ref={inputRef}
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="z. B. Musterstraße 12, 12345 Musterstadt"
        className="w-full px-3 py-2 border rounded-lg"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            geocodeAddress();
          }
        }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
          onClick={geocodeAddress}
          disabled={!address || !gmReady}
        >
          Karte zentrieren
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Tipp: Wählen Sie einen Eintrag aus der Vorschlagsliste.
      </p>
    </div>
  );
}
