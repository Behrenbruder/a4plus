# Vorschläge für Autarkiegrad und Eigenverbrauch Berechnung

## Aktuelle Situation
Nach den Änderungen am PV-Rechner:
- ✅ "Haushaltstyp auswählen" Option entfernt
- ✅ Hinweis hinzugefügt: Verbrauch ohne Wärmepumpe und E-Auto angeben
- ✅ BDEW Lastprofile gelöscht
- ✅ Wärmepumpe vereinfacht (nur kWh/Jahr Input)

## Problem
Die bisherige Berechnung von Autarkiegrad und Eigenverbrauch basierte auf stündlichen Lastprofilen, die jetzt entfernt wurden. Wir brauchen neue Ansätze für realistische Berechnungen.

## Vorschlag 1: Vereinfachte Monatsbasierte Berechnung

### Konzept
- Berechnung auf Monatsbasis statt stündlich
- Verwendung von Standardlastverteilungen
- Berücksichtigung saisonaler Unterschiede

### Implementierung
```typescript
function calculateMonthlyAutarky(
  monthlyPV: number[],           // 12 Monate PV-Erzeugung
  monthlyConsumption: number[],  // 12 Monate Verbrauch
  batteryKWh: number
): { autarky: number, selfConsumption: number } {
  
  let totalConsumption = 0;
  let totalPV = 0;
  let totalGridImport = 0;
  let totalSelfConsumption = 0;
  
  for (let month = 0; month < 12; month++) {
    const pv = monthlyPV[month];
    const consumption = monthlyConsumption[month];
    
    // Vereinfachte Batterieberechnung (30% der Monatskapazität nutzbar)
    const monthlyBatteryCapacity = batteryKWh * 30; // 30 Zyklen/Monat
    
    // Direktverbrauch (minimum von PV und Verbrauch)
    const directUse = Math.min(pv, consumption);
    
    // Überschuss für Batterie
    const surplus = Math.max(0, pv - consumption);
    const batteryCharge = Math.min(surplus, monthlyBatteryCapacity);
    
    // Verbleibender Bedarf
    const remainingNeed = Math.max(0, consumption - directUse);
    const batteryDischarge = Math.min(remainingNeed, batteryCharge * 0.9); // 90% Effizienz
    
    const gridImport = Math.max(0, remainingNeed - batteryDischarge);
    const selfConsumption = directUse + batteryDischarge;
    
    totalConsumption += consumption;
    totalPV += pv;
    totalGridImport += gridImport;
    totalSelfConsumption += selfConsumption;
  }
  
  const autarky = 1 - (totalGridImport / totalConsumption);
  const eigenverbrauch = totalSelfConsumption / totalPV;
  
  return { autarky, selfConsumption: eigenverbrauch };
}
```

### Vorteile
- ✅ Einfach zu verstehen und implementieren
- ✅ Keine komplexen Lastprofile nötig
- ✅ Berücksichtigt saisonale Schwankungen
- ✅ Realistische Batterieberechnung

### Nachteile
- ❌ Weniger präzise als stündliche Berechnung
- ❌ Überschätzt möglicherweise die Batterieeffizienz

## Vorschlag 2: Faktorbasierte Berechnung

### Konzept
- Verwendung empirischer Faktoren basierend auf Anlagengröße und Verbrauch
- Korrekturfaktoren für Batterie, E-Auto und Wärmepumpe

