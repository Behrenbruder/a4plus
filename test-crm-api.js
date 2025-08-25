const https = require('https');

// Test the customers API endpoint that your CRM is likely trying to access
const testEndpoint = (url, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CRM-Test-Client/1.0',
        'Accept': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

async function testCRMEndpoints() {
  console.log('🔍 Testing CRM API endpoints...\n');

  const baseUrl = 'https://www.a4plus.eu';
  
  const endpoints = [
    { url: `${baseUrl}/api/customers`, method: 'GET', name: 'Get Customers' },
    { url: `${baseUrl}/api/customers`, method: 'OPTIONS', name: 'CORS Preflight' },
    { url: `${baseUrl}/api/pv-quotes`, method: 'GET', name: 'Get PV Quotes' },
    { url: `${baseUrl}/api/installers`, method: 'GET', name: 'Get Installers' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name} (${endpoint.method}):`);
      console.log(`URL: ${endpoint.url}`);
      
      const result = await testEndpoint(endpoint.url, endpoint.method);
      
      console.log(`Status: ${result.status}`);
      console.log(`Response:`, JSON.stringify(result.data, null, 2));
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ Error testing ${endpoint.name}:`, error.message);
      console.log('---\n');
    }
  }

  // Test with CRM-like headers
  console.log('🔍 Testing with CRM-specific headers...\n');
  
  try {
    const crmTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.a4plus.eu',
        port: 443,
        path: '/api/customers',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CRM-System/1.0',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data
            });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    console.log('CRM Test Result:');
    console.log(`Status: ${crmTest.status}`);
    console.log(`Response:`, JSON.stringify(crmTest.data, null, 2));
    
  } catch (error) {
    console.error('❌ CRM test error:', error.message);
  }
}

testCRMEndpoints().catch(console.error);
