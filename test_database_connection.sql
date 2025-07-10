-- Test database connection and table access
-- Run this in your Supabase SQL editor to verify everything is working

-- 1. Test basic connection
SELECT 'Database connection successful' as status;

-- 2. Test table existence
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_gateways') 
        THEN 'payment_gateways table exists'
        ELSE 'payment_gateways table does not exist'
    END as table_status;

-- 3. Test table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_gateways' 
ORDER BY ordinal_position;

-- 4. Test RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS is ENABLED'
        ELSE 'RLS is DISABLED'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'payment_gateways';

-- 5. Test insert operation
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('connection_test', 'test', 'test_key_123')
ON CONFLICT (name, type) DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    updated_at = NOW();

-- 6. Test select operation
SELECT * FROM payment_gateways WHERE name = 'connection_test';

-- 7. Test update operation
UPDATE payment_gateways 
SET api_key = 'updated_test_key_456', updated_at = NOW()
WHERE name = 'connection_test';

-- 8. Verify update
SELECT * FROM payment_gateways WHERE name = 'connection_test';

-- 9. Clean up test data
DELETE FROM payment_gateways WHERE name = 'connection_test';

-- 10. Verify cleanup
SELECT COUNT(*) as remaining_test_records 
FROM payment_gateways WHERE name = 'connection_test';

-- 11. Show current policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'payment_gateways';

-- 12. Test permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'payment_gateways'; 