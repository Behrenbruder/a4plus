# Email Webhook Integration - Vollständige Anleitung

## Problem gelöst ✅

Das ursprüngliche Problem war, dass **eingehende E-Mails** (Antworten von Kunden) nicht im CRM erschienen sind. Nur ausgehende E-Mails (Bestätigungen) und Formular-Einträge wurden gespeichert.

## Lösung implementiert

### 1. Email Webhook API erstellt
**Datei**: `src/app/api/emails/webhook/route.ts`

Diese API kann eingehende E-Mails empfangen und automatisch im CRM speichern:
- Extrahiert E-Mail-Daten (Absender, Betreff, Inhalt)
- Findet oder erstellt Kunden automatisch
- Speichert E-Mails in der `contact_history` Tabelle
- Unterstützt verschiedene E-Mail-Provider-Formate

### 2. Funktionen der Webhook API

#### POST /api/emails/webhook
Empfängt eingehende E-Mails und verarbeitet sie:

```json
{
  "from": "Samuel Alexander <samuel.behr7@gmail.com>",
  "to": "info@a4plus.eu", 
  "subject": "Re: Erste Kontaktaufnahme",
  "text": "jöjööjöö",
  "html": "<p>jöjööjöö</p>",
  "date": "2025-08-26T03:11:00.000Z",
  "messageId": "<message-id@gmail.com>",
  "inReplyTo": "<original-message-id@a4plus.eu>",
  "references": "<original-message-id@a4plus.eu>"
}
```

#### GET /api/emails/webhook
Status-Endpoint zum Testen der Webhook-Verfügbarkeit.

### 3. Automatische Kundenerstellung

Wenn eine E-Mail von einer unbekannten E-Mail-Adresse kommt:
- Wird automatisch ein neuer Kunde erstellt
- Name wird aus der E-Mail-Adresse abgeleitet
- Lead-Status wird auf "neu" gesetzt
- Lead-Quelle wird auf "Email" gesetzt

### 4. Vollständige E-Mail-Historie

Das CRM zeigt jetzt **alle** E-Mail-Kommunikation:
1. **Formular-Einträge** (inbound) - Website-Anfragen
2. **Bestätigungs-E-Mails** (outbound) - Automatische Antworten
3. **Eingehende E-Mails** (inbound) - Kunden-Antworten
4. **Ausgehende E-Mails** (outbound) - Manuelle Antworten

## Setup für Produktionsumgebung

### Option 1: E-Mail-Provider Webhook (Empfohlen)

#### Für IONOS/1&1:
1. Im IONOS Control Panel zu E-Mail-Einstellungen
2. Webhook-URL konfigurieren: `https://ihre-domain.de/api/emails/webhook`
3. Webhook für eingehende E-Mails aktivieren

#### Für Gmail/Google Workspace:
1. Google Cloud Console öffnen
2. Gmail API aktivieren
3. Pub/Sub Topic erstellen
4. Push-Subscription zu Webhook-URL konfigurieren

#### Für Outlook/Microsoft 365:
1. Microsoft Graph API verwenden
2. Webhook-Subscription für Mailbox erstellen
3. Notification-URL auf Webhook setzen

### Option 2: IMAP Polling (Alternative)

Falls Webhooks nicht verfügbar sind, kann ein IMAP-Polling-Service implementiert werden:

```javascript
// Beispiel für IMAP-Integration
const imap = require('imap');
const { simpleParser } = require('mailparser');

// Regelmäßig neue E-Mails abrufen und an Webhook weiterleiten
```

## Testen der Integration

### 1. Webhook-Status prüfen
```bash
curl http://localhost:3009/api/emails/webhook
```

### 2. Test-E-Mail senden
```bash
curl -X POST http://localhost:3009/api/emails/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@example.com",
    "to": "info@a4plus.eu",
    "subject": "Test E-Mail",
    "text": "Dies ist eine Test-E-Mail"
  }'
```

### 3. CRM überprüfen
- Im CRM zu Kunden navigieren
- Kunden auswählen
- E-Mail-Historie überprüfen
- Refresh-Button verwenden falls nötig

## Vorteile der Lösung

### ✅ Vollständige E-Mail-Synchronisation
- Alle eingehenden und ausgehenden E-Mails werden erfasst
- Chronologische Darstellung der Kommunikation
- Automatische Kundenzuordnung

### ✅ Automatisierung
- Keine manuelle Eingabe erforderlich
- Automatische Kundenerstellung
- Echtzeit-Synchronisation

### ✅ Skalierbarkeit
- Unterstützt verschiedene E-Mail-Provider
- Kann große E-Mail-Volumina verarbeiten
- Erweiterbar für zusätzliche Funktionen

### ✅ Benutzerfreundlichkeit
- Refresh-Button in der E-Mail-Historie
- Nachrichtenzähler
- Klare Darstellung von ein-/ausgehenden E-Mails

## Wartung und Monitoring

### Log-Überwachung
Die Webhook-API protokolliert alle Aktivitäten:
```
📧 Incoming email webhook received
📧 Processing incoming email from sender@domain.com to info@a4plus.eu
✅ Found existing customer: customer-id
✅ Email stored successfully: contact-id
```

### Fehlerbehandlung
- Fehlende Pflichtfelder werden abgefangen
- Datenbankfehler werden protokolliert
- Automatische Wiederholung bei temporären Fehlern

### Performance-Optimierung
- Effiziente Datenbankabfragen
- Caching für häufige Anfragen
- Batch-Verarbeitung für große E-Mail-Volumina

## Nächste Schritte

1. **Produktions-Webhook konfigurieren** - E-Mail-Provider-Webhook einrichten
2. **Monitoring einrichten** - Überwachung der Webhook-Performance
3. **Backup-Strategie** - Sicherung der E-Mail-Daten
4. **Erweiterte Funktionen** - Anhänge, E-Mail-Templates, Automatisierung

## Technische Details

### Datenbankschema
```sql
-- contact_history Tabelle
CREATE TABLE contact_history (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    contact_type VARCHAR (email, telefon, chat, website_formular),
    subject VARCHAR(500),
    content TEXT,
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API-Endpunkte
- `POST /api/emails/webhook` - Eingehende E-Mails verarbeiten
- `GET /api/emails/webhook` - Webhook-Status abrufen
- `GET /api/crm/customers/[id]/emails` - E-Mail-Historie abrufen

### Sicherheit
- HTTPS-Verschlüsselung erforderlich
- API-Rate-Limiting implementiert
- Eingabevalidierung und Sanitization
- Datenschutz-konforme Speicherung

---

**Status**: ✅ **Vollständig implementiert und getestet**

Die E-Mail-Synchronisation funktioniert jetzt korrekt. Alle eingehenden E-Mails werden automatisch im CRM erfasst und in der E-Mail-Historie angezeigt.
