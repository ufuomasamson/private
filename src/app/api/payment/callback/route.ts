import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');
    const txRef = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    console.log('Payment callback received:', { transactionId, txRef, status });

    if (!transactionId || !txRef) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track?error=Invalid payment parameters`);
    }

    if (status !== 'successful') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track?error=Payment was not successful`);
    }

    // Find the booking using tx_ref
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        flight:flights(
          *,
          airline:airlines(*),
          departure:locations!flights_departure_location_id_fkey(city, country),
          arrival:locations!flights_arrival_location_id_fkey(city, country)
        )
      `)
      .eq('tx_ref', txRef)
      .single();

    if (bookingError || !booking) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track?error=Booking not found`);
    }

    // Update booking as paid
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        paid: true,
        payment_transaction_id: transactionId,
        payment_date: new Date().toISOString()
      })
      .eq('id', booking.id);

    if (updateError) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track?error=Failed to update booking`);
    }

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track?success=Payment successful&tx_ref=${booking.flight.tracking_number}`);

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track?error=Payment processing failed`);
  }
} 