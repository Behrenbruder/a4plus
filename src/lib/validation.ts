// /src/lib/validation.ts
import { calculateHybridMetrics } from './pvcalc';

export interface RealPlantData {
  // Anlagenspezifikation
  plantId: string;
  installedPowerKWp: number;
  batteryCapacityKWh?: number;
  hasEV: boolean;
  hasHeatPump: boolean;
  location: { lat: number; lng: number };
  
  // Jahreswerte (Ist-Daten)
  actualAnnualPVKWh: number;
  actualAnnualConsumptionKWh: number;
  actualGridImportKWh: number;
  actualFeedInKWh: number;
  actualSelfConsumptionKWh: number;
  
  // Berechnete Kennzahlen (Ist)
  actualAutarkyPercent: number;
  actualSelfConsumptionPercent: number;
  
  // Verbrauchsaufschlüsselung
  householdConsumptionKWh: number;
  evConsumptionKWh?: number;
  heatPumpConsumptionKWh?: number;
  
  // Optional: Monatswerte für detailliertere Analyse
  monthlyData?: {
    month: number;
    pvKWh: number;
    consumptionKWh: number;
    gridImportKWh: number;
    feedInKWh: number;
  }[];
}

export interface ValidationResult {
  plantId: string;
  calculated: {
    autarkyPercent: number;
    selfConsumptionPercent: number;
  };
  actual: {
    autarkyPercent: number;
    selfConsumptionPercent: number;
  };
  deviations: {
    autarkyAbsolute: number;
    autarkyRelative: number;
    selfConsumptionAbsolute: number;
    selfConsumptionRelative: number;
  };
  quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  plantData: RealPlantData;
}

export interface ValidationReport {
  summary: {
    totalPlants: number;
    excellentCount: number;
    goodCount: number;
    acceptableCount: number;
    poorCount: number;
    averageAutarkyDeviation: number;
    averageSelfConsumptionDeviation: number;
    mapeAutarky: number;
    mapeSelfConsumption: number;
    rmseAutarky: number;
    rmseSelfConsumption: number;
    r2Autarky: number;
    r2SelfConsumption: number;
  };
  results: ValidationResult[];
  recommendations: string[];
}

export function validateHybridCalculation(plantData: RealPlantData): ValidationResult {
  // Berechne mit Hybrid-Ansatz
  const hybridResult = calculateHybridMetrics(
    plantData.actualAnnualPVKWh,
    plantData.householdConsumptionKWh,
    plantData.batteryCapacityKWh || 0,
    plantData.evConsumptionKWh || 0,
    plantData.heatPumpConsumptionKWh || 0
  );

  const calculatedAutarky = hybridResult.autarky * 100;
  const calculatedSelfConsumption = hybridResult.selfConsumption * 100;

  // Berechne Abweichungen
  const autarkyAbsolute = Math.abs(calculatedAutarky - plantData.actualAutarkyPercent);
  const autarkyRelative = Math.abs((calculatedAutarky - plantData.actualAutarkyPercent) / plantData.actualAutarkyPercent) * 100;
  
  const selfConsumptionAbsolute = Math.abs(calculatedSelfConsumption - plantData.actualSelfConsumptionPercent);
  const selfConsumptionRelative = Math.abs((calculatedSelfConsumption - plantData.actualSelfConsumptionPercent) / plantData.actualSelfConsumptionPercent) * 100;

  // Bestimme Qualität
  let quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  
  if (autarkyAbsolute <= 3 && selfConsumptionAbsolute <= 2) {
    quality = 'excellent';
  } else if (autarkyAbsolute <= 5 && selfConsumptionAbsolute <= 3) {
    quality = 'good';
  } else if (autarkyAbsolute <= 10 && selfConsumptionAbsolute <= 7) {
    quality = 'acceptable';
  } else {
    quality = 'poor';
  }

  return {
    plantId: plantData.plantId,
    calculated: {
      autarkyPercent: calculatedAutarky,
      selfConsumptionPercent: calculatedSelfConsumption,
    },
    actual: {
      autarkyPercent: plantData.actualAutarkyPercent,
      selfConsumptionPercent: plantData.actualSelfConsumptionPercent,
    },
    deviations: {
      autarkyAbsolute,
      autarkyRelative,
      selfConsumptionAbsolute,
      selfConsumptionRelative,
    },
    quality,
    plantData,
  };
}

