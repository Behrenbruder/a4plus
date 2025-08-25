import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection for customers...')
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      console.error('Connection test failed:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: connectionError
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
        connectionWorked: true
      }, { status: 500 })
    }

    console.log('Select test passed, data:', selectTest)

    // Test 3: Try to insert test data
    const testCustomer = {
      first_name: 'Debug',
      last_name: 'Test',
      email: `debug-test-${Date.now()}@example.com`,
      status: 'lead'
    }

    const { data: insertTest, error: insertError } = await supabase
      .from('customers')
      .insert([testCustomer])
      .select()
      .single()

    if (insertError) {
      console.error('Insert test failed:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: insertError,
        connectionWorked: true,
        selectWorked: true
      }, { status: 500 })
    }

    console.log('Insert test passed, data:', insertTest)

    // Clean up test data
    if (insertTest?.id) {
      await supabase
        .from('customers')
        .delete()
        .eq('id', insertTest.id)
    }

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      connectionTest: !!connectionTest,
      selectTest: selectTest?.length || 0,
      insertTest: !!insertTest
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
