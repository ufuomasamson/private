-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Add missing columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Check if payment_gateways table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_gateways') THEN
        CREATE TABLE payment_gateways (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL,
          api_key TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(name, type)
        );
    ELSE
        -- If table exists, add missing columns
        ALTER TABLE payment_gateways ADD COLUMN IF NOT EXISTS type VARCHAR(50);
        ALTER TABLE payment_gateways ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add RLS policies for payment_gateways (admin only)
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage payment gateways" ON payment_gateways;

CREATE POLICY "Admins can manage payment gateways" ON payment_gateways
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Check if currencies table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'currencies') THEN
        CREATE TABLE currencies (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          code VARCHAR(3) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          exchange_rate DECIMAL(10,6) DEFAULT 1.0,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- If table exists, add missing columns
        ALTER TABLE currencies ADD COLUMN IF NOT EXISTS symbol VARCHAR(10);
        ALTER TABLE currencies ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,6) DEFAULT 1.0;
        ALTER TABLE currencies ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
        ALTER TABLE currencies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Insert default currencies (only if they don't exist)
INSERT INTO currencies (code, name, symbol, exchange_rate, is_default) VALUES
  ('EUR', 'Euro', '€', 1.0, TRUE),
  ('USD', 'US Dollar', '$', 1.08, FALSE),
  ('GBP', 'British Pound', '£', 0.86, FALSE)
ON CONFLICT (code) DO NOTHING;

-- Add RLS policies for currencies
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view currencies" ON currencies;
DROP POLICY IF EXISTS "Admins can manage currencies" ON currencies;

CREATE POLICY "Anyone can view currencies" ON currencies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage currencies" ON currencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tx_ref ON bookings(tx_ref);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_name_type ON payment_gateways(name, type);
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code); 