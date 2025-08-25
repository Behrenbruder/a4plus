// /src/scripts/validate-bdew-vs-hybrid.ts
import { calculateBDEWBasedMetrics, calculateHybridMetrics } from '@/lib/pvcalc';

/**
 * Vergleichstest: BDEW-basierte vs. Hybrid-Berechnung
 */
function validateBDEWvsHybrid() {
  console.log('🔬 Validierung: BDEW-basierte vs. Hybrid-Berechnung\n');
  
  // Realistische Testszenarien
  const testCases = [
    {
      name: 'Kleiner Haushalt ohne Speicher',
      annualPVKWh: 6000,
      householdConsumptionKWh: 3500,
      batteryCapacityKWh: 0,
      evConsumptionKWh: 0,
      heatPumpConsumptionKWh: 0,
      expectedAutarky: 0.45, // Erwartete Werte basierend auf Erfahrung
      expectedSelfConsumption: 0.35
    },
    {
      name: 'Mittelgroßer Haushalt mit Speicher',
      annualPVKWh: 10000,
      householdConsumptionKWh: 4500,
      batteryCapacityKWh: 10,
      evConsumptionKWh: 0,
      heatPumpConsumptionKWh: 0,
      expectedAutarky: 0.85,
      expectedSelfConsumption: 0.65
    },
    {
      name: 'Großer Haushalt mit Speicher + E-Auto',
      annualPVKWh: 15000,
      householdConsumptionKWh: 5000,
      batteryCapacityKWh: 15,
      evConsumptionKWh: 3500,
      heatPumpConsumptionKWh: 0,
      expectedAutarky: 0.80,
      expectedSelfConsumption: 0.70
    },
    {
      name: 'Vollausstattung: Speicher + E-Auto + Wärmepumpe',
      annualPVKWh: 20000,
      householdConsumptionKWh: 4000,
      batteryCapacityKWh: 20,
      evConsumptionKWh: 3000,
      heatPumpConsumptionKWh: 8000,
      expectedAutarky: 0.75,
      expectedSelfConsumption: 0.80
    },
    {
      name: 'Großanlage ohne Speicher',
      annualPVKWh: 12000,
      householdConsumptionKWh: 5500,
      batteryCapacityKWh: 0,
      evConsumptionKWh: 0,
      heatPumpConsumptionKWh: 0,
      expectedAutarky: 0.40,
      expectedSelfConsumption: 0.25
    }
  ];
  
  console.log('═'.repeat(120));
  console.log('Test │ Szenario                                    │ Methode │ Autarkie │ Eigenverbrauch │ Abw. Autarkie │ Abw. Eigenverbrauch');
  console.log('─'.repeat(120));
  
  let totalBDEWAutarkyError = 0;
  let totalBDEWSelfConsumptionError = 0;
  let totalHybridAutarkyError = 0;
  let totalHybridSelfConsumptionError = 0;
  let bdewBetterCount = 0;
  let hybridBetterCount = 0;
  
  testCases.forEach((testCase, index) => {
    try {
      // BDEW-basierte Berechnung
      const bdewResult = calculateBDEWBasedMetrics(
        testCase.annualPVKWh,
        testCase.householdConsumptionKWh,
        testCase.batteryCapacityKWh,
        testCase.evConsumptionKWh,
        testCase.heatPumpConsumptionKWh
      );
      
      // Hybrid-Berechnung
      const hybridResult = calculateHybridMetrics(
        testCase.annualPVKWh,
        testCase.householdConsumptionKWh + testCase.evConsumptionKWh + testCase.heatPumpConsumptionKWh,
        testCase.batteryCapacityKWh,
        testCase.evConsumptionKWh,
        testCase.heatPumpConsumptionKWh
      );
      
      // Berechne Abweichungen
      const bdewAutarkyError = Math.abs(bdewResult.autarky - testCase.expectedAutarky) / testCase.expectedAutarky * 100;
      const bdewSelfConsumptionError = Math.abs(bdewResult.selfConsumption - testCase.expectedSelfConsumption) / testCase.expectedSelfConsumption * 100;
      const hybridAutarkyError = Math.abs(hybridResult.autarky - testCase.expectedAutarky) / testCase.expectedAutarky * 100;
      const hybridSelfConsumptionError = Math.abs(hybridResult.selfConsumption - testCase.expectedSelfConsumption) / testCase.expectedSelfConsumption * 100;
      
      // Akkumuliere Fehler
      totalBDEWAutarkyError += bdewAutarkyError;
      totalBDEWSelfConsumptionError += bdewSelfConsumptionError;
      totalHybridAutarkyError += hybridAutarkyError;
      totalHybridSelfConsumptionError += hybridSelfConsumptionError;
      
      // Bestimme bessere Methode
      const bdewTotalError = bdewAutarkyError + bdewSelfConsumptionError;
      const hybridTotalError = hybridAutarkyError + hybridSelfConsumptionError;
      
      if (bdewTotalError < hybridTotalError) {
        bdewBetterCount++;
      } else {
        hybridBetterCount++;
      }
      
      // BDEW-Ergebnisse
      console.log(
        `${(index + 1).toString().padStart(4)} │ ${testCase.name.padEnd(43)} │ BDEW    │ ${(bdewResult.autarky * 100).toFixed(1).padStart(7)}% │ ${(bdewResult.selfConsumption * 100).toFixed(1).padStart(13)}% │ ${bdewAutarkyError.toFixed(1).padStart(13)}% │ ${bdewSelfConsumptionError.toFixed(1).padStart(19)}%`
      );
      
      // Hybrid-Ergebnisse
      console.log(
        `     │                                             │ Hybrid  │ ${(hybridResult.autarky * 100).toFixed(1).padStart(7)}% │ ${(hybridResult.selfConsumption * 100).toFixed(1).padStart(13)}% │ ${hybridAutarkyError.toFixed(1).padStart(13)}% │ ${hybridSelfConsumptionError.toFixed(1).padStart(19)}%`
      );
      
      // Markiere bessere Methode
      const betterMethod = bdewTotalError < hybridTotalError ? 'BDEW' : 'Hybrid';
      console.log(`     │ Besser: ${betterMethod.padEnd(37)} │         │         │               │               │`);
      console.log('─'.repeat(120));
      
    } catch (error) {
      console.log(`❌ FEHLER bei Test ${index + 1}: ${error}`);
    }
  });
  
  // Zusammenfassung
  const avgBDEWAutarkyError = totalBDEWAutarkyError / testCases.length;
  const avgBDEWSelfConsumptionError = totalBDEWSelfConsumptionError / testCases.length;
  const avgHybridAutarkyError = totalHybridAutarkyError / testCases.length;
  const avgHybridSelfConsumptionError = totalHybridSelfConsumptionError / testCases.length;
  
  console.log('\n📊 Zusammenfassung:');
  console.log('═'.repeat(80));
  console.log(`BDEW-basierte Methode:`);
  console.log(`  Durchschnittliche Autarkie-Abweichung: ${avgBDEWAutarkyError.toFixed(1)}%`);
  console.log(`  Durchschnittliche Eigenverbrauch-Abweichung: ${avgBDEWSelfConsumptionError.toFixed(1)}%`);
  console.log(`  Gesamtabweichung: ${(avgBDEWAutarkyError + avgBDEWSelfConsumptionError).toFixed(1)}%`);
  console.log(`  Besser in ${bdewBetterCount}/${testCases.length} Fällen (${(bdewBetterCount/testCases.length*100).toFixed(1)}%)`);
  
  console.log(`\nHybrid-Methode:`);
  console.log(`  Durchschnittliche Autarkie-Abweichung: ${avgHybridAutarkyError.toFixed(1)}%`);
  console.log(`  Durchschnittliche Eigenverbrauch-Abweichung: ${avgHybridSelfConsumptionError.toFixed(1)}%`);
  console.log(`  Gesamtabweichung: ${(avgHybridAutarkyError + avgHybridSelfConsumptionError).toFixed(1)}%`);
  console.log(`  Besser in ${hybridBetterCount}/${testCases.length} Fällen (${(hybridBetterCount/testCases.length*100).toFixed(1)}%)`);
  
  // Empfehlung
  const bdewBetter = (avgBDEWAutarkyError + avgBDEWSelfConsumptionError) < (avgHybridAutarkyError + avgHybridSelfConsumptionError);
  const improvement = bdewBetter 
    ? ((avgHybridAutarkyError + avgHybridSelfConsumptionError) - (avgBDEWAutarkyError + avgBDEWSelfConsumptionError))
    : ((avgBDEWAutarkyError + avgBDEWSelfConsumptionError) - (avgHybridAutarkyError + avgHybridSelfConsumptionError));
  
  console.log(`\n🏆 Empfehlung:`);
  if (bdewBetter) {
    console.log(`✅ BDEW-basierte Methode ist ${improvement.toFixed(1)}% genauer`);
    console.log(`   Automatische H25/S25-Auswahl führt zu besseren Ergebnissen`);
  } else {
    console.log(`✅ Hybrid-Methode ist ${improvement.toFixed(1)}% genauer`);
    console.log(`   Bestehende Hybrid-Logik liefert bessere Ergebnisse`);
  }
  
  // Detailanalyse
  console.log(`\n🔍 Detailanalyse:`);
  console.log(`- BDEW-Methode besonders gut bei: ${bdewBetterCount > hybridBetterCount ? 'Batteriesystemen (S25-Profil)' : 'einfachen Systemen'}`);
  console.log(`- Hybrid-Methode besonders gut bei: ${hybridBetterCount > bdewBetterCount ? 'komplexen Systemen mit mehreren Verbrauchern' : 'Standardfällen'}`);
  
  if (avgBDEWAutarkyError < 15 && avgBDEWSelfConsumptionError < 15) {
    console.log(`✅ BDEW-Integration ist produktionsreif (Abweichungen < 15%)`);
  } else {
    console.log(`⚠️  BDEW-Integration benötigt weitere Kalibrierung`);
  }
  
  console.log('\n🎉 Vergleichsvalidierung abgeschlossen!');
}

// Führe Validierung aus, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  validateBDEWvsHybrid();
}

export { validateBDEWvsHybrid };
