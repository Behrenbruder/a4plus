-- Extended CRM Schema for comprehensive lead and project tracking
-- This extends the existing schema with all required CRM features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types for better data consistency
CREATE TYPE lead_status AS ENUM ('neu', 'qualifiziert', 'angebot_erstellt', 'in_verhandlung', 'gewonnen', 'verloren');
CREATE TYPE product_interest AS ENUM ('pv', 'speicher', 'waermepumpe', 'fenster', 'tueren', 'daemmung', 'rollaeden');
CREATE TYPE user_role AS ENUM ('admin', 'kunde', 'monteur', 'vertrieb');
CREATE TYPE contact_type AS ENUM ('email', 'telefon', 'chat', 'website_formular', 'termin');
CREATE TYPE document_type AS ENUM ('angebot', 'vertrag', 'rechnung', 'foto', 'technische_zeichnung', 'foerderantrag');
CREATE TYPE notification_type AS ENUM ('neuer_lead', 'status_change', 'follow_up', 'termin_erinnerung', 'dokument_upload');
CREATE TYPE automation_trigger AS ENUM ('lead_created', 'status_changed', 'no_response', 'date_reached', 'document_uploaded');

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'kunde',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT
);

-- Extended customers table with lead pipeline and product interests
DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Deutschland',
    notes TEXT,
    lead_status lead_status DEFAULT 'neu',
    lead_source VARCHAR(100), -- Website, Empfehlung, Werbung, etc.
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    estimated_value DECIMAL(12,2),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    product_interests product_interest[] DEFAULT '{}',
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1 = highest, 5 = lowest
    tags TEXT[] DEFAULT '{}',
    gdpr_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false
);

-- Contact history table for all interactions
CREATE TABLE contact_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contact_type contact_type NOT NULL,
    subject VARCHAR(500),
    content TEXT,
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    duration_minutes INTEGER, -- for phone calls
    outcome TEXT,
    next_action TEXT,
    next_action_date TIMESTAMP WITH TIME ZONE,
    attachments TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Documents table for file management
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    document_type document_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}'
);

-- Projects table with enhanced tracking
DROP TABLE IF EXISTS projects CASCADE;
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    assigned_installer UUID REFERENCES users(id) ON DELETE SET NULL,
    project_manager UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planung' CHECK (status IN ('planung', 'angebot_erstellt', 'beauftragt', 'in_arbeit', 'abgeschlossen', 'storniert')),
    product_type product_interest NOT NULL,
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    margin_percent DECIMAL(5,2),
    address TEXT,
    coordinates POINT,
    technical_specs JSONB DEFAULT '{}'::jsonb,
    materials_list JSONB DEFAULT '{}'::jsonb,
    labor_hours DECIMAL(8,2),
    notes TEXT
);

-- Quotes/Offers table
CREATE TABLE quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'entwurf' CHECK (status IN ('entwurf', 'versendet', 'angenommen', 'abgelehnt', 'abgelaufen')),
    valid_until DATE,
    total_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    line_items JSONB DEFAULT '[]'::jsonb,
    terms_conditions TEXT,
    notes TEXT
);

-- Subsidies/Förderungen table
CREATE TABLE subsidies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    provider VARCHAR(100), -- KfW, BAFA, Land, Kommune
    product_types product_interest[] DEFAULT '{}',
    amount_type VARCHAR(50) CHECK (amount_type IN ('fixed', 'percentage', 'per_unit')),
    amount DECIMAL(12,2),
    max_amount DECIMAL(12,2),
    valid_from DATE,
    valid_until DATE,
    conditions TEXT,
    application_url TEXT,
    is_active BOOLEAN DEFAULT true,
    postal_codes TEXT[] DEFAULT '{}', -- Geographic restrictions
    income_limits JSONB DEFAULT '{}'::jsonb
);

-- Customer subsidies tracking
CREATE TABLE customer_subsidies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    subsidy_id UUID REFERENCES subsidies(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'geplant' CHECK (status IN ('geplant', 'beantragt', 'bewilligt', 'abgelehnt', 'ausgezahlt')),
    applied_date DATE,
    approved_date DATE,
    amount_applied DECIMAL(12,2),
    amount_approved DECIMAL(12,2),
    reference_number VARCHAR(100),
    notes TEXT
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Automation rules table
CREATE TABLE automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    trigger_type automation_trigger NOT NULL,
    trigger_conditions JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb, -- Array of actions to perform
    delay_hours INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Marketing campaigns table
CREATE TABLE marketing_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) CHECK (campaign_type IN ('email', 'sms', 'newsletter', 'social_media')),
    status VARCHAR(50) DEFAULT 'entwurf' CHECK (status IN ('entwurf', 'geplant', 'aktiv', 'pausiert', 'beendet')),
    target_audience JSONB DEFAULT '{}'::jsonb, -- Criteria for targeting
    content TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    sent_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    metrics JSONB DEFAULT '{}'::jsonb -- Open rates, click rates, etc.
);

