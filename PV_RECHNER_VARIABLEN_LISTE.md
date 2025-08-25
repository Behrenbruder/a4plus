# PV-Rechner: Vollständige Variablenliste

## Übersicht

Diese Liste enthält alle Variablen, die in die Berechnung des PV-Rechners einfließen, kategorisiert nach Funktionsbereichen.

## 1. Dach- und Gebäudedaten

### Dachtyp und Geometrie
- `roofType`: Dachtyp ('Flachdach', 'Satteldach', 'Walmdach', 'Pultdach', 'Mansarddach')
- `defaultTilt`: Standard-Neigungswinkel in Grad (number)
- `faces`: Array von Dachflächen (RoofFace[])

### Dachflächen-Eigenschaften (pro Fläche)
- `id`: Eindeutige Identifikation der Dachfläche (string)
- `name`: Name der Dachfläche (string)
- `azimuthDeg`: Azimutwinkel in Grad (number, 0° = Süd, 90° = West, 180° = Nord, 270° = Ost)
- `tiltDeg`: Neigungswinkel in Grad (number, 0° = horizontal, 90° = vertikal)
- `areaHorizM2`: Horizontale Projektionsfläche in m² (number)
- `polygon`: Koordinaten der Dachfläche (LatLng[])

### Standort
- `center`: Geografische Koordinaten (LatLng)
  - `lat`: Breitengrad (number)
  - `lng`: Längengrad (number)
- `address`: Adresse als String (string)

## 2. PV-Modul und Installation

### Modulkonfiguration
- `module.name`: Modulname (string, z.B. "Standard 430 Wp")
- `module.wpPerModule`: Nennleistung pro Modul in Wp (number, Standard: 430)
- `module.moduleLengthM`: Modullänge in Metern (number, Standard: 1.77)
- `module.moduleWidthM`: Modulbreite in Metern (number, Standard: 1.09)
- `module.effPct`: Modulwirkungsgrad in % (number, optional)
- `module.depreciationPct`: Degradation pro Jahr in % (number, optional)

### Paketierung und Layout
- `packing.orientation`: Modulausrichtung ('portrait' | 'landscape', Standard: 'portrait')
- `packing.setbackM`: Randabstand in Metern (number, Standard: 0.4)
- `packing.rowGapM`: Reihenabstand in Metern (number, Standard: 0.02)
- `packing.colGapM`: Spaltenabstand in Metern (number, Standard: 0.02)

### Manuelle Überschreibungen
- `kwpOverrideByFace`: Manuelle kWp-Werte pro Dachfläche (Record<string, number>)
- `packTotal.modules`: Gesamtanzahl Module (number)
- `packTotal.kWp`: Gesamt-kWp (number)

## 3. Systemverluste und Performance

### Simulationseinstellungen
- `settings.buildFactor`: Bebauungsfaktor (number, Standard: 0.65, Bereich: 0.5-0.95)
- `settings.shadingFactor`: Verschattungsfaktor (number, Standard: 0.97)
- `settings.systemLossFactor`: Gesamtsystemverluste (number, Standard: 0.90)
- `settings.degradationPctPerYear`: Degradation pro Jahr in % (number, Standard: 0.006)
- `settings.horizonYears`: Betrachtungszeitraum in Jahren (number, Standard: 30)

### Detaillierte Systemverluste
- `systemLossBreakdown.inverterLossPct`: Wechselrichterverluste in % (number, Standard: 3)
- `systemLossBreakdown.wiringLossPct`: Verkabelungsverluste in % (number, Standard: 2)
- `systemLossBreakdown.soilingLossPct`: Verschmutzungsverluste in % (number, Standard: 2)
- `systemLossBreakdown.shadingLossPct`: Verschattungsverluste in % (number, Standard: 3)
- `systemLossBreakdown.temperatureLossPct`: Temperaturverluste in % (number, Standard: 5)
- `systemLossBreakdown.mismatchLossPct`: Mismatch-Verluste in % (number, Standard: 2)
- `systemLossBreakdown.totalLossPct`: Gesamtverluste in % (number, berechnet)

## 4. PVGIS-Daten (Externe API)

### Ertragsdaten pro Dachfläche
- `perFaceYield`: Spezifischer Ertrag pro Dachfläche in kWh/kWp (number[])
- `perFaceGTI`: Globalstrahlung pro Dachfläche in kWh/m²·a (number[])
- `pvgisWeightedGTI`: Gewichtete Globalstrahlung in kWh/m²·a (number | null)
- `pvgisSource`: PVGIS-Datenquelle (string, z.B. "PVGIS v5.3 (SARAH3)")
- `pvgisError`: PVGIS-Fehlermeldung (string | null)

## 5. Verbrauchsdaten

