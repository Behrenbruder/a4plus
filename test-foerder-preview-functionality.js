/**
 * Test script for the enhanced förder-management functionality
 * Tests the preview API endpoint and verifies the response structure
 */

const BASE_URL = 'http://localhost:3000'

async function testPreviewEndpoint() {
  console.log('🧪 Testing Förder Preview Endpoint...\n')
  
  try {
    console.log('📡 Calling /api/foerder-scan/preview...')
    const response = await fetch(`${BASE_URL}/api/foerder-scan/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Preview API Response received')
    
    // Verify response structure
    if (!data.success) {
      console.error('❌ API returned success: false')
      console.error('Error:', data.error)
      return false
    }
    
    console.log('\n📊 Preview Summary:')
    console.log(`- Total Checked: ${data.summary.totalChecked}`)
    console.log(`- New Entries: ${data.summary.newEntries}`)
    console.log(`- Status Changes: ${data.summary.statusChanges}`)
    console.log(`- No Changes: ${data.summary.noChanges}`)
    console.log(`- Available Programs: ${data.summary.availablePrograms}`)
    console.log(`- Unavailable Programs: ${data.summary.unavailablePrograms}`)
    
    console.log('\n📋 Changes Breakdown:')
    console.log(`- New: ${data.changes.new.length} items`)
    console.log(`- Status Changes: ${data.changes.statusChanges.length} items`)
    console.log(`- No Changes: ${data.changes.noChanges.length} items`)
    
    // Show some example entries
    if (data.changes.new.length > 0) {
      console.log('\n🆕 Example New Entry:')
      const example = data.changes.new[0]
      console.log(`  - Name: ${example.name}`)
      console.log(`  - Status: ${example.newStatus}`)
      console.log(`  - URL: ${example.url}`)
    }
    
    if (data.changes.statusChanges.length > 0) {
      console.log('\n🔄 Example Status Change:')
      const example = data.changes.statusChanges[0]
      console.log(`  - Name: ${example.name}`)
      console.log(`  - From: ${example.currentStatus} → To: ${example.newStatus}`)
    }
    
    console.log(`\n⏰ Scan completed at: ${new Date(data.timestamp).toLocaleString('de-DE')}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Error testing preview endpoint:', error.message)
    return false
  }
}

async function testOriginalScanEndpoint() {
  console.log('\n🧪 Testing Original Scan Endpoint...\n')
  
  try {
    console.log('📡 Calling /api/foerder-scan...')
    const response = await fetch(`${BASE_URL}/api/foerder-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Original scan API still works')
    console.log('Response:', data.message || 'Scan completed')
    
    return true
    
  } catch (error) {
    console.error('❌ Error testing original scan endpoint:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting Förder Management Tests\n')
  console.log('=' .repeat(50))
  
  const results = []
  
  // Test preview endpoint
  results.push(await testPreviewEndpoint())
  
  console.log('\n' + '=' .repeat(50))
  
  // Test original scan endpoint
  results.push(await testOriginalScanEndpoint())
  
  console.log('\n' + '=' .repeat(50))
  console.log('\n📋 Test Results Summary:')
  console.log(`✅ Passed: ${results.filter(r => r).length}/${results.length}`)
  console.log(`❌ Failed: ${results.filter(r => !r).length}/${results.length}`)
  
  if (results.every(r => r)) {
    console.log('\n🎉 All tests passed! The förder management functionality is working correctly.')
    console.log('\n💡 Next steps:')
    console.log('1. Visit http://localhost:3000/crm/foerder-management')
    console.log('2. Click the "Vorschau" button to test the preview functionality')
    console.log('3. Review the preview modal and test applying changes')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the error messages above.')
  }
}

// Run the tests
runTests().catch(console.error)
