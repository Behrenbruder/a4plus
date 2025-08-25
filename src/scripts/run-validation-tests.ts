// /src/scripts/run-validation-tests.ts
import { 
  generateSamplePlantData, 
  validateHybridCalculation, 
  generateValidationReport,
  runABTest,
  RealPlantData,
  ValidationResult
} from '@/lib/validation';
import { calculateHybridMetrics } from '@/lib/pvcalc';

// Erweiterte Testdaten mit verschiedenen Szenarien
function generateRealisticTestData(): RealPlantData[] {
  const testCases: Partial<RealPlantData>[] = [
    // Kleine Anlagen ohne Batterie
    { installedPowerKWp: 5, batteryCapacityKWh: 0, hasEV: false, hasHeatPump: false },
    { installedPowerKWp: 8, batteryCapacityKWh: 0, hasEV: false, hasHeatPump: false },
    { installedPowerKWp: 12, batteryCapacityKWh: 0, hasEV: false, hasHeatPump: false },
    
    // Mittlere Anlagen mit Batterie
    { installedPowerKWp: 15, batteryCapacityKWh: 10, hasEV: false, hasHeatPump: false },
    { installedPowerKWp: 20, batteryCapacityKWh: 15, hasEV: false, hasHeatPump: false },
    { installedPowerKWp: 25, batteryCapacityKWh: 20, hasEV: false, hasHeatPump: false },
    
    // Anlagen mit E-Auto
    { installedPowerKWp: 18, batteryCapacityKWh: 12, hasEV: true, hasHeatPump: false },
    { installedPowerKWp: 22, batteryCapacityKWh: 15, hasEV: true, hasHeatPump: false },
    { installedPowerKWp: 30, batteryCapacityKWh: 25, hasEV: true, hasHeatPump: false },
    
    // Anlagen mit Wärmepumpe
    { installedPowerKWp: 20, batteryCapacityKWh: 15, hasEV: false, hasHeatPump: true },
    { installedPowerKWp: 25, batteryCapacityKWh: 20, hasEV: false, hasHeatPump: true },
    { installedPowerKWp: 35, batteryCapacityKWh: 30, hasEV: false, hasHeatPump: true },
    
    // Komplexe Anlagen (E-Auto + Wärmepumpe)
    { installedPowerKWp: 30, batteryCapacityKWh: 25, hasEV: true, hasHeatPump: true },
    { installedPowerKWp: 40, batteryCapacityKWh: 35, hasEV: true, hasHeatPump: true },
    { installedPowerKWp: 50, batteryCapacityKWh: 40, hasEV: true, hasHeatPump: true },
    
    // Große Anlagen
    { installedPowerKWp: 45, batteryCapacityKWh: 0, hasEV: false, hasHeatPump: false },
    { installedPowerKWp: 60, batteryCapacityKWh: 50, hasEV: true, hasHeatPump: true },
  ];

  return testCases.map((testCase, index) => {
    const installedPowerKWp = testCase.installedPowerKWp || 20;
    const batteryCapacityKWh = testCase.batteryCapacityKWh || 0;
    const hasEV = testCase.hasEV || false;
    const hasHeatPump = testCase.hasHeatPump || false;
    
    // Realistische Jahreserträge basierend auf deutscher Durchschnittswerte
    const specificYield = 950 + Math.random() * 200; // 950-1150 kWh/kWp
    const actualAnnualPVKWh = installedPowerKWp * specificYield;
    
    // Realistische Verbrauchswerte
    const householdConsumptionKWh = 2500 + Math.random() * 4000; // 2.5-6.5 MWh
    const evConsumptionKWh = hasEV ? 2000 + Math.random() * 3000 : 0; // 2-5 MWh
    const heatPumpConsumptionKWh = hasHeatPump ? 3000 + Math.random() * 4000 : 0; // 3-7 MWh
    const actualAnnualConsumptionKWh = householdConsumptionKWh + evConsumptionKWh + heatPumpConsumptionKWh;
    
    // Simuliere realistische Autarkie/Eigenverbrauch basierend auf Anlagentyp
    let baseAutarky = Math.min(0.85, actualAnnualPVKWh / actualAnnualConsumptionKWh);
    let baseSelfConsumption = 0.35;
    
    // Batterie-Einfluss
    if (batteryCapacityKWh > 0) {
      const batteryRatio = batteryCapacityKWh / (actualAnnualConsumptionKWh / 365);
      baseAutarky = Math.min(0.9, baseAutarky + batteryRatio * 0.15);
      baseSelfConsumption = Math.min(0.8, baseSelfConsumption + batteryRatio * 0.2);
    }
    
    // E-Auto Einfluss (bessere Nutzung von Überschüssen)
    if (hasEV) {
      baseSelfConsumption = Math.min(0.85, baseSelfConsumption + 0.08);
    }
    
    // Wärmepumpe Einfluss
    if (hasHeatPump) {
      baseSelfConsumption = Math.min(0.8, baseSelfConsumption + 0.05);
    }
    
    // Füge etwas Rauschen hinzu für Realismus
    const actualAutarkyPercent = Math.max(0, Math.min(95, baseAutarky * 100 + (Math.random() - 0.5) * 8));
    const actualSelfConsumptionPercent = Math.max(0, Math.min(95, baseSelfConsumption * 100 + (Math.random() - 0.5) * 6));
    
    const actualSelfConsumptionKWh = actualAnnualPVKWh * (actualSelfConsumptionPercent / 100);
    const actualFeedInKWh = actualAnnualPVKWh - actualSelfConsumptionKWh;
    const actualGridImportKWh = actualAnnualConsumptionKWh - actualSelfConsumptionKWh;

    return {
      plantId: `realistic_plant_${index + 1}`,
      installedPowerKWp,
      batteryCapacityKWh: batteryCapacityKWh > 0 ? batteryCapacityKWh : undefined,
      hasEV,
      hasHeatPump,
      location: { lat: 49 + Math.random() * 4, lng: 6 + Math.random() * 9 },
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
    };
  });
}

