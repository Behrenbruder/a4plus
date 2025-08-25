// Test script to verify comprehensive PV data capture
const testPvQuoteData = {
  // Basic contact information
  firstName: "Max",
  lastName: "Mustermann",
  email: "max.mustermann@test.de",
  phone: "+49 123 456789",
  street: "Musterstraße 123",
  city: "Berlin",
  postalCode: "10115",
  
  // Comprehensive PV calculator data
  pvData: {
    // Basic consumption and pricing
    annualConsumption: 4500, // kWh
    electricityPrice: 32.5, // ct/kWh
    
    // Detailed roof surface information
    roofFaces: [
      {
        area: 45.5, // m²
        gti: 1150, // kWh/m²/Jahr
        orientation: 180, // Süden
        tilt: 35, // Grad
        buildingFactor: 0.85,
        shadingFactor: 0.95,
        estimatedModules: 18
      },
      {
        area: 32.0, // m²
        gti: 1050, // kWh/m²/Jahr
        orientation: 225, // Südwest
        tilt: 35, // Grad
        buildingFactor: 0.80,
        shadingFactor: 0.90,
        estimatedModules: 12
      }
    ],
    
    // System configuration
    totalKwp: 12.0,
    estimatedTotalModules: 30,
    annualPvProduction: 11500, // kWh
    batteryKwh: 10.0,
    
    // E-Auto data
    evData: {
      hasEv: true,
      kmPerYear: 15000,
      annualConsumption: 2250 // kWh
    },
    
    // Heat pump data
    heatPumpConsumption: 3200, // kWh
    
    // Calculated results
    autarkiePct: 78.5,
    annualSavingsEur: 1850,
    
    // Additional technical details
    totalRoofArea: 77.5,
    usableRoofArea: 65.2,
    averageGti: 1105,
    averageOrientation: 195,
    averageTilt: 35
  }
};

async function testPvQuotesAPI() {
  const serverUrl = 'http://localhost:3003';
  
  console.log('🧪 Testing comprehensive PV data capture...\n');
  
  try {
    // Test POST - Create new PV quote with comprehensive data
    console.log('📤 Creating PV quote with comprehensive data...');
    const createResponse = await fetch(`${serverUrl}/api/pv-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPvQuoteData)
    });
    
    if (!createResponse.ok) {
      throw new Error(`POST failed: ${createResponse.status} ${createResponse.statusText}`);
    }
    
    const createdQuote = await createResponse.json();
    console.log('✅ PV quote created successfully!');
    console.log('📋 Created quote ID:', createdQuote.id);
    
    // Test GET - Retrieve all PV quotes
    console.log('\n📥 Retrieving all PV quotes...');
    const getResponse = await fetch(`${serverUrl}/api/pv-quotes`);
    
    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const quotesResult = await getResponse.json();
    console.log('✅ PV quotes retrieved successfully!');
    console.log('📊 Total quotes:', quotesResult.pagination.total);
    
    // Find our test quote
    const testQuote = quotesResult.data.find(q => q.id === createdQuote.id);
    if (testQuote) {
      console.log('\n🔍 Verifying comprehensive data capture:');
      
      // Check basic data
      console.log('👤 Contact:', `${testQuote.firstName} ${testQuote.lastName}`);
      console.log('📧 Email:', testQuote.email);
      console.log('📱 Phone:', testQuote.phone);
      console.log('🏠 Address:', `${testQuote.street}, ${testQuote.postalCode} ${testQuote.city}`);
      
      // Check comprehensive PV data
      console.log('\n⚡ PV System Data:');
      console.log('🔌 Annual Consumption:', testQuote.annualConsumptionKwh ? `${testQuote.annualConsumptionKwh} kWh` : 'Not captured');
      console.log('💰 Electricity Price:', testQuote.electricityPriceCtPerKwh ? `${testQuote.electricityPriceCtPerKwh} ct/kWh` : 'Not captured');
      console.log('⚡ System Size:', testQuote.totalKwp ? `${testQuote.totalKwp} kWp` : 'Not captured');
      console.log('🔧 Estimated Modules:', testQuote.estimatedTotalModules ? `${testQuote.estimatedTotalModules} modules` : 'Not captured');
      console.log('☀️ Annual Production:', testQuote.annualPvKwh ? `${testQuote.annualPvKwh} kWh` : 'Not captured');
      console.log('🔋 Battery:', testQuote.batteryKwh ? `${testQuote.batteryKwh} kWh` : 'Not captured');
      
      // Check roof data
      console.log('\n🏠 Roof Data:');
      console.log('📐 Total Roof Area:', testQuote.totalRoofArea ? `${testQuote.totalRoofArea} m²` : 'Not captured');
      console.log('✅ Usable Roof Area:', testQuote.usableRoofArea ? `${testQuote.usableRoofArea} m²` : 'Not captured');
      console.log('☀️ Average GTI:', testQuote.averageGti ? `${testQuote.averageGti} kWh/m²/Jahr` : 'Not captured');
      console.log('🧭 Average Orientation:', testQuote.averageOrientation ? `${testQuote.averageOrientation}°` : 'Not captured');
      console.log('📐 Average Tilt:', testQuote.averageTilt ? `${testQuote.averageTilt}°` : 'Not captured');
      
      // Check detailed roof faces
      if (testQuote.roofFaces) {
        try {
          const roofFaces = JSON.parse(testQuote.roofFaces);
          console.log('🏠 Detailed Roof Faces:', `${roofFaces.length} surfaces captured`);
          roofFaces.forEach((face, index) => {
            console.log(`   Surface ${index + 1}: ${face.area}m², ${face.gti} kWh/m²/Jahr, ${face.orientation}°, ${face.estimatedModules} modules`);
          });
        } catch (e) {
          console.log('🏠 Roof Faces: Error parsing JSON data');
        }
      } else {
        console.log('🏠 Detailed Roof Faces: Not captured');
      }
      
      // Check EV data
      console.log('\n🚗 E-Auto Data:');
      console.log('📊 EV Annual Consumption:', testQuote.evAnnualConsumptionKwh ? `${testQuote.evAnnualConsumptionKwh} kWh` : 'Not captured');
      
      // Check heat pump data
      console.log('\n🔥 Heat Pump Data:');
      console.log('🔥 Heat Pump Consumption:', testQuote.heatPumpConsumptionKwh ? `${testQuote.heatPumpConsumptionKwh} kWh` : 'Not captured');
      
      // Check calculated results
      console.log('\n📊 Results:');
      console.log('🔋 Autarkie:', testQuote.autarkiePct ? `${testQuote.autarkiePct.toFixed(1)}%` : 'Not captured');
      console.log('💰 Annual Savings:', testQuote.annualSavingsEur ? `${testQuote.annualSavingsEur.toFixed(0)}€` : 'Not captured');
      
      console.log('\n✅ Comprehensive PV data test completed successfully!');
      
      // Summary
      const capturedFields = [
        testQuote.annualConsumptionKwh,
        testQuote.electricityPriceCtPerKwh,
        testQuote.estimatedTotalModules,
        testQuote.totalRoofArea,
        testQuote.usableRoofArea,
        testQuote.averageGti,
        testQuote.averageOrientation,
        testQuote.averageTilt,
        testQuote.roofFaces,
        testQuote.evAnnualConsumptionKwh,
        testQuote.heatPumpConsumptionKwh
      ].filter(field => field !== null && field !== undefined);
      
      console.log(`\n📈 Data Capture Summary: ${capturedFields.length}/11 comprehensive fields captured`);
      
    } else {
      console.log('❌ Test quote not found in results');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testPvQuotesAPI();
