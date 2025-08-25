const https = require('https');

async function testCustomersDebug() {
  console.log('🔍 Testing customers debug endpoint...\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.a4plus.eu',
      port: 443,
      path: '/api/customers/debug',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Test-Client/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:', JSON.stringify(parsed, null, 2));
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (e) {
          console.log(`Status: ${res.statusCode}`);
          console.log('Raw response:', data);
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

testCustomersDebug().catch(console.error);
