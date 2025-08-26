const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingIncomingEmail() {
  console.log('📧 Adding missing incoming email to CRM...\n');

  try {
    // Find the customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', 'samuel.behr7@gmail.com')
      .single();

    if (customerError) {
      console.error('❌ Error finding customer:', customerError);
      return;
    }

    console.log('✅ Found customer:', customer.first_name, customer.last_name);

    // Add the missing incoming email
    const { data: contactEntry, error: contactError } = await supabase
      .from('contact_history')
      .insert({
        customer_id: customer.id,
        contact_type: 'email',
        subject: 'Re: Erste Kontaktaufnahme',
        content: 'jöjööjöö',
        direction: 'inbound',
        metadata: {
          from: 'Samuel Alexander <samuel.behr7@gmail.com>',
          to: 'info@a4plus.eu',
          messageId: '<test-message-id-12345@gmail.com>',
          inReplyTo: '<original-message-id@a4plus.eu>',
          references: '<original-message-id@a4plus.eu>',
          receivedAt: new Date().toISOString(),
          originalDate: '2025-08-26T03:11:00.000Z'
        }
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Error adding contact history:', contactError);
      return;
    }

    console.log('✅ Successfully added incoming email to CRM!');
    console.log('Contact ID:', contactEntry.id);
    console.log('Subject:', contactEntry.subject);
    console.log('Content:', contactEntry.content);
    console.log('Direction:', contactEntry.direction);
    console.log('');
    console.log('🎉 The missing email should now appear in the CRM email history!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addMissingIncomingEmail();
