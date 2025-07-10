# Flutterwave Payment Integration

This document describes the Flutterwave payment integration implementation for the flight booking application.

## Features Implemented

### ✅ Security & Control
- **Server-side payment initiation** - All payment requests go through our backend API
- **Locked amount and currency** - Users cannot modify payment amounts
- **Unique transaction references** - Each payment has a unique `tx_ref` (format: `FLIGHT_{bookingId}_{userId}_{timestamp}`)
- **No public payment links** - All payments are initiated through our secure API

### ✅ User Experience
- **Custom success page** - Users are redirected to `/payment-success` after payment
- **Automatic verification** - Payment status is verified server-side
- **Professional branding** - Custom title, description, and logo
- **Customer details** - Name, email, and phone number included

### ✅ Database Integration
- **Payment status tracking** - `payment_status` column in bookings table
- **Transaction reference storage** - `transaction_ref` column for verification
- **Payment date recording** - `payment_date` column for audit trail
- **Price and currency storage** - `price` and `currency` columns

## API Endpoints

### 1. Payment Initiation
**POST** `/api/payment/initiate`

**Request Body:**
```json
{
  "bookingId": "string",
  "userId": "string", 
  "amount": 150.00,
  "currency": "EUR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_url": "https://checkout.flutterwave.com/v3/hosted/pay/...",
    "tx_ref": "FLIGHT_123_456_1234567890",
    "status": "success"
  }
}
```

### 2. Payment Verification
**POST** `/api/payment/verify`

**Request Body:**
```json
{
  "tx_ref": "FLIGHT_123_456_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "booking_id": "123",
    "transaction_ref": "FLIGHT_123_456_1234567890",
    "amount": 150.00,
    "currency": "EUR",
    "status": "successful"
  }
}
```

## Database Schema

### Bookings Table Additions
```sql
-- Payment status (pending, paid, failed)
payment_status VARCHAR(50) DEFAULT 'pending'

-- Unique transaction reference
transaction_ref VARCHAR(255)

-- Payment completion date
payment_date TIMESTAMP WITH TIME ZONE

-- Payment amount
price DECIMAL(10,2)

-- Payment currency
currency VARCHAR(10) DEFAULT 'EUR'
```

## Setup Instructions

### 1. Database Migration
Run the SQL migration to add payment columns:
```sql
-- Run add_payment_columns.sql in Supabase SQL editor
```

### 2. Environment Variables
Add to your `.env.local`:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Flutterwave API Keys
Configure your Flutterwave API keys in the admin panel:
- Go to `/admin/integrations`
- Enter your Flutterwave test/live API keys
- Save the configuration

### 4. Usage in Components

```tsx
import PaymentButton from '@/components/PaymentButton';

// In your component
<PaymentButton
  bookingId="123"
  userId="456"
  amount={150.00}
  currency="EUR"
  flightNumber="FL123"
/>
```

## Payment Flow

1. **User clicks "Pay Now"** → PaymentButton component
2. **Frontend calls** `/api/payment/initiate` with booking details
3. **Backend validates** booking and user data
4. **Backend calls** Flutterwave API to create payment
5. **Backend updates** booking with `transaction_ref` and `payment_status: 'pending'`
6. **User redirected** to Flutterwave payment page
7. **User completes** payment on Flutterwave
8. **Flutterwave redirects** to `/payment-success?tx_ref=...`
9. **Success page calls** `/api/payment/verify` with `tx_ref`
10. **Backend verifies** payment with Flutterwave API
11. **Backend updates** booking with `payment_status: 'paid'`
12. **User sees** success confirmation

## Security Features

- ✅ **Server-side validation** of all payment data
- ✅ **Unique transaction references** prevent duplicate payments
- ✅ **Payment verification** ensures only successful payments are recorded
- ✅ **No client-side API keys** - all Flutterwave calls are server-side
- ✅ **Database constraints** prevent invalid payment states

## Error Handling

- **Invalid booking/user** → 404 error
- **Missing API keys** → 500 error with clear message
- **Flutterwave API errors** → Detailed error logging
- **Payment verification failures** → Clear user feedback
- **Network timeouts** → Retry mechanism with user notification

## Testing

### Test Cards (Flutterwave Test Mode)
- **Visa**: 4000000000000002
- **Mastercard**: 5204730000002514
- **Verve**: 5061000000000000000

### Test Scenarios
1. **Successful payment** → Verify booking status updates
2. **Failed payment** → Verify booking remains pending
3. **Network timeout** → Verify error handling
4. **Invalid transaction** → Verify verification fails gracefully

## Production Considerations

1. **Switch to live API keys** in admin panel
2. **Update redirect URLs** to production domain
3. **Enable webhook notifications** for additional security
4. **Monitor payment logs** for failed transactions
5. **Implement retry logic** for failed verifications 