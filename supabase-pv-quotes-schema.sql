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

-- Policy für authentifizierte Benutzer
CREATE POLICY "Allow all operations for authenticated users" ON pv_quotes
    FOR ALL USING (auth.role() = 'authenticated');
