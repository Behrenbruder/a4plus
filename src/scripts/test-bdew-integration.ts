// /src/scripts/test-bdew-integration.ts
import { calculateBDEWBasedMetrics } from '@/lib/pvcalc';

/**
 * Test der BDEW-Integration mit automatischer H25/S25-Auswahl
 */
function testBDEWIntegration() {
  console.log('🧪 Test der BDEW-Integration mit automatischer Profilauswahl\n');
  
  // Testdaten
  const testCases = [
    {
      name: 'Ohne Speicher (sollte H25 verwenden)',
      annualPVKWh: 8000,
      householdConsumptionKWh: 4000,
      batteryCapacityKWh: 0,
      evConsumptionKWh: 0,
      heatPumpConsumptionKWh: 0
    },
    {
      name: 'Mit Speicher (sollte S25 verwenden)',
      annualPVKWh: 8000,
      householdConsumptionKWh: 4000,
      batteryCapacityKWh: 10,
      evConsumptionKWh: 0,
      heatPumpConsumptionKWh: 0
    },
    {
      name: 'Mit Speicher + E-Auto (sollte S25 verwenden)',
      annualPVKWh: 12000,
      householdConsumptionKWh: 4000,
      batteryCapacityKWh: 15,
      evConsumptionKWh: 3000,
      heatPumpConsumptionKWh: 0
    },
    {
      name: 'Mit Speicher + E-Auto + Wärmepumpe (sollte S25 verwenden)',
      annualPVKWh: 15000,
      householdConsumptionKWh: 4000,
      batteryCapacityKWh: 20,
      evConsumptionKWh: 3000,
      heatPumpConsumptionKWh: 5000
    }
  ];
  
  console.log('═'.repeat(100));
  console.log('Test-Nr. │ Szenario                                    │ Profil │ Autarkie │ Eigenverbrauch │ Netzimport │ Einspeisung');
  console.log('─'.repeat(100));
  
  testCases.forEach((testCase, index) => {
    try {
      const result = calculateBDEWBasedMetrics(
        testCase.annualPVKWh,
        testCase.householdConsumptionKWh,
        testCase.batteryCapacityKWh,
        testCase.evConsumptionKWh,
        testCase.heatPumpConsumptionKWh
      );
      
      const totalConsumption = testCase.householdConsumptionKWh + testCase.evConsumptionKWh + testCase.heatPumpConsumptionKWh;
      
      console.log(
        `${(index + 1).toString().padStart(8)} │ ${testCase.name.padEnd(43)} │ ${result.profileUsed.padEnd(6)} │ ${(result.autarky * 100).toFixed(1).padStart(7)}% │ ${(result.selfConsumption * 100).toFixed(1).padStart(13)}% │ ${Math.round(result.gridImport).toLocaleString().padStart(9)} │ ${Math.round(result.feedIn).toLocaleString().padStart(10)}`
      );
      
      // Validierung der Profilauswahl
      const expectedProfile = testCase.batteryCapacityKWh > 0 ? 'S25' : 'H25';
      if (result.profileUsed !== expectedProfile) {
        console.log(`   ❌ FEHLER: Erwartet ${expectedProfile}, aber ${result.profileUsed} verwendet!`);
      } else {
        console.log(`   ✅ Korrekte Profilauswahl: ${result.profileUsed}`);
      }
      
      // Plausibilitätsprüfung
      if (result.autarky < 0 || result.autarky > 1) {
        console.log(`   ❌ FEHLER: Autarkie außerhalb 0-1: ${result.autarky}`);
      }
      if (result.selfConsumption < 0 || result.selfConsumption > 1) {
        console.log(`   ❌ FEHLER: Eigenverbrauch außerhalb 0-1: ${result.selfConsumption}`);
      }
      
      // Energiebilanz prüfen (berücksichtigt Batterieverluste)
      const calculatedSelfConsumption = testCase.annualPVKWh * result.selfConsumption;
      const pvUsed = calculatedSelfConsumption + result.feedIn;
      const energyBalance = Math.abs(pvUsed - testCase.annualPVKWh);
      
      // Bei Batteriesystemen sind Verluste normal (Round-Trip-Effizienz ~92%)
      const expectedLossRate = testCase.batteryCapacityKWh > 0 ? 0.08 : 0.01; // 8% bei Batterie, 1% ohne
      const maxExpectedLoss = testCase.annualPVKWh * expectedLossRate;
      
      if (energyBalance > maxExpectedLoss) {
        console.log(`   ❌ FEHLER: Energiebilanz außerhalb erwarteter Verluste: ${energyBalance.toFixed(1)} kWh (max. ${maxExpectedLoss.toFixed(1)} kWh)`);
      } else if (testCase.batteryCapacityKWh > 0 && energyBalance > 1) {
        console.log(`   ✅ Batterieverluste im erwarteten Bereich: ${energyBalance.toFixed(1)} kWh`);
      }
      
      console.log(''); // Leerzeile
      
    } catch (error) {
      console.log(`   ❌ FEHLER bei Test ${index + 1}: ${error}`);
    }
  });
  
  console.log('═'.repeat(100));
  
  // Vergleichstest: H25 vs S25 bei gleichen Bedingungen
  console.log('\n🔍 Vergleichstest: H25 vs S25 bei gleichen Bedingungen');
  console.log('─'.repeat(80));
  
  const comparisonTest = {
    annualPVKWh: 10000,
    householdConsumptionKWh: 4000,
    evConsumptionKWh: 2000,
    heatPumpConsumptionKWh: 3000
  };
  
  // Test ohne Speicher (H25)
  const h25Result = calculateBDEWBasedMetrics(
    comparisonTest.annualPVKWh,
    comparisonTest.householdConsumptionKWh,
    0, // Kein Speicher
    comparisonTest.evConsumptionKWh,
    comparisonTest.heatPumpConsumptionKWh
  );
  
  // Test mit Speicher (S25)
  const s25Result = calculateBDEWBasedMetrics(
    comparisonTest.annualPVKWh,
    comparisonTest.householdConsumptionKWh,
    15, // Mit Speicher
    comparisonTest.evConsumptionKWh,
    comparisonTest.heatPumpConsumptionKWh
  );
  
  console.log(`H25 (ohne Speicher): Autarkie ${(h25Result.autarky * 100).toFixed(1)}%, Eigenverbrauch ${(h25Result.selfConsumption * 100).toFixed(1)}%`);
  console.log(`S25 (mit Speicher):  Autarkie ${(s25Result.autarky * 100).toFixed(1)}%, Eigenverbrauch ${(s25Result.selfConsumption * 100).toFixed(1)}%`);
  
  const autarkyImprovement = ((s25Result.autarky - h25Result.autarky) * 100).toFixed(1);
  const selfConsumptionImprovement = ((s25Result.selfConsumption - h25Result.selfConsumption) * 100).toFixed(1);
  
  console.log(`Verbesserung durch Speicher: +${autarkyImprovement}% Autarkie, +${selfConsumptionImprovement}% Eigenverbrauch`);
  
  console.log('\n🎉 BDEW-Integration Test abgeschlossen!');
}

// Führe Test aus, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  testBDEWIntegration();
}

export { testBDEWIntegration };