export function generateValidationReport(results: ValidationResult[]): ValidationReport {
  const totalPlants = results.length;
  
  // Zähle Qualitätskategorien
  const excellentCount = results.filter(r => r.quality === 'excellent').length;
  const goodCount = results.filter(r => r.quality === 'good').length;
  const acceptableCount = results.filter(r => r.quality === 'acceptable').length;
  const poorCount = results.filter(r => r.quality === 'poor').length;

  // Berechne durchschnittliche Abweichungen
  const averageAutarkyDeviation = results.reduce((sum, r) => sum + r.deviations.autarkyAbsolute, 0) / totalPlants;
  const averageSelfConsumptionDeviation = results.reduce((sum, r) => sum + r.deviations.selfConsumptionAbsolute, 0) / totalPlants;

  // Berechne MAPE (Mean Absolute Percentage Error)
  const mapeAutarky = results.reduce((sum, r) => sum + r.deviations.autarkyRelative, 0) / totalPlants;
  const mapeSelfConsumption = results.reduce((sum, r) => sum + r.deviations.selfConsumptionRelative, 0) / totalPlants;

  // Berechne RMSE (Root Mean Square Error)
  const rmseAutarky = Math.sqrt(
    results.reduce((sum, r) => sum + Math.pow(r.deviations.autarkyAbsolute, 2), 0) / totalPlants
  );
  const rmseSelfConsumption = Math.sqrt(
    results.reduce((sum, r) => sum + Math.pow(r.deviations.selfConsumptionAbsolute, 2), 0) / totalPlants
  );

  // Berechne R² (Bestimmtheitsmaß)
  const actualAutarkyMean = results.reduce((sum, r) => sum + r.actual.autarkyPercent, 0) / totalPlants;
  const actualSelfConsumptionMean = results.reduce((sum, r) => sum + r.actual.selfConsumptionPercent, 0) / totalPlants;

  const ssResAutarky = results.reduce((sum, r) => 
    sum + Math.pow(r.actual.autarkyPercent - r.calculated.autarkyPercent, 2), 0
  );
  const ssTotAutarky = results.reduce((sum, r) => 
    sum + Math.pow(r.actual.autarkyPercent - actualAutarkyMean, 2), 0
  );
  const r2Autarky = 1 - (ssResAutarky / ssTotAutarky);

  const ssResSelfConsumption = results.reduce((sum, r) => 
    sum + Math.pow(r.actual.selfConsumptionPercent - r.calculated.selfConsumptionPercent, 2), 0
  );
  const ssTotSelfConsumption = results.reduce((sum, r) => 
    sum + Math.pow(r.actual.selfConsumptionPercent - actualSelfConsumptionMean, 2), 0
  );
  const r2SelfConsumption = 1 - (ssResSelfConsumption / ssTotSelfConsumption);

  // Generiere Empfehlungen
  const recommendations: string[] = [];
  
  if (averageAutarkyDeviation > 7) {
    recommendations.push('Autarkiegrad-Berechnung benötigt Kalibrierung - durchschnittliche Abweichung zu hoch');
  }
  
  if (averageSelfConsumptionDeviation > 5) {
    recommendations.push('Eigenverbrauchsquote-Berechnung benötigt Anpassung - systematische Abweichungen erkennbar');
  }
  
  if (poorCount / totalPlants > 0.2) {
    recommendations.push('Mehr als 20% der Anlagen zeigen schlechte Übereinstimmung - grundlegende Überarbeitung erforderlich');
  }
  
  if (r2Autarky < 0.7) {
    recommendations.push('Niedrige Korrelation bei Autarkiegrad - Modell erklärt Varianz unzureichend');
  }
  
  if (r2SelfConsumption < 0.7) {
    recommendations.push('Niedrige Korrelation bei Eigenverbrauch - Batteriemodellierung überprüfen');
  }

  // Spezifische Empfehlungen basierend auf Anlagentypen
  const batteryPlants = results.filter(r => r.plantData.batteryCapacityKWh && r.plantData.batteryCapacityKWh > 0);
  if (batteryPlants.length > 0) {
    const batteryDeviation = batteryPlants.reduce((sum, r) => sum + r.deviations.autarkyAbsolute, 0) / batteryPlants.length;
    if (batteryDeviation > averageAutarkyDeviation * 1.5) {
      recommendations.push('Batterie-Anlagen zeigen überdurchschnittliche Abweichungen - Batteriemodell anpassen');
    }
  }

  const evPlants = results.filter(r => r.plantData.hasEV);
  if (evPlants.length > 0) {
    const evDeviation = evPlants.reduce((sum, r) => sum + r.deviations.selfConsumptionAbsolute, 0) / evPlants.length;
    if (evDeviation > averageSelfConsumptionDeviation * 1.3) {
      recommendations.push('E-Auto-Anlagen zeigen erhöhte Abweichungen - Ladeprofil überprüfen');
    }
  }

  return {
    summary: {
      totalPlants,
      excellentCount,
      goodCount,
      acceptableCount,
      poorCount,
      averageAutarkyDeviation,
      averageSelfConsumptionDeviation,
      mapeAutarky,
      mapeSelfConsumption,
      rmseAutarky,
      rmseSelfConsumption,
      r2Autarky,
      r2SelfConsumption,
    },
    results,
    recommendations,
  };
}

// A/B-Test Funktionen
export interface ABTestResult {
  testName: string;
  methodA: string;
  methodB: string;
  results: {
    methodA: ValidationResult[];
    methodB: ValidationResult[];
  };
  comparison: {
    methodABetter: number; // Anzahl Anlagen wo Methode A besser war
    methodBBetter: number; // Anzahl Anlagen wo Methode B besser war
    averageImprovementA: number; // Durchschnittliche Verbesserung von A
    averageImprovementB: number; // Durchschnittliche Verbesserung von B
    significanceLevel: number; // Statistische Signifikanz
  };
}

