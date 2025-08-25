// Enhanced test script with detailed error reporting
const testData = {
  firstName: "Max",
  lastName: "Mustermann", 
  email: "max.mustermann@test.de",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  pvData: {
    roofType: "Satteldach",
    roofTilt: 35,
    annualConsumption: 4000,
    electricityPrice: 0.35,
    totalKWp: 57.19,
    annualPV: 44548,
    batteryKWh: 25,
    autarkie: 0.81,
    eigenverbrauch: 0.39,
    annualSavings: 5666,
    co2Savings: 18.16,
    paybackTime: 10.6
  }
};

async function testWithDetailedErrors() {
  try {
    console.log('Testing with detailed error reporting...');
    
    // First test with NODE_ENV=development to get detailed errors
    const response = await fetch('https://a4plus.eu/api/pv-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Mode': 'true'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      console.error('❌ Request failed');
      
      // Try to get more details by testing individual fields
      console.log('\n--- Testing minimal data ---');
      const minimalData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        pvData: {}
      };
      
      const minimalResponse = await fetch('https://a4plus.eu/api/pv-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalData)
      });
      
      const minimalResult = await minimalResponse.text();
      console.log('Minimal test status:', minimalResponse.status);
      console.log('Minimal test response:', minimalResult);
      
    } else {
      console.log('✅ Request successful!');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testWithDetailedErrors();
