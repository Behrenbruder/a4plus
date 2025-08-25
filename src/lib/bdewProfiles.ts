/**
 * BDEW Standardlastprofile 2025 - Dynamisierte Profile
 * Basierend auf den aktualisierten BDEW-Profilen H25 und S25
 * 
 * H25: Haushaltsprofil (dynamisiert)
 * S25: PV-Speicher Kombinationsprofil (dynamisiert)
 * 
 * Alle Werte sind auf 1 MWh Jahresverbrauch normiert
 */

/**
 * Korrekte BDEW Dynamisierungsfunktion:
 * x = x₀ * (-3,92E-10 * t⁴ + 3,20E-7 * t³ - 7,02E-5 * t² + 2,10E-3 * t + 1,24)
 * 
 * Dabei ist:
 * x = der resultierende Viertelstundenwert
 * x₀ = der in der Tabelle angegebene Viertelstundenwert des Profils
 * t = der Tag des jeweiligen Jahres, beginnend mit 1 am 1. Januar und endend mit 365 (bzw. 366 in Schaltjahren) am 31. Dezember
 */
function getDynamisierungsfaktor(dayOfYear: number): number {
  const t = dayOfYear;
  const factor = -3.92e-10 * Math.pow(t, 4) + 
                 3.20e-7 * Math.pow(t, 3) - 
                 7.02e-5 * Math.pow(t, 2) + 
                 2.10e-3 * t + 
                 1.24;
  
  // Auf 4 Nachkommastellen runden wie empfohlen
  return Math.round(factor * 10000) / 10000;
}

/**
 * Tagestyp-Definitionen
 */
export type DayType = 'SA' | 'FT' | 'WT'; // Samstag, Feiertag, Werktag

/**
 * Vereinfachte BDEW H25 Haushaltsprofil (entdynamisiert) - Repräsentative Werte
 * 96 Viertelstundenwerte für jeden Tagestyp
 */
const H25_BASE_PROFILE: Record<DayType, number[]> = {
  SA: [22.152, 20.809, 19.757, 18.889, 18.217, 17.53, 16.988, 16.399, 16.199, 15.893, 15.66, 15.442, 15.398, 15.219, 15.102, 15.029, 15.19, 15.066, 15.097, 15.312, 15.366, 15.192, 15.338, 15.819, 16.806, 17.632, 18.582, 19.477, 21.015, 22.34, 23.947, 25.491, 26.837, 28.317, 29.179, 30.038, 30.834, 31.737, 32.301, 32.771, 33.451, 34.172, 34.721, 35.472, 36.638, 37.602, 38.463, 38.883, 38.394, 37.981, 37.549, 37.194, 36.759, 36.299, 36.095, 35.686, 35.325, 35.331, 35.305, 35.132, 35.158, 35.179, 35.203, 35.45, 36.116, 36.902, 37.761, 38.927, 40.646, 42.11, 43.119, 43.955, 44.419, 44.443, 44.085, 43.524, 42.928, 42.06, 41.173, 40.164, 39.182, 37.781, 36.282, 35.381, 34.692, 33.815, 32.837, 32.768, 32.678, 31.368, 30.28, 28.952, 27.554, 26.256, 25.052, 23.942],
  FT: [23.148, 21.985, 21.147, 20.385, 19.65, 18.998, 18.366, 17.667, 17.458, 17.009, 16.678, 16.363, 16.273, 16.054, 15.836, 15.633, 15.587, 15.41, 15.451, 15.711, 15.734, 15.488, 15.586, 15.829, 16.479, 17.096, 17.725, 18.318, 19.524, 20.477, 21.807, 23.378, 24.845, 26.51, 27.711, 29.097, 30.411, 31.831, 33.055, 34.138, 35.27, 36.411, 37.509, 38.639, 40.229, 41.956, 43.102, 43.267, 42.412, 41.629, 40.929, 40.234, 39.285, 38.454, 37.916, 37.256, 36.62, 36.248, 35.975, 35.742, 35.661, 35.535, 35.443, 35.51, 35.971, 36.601, 37.744, 39.18, 41.049, 42.745, 43.824, 44.772, 45.425, 45.408, 44.996, 44.516, 43.908, 43.029, 42.104, 41.284, 40.326, 38.78, 37.117, 35.866, 34.922, 33.772, 32.722, 32.514, 31.952, 30.218, 28.724, 27.29, 25.946, 24.485, 23.093, 21.67],
  WT: [20.126, 18.915, 17.959, 17.202, 16.612, 16.077, 15.796, 15.3, 15.287, 15.143, 15.025, 14.934, 15.018, 14.938, 14.943, 14.958, 15.216, 15.368, 15.674, 16.221, 16.82, 17.16, 18.039, 19.089, 20.971, 22.609, 23.816, 24.573, 25.042, 25.241, 25.078, 24.63, 23.976, 23.848, 23.238, 22.944, 22.673, 22.767, 22.682, 22.658, 22.558, 22.69, 22.964, 23.42, 24.061, 24.863, 25.576, 25.998, 26.174, 26.229, 26.313, 26.255, 26.138, 26.006, 26.094, 25.821, 25.455, 25.443, 25.311, 25.408, 25.858, 25.975, 26.285, 26.865, 28.065, 29.198, 30.509, 32.156, 34.769, 36.779, 38.382, 39.899, 40.96, 41.542, 41.918, 42.12, 41.957, 41.543, 41.007, 40.382, 39.532, 38.319, 36.864, 35.746, 34.904, 33.979, 32.907, 32.539, 32.068, 30.435, 28.895, 27.388, 26.006, 24.477, 23.115, 21.764]
};

/**
 * BDEW S25 PV-Speicher Kombinationsprofil (entdynamisiert) - Repräsentative Werte
 * 96 Viertelstundenwerte für jeden Tagestyp
 */
const S25_BASE_PROFILE: Record<DayType, number[]> = {
  SA: [18.5, 17.2, 16.1, 15.3, 14.8, 14.2, 13.9, 13.5, 13.3, 13.1, 12.9, 12.8, 12.7, 12.6, 12.5, 12.4, 12.6, 12.8, 13.2, 13.8, 14.5, 15.3, 16.2, 17.4, 18.9, 20.6, 22.5, 24.7, 27.2, 29.8, 32.6, 35.5, 38.4, 41.2, 43.8, 46.1, 48.0, 49.5, 50.6, 51.2, 51.4, 51.1, 50.4, 49.3, 47.8, 46.0, 43.9, 41.5, 38.9, 36.2, 33.4, 30.6, 27.9, 25.3, 22.9, 20.7, 18.8, 17.2, 15.9, 14.8, 14.0, 13.4, 12.9, 12.6, 12.4, 12.3, 12.3, 12.4, 12.6, 12.9, 13.3, 13.8, 14.4, 15.1, 15.9, 16.8, 17.8, 18.9, 20.1, 21.4, 22.7, 24.0, 25.3, 26.5, 27.6, 28.6, 29.4, 30.0, 30.4, 30.6, 30.6, 30.4, 30.0, 29.4, 28.6, 27.6],
  FT: [19.2, 17.8, 16.6, 15.7, 15.0, 14.4, 14.0, 13.6, 13.4, 13.2, 13.0, 12.9, 12.8, 12.7, 12.6, 12.5, 12.7, 12.9, 13.3, 13.9, 14.6, 15.4, 16.3, 17.5, 19.0, 20.7, 22.6, 24.8, 27.3, 29.9, 32.7, 35.6, 38.5, 41.3, 43.9, 46.2, 48.1, 49.6, 50.7, 51.3, 51.5, 51.2, 50.5, 49.4, 47.9, 46.1, 44.0, 41.6, 39.0, 36.3, 33.5, 30.7, 28.0, 25.4, 23.0, 20.8, 18.9, 17.3, 16.0, 14.9, 14.1, 13.5, 13.0, 12.7, 12.5, 12.4, 12.4, 12.5, 12.7, 13.0, 13.4, 13.9, 14.5, 15.2, 16.0, 16.9, 17.9, 19.0, 20.2, 21.5, 22.8, 24.1, 25.4, 26.6, 27.7, 28.7, 29.5, 30.1, 30.5, 30.7, 30.7, 30.5, 30.1, 29.5, 28.7, 27.7],
  WT: [16.8, 15.6, 14.7, 14.0, 13.5, 13.1, 12.8, 12.5, 12.3, 12.2, 12.1, 12.0, 11.9, 11.9, 11.8, 11.8, 12.0, 12.2, 12.6, 13.2, 13.9, 14.7, 15.6, 16.8, 18.2, 19.8, 21.6, 23.7, 26.0, 28.5, 31.2, 34.0, 36.9, 39.7, 42.3, 44.6, 46.5, 48.0, 49.1, 49.7, 49.9, 49.6, 48.9, 47.8, 46.3, 44.5, 42.4, 40.0, 37.4, 34.7, 31.9, 29.1, 26.4, 23.8, 21.4, 19.2, 17.3, 15.7, 14.4, 13.3, 12.5, 11.9, 11.4, 11.1, 10.9, 10.8, 10.8, 10.9, 11.1, 11.4, 11.8, 12.3, 12.9, 13.6, 14.4, 15.3, 16.3, 17.4, 18.6, 19.9, 21.2, 22.5, 23.8, 25.0, 26.1, 27.1, 27.9, 28.5, 28.9, 29.1, 29.1, 28.9, 28.5, 27.9, 27.1, 26.1]
};

