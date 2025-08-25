// Test script to verify connection to production domain
async function testProductionConnection() {
  const productionUrl = 'https://www.a4plus.eu';
  
  console.log('🌐 Testing connection to production domain...\n');
  console.log(`🔗 Testing: ${productionUrl}`);
  
  try {
    // Test basic connectivity
    console.log('\n📡 Testing basic connectivity...');
    const healthResponse = await fetch(`${productionUrl}/api/customers?limit=1`);
    
    if (!healthResponse.ok) {
      throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
    }
    
    console.log('✅ Basic connectivity successful!');
    
    // Test PV quotes API
    console.log('\n📊 Testing PV quotes API...');
    const pvResponse = await fetch(`${productionUrl}/api/pv-quotes?limit=1`);
    
    if (!pvResponse.ok) {
      throw new Error(`PV API HTTP ${pvResponse.status}: ${pvResponse.statusText}`);
    }
    
    const pvResult = await pvResponse.json();
    console.log('✅ PV quotes API working!');
    console.log(`📈 Found ${pvResult.pagination?.total || 0} PV quotes in production`);
    
    // Test customers API
    console.log('\n👥 Testing customers API...');
    const customersResponse = await fetch(`${productionUrl}/api/customers?limit=1`);
    
    if (!customersResponse.ok) {
      throw new Error(`Customers API HTTP ${customersResponse.status}: ${customersResponse.statusText}`);
    }
    
    const customersResult = await customersResponse.json();
    console.log('✅ Customers API working!');
    console.log(`👤 Found ${customersResult.pagination?.total || 0} customers in production`);
    
    // Test installers API
    console.log('\n🔧 Testing installers API...');
    const installersResponse = await fetch(`${productionUrl}/api/installers?limit=1`);
    
    if (!installersResponse.ok) {
      throw new Error(`Installers API HTTP ${installersResponse.status}: ${installersResponse.statusText}`);
    }
    
    const installersResult = await installersResponse.json();
    console.log('✅ Installers API working!');
    console.log(`🔧 Found ${installersResult.pagination?.total || 0} installers in production`);
    
    // Test emails API
    console.log('\n📧 Testing emails API...');
    const emailsResponse = await fetch(`${productionUrl}/api/emails?limit=1`);
    
    if (!emailsResponse.ok) {
      throw new Error(`Emails API HTTP ${emailsResponse.status}: ${emailsResponse.statusText}`);
    }
    
    const emailsResult = await emailsResponse.json();
    console.log('✅ Emails API working!');
    console.log(`📧 Found ${emailsResult.pagination?.total || 0} emails in production`);
    
    console.log('\n🎉 All production APIs are working correctly!');
    console.log('\n📋 Production Data Summary:');
    console.log(`   • PV Quotes: ${pvResult.pagination?.total || 0}`);
    console.log(`   • Customers: ${customersResult.pagination?.total || 0}`);
    console.log(`   • Installers: ${installersResult.pagination?.total || 0}`);
    console.log(`   • Emails: ${emailsResult.pagination?.total || 0}`);
    
    console.log('\n✅ Desktop CRM is ready to sync with production domain!');
    
  } catch (error) {
    console.error('❌ Production connection test failed:', error.message);
    console.error('\n🔍 Possible issues:');
    console.error('   • Domain not accessible');
    console.error('   • API routes not deployed');
    console.error('   • CORS configuration issues');
    console.error('   • Database connection problems');
    
    console.log('\n💡 Recommendations:');
    console.log('   1. Verify domain is accessible in browser');
    console.log('   2. Check Vercel deployment status');
    console.log('   3. Ensure all API routes are deployed');
    console.log('   4. Test individual API endpoints manually');
  }
}

// Run the test
testProductionConnection();
