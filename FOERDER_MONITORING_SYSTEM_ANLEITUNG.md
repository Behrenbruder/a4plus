# Automatisiertes Förderungen-Überwachungssystem

## Übersicht

Das automatisierte Förderungen-Überwachungssystem scannt monatlich verschiedene Förderungsquellen (KfW, BAFA, Länder-Programme) nach Änderungen und benachrichtigt Sie per E-Mail über Updates. Sie können dann die Änderungen überprüfen und selektiv übernehmen.

## System-Architektur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cron Job      │───▶│  /api/foerder-   │───▶│   Parser &      │
│ (monatlich)     │    │  scan            │    │   Scraper       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   E-Mail        │◀───│   Supabase       │◀───│   Diff-Report   │
│ Benachrichtigung│    │   Database       │    │   Generator     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Review-Seite    │───▶│  /api/foerder-   │───▶│ Live-Daten      │
│ (manuell)       │    │  apply           │    │ Update          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Komponenten

### 1. Datenbank-Schema (`supabase-foerder-tracking-schema.sql`)

**Tabellen:**
- `foerder_sources`: Konfiguration der zu scannenden Quellen
- `foerder_snapshots`: Historische Snapshots der gescannten Daten
- `foerder_changes`: Erkannte Änderungen zwischen Scans
- `foerder_live`: Aktuelle Live-Förderungen
- `foerder_reviews`: Review-Sessions für manuelle Überprüfung

### 2. Parser-System (`src/lib/foerder-parsers.ts`)

**Unterstützte Parser:**
- `KfWParser`: Speziell für KfW-Website
- `BAFAParser`: Speziell für BAFA-Website  
- `GenericHTMLParser`: Für andere Websites mit konfigurierbaren Selektoren

**Features:**
- Intelligente Kategorien-Erkennung
- Automatische Zielgruppen-Klassifizierung
- Förderart-Erkennung (Zuschuss, Kredit, etc.)
- Betrags- und Kriterien-Extraktion

### 3. Scan-API (`src/app/api/foerder-scan/route.ts`)

**Funktionen:**
- Lädt Website-Inhalte mit Timeout-Schutz
- Parst Inhalte mit entsprechenden Parsern
- Erstellt Diff-Reports zwischen Scans
- Speichert Snapshots in der Datenbank
- Sendet E-Mail-Benachrichtigungen bei Änderungen

### 4. Review-Interface (`src/app/admin/foerder-review/[id]/page.tsx`)

**Features:**
- Übersichtliche Darstellung aller Änderungen
- Vorher/Nachher-Vergleich
- Selektive Auswahl von Änderungen
- Batch-Übernahme mit Notizen

### 5. Apply-API (`src/app/api/foerder-apply/route.ts`)

**Funktionen:**
- Übernimmt ausgewählte Änderungen in Live-Daten
- Aktualisiert Datenbank-Tabellen
- Markiert Änderungen als angewendet
- Audit-Trail für alle Änderungen

## Setup-Anleitung

### 1. Datenbank einrichten

```sql
-- Führe das Schema-Script aus
psql -h your-supabase-host -U postgres -d postgres -f supabase-foerder-tracking-schema.sql
```

### 2. Umgebungsvariablen

Füge zu `.env.local` hinzu:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# E-Mail für Review-Benachrichtigungen
FOERDER_REVIEW_EMAIL=samuel@a4plus.eu

# Base URL für Links in E-Mails
NEXT_PUBLIC_BASE_URL=https://a4plus.eu
```

### 3. Bestehende Daten migrieren

```bash
# Migriere bestehende JSON-Daten in die Datenbank
curl "https://a4plus.eu/api/foerder-apply?action=migrate"
```

### 4. Cron Job aktivieren

Der Cron Job ist bereits in `vercel.json` konfiguriert:
- **Schedule**: `0 9 1 * *` (jeden 1. des Monats um 9:00 Uhr)
- **Endpoint**: `/api/foerder-scan`

## Verwendung

### Manueller Scan

```bash
# Alle Quellen scannen
curl -X POST "https://a4plus.eu/api/foerder-scan"

# Forcierter Scan (auch wenn heute bereits gescannt)
curl -X POST "https://a4plus.eu/api/foerder-scan" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'

# Spezifische Quellen scannen
curl -X POST "https://a4plus.eu/api/foerder-scan" \
  -H "Content-Type: application/json" \
  -d '{"sources": ["KfW", "BAFA"]}'
