-- Add payment-related columns to bookings table
-- Run this in your Supabase SQL editor

-- Add payment status column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add transaction reference column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(255);

-- Add payment date column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add price column if it doesn't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add currency column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'EUR';

-- Create index on transaction_ref for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_transaction_ref ON bookings(transaction_ref);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position; 