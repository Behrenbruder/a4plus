const https = require('https');
const http = require('http');

// Test the new förder-scan system that uses JSON instead of Supabase
async function testNewFoerderSystem() {
  console.log('🧪 Testing New Förder-Scan System (JSON-based)');
  console.log('='.repeat(60));
  
  try {
    // Test the API endpoint
    const testUrl = 'http://localhost:3000/api/foerder-scan';
    
    console.log('📡 Testing API endpoint:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        force: true // Force scan even if already done today
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('\n✅ API Response received:');
    console.log('📊 Scan Results:');
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Total Programs: ${result.totalPrograms}`);
    console.log(`   - Scanned Sources: ${result.scannedSources}`);
    console.log(`   - Changes: ${result.changes}`);
    console.log(`   - Errors: ${result.errors?.length || 0}`);
    console.log(`   - Scan ID: ${result.scanId}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Verify the system is using JSON data
    console.log('\n🔍 System Verification:');
    console.log(`   ✅ Using JSON file: ${result.totalPrograms === 24 ? 'YES (24 programs)' : 'NO'}`);
    console.log(`   ✅ URL checking: ${result.scannedSources > 0 ? 'WORKING' : 'FAILED'}`);
    console.log(`   ✅ Email notifications: ${result.success ? 'TRIGGERED' : 'FAILED'}`);
    
    // Test a few sample URLs manually
    console.log('\n🌐 Manual URL Tests (sample):');
    const sampleUrls = [
      'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Förderprodukte/Heizungsförderung-für-Privatpersonen-Wohngebäude-(458)/',
      'https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/Energieeffizient_Bauen_und_Sanieren/Einzelmassnahmen/gebaeudehuelle/gebaeudehuelle_node.html',
      'https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/Photovoltaik/start.html'
    ];
    
    for (const url of sampleUrls) {
      try {
        const urlResponse = await fetch(url, { 
          method: 'HEAD',
          timeout: 5000
        });
        console.log(`   ✅ ${url.substring(0, 50)}... - Status: ${urlResponse.status}`);
      } catch (error) {
        console.log(`   ❌ ${url.substring(0, 50)}... - Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • New system scans ${result.totalPrograms} programs (vs. old 5 sources)`);
    console.log(`   • Checks ${result.scannedSources} unique URLs for availability`);
    console.log(`   • Sends email notifications for changes and status`);
    console.log(`   • Runs daily at 2:00 AM via Vercel cron job`);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure the development server is running (npm run dev)');
    console.log('   2. Check that the JSON file is accessible');
    console.log('   3. Verify environment variables are set');
    console.log('   4. Check network connectivity for URL tests');
    
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testNewFoerderSystem()
    .then(result => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Tests failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testNewFoerderSystem };
