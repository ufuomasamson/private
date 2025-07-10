# Payment System Troubleshooting Guide

## Issue: POST /api/payment/verify 500 Error

### Root Cause
The 500 error is likely caused by missing or incorrectly configured Flutterwave API keys in the database.

### Quick Fix Steps

1. **Check API Key Configuration**
   ```bash
   # Visit this URL in your browser to check current configuration
   http://localhost:3000/api/payment/test-keys
   ```

2. **Configure API Keys via Admin Panel**
   - Go to `/admin/integrations`
   - Add your Flutterwave API keys:
     - `test_secret` (required for testing)
     - `test_public` (optional)
     - `live_secret` (for production)
     - `live_public` (for production)

3. **Get Flutterwave Test Keys**
   - Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com)
   - Go to Settings > API Keys
   - Copy your test secret key (starts with `FLWSECK_TEST-`)

4. **Manual Database Setup** (if admin panel doesn't work)
   ```sql
   -- Run this in your Supabase SQL editor
   INSERT INTO payment_gateways (name, type, api_key) VALUES
   ('flutterwave', 'test_secret', 'FLWSECK_TEST-your-actual-key-here')
   ON CONFLICT (name, type) DO UPDATE SET api_key = EXCLUDED.api_key;
   ```

### Verification Steps

1. **Test Database Connection**
   ```bash
   # Visit this URL
   http://localhost:3000/api/test-db
   ```

2. **Test Payment Configuration**
   ```bash
   # Visit this URL
   http://localhost:3000/api/payment/test-keys
   ```

3. **Check Server Logs**
   - Look for detailed error messages in your terminal/console
   - The verify endpoint now includes detailed logging

### Common Error Messages

| Error Message | Solution |
|---------------|----------|
| "Payment gateway not configured" | Add API keys via admin panel |
| "Payment gateway secret key not configured" | Add test_secret or live_secret key |
| "Booking not found" | Check if booking exists in database |
| "Payment was not successful" | Payment failed on Flutterwave side |

### Development Setup

1. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. **Database Migration**
   ```bash
   # Run the database migration in Supabase SQL editor
   # Use database_migration_final.sql
   ```

3. **Test Payment Flow**
   - Create a test booking
   - Initiate payment
   - Use Flutterwave test cards:
     - Visa: 4000000000000002
     - Mastercard: 5204730000002514

### Production Checklist

- [ ] Switch to live API keys
- [ ] Update redirect URLs to production domain
- [ ] Test payment flow with real cards
- [ ] Set up webhook notifications
- [ ] Monitor payment logs

### Support

If you continue to have issues:

1. Check the server logs for detailed error messages
2. Verify your Flutterwave account is active
3. Ensure your API keys are correct
4. Test with the provided test endpoints

### Recent Fixes Applied

- ✅ Enhanced error handling in verify endpoint
- ✅ Added fallback to live keys if test keys not available
- ✅ Improved error messages for users
- ✅ Added detailed logging for debugging
- ✅ Created test endpoints for configuration verification 