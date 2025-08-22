# Supabase CRM Setup Anleitung

## 1. Supabase Projekt erstellen

1. Gehen Sie zu [supabase.com](https://supabase.com) und melden Sie sich an
2. Erstellen Sie ein neues Projekt
3. Wählen Sie eine Region (am besten Europa für deutsche Kunden)
4. Notieren Sie sich die **Project URL** und den **anon public key**

## 2. Umgebungsvariablen einrichten

Kopieren Sie `.env.example` zu `.env.local` und füllen Sie die Supabase-Werte aus:

```bash
cp .env.example .env.local
```

Bearbeiten Sie `.env.local`:

```env
# Google Maps API Key (bereits vorhanden)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCxNrPNcvHYTDLShc51HsObpH1FwJA9F9c

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. Datenbank Schema einrichten

1. Öffnen Sie Ihr Supabase Dashboard
2. Gehen Sie zu "SQL Editor"
3. Kopieren Sie den Inhalt von `supabase-schema.sql` und führen Sie ihn aus
4. Dies erstellt alle notwendigen Tabellen, Indizes und Beispieldaten

## 4. Row Level Security (RLS) konfigurieren

Die SQL-Datei aktiviert bereits RLS für alle Tabellen. Für Produktionsumgebungen sollten Sie die Policies anpassen:

```sql
-- Beispiel: Nur authentifizierte Admin-Benutzer
CREATE POLICY "Admin only" ON customers
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

## 5. Authentifizierung einrichten (Optional)

Für eine vollständige Lösung können Sie Supabase Auth verwenden:

1. Gehen Sie zu "Authentication" > "Settings"
2. Konfigurieren Sie E-Mail-Provider oder OAuth-Provider
3. Erstellen Sie Admin-Benutzer

## 6. Anwendung starten

```bash
npm run dev
```

Besuchen Sie:
- Hauptseite: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin

## 7. Funktionen testen

### Kunden verwalten
- Gehen Sie zu `/admin/customers`
- Fügen Sie neue Kunden hinzu
- Bearbeiten Sie bestehende Kunden
- Exportieren Sie Kontakte für Outlook

### Monteure verwalten
- Gehen Sie zu `/admin/installers`
- Verwalten Sie Ihr Monteur-Team
- Setzen Sie Spezialisierungen und Stundensätze

### E-Mail Verlauf
- Gehen Sie zu `/admin/emails`
- Sehen Sie die E-Mail-Kommunikation ein
- Filtern Sie nach Kunden

## 8. API Endpunkte

### Kunden
- `GET /api/customers` - Liste aller Kunden
- `POST /api/customers` - Neuen Kunden erstellen
- `GET /api/customers/[id]` - Einzelnen Kunden abrufen
- `PUT /api/customers/[id]` - Kunden aktualisieren
- `DELETE /api/customers/[id]` - Kunden löschen
- `GET /api/customers/[id]/export-outlook` - Outlook vCard Export

### Monteure
- `GET /api/installers` - Liste aller Monteure
- `POST /api/installers` - Neuen Monteur erstellen
- `GET /api/installers/[id]` - Einzelnen Monteur abrufen
- `PUT /api/installers/[id]` - Monteur aktualisieren
- `DELETE /api/installers/[id]` - Monteur löschen

### E-Mails
- `GET /api/emails` - E-Mail Verlauf
- `POST /api/emails` - Neue E-Mail protokollieren

## 9. Deployment auf Vercel

1. Pushen Sie Ihren Code zu GitHub
2. Verbinden Sie Ihr Repository mit Vercel
3. Fügen Sie die Umgebungsvariablen in Vercel hinzu
4. Deployen Sie die Anwendung

## 10. Erweiterte Features

### E-Mail Integration
Für automatische E-Mail-Protokollierung können Sie:
- Webhooks von Ihrem E-Mail-Provider einrichten
- IMAP/SMTP Integration implementieren
- Microsoft Graph API für Outlook-Integration nutzen

### Benachrichtigungen
- Supabase Realtime für Live-Updates
- Push-Benachrichtigungen für neue Leads
- E-Mail-Benachrichtigungen für wichtige Events

### Reporting
- Erweitern Sie das Dashboard um Charts
- Exportfunktionen für Excel/CSV
- Automatische Berichte

## Troubleshooting

### Häufige Probleme

1. **Verbindungsfehler zu Supabase**
   - Überprüfen Sie die URL und Keys
   - Stellen Sie sicher, dass RLS korrekt konfiguriert ist

2. **TypeScript Fehler**
   - Führen Sie `npm run build` aus um Typen zu überprüfen
   - Stellen Sie sicher, dass alle Abhängigkeiten installiert sind

3. **Authentifizierung**
   - Für Produktionsumgebungen implementieren Sie echte Authentifizierung
   - Aktuell sind alle Endpunkte öffentlich zugänglich

## Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Supabase Dokumentation
2. Schauen Sie in die Browser-Konsole für Fehler
3. Überprüfen Sie die Netzwerk-Registerkarte für API-Aufrufe
