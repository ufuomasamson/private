-- Verify payment_gateways table exists and is working

-- Check if table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'payment_gateways';

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'payment_gateways'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'payment_gateways';

-- Test insert (this should work if everything is set up correctly)
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('test_connection', 'test_type', 'test_key_123')
ON CONFLICT (name, type) DO NOTHING;

-- Verify the insert worked
SELECT * FROM payment_gateways WHERE name = 'test_connection';

-- Clean up test data
DELETE FROM payment_gateways WHERE name = 'test_connection'; 