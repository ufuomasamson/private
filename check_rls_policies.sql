-- Check and fix RLS policies for payment_gateways table

-- First, let's see what policies exist
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

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'payment_gateways';

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins can manage payment gateways" ON payment_gateways;
DROP POLICY IF EXISTS "Allow all for testing" ON payment_gateways;

-- Create a simple policy for testing (temporarily allow all operations)
CREATE POLICY "Allow all for testing" 
ON payment_gateways 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Test insert to verify the policy works
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('test_policy', 'test_type', 'test_key_policy')
ON CONFLICT (name, type) DO NOTHING;

-- Verify the insert worked
SELECT * FROM payment_gateways WHERE name = 'test_policy';

-- Clean up test data
DELETE FROM payment_gateways WHERE name = 'test_policy';

-- Now create the proper admin policy
DROP POLICY IF EXISTS "Allow all for testing" ON payment_gateways;

CREATE POLICY "Admins can manage payment gateways" 
ON payment_gateways 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Test the admin policy
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('test_admin_policy', 'test_type', 'test_key_admin')
ON CONFLICT (name, type) DO NOTHING;

-- Verify the insert worked
SELECT * FROM payment_gateways WHERE name = 'test_admin_policy';

-- Clean up test data
DELETE FROM payment_gateways WHERE name = 'test_admin_policy'; 