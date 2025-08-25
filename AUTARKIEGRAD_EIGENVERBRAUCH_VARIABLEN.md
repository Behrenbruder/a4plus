# Autarkiegrad und Eigenverbrauchsquote: Spezifische Variablenliste

## Übersicht

Diese Liste enthält **ausschließlich** die Variablen, die direkt in die Berechnung von **Autarkiegrad** und **Eigenverbrauchsquote** einfließen. Die Berechnung erfolgt über die `calculateBDEWBasedMetrics`-Funktion mit automatischer H25/S25-Profilauswahl.

## Berechnungsformeln

```typescript
// Autarkiegrad = 1 - (Netzbezug / Gesamtverbrauch)
autarky = 1 - (dispatch.gridImportKWh / totalConsumptionKWh)

// Eigenverbrauchsquote = Eigenverbrauch / PV-Erzeugung
selfConsumption = dispatch.selfConsumptionKWh / annualPVKWh
```

## 1. Direkte Eingabevariablen

### PV-Erzeugung
- **`annualPVKWh`**: Jährliche PV-Erzeugung in kWh (number)
  - Berechnet aus: `perFaceKWp × perFaceYield` (summiert über alle Dachflächen)

### Verbrauchsdaten
- **`householdConsumptionKWh`**: Haushaltsverbrauch in kWh/Jahr (number)
- **`evConsumptionKWh`**: E-Auto-Verbrauch (Heimladung) in kWh/Jahr (number, Standard: 0)
- **`heatPumpConsumptionKWh`**: Wärmepumpen-Verbrauch in kWh/Jahr (number, Standard: 0)

### Speicherkonfiguration (entscheidend für Profilauswahl!)
- **`batteryCapacityKWh`**: Batteriekapazität in kWh (number, Standard: 0)
  - **Kritisch**: Bestimmt automatische Profilauswahl:
    - `batteryCapacityKWh = 0` → **H25-Profil** (Haushalt ohne Speicher)
    - `batteryCapacityKWh > 0` → **S25-Profil** (PV-Speicher-Kombination)

### Zeitbasis
- **`year`**: Jahr für BDEW-Profil (number, Standard: aktuelles Jahr)

## 2. BDEW-Lastprofile (Kernkomponente)

### Automatische Profilauswahl
- **`profileType`**: Automatisch gewählt basierend auf `batteryCapacityKWh`
  - `'H25'`: Haushaltsprofil (ohne Speicher)
  - `'S25'`: PV-Speicher-Kombinationsprofil (mit Speicher)

### BDEW-Profildaten (8760 Stunden)
- **H25-Profil**: `generateH25YearProfile(year)` → 8760 Werte
- **S25-Profil**: `generateS25YearProfile(year)` → 8760 Werte
- **Dynamikfaktoren**: BDEW 2025 Formel pro Viertelstunde
  - `x = x₀ * (-3,92E-10 * t⁴ + 3,20E-7 * t³ - 7,02E-5 * t² + 2,10E-3 * t + 1,24)`
  - 96 Viertelstundenwerte pro Tag
  - 3 Tagestypen: WT (Werktag), SA (Samstag), FT (Feiertag/Sonntag)

## 3. PV-Erzeugungsprofil (8760 Stunden)

### PV-Profil-Generierung
- **`hourlyPVFromAnnual(annualPVKWh)`**: Stündliches PV-Profil
- **Monatliche Verteilung**: `PV_MONTHLY_SHARE` (12 Werte)
  - `[2, 4, 8, 10, 12, 13, 13, 12, 9, 7, 5, 5]` (in %)
- **Tageslichtstunden**: `DAYLIGHT_HOURS` (12 Werte)
  - `[8, 10, 12, 14, 16, 17, 16.5, 15, 13, 11, 8.5, 7.5]`
- **Tage pro Monat**: `DAYS_IN_MONTH` (12 Werte)
  - `[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]`

### Tägliche PV-Kurve
- **Sinus-Kurve**: `Math.pow(Math.sin(Math.PI * x), 2)` zwischen Sonnenauf- und -untergang
- **Sonnenaufgang**: `12 - daylight / 2`
- **Sonnenuntergang**: `12 + daylight / 2`

## 4. Batterie-Dispatch-Parameter

### Batteriekonfiguration (nur wenn `batteryCapacityKWh > 0`)
- **`usableKWh`**: Nutzbare Kapazität = `batteryCapacityKWh`
- **`chargePowerKW`**: Ladeleistung = `batteryCapacityKWh * 0.5` (0.5C)
- **`dischargePowerKW`**: Entladeleistung = `batteryCapacityKWh * 0.5` (0.5C)
- **`roundTripEff`**: Round-Trip-Wirkungsgrad = `0.92` (92%)
- **`minSoCFrac`**: Minimaler Ladezustand = `0.1` (10%)

### Batterie-Algorithmus (`dispatchGreedy`)
- **Lade-Effizienz**: `etaCharge = Math.sqrt(0.92)` ≈ 0.959
- **Entlade-Effizienz**: `etaDischarge = Math.sqrt(0.92)` ≈ 0.959
- **Anfangs-SoC**: `batteryCapacityKWh * 0.1` (10% der Kapazität)

## 5. Berechnete Zwischenwerte

