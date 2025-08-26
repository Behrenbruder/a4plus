const { exec } = require('child_process');

async function testMailjetWebhook() {
  console.log('🧪 Testing Mailjet webhook integration...\n');

  // Simuliere ein Mailjet-Event für eine eingehende E-Mail
  const mailjetEvent = {
    event: 'email',
    time: Math.floor(Date.now() / 1000),
    MessageID: 'mailjet-test-12345',
    email: 'info@a4plus.eu',
    mj_campaign_id: 0,
    mj_contact_id: 0,
    customcampaign: '',
    mj_message_id: 'mailjet-msg-12345',
    smtp_reply: '',
    CustomID: '',
    Payload: '',
    from_email: 'kunde@example.com',
    from_name: 'Max Mustermann',
    subject: 'Anfrage zu PV-Anlage',
    text_part: 'Hallo, ich interessiere mich für eine PV-Anlage und hätte gerne ein Angebot.',
    html_part: '<p>Hallo, ich interessiere mich für eine PV-Anlage und hätte gerne ein Angebot.</p>'
  };

  console.log('📧 Sending test Mailjet event to webhook...');
  console.log('From:', mailjetEvent.from_name, '<' + mailjetEvent.from_email + '>');
  console.log('To:', mailjetEvent.email);
  console.log('Subject:', mailjetEvent.subject);
  console.log('Content:', mailjetEvent.text_part.substring(0, 50) + '...');
  console.log('');

  try {
    // Test mit PowerShell (Windows-kompatibel)
    const curlCommand = `powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3009/api/emails/mailjet-webhook' -Method POST -ContentType 'application/json' -Body '${JSON.stringify(mailjetEvent).replace(/'/g, "''")}'"`; 

    await new Promise((resolve, reject) => {
      exec(curlCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error testing Mailjet webhook:', error.message);
          reject(error);
          return;
        }

        if (stderr) {
          console.error('❌ Stderr:', stderr);
        }

        try {
          const result = JSON.parse(stdout);
          console.log('✅ Mailjet webhook processed successfully!');
          console.log('Response:', result);
          console.log('');
          console.log('📧 The email should now appear in the CRM with category "Allgemeine Anfrage"');
          resolve(result);
        } catch (parseError) {
          console.log('Raw response:', stdout);
          resolve(stdout);
        }
      });
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('💡 Make sure the development server is running with: npm run dev');
  }
}

async function testInternalEmail() {
  console.log('\n🧪 Testing internal email (from @a4plus.eu)...\n');

  // Simuliere eine interne E-Mail
  const internalEvent = {
    event: 'email',
    time: Math.floor(Date.now() / 1000),
    MessageID: 'mailjet-internal-12345',
    email: 'service@a4plus.eu',
    mj_campaign_id: 0,
    mj_contact_id: 0,
    customcampaign: '',
    mj_message_id: 'mailjet-internal-msg-12345',
    smtp_reply: '',
    CustomID: '',
    Payload: '',
    from_email: 'mitarbeiter@a4plus.eu',
    from_name: 'Hans Müller',
    subject: 'Interne Nachricht',
    text_part: 'Das ist eine interne E-Mail zwischen Mitarbeitern.',
    html_part: '<p>Das ist eine interne E-Mail zwischen Mitarbeitern.</p>'
  };

  console.log('📧 Sending internal email test...');
  console.log('From:', internalEvent.from_name, '<' + internalEvent.from_email + '>');
  console.log('To:', internalEvent.email);
  console.log('Subject:', internalEvent.subject);
  console.log('');

  try {
    const curlCommand = `powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3009/api/emails/mailjet-webhook' -Method POST -ContentType 'application/json' -Body '${JSON.stringify(internalEvent).replace(/'/g, "''")}'"`; 

    await new Promise((resolve, reject) => {
      exec(curlCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error testing internal email:', error.message);
          reject(error);
          return;
        }

        try {
          const result = JSON.parse(stdout);
          console.log('✅ Internal email processed successfully!');
          console.log('Response:', result);
          console.log('');
          console.log('📧 The internal email should be categorized as "Service" and marked as internal');
          resolve(result);
        } catch (parseError) {
          console.log('Raw response:', stdout);
          resolve(stdout);
        }
      });
    });

  } catch (error) {
    console.error('❌ Internal email test failed:', error.message);
  }
}

async function testWebhookStatus() {
  console.log('🔍 Testing Mailjet webhook status endpoint...');
  
  try {
    const statusCommand = `powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3009/api/emails/mailjet-webhook' -Method GET"`;
    
    await new Promise((resolve, reject) => {
      exec(statusCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error checking webhook status:', error.message);
          reject(error);
          return;
        }

        try {
          const result = JSON.parse(stdout);
          console.log('Mailjet webhook status:', result);
          console.log('');
          resolve(result);
        } catch (parseError) {
          console.log('Raw response:', stdout);
          resolve(stdout);
        }
      });
    });

  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Mailjet webhook tests...\n');
  
  try {
    // 1. Status-Check
    await testWebhookStatus();
    
    // 2. Normale Kunden-E-Mail testen
    await testMailjetWebhook();
    
    // 3. Interne E-Mail testen
    await testInternalEmail();
    
    console.log('\n✅ All tests completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Check the CRM to verify emails appear correctly');
    console.log('2. Verify customer creation worked');
    console.log('3. Check email categorization');
    console.log('4. Test with real Mailjet integration');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

runAllTests();
