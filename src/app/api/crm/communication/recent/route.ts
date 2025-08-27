import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/crm/communication/recent - Get recent communications
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch recent contact history with customer information
    const { data: contactHistory, error: historyError } = await supabase
      .from('contact_history')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('contact_type', 'email')
      .order('created_at', { ascending: false })
      .limit(50)

    if (historyError) {
      console.error('Error fetching contact history:', historyError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch recent communications'
      }, { status: 500 })
    }

    // Transform the data to match the expected format
    const communications = (contactHistory || []).map(contact => {
      const customer = contact.customers
      const customerName = customer 
        ? `${customer.first_name} ${customer.last_name}`.trim() 
        : 'Unbekannter Kunde'
      const customerEmail = customer?.email || 'unbekannt@email.com'

      // Determine status based on direction and whether there's a response
      let status: 'read' | 'unread' | 'replied' = 'read'
      if (contact.direction === 'inbound') {
        // Check if this inbound email has been replied to
        const hasReply = contactHistory?.some(reply => 
          reply.customer_id === contact.customer_id && 
          reply.direction === 'outbound' && 
          new Date(reply.created_at) > new Date(contact.created_at)
        )
        status = hasReply ? 'replied' : 'unread'
      }

      // Determine priority based on keywords in subject/content
      let priority: 'low' | 'medium' | 'high' = 'low'
      const urgentKeywords = ['dringend', 'urgent', 'sofort', 'wichtig', 'eilig', 'asap']
      const mediumKeywords = ['bitte', 'anfrage', 'frage', 'termin', 'angebot']
      
      const textToCheck = `${contact.subject || ''} ${contact.content || ''}`.toLowerCase()
      if (urgentKeywords.some(keyword => textToCheck.includes(keyword))) {
        priority = 'high'
      } else if (mediumKeywords.some(keyword => textToCheck.includes(keyword))) {
        priority = 'medium'
      }

      return {
        id: contact.id,
        type: 'email' as const,
        customerName,
        customerEmail,
        subject: contact.subject || 'Kein Betreff',
        content: contact.content || '',
        direction: contact.direction as 'inbound' | 'outbound',
        created_at: contact.created_at,
        status,
        priority
      }
    })

    return NextResponse.json({
      success: true,
      communications
    })

  } catch (error) {
    console.error('Error fetching recent communications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recent communications' 
      },
      { status: 500 }
    )
  }
}