export function runABTest(
  plantData: RealPlantData[],
  methodA: (data: RealPlantData) => ValidationResult,
  methodB: (data: RealPlantData) => ValidationResult,
  testName: string,
  methodAName: string,
  methodBName: string
): ABTestResult {
  const resultsA = plantData.map(methodA);
  const resultsB = plantData.map(methodB);

  let methodABetter = 0;
  let methodBBetter = 0;
  let totalImprovementA = 0;
  let totalImprovementB = 0;

  for (let i = 0; i < plantData.length; i++) {
    const errorA = resultsA[i].deviations.autarkyAbsolute + resultsA[i].deviations.selfConsumptionAbsolute;
    const errorB = resultsB[i].deviations.autarkyAbsolute + resultsB[i].deviations.selfConsumptionAbsolute;
    
    if (errorA < errorB) {
      methodABetter++;
      totalImprovementA += (errorB - errorA);
    } else if (errorB < errorA) {
      methodBBetter++;
      totalImprovementB += (errorA - errorB);
    }
  }

  const averageImprovementA = methodABetter > 0 ? totalImprovementA / methodABetter : 0;
  const averageImprovementB = methodBBetter > 0 ? totalImprovementB / methodBBetter : 0;

  // Vereinfachte Signifikanzberechnung (Chi-Quadrat-Test)
  const expected = plantData.length / 2;
  const chiSquare = Math.pow(methodABetter - expected, 2) / expected + 
                   Math.pow(methodBBetter - expected, 2) / expected;
  const significanceLevel = chiSquare > 3.84 ? 0.05 : (chiSquare > 2.71 ? 0.1 : 1.0);

  return {
    testName,
    methodA: methodAName,
    methodB: methodBName,
    results: {
      methodA: resultsA,
      methodB: resultsB,
    },
    comparison: {
      methodABetter,
      methodBBetter,
      averageImprovementA,
      averageImprovementB,
      significanceLevel,
    },
  };
}

// Beispiel-Testdaten Generator (für Entwicklung/Testing)
export function generateSamplePlantData(count: number): RealPlantData[] {
  const sampleData: RealPlantData[] = [];
  
  for (let i = 0; i < count; i++) {
    const installedPowerKWp = 5 + Math.random() * 45; // 5-50 kWp
    const batteryCapacityKWh = Math.random() > 0.5 ? Math.random() * 30 : 0; // 0-30 kWh
    const hasEV = Math.random() > 0.7;
    const hasHeatPump = Math.random() > 0.8;
    
    const actualAnnualPVKWh = installedPowerKWp * (900 + Math.random() * 300); // 900-1200 kWh/kWp
    const householdConsumptionKWh = 2000 + Math.random() * 6000; // 2-8 MWh
    const evConsumptionKWh = hasEV ? Math.random() * 4000 : 0; // 0-4 MWh
    const heatPumpConsumptionKWh = hasHeatPump ? Math.random() * 6000 : 0; // 0-6 MWh
    const actualAnnualConsumptionKWh = householdConsumptionKWh + evConsumptionKWh + heatPumpConsumptionKWh;
    
    // Simuliere realistische Autarkie/Eigenverbrauch mit etwas Rauschen
    const baseAutarky = Math.min(0.9, actualAnnualPVKWh / actualAnnualConsumptionKWh);
    const actualAutarkyPercent = Math.max(0, Math.min(95, baseAutarky * 100 + (Math.random() - 0.5) * 10));
    
    const baseSelfConsumption = Math.min(0.8, actualAnnualConsumptionKWh / actualAnnualPVKWh);
    const actualSelfConsumptionPercent = Math.max(0, Math.min(95, baseSelfConsumption * 100 + (Math.random() - 0.5) * 8));
    
    const actualSelfConsumptionKWh = actualAnnualPVKWh * (actualSelfConsumptionPercent / 100);
    const actualFeedInKWh = actualAnnualPVKWh - actualSelfConsumptionKWh;
    const actualGridImportKWh = actualAnnualConsumptionKWh - actualSelfConsumptionKWh;

    sampleData.push({
      plantId: `plant_${i + 1}`,
      installedPowerKWp,
      batteryCapacityKWh: batteryCapacityKWh > 0 ? batteryCapacityKWh : undefined,
      hasEV,
      hasHeatPump,
      location: { lat: 49 + Math.random() * 4, lng: 6 + Math.random() * 9 }, // Deutschland
      actualAnnualPVKWh,
      actualAnnualConsumptionKWh,
      actualGridImportKWh,
      actualFeedInKWh,
      actualSelfConsumptionKWh,
      actualAutarkyPercent,
      actualSelfConsumptionPercent,
      householdConsumptionKWh,
      evConsumptionKWh: evConsumptionKWh > 0 ? evConsumptionKWh : undefined,
      heatPumpConsumptionKWh: heatPumpConsumptionKWh > 0 ? heatPumpConsumptionKWh : undefined,
    });
  }
  
  return sampleData;
}
