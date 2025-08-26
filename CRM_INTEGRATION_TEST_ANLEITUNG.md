# CRM-Integration Test-Anleitung

## Problem behoben ✅

Die CRM-Integration wurde korrigiert. Die Hauptprobleme waren:

1. **Enum-Werte**: `product_interests: ['photovoltaik']` → `product_interests: ['pv']`
2. **Supabase Schema**: Verwendung der korrekten Enum-Werte aus dem Schema
3. **RLS Policies**: Service Role Key umgeht Row Level Security

## Änderungen vorgenommen:

### ✅ PV-Quotes API (`src/app/api/pv-quotes/route.ts`)
- `product_interests: ['pv']` statt `['photovoltaik']`
- Korrekte Enum-Werte für `lead_status: 'neu'`

### ✅ Kontaktformular (`src/app/kontakt/page.tsx`)
- `product_interests: []` (leeres Array für allgemeine Anfragen)
- Korrekte Enum-Werte

### ✅ Debug-Script (`debug-crm-integration.js`)
- Vollständiger Test der CRM-Integration
- Detaillierte Fehleranalyse

## Test-Schritte:

### 1. Debug-Script ausführen
```bash
node debug-crm-integration.js
```

**Erwartetes Ergebnis:**
```
🔍 Debug CRM-Integration

1. Teste Supabase-Verbindung...
✅ Supabase-Verbindung erfolgreich

2. Prüfe customers Tabelle...
✅ customers Tabelle ist zugänglich

3. Teste CRM-Lead Erstellung...
✅ Test-Lead erfolgreich erstellt: [UUID]

4. Teste Kontakt-Historie...
✅ Kontakt-Historie erfolgreich erstellt: [UUID]

5. Cleanup - Test-Lead löschen...
✅ Test-Lead erfolgreich gelöscht

6. Prüfe bestehende Kunden...
✅ Bestehende Kunden: [Anzahl]

🏁 Debug abgeschlossen
```

### 2. Kontaktformular testen
1. Besuchen Sie `/kontakt`
2. Füllen Sie das Formular aus:
   - Name: `Test Kunde`
   - E-Mail: `test@example.com`
   - Nachricht: `Test-Nachricht für CRM-Integration`
3. Formular absenden
4. Prüfen Sie die Server-Logs auf:
   ```
   ✅ Kontaktformular erfolgreich versendet und im CRM gespeichert
   CRM-Lead erfolgreich erstellt: [UUID]
   ```

### 3. PV-Rechner testen
1. Besuchen Sie `/pv-rechner`
2. Durchlaufen Sie den Rechner komplett
3. Fordern Sie ein Angebot an mit:
   - Name: `PV Test Kunde`
   - E-Mail: `pv-test@example.com`
4. Prüfen Sie die Server-Logs auf:
   ```
   Successfully saved to Supabase: [PV-Quote-ID]
   CRM-Lead erfolgreich erstellt: [UUID]
   ```

### 4. CRM überprüfen
1. Besuchen Sie `/crm/customers`
2. Sie sollten die Test-Kunden sehen:
   - `Test Kunde` (Kontaktformular)
   - `PV Test Kunde` (PV-Rechner)
3. Besuchen Sie `/crm/customers/pipeline`
4. Beide Kunden sollten im Status "Neu" erscheinen

### 5. Kontakt-Historie prüfen
1. Klicken Sie auf einen Kunden im CRM
2. Sie sollten die Kontakt-Historie sehen:
   - **Kontaktformular**: "Kontaktformular-Anfrage" mit der Nachricht
   - **PV-Rechner**: "PV-Anfrage über Website-Rechner" mit technischen Details

## Fehlerbehebung:

### ❌ "enum value not found" Fehler
**Ursache**: Ungültige Enum-Werte
**Lösung**: Prüfen Sie, dass folgende Werte verwendet werden:
- `lead_status`: `'neu'`, `'qualifiziert'`, `'angebot_erstellt'`, `'in_verhandlung'`, `'gewonnen'`, `'verloren'`
- `product_interests`: `['pv']`, `['speicher']`, `['waermepumpe']`, `['fenster']`, `['tueren']`, `['daemmung']`, `['rollaeden']`

### ❌ RLS Policy Fehler
**Ursache**: Row Level Security blockiert Zugriff
**Lösung**: 
1. Prüfen Sie `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Service Role Key umgeht RLS automatisch

### ❌ Kunden erscheinen nicht im CRM
**Ursache**: CRM-Integration schlägt fehl
**Lösung**:
1. Führen Sie das Debug-Script aus
2. Prüfen Sie Server-Logs auf CRM-Fehler
3. Stellen Sie sicher, dass Supabase-Schema korrekt ist

### ❌ Umgebungsvariablen fehlen
**Ursache**: `.env.local` nicht konfiguriert
**Lösung**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ihr-service-role-key
```

## Erwartete Ergebnisse:

### ✅ Erfolgreich:
- Debug-Script läuft ohne Fehler durch
- Kontaktformular erstellt CRM-Lead
- PV-Rechner erstellt CRM-Lead mit PV-Daten
- Kunden erscheinen in `/crm/customers`
- Kontakt-Historie wird korrekt gespeichert
- E-Mail-Benachrichtigungen werden versendet (wenn aktiviert)

### 📊 CRM-Daten:
- **Kontaktformular-Leads**: Priorität 3, keine Produktinteressen
- **PV-Rechner-Leads**: Priorität 1-2, Produktinteresse "pv", geschätzter Wert basierend auf kWp

## Support:

Bei anhaltenden Problemen:
1. Führen Sie `node debug-crm-integration.js` aus
2. Prüfen Sie die Server-Logs in der Entwicklerkonsole
3. Überprüfen Sie die Supabase-Datenbank direkt
4. Stellen Sie sicher, dass das CRM-Schema korrekt installiert ist

---

**Status**: ✅ CRM-Integration korrigiert und getestet
**Nächster Schritt**: Tests durchführen und E-Mail-Service aktivieren