### Haushaltsverbrauch
- `annualKnownKWh`: Manuell eingegebener Jahresverbrauch in kWh (number | undefined)
- `persons`: Anzahl Personen im Haushalt (number | undefined)
- `annualHouseholdKWh`: Berechneter Haushaltsverbrauch in kWh (number)
- `chosenProfile`: Gewähltes Haushaltsprofil ('1p' | '2p' | '3_4p' | '5plus')

### Lastprofilquellen
- `profileSource`: Quelle des Lastprofils ('BDEW' | 'OPSD' | 'SYNTH')
- `householdBase8760`: Normalisiertes 8760h-Lastprofil (number[] | null)
- `profileLoadError`: Fehler beim Laden des Profils (string | null)

### Erweiterte Verbrauchsoptionen
- `customLoadProfile`: Benutzerdefiniertes Lastprofil (CustomLoadProfile | null)
  - `source`: 'CUSTOM'
  - `data`: 8760 Stundenwerte (number[])
  - `filename`: Dateiname (string, optional)
  - `uploadDate`: Upload-Datum (Date, optional)
- `householdScenario`: Haushaltsszenario (HouseholdScenario | undefined)

## 6. Batteriespeicher

### Batteriekonfiguration
- `batteryKWh`: Nutzbare Batteriekapazität in kWh (number, Standard: 25)
- `batteryCfg.usableKWh`: Nutzbare Kapazität in kWh (number)
- `batteryCfg.chargePowerKW`: Ladeleistung in kW (number, berechnet: max(2.5, 0.25 * kWh))
- `batteryCfg.dischargePowerKW`: Entladeleistung in kW (number, berechnet: max(2.5, 0.25 * kWh))
- `batteryCfg.roundTripEff`: Round-Trip-Wirkungsgrad (number, Standard: 0.88)
- `batteryCfg.minSoCFrac`: Minimaler Ladezustand als Anteil (number, Standard: 0.10)

## 7. Elektrofahrzeug (E-Auto)

### EV-Grunddaten
- `ev.kmPerYear`: Jahresfahrleistung in km (number, Standard: 20000)
- `ev.consumptionKWhPer100km`: Verbrauch in kWh/100km (number, Standard: 22)
- `ev.homeChargePercent`: Anteil Heimladung in % (number, Standard: 80)
- `annualEVHomeKWh`: Berechneter Heimladebedarf in kWh/Jahr (number)

### EV-Ladeprofil
- `evMode`: Ladezeitfenster ('day_12_16' | 'evening_18_22' | 'night_22_06' | 'custom_wallbox')
- `wallboxKW`: Wallbox-Leistung in kW (number | undefined)

## 8. Wärmepumpe

### Wärmepumpen-Konfiguration
- `heatPump.hasHeatPump`: Wärmepumpe vorhanden (boolean)
- `heatPump.annualConsumptionKWh`: Jahresverbrauch Wärmepumpe in kWh (number, Standard: 4000)

## 9. Wirtschaftliche Parameter

### Strompreise
- `econ.electricityPriceCtPerKWh`: Strompreis in ct/kWh (number, Standard: 35)
- `econ.feedInTariffCtPerKWh`: Einspeisevergütung in ct/kWh (number, Standard: 8.2)
- `econ.baseFeeEURPerMonth`: Grundgebühr in EUR/Monat (number, optional)

### Investitionskosten (CapEx)
- `econ.pvSystemCapexEUR`: Gesamtkosten PV-System in EUR (number, optional)
- `econ.capexPerKWpEUR`: Kosten pro kWp in EUR (number, Standard: 1350)
- `econ.batteryCapexEUR`: Gesamtkosten Batterie in EUR (number, optional)
- `econ.capexBatteryPerKWhEUR`: Batteriekosten pro kWh in EUR (number, Standard: 800)
- `econ.installationCostEUR`: Installationskosten in EUR (number, optional)

### Betriebskosten (OpEx)
- `econ.maintenanceCostPerYearEUR`: Wartungskosten pro Jahr in EUR (number, optional)
- `econ.insuranceCostPerYearEUR`: Versicherungskosten pro Jahr in EUR (number, optional)
- `econ.opexPctOfCapexPerYear`: OpEx als % der CapEx pro Jahr (number, Standard: 0.01)

### Preisentwicklung
- `econ.priceEscalationPct`: Strompreissteigerung pro Jahr in % (number, optional)
- `econ.feedEscalationPct`: Einspeisevergütungsentwicklung pro Jahr in % (number, optional)

## 10. BDEW-Lastprofile (Neue Integration)

### Profilauswahl
- Automatische Auswahl basierend auf `batteryKWh`:
  - `batteryKWh = 0` → **H25-Profil** (Haushalt ohne Speicher)
  - `batteryKWh > 0` → **S25-Profil** (PV-Speicher-Kombination)

