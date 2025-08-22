# Row Level Security (RLS) Setup Guide

## Was ist Row Level Security?

RLS ist ein Sicherheitsfeature von PostgreSQL/Supabase, das den Zugriff auf Tabellenzeilen basierend auf Benutzerrichtlinien (Policies) kontrolliert.

## Aktuelle RLS-Konfiguration

In der `supabase-schema-fixed.sql` ist RLS bereits so konfiguriert:

```sql
-- RLS aktivieren
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Einfache Policy: Alle Operationen erlauben
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON installers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON email_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON projects FOR ALL USING (true);
```

## Warum diese Konfiguration?

**Aktuell:** `USING (true)` bedeutet, dass alle Operationen erlaubt sind - das ist für die Entwicklung und den ersten Test ideal.

**Für Produktion:** Sie sollten restriktivere Policies erstellen.

## Produktions-RLS einrichten

### Option 1: Nur für authentifizierte Benutzer

```sql
-- Alte Policies löschen
DROP POLICY IF EXISTS "Allow all operations" ON customers;
DROP POLICY IF EXISTS "Allow all operations" ON installers;
DROP POLICY IF EXISTS "Allow all operations" ON email_logs;
DROP POLICY IF EXISTS "Allow all operations" ON projects;

-- Neue Policies: Nur für authentifizierte Benutzer
CREATE POLICY "Authenticated users only" ON customers 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users only" ON installers 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users only" ON email_logs 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users only" ON projects 
    FOR ALL USING (auth.role() = 'authenticated');
```

### Option 2: Admin-basierte Policies

```sql
-- Policies für Admin-Rolle
CREATE POLICY "Admin full access" ON customers 
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access" ON installers 
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access" ON email_logs 
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access" ON projects 
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### Option 3: Service Role für API

```sql
-- Policies für Service Role (für Ihre API-Routen)
CREATE POLICY "Service role access" ON customers 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access" ON installers 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access" ON email_logs 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access" ON projects 
    FOR ALL USING (auth.role() = 'service_role');
```

## Empfohlene Schritte

### Schritt 1: Erst mal testen (aktuelle Konfiguration)
- Führen Sie `supabase-schema-fixed.sql` aus
- Testen Sie das System mit `npm run dev`
- Überprüfen Sie, ob alles funktioniert

### Schritt 2: Service Role Key hinzufügen
1. Gehen Sie zu Supabase Dashboard → Settings → API
2. Kopieren Sie den **service_role** Key
3. Fügen Sie ihn in `.env.local` hinzu:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Schritt 3: API für Service Role konfigurieren
Aktualisieren Sie `src/lib/supabase.ts`:

```typescript
// Service client mit Service Role Key
export const createSupabaseServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### Schritt 4: Produktions-Policies aktivieren
Führen Sie eine der obigen Policy-Optionen in Supabase SQL Editor aus.

## Für Ihr aktuelles Setup

**Empfehlung:** Lassen Sie die aktuelle Konfiguration (`USING (true)`) für jetzt, da:
1. Sie können das System sofort testen
2. Ihre API-Routen funktionieren ohne zusätzliche Authentifizierung
3. Sie können später restriktivere Policies hinzufügen

## RLS in Supabase Dashboard verwalten

1. Gehen Sie zu **Database** → **Tables**
2. Wählen Sie eine Tabelle (z.B. `customers`)
3. Klicken Sie auf **"RLS disabled/enabled"** um den Status zu sehen
4. Klicken Sie auf **"Add RLS policy"** um neue Policies zu erstellen
5. Verwenden Sie den Policy Editor für grafische Konfiguration

## Testen der RLS

```javascript
// Test in Browser-Konsole auf /admin
fetch('/api/customers')
  .then(r => r.json())
  .then(console.log)
```

Wenn Sie Daten sehen, funktioniert RLS korrekt!

## Troubleshooting

**Problem:** "Row Level Security is enabled but no policies exist"
**Lösung:** Führen Sie die Policy-Erstellung aus der SQL-Datei aus

**Problem:** API gibt leere Ergebnisse zurück
**Lösung:** Überprüfen Sie, ob die Policies korrekt sind oder verwenden Sie Service Role Key

**Problem:** Authentifizierung erforderlich
**Lösung:** Implementieren Sie Supabase Auth oder verwenden Sie Service Role für API-Zugriff
