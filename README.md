# 🛫 Flight Booking Application

A modern, full-stack flight booking application built with Next.js, Supabase, and Flutterwave payment integration.

## ✨ Features

### 🎯 Core Functionality
- **Flight Search & Booking** - Search flights by route, date, passengers, and class
- **Real-time Flight Tracking** - Track flights using unique tracking numbers
- **PDF Ticket Generation** - Automatic ticket generation after successful payment
- **Multi-currency Support** - EUR, USD, GBP with real-time conversion

### 💳 Payment Integration
- **Flutterwave Payment Gateway** - Secure payment processing
- **Server-side Payment Verification** - Enhanced security with transaction validation
- **Payment Status Tracking** - Real-time payment status updates
- **Automatic Booking Updates** - Database updates on successful payments

### 👨‍💼 Admin Dashboard
- **Flight Management** - CRUD operations for flights, airlines, and locations
- **Payment Configuration** - API key management for payment gateways
- **Revenue Analytics** - Real-time revenue tracking and statistics
- **User Management** - Role-based access control

### 🔐 Security Features
- **Row Level Security (RLS)** - Database-level security
- **Role-based Access Control** - Admin and user roles
- **Server-side Payment Processing** - No client-side API keys
- **Input Validation** - Comprehensive data validation

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payment**: Flutterwave API
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom design system

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Flutterwave account (for payments)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/flight-booking-app.git
cd flight-booking-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Database Setup
Run the database migrations in your Supabase SQL editor:
```sql
-- Run the database_migration_final.sql script
-- This sets up all required tables and RLS policies
```

### 5. Payment Configuration
1. Go to `/admin/integrations` in your app
2. Add your Flutterwave API keys:
   - `test_secret` (for development)
   - `live_secret` (for production)
3. Save the configuration

### 6. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with roles
- `flights` - Flight information with tracking numbers
- `bookings` - User bookings with payment status
- `airlines` - Airline information
- `locations` - Airport/city data
- `currencies` - Multi-currency support
- `payment_gateways` - Payment configuration
- `user_preferences` - User settings

## 💳 Payment Flow

1. **User selects flight** → Booking created
2. **User clicks "Pay Now"** → Payment initiated via `/api/payment/initiate-v2`
3. **User redirected** → Flutterwave payment page
4. **Payment completed** → Redirected to `/payment-success`
5. **Payment verified** → Booking updated via `/api/payment/verify`
6. **PDF ticket generated** → Stored in Supabase Storage

## 🔧 API Endpoints

### Payment Endpoints
- `POST /api/payment/initiate-v2` - Create payment
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/test-keys` - Check payment configuration
- `GET /api/payment/debug-bookings` - Debug bookings

### Admin Endpoints
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/flights` - Flight management
- `GET /admin/integrations` - Payment configuration

## 🧪 Testing

### Payment Testing
Use Flutterwave test cards:
- **Visa**: 4000000000000002
- **Mastercard**: 5204730000002514
- **Verve**: 5061000000000000000

### Debug Endpoints
- `http://localhost:3000/api/payment/test-keys` - Check payment setup
- `http://localhost:3000/api/payment/debug-bookings` - View recent bookings
- `http://localhost:3000/test_amount_conversion.html` - Test amount conversion

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 📁 Project Structure

```
flights/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin pages
│   │   ├── components/        # Shared components
│   │   └── ...
│   ├── lib/                   # Utility libraries
│   └── services/              # External services
├── supabase/                  # Database migrations
├── public/                    # Static assets
└── ...
```

## 🔒 Security Considerations

- **API Keys**: Stored securely in database, not in client code
- **RLS Policies**: Database-level security for all tables
- **Payment Verification**: Server-side validation of all payments
- **Input Validation**: Comprehensive validation on all inputs

## 🐛 Troubleshooting

### Common Issues

1. **Payment Verification Fails**
   - Check API keys in `/admin/integrations`
   - Verify Flutterwave account is active
   - Check server logs for detailed errors

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Run database migrations

3. **Amount Conversion Issues**
   - Use debug endpoint: `/api/payment/debug-amount`
   - Check currency conversion logic
   - Verify Flutterwave amount format

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Flutterwave](https://flutterwave.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

For support, please:
1. Check the troubleshooting section
2. Review server logs for error details
3. Create an issue with detailed information

---

**Built with ❤️ using Next.js and Supabase**
