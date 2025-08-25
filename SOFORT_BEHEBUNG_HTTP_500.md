# Sofort-Behebung: HTTP 500 Fehler

## Problem
Der HTTP 500 Fehler tritt auf, weil die neue `pv_quotes` Tabelle noch nicht in der Supabase-Datenbank existiert.

## Sofortige Lösung

### 1. Supabase SQL Editor öffnen
1. Gehen Sie zu https://supabase.com/dashboard
2. Wählen Sie Ihr Projekt aus
3. Klicken Sie auf "SQL Editor" in der linken Sidebar

### 2. Schema ausführen
Kopieren Sie den kompletten Inhalt aus `supabase-pv-quotes-schema.sql` und führen Sie ihn aus:

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

-- Updated_at Trigger (falls die Funktion bereits existiert)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_pv_quotes_updated_at BEFORE UPDATE ON pv_quotes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Row Level Security
ALTER TABLE pv_quotes ENABLE ROW LEVEL SECURITY;

-- Policy für alle Operationen (temporär für Admin-Zugriff)
CREATE POLICY "Allow all operations for service role" ON pv_quotes
    FOR ALL USING (true);
```

### 3. Seite aktualisieren
Nach dem Ausführen des SQL-Schemas:
1. Gehen Sie zurück zu Ihrer Anwendung
2. Drücken Sie F5 oder aktualisieren Sie die Seite
3. Der Fehler sollte behoben sein

### 4. Testen
1. Gehen Sie zu `/admin` - sollte jetzt funktionieren
2. Testen Sie den PV-Rechner unter `/pv-rechner`
3. Probieren Sie das Angebots-Popup aus

## Alternative: Entwicklungsserver neu starten

Falls der Fehler weiterhin besteht:

```bash
# Terminal öffnen und ausführen:
npm run dev
```

## Umgebungsvariablen prüfen

Falls immer noch Probleme bestehen, prüfen Sie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Logs überprüfen

Schauen Sie in die Browser-Konsole (F12) und das Terminal für detaillierte Fehlermeldungen.

Nach diesen Schritten sollte das System vollständig funktionieren!
