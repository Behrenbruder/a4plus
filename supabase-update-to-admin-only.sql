-- Update existing database to Admin-only access
-- Run this if you already have tables created

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow all operations" ON customers;
DROP POLICY IF EXISTS "Allow all operations" ON installers;
DROP POLICY IF EXISTS "Allow all operations" ON email_logs;
DROP POLICY IF EXISTS "Allow all operations" ON projects;

-- Create new admin-only policies
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

-- Verify RLS is enabled (should already be enabled)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
