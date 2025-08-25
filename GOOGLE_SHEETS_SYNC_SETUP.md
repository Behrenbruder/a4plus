# Google Sheets Synchronisation - Setup Anleitung

Diese Anleitung erklärt, wie Sie die automatische Synchronisation Ihrer CRM-Datenbank mit Google Sheets einrichten.

## Übersicht

Das System synchronisiert automatisch folgende Tabellen:
- **Kunden** - Alle Kundendaten
- **PV-Angebote** - PV-Rechner Angebots-Anfragen
- **Installateure** - Installateur-Daten
- **E-Mail-Logs** - E-Mail-Kommunikation (letzte 1000)
- **Projekte** - Projekt-Informationen

## 1. Google Cloud Console Setup

### 1.1 Projekt erstellen
1. Gehen Sie zur [Google Cloud Console](https://console.cloud.google.com/)
2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes aus
3. Notieren Sie sich die Projekt-ID

### 1.2 Google Sheets API aktivieren
1. Navigieren Sie zu "APIs & Services" > "Library"
2. Suchen Sie nach "Google Sheets API"
3. Klicken Sie auf "Enable"

### 1.3 Service Account erstellen
1. Gehen Sie zu "APIs & Services" > "Credentials"
2. Klicken Sie auf "Create Credentials" > "Service Account"
3. Geben Sie einen Namen ein (z.B. "sheets-sync-service")
4. Klicken Sie auf "Create and Continue"
5. Überspringen Sie die Rollen-Zuweisung (optional)
6. Klicken Sie auf "Done"

### 1.4 Service Account Key generieren
1. Klicken Sie auf den erstellten Service Account
2. Gehen Sie zum Tab "Keys"
3. Klicken Sie auf "Add Key" > "Create new key"
4. Wählen Sie "JSON" als Format
5. Die JSON-Datei wird automatisch heruntergeladen

## 2. Google Sheets Setup

### 2.1 Spreadsheet erstellen
1. Gehen Sie zu [Google Sheets](https://sheets.google.com/)
2. Erstellen Sie ein neues Spreadsheet
3. Benennen Sie es (z.B. "CRM Datenbank Sync")
4. Kopieren Sie die Spreadsheet-ID aus der URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### 2.2 Service Account Berechtigung erteilen
1. Öffnen Sie das erstellte Spreadsheet
2. Klicken Sie auf "Share" (Teilen)
3. Fügen Sie die Service Account E-Mail-Adresse hinzu (aus der JSON-Datei: `client_email`)
4. Geben Sie "Editor" Berechtigung
5. Klicken Sie auf "Send"

## 3. Umgebungsvariablen konfigurieren

Fügen Sie folgende Variablen zu Ihrer `.env.local` Datei hinzu:

```env
# Google Sheets Integration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# Supabase (falls noch nicht vorhanden)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Wichtige Hinweise:
- **GOOGLE_SHEETS_CLIENT_EMAIL**: Aus der JSON-Datei (`client_email` Feld)
- **GOOGLE_SHEETS_PRIVATE_KEY**: Aus der JSON-Datei (`private_key` Feld) - Achten Sie auf die Anführungszeichen und `\n` für Zeilenumbrüche
- **GOOGLE_SHEETS_SPREADSHEET_ID**: Aus der Google Sheets URL extrahieren

## 4. Installation und Test

### 4.1 Dependencies installieren
Die notwendigen Pakete sind bereits installiert:
- `googleapis`
- `google-auth-library`

### 4.2 Verbindung testen
1. Starten Sie Ihren Development Server:
   ```bash
   npm run dev
   ```

2. Testen Sie die Verbindung:
   ```bash
   curl http://localhost:3000/api/sync-google-sheets
   ```

   Erwartete Antwort:
   ```json
   {
     "status": "Service verfügbar",
     "connections": {
       "supabase": "Verbunden",
       "googleSheets": "Verbunden"
     },
     "ready": true,
     "timestamp": "2025-01-25T15:23:45.123Z"
   }
   ```

### 4.3 Manuelle Synchronisation testen
```bash
curl -X POST http://localhost:3000/api/sync-google-sheets
```

Erwartete Antwort:
```json
{
  "success": true,
  "message": "Alle Tabellen erfolgreich synchronisiert",
  "results": [
    {
      "table": "customers",
      "success": true,
      "count": 5
    },
    {
      "table": "pv_quotes",
      "success": true,
      "count": 12
    }
  ],
  "timestamp": "2025-01-25T15:23:45.123Z"
}
```

## 5. Automatische Synchronisation einrichten

### 5.1 Cron Job (Linux/Mac)
Fügen Sie einen Cron Job hinzu für regelmäßige Synchronisation:

```bash
# Bearbeiten Sie die Crontab
crontab -e

# Fügen Sie eine Zeile hinzu (z.B. alle 30 Minuten)
*/30 * * * * curl -X POST http://localhost:3000/api/sync-google-sheets

# Oder täglich um 2:00 Uhr
0 2 * * * curl -X POST http://localhost:3000/api/sync-google-sheets
```

### 5.2 Windows Task Scheduler
1. Öffnen Sie Task Scheduler
2. Erstellen Sie eine neue Aufgabe
3. Trigger: Täglich oder nach Bedarf
4. Aktion: Programm starten
   - Programm: `curl`
   - Argumente: `-X POST http://localhost:3000/api/sync-google-sheets`

### 5.3 Vercel Cron Jobs (Production)
Für Production auf Vercel können Sie Vercel Cron Jobs verwenden:

1. Erstellen Sie `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/sync-google-sheets",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

2. Passen Sie die API-Route für Cron an:
```typescript
// In src/app/api/sync-google-sheets/route.ts
export async function GET(request: NextRequest) {
  // Prüfe ob es ein Vercel Cron Request ist
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Führe Synchronisation durch...
}
```

## 6. Monitoring und Troubleshooting

### 6.1 Logs überwachen
Überprüfen Sie die Konsolen-Logs für Fehler:
- Supabase Verbindungsfehler
- Google Sheets API Fehler
- Authentifizierungsprobleme

### 6.2 Häufige Probleme

**Problem**: "Service Account not found"
- **Lösung**: Überprüfen Sie die `GOOGLE_SHEETS_CLIENT_EMAIL`

**Problem**: "Invalid private key"
- **Lösung**: Stellen Sie sicher, dass der Private Key korrekt formatiert ist mit `\n` für Zeilenumbrüche

**Problem**: "Spreadsheet not found"
- **Lösung**: Überprüfen Sie die Spreadsheet-ID und Berechtigungen

**Problem**: "Insufficient permissions"
- **Lösung**: Stellen Sie sicher, dass der Service Account Editor-Berechtigung für das Spreadsheet hat

### 6.3 Datenformat in Google Sheets
Die Daten werden automatisch formatiert:
- Datums-Felder: ISO-Format (YYYY-MM-DD)
- Boolean-Felder: "Ja"/"Nein"
- JSON-Felder: Als String dargestellt
- Leere Felder: Leer gelassen

## 7. Sicherheitshinweise

1. **Private Keys schützen**: Niemals Private Keys in Git committen
2. **Umgebungsvariablen**: Verwenden Sie sichere Umgebungsvariablen
3. **Berechtigungen**: Geben Sie nur minimale notwendige Berechtigungen
4. **Monitoring**: Überwachen Sie API-Aufrufe und Kosten

## 8. Erweiterte Konfiguration

### 8.1 Selektive Synchronisation
Sie können einzelne Tabellen synchronisieren, indem Sie die entsprechenden Methoden direkt aufrufen:

```typescript
const syncService = createDatabaseSyncService();
await syncService.syncCustomers();
await syncService.syncPvQuotes();
```

### 8.2 Custom Formatierung
Passen Sie die Datenformatierung in `src/lib/databaseSync.ts` an Ihre Bedürfnisse an.

### 8.3 Fehlerbehandlung
Das System behandelt Fehler automatisch und protokolliert sie. Bei kritischen Fehlern wird die Synchronisation gestoppt.

## Support

Bei Problemen:
1. Überprüfen Sie die Logs
2. Testen Sie die Verbindungen einzeln
3. Überprüfen Sie die Umgebungsvariablen
4. Stellen Sie sicher, dass alle Berechtigungen korrekt sind

Die Synchronisation läuft vollautomatisch und erstellt/aktualisiert die Google Sheets Tabellen nach Bedarf.
