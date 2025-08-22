-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'lead' CHECK (status IN ('lead', 'customer', 'inactive'))
);

-- Create installers table
CREATE TABLE IF NOT EXISTS installers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    specialties TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    hourly_rate DECIMAL(10,2),
    notes TEXT
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    body TEXT,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'failed')),
    sender_email VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL
);

-- Create projects table (optional - for tracking customer projects)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    installer_id UUID REFERENCES installers(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_installers_email ON installers(email);
CREATE INDEX IF NOT EXISTS idx_installers_status ON installers(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_customer_id ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_installer_id ON projects(installer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installers_updated_at BEFORE UPDATE ON installers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies
-- Only users with 'admin' role in their JWT can access data
CREATE POLICY "Admin only access" ON customers 
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Admin only access" ON installers 
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Admin only access" ON email_logs 
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Admin only access" ON projects 
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.role() = 'service_role'
    );

-- Insert some sample data (optional)
INSERT INTO customers (first_name, last_name, email, phone, city, status) VALUES
    ('Max', 'Mustermann', 'max.mustermann@example.com', '+49 123 456789', 'Berlin', 'customer'),
    ('Anna', 'Schmidt', 'anna.schmidt@example.com', '+49 987 654321', 'München', 'lead'),
    ('Peter', 'Weber', 'peter.weber@example.com', '+49 555 123456', 'Hamburg', 'customer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO installers (first_name, last_name, email, phone, specialties, hourly_rate) VALUES
    ('Thomas', 'Müller', 'thomas.mueller@example.com', '+49 111 222333', ARRAY['PV-Anlagen', 'Wärmepumpen'], 45.00),
    ('Sarah', 'Fischer', 'sarah.fischer@example.com', '+49 444 555666', ARRAY['Fenster', 'Türen'], 40.00),
    ('Michael', 'Wagner', 'michael.wagner@example.com', '+49 777 888999', ARRAY['Dämmung', 'Rolläden'], 42.50)
ON CONFLICT (email) DO NOTHING;
