-- Simple database fix script for payment_gateways table
-- Run this in your Supabase SQL editor

-- Drop existing table if it exists
DROP TABLE IF EXISTS payment_gateways CASCADE;

-- Create the table properly
CREATE TABLE payment_gateways (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    api_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, type)
);

-- Disable RLS
ALTER TABLE payment_gateways DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON payment_gateways;
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_gateways;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON payment_gateways;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON payment_gateways;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON payment_gateways;
DROP POLICY IF EXISTS "Allow all operations" ON payment_gateways;

-- Create a simple permissive policy
CREATE POLICY "Allow all operations" ON payment_gateways
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON payment_gateways TO authenticated;
GRANT ALL ON payment_gateways TO anon;
GRANT USAGE ON SEQUENCE payment_gateways_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE payment_gateways_id_seq TO anon;

-- Test the table
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('test_gateway', 'test_type', 'test_key')
ON CONFLICT (name, type) DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    updated_at = NOW();

-- Verify the insert worked
SELECT * FROM payment_gateways WHERE name = 'test_gateway';

-- Clean up test data
DELETE FROM payment_gateways WHERE name = 'test_gateway';

-- Show table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_gateways' 
ORDER BY ordinal_position;

-- Show RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'payment_gateways'; 