# Verbesserungsvorschläge für den PV-Rechner

Basierend auf der Analyse des alternativen PVTool Rechners wurden folgende Verbesserungsmöglichkeiten für unseren PV-Rechner identifiziert:

## 1. Benutzerfreundlichkeit & UI/UX

### ✅ Bereits implementiert:
- Adresssuche mit Autocomplete
- Jährlicher Stromverbrauch (kWh)
- Stromkosten (€/kWh) 
- Einspeisevergütung (€/kWh)
- Installationskosten ohne Akku
- Speicherkosten pro kWh
- Dachausrichtung und Neigung
- Installierte Leistung (Wp)

### 🔄 Verbesserungspotential:

#### A) Speichergrößen-Auswahl
**PVTool hat:** Vordefinierte Speichergrößen als Tags (500, 1000, 2000, 4000, 6000, 8000, 12000, 16000, 20000, 25000, 30000 Wh)

**Unser Status:** Freie Eingabe (aktuell 25 kWh Standard)

**Empfehlung:** Kombiniere beide Ansätze:
- Häufig verwendete Größen als Schnellauswahl-Buttons
- Zusätzlich freie Eingabe für individuelle Werte
- Typische Größen: 5, 10, 15, 20, 25, 30 kWh

#### B) Vergleichsjahr-Auswahl
**PVTool hat:** Dropdown für Vergleichsjahr (2015 im Screenshot)

**Unser Status:** Fest auf aktuelles Jahr

**Empfehlung:** 
- Vergleichsjahr-Auswahl hinzufügen für historische Strompreise
- Inflation und Preisentwicklung berücksichtigen

#### C) Systemverluste als Prozentangabe
**PVTool hat:** Direkte Eingabe der Systemverluste in % (12% im Screenshot)

**Unser Status:** Detaillierte Systemverlust-Aufschlüsselung (sehr gut!)

**Empfehlung:** 
- Behalte die detaillierte Aufschlüsselung (ist besser als PVTool)
- Ergänze eine "Einfach-Ansicht" mit direkter %-Eingabe für weniger technische Nutzer

## 2. Erweiterte Funktionen

### ✅ Bereits besser als PVTool:
- Detaillierte Dachflächenmarkierung auf Karte
- Mehrere Dachflächen mit unterschiedlichen Ausrichtungen
- E-Auto Integration mit verschiedenen Lademodi
- Erweiterte Lastprofile (BDEW, OPSD, Custom CSV)
- Detaillierte Systemverlust-Aufschlüsselung
- Finanzielle Kennzahlen (ROI, Amortisation, NPV)

### 🆕 Neue Features von PVTool:

#### A) CSV-Import für stündlichen Verbrauch
**PVTool hat:** "Import individueller stündlicher Verbrauch" mit CSV-Upload

**Unser Status:** ✅ Bereits implementiert in StepLoad!

#### B) Erweiterte Einstellungen Toggle
**PVTool hat:** Button "Erweiterte Einstellungen"

**Empfehlung:** 
- Füge einen "Erweiterte Einstellungen" Toggle hinzu
- Verstecke komplexe Parameter standardmäßig
- Zeige nur Basis-Parameter für normale Nutzer

## 3. Konkrete Implementierungsvorschläge

### Priorität 1 (Schnell umsetzbar):

#### Speichergrößen-Schnellauswahl
```typescript
// In StepBattery.tsx
const COMMON_BATTERY_SIZES = [0, 5, 10, 15, 20, 25, 30];

<div className="flex flex-wrap gap-2 mb-4">
  {COMMON_BATTERY_SIZES.map(size => (
    <button
      key={size}
      onClick={() => setValue(size)}
      className={`px-3 py-1 rounded ${value === size ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
    >
      {size} kWh
    </button>
  ))}
</div>
```

#### Erweiterte Einstellungen Toggle
```typescript
// In verschiedenen Steps
const [showAdvanced, setShowAdvanced] = useState(false);

<button onClick={() => setShowAdvanced(!showAdvanced)}>
  {showAdvanced ? 'Einfache Ansicht' : 'Erweiterte Einstellungen'}
</button>

{showAdvanced && (
  <div className="mt-4 p-4 bg-gray-50 rounded">
    {/* Erweiterte Parameter */}
  </div>
)}
```

### Priorität 2 (Mittelfristig):

#### Vergleichsjahr-Funktionalität
- Historische Strompreise hinterlegen
- Inflationsbereinigung
- Vergleich verschiedener Szenarien

#### Vereinfachte Systemverluste-Eingabe
- Toggle zwischen "Einfach" (eine %-Eingabe) und "Detailliert" (aktuelle Aufschlüsselung)
- Automatische Umrechnung zwischen beiden Modi

### Priorität 3 (Langfristig):

#### Erweiterte Vergleichsfunktionen
- Mehrere Szenarien parallel berechnen
- Sensitivitätsanalyse für Parameter
- Export verschiedener Berechnungsvarianten

## 4. Fazit

**Unser PV-Rechner ist bereits deutlich fortschrittlicher als PVTool in vielen Bereichen:**
- Bessere Dachflächenerfassung
- Detailliertere Systemverluste
- E-Auto Integration
- Erweiterte Lastprofile
- Umfassende Finanzanalyse

**Die wichtigsten Verbesserungen wären:**
1. Speichergrößen-Schnellauswahl (UX-Verbesserung)
2. Erweiterte Einstellungen Toggle (Vereinfachung für Einsteiger)
3. Vergleichsjahr-Funktionalität (Zusatzfeature)

**Empfehlung:** Fokus auf UX-Verbesserungen, da die technische Funktionalität bereits überlegen ist.