### Implementierung
```typescript
function calculateFactorBasedMetrics(
  annualPV: number,
  annualConsumption: number,
  batteryKWh: number,
  hasEV: boolean,
  hasHeatPump: boolean
): { autarky: number, selfConsumption: number } {
  
  // Basis-Eigenverbrauchsquote ohne Batterie
  const pvToConsumptionRatio = annualPV / annualConsumption;
  let baseSelfConsumption: number;
  
  if (pvToConsumptionRatio <= 0.3) {
    baseSelfConsumption = 0.95; // Fast alles wird direkt verbraucht
  } else if (pvToConsumptionRatio <= 0.7) {
    baseSelfConsumption = 0.75 - (pvToConsumptionRatio - 0.3) * 0.5;
  } else if (pvToConsumptionRatio <= 1.2) {
    baseSelfConsumption = 0.55 - (pvToConsumptionRatio - 0.7) * 0.3;
  } else {
    baseSelfConsumption = 0.40 - Math.min(0.15, (pvToConsumptionRatio - 1.2) * 0.1);
  }
  
  // Batterie-Bonus
  let batteryBonus = 0;
  if (batteryKWh > 0) {
    const batteryRatio = batteryKWh / (annualConsumption / 365); // Tagesverbrauch
    batteryBonus = Math.min(0.25, batteryRatio * 0.15); // Max 25% Bonus
  }
  
  // E-Auto Bonus (bessere Nutzung von Überschüssen)
  const evBonus = hasEV ? 0.05 : 0;
  
  // Wärmepumpe Bonus (Winter-Verbrauch passt zu PV-Schwäche, aber Sommer-Überschüsse)
  const heatPumpBonus = hasHeatPump ? 0.03 : 0;
  
  const selfConsumption = Math.min(0.95, baseSelfConsumption + batteryBonus + evBonus + heatPumpBonus);
  
  // Autarkiegrad berechnen
  const selfConsumptionKWh = annualPV * selfConsumption;
  const autarky = Math.min(0.95, selfConsumptionKWh / annualConsumption);
  
  return { autarky, selfConsumption };
}
```

### Vorteile
- ✅ Sehr schnell zu berechnen
- ✅ Basiert auf realen Erfahrungswerten
- ✅ Berücksichtigt verschiedene Verbraucher
- ✅ Keine komplexen Datenstrukturen nötig

### Nachteile
- ❌ Weniger individuell
- ❌ Faktoren müssen regelmäßig kalibriert werden

## Vorschlag 3: Hybridansatz (EMPFOHLEN)

### Konzept
Kombination aus vereinfachter stündlicher Simulation und Faktoren

