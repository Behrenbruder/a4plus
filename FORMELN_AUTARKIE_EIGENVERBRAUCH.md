# Formeln für Autarkiegrad und Eigenverbrauchsanteil
**Quelle:** `src/lib/pvcalc.ts` - Funktion `calculateHybridMetrics`  
**Version:** Commit 27b3705 (Aktuelle wiederhergestellte Version)

## 📐 Grundlegende Definitionen

### Autarkiegrad (Selbstversorgungsgrad)
```
Autarkiegrad = 1 - (Netzbezug / Gesamtverbrauch)
```
**Bedeutung:** Anteil des Verbrauchs, der durch eigene PV-Erzeugung gedeckt wird.

### Eigenverbrauchsanteil (Selbstverbrauchsquote)
```
Eigenverbrauchsanteil = Eigenverbrauch / PV-Erzeugung
```
**Bedeutung:** Anteil der PV-Erzeugung, der selbst verbraucht wird (nicht ins Netz eingespeist).

## 🔄 Stündliche Simulation (24h Dispatch-Logik)

### Eingangsdaten pro Stunde
- `pv[h]` = PV-Erzeugung in Stunde h
- `consumption[h]` = Gesamtverbrauch in Stunde h (Haushalt + E-Auto + Wärmepumpe)
- `batterySOC` = Batterieladezustand (State of Charge)
- `batteryKWh` = Batteriekapazität

### Schritt 1: Direktverbrauch
```typescript
const directUse = Math.min(pv[h], consumption[h]);
let remainingPV = pv[h] - directUse;
let remainingConsumption = consumption[h] - directUse;
```

### Schritt 2: Batterie laden (bei PV-Überschuss)
```typescript
if (remainingPV > 0 && batteryKWh > 0) {
  const maxChargeRate = batteryKWh * 0.5; // Max 0.5C Laderate
  const chargeAmount = Math.min(
    remainingPV, 
    batteryKWh - batterySOC, 
    maxChargeRate
  );
  batterySOC += chargeAmount * 0.95; // 95% Ladeeffizienz
  remainingPV -= chargeAmount;
}
```

### Schritt 3: Batterie entladen (bei Verbrauchsüberschuss)
```typescript
if (remainingConsumption > 0 && batteryKWh > 0) {
  const maxDischargeRate = batteryKWh * 0.5; // Max 0.5C Entladerate
  const dischargeAmount = Math.min(
    remainingConsumption, 
    batterySOC, 
    maxDischargeRate
  );
  batterySOC -= dischargeAmount;
  const usableDischarge = dischargeAmount * 0.95; // 95% Entladeeffizienz
  remainingConsumption -= usableDischarge;
  totalSelfConsumption += usableDischarge;
}
```

### Schritt 4: Bilanzierung
```typescript
totalGridImport += remainingConsumption;      // Netzbezug
totalSelfConsumption += directUse;            // Eigenverbrauch
totalPV += pv[h];                            // Gesamte PV-Erzeugung
totalConsumption += consumption[h];           // Gesamtverbrauch
```

## 📊 Tagesprofile (Normalisiert auf Summe = 1)

### PV-Profil (6-18 Uhr)
```typescript
function generateSimplePVProfile(): number[] {
  const profile = new Array(24).fill(0);
  for (let h = 0; h < 24; h++) {
    if (h >= 6 && h <= 18) {
      const x = (h - 6) / 12; // 0 bis 1
      profile[h] = Math.pow(Math.sin(Math.PI * x), 2);
    }
  }
  // Normalisierung: profile.map(v => v / sum)
}
```

### Haushalts-Profil
```typescript
function generateSimpleHouseholdProfile(): number[] {
  const profile = new Array(24).fill(0);
  
  // Morgen-Peak (6-9 Uhr): 0.06
  // Mittag (10-16 Uhr): 0.035  
  // Abend-Peak (17-22 Uhr): 0.07
  // Nacht (23-5 Uhr): 0.025
  
  // Normalisierung: profile.map(v => v / sum)
}
```

