# Setup-Anleitung: PV-Angebots-Popup

## 1. Datenbank-Setup

### Supabase-Schema ausführen
Führen Sie das SQL-Schema in Ihrer Supabase-Datenbank aus:

```sql
-- Inhalt von supabase-pv-quotes-schema.sql ausführen
```

Das Schema erstellt:
- Tabelle `pv_quotes` für PV-Angebots-Anfragen
- Indizes für bessere Performance
- Row Level Security Policies
- Trigger für automatische Zeitstempel

## 2. Umgebungsvariablen

### Erforderliche Variablen in `.env.local`:

```env
# Supabase (bereits vorhanden)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Basis-URL für E-Mail-Links
NEXT_PUBLIC_BASE_URL=https://ihre-domain.de

# Optional: E-Mail-Service (für zukünftige Erweiterung)
EMAIL_SERVICE_ENABLED=false
NOTIFICATION_EMAIL=info@ihre-firma.de
```

### Variablen prüfen:
```bash
# Prüfen Sie, ob die Supabase-Variablen gesetzt sind
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

## 3. Funktionstest

### 1. Entwicklungsserver starten:
```bash
npm run dev
```

### 2. PV-Rechner testen:
1. Öffnen Sie `http://localhost:3000/pv-rechner`
2. Durchlaufen Sie den kompletten Rechner
3. Klicken Sie auf "Kostenloses Angebot anfordern"
4. Füllen Sie das Formular aus und senden Sie es ab

### 3. Admin-Interface testen:
1. Öffnen Sie `http://localhost:3000/admin`
2. Klicken Sie auf "PV-Anfragen"
3. Überprüfen Sie, ob die Anfrage angezeigt wird
4. Testen Sie die Status-Änderung

## 4. E-Mail-Benachrichtigungen

### Aktueller Status:
- **Demo-Modus**: E-Mails werden in der Konsole geloggt
- **Produktion**: Echter E-Mail-Service muss integriert werden

### E-Mail-Service integrieren (optional):

#### Option 1: Nodemailer mit SMTP
```bash
npm install nodemailer @types/nodemailer
```

#### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

#### Option 3: Resend
```bash
npm install resend
```

### Konfiguration in `src/lib/email-notifications.ts`:
Entkommentieren und anpassen Sie den entsprechenden Service-Code.

## 5. Deployment

### Vercel-Deployment:
```bash
# Umgebungsvariablen in Vercel setzen
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_BASE_URL

# Deployment
vercel --prod
```

### Andere Hosting-Anbieter:
Stellen Sie sicher, dass alle Umgebungsvariablen gesetzt sind.

## 6. Sicherheit

### Supabase Row Level Security:
- Bereits konfiguriert für authentifizierte Benutzer
- Für öffentliche API-Zugriffe angepasst

### API-Validierung:
- Input-Validierung auf Server-Seite
- Schutz vor SQL-Injection
- Rate-Limiting empfohlen für Produktion

## 7. Monitoring

### Logs überwachen:
```bash
# Entwicklung
npm run dev

# Produktion (Vercel)
vercel logs
```

### Datenbank-Monitoring:
- Supabase Dashboard für Anfragen-Statistiken
- Performance-Metriken überwachen

## 8. Wartung

### Regelmäßige Aufgaben:
1. **Datenbank-Backups** (automatisch in Supabase)
2. **Anfragen-Status aktualisieren** über Admin-Interface
3. **E-Mail-Logs überprüfen** bei Problemen
4. **Performance-Metriken** überwachen

### Updates:
- Neue Features über Git-Deployment
- Datenbank-Migrationen bei Schema-Änderungen

## 9. Troubleshooting

### Häufige Probleme:

#### Popup öffnet sich nicht:
- Browser-Konsole auf JavaScript-Fehler prüfen
- React-Komponenten-State überprüfen

#### API-Fehler:
- Supabase-Verbindung testen
- Umgebungsvariablen überprüfen
- Netzwerk-Tab in Browser-Entwicklertools

#### E-Mail-Benachrichtigungen:
- Konsole-Logs überprüfen
- E-Mail-Service-Konfiguration validieren

#### Admin-Interface:
- Authentifizierung überprüfen
- API-Routen testen

## 10. Support

### Dokumentation:
- `PV_ANGEBOTS_POPUP_IMPLEMENTIERUNG.md` - Technische Details
- Supabase-Dokumentation für Datenbank-Fragen
- Next.js-Dokumentation für Framework-Fragen

### Logs und Debugging:
- Browser-Entwicklertools
- Server-Logs (Vercel/Hosting-Anbieter)
- Supabase-Dashboard für Datenbank-Logs

Das PV-Angebots-Popup ist jetzt vollständig implementiert und einsatzbereit!
