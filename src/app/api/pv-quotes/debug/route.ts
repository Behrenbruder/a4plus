import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // Debug-Informationen sammeln
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        supabaseUrlLength: supabaseUrl?.length || 0,
        serviceKeyLength: supabaseServiceKey?.length || 0,
        supabaseUrlStart: supabaseUrl?.substring(0, 20) + '...',
        serviceKeyStart: supabaseServiceKey?.substring(0, 20) + '...'
      }
    };

    // Teste Supabase-Verbindung
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        ...debugInfo,
        error: 'Missing environment variables',
        details: {
          supabaseUrl: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Teste Datenbankverbindung
    const { data: testData, error: testError } = await supabase
      .from('pv_quotes')
      .select('count(*)')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        ...debugInfo,
        error: 'Database connection failed',
        supabaseError: {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        }
      }, { status: 500 });
    }

    // Teste Insert
    const testInsert = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      status: 'new'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('pv_quotes')
      .insert([testInsert])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        ...debugInfo,
        error: 'Insert test failed',
        testData: testInsert,
        supabaseError: {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        }
      }, { status: 500 });
    }

    // Lösche Test-Eintrag
    await supabase
      .from('pv_quotes')
      .delete()
      .eq('id', insertData.id);

    return NextResponse.json({
      ...debugInfo,
      success: true,
      message: 'All tests passed',
      testResult: {
        connectionTest: 'OK',
        insertTest: 'OK',
        insertedId: insertData.id
      }
    }, { headers: corsHeaders });

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      message: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500, headers: corsHeaders });
  }
}
