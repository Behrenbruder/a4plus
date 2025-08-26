# E-Mail-Konfiguration für A4Plus Website

## Problem behoben ✅

Die Anfragen vom PV-Rechner und Kontaktformular erreichen das CRM nicht und Sie erhalten keine E-Mails, weil:

1. **Kontaktformular**: Hatte nur `console.log()` statt echtem E-Mail-Versand
2. **E-Mail-Service**: War deaktiviert (`EMAIL_SERVICE_ENABLED=false`)
3. **PV-Rechner**: Funktionierte technisch, aber E-Mails wurden nicht versendet

## Was wurde behoben:

### ✅ Kontaktformular (`src/app/kontakt/page.tsx`)
- E-Mail-Integration implementiert
- Sendet jetzt Benachrichtigungen an `info@a4plus.eu`
- Sendet Bestätigungen an Kunden
- **NEU**: Automatische CRM-Lead-Erstellung
- **NEU**: Kontakt-Historie wird gespeichert

### ✅ E-Mail-Benachrichtigungen (`src/lib/email-notifications.ts`)
- Aktiviert für alle Formulare
- Professionelle HTML-E-Mails
- Sowohl Benachrichtigungen als auch Bestätigungen

### ✅ PV-Rechner (`src/app/api/pv-quotes/route.ts`)
- War bereits korrekt implementiert
- Funktioniert sobald E-Mail-Service aktiviert ist
- **NEU**: Automatische CRM-Lead-Erstellung
- **NEU**: Verknüpfung von PV-Quotes mit CRM-Kunden
- **NEU**: Detaillierte Kontakt-Historie mit PV-Daten

### ✅ CRM-Integration
- Alle Anfragen werden automatisch als Leads im CRM erstellt
- Intelligente Duplikatserkennung (keine doppelten Kunden)
- Automatische Lead-Bewertung und Priorisierung
- Vollständige Kontakt-Historie

## Nächste Schritte - E-Mail-Service aktivieren:

### 1. Umgebungsvariablen konfigurieren

Bearbeiten Sie Ihre `.env.local` Datei und fügen Sie hinzu:

```env
# E-Mail-Konfiguration
EMAIL_SERVICE_ENABLED=true
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_USER=info@a4plus.eu
SMTP_PASS=IHR_EMAIL_PASSWORT
SMTP_FROM=info@a4plus.eu
NOTIFICATION_EMAIL=info@a4plus.eu

# Firmeninformationen
COMPANY_NAME=A4Plus
COMPANY_EMAIL=info@a4plus.eu
COMPANY_PHONE=+49 6233 3798860
COMPANY_ADDRESS="Carl-Zeiss-Straße 5, 67227 Frankenthal"
NEXT_PUBLIC_BASE_URL=https://ihre-domain.de
```

### 2. IONOS E-Mail-Einstellungen

Für IONOS verwenden Sie:
- **SMTP-Server**: `smtp.ionos.de`
- **Port**: `587` (STARTTLS)
- **Benutzername**: Ihre vollständige E-Mail-Adresse
- **Passwort**: Ihr E-Mail-Passwort

### 3. Alternative E-Mail-Provider

Falls Sie einen anderen Provider verwenden:

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ihre-email@gmail.com
SMTP_PASS=app-spezifisches-passwort
```

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=ihre-email@outlook.com
SMTP_PASS=ihr-passwort
```

### 4. Testen der Konfiguration

Nach der Konfiguration können Sie testen:

1. **Kontaktformular**: Besuchen Sie `/kontakt` und senden Sie eine Testanfrage
2. **PV-Rechner**: Verwenden Sie den PV-Rechner und fordern Sie ein Angebot an
3. **Logs prüfen**: Schauen Sie in die Konsole/Logs für E-Mail-Status

## E-Mail-Funktionen im Detail:

### Kontaktformular
- **An Sie**: Benachrichtigung mit Kundendaten und Nachricht
- **An Kunde**: Bestätigung der Anfrage

### PV-Rechner
- **An Sie**: Detaillierte PV-Anfrage mit allen Berechnungsdaten
- **An Kunde**: Bestätigung mit Zusammenfassung der PV-Konfiguration

### CRM-Integration
- **Alle Anfragen** werden automatisch als CRM-Leads erstellt
- **PV-Anfragen**: Hohe Priorität, geschätzter Wert basierend auf kWp
- **Kontaktformular**: Standard-Priorität, allgemeine Anfragen
- **Duplikatserkennung**: Bestehende Kunden werden erkannt und verknüpft
- **Kontakt-Historie**: Alle Interaktionen werden dokumentiert
- Verfügbar im CRM unter `/crm/customers` und `/crm/customers/pipeline`
- Admin-Panel weiterhin unter `/admin/pv-quotes` verfügbar

## Fehlerbehebung:

### E-Mails kommen nicht an:
1. Prüfen Sie `EMAIL_SERVICE_ENABLED=true`
2. Überprüfen Sie SMTP-Zugangsdaten
3. Schauen Sie in die Server-Logs
4. Prüfen Sie Spam-Ordner

### SMTP-Verbindungsfehler:
1. Firewall-Einstellungen prüfen
2. Port 587 freigeben
3. Bei IONOS: 2-Faktor-Authentifizierung beachten

### Nur Logs, keine E-Mails:
- `EMAIL_SERVICE_ENABLED` muss auf `true` stehen
- Server neu starten nach Änderung der Umgebungsvariablen

## Sicherheitshinweise:

1. **Niemals** E-Mail-Passwörter in Git committen
2. Verwenden Sie App-spezifische Passwörter bei Gmail
3. Aktivieren Sie 2FA für E-Mail-Accounts
4. Überwachen Sie E-Mail-Versand auf Missbrauch

## Support:

Bei Problemen:
1. Prüfen Sie die Server-Logs
2. Testen Sie SMTP-Verbindung manuell
3. Kontaktieren Sie Ihren E-Mail-Provider bei Verbindungsproblemen

---

**Status**: ✅ Code-Änderungen abgeschlossen
**Nächster Schritt**: E-Mail-Konfiguration in `.env.local` aktivieren
