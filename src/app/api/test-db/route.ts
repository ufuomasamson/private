import { NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Basic connection
    const startTime = Date.now();
    
    // Test 2: Simple select
    const { data: testData, error: testError } = await supabase
      .from('payment_gateways')
      .select('*')
      .limit(1);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('Database test completed in', duration, 'ms');
    console.log('Test result:', { testData, testError });
    
    if (testError) {
      return NextResponse.json({
        success: false,
        error: testError.message,
        code: testError.code,
        details: testError.details,
        duration
      }, { status: 500 });
    }
    
    // Test 3: Try a simple insert/update
    const testKey = {
      name: 'test_connection',
      type: 'test_type',
      api_key: 'test_key_' + Date.now()
    };
    
    console.log('Attempting insert with data:', testKey);
    
    const { data: insertData, error: insertError } = await supabase
      .from('payment_gateways')
      .upsert(testKey, { onConflict: 'name,type' });
    
    console.log('Insert result:', { insertData, insertError });
    
    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Insert test failed: ' + insertError.message,
        code: insertError.code,
        details: insertError.details,
        duration
      }, { status: 500 });
    }
    
    // Test 4: Verify the insert worked by selecting the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('name', 'test_connection');
    
    console.log('Verification result:', { verifyData, verifyError });
    
    // Test 5: Clean up test data
    const { error: deleteError } = await supabase
      .from('payment_gateways')
      .delete()
      .eq('name', 'test_connection');
    
    console.log('Cleanup result:', { deleteError });
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      duration,
      testData: testData?.length || 0,
      insertSuccess: !insertError && (insertData !== null || (verifyData && verifyData.length > 0)),
      cleanupSuccess: !deleteError,
      insertData: insertData,
      verifyData: verifyData
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      duration: Date.now() - Date.now()
    }, { status: 500 });
  }
} 