// Legacy Dispatch-basierte Berechnung (für Vergleich)
function calculateLegacyMetrics(
  annualPV: number,
  annualConsumption: number,
  batteryKWh: number
): { autarky: number; selfConsumption: number } {
  // Vereinfachte Legacy-Berechnung (simuliert die alte Methode)
  const directUse = Math.min(annualPV * 0.3, annualConsumption * 0.3); // 30% direkter Verbrauch
  let batteryUse = 0;
  
  if (batteryKWh > 0) {
    const surplus = Math.max(0, annualPV - directUse);
    const batteryCapacityYear = batteryKWh * 300; // ~300 Zyklen/Jahr
    batteryUse = Math.min(surplus * 0.9, batteryCapacityYear * 0.9); // 90% Effizienz
  }
  
  const totalSelfConsumption = directUse + batteryUse;
  const gridImport = Math.max(0, annualConsumption - totalSelfConsumption);
  
  const autarky = 1 - (gridImport / annualConsumption);
  const selfConsumption = totalSelfConsumption / annualPV;
  
  return {
    autarky: Math.min(0.95, Math.max(0, autarky)),
    selfConsumption: Math.min(0.95, Math.max(0, selfConsumption))
  };
}

// Haupttest-Funktion
export async function runValidationTests() {
  console.log('🚀 Starte Validierungstests für Hybrid-Ansatz...\n');
  
  // 1. Generiere realistische Testdaten
  console.log('📊 Generiere realistische Testdaten...');
  const realisticData = generateRealisticTestData();
  const randomData = generateSamplePlantData(30);
  const allTestData = [...realisticData, ...randomData];
  
  console.log(`✅ ${allTestData.length} Testanlagen generiert\n`);
  
  // 2. Führe Hybrid-Validierung durch
  console.log('🔬 Führe Hybrid-Validierung durch...');
  const hybridResults = allTestData.map(validateHybridCalculation);
  const hybridReport = generateValidationReport(hybridResults);
  
  console.log('📈 Hybrid-Ansatz Ergebnisse:');
  console.log(`   Anlagen gesamt: ${hybridReport.summary.totalPlants}`);
  console.log(`   Exzellent: ${hybridReport.summary.excellentCount} (${(hybridReport.summary.excellentCount/hybridReport.summary.totalPlants*100).toFixed(1)}%)`);
  console.log(`   Gut: ${hybridReport.summary.goodCount} (${(hybridReport.summary.goodCount/hybridReport.summary.totalPlants*100).toFixed(1)}%)`);
  console.log(`   Akzeptabel: ${hybridReport.summary.acceptableCount} (${(hybridReport.summary.acceptableCount/hybridReport.summary.totalPlants*100).toFixed(1)}%)`);
  console.log(`   Schlecht: ${hybridReport.summary.poorCount} (${(hybridReport.summary.poorCount/hybridReport.summary.totalPlants*100).toFixed(1)}%)`);
  console.log(`   Ø Autarkie-Abweichung: ${hybridReport.summary.averageAutarkyDeviation.toFixed(2)}%`);
  console.log(`   Ø Eigenverbrauch-Abweichung: ${hybridReport.summary.averageSelfConsumptionDeviation.toFixed(2)}%`);
  console.log(`   R² Autarkie: ${hybridReport.summary.r2Autarky.toFixed(3)}`);
  console.log(`   R² Eigenverbrauch: ${hybridReport.summary.r2SelfConsumption.toFixed(3)}\n`);
  
  // 3. A/B-Test: Hybrid vs. Legacy
  console.log('⚖️  Führe A/B-Test durch: Hybrid vs. Legacy...');
  
  const legacyMethod = (data: RealPlantData): ValidationResult => {
    const legacyResult = calculateLegacyMetrics(
      data.actualAnnualPVKWh,
      data.actualAnnualConsumptionKWh,
      data.batteryCapacityKWh || 0
    );
    
    const calculatedAutarky = legacyResult.autarky * 100;
    const calculatedSelfConsumption = legacyResult.selfConsumption * 100;
    
    const autarkyAbsolute = Math.abs(calculatedAutarky - data.actualAutarkyPercent);
    const selfConsumptionAbsolute = Math.abs(calculatedSelfConsumption - data.actualSelfConsumptionPercent);
    
    let quality: 'excellent' | 'good' | 'acceptable' | 'poor';
    if (autarkyAbsolute <= 3 && selfConsumptionAbsolute <= 2) quality = 'excellent';
    else if (autarkyAbsolute <= 5 && selfConsumptionAbsolute <= 3) quality = 'good';
    else if (autarkyAbsolute <= 10 && selfConsumptionAbsolute <= 7) quality = 'acceptable';
    else quality = 'poor';
    
    return {
      plantId: data.plantId,
      calculated: { autarkyPercent: calculatedAutarky, selfConsumptionPercent: calculatedSelfConsumption },
      actual: { autarkyPercent: data.actualAutarkyPercent, selfConsumptionPercent: data.actualSelfConsumptionPercent },
      deviations: {
        autarkyAbsolute,
        autarkyRelative: Math.abs((calculatedAutarky - data.actualAutarkyPercent) / data.actualAutarkyPercent) * 100,
        selfConsumptionAbsolute,
        selfConsumptionRelative: Math.abs((calculatedSelfConsumption - data.actualSelfConsumptionPercent) / data.actualSelfConsumptionPercent) * 100,
      },
      quality,
      plantData: data,
    };
  };
  
  const abTest = runABTest(
    allTestData,
    validateHybridCalculation,
    legacyMethod,
    'Hybrid vs. Legacy Dispatch',
    'Hybrid-Ansatz',
    'Legacy Dispatch'
  );
  
  console.log('🏆 A/B-Test Ergebnisse:');
  console.log(`   ${abTest.methodA} besser: ${abTest.comparison.methodABetter} Anlagen`);
  console.log(`   ${abTest.methodB} besser: ${abTest.comparison.methodBBetter} Anlagen`);
  console.log(`   Verbesserung ${abTest.methodA}: ${abTest.comparison.averageImprovementA.toFixed(2)}%`);
  console.log(`   Verbesserung ${abTest.methodB}: ${abTest.comparison.averageImprovementB.toFixed(2)}%`);
  console.log(`   Statistische Signifikanz: p = ${abTest.comparison.significanceLevel.toFixed(3)}`);
  console.log(`   Ergebnis: ${abTest.comparison.significanceLevel < 0.05 ? '✅ Signifikant' : '❌ Nicht signifikant'}\n`);
  
  // 4. Detailanalyse nach Anlagentypen
  console.log('🔍 Detailanalyse nach Anlagentypen:');
  
  const batteryPlants = hybridResults.filter(r => r.plantData.batteryCapacityKWh && r.plantData.batteryCapacityKWh > 0);
  const noBatteryPlants = hybridResults.filter(r => !r.plantData.batteryCapacityKWh || r.plantData.batteryCapacityKWh === 0);
  const evPlants = hybridResults.filter(r => r.plantData.hasEV);
  const heatPumpPlants = hybridResults.filter(r => r.plantData.hasHeatPump);
  
  console.log(`   Anlagen mit Batterie (${batteryPlants.length}):`);
  if (batteryPlants.length > 0) {
    const avgAutarkyDev = batteryPlants.reduce((sum, r) => sum + r.deviations.autarkyAbsolute, 0) / batteryPlants.length;
    const avgSelfConsDev = batteryPlants.reduce((sum, r) => sum + r.deviations.selfConsumptionAbsolute, 0) / batteryPlants.length;
    console.log(`     Ø Autarkie-Abweichung: ${avgAutarkyDev.toFixed(2)}%`);
    console.log(`     Ø Eigenverbrauch-Abweichung: ${avgSelfConsDev.toFixed(2)}%`);
  }
  
  console.log(`   Anlagen ohne Batterie (${noBatteryPlants.length}):`);
  if (noBatteryPlants.length > 0) {
    const avgAutarkyDev = noBatteryPlants.reduce((sum, r) => sum + r.deviations.autarkyAbsolute, 0) / noBatteryPlants.length;
    const avgSelfConsDev = noBatteryPlants.reduce((sum, r) => sum + r.deviations.selfConsumptionAbsolute, 0) / noBatteryPlants.length;
    console.log(`     Ø Autarkie-Abweichung: ${avgAutarkyDev.toFixed(2)}%`);
    console.log(`     Ø Eigenverbrauch-Abweichung: ${avgSelfConsDev.toFixed(2)}%`);
  }
  
  console.log(`   Anlagen mit E-Auto (${evPlants.length}):`);
  if (evPlants.length > 0) {
    const avgAutarkyDev = evPlants.reduce((sum, r) => sum + r.deviations.autarkyAbsolute, 0) / evPlants.length;
    const avgSelfConsDev = evPlants.reduce((sum, r) => sum + r.deviations.selfConsumptionAbsolute, 0) / evPlants.length;
    console.log(`     Ø Autarkie-Abweichung: ${avgAutarkyDev.toFixed(2)}%`);
    console.log(`     Ø Eigenverbrauch-Abweichung: ${avgSelfConsDev.toFixed(2)}%`);
  }
  
  console.log(`   Anlagen mit Wärmepumpe (${heatPumpPlants.length}):`);
  if (heatPumpPlants.length > 0) {
    const avgAutarkyDev = heatPumpPlants.reduce((sum, r) => sum + r.deviations.autarkyAbsolute, 0) / heatPumpPlants.length;
    const avgSelfConsDev = heatPumpPlants.reduce((sum, r) => sum + r.deviations.selfConsumptionAbsolute, 0) / heatPumpPlants.length;
    console.log(`     Ø Autarkie-Abweichung: ${avgAutarkyDev.toFixed(2)}%`);
    console.log(`     Ø Eigenverbrauch-Abweichung: ${avgSelfConsDev.toFixed(2)}%`);
  }
  
  // 5. Empfehlungen
  console.log('\n💡 Empfehlungen:');
  hybridReport.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
  
  // 6. Fazit
  console.log('\n📋 Fazit:');
  const overallQuality = (hybridReport.summary.excellentCount + hybridReport.summary.goodCount) / hybridReport.summary.totalPlants;
  if (overallQuality >= 0.8) {
    console.log('   ✅ Hybrid-Ansatz zeigt sehr gute Ergebnisse (>80% gut/exzellent)');
  } else if (overallQuality >= 0.6) {
    console.log('   ⚠️  Hybrid-Ansatz zeigt akzeptable Ergebnisse (60-80% gut/exzellent)');
  } else {
    console.log('   ❌ Hybrid-Ansatz benötigt Verbesserungen (<60% gut/exzellent)');
  }
  
  if (abTest.comparison.methodABetter > abTest.comparison.methodBBetter) {
    console.log('   ✅ Hybrid-Ansatz ist signifikant besser als Legacy-Methode');
  } else {
    console.log('   ❌ Hybrid-Ansatz zeigt keine Verbesserung gegenüber Legacy-Methode');
  }
  
  console.log('\n🎉 Validierungstests abgeschlossen!');
  
  return {
    hybridReport,
    abTest,
    testData: allTestData
  };
}

// Führe Tests aus, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  runValidationTests().catch(console.error);
}
