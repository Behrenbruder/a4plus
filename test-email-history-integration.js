// Test für die vollständige E-Mail-Verlauf Integration
// Testet Kontaktformular -> CRM -> E-Mail-Verlauf Synchronisation

const { createClient } = require('@supabase/supabase-js');

// Konfiguration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Umgebungsvariablen fehlen!');
  console.error('Benötigt: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testEmailHistoryIntegration() {
  console.log('🧪 Teste E-Mail-Verlauf Integration...\n');

  let testCustomerId = null;
  let testResults = {
    customerCreation: false,
    contactHistoryCreation: false,
    emailHistoryAPI: false,
    confirmationEmailSaving: false
  };

  try {
    // 1. Test-Kunde erstellen
    console.log('1️⃣ Erstelle Test-Kunde...');
    const testCustomer = {
      first_name: 'Test',
      last_name: 'Integration',
      email: `test-integration-${Date.now()}@example.com`,
      lead_status: 'neu',
      lead_source: 'Test',
      product_interests: ['pv'],
      notes: 'Test-Kunde für E-Mail-Verlauf Integration'
    };

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([testCustomer])
      .select()
      .single();

    if (customerError) {
      throw new Error(`Kunde-Erstellung fehlgeschlagen: ${customerError.message}`);
    }

    testCustomerId = customer.id;
    testResults.customerCreation = true;
    console.log('✅ Test-Kunde erstellt:', customer.id);

    // 2. Kontaktformular-Eintrag simulieren
    console.log('\n2️⃣ Simuliere Kontaktformular-Eintrag...');
    const { error: contactError } = await supabase
      .from('contact_history')
      .insert([{
        customer_id: testCustomerId,
        contact_type: 'website_formular',
        subject: 'Kontaktformular-Anfrage',
        content: 'Hallo, ich interessiere mich für eine PV-Anlage. Können Sie mir ein Angebot machen?',
        direction: 'inbound',
        metadata: {
          form_type: 'kontaktformular',
          customer_name: 'Test Integration'
        }
      }]);

    if (contactError) {
      throw new Error(`Kontakt-Historie Erstellung fehlgeschlagen: ${contactError.message}`);
    }

    testResults.contactHistoryCreation = true;
    console.log('✅ Kontaktformular-Eintrag erstellt');

    // 3. Bestätigungs-E-Mail simulieren (wie sie vom System gesendet würde)
    console.log('\n3️⃣ Simuliere Bestätigungs-E-Mail...');
    const { error: confirmationError } = await supabase
      .from('contact_history')
      .insert([{
        customer_id: testCustomerId,
        contact_type: 'email',
        subject: 'Ihre Anfrage bei A4Plus - Bestätigung',
        content: `Hallo ${testCustomer.first_name} ${testCustomer.last_name},

vielen Dank für Ihre Anfrage! Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.

Mit freundlichen Grüßen
Ihr A4Plus Team`,
        direction: 'outbound',
        metadata: {
          from_email: 'info@a4plus.eu',
          to_email: testCustomer.email,
          sent_via: 'email_notification_system'
        }
      }]);

    if (confirmationError) {
      throw new Error(`Bestätigungs-E-Mail Speicherung fehlgeschlagen: ${confirmationError.message}`);
    }

    testResults.confirmationEmailSaving = true;
    console.log('✅ Bestätigungs-E-Mail gespeichert');

    // 4. E-Mail-Verlauf API testen
    console.log('\n4️⃣ Teste E-Mail-Verlauf API...');
    
    // Simuliere API-Aufruf
    const response = await fetch(`${BASE_URL}/api/crm/customers/${testCustomerId}/emails`);
    
    if (!response.ok) {
      throw new Error(`API-Aufruf fehlgeschlagen: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.emails) {
      throw new Error('API-Response ungültig');
    }

    console.log('✅ E-Mail-Verlauf API funktioniert');
    console.log(`📧 ${data.emails.length} Nachrichten gefunden:`);
    
    data.emails.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email.is_from_customer ? '📥' : '📤'} ${email.subject} (${email.message_type || email.contact_type})`);
      console.log(`      ${email.created_at} - ${email.is_from_customer ? 'Eingehend' : 'Ausgehend'}`);
    });

    // Validiere, dass beide Nachrichten vorhanden sind
    const formMessage = data.emails.find(e => e.message_type === 'website_formular' || e.contact_type === 'website_formular');
    const confirmationMessage = data.emails.find(e => e.message_type === 'email' && !e.is_from_customer);

    if (!formMessage) {
      throw new Error('Kontaktformular-Nachricht nicht im E-Mail-Verlauf gefunden');
    }

    if (!confirmationMessage) {
      throw new Error('Bestätigungs-E-Mail nicht im E-Mail-Verlauf gefunden');
    }

    testResults.emailHistoryAPI = true;
    console.log('✅ Beide Nachrichten korrekt im E-Mail-Verlauf angezeigt');

    // 5. Chronologische Reihenfolge prüfen
    console.log('\n5️⃣ Prüfe chronologische Reihenfolge...');
    const sortedEmails = data.emails.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    if (sortedEmails[0].is_from_customer && !sortedEmails[1].is_from_customer) {
      console.log('✅ Chronologische Reihenfolge korrekt:');
      console.log('   1. Kontaktformular-Anfrage (Kunde)');
      console.log('   2. Bestätigungs-E-Mail (A4Plus)');
    } else {
      console.log('⚠️  Reihenfolge möglicherweise nicht optimal, aber funktional');
    }

  } catch (error) {
    console.error('❌ Test fehlgeschlagen:', error.message);
    return false;
  } finally {
    // Cleanup: Test-Daten löschen
    if (testCustomerId) {
      console.log('\n🧹 Bereinige Test-Daten...');
      
      // Lösche contact_history Einträge
      await supabase
        .from('contact_history')
        .delete()
        .eq('customer_id', testCustomerId);
      
      // Lösche Test-Kunde
      await supabase
        .from('customers')
        .delete()
        .eq('id', testCustomerId);
      
      console.log('✅ Test-Daten bereinigt');
    }
  }

  // Ergebnisse zusammenfassen
  console.log('\n📊 Test-Ergebnisse:');
  console.log('==================');
  
  const results = [
    { name: 'Kunde-Erstellung', status: testResults.customerCreation },
    { name: 'Kontakt-Historie Erstellung', status: testResults.contactHistoryCreation },
    { name: 'Bestätigungs-E-Mail Speicherung', status: testResults.confirmationEmailSaving },
    { name: 'E-Mail-Verlauf API', status: testResults.emailHistoryAPI }
  ];

  results.forEach(result => {
    console.log(`${result.status ? '✅' : '❌'} ${result.name}`);
  });

  const allPassed = results.every(r => r.status);
  
  console.log('\n' + '='.repeat(50));
  console.log(allPassed ? '🎉 ALLE TESTS BESTANDEN!' : '❌ EINIGE TESTS FEHLGESCHLAGEN');
  console.log('='.repeat(50));

  return allPassed;
}

// Test ausführen
if (require.main === module) {
  testEmailHistoryIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unerwarteter Fehler:', error);
      process.exit(1);
    });
}

module.exports = { testEmailHistoryIntegration };
