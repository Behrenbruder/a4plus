// /src/scripts/debug-energy-balance.ts
import { calculateBDEWBasedMetrics, hourlyPVFromAnnual, dispatchGreedy } from '@/lib/pvcalc';
import { generateH25YearProfile, generateS25YearProfile } from '@/lib/bdewProfiles';

/**
 * Debug-Skript zur Analyse der Energiebilanz
 */
function debugEnergyBalance() {
  console.log('🔍 Debug: Energiebilanz-Analyse\n');
  
  // Testfall mit Speicher
  const testCase = {
    annualPVKWh: 8000,
    householdConsumptionKWh: 4000,
    batteryCapacityKWh: 10,
    evConsumptionKWh: 0,
    heatPumpConsumptionKWh: 0
  };
  
  console.log('Testfall:', testCase);
  console.log('─'.repeat(60));
  
  // Schritt 1: Generiere Profile
  const totalConsumptionKWh = testCase.householdConsumptionKWh + testCase.evConsumptionKWh + testCase.heatPumpConsumptionKWh;
  const profileType = testCase.batteryCapacityKWh > 0 ? 'S25' : 'H25';
  
  console.log(`Profil-Typ: ${profileType}`);
  console.log(`Gesamtverbrauch: ${totalConsumptionKWh} kWh`);
  
  // Generiere das entsprechende BDEW-Profil für das ganze Jahr
  const loadProfile = profileType === 'H25' 
    ? generateH25YearProfile(2024) 
    : generateS25YearProfile(2024);
  
  // Normiere Profil auf tatsächlichen Jahresverbrauch
  const profileSum = loadProfile.reduce((sum, value) => sum + value, 0);
  const normalizedLoadProfile = loadProfile.map(value => 
    (value / profileSum) * totalConsumptionKWh
  );
  
  console.log(`Profil-Summe vor Normierung: ${profileSum.toFixed(2)}`);
  console.log(`Profil-Summe nach Normierung: ${normalizedLoadProfile.reduce((a, b) => a + b, 0).toFixed(2)} kWh`);
  
  // Generiere PV-Profil (8760 Stunden)
  const pvProfile = hourlyPVFromAnnual(testCase.annualPVKWh);
  const pvSum = pvProfile.reduce((a, b) => a + b, 0);
  console.log(`PV-Profil Summe: ${pvSum.toFixed(2)} kWh`);
  
  // Simuliere Batterieverhalten mit BDEW-Profilen
  const dispatch = dispatchGreedy(
    pvProfile,
    normalizedLoadProfile,
    testCase.batteryCapacityKWh > 0 ? {
      usableKWh: testCase.batteryCapacityKWh,
      chargePowerKW: testCase.batteryCapacityKWh * 0.5, // 0.5C
      dischargePowerKW: testCase.batteryCapacityKWh * 0.5, // 0.5C
      roundTripEff: 0.92,
      minSoCFrac: 0.1
    } : undefined
  );
  
  console.log('\nDispatch-Ergebnisse:');
  console.log(`Grid Import: ${dispatch.gridImportKWh.toFixed(2)} kWh`);
  console.log(`Feed In: ${dispatch.feedInKWh.toFixed(2)} kWh`);
  console.log(`Self Consumption: ${dispatch.selfConsumptionKWh.toFixed(2)} kWh`);
  
  // Energiebilanz-Checks
  console.log('\n📊 Energiebilanz-Checks:');
  console.log('─'.repeat(40));
  
  const totalInput = pvSum + dispatch.gridImportKWh;
  const totalOutput = dispatch.selfConsumptionKWh + dispatch.feedInKWh;
  const energyDifference = Math.abs(totalInput - totalOutput);
  
  console.log(`Total Input (PV + Grid): ${totalInput.toFixed(2)} kWh`);
  console.log(`Total Output (Self + Feed): ${totalOutput.toFixed(2)} kWh`);
  console.log(`Energiedifferenz: ${energyDifference.toFixed(2)} kWh`);
  
  // Verbrauchsbilanz
  const totalConsumptionFromDispatch = dispatch.selfConsumptionKWh + dispatch.gridImportKWh;
  const consumptionDifference = Math.abs(totalConsumptionFromDispatch - totalConsumptionKWh);
  
  console.log(`\nVerbrauchsbilanz:`);
  console.log(`Erwarteter Verbrauch: ${totalConsumptionKWh.toFixed(2)} kWh`);
  console.log(`Tatsächlicher Verbrauch (Self + Grid): ${totalConsumptionFromDispatch.toFixed(2)} kWh`);
  console.log(`Verbrauchsdifferenz: ${consumptionDifference.toFixed(2)} kWh`);
  
  // PV-Bilanz
  const pvUsed = dispatch.selfConsumptionKWh + dispatch.feedInKWh;
  const pvDifference = Math.abs(pvUsed - pvSum);
  
  console.log(`\nPV-Bilanz:`);
  console.log(`PV-Erzeugung: ${pvSum.toFixed(2)} kWh`);
  console.log(`PV verwendet (Self + Feed): ${pvUsed.toFixed(2)} kWh`);
  console.log(`PV-Differenz: ${pvDifference.toFixed(2)} kWh`);
  
  // Berechne finale Kennzahlen
  const autarky = 1 - (dispatch.gridImportKWh / totalConsumptionKWh);
  const selfConsumption = dispatch.selfConsumptionKWh / pvSum;
  
  console.log(`\n📈 Finale Kennzahlen:`);
  console.log(`Autarkie: ${(autarky * 100).toFixed(1)}%`);
  console.log(`Eigenverbrauch: ${(selfConsumption * 100).toFixed(1)}%`);
  
  // Vergleiche mit calculateBDEWBasedMetrics
  console.log(`\n🔄 Vergleich mit calculateBDEWBasedMetrics:`);
  const result = calculateBDEWBasedMetrics(
    testCase.annualPVKWh,
    testCase.householdConsumptionKWh,
    testCase.batteryCapacityKWh,
    testCase.evConsumptionKWh,
    testCase.heatPumpConsumptionKWh
  );
  
  console.log(`Funktion - Autarkie: ${(result.autarky * 100).toFixed(1)}%`);
  console.log(`Funktion - Eigenverbrauch: ${(result.selfConsumption * 100).toFixed(1)}%`);
  console.log(`Funktion - Grid Import: ${result.gridImport.toFixed(2)} kWh`);
  console.log(`Funktion - Feed In: ${result.feedIn.toFixed(2)} kWh`);
}

// Führe Debug aus, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  debugEnergyBalance();
}

export { debugEnergyBalance };
