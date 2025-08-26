const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateEmailSync() {
  console.log('🔍 Investigating email synchronization...\n');

  try {
    // 1. Check if customer exists for samuel.behr7@gmail.com
    console.log('1. Checking for customer with email samuel.behr7@gmail.com...');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', 'samuel.behr7@gmail.com')
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('❌ Error fetching customer:', customerError);
    } else if (customer) {
      console.log('✅ Found customer:', {
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        created_at: customer.created_at
      });

      // 2. Check contact history for this customer
      console.log('\n2. Checking contact history for this customer...');
      const { data: contactHistory, error: historyError } = await supabase
        .from('contact_history')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error('❌ Error fetching contact history:', historyError);
      } else {
        console.log(`📧 Found ${contactHistory.length} contact history entries:`);
        contactHistory.forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry.contact_type} - ${entry.direction} - ${entry.subject || 'No subject'}`);
          console.log(`     Created: ${entry.created_at}`);
          console.log(`     Content preview: ${entry.content?.substring(0, 100)}...`);
          console.log('');
        });
      }
    } else {
      console.log('❌ No customer found with email samuel.behr7@gmail.com');
    }

    // 3. Check all customers to see what emails we have
    console.log('\n3. Checking all customers in database...');
    const { data: allCustomers, error: allCustomersError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allCustomersError) {
      console.error('❌ Error fetching all customers:', allCustomersError);
    } else {
      console.log(`👥 Found ${allCustomers.length} customers (showing last 10):`);
      allCustomers.forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.first_name} ${customer.last_name} - ${customer.email}`);
      });
    }

    // 4. Check all contact history entries with email content
    console.log('\n4. Checking all contact history entries containing "jöjööjöö" or "bibuuh"...');
    const { data: searchResults, error: searchError } = await supabase
      .from('contact_history')
      .select('*, customers(first_name, last_name, email)')
      .or('content.ilike.%jöjööjöö%,content.ilike.%bibuuh%,subject.ilike.%Erste Kontaktaufnahme%')
      .order('created_at', { ascending: false });

    if (searchError) {
      console.error('❌ Error searching contact history:', searchError);
    } else {
      console.log(`🔍 Found ${searchResults.length} matching entries:`);
      searchResults.forEach((entry, index) => {
        console.log(`  ${index + 1}. Customer: ${entry.customers?.email || 'Unknown'}`);
        console.log(`     Subject: ${entry.subject || 'No subject'}`);
        console.log(`     Type: ${entry.contact_type} - ${entry.direction}`);
        console.log(`     Content: ${entry.content?.substring(0, 200)}...`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

investigateEmailSync();
