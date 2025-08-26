import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Incoming email webhook received');
    
    const body = await request.json();
    console.log('📧 Webhook payload:', JSON.stringify(body, null, 2));

    // Extract email data from webhook payload
    // This structure may vary depending on your email provider's webhook format
    const {
      from,
      to,
      subject,
      text,
      html,
      date,
      messageId,
      inReplyTo,
      references
    } = body;

    if (!from || !to || !subject) {
      console.error('❌ Missing required email fields');
      return NextResponse.json(
        { error: 'Missing required email fields' },
        { status: 400 }
      );
    }

    console.log(`📧 Processing incoming email from ${from} to ${to}`);

    // Extract sender email address
    const senderEmail = extractEmailAddress(from);
    const recipientEmail = extractEmailAddress(to);

    // Find or create customer based on sender email
    const customer = await findOrCreateCustomer(senderEmail);
    
    if (!customer) {
      console.error('❌ Failed to find or create customer');
      return NextResponse.json(
        { error: 'Failed to process customer' },
        { status: 500 }
      );
    }

    // Store the incoming email in contact_history
    const { data: contactEntry, error: contactError } = await supabase
      .from('contact_history')
      .insert({
        customer_id: customer.id,
        contact_type: 'email',
        subject: subject,
        content: text || html || '',
        direction: 'inbound',
        metadata: {
          from: from,
          to: to,
          messageId: messageId,
          inReplyTo: inReplyTo,
          references: references,
          receivedAt: new Date().toISOString(),
          originalDate: date
        }
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Error storing contact history:', contactError);
      return NextResponse.json(
        { error: 'Failed to store email' },
        { status: 500 }
      );
    }

    console.log('✅ Email stored successfully:', contactEntry.id);

    return NextResponse.json({
      success: true,
      message: 'Email processed successfully',
      contactId: contactEntry.id,
      customerId: customer.id
    });

  } catch (error) {
    console.error('❌ Email webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

function extractEmailAddress(emailString: string): string {
  // Extract email from formats like "Name <email@domain.com>" or just "email@domain.com"
  const match = emailString.match(/<([^>]+)>/) || emailString.match(/([^\s<>]+@[^\s<>]+)/);
  return match ? match[1] : emailString;
}

async function findOrCreateCustomer(email: string) {
  try {
    // First, try to find existing customer
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (existingCustomer) {
      console.log('✅ Found existing customer:', existingCustomer.id);
      return existingCustomer;
    }

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Error finding customer:', findError);
      return null;
    }

    // Customer doesn't exist, create new one
    console.log('📝 Creating new customer for:', email);
    
    // Extract name from email if possible
    const emailParts = email.split('@')[0];
    const nameParts = emailParts.split(/[._-]/);
    const firstName = nameParts[0] || 'Unbekannt';
    const lastName = nameParts[1] || 'Kunde';

    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        email: email,
        first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        last_name: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        lead_status: 'neu',
        lead_source: 'Email',
        notes: `Automatisch erstellt durch eingehende E-Mail am ${new Date().toLocaleString('de-DE')}`
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating customer:', createError);
      return null;
    }

    console.log('✅ Created new customer:', newCustomer.id);
    return newCustomer;

  } catch (error) {
    console.error('❌ Error in findOrCreateCustomer:', error);
    return null;
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Email Webhook',
    status: 'active',
    endpoint: '/api/emails/webhook',
    description: 'Receives incoming emails and stores them in CRM'
  });
}