### Gesamtverbrauch
- **`totalConsumptionKWh`**: 
  ```typescript
  householdConsumptionKWh + evConsumptionKWh + heatPumpConsumptionKWh
  ```

### Normalisiertes Lastprofil
- **`profileSum`**: Summe aller BDEW-Profilwerte (8760 Stunden)
- **`normalizedLoadProfile`**: 
  ```typescript
  loadProfile.map(value => (value / profileSum) * totalConsumptionKWh)
  ```

### Dispatch-Ergebnisse (aus `dispatchGreedy`)
- **`dispatch.gridImportKWh`**: Netzbezug in kWh
- **`dispatch.feedInKWh`**: Netzeinspeisung in kWh  
- **`dispatch.selfConsumptionKWh`**: Eigenverbrauch in kWh

## 6. Finale Berechnung

### Autarkiegrad
```typescript
autarky = 1 - (dispatch.gridImportKWh / totalConsumptionKWh)
autarky = Math.max(0, Math.min(1, autarky)) // Begrenzung auf 0-1
```

**Abhängig von:**
- `dispatch.gridImportKWh` (Netzbezug)
- `totalConsumptionKWh` (Gesamtverbrauch)

### Eigenverbrauchsquote
```typescript
selfConsumption = dispatch.selfConsumptionKWh / annualPVKWh
selfConsumption = Math.max(0, Math.min(1, selfConsumption)) // Begrenzung auf 0-1
```

**Abhängig von:**
- `dispatch.selfConsumptionKWh` (Eigenverbrauch)
- `annualPVKWh` (PV-Erzeugung)

## 7. Kritische Abhängigkeiten

### Profilauswahl-Logik
```typescript
const profileType: 'H25' | 'S25' = batteryCapacityKWh > 0 ? 'S25' : 'H25';
```

**Diese eine Variable bestimmt das gesamte Verhalten:**
- **`batteryCapacityKWh = 0`** → H25-Profil → Typisches Haushaltsverhalten
- **`batteryCapacityKWh > 0`** → S25-Profil → Optimiertes Verhalten mit Speicher

### Stündliche Simulation (8760 Iterationen)
Für jede Stunde `i` von 0 bis 8759:
1. **PV-Erzeugung**: `pvProfile[i]`
2. **Verbrauch**: `normalizedLoadProfile[i]`
3. **Direktverbrauch**: `Math.min(pvProfile[i], normalizedLoadProfile[i])`
4. **Überschuss/Defizit**: Batterie-Dispatch oder Netz
5. **Akkumulation**: `gridImport`, `feedIn`, `selfConsumption`

## 8. Einfluss der Eingabevariablen

### Hoher Einfluss auf Autarkiegrad
1. **`batteryCapacityKWh`** (Profilauswahl + Speicherkapazität)
2. **`annualPVKWh`** (PV-Erzeugung vs. Verbrauch)
3. **`totalConsumptionKWh`** (Verhältnis PV/Verbrauch)
4. **BDEW-Profil** (H25 vs. S25 Lastverteilung)

### Hoher Einfluss auf Eigenverbrauchsquote
1. **`batteryCapacityKWh`** (Speichermöglichkeit für Überschüsse)
2. **Lastprofil-Synchronisation** (BDEW H25/S25 vs. PV-Profil)
3. **`annualPVKWh`** (Überschussmenge)
4. **Batterie-Effizienz** (92% Round-Trip)

### Mittlerer Einfluss
- **`evConsumptionKWh`** (zusätzlicher Verbrauch)
- **`heatPumpConsumptionKWh`** (zusätzlicher Verbrauch)
- **`year`** (BDEW-Profil-Variationen)

## 9. Konstanten in der Berechnung

### Batterie-Parameter (fest codiert)
- Round-Trip-Effizienz: **92%**
- Lade-/Entladerate: **0.5C** (50% der Kapazität pro Stunde)
- Minimaler SoC: **10%**
- Start-SoC: **10%**

### PV-Profil-Parameter (fest codiert)
- Monatliche Verteilung: **PV_MONTHLY_SHARE**
- Tageslichtstunden: **DAYLIGHT_HOURS**
- Sinus²-Kurve für Tagesverlauf

### BDEW-Parameter (fest codiert)
- Dynamikformel: **BDEW 2025**
- Profilauflösung: **15 Minuten** (96 Werte/Tag)
- Tagestypen: **WT, SA, FT**

---

## Zusammenfassung

**Kernvariablen für Autarkiegrad und Eigenverbrauchsquote:**

1. **`batteryCapacityKWh`** - Entscheidet über H25/S25-Profil
2. **`annualPVKWh`** - PV-Erzeugung
3. **`householdConsumptionKWh`** - Haushaltsverbrauch
4. **`evConsumptionKWh`** - E-Auto-Verbrauch
5. **`heatPumpConsumptionKWh`** - Wärmepumpen-Verbrauch
6. **BDEW-Profile** (H25/S25) - 8760 Stundenwerte
7. **PV-Profil** - 8760 Stundenwerte
8. **Batterie-Dispatch-Algorithmus** - Stündliche Simulation

**Die automatische H25/S25-Auswahl basierend auf `batteryCapacityKWh` ist der entscheidende Faktor für realistische Autarkie- und Eigenverbrauchswerte.**
