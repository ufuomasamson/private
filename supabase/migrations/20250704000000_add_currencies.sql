-- Create the currencies table
CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL
);

-- Insert the default currencies
INSERT INTO currencies (code, name) VALUES
  ('EUR', 'Euro'),
  ('USD', 'United States Dollar'),
  ('GBP', 'British Pound Sterling');

-- Create the user_preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  currency_code VARCHAR(3) NOT NULL REFERENCES currencies(code) DEFAULT 'EUR'
);
