# 🚨 SCHNELLE LÖSUNG - Popup funktioniert, aber Speichern schlägt fehl

## Das Problem
Das Popup öffnet sich und zeigt die PV-Daten korrekt an, aber beim Klick auf "Angebot anfordern" gibt es einen Fehler beim Speichern.

## ✅ Sofortige Lösung (2 Minuten):

### 1. Supabase Dashboard öffnen
- Gehen Sie zu: https://supabase.com/dashboard
- Wählen Sie Ihr Projekt: `zyxmgyhpsdjvsnkaajsd`

### 2. SQL Editor öffnen
- Klicken Sie links auf "SQL Editor"
- Klicken Sie auf "New query"

### 3. Dieses SQL ausführen:
```sql
-- Erstelle die pv_quotes Tabelle
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

-- Row Level Security
ALTER TABLE pv_quotes ENABLE ROW LEVEL SECURITY;

-- Policy für alle Operationen (Service Role)
CREATE POLICY "Allow all operations for service role" ON pv_quotes
    FOR ALL USING (true);
```

### 4. SQL ausführen
- Klicken Sie auf "Run" (oder Strg+Enter)
- Warten Sie auf "Success" Meldung

### 5. Testen
- Gehen Sie zurück zu Ihrer Anwendung
- Füllen Sie das Popup-Formular aus
- Klicken Sie "Angebot anfordern"
- ✅ Sollte jetzt funktionieren!

## 🎉 Nach der Lösung funktioniert:

1. **PV-Rechner Popup** - Vollständig funktional
2. **Daten-Speicherung** - Alle PV-Daten werden gespeichert
3. **Admin-Interface** - Unter `/admin/pv-quotes` verfügbar
4. **E-Mail-Benachrichtigungen** - In der Konsole sichtbar

## 📊 Was gespeichert wird:
- Kundendaten (Name, E-Mail, Telefon, Adresse)
- PV-System (6.02 kWp, 6.058 kWh Jahresertrag)
- Speicher (25 kWh)
- Wirtschaftlichkeit (85% Autarkie, 1363€ Einsparung, 21.8 Jahre Amortisation)

Das System ist dann vollständig einsatzbereit! 🚀
