const https = require('https');
const http = require('http');

// Test webhook endpoint
const WEBHOOK_URL = 'https://a4plus.eu/api/emails/mailjet-webhook';
const WEBHOOK_URL_WITH_WWW = 'https://www.a4plus.eu/api/emails/mailjet-webhook';
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/emails/mailjet-webhook';

// Sample Mailjet events for testing
const sampleEvents = {
  incomingEmail: {
    event: 'email',
    from_email: 'samuel.behr7@gmail.com',
    from_name: 'Samuel Behr',
    email: 'info@a4plus.eu',
    subject: 'Test Email - Incoming',
    text_part: 'Dies ist eine Test-E-Mail von samuel.behr7@gmail.com an info@a4plus.eu',
    html_part: '<p>Dies ist eine Test-E-Mail von samuel.behr7@gmail.com an info@a4plus.eu</p>',
    MessageID: 'test-incoming-' + Date.now(),
    time: Math.floor(Date.now() / 1000)
  },
  
  outgoingEmail: {
    event: 'sent',
    email: 'info@a4plus.eu',
    Destination: 'samuel.behr7@gmail.com',
    Subject: 'Test Email - Outgoing',
    MessageID: 'test-outgoing-' + Date.now(),
    time: Math.floor(Date.now() / 1000)
  },
  
  deliveredEmail: {
    event: 'delivered',
    MessageID: 'test-delivered-' + Date.now(),
    time: Math.floor(Date.now() / 1000)
  }
};

async function testWebhook(url, eventData, eventType) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify([eventData]);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mailjet-Webhook-Test/1.0'
      }
    };

    console.log(`\n🧪 Testing ${eventType} event...`);
    console.log(`📡 URL: ${url}`);
    console.log(`📦 Payload:`, JSON.stringify(eventData, null, 2));

    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        try {
          const response = JSON.parse(data);
          console.log(`✅ Response:`, response);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          console.log(`📄 Raw Response:`, data);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request failed:`, error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testGetEndpoint(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    console.log(`\n🔍 Testing GET endpoint...`);
    console.log(`📡 URL: ${url}`);

    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          console.log(`✅ Service Info:`, response);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          console.log(`📄 Raw Response:`, data);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ GET request failed:`, error.message);
      reject(error);
    });
  });
}

async function runTests() {
  console.log('🚀 Starting Mailjet Webhook Debug Tests');
  console.log('=' .repeat(50));

  try {
    // Test GET endpoint first
    await testGetEndpoint(WEBHOOK_URL);
    
    // Test all event types
    for (const [eventType, eventData] of Object.entries(sampleEvents)) {
      try {
        await testWebhook(WEBHOOK_URL, eventData, eventType);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
      } catch (error) {
        console.error(`❌ Failed to test ${eventType}:`, error.message);
      }
    }

    console.log('\n🔍 Testing with multiple events in one request...');
    try {
      const multipleEvents = [
        sampleEvents.incomingEmail,
        sampleEvents.outgoingEmail
      ];
      
      await new Promise((resolve, reject) => {
        const postData = JSON.stringify(multipleEvents);
        
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Mailjet-Webhook-Test/1.0'
          }
        };

        const req = https.request(WEBHOOK_URL, options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            console.log(`📊 Multiple Events Status: ${res.statusCode}`);
            try {
              const response = JSON.parse(data);
              console.log(`✅ Multiple Events Response:`, response);
            } catch (e) {
              console.log(`📄 Multiple Events Raw Response:`, data);
            }
            resolve();
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });
    } catch (error) {
      console.error(`❌ Multiple events test failed:`, error.message);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Debug tests completed');
  console.log('\n📋 Next steps:');
  console.log('1. Check the webhook logs in your application');
  console.log('2. Verify the database entries were created');
  console.log('3. Check if emails appear in the CRM interface');
  console.log('4. Review Mailjet dashboard for webhook delivery status');
}

// Run the tests
runTests().catch(console.error);
