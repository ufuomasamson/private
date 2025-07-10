-- Add flight_amount column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS flight_amount DECIMAL(10,2);

-- Update existing bookings to set flight_amount based on the flight price
-- This is a one-time update for existing data
UPDATE bookings 
SET flight_amount = (
  SELECT price 
  FROM flights 
  WHERE flights.id = bookings.flight_id
)
WHERE flight_amount IS NULL AND flight_id IS NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_flight_amount ON bookings(flight_amount); 