```

### Review-Prozess

1. **E-Mail-Benachrichtigung erhalten**
   - Enthält Zusammenfassung der Änderungen
   - Link zur Review-Seite

2. **Review-Seite öffnen**
   - `https://a4plus.eu/admin/foerder-review/{review-id}`
   - Alle Änderungen werden angezeigt

3. **Änderungen auswählen**
   - Checkboxen für gewünschte Änderungen
   - Vorher/Nachher-Vergleich prüfen

4. **Änderungen übernehmen**
   - Button "Änderungen übernehmen" klicken
   - Optional: Notizen hinzufügen

### Neue Quellen hinzufügen

```sql
INSERT INTO foerder_sources (name, type, url, parser_type, config) VALUES
('Neue-Quelle', 'LAND', 'https://example.com/foerderungen', 'GENERIC_HTML', 
 '{"region": "Bayern", "selectors": {".program": "program"}}');
```

## Monitoring & Debugging

### Logs prüfen

```bash
# Vercel Logs anzeigen
vercel logs --follow

# Spezifische Function Logs
vercel logs --follow --scope=foerder-scan
```

### Datenbank-Abfragen

```sql
-- Letzte Scans anzeigen
SELECT * FROM foerder_snapshots 
ORDER BY created_at DESC LIMIT 10;

-- Pending Reviews anzeigen
SELECT * FROM foerder_reviews 
WHERE status = 'pending';

-- Änderungen eines Scans anzeigen
SELECT * FROM foerder_changes 
WHERE scan_date = '2025-01-27'
ORDER BY created_at;
```

### Test-Endpoints

```bash
# Scan-Status prüfen
curl "https://a4plus.eu/api/foerder-scan"

# Datenbank-Sync testen
curl "https://a4plus.eu/api/foerder-apply?action=sync"
```

## Troubleshooting

### Häufige Probleme

1. **Parser-Fehler**
   - Website-Struktur hat sich geändert
   - Selektoren in `foerder_sources.config` anpassen

2. **E-Mail nicht erhalten**
   - `FOERDER_REVIEW_EMAIL` Umgebungsvariable prüfen
   - E-Mail-Service-Logs prüfen

3. **Cron Job läuft nicht**
   - Vercel Cron-Konfiguration prüfen
   - Function-Timeout erhöhen falls nötig

4. **Datenbank-Verbindung**
   - Supabase-Credentials prüfen
   - Service Role Key verwenden (nicht Anon Key)

### Debug-Modus

```bash
# Detaillierte Logs aktivieren
curl -X POST "https://a4plus.eu/api/foerder-scan" \
  -H "Content-Type: application/json" \
  -d '{"force": true, "debug": true}'
```

## Wartung

### Regelmäßige Aufgaben

1. **Monatlich**: Review-E-Mails prüfen und Änderungen übernehmen
2. **Quartalsweise**: Parser-Funktionalität testen
3. **Halbjährlich**: Neue Förderungsquellen evaluieren
4. **Jährlich**: Datenbank-Performance optimieren

### Backup

```sql
-- Backup der wichtigsten Tabellen
pg_dump -h your-host -U postgres -t foerder_live > foerder_backup.sql
```

## Erweiterungen

### Neue Parser hinzufügen

1. Neue Parser-Klasse in `foerder-parsers.ts` erstellen
2. In `FoerderParserFactory` registrieren
3. Quelle in `foerder_sources` Tabelle hinzufügen

### LLM-Integration

Das System unterstützt bereits LLM-Integration für intelligentere Extraktion:

```typescript
const analyzer = new LLMFoerderAnalyzer(process.env.OPENAI_API_KEY);
const result = await analyzer.analyzeProgram(rawText, url);
```

### Webhook-Integration

Für Echtzeit-Updates können Webhooks implementiert werden:

```typescript
// In foerder-scan/route.ts
if (results.changes > 0) {
  await sendWebhook(process.env.WEBHOOK_URL, results);
}
```

## Support

Bei Problemen oder Fragen:
1. Logs in Vercel Dashboard prüfen
2. Datenbank-Status in Supabase prüfen
3. Test-Endpoints verwenden
4. Diese Dokumentation konsultieren

Das System ist darauf ausgelegt, robust und wartungsarm zu sein. Die meisten Probleme lösen sich durch die automatischen Retry-Mechanismen und Fehlerbehandlung.
