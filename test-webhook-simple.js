const { exec } = require('child_process');

async function testWebhookWithCurl() {
  console.log('🧪 Testing incoming email webhook with curl...\n');

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

  console.log('📧 Sending test incoming email to webhook...');
  console.log('From:', incomingEmailData.from);
  console.log('Subject:', incomingEmailData.subject);
  console.log('Content:', incomingEmailData.text);
  console.log('');

  const curlCommand = `curl -X POST http://localhost:3009/api/emails/webhook -H "Content-Type: application/json" -d "${JSON.stringify(incomingEmailData).replace(/"/g, '\\"')}"`;

  return new Promise((resolve, reject) => {
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error testing webhook:', error.message);
        console.log('💡 Make sure the development server is running with: npm run dev');
        reject(error);
        return;
      }

      if (stderr) {
        console.error('❌ Stderr:', stderr);
      }

      try {
        const result = JSON.parse(stdout);
        console.log('✅ Webhook processed successfully!');
        console.log('Response:', result);
        console.log('');
        console.log('📧 The incoming email should now appear in the CRM email history.');
        resolve(result);
      } catch (parseError) {
        console.log('Raw response:', stdout);
        resolve(stdout);
      }
    });
  });
}

// Test the GET endpoint too
async function testWebhookStatus() {
  console.log('🔍 Testing webhook status endpoint...');
  
  return new Promise((resolve, reject) => {
    exec('curl http://localhost:3009/api/emails/webhook', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error checking webhook status:', error.message);
        reject(error);
        return;
      }

      try {
        const result = JSON.parse(stdout);
        console.log('Webhook status:', result);
        console.log('');
        resolve(result);
      } catch (parseError) {
        console.log('Raw response:', stdout);
        resolve(stdout);
      }
    });
  });
}

async function runTests() {
  try {
    await testWebhookStatus();
    await testWebhookWithCurl();
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();