### E-Auto Profil
```typescript
function generateSimpleEVProfile(): number[] {
  const profile = new Array(24).fill(0);
  
  // Nachtladung (22-6 Uhr): 0.15
  // Mittagsladung (11-14 Uhr): 0.05
  
  // Normalisierung: profile.map(v => v / sum)
}
```

### Wärmepumpen-Profil
```typescript
function generateSimpleHeatPumpProfile(): number[] {
  const profile = new Array(24).fill(0);
  
  // Morgen-Peak (6-9 Uhr): 0.05
  // Abend-Peak (17-22 Uhr): 0.05  
  // Grundlast (sonst): 0.035
  
  // Normalisierung: profile.map(v => v / sum)
}
```

## 🗓️ Jahressimulation (4 Jahreszeiten)

### Saisonale Faktoren
```typescript
const seasons = [
  { pvFactor: 0.4, name: 'Winter' },    // 40% der durchschnittlichen PV
  { pvFactor: 0.8, name: 'Frühling' },  // 80% der durchschnittlichen PV
  { pvFactor: 1.4, name: 'Sommer' },    // 140% der durchschnittlichen PV
  { pvFactor: 1.0, name: 'Herbst' }     // 100% der durchschnittlichen PV
];
```

### Tägliche Skalierung
```typescript
const dailyPV = annualPV / 365;
const dailyHousehold = annualConsumption / 365;
const dailyEV = evConsumption / 365;
const dailyHeatPump = heatPumpConsumption / 365;

// Pro Jahreszeit:
pvProfile.map(h => h * dailyPV * season.pvFactor)
householdProfile.map(h => h * dailyHousehold)
evProfile.map(h => h * dailyEV)
heatPumpProfile.map(h => h * dailyHeatPump)
```

## 🧮 Finale Berechnung

### Nach 24h Simulation pro Jahreszeit
```typescript
const autarky = totalConsumption > 0 ? 
  1 - (totalGridImport / totalConsumption) : 0;

const selfConsumption = totalPV > 0 ? 
  totalSelfConsumption / totalPV : 0;
```

### Jahresdurchschnitt (4 Jahreszeiten)
```typescript
return {
  autarky: Math.min(0.95, totalAutarky / 4),           // Max 95%
  selfConsumption: Math.min(0.95, totalSelfConsumption / 4)  // Max 95%
};
```

## 🔧 Batterie-Parameter

### Effizienz
- **Ladeeffizienz:** 95%
- **Entladeeffizienz:** 95%
- **Gesamteffizienz:** 95% × 95% = 90.25%

### Leistung
- **Maximale Laderate:** 0.5C (50% der Kapazität pro Stunde)
- **Maximale Entladerate:** 0.5C (50% der Kapazität pro Stunde)

### Zustand
- **Start-SOC:** 50% der Kapazität
- **Nutzbare Kapazität:** 100% (keine Degradation berücksichtigt)

## 📈 Beispielrechnung

### Eingabe
- PV-Jahresertrag: 10.000 kWh
- Haushaltsverbrauch: 4.000 kWh
- E-Auto: 2.000 kWh
- Wärmepumpe: 3.000 kWh
- Batterie: 10 kWh

### Berechnung
1. **Gesamtverbrauch:** 4.000 + 2.000 + 3.000 = 9.000 kWh
2. **Simulation:** 4 Jahreszeiten × 24h mit obigen Profilen
3. **Beispiel-Ergebnis:**
   - Netzbezug: 2.700 kWh
   - Eigenverbrauch: 6.300 kWh
   - **Autarkiegrad:** 1 - (2.700 / 9.000) = 70%
   - **Eigenverbrauchsanteil:** 6.300 / 10.000 = 63%

---
*Diese Formeln basieren auf der aktuell aktiven Version (Commit 27b3705) und verwenden eine vereinfachte 4-Jahreszeiten-Simulation mit 24h-Profilen.*