-- Campaign recipients tracking
CREATE TABLE campaign_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'))
);

-- KPIs and metrics table
CREATE TABLE kpi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL,
    period_type VARCHAR(20) CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(metric_name, metric_date, period_type)
);

-- Create indexes for performance
CREATE INDEX idx_customers_lead_status ON customers(lead_status);
CREATE INDEX idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX idx_customers_next_follow_up ON customers(next_follow_up_date);
CREATE INDEX idx_customers_product_interests ON customers USING GIN(product_interests);
CREATE INDEX idx_customers_tags ON customers USING GIN(tags);
CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_contact_history_customer_id ON contact_history(customer_id);
CREATE INDEX idx_contact_history_created_at ON contact_history(created_at);
CREATE INDEX idx_contact_history_contact_type ON contact_history(contact_type);

CREATE INDEX idx_documents_customer_id ON documents(customer_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_created_at ON documents(created_at);

CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_product_type ON projects(product_type);
CREATE INDEX idx_projects_assigned_installer ON projects(assigned_installer);

CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);

CREATE INDEX idx_subsidies_product_types ON subsidies USING GIN(product_types);
CREATE INDEX idx_subsidies_valid_dates ON subsidies(valid_from, valid_until);
CREATE INDEX idx_subsidies_postal_codes ON subsidies USING GIN(postal_codes);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_kpi_metrics_name_date ON kpi_metrics(metric_name, metric_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subsidies_updated_at BEFORE UPDATE ON subsidies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_subsidies_updated_at BEFORE UPDATE ON customer_subsidies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subsidies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see their own data and admins can see all
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Customers policies
CREATE POLICY "Authenticated users can view customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and assigned users can manage customers" ON customers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'vertrieb'))
        OR assigned_to = auth.uid()
    );

-- Similar policies for other tables...
CREATE POLICY "Authenticated users can view contact history" ON contact_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage contact history" ON contact_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO users (email, first_name, last_name, role, phone) VALUES
    ('admin@arteplus.de', 'Admin', 'User', 'admin', '+49 123 456789'),
    ('vertrieb@arteplus.de', 'Vertrieb', 'Manager', 'vertrieb', '+49 987 654321'),
    ('monteur@arteplus.de', 'Max', 'Monteur', 'monteur', '+49 555 123456')
ON CONFLICT (email) DO NOTHING;

-- Insert sample subsidies
INSERT INTO subsidies (name, description, provider, product_types, amount_type, amount, valid_from, valid_until) VALUES
    ('KfW 270 - Erneuerbare Energien Standard', 'Förderkredit für PV-Anlagen und Speicher', 'KfW', ARRAY['pv', 'speicher'], 'percentage', 100.00, '2024-01-01', '2024-12-31'),
    ('BAFA Wärmepumpen-Förderung', 'Zuschuss für Wärmepumpen', 'BAFA', ARRAY['waermepumpe'], 'percentage', 25.00, '2024-01-01', '2024-12-31'),
    ('KfW 261 - Wohngebäude Kredit', 'Förderkredit für energetische Sanierung', 'KfW', ARRAY['fenster', 'tueren', 'daemmung'], 'percentage', 100.00, '2024-01-01', '2024-12-31')
ON CONFLICT DO NOTHING;

-- Insert sample automation rules
INSERT INTO automation_rules (name, description, trigger_type, trigger_conditions, actions) VALUES
    ('Neuer Lead Benachrichtigung', 'Benachrichtigung bei neuem Lead', 'lead_created', '{}', '[{"type": "notification", "message": "Neuer Lead erstellt"}]'),
    ('Follow-up nach 3 Tagen', 'Automatisches Follow-up nach 3 Tagen ohne Antwort', 'no_response', '{"days": 3}', '[{"type": "email", "template": "follow_up_3_days"}]'),
    ('Status Change Notification', 'Benachrichtigung bei Status-Änderung', 'status_changed', '{}', '[{"type": "notification", "message": "Lead-Status geändert"}]')
ON CONFLICT DO NOTHING;
