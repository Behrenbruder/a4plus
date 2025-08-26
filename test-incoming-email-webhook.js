const fetch = require('node-fetch');

async function testIncomingEmailWebhook() {
  console.log('🧪 Testing incoming email webhook...\n');

  // Simulate the missing incoming email from samuel.behr7@gmail.com
  const incomingEmailData = {
    from: 'Samuel Alexander <samuel.behr7@gmail.com>',
    to: 'info@a4plus.eu',
    subject: 'Re: Erste Kontaktaufnahme',
    text: 'jöjööjöö',
    html: '<p>jöjööjöö</p>',
    date: '2025-08-26T03:11:00.000Z',
    messageId: '<test-message-id-12345@gmail.com>',
    inReplyTo: '<original-message-id@a4plus.eu>',
    references: '<original-message-id@a4plus.eu>'
  };

  try {
    console.log('📧 Sending test incoming email to webhook...');
    console.log('From:', incomingEmailData.from);
    console.log('Subject:', incomingEmailData.subject);
    console.log('Content:', incomingEmailData.text);
    console.log('');

    const response = await fetch('http://localhost:3009/api/emails/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incomingEmailData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Webhook processed successfully!');
      console.log('Response:', result);
      console.log('');
      console.log('📧 The incoming email should now appear in the CRM email history.');
    } else {
      console.error('❌ Webhook failed:', result);
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
    console.log('');
    console.log('💡 Make sure the development server is running with: npm run dev');
  }
}

// Also test the GET endpoint
async function testWebhookStatus() {
  try {
    console.log('🔍 Testing webhook status endpoint...');
    const response = await fetch('http://localhost:3009/api/emails/webhook');
    const result = await response.json();
    console.log('Webhook status:', result);
    console.log('');
  } catch (error) {
    console.error('❌ Error checking webhook status:', error.message);
  }
}

async function runTests() {
  await testWebhookStatus();
  await testIncomingEmailWebhook();
}

runTests();