### Implementierung
```typescript
function calculateHybridMetrics(
  annualPV: number,
  annualConsumption: number,
  batteryKWh: number,
  evConsumption: number,
  heatPumpConsumption: number
): { autarky: number, selfConsumption: number } {
  
  // 1. Generiere vereinfachte Tagesprofile (24h)
  const pvProfile = generateSimplePVProfile(); // Sinus-Kurve 6-18 Uhr
  const householdProfile = generateSimpleHouseholdProfile(); // Morgen/Abend Peaks
  const evProfile = generateSimpleEVProfile(); // Meist nachts
  const heatPumpProfile = generateSimpleHeatPumpProfile(); // Gleichmäßiger
  
  // 2. Skaliere auf Jahreswerte
  const dailyPV = annualPV / 365;
  const dailyHousehold = annualConsumption / 365;
  const dailyEV = evConsumption / 365;
  const dailyHeatPump = heatPumpConsumption / 365;
  
  // 3. Simuliere repräsentativen Tag für jede Jahreszeit
  const seasons = [
    { pvFactor: 0.4, name: 'Winter' },    // Wenig PV
    { pvFactor: 0.8, name: 'Frühling' },  // Mittlere PV
    { pvFactor: 1.4, name: 'Sommer' },    // Viel PV
    { pvFactor: 1.0, name: 'Herbst' }     // Mittlere PV
  ];
  
  let totalAutarky = 0;
  let totalSelfConsumption = 0;
  
  for (const season of seasons) {
    const seasonResult = simulateDay(
      pvProfile.map(h => h * dailyPV * season.pvFactor),
      householdProfile.map(h => h * dailyHousehold),
      evProfile.map(h => h * dailyEV),
      heatPumpProfile.map(h => h * dailyHeatPump),
      batteryKWh
    );
    
    totalAutarky += seasonResult.autarky;
    totalSelfConsumption += seasonResult.selfConsumption;
  }
  
  return {
    autarky: totalAutarky / 4,
    selfConsumption: totalSelfConsumption / 4
  };
}

function simulateDay(
  pvHourly: number[],
  householdHourly: number[],
  evHourly: number[],
  heatPumpHourly: number[],
  batteryKWh: number
): { autarky: number, selfConsumption: number } {
  
  let batterySOC = batteryKWh * 0.5; // Start bei 50%
  let totalConsumption = 0;
  let totalPV = 0;
  let totalGridImport = 0;
  let totalSelfConsumption = 0;
  
  for (let hour = 0; hour < 24; hour++) {
    const pv = pvHourly[hour];
    const consumption = householdHourly[hour] + evHourly[hour] + heatPumpHourly[hour];
    
    totalPV += pv;
    totalConsumption += consumption;
    
    // Direktverbrauch
    const directUse = Math.min(pv, consumption);
    let remainingPV = pv - directUse;
    let remainingConsumption = consumption - directUse;
    
    // Batterie laden
    if (remainingPV > 0) {
      const chargeAmount = Math.min(remainingPV, batteryKWh - batterySOC, batteryKWh * 0.5); // Max 0.5C
      batterySOC += chargeAmount * 0.95; // 95% Ladeeffizienz
      remainingPV -= chargeAmount;
    }
    
    // Batterie entladen
    if (remainingConsumption > 0) {
      const dischargeAmount = Math.min(remainingConsumption, batterySOC, batteryKWh * 0.5); // Max 0.5C
      batterySOC -= dischargeAmount;
      remainingConsumption -= dischargeAmount * 0.95; // 95% Entladeeffizienz
      totalSelfConsumption += dischargeAmount * 0.95;
    }
    
    totalGridImport += remainingConsumption;
    totalSelfConsumption += directUse;
  }
  
  const autarky = 1 - (totalGridImport / totalConsumption);
  const selfConsumption = totalSelfConsumption / totalPV;
  
  return { autarky, selfConsumption };
}
```

### Vorteile
- ✅ Gute Balance zwischen Genauigkeit und Einfachheit
- ✅ Berücksichtigt Tagesverläufe und saisonale Unterschiede
- ✅ Realistische Batteriesimulation
- ✅ Individuell anpassbar

### Nachteile
- ❌ Etwas komplexer zu implementieren
- ❌ Benötigt mehr Rechenzeit

## Empfehlung

**Ich empfehle Vorschlag 3 (Hybridansatz)** aus folgenden Gründen:

1. **Realitätsnähe**: Berücksichtigt Tagesverläufe und saisonale Schwankungen
2. **Flexibilität**: Kann für verschiedene Verbrauchertypen angepasst werden
3. **Verständlichkeit**: Kunden können die Logik nachvollziehen
4. **Genauigkeit**: Deutlich besser als reine Faktoren, aber einfacher als vollständige 8760h-Simulation

## Implementierungsschritte

1. **Phase 1**: Einfache Profile erstellen (Sinus für PV, typische Haushaltsverläufe)
2. **Phase 2**: Batteriesimulation implementieren
3. **Phase 3**: Saisonale Faktoren kalibrieren
4. **Phase 4**: Validierung mit realen Anlagendaten
5. **Phase 5**: UI-Integration und Visualisierung

## Zusätzliche Verbesserungen

### Visualisierung für Kunden
- Tagesverläufe für typische Sommer-/Wintertage zeigen
- Monatliche Autarkie-/Eigenverbrauchswerte darstellen
- Einfluss der Batterie visualisieren

### Validierung
- Vergleich mit realen Anlagendaten
- A/B-Tests mit verschiedenen Berechnungsmethoden
- Feedback von Installateuren einbeziehen

### Erweiterungen
- Wetterbasierte Korrekturen
- Regionale Anpassungen
- Verbrauchsoptimierungsvorschläge
