import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/crm/communication/stats - Get communication statistics
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current date boundaries
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch all contact history for statistics
    const { data: allContacts, error: allContactsError } = await supabase
      .from('contact_history')
      .select('*')
      .eq('contact_type', 'email')

    if (allContactsError) {
      console.error('Error fetching contact history:', allContactsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch communication statistics'
      }, { status: 500 })
    }

    const contacts = allContacts || []

    // Calculate statistics
    const totalEmails = contacts.length
    
    // Count unread emails (inbound emails that haven't been replied to)
    const unreadEmails = contacts.filter(contact => 
      contact.direction === 'inbound' && 
      !contacts.some(reply => 
        reply.customer_id === contact.customer_id && 
        reply.direction === 'outbound' && 
        new Date(reply.created_at) > new Date(contact.created_at)
      )
    ).length

    // Count emails today
    const emailsToday = contacts.filter(contact => 
      new Date(contact.created_at) >= todayStart
    ).length

    // Count emails this week
    const emailsThisWeek = contacts.filter(contact => 
      new Date(contact.created_at) >= weekStart
    ).length

    // Calculate response rate (percentage of inbound emails that got a response)
    const inboundEmails = contacts.filter(contact => contact.direction === 'inbound')
    const respondedEmails = inboundEmails.filter(inbound => 
      contacts.some(outbound => 
        outbound.customer_id === inbound.customer_id && 
        outbound.direction === 'outbound' && 
        new Date(outbound.created_at) > new Date(inbound.created_at)
      )
    )
    const responseRate = inboundEmails.length > 0 
      ? Math.round((respondedEmails.length / inboundEmails.length) * 100)
      : 0

    // Calculate average response time (simplified - just showing a placeholder)
    const avgResponseTime = '2.5h' // This would need more complex calculation in production

    const stats = {
      totalEmails,
      unreadEmails,
      emailsToday,
      emailsThisWeek,
      responseRate,
      avgResponseTime
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching communication statistics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch communication statistics' 
      },
      { status: 500 }
    )
  }
}