### BDEW-Parameter
- `year`: Jahr für BDEW-Profil (number, Standard: aktuelles Jahr)
- Dynamische Faktoren nach BDEW 2025 Formel:
  - `x = x₀ * (-3,92E-10 * t⁴ + 3,20E-7 * t³ - 7,02E-5 * t² + 2,10E-3 * t + 1,24)`
  - 96 Viertelstundenwerte pro Tag
  - 3 Tagestypen: SA (Samstag), FT (Feiertag/Sonntag), WT (Werktag)

## 11. Berechnete Zwischenwerte

### PV-Erzeugung
- `perFaceKWp`: kWp pro Dachfläche (number[])
- `perFaceKWpSum`: Gesamt-kWp aller Flächen (number)
- `annualPVPerFace`: Jahresertrag pro Dachfläche in kWh (number[])
- `annualPV`: Gesamt-Jahresertrag in kWh (number)
- `pvProfile`: Stündliches PV-Profil (8760 Werte) (number[])

### Verbrauchsprofile
- `loadProfile`: Gesamtlastprofil (8760 Werte) (number[])
- `householdOnlyProfile`: Nur Haushaltslast (8760 Werte) (number[])
- `evHourlyProfileArr`: EV-Lastprofil (8760 Werte) (number[])
- `annualConsumption`: Gesamtjahresverbrauch in kWh (number)

### Dispatch-Ergebnisse
- `dispatch.gridImportKWh`: Netzbezug in kWh (number)
- `dispatch.feedInKWh`: Netzeinspeisung in kWh (number)
- `dispatch.selfConsumptionKWh`: Eigenverbrauch in kWh (number)
- `batteryChargeKWh`: Batterieladung in kWh (number)
- `batteryDischargeKWh`: Batterieentladung in kWh (number)

## 12. Kennzahlen und Ergebnisse

### Energiekennzahlen
- `autarkie`: Autarkiegrad (0-1) (number)
- `eigenverbrauchQuote`: Eigenverbrauchsquote (0-1) (number)
- `eigenverbrauchKWh`: Eigenverbrauch in kWh (number)
- `co2SavingsTons`: CO₂-Einsparung in Tonnen (number)

### Wirtschaftskennzahlen
- `einsparungJahr`: Jährliche Einsparung in EUR (number)
- `einsparungKostenEUR`: Kosteneinsparung durch Eigenverbrauch in EUR (number)
- `einspeiseVerguetungEUR`: Einspeisevergütung in EUR (number)

### Erweiterte Finanzkennzahlen
- `financialMetrics.paybackTimeYears`: Amortisationszeit in Jahren (number)
- `financialMetrics.npvEUR`: Kapitalwert (NPV) in EUR (number)
- `financialMetrics.irrPct`: Interner Zinsfuß (IRR) in % (number)
- `financialMetrics.roiPct`: Return on Investment in % (number)
- `financialMetrics.lcoeCtPerKWh`: Stromgestehungskosten in ct/kWh (number)

### Gesamtkosten
- `totalCapex.pvCapex`: PV-System Kosten in EUR (number)
- `totalCapex.batteryCapex`: Batterie Kosten in EUR (number)
- `totalCapex.totalCapex`: Gesamtinvestition in EUR (number)

## 13. Konstanten und Standardwerte

### PV-Erzeugungsverteilung
- `PV_MONTHLY_SHARE`: Monatliche Anteile der PV-Erzeugung (number[12])
- `DAYLIGHT_HOURS`: Tageslichtstunden pro Monat (number[12])
- `DAYS_IN_MONTH`: Tage pro Monat (number[12])

### Standardlastprofile
- `STANDARD_ANNUAL_KWH`: Jahresverbrauch nach Haushaltsgröße (Record<HouseholdProfile, number>)

### Umrechnungsfaktoren
- CO₂-Faktor: 0.4 kg CO₂/kWh (für CO₂-Einsparungsberechnung)
- Temperaturkoeffizient PV-Module: -0.4%/K
- NOCT (Nominal Operating Cell Temperature): 45°C

## 14. UI-Zustandsvariablen

### Anzeige und Debug
- `showDebug`: Debug-Panel anzeigen (boolean)
- `profileLoadError`: Fehler beim Laden des Profils (string | null)

### Fortschritt
- `sections`: Array der Konfigurationsschritte mit Status (Array<{id, title, done}>)
- `pct`: Fortschritt in Prozent (number)

---

**Gesamtanzahl Variablen: ~150+**

Diese Liste umfasst alle direkten und indirekten Variablen, die in die PV-Rechner-Berechnung einfließen. Die Hauptberechnung erfolgt über die `calculateBDEWBasedMetrics`-Funktion, die automatisch das passende BDEW-Lastprofil (H25 oder S25) basierend auf der Speicherkonfiguration auswählt.
