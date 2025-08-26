import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface EmailMessage {
  id: string
  created_at: string
  from_email: string
  to_email: string
  subject: string
  content: string
  is_from_customer: boolean
  is_read: boolean
  attachments?: string[]
  message_type: 'email' | 'website_formular'
  contact_type?: string
}

// GET /api/crm/customers/[id]/emails - Fetch email history for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const customerId = id

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch customer info first
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('email, first_name, last_name')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 })
    }

    // Fetch ALL contact history for this customer to ensure nothing is missed
    const { data: contactHistory, error: historyError } = await supabase
      .from('contact_history')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true })

    console.log(`📧 Debug: Found ${contactHistory?.length || 0} contact history entries for customer ${customerId}`)
    if (contactHistory && contactHistory.length > 0) {
      console.log('📧 Contact types found:', [...new Set(contactHistory.map(c => c.contact_type))])
    }

    if (historyError) {
      console.error('Error fetching contact history:', historyError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch email history'
      }, { status: 500 })
    }

    // Transform contact_history to EmailMessage format
    const emails: EmailMessage[] = (contactHistory || []).map(contact => {
      const isFromCustomer = contact.direction === 'inbound'
      const metadata = contact.metadata || {}
      
      return {
        id: contact.id,
        created_at: contact.created_at,
        from_email: isFromCustomer ? customer.email : 'info@a4plus.eu',
        to_email: isFromCustomer ? 'info@a4plus.eu' : customer.email,
        subject: contact.subject || (contact.contact_type === 'website_formular' ? 'Kontaktformular-Anfrage' : 'Kein Betreff'),
        content: contact.content || '',
        is_from_customer: isFromCustomer,
        is_read: true, // Assume all are read in CRM context
        attachments: contact.attachments || [],
        message_type: contact.contact_type === 'website_formular' ? 'website_formular' : 'email',
        contact_type: contact.contact_type
      }
    })

    return NextResponse.json({
      success: true,
      emails: emails
    })

  } catch (error) {
    console.error('Error fetching email history:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch email history' 
      },
      { status: 500 }
    )
  }
}

// POST /api/crm/customers/[id]/emails - Send new email to customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const customerId = id
    const body = await request.json()
    
    const { subject, content } = body

    if (!subject || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: subject, content' 
        },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch customer info
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('email, first_name, last_name')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 })
    }

    // Send actual email using email service
    const { sendEmail } = await import('@/lib/email-service')
    
    try {
      await sendEmail({
        to: customer.email,
        from: 'info@a4plus.eu',
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>')
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      return NextResponse.json({
        success: false,
        error: 'Failed to send email'
      }, { status: 500 })
    }

    // Save to contact_history
    const { data: contactEntry, error: contactError } = await supabase
      .from('contact_history')
      .insert([{
        customer_id: customerId,
        contact_type: 'email',
        subject: subject,
        content: content,
        direction: 'outbound',
        metadata: {
          from_email: 'info@a4plus.eu',
          to_email: customer.email,
          sent_via: 'crm_interface'
        }
      }])
      .select()
      .single()

    if (contactError) {
      console.error('Failed to save contact history:', contactError)
      // Don't fail the request if email was sent successfully
    }

    // Update customer last_contact_date
    await supabase
      .from('customers')
      .update({ 
        last_contact_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)

    // Return the new email in the expected format
    const newEmail: EmailMessage = {
      id: contactEntry?.id || Date.now().toString(),
      created_at: new Date().toISOString(),
      from_email: 'info@a4plus.eu',
      to_email: customer.email,
      subject: subject,
      content: content,
      is_from_customer: false,
      is_read: true,
      message_type: 'email'
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      email: newEmail
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email' 
      },
      { status: 500 }
    )
  }
}
