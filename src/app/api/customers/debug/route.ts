import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection for customers...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase configuration',
        config: {
          url: supabaseUrl ? '✓ Configured' : '❌ Missing',
          serviceKey: supabaseServiceKey ? '✓ Configured' : '❌ Missing'
        }
      }, { status: 500 })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      console.error('Connection test failed:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: connectionError,
        config: {
          url: '✓ Configured',
          serviceKey: '✓ Configured'
        }
      }, { status: 500 })
    }

    console.log('Connection test passed, count:', connectionTest)

    // Test 2: Try to select data
    const { data: selectTest, error: selectError } = await supabase
      .from('customers')
      .select('*')
      .limit(5)

    if (selectError) {
      console.error('Select test failed:', selectError)
      return NextResponse.json({
        success: false,
        error: 'Select failed',
        details: selectError,
        connectionWorked: true,
        config: {
          url: '✓ Configured',
          serviceKey: '✓ Configured'
        }
      }, { status: 500 })
    }

    console.log('Select test passed, data:', selectTest)

    return NextResponse.json({
      success: true,
      message: 'Connection and select tests passed',
      connectionTest: !!connectionTest,
      selectTest: selectTest?.length || 0,
      config: {
        url: '✓ Configured',
        serviceKey: '✓ Configured'
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configured' : '❌ Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Configured' : '❌ Missing'
      }
    }, { status: 500 })
  }
}
