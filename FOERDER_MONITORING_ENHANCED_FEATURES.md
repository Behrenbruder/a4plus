# Fördermonitoring System - Erweiterte Features

## Übersicht der Verbesserungen

Das Fördermonitoring-System wurde um folgende neue Features erweitert:

### 1. Konflikt-Erkennung zwischen Quellen
- **Automatische Erkennung** von widersprüchlichen Informationen zwischen verschiedenen Förderungsquellen
- **Intelligenter Vergleich** von Programmen basierend auf ähnlichen Namen und Inhalten
- **Schweregrad-Bewertung** (LOW, MEDIUM, HIGH) je nach Art des Konflikts
- **Detaillierte Konflikt-Analyse** mit spezifischen Unterschieden

### 2. Erweiterte E-Mail-Benachrichtigungen
- **CRM-Integration**: Direkte Links zum CRM-System für Verlaufsdokumentation
- **Konflikt-Warnungen**: Spezielle Benachrichtigungen bei erkannten Konflikten
- **Upload-Bestätigung**: Klare Anweisungen für die manuelle Überprüfung
- **Verbesserte Benutzerführung**: Schritt-für-Schritt Anweisungen

### 3. Neue Förderungsquellen
Das System wurde um 7 neue Quellen erweitert:
- www.förderdatenbank.de
- renewa förderdatenbank
- Verbraucherzentrale Rheinland-Pfalz
- Verbraucherzentrale (Speicher)
- Co2online
- SMA
- Solarwatt

### 4. Stündliche Überwachung
- **Cron-Timer** von monatlich auf stündlich geändert für intensivere Tests
- **Automatische Scans** jede Stunde zur schnelleren Erkennung von Änderungen

## Technische Details

### Konflikt-Erkennung

#### Algorithmus
```typescript
// Gruppierung ähnlicher Programme
const normalizedName = program.name.toLowerCase().replace(/[^a-z0-9]/g, '');
const key = normalizedName.substring(0, 20);

// Vergleich von Programmen
function comparePrograms(programA, programB) {
  // Vergleiche Förderbeträge, Gültigkeit, Zielgruppen, Kategorien
  // Bewerte Schweregrad basierend auf Konflikttyp
}
```

#### Konflikttypen
- **AMOUNT_MISMATCH**: Unterschiedliche Förderbeträge
- **VALIDITY_CONFLICT**: Verschiedene Gültigkeitszeiträume
- **CRITERIA_DIFFERENT**: Abweichende Kriterien oder Zielgruppen

#### Schweregrade
- **HIGH**: Kritische Unterschiede (z.B. Förderbeträge)
- **MEDIUM**: Wichtige Unterschiede (z.B. Gültigkeit, Zielgruppen)
- **LOW**: Kleinere Unterschiede (z.B. Kategorien)

### Datenbank-Schema Erweiterungen

#### Neue Tabellen
```sql
-- Konflikte zwischen Quellen
CREATE TABLE foerder_conflicts (
  id SERIAL PRIMARY KEY,
  scan_date DATE NOT NULL,
  foerder_id TEXT NOT NULL,
  conflict_type TEXT NOT NULL,
  source_a TEXT NOT NULL,
  source_b TEXT NOT NULL,
  data_a JSONB NOT NULL,
  data_b JSONB NOT NULL,
  conflict_summary TEXT,
  severity TEXT DEFAULT 'LOW',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Erweiterte Review-Tabelle
ALTER TABLE foerder_reviews ADD COLUMN total_conflicts INTEGER DEFAULT 0;
ALTER TABLE foerder_reviews ADD COLUMN manual_instructions TEXT;

-- Review-Verlauf
CREATE TABLE foerder_review_history (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES foerder_reviews(id),
  action_type TEXT NOT NULL,
  action_data JSONB,
  manual_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### E-Mail-Template Verbesserungen

#### Neue Features
- **Konflikt-Warnung**: Spezielle Sektion für erkannte Konflikte
- **CRM-Link**: Direkter Zugang zum CRM-System
- **Erweiterte Anweisungen**: Detaillierte Schritte für die Konfliktauflösung
- **Review-ID**: Eindeutige Identifikation für bessere Nachverfolgung

#### Template-Struktur
```html
<div style="background: #fef3c7; padding: 20px; border-radius: 8px;">
  <h3 style="color: #d97706;">⚠️ Konflikte erkannt</h3>
  <p>Es wurden <strong>${conflicts}</strong> Konflikte zwischen verschiedenen Förderungsquellen gefunden.</p>
  <p><strong>Bitte geben Sie textbasierte Anweisungen zur Auflösung ein.</strong></p>