/**
 * Bestimmt den Tagestyp basierend auf Datum
 */
function getDayType(date: Date): DayType {
  const dayOfWeek = date.getDay(); // 0 = Sonntag, 6 = Samstag
  
  // Vereinfachte Feiertagslogik (kann erweitert werden)
  const isHoliday = isGermanHoliday(date);
  
  if (isHoliday || dayOfWeek === 0) return 'FT'; // Feiertag/Sonntag
  if (dayOfWeek === 6) return 'SA'; // Samstag
  return 'WT'; // Werktag
}

/**
 * Vereinfachte deutsche Feiertagslogik
 */
function isGermanHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Feste Feiertage
  const fixedHolidays = [
    [1, 1],   // Neujahr
    [5, 1],   // Tag der Arbeit
    [10, 3],  // Tag der Deutschen Einheit
    [12, 25], // 1. Weihnachtstag
    [12, 26]  // 2. Weihnachtstag
  ];
  
  return fixedHolidays.some(([m, d]) => month === m && day === d);
}

/**
 * Berechnet den Tag des Jahres (1-365/366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Generiert dynamisiertes BDEW H25 Profil für ein bestimmtes Datum
 */
export function generateH25Profile(date: Date): number[] {
  const dayType = getDayType(date);
  const dayOfYear = getDayOfYear(date);
  const dynFactor = getDynamisierungsfaktor(dayOfYear);
  
  const baseProfile = H25_BASE_PROFILE[dayType];
  
  return baseProfile.map(value => {
    const dynamizedValue = value * dynFactor;
    // Auf 3 Nachkommastellen runden wie empfohlen
    return Math.round(dynamizedValue * 1000) / 1000;
  });
}

/**
 * Generiert dynamisiertes BDEW S25 Profil für ein bestimmtes Datum
 */
export function generateS25Profile(date: Date): number[] {
  const dayType = getDayType(date);
  const dayOfYear = getDayOfYear(date);
  const dynFactor = getDynamisierungsfaktor(dayOfYear);
  
  const baseProfile = S25_BASE_PROFILE[dayType];
  
  return baseProfile.map(value => {
    const dynamizedValue = value * dynFactor;
    // Auf 3 Nachkommastellen runden wie empfohlen
    return Math.round(dynamizedValue * 1000) / 1000;
  });
}

/**
 * Generiert Jahresprofil für H25 (8760 Stundenwerte)
 */
export function generateH25YearProfile(year: number = new Date().getFullYear()): number[] {
  const yearProfile: number[] = [];
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayProfile = generateH25Profile(date);
      
      // Konvertiere 96 Viertelstundenwerte zu 24 Stundenwerten
      for (let hour = 0; hour < 24; hour++) {
        const quarterHourStart = hour * 4;
        const hourValue = (
          dayProfile[quarterHourStart] +
          dayProfile[quarterHourStart + 1] +
          dayProfile[quarterHourStart + 2] +
          dayProfile[quarterHourStart + 3]
        ) / 4;
        yearProfile.push(hourValue);
      }
    }
  }
  
  return yearProfile;
}

/**
 * Generiert Jahresprofil für S25 (8760 Stundenwerte)
 */
