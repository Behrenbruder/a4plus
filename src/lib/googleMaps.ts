// src/lib/googleMaps.ts
let scriptPromise: Promise<void> | null = null;

/** Lädt das Maps‑Script genau einmal (immer mit denselben Libraries) */
function loadScriptOnce(apiKey: string) {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();

    // Wenn bereits vorhanden → fertig
    if (window.google?.maps) return resolve();

    const s = document.createElement('script');
    // WICHTIG: immer die gleichen Libraries angeben, sonst "Loader must not be called again ..."
    const libs = 'drawing,geometry,places';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=${libs}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    s.onload = () => resolve();
    document.head.appendChild(s);
  });

  return scriptPromise;
}

/**
 * Stellt sicher, dass Google Maps geladen ist und – falls verfügbar – die genannten
 * Libraries via importLibrary nachgeladen werden.
 */
export async function ensureGoogleMaps(libraries: Array<'drawing' | 'geometry' | 'places'> = []) {
  if (typeof window === 'undefined') return;

  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY fehlt');
  }

  await loadScriptOnce(apiKey);

  // Bei neueren Versionen existiert importLibrary – damit stellen wir sicher,
  // dass die gewünschten Libraries bereitstehen, bevor wir sie verwenden.
  // (Bei älteren Builds ist drawing/geometry bereits durch ?libraries=... geladen.)
  const googleMaps = (window as { google?: { maps?: { importLibrary?: (lib: string) => Promise<unknown> } } }).google?.maps;
  const importer = googleMaps?.importLibrary;
  if (typeof importer === 'function') {
    for (const lib of libraries) {
      try {
        await importer(lib);
      } catch {
        /* ignore – bei älteren Versionen nicht notwendig */
      }
    }
  }
}