</div>
```

## Workflow für Konfliktauflösung

### 1. Automatische Erkennung
- System scannt alle aktiven Quellen
- Vergleicht ähnliche Programme zwischen Quellen
- Erkennt Widersprüche und bewertet Schweregrad

### 2. Benachrichtigung
- E-Mail mit Konflikt-Details wird versendet
- Links zu Review-Interface und CRM-System
- Klare Anweisungen für nächste Schritte

### 3. Manuelle Überprüfung
- Administrator öffnet Review-Interface
- Sieht detaillierte Konflikt-Informationen
- Gibt textbasierte Anweisungen zur Auflösung ein

### 4. Dokumentation
- Alle Aktionen werden im CRM-System dokumentiert
- Review-Verlauf wird gespeichert
- Manuelle Anweisungen werden archiviert

## API-Endpunkte

### Erweiterte Scan-API
```
POST /api/foerder-scan
- Führt Scan mit Konflikt-Erkennung durch
- Erstellt Review-Session bei Konflikten
- Sendet erweiterte E-Mail-Benachrichtigung
```

### Review-API (geplant)
```
GET /api/foerder-review/[id]
- Zeigt Review-Details mit Konflikten
- Ermöglicht manuelle Anweisungen
- Dokumentiert Aktionen im Verlauf
```

## Konfiguration

### Umgebungsvariablen
```env
# E-Mail-Konfiguration
FOERDER_REVIEW_EMAIL=samuel@a4plus.eu

# Basis-URL für Links
NEXT_PUBLIC_BASE_URL=https://a4plus.eu

# Supabase-Konfiguration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Cron-Konfiguration
```json
{
  "crons": [
    {
      "path": "/api/foerder-scan",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Monitoring und Logs

### Scan-Logs
- Detaillierte Logs für jeden Scan-Vorgang
- Konflikt-Erkennung wird protokolliert
- Fehler-Behandlung mit spezifischen Meldungen

### Performance-Metriken
- Scan-Dauer pro Quelle
- Anzahl erkannter Konflikte
- E-Mail-Versand-Status

## Sicherheit

### Daten-Validierung
- Eingabe-Validierung für alle API-Endpunkte
- Sanitization von HTML-Inhalten
- Rate-Limiting für Scan-Anfragen

### Zugriffskontrolle
- Admin-only Zugriff auf Review-Interface
- Sichere API-Keys für Supabase
- Verschlüsselte E-Mail-Übertragung

## Wartung und Updates

### Regelmäßige Aufgaben
- Bereinigung alter Snapshots (> 90 Tage)
- Archivierung abgeschlossener Reviews
- Performance-Optimierung der Konflikt-Erkennung

### Monitoring-Alerts
- Fehlgeschlagene Scans
- Hohe Anzahl von Konflikten
- E-Mail-Versand-Probleme

## Zukünftige Erweiterungen

### Geplante Features
- **KI-basierte Konfliktauflösung**: Automatische Vorschläge basierend auf historischen Daten
- **Dashboard-Integration**: Grafische Darstellung von Konflikten und Trends
- **API-Integration**: Webhooks für externe Systeme
- **Erweiterte Filterung**: Benutzerdefinierte Konflikt-Kriterien

### Verbesserungsmöglichkeiten
- **Fuzzy-Matching**: Bessere Erkennung ähnlicher Programme
- **Machine Learning**: Lernende Algorithmen für Konflikt-Bewertung
- **Real-time Updates**: WebSocket-basierte Live-Updates
- **Mobile App**: Benachrichtigungen und Review auf mobilen Geräten

## Support und Dokumentation

### Kontakt
- **E-Mail**: samuel@a4plus.eu
- **System-Logs**: Verfügbar im Admin-Interface
- **Dokumentation**: Siehe FOERDER_MONITORING_SYSTEM_ANLEITUNG.md

### Troubleshooting
- **Häufige Probleme**: Siehe FAQ-Sektion
- **Debug-Modus**: Aktivierbar über Umgebungsvariablen
- **Test-Suite**: Verfügbar über test-foerder-monitoring-system.js
