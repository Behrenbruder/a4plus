import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('� Mailjet webhook received');
    
    const body = await request.json();
    console.log('� Mailjet payload:', JSON.stringify(body, null, 2));

    // Mailjet sendet Events als Array
    const events = Array.isArray(body) ? body : [body];

    for (const event of events) {
      if (event.event === 'email') {
        await processIncomingEmail(event);
      } else if (event.event === 'sent') {
        await processOutgoingEmail(event);
      } else if (event.event === 'delivered') {
        await processEmailDelivered(event);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Mailjet webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processIncomingEmail(event: Record<string, unknown>) {
  try {
    const from_email = event.from_email as string;
    const from_name = event.from_name as string;
    const to_email = event.email as string;
    const subject = event.subject as string;
    const text_part = event.text_part as string;
    const html_part = event.html_part as string;
    const MessageID = event.MessageID as string;
    const time = event.time as number;

    // Nur @a4plus.eu E-Mails verarbeiten
    if (!to_email?.includes('@a4plus.eu')) {
      console.log('📧 Skipping non-a4plus.eu email:', to_email);
      return;
    }

    console.log(`📧 Processing email from ${from_email} to ${to_email}`);

    // Prüfen ob es eine interne E-Mail ist (von @a4plus.eu)
    const isInternalEmail = from_email?.includes('@a4plus.eu');
    
    // Kunde finden oder erstellen
    const customer = await findOrCreateCustomer(from_email, from_name, isInternalEmail);
    
    if (!customer) {
      console.error('❌ Failed to process customer');
      return;
    }

    // E-Mail-Kategorie bestimmen
    const category = getEmailCategory(to_email);

    // E-Mail in contact_history speichern
    const { data: contactEntry, error: contactError } = await supabase
      .from('contact_history')
      .insert({
        customer_id: customer.id,
        contact_type: 'email',
        subject: subject || 'Kein Betreff',
        content: text_part || html_part || '',
        direction: 'inbound',
        metadata: {
          from: from_name ? `${from_name} <${from_email}>` : from_email,
          to: to_email,
          messageId: MessageID,
          receivedAt: new Date().toISOString(),
          originalDate: new Date(time * 1000).toISOString(),
          category: category,
          isInternalEmail: isInternalEmail,
          mailjetEvent: event
        }
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Error storing contact history:', contactError);
      return;
    }

    console.log('✅ Email stored successfully:', contactEntry.id);
    console.log(`📧 Category: ${category}, Internal: ${isInternalEmail}`);

  } catch (error) {
    console.error('❌ Error processing email:', error);
  }
}

async function findOrCreateCustomer(email: string, name?: string, isInternal: boolean = false) {
  try {
    // Existierenden Kunden suchen
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

    // Neuen Kunden erstellen
    console.log('📝 Creating new customer for:', email);
    
    // Name aus Mailjet-Daten oder E-Mail ableiten
    let firstName = 'Unbekannt';
    let lastName = 'Kunde';
    
    if (name) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0] || 'Unbekannt';
      lastName = nameParts.slice(1).join(' ') || 'Kunde';
    } else {
      const emailParts = email.split('@')[0];
      const parts = emailParts.split(/[._-]/);
      firstName = parts[0] || 'Unbekannt';
      lastName = parts[1] || 'Kunde';
    }

    // Für interne E-Mails andere Behandlung
    const leadSource = isInternal ? 'Interner Kontakt' : 'Email';
    const leadStatus = isInternal ? 'mitarbeiter' : 'neu';
    const notes = isInternal 
      ? `Interner Kontakt erstellt durch Mailjet-Webhook am ${new Date().toLocaleString('de-DE')}`
      : `Automatisch erstellt durch Mailjet-Webhook am ${new Date().toLocaleString('de-DE')}`;

    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        email: email,
        first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        last_name: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        lead_status: leadStatus,
        lead_source: leadSource,
        notes: notes
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

async function processOutgoingEmail(event: Record<string, unknown>) {
  try {
    const from_email = event.email as string;
    const to_email = event.Destination as string;
    const subject = event.Subject as string;
    const MessageID = event.MessageID as string;
    const time = event.time as number;

    console.log(`📤 Processing outgoing email from ${from_email} to ${to_email}`);

    // Nur E-Mails von @a4plus.eu verarbeiten (ausgehende E-Mails)
    if (!from_email?.includes('@a4plus.eu')) {
      console.log('📤 Skipping non-a4plus.eu outgoing email:', from_email);
      return;
    }

    // Empfänger als Kunde finden oder erstellen
    const customer = await findOrCreateCustomer(to_email, undefined, false);
    
    if (!customer) {
      console.error('❌ Failed to process customer for outgoing email');
      return;
    }

    // Ausgehende E-Mail in contact_history speichern
    const { data: contactEntry, error: contactError } = await supabase
      .from('contact_history')
      .insert({
        customer_id: customer.id,
        contact_type: 'email',
        subject: subject || 'Kein Betreff',
        content: 'E-Mail gesendet', // Mailjet sendet nicht immer den Inhalt bei sent-Events
        direction: 'outbound',
        metadata: {
          from: from_email,
          to: to_email,
          messageId: MessageID,
          sentAt: new Date().toISOString(),
          originalDate: new Date(time * 1000).toISOString(),
          category: getEmailCategory(from_email),
          mailjetEvent: event
        }
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Error storing outgoing email:', contactError);
      return;
    }

    console.log('✅ Outgoing email stored successfully:', contactEntry.id);

  } catch (error) {
    console.error('❌ Error processing outgoing email:', error);
  }
}

async function processEmailDelivered(event: Record<string, unknown>) {
  try {
    const { MessageID, time } = event;
    
    console.log(`📬 Email delivered: ${MessageID}`);
    
    // Optional: Update delivery status in metadata
    const { data: existingEntry, error: findError } = await supabase
      .from('contact_history')
      .select('metadata')
      .eq('metadata->messageId', MessageID)
      .single();

    if (!findError && existingEntry) {
      const updatedMetadata = {
        ...existingEntry.metadata,
        deliveredAt: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('contact_history')
        .update({ metadata: updatedMetadata })
        .eq('metadata->messageId', MessageID);

      if (updateError) {
        console.error('❌ Error updating delivery status:', updateError);
      } else {
        console.log('✅ Delivery status updated for:', MessageID);
      }
    }

  } catch (error) {
    console.error('❌ Error processing delivery event:', error);
  }
}

// E-Mails nach Empfänger kategorisieren
function getEmailCategory(toEmail: string): string {
  if (!toEmail) return 'Sonstige';
  
  const email = toEmail.toLowerCase();
  
  if (email.includes('info@')) return 'Allgemeine Anfrage';
  if (email.includes('kontakt@')) return 'Kontakt';
  if (email.includes('service@')) return 'Service';
  if (email.includes('support@')) return 'Support';
  if (email.includes('vertrieb@')) return 'Vertrieb';
  if (email.includes('technik@')) return 'Technik';
  if (email.includes('buchhaltung@')) return 'Buchhaltung';
  
  return 'Sonstige';
}

// GET endpoint für Testing
export async function GET() {
  return NextResponse.json({
    service: 'Mailjet Email Webhook',
    status: 'active',
    endpoint: '/api/emails/mailjet-webhook',
    description: 'Receives incoming emails from Mailjet and stores them in CRM',
    supportedEvents: ['email', 'bounce', 'spam'],
    features: [
      'Automatic customer creation',
      'Internal email detection',
      'Email categorization',
      'Full metadata storage'
    ]
  });
}
