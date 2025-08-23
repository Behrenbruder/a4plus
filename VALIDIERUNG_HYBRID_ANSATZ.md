# Validierung des Hybrid-Ansatzes für Autarkie und Eigenverbrauch

## Ziel
Validierung der implementierten Hybrid-Berechnung durch Vergleiche mit realen Anlagendaten und A/B-Tests zur Sicherstellung der Genauigkeit und Zuverlässigkeit.

## 1. Datensammlung für Validierung

### 1.1 Reale Anlagendaten benötigt
- **PV-Anlagen ohne Batterie**: 10-20 Anlagen verschiedener Größen (5-50 kWp)
- **PV-Anlagen mit Batterie**: 10-20 Anlagen mit verschiedenen Batteriekapazitäten
- **PV-Anlagen mit E-Auto**: 5-10 Anlagen mit dokumentiertem E-Auto-Ladeverhalten
- **PV-Anlagen mit Wärmepumpe**: 5-10 Anlagen mit Wärmepumpen-Verbrauchsdaten

### 1.2 Erforderliche Datenpunkte pro Anlage
```typescript
interface RealPlantData {
  // Anlagenspezifikation
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
  
  // Optional: Monatswerte für detailliertere Analyse
  monthlyData?: {
    month: number;
    pvKWh: number;
    consumptionKWh: number;
    gridImportKWh: number;
    feedInKWh: number;
  }[];
}
```

## 2. Validierungs-Framework

### 2.1 Vergleichsmetriken
- **Absolute Abweichung**: |Berechnet - Ist|
- **Relative Abweichung**: |(Berechnet - Ist) / Ist| * 100%
- **MAPE (Mean Absolute Percentage Error)**: Durchschnittliche prozentuale Abweichung
- **RMSE (Root Mean Square Error)**: Quadratische Abweichung
- **R² (Bestimmtheitsmaß)**: Korrelation zwischen berechnet und gemessen

### 2.2 Akzeptanzkriterien
- **Autarkiegrad**: ±5% absolute Abweichung als "gut", ±10% als "akzeptabel"
- **Eigenverbrauchsquote**: ±3% absolute Abweichung als "gut", ±7% als "akzeptabel"
- **Gesamtgenauigkeit**: >80% der Anlagen innerhalb "gut"-Bereich

## 3. A/B-Test Design

### 3.1 Test-Szenarien
1. **Hybrid vs. Alte Methode**: Vergleich der neuen Hybrid-Berechnung mit der alten Dispatch-basierten Methode
2. **Hybrid vs. Vereinfachte Faktoren**: Vergleich mit einfachen Faktor-basierten Berechnungen
3. **Verschiedene Batteriekapazitäten**: Test der Batteriemodellierung bei verschiedenen Kapazitäten
4. **Saisonale Variation**: Test der saisonalen Faktoren (Winter/Sommer-Verhältnis)

### 3.2 Test-Metriken
- **Genauigkeit**: Wie nah sind die berechneten Werte an den realen Daten?
- **Konsistenz**: Wie stabil sind die Ergebnisse bei ähnlichen Anlagen?
- **Plausibilität**: Sind die Trends und Verhältnisse realistisch?

## 4. Implementierung der Validierung

### 4.1 Validierungs-API
```typescript
// /src/lib/validation.ts
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
}

export function validateHybridCalculation(
  plantData: RealPlantData
): ValidationResult;

export function generateValidationReport(
  results: ValidationResult[]
): ValidationReport;
```

### 4.2 Validierungs-Dashboard
- **Übersichts-Dashboard**: Gesamtstatistiken und Trends
- **Einzelanlagen-Analyse**: Detailvergleich pro Anlage
- **Fehleranalyse**: Identifikation systematischer Abweichungen
- **Kalibrierungs-Empfehlungen**: Vorschläge zur Verbesserung

## 5. Kalibrierung und Optimierung

### 5.1 Parameter-Tuning
Basierend auf Validierungsergebnissen können folgende Parameter angepasst werden:

```typescript
// Saisonale PV-Faktoren
const SEASONAL_PV_FACTORS = {
  winter: 0.4,    // Anpassbar basierend auf realen Daten
  spring: 0.8,
  summer: 1.4,
  autumn: 1.0
};

// Verbrauchsprofile
const CONSUMPTION_PROFILES = {
  household: [...], // Anpassbar an regionale Gegebenheiten
  ev: [...],        // Anpassbar an Ladeverhalten
  heatPump: [...]   // Anpassbar an Heizverhalten
};

// Batterie-Parameter
const BATTERY_PARAMS = {
  roundTripEfficiency: 0.95,  // Anpassbar
  maxCRate: 0.5,              // Anpassbar
  minSOC: 0.1                 // Anpassbar
};
```

### 5.2 Machine Learning Ansatz (Optional)
- **Regressionsmodelle**: Zur Verbesserung der Vorhersagegenauigkeit
- **Clustering**: Gruppierung ähnlicher Anlagen für spezifische Parameter
- **Feature Engineering**: Zusätzliche Faktoren wie Wetter, Nutzerverhalten

## 6. Kontinuierliche Validierung

### 6.1 Monitoring
- **Monatliche Validierung**: Neue Anlagendaten einbeziehen
- **Saisonale Anpassung**: Parameter je nach Jahreszeit anpassen
- **Feedback-Loop**: Installateur-Feedback zur Plausibilität

### 6.2 Qualitätssicherung
- **Automatische Tests**: Unit-Tests für Berechnungslogik
- **Plausibilitätsprüfungen**: Grenzen für physikalisch mögliche Werte
- **Regression-Tests**: Sicherstellung, dass Änderungen keine Verschlechterung bringen

## 7. Dokumentation und Reporting

### 7.1 Validierungsbericht
- **Executive Summary**: Zusammenfassung der Genauigkeit
- **Methodologie**: Beschreibung des Validierungsansatzes
- **Ergebnisse**: Detaillierte Statistiken und Abweichungen
- **Empfehlungen**: Verbesserungsvorschläge

### 7.2 Transparenz für Kunden
- **Genauigkeits-Badge**: Anzeige der Validierungsqualität im UI
- **Unsicherheitsbereiche**: Angabe von Konfidenzintervallen
- **Datengrundlage**: Information über verwendete Validierungsdaten

## 8. Nächste Schritte

1. **Datenakquise**: Sammlung realer Anlagendaten von Installateuren
2. **Framework-Implementierung**: Entwicklung der Validierungs-Tools
3. **Pilot-Validierung**: Test mit ersten 10-20 Anlagen
4. **Kalibrierung**: Anpassung der Parameter basierend auf Ergebnissen
5. **Vollständige Validierung**: Test mit größerem Datensatz
6. **Produktions-Deployment**: Integration der validierten Version

## 9. Erwartete Ergebnisse

- **Verbesserte Genauigkeit**: Reduzierung der Abweichungen um 30-50%
- **Erhöhte Vertrauenswürdigkeit**: Transparente Validierung schafft Kundenvertrauen
- **Kontinuierliche Verbesserung**: Feedback-Loop für stetige Optimierung
- **Wettbewerbsvorteil**: Nachweislich genauere Berechnungen als Konkurrenz
