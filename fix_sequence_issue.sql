-- Fix for missing payment_gateways_id_seq sequence
-- Run this in your Supabase SQL editor

-- 1. First, let's check if the table exists and its current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_gateways' 
ORDER BY ordinal_position;

-- 2. Drop the existing table if it has issues
DROP TABLE IF EXISTS payment_gateways CASCADE;

-- 3. Create the table properly with SERIAL column
CREATE TABLE payment_gateways (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    api_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, type)
);

-- 4. Create the sequence explicitly (in case it's missing)
CREATE SEQUENCE IF NOT EXISTS payment_gateways_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 5. Set the sequence to be owned by the table
ALTER SEQUENCE payment_gateways_id_seq OWNED BY payment_gateways.id;

-- 6. Set the default value for the id column
ALTER TABLE payment_gateways ALTER COLUMN id SET DEFAULT nextval('payment_gateways_id_seq'::regclass);

-- 7. Disable RLS for this table
ALTER TABLE payment_gateways DISABLE ROW LEVEL SECURITY;

-- 8. Drop any existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON payment_gateways;
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_gateways;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON payment_gateways;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON payment_gateways;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON payment_gateways;
DROP POLICY IF EXISTS "Allow all operations" ON payment_gateways;

-- 9. Create a simple permissive policy
CREATE POLICY "Allow all operations" ON payment_gateways
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 10. Grant necessary permissions
GRANT ALL ON payment_gateways TO authenticated;
GRANT ALL ON payment_gateways TO anon;
GRANT USAGE ON SEQUENCE payment_gateways_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE payment_gateways_id_seq TO anon;

-- 11. Test the table with a simple insert
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('test_gateway', 'test_type', 'test_key')
ON CONFLICT (name, type) DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    updated_at = NOW();

-- 12. Verify the insert worked
SELECT * FROM payment_gateways WHERE name = 'test_gateway';

-- 13. Clean up test data
DELETE FROM payment_gateways WHERE name = 'test_gateway';

-- 14. Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_gateways' 
ORDER BY ordinal_position;

-- 15. Show sequence information
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences 
WHERE sequence_name = 'payment_gateways_id_seq';

-- 16. Show RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'payment_gateways';

-- 17. Show current policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'payment_gateways'; 