'use client';

import { useEffect, useRef, useState } from 'react';
import { ensureGoogleMaps } from '@/lib/googleMaps';

interface LocationMapProps {
  address: string;
  className?: string;
}

export default function LocationMap({ address, className = '' }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let mounted = true;

    // Google Maps initialisieren
    const initMap = async () => {
      try {
        await ensureGoogleMaps(['places', 'geometry']);
        
        if (!mounted || !mapRef.current || !window.google) return;

        const geocoder = new google.maps.Geocoder();
        
        // Geocoding für präzise Adresse
        geocoder.geocode({ address: address }, (results, status) => {
          if (!mounted) return;
          
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            
            const map = new google.maps.Map(mapRef.current!, {
              center: location,
              zoom: 19, // Höherer Zoom für bessere Detailansicht
              mapTypeId: google.maps.MapTypeId.SATELLITE,
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_CENTER,
                mapTypeIds: [
                  google.maps.MapTypeId.ROADMAP,
                  google.maps.MapTypeId.SATELLITE,
                  google.maps.MapTypeId.HYBRID,
                  google.maps.MapTypeId.TERRAIN
                ]
              },
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }]
                }
              ]
            });

            // Marker hinzufügen
            const marker = new google.maps.Marker({
              position: location,
              map: map,
              title: address,
              animation: google.maps.Animation.DROP,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="15" fill="#ef4444" stroke="white" stroke-width="4"/>
                    <circle cx="20" cy="20" r="6" fill="white"/>
                    <text x="20" y="25" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="bold">A+</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
              }
            });

            // Info-Fenster
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; max-width: 250px;">
                  <div style="font-weight: 600; margin-bottom: 6px; color: #1f2937;">Arteplus GmbH</div>
                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${address}</div>
                  <div style="font-size: 13px; color: #374151; margin-bottom: 10px;">
                    Ihr Partner für Photovoltaik, Wärmepumpen, Fenster und energetische Sanierung
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}" 
                       target="_blank" 
                       style="color: #1976d2; text-decoration: none; font-size: 13px; padding: 4px 8px; border: 1px solid #1976d2; border-radius: 4px; display: inline-block;">
                      Route planen
                    </a>
                    <a href="tel:+4962339999999" 
                       style="color: #059669; text-decoration: none; font-size: 13px; padding: 4px 8px; border: 1px solid #059669; border-radius: 4px; display: inline-block;">
                      Anrufen
                    </a>
                  </div>
                </div>
              `
            });

            // Info-Fenster beim Klick auf Marker öffnen
            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            // Info-Fenster automatisch nach 2 Sekunden öffnen
            setTimeout(() => {
              if (mounted) {
                infoWindow.open(map, marker);
              }
            }, 2000);

            mapInstanceRef.current = map;
            setIsLoading(false);
          } else {
            console.error('Geocoding failed:', status);
            setError('Adresse konnte nicht gefunden werden');
            setIsLoading(false);
            
            // Fallback zu ungefähren Koordinaten
            const fallbackLocation = {
              lat: 49.5347,
              lng: 8.3567
            };
            
            const map = new google.maps.Map(mapRef.current!, {
              center: fallbackLocation,
              zoom: 18,
              mapTypeId: google.maps.MapTypeId.SATELLITE
            });

            new google.maps.Marker({
              position: fallbackLocation,
              map: map,
              title: address
            });

            mapInstanceRef.current = map;
          }
        });
      } catch (err) {
        if (mounted) {
          console.error('Google Maps loading failed:', err);
          setError('Google Maps konnte nicht geladen werden');
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      mapInstanceRef.current = null;
    };
  }, [address]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[300px] rounded-xl overflow-hidden"
        style={{ minHeight: '300px' }}
      />
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <div className="text-gray-600 text-sm">Karte wird geladen...</div>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">📍 Unser Standort</div>
            <div className="text-sm mb-2">{address}</div>
            <div className="text-xs text-red-500 mb-3">{error}</div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              In Google Maps öffnen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
