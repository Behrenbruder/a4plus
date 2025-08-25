-- Fix für PV-Quotes Tabelle - RLS Policy korrigieren

-- Entferne die alte Policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON pv_quotes;

-- Neue Policy für Service Role (API-Zugriff)
CREATE POLICY "Allow service role access" ON pv_quotes
    FOR ALL USING (true);

-- Alternative: Policy für öffentliche Inserts (sicherer)
-- CREATE POLICY "Allow public insert" ON pv_quotes
--     FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow service role select/update/delete" ON pv_quotes
--     FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Stelle sicher, dass die update_updated_at_column Funktion existiert
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
