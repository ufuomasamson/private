import { NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

export async function GET() {
  try {
    console.log('Debugging bookings...');
    
    // Get all bookings with transaction references
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, transaction_ref, payment_transaction_id, payment_status, paid, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Recent bookings retrieved',
      bookings: bookings || [],
      total: bookings?.length || 0
    });

  } catch (error: any) {
    console.error('Debug bookings error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 