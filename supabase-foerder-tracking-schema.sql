-- Schema für automatisierte Förderungen-Überwachung
-- Erstellt: 2025-01-27

-- Tabelle für Förderungen-Snapshots (historische Versionen)
CREATE TABLE IF NOT EXISTS foerder_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scan_date DATE NOT NULL,
  source_type TEXT NOT NULL, -- 'BUND', 'LAND', 'KOMMUNAL'
  source_name TEXT NOT NULL, -- z.B. 'KfW', 'BAFA', 'Berlin-IBB'
  raw_data JSONB NOT NULL,
  processed_data JSONB NOT NULL,
  scan_status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  error_message TEXT,
  UNIQUE(scan_date, source_type, source_name)
);

-- Tabelle für Förderungen-Änderungen (Diff-Reports)
CREATE TABLE IF NOT EXISTS foerder_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scan_date DATE NOT NULL,
  change_type TEXT NOT NULL, -- 'ADDED', 'MODIFIED', 'REMOVED', 'EXPIRED'
  foerder_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  change_summary TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT FALSE,
  applied BOOLEAN DEFAULT FALSE,
  reviewer_notes TEXT
);

-- Tabelle für aktuelle Live-Förderungen (normalisiert)
CREATE TABLE IF NOT EXISTS foerder_live (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL, -- 'BUND', 'LAND'
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ZUSCHUSS', 'KREDIT', 'STEUER', etc.
  categories TEXT[] NOT NULL,
  target TEXT NOT NULL, -- 'PRIVAT', 'GEWERBLICH', etc.
  summary TEXT NOT NULL,
  amount TEXT NOT NULL,
  criteria TEXT NOT NULL,
  validity TEXT NOT NULL,
  authority TEXT NOT NULL,
  url TEXT NOT NULL,
  regions JSONB, -- für Länder-Programme
  last_verified DATE DEFAULT CURRENT_DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- Tabelle für Scan-Konfiguration
CREATE TABLE IF NOT EXISTS foerder_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'BUND', 'LAND'
  url TEXT NOT NULL,
  parser_type TEXT NOT NULL, -- 'KFW', 'BAFA', 'GENERIC_HTML', etc.
  active BOOLEAN DEFAULT TRUE,
  last_scan DATE,
  scan_interval_days INTEGER DEFAULT 30,
  config JSONB -- Parser-spezifische Konfiguration
);

-- Tabelle für Review-Sessions
CREATE TABLE IF NOT EXISTS foerder_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scan_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'applied'
  total_changes INTEGER DEFAULT 0,
  total_conflicts INTEGER DEFAULT 0,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE,
  reviewer_email TEXT,
  notes TEXT,
  manual_instructions TEXT -- Textfeld für manuelle Anweisungen bei Konflikten
);

-- Tabelle für Konflikt-Erkennung zwischen Quellen
CREATE TABLE IF NOT EXISTS foerder_conflicts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scan_date DATE NOT NULL,
  foerder_id TEXT NOT NULL,
  conflict_type TEXT NOT NULL, -- 'AMOUNT_MISMATCH', 'CRITERIA_DIFFERENT', 'VALIDITY_CONFLICT', 'DUPLICATE_PROGRAM'
  source_a TEXT NOT NULL,
  source_b TEXT NOT NULL,
  data_a JSONB NOT NULL,
  data_b JSONB NOT NULL,
  conflict_summary TEXT NOT NULL,
  severity TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  preferred_source TEXT -- Welche Quelle bevorzugt werden soll
);

-- Tabelle für Review-Verlauf und Dokumentation
CREATE TABLE IF NOT EXISTS foerder_review_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_id UUID REFERENCES foerder_reviews(id),
  action_type TEXT NOT NULL, -- 'APPROVED', 'REJECTED', 'MODIFIED', 'CONFLICT_RESOLVED'
  foerder_id TEXT,
  old_data JSONB,
  new_data JSONB,
  reviewer_email TEXT,
  notes TEXT,
  manual_instruction TEXT -- Spezifische Anweisung für diese Änderung
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_foerder_snapshots_scan_date ON foerder_snapshots(scan_date);
CREATE INDEX IF NOT EXISTS idx_foerder_changes_scan_date ON foerder_changes(scan_date);
CREATE INDEX IF NOT EXISTS idx_foerder_changes_reviewed ON foerder_changes(reviewed, approved);
CREATE INDEX IF NOT EXISTS idx_foerder_live_level ON foerder_live(level);
CREATE INDEX IF NOT EXISTS idx_foerder_live_categories ON foerder_live USING GIN(categories);

-- Initiale Datenquellen einfügen
INSERT INTO foerder_sources (name, type, url, parser_type, config) VALUES
('KfW', 'BUND', 'https://www.kfw.de/inlandsfoerderung/', 'KFW', '{"sections": ["privatpersonen", "unternehmen"]}'),
('BAFA', 'BUND', 'https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/effiziente_gebaeude_node.html', 'BAFA', '{"programs": ["BEG", "Heizungsfoerderung"]}'),
('Berlin-IBB', 'LAND', 'https://www.ibb.de/de/foerderprogramme/', 'GENERIC_HTML', '{"region": "Berlin", "selectors": {".program-item": "program"}}'),
('NRW-Progres', 'LAND', 'https://www.bra.nrw.de/energie-bergbau/foerderprogramme-fuer-klimaschutz-und-energiewende', 'GENERIC_HTML', '{"region": "Nordrhein-Westfalen"}'),
('Baden-Württemberg-LBank', 'LAND', 'https://www.l-bank.de/produkte/', 'GENERIC_HTML', '{"region": "Baden-Württemberg"}'),
('Förderdatenbank', 'BUND', 'https://www.foerderdatenbank.de/', 'GENERIC_HTML', '{"selectors": {".foerderung-item": "program", ".program-title": "title"}}'),
('Renewa', 'BUND', 'https://www.renewa.de/foerderdatenbank/', 'GENERIC_HTML', '{"selectors": {".funding-item": "program", ".title": "title"}}'),
('Verbraucherzentrale-RLP', 'LAND', 'https://www.verbraucherzentrale-rlp.de/energie/foerderung', 'GENERIC_HTML', '{"region": "Rheinland-Pfalz", "selectors": {".content-item": "program"}}'),
('Verbraucherzentrale-Speicher', 'BUND', 'https://www.verbraucherzentrale.de/wissen/energie/erneuerbare-energien/foerderung-fuer-batteriespeicher', 'GENERIC_HTML', '{"focus": "Speicher", "selectors": {".article-content": "program"}}'),
('Co2online', 'BUND', 'https://www.co2online.de/foerdermittel/', 'GENERIC_HTML', '{"selectors": {".funding-program": "program", ".program-name": "title"}}'),
('SMA', 'BUND', 'https://www.sma.de/foerderung', 'GENERIC_HTML', '{"focus": "PV", "selectors": {".funding-info": "program"}}'),
('Solarwatt', 'BUND', 'https://www.solarwatt.de/foerderung', 'GENERIC_HTML', '{"focus": "PV+Speicher", "selectors": {".promotion-item": "program"}}')
ON CONFLICT (name) DO NOTHING;

-- Aktuelle Förderungen aus JSON in Live-Tabelle importieren
-- (Dies wird später durch die API gemacht, hier nur als Beispiel)
