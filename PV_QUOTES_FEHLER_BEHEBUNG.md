# PV-Quotes Fehler Behebung

## Problem
Die PV-Angebots-Anfragen werden nicht in der Datenbank gespeichert. Fehler: "Fehler beim Speichern der Anfrage"

## Ursache
Das Problem liegt an der Row Level Security (RLS) Policy in Supabase. Die aktuelle Policy erlaubt nur authentifizierten Benutzern den Zugriff, aber die API verwendet den Service Role Key.

## Lösung

### Schritt 1: Supabase Dashboard öffnen
1. Gehen Sie zu https://supabase.com/dashboard
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu "SQL Editor"

### Schritt 2: Fix-Script ausführen
Führen Sie das folgende SQL-Script aus:

```sql
-- Fix für PV-Quotes Tabelle - RLS Policy korrigieren

-- Entferne die alte Policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON pv_quotes;

-- Neue Policy für Service Role (API-Zugriff)
CREATE POLICY "Allow service role access" ON pv_quotes
    FOR ALL USING (true);

-- Stelle sicher, dass die update_updated_at_column Funktion existiert
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Schritt 3: Tabelle prüfen
Prüfen Sie, ob die Tabelle `pv_quotes` existiert:

```sql
SELECT * FROM pv_quotes LIMIT 1;
```

Falls die Tabelle nicht existiert, führen Sie das ursprüngliche Schema aus:

```sql
-- Erweitere das Schema um PV-Rechner Angebots-Anfragen
CREATE TABLE IF NOT EXISTS pv_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Kundendaten
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- PV-Rechner Daten
    roof_type VARCHAR(50),
    roof_tilt_deg DECIMAL(5,2),
    annual_consumption_kwh DECIMAL(10,2),
    electricity_price_ct_per_kwh DECIMAL(6,2),
    
    -- Dachflächen (JSON Array)
    roof_faces JSONB,
    
    -- System-Konfiguration
    total_kwp DECIMAL(8,2),
    annual_pv_kwh DECIMAL(10,2),
    battery_kwh DECIMAL(6,2),
    
    -- E-Auto Daten
    ev_km_per_year INTEGER,
    ev_kwh_per_100km DECIMAL(4,1),
    ev_home_charging_share DECIMAL(3,2),
    ev_charger_power_kw DECIMAL(4,1),
    
    -- Wärmepumpe
    heat_pump_consumption_kwh DECIMAL(10,2),
    
    -- Berechnungsergebnisse
    autarkie_pct DECIMAL(5,2),
    eigenverbrauch_pct DECIMAL(5,2),
    annual_savings_eur DECIMAL(10,2),
    co2_savings_tons DECIMAL(6,3),
    payback_time_years DECIMAL(4,1),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'declined')),
    notes TEXT
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_pv_quotes_email ON pv_quotes(email);
CREATE INDEX IF NOT EXISTS idx_pv_quotes_created_at ON pv_quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_pv_quotes_status ON pv_quotes(status);

-- Updated_at Trigger
CREATE TRIGGER update_pv_quotes_updated_at BEFORE UPDATE ON pv_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE pv_quotes ENABLE ROW LEVEL SECURITY;

-- Policy für Service Role (API-Zugriff)
CREATE POLICY "Allow service role access" ON pv_quotes
    FOR ALL USING (true);
```

### Schritt 4: Umgebungsvariablen prüfen
Stellen Sie sicher, dass in Vercel die folgenden Umgebungsvariablen gesetzt sind:

- `NEXT_PUBLIC_SUPABASE_URL`: Ihre Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY`: Ihr Supabase Service Role Key (nicht der anon key!)

### Schritt 5: Test
Nach der Ausführung sollten die PV-Angebots-Anfragen korrekt gespeichert werden.

## Verifikation
1. Gehen Sie zu https://a4plus.eu/pv-rechner
2. Führen Sie eine Berechnung durch
3. Klicken Sie auf "Kostenloses Angebot anfordern"
4. Füllen Sie das Formular aus und senden Sie es ab
5. Prüfen Sie in Supabase, ob der Eintrag erstellt wurde
6. Prüfen Sie das Admin-Interface unter https://a4plus.eu/admin/pv-quotes

## Alternative Lösung (falls das Problem weiterhin besteht)
Falls das Problem weiterhin besteht, können Sie RLS temporär deaktivieren:

```sql
ALTER TABLE pv_quotes DISABLE ROW LEVEL SECURITY;
```

**Warnung**: Dies sollte nur temporär gemacht werden, da es die Sicherheit reduziert.
