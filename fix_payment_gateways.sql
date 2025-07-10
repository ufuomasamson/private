-- Fix payment_gateways table structure

-- First, let's check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'payment_gateways'
);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage payment gateways" ON payment_gateways;

-- Drop the table if it exists and recreate it
DROP TABLE IF EXISTS payment_gateways CASCADE;

-- Create payment_gateways table with proper structure
CREATE TABLE payment_gateways (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, type)
);

-- Enable RLS
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_gateways_name_type ON payment_gateways(name, type);

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'payment_gateways' 
ORDER BY ordinal_position;

-- Test insert to verify everything works
INSERT INTO payment_gateways (name, type, api_key) 
VALUES ('test', 'test_type', 'test_key')
ON CONFLICT (name, type) DO NOTHING;

-- Clean up test data
DELETE FROM payment_gateways WHERE name = 'test'; 