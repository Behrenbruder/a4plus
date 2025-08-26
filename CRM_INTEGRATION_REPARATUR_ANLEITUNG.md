# CRM Integration Reparatur - Schritt-für-Schritt Anleitung

## Problem
Formularanfragen vom PV-Rechner und Kontaktformular erreichen das CRM nicht und es werden keine E-Mails versendet.

## Lösung
Die CRM-Integration ist implementiert, aber die Datenbank-Tabelle `customers` fehlt die notwendigen CRM-Spalten.

## Schritt 1: Datenbank-Schema aktualisieren

### 1.1 Supabase Dashboard öffnen
1. Gehen Sie zu [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Melden Sie sich an und wählen Sie Ihr Projekt aus

### 1.2 SQL-Script ausführen
1. Klicken Sie auf **"SQL Editor"** in der linken Seitenleiste
2. Klicken Sie auf **"New query"**
3. Kopieren Sie den Inhalt der Datei `supabase-crm-spalten-hinzufuegen.sql` und fügen Sie ihn ein:

```sql
-- Füge CRM-Spalten zur bestehenden customers Tabelle hinzu
-- Führen Sie dieses SQL in Supabase Dashboard → SQL Editor aus

-- Füge CRM-Spalten hinzu (falls sie nicht existieren)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'neu';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Deutschland';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS product_interests TEXT[] DEFAULT '{}';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS probability INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gdpr_consent BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Erstelle contact_history Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS contact_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contact_type TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_contact_history_customer_id ON contact_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_created_at ON contact_history(created_at);

-- Bestätige die Änderungen
SELECT 'CRM-Spalten erfolgreich hinzugefügt!' as status;
```

4. Klicken Sie auf **"Run"** um das Script auszuführen
5. Sie sollten die Meldung "CRM-Spalten erfolgreich hinzugefügt!" sehen

## Schritt 2: CRM-Integration testen

### 2.1 Debug-Script ausführen
1. Öffnen Sie ein Terminal in Ihrem Projekt-Verzeichnis
2. Führen Sie das Debug-Script aus:
```bash
node debug-crm-integration.js
```

### 2.2 Erwartete Ausgabe
Bei erfolgreicher Installation sollten Sie sehen:
```
✅ .env.local erfolgreich geladen
✅ Supabase-Verbindung erfolgreich
✅ customers Tabelle ist zugänglich
✅ CRM-Schema ist vollständig installiert
✅ Test-Lead erfolgreich erstellt
✅ Kontakt-Historie erfolgreich erstellt
✅ Test-Lead erfolgreich gelöscht
```

## Schritt 3: E-Mail-Service aktivieren

### 3.1 .env.local überprüfen
Stellen Sie sicher, dass diese Variablen in Ihrer `.env.local` gesetzt sind:
```
EMAIL_SERVICE_ENABLED=true
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_USER=ihr-email@domain.de
SMTP_PASS=ihr-passwort
ADMIN_EMAIL=ihr-email@domain.de
```

### 3.2 E-Mail-Konfiguration testen
Das Debug-Script testet nur die CRM-Integration. Für E-Mail-Tests können Sie das Kontaktformular verwenden.

## Schritt 4: Formulare testen

### 4.1 Kontaktformular testen
1. Gehen Sie zu Ihrer Website: `/kontakt`
2. Füllen Sie das Formular aus
3. Senden Sie es ab
4. Überprüfen Sie:
   - CRM-Dashboard: Neuer Lead sollte erscheinen
   - E-Mail-Postfach: Bestätigungs-E-Mail sollte ankommen

### 4.2 PV-Rechner testen
1. Gehen Sie zu: `/pv-rechner`
2. Durchlaufen Sie den Rechner bis zum Ende
3. Füllen Sie das Anfrageformular aus
4. Überprüfen Sie:
   - CRM-Dashboard: Neuer Lead mit PV-Daten sollte erscheinen
   - E-Mail-Postfach: Angebots-E-Mail sollte ankommen

## Schritt 5: CRM-Dashboard überprüfen

### 5.1 CRM öffnen
1. Gehen Sie zu: `/crm`
2. Loggen Sie sich ein (falls erforderlich)

### 5.2 Leads überprüfen
1. Klicken Sie auf "Kunden" oder "Pipeline"
2. Neue Leads sollten mit Status "neu" erscheinen
3. Kontakt-Historie sollte die Formular-Einträge zeigen

## Fehlerbehebung

### Problem: "CRM-Schema ist nicht vollständig installiert"
**Lösung**: Führen Sie Schritt 1 erneut aus

### Problem: "Supabase-Verbindung fehlgeschlagen"
**Lösung**: Überprüfen Sie die Supabase-Variablen in `.env.local`

### Problem: "RLS-Policy-Fehler"
**Lösung**: Stellen Sie sicher, dass Sie den `SUPABASE_SERVICE_ROLE_KEY` verwenden, nicht den `anon` Key

### Problem: Keine E-Mails
**Lösung**: 
1. Setzen Sie `EMAIL_SERVICE_ENABLED=true`
2. Überprüfen Sie SMTP-Konfiguration
3. Prüfen Sie Spam-Ordner

## Erfolgskontrolle

Nach erfolgreicher Durchführung sollten:
- ✅ Kontaktformular-Anfragen im CRM erscheinen
- ✅ PV-Rechner-Anfragen im CRM erscheinen
- ✅ E-Mail-Benachrichtigungen versendet werden
- ✅ Kontakt-Historie gespeichert werden
- ✅ Debug-Script ohne Fehler durchlaufen

## Support

Bei weiteren Problemen:
1. Führen Sie `node debug-crm-integration.js` aus
2. Senden Sie die Ausgabe zur Analyse
3. Überprüfen Sie Browser-Konsole auf JavaScript-Fehler
4. Überprüfen Sie Vercel-Logs für Server-Fehler