export function generateS25YearProfile(year: number = new Date().getFullYear()): number[] {
  const yearProfile: number[] = [];
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayProfile = generateS25Profile(date);
      
      // Konvertiere 96 Viertelstundenwerte zu 24 Stundenwerten
      for (let hour = 0; hour < 24; hour++) {
        const quarterHourStart = hour * 4;
        const hourValue = (
          dayProfile[quarterHourStart] +
          dayProfile[quarterHourStart + 1] +
          dayProfile[quarterHourStart + 2] +
          dayProfile[quarterHourStart + 3]
        ) / 4;
        yearProfile.push(hourValue);
      }
    }
  }
  
  return yearProfile;
}

/**
 * Berechnet Autarkiegrad und Eigenverbrauchsquote mit BDEW Profilen
 */
export function calculateBDEWMetrics(
  annualPVKWh: number,
  annualConsumptionKWh: number,
  batteryCapacityKWh: number = 0,
  profileType: 'H25' | 'S25' = 'H25',
  year: number = new Date().getFullYear()
): { autarky: number; selfConsumption: number; gridImport: number; feedIn: number } {
  
  // Generiere Lastprofil basierend auf Typ
  const loadProfile = profileType === 'H25' 
    ? generateH25YearProfile(year) 
    : generateS25YearProfile(year);
  
  // Normiere Profil auf tatsächlichen Jahresverbrauch
  const profileSum = loadProfile.reduce((sum, value) => sum + value, 0);
  const normalizedLoadProfile = loadProfile.map(value => 
    (value / profileSum) * annualConsumptionKWh
  );
  
  // Vereinfachtes PV-Profil (sinusförmig mit Tagesverlauf)
  const pvProfile: number[] = [];
  for (let day = 0; day < 365; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let pvValue = 0;
      if (hour >= 6 && hour <= 18) {
        // Vereinfachte Sinus-Kurve für PV-Erzeugung
        const hourAngle = ((hour - 6) / 12) * Math.PI;
        pvValue = Math.sin(hourAngle) * (annualPVKWh / 365) * 0.15;
        
        // Saisonale Anpassung
        const dayAngle = (day / 365) * 2 * Math.PI;
        const seasonalFactor = 0.7 + 0.3 * Math.sin(dayAngle - Math.PI/2);
        pvValue *= seasonalFactor;
      }
      pvProfile.push(Math.max(0, pvValue));
    }
  }
  
  // Simuliere Batterieverhalten
  let batterySOC = 0; // State of Charge in kWh
  let totalSelfConsumption = 0;
  let totalGridImport = 0;
  let totalFeedIn = 0;
  
  for (let hour = 0; hour < Math.min(pvProfile.length, normalizedLoadProfile.length); hour++) {
    const pvGeneration = pvProfile[hour];
    const load = normalizedLoadProfile[hour];
    
    let directUse = Math.min(pvGeneration, load);
    let surplus = pvGeneration - directUse;
    let deficit = load - directUse;
    
    // Batterie laden bei Überschuss
    if (surplus > 0 && batteryCapacityKWh > 0) {
      const chargeAmount = Math.min(surplus, batteryCapacityKWh - batterySOC);
      batterySOC += chargeAmount * 0.95; // 95% Ladeeffizienz
      surplus -= chargeAmount;
    }
    
    // Batterie entladen bei Defizit
    if (deficit > 0 && batterySOC > 0) {
      const dischargeAmount = Math.min(deficit, batterySOC);
      batterySOC -= dischargeAmount;
      deficit -= dischargeAmount * 0.95; // 95% Entladeeffizienz
      directUse += dischargeAmount * 0.95;
    }
    
    totalSelfConsumption += directUse;
    totalGridImport += deficit;
    totalFeedIn += surplus;
  }
  
  const autarky = 1 - (totalGridImport / annualConsumptionKWh);
  const selfConsumption = totalSelfConsumption / annualPVKWh;
  
  return {
    autarky: Math.max(0, Math.min(1, autarky)),
    selfConsumption: Math.max(0, Math.min(1, selfConsumption)),
    gridImport: totalGridImport,
    feedIn: totalFeedIn
  };
}

/**
 * Hilfsfunktion für Tests - generiert Beispielprofil
 */
export function getExampleProfile(profileType: 'H25' | 'S25', dayType: DayType): number[] {
  const baseProfile = profileType === 'H25' ? H25_BASE_PROFILE : S25_BASE_PROFILE;
  return baseProfile[dayType];
}
