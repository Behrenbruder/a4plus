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
