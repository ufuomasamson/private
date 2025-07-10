-- Fix payment verification and add flight_amount column
-- Run this in your Supabase SQL editor

-- 1. Add flight_amount column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS flight_amount DECIMAL(10,2);

-- 2. Update existing bookings to set flight_amount based on the flight price
UPDATE bookings 
SET flight_amount = (
  SELECT price 
  FROM flights 
  WHERE flights.id = bookings.flight_id
)
WHERE flight_amount IS NULL AND flight_id IS NOT NULL;

-- 3. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_flight_amount ON bookings(flight_amount);

-- 4. Check current bookings status
SELECT 
  id,
  transaction_ref,
  payment_transaction_id,
  payment_status,
  paid,
  flight_amount,
  payment_date,
  created_at
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Update any bookings that have payment_status = 'paid' but paid = false
UPDATE bookings 
SET paid = true 
WHERE payment_status = 'paid' AND paid = false;

-- 6. Update any bookings that have paid = true but payment_status is null
UPDATE bookings 
SET payment_status = 'paid' 
WHERE paid = true AND (payment_status IS NULL OR payment_status = 'pending'); 