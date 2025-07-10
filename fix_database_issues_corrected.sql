-- Corrected database fix script for payment_gateways table
-- Run this in your Supabase SQL editor

-- 1. First, let's check if the table exists and its structure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_gateways') THEN
        CREATE TABLE payment_gateways (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL,
            api_key TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(name, type)
        );
        RAISE NOTICE 'Created payment_gateways table';
    ELSE
        RAISE NOTICE 'payment_gateways table already exists';
    END IF;
END $$;

-- 2. Ensure all required columns exist
DO $$ 
BEGIN
    -- Add id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'id') THEN
        ALTER TABLE payment_gateways ADD COLUMN id SERIAL PRIMARY KEY;
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'name') THEN
        ALTER TABLE payment_gateways ADD COLUMN name VARCHAR(255) NOT NULL;
    END IF;
    
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'type') THEN
        ALTER TABLE payment_gateways ADD COLUMN type VARCHAR(255) NOT NULL;
    END IF;
    
    -- Add api_key column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'api_key') THEN
        ALTER TABLE payment_gateways ADD COLUMN api_key TEXT NOT NULL;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'created_at') THEN
        ALTER TABLE payment_gateways ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'updated_at') THEN
        ALTER TABLE payment_gateways ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'payment_gateways' 
        AND constraint_name = 'payment_gateways_name_type_key'
    ) THEN
        ALTER TABLE payment_gateways ADD CONSTRAINT payment_gateways_name_type_key UNIQUE(name, type);
    END IF;
END $$;

-- 4. Completely disable RLS for this table (temporary fix)
ALTER TABLE payment_gateways DISABLE ROW LEVEL SECURITY;

-- 5. Drop any existing RLS policies that might be causing issues
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON payment_gateways;
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_gateways;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON payment_gateways;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON payment_gateways;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON payment_gateways;

-- 6. Create a simple policy that allows all operations (for testing)
CREATE POLICY "Allow all operations" ON payment_gateways
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 7. Grant necessary permissions (only if sequence exists)
DO $$ 
BEGIN
    -- Grant table permissions
    GRANT ALL ON payment_gateways TO authenticated;
    GRANT ALL ON payment_gateways TO anon;
    
    -- Grant sequence permissions only if sequence exists
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'payment_gateways_id_seq') THEN
        GRANT USAGE ON SEQUENCE payment_gateways_id_seq TO authenticated;
        GRANT USAGE ON SEQUENCE payment_gateways_id_seq TO anon;
    ELSE
        RAISE NOTICE 'Sequence payment_gateways_id_seq does not exist, skipping sequence grants';
    END IF;
END $$;

-- 8. Test the table with a simple insert
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('test_gateway', 'test_type', 'test_key')
ON CONFLICT (name, type) DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    updated_at = NOW();

-- 9. Clean up test data
DELETE FROM payment_gateways WHERE name = 'test_gateway';

-- 10. Show table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_gateways' 
ORDER BY ordinal_position;

-- 11. Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'payment_gateways';

-- 12. Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'payment_gateways';

-- 13. Show sequence information (if it exists)
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences 
WHERE sequence_name = 'payment_gateways_id_seq'; 