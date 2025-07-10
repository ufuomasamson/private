import { NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

export async function POST(request: Request) {
  try {
    const { keys } = await request.json();
    
    console.log('Saving API keys:', keys);
    
    if (!keys || !Array.isArray(keys)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid keys data'
      }, { status: 400 });
    }

    const results = [];
    
    for (const keyData of keys) {
      console.log('Saving key:', keyData.type);
      
      const { data, error } = await supabase
        .from('payment_gateways')
        .upsert(keyData, { onConflict: 'name,type' });
      
      if (error) {
        console.error('Error saving key:', keyData.type, error);
        results.push({
          type: keyData.type,
          success: false,
          error: error.message
        });
      } else {
        console.log('Successfully saved key:', keyData.type);
        results.push({
          type: keyData.type,
          success: true,
          data
        });
      }
    }

    const allSuccessful = results.every(result => result.success);
    
    return NextResponse.json({
      success: allSuccessful,
      results,
      message: allSuccessful ? 'All API keys saved successfully' : 'Some keys failed to save'
    });
    
  } catch (error: any) {
    console.error('API save error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 