// Test script to test the live PV quotes API endpoint
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

async function testPvQuotesAPI() {
  try {
    console.log('Testing PV Quotes API on live domain...');
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://a4plus.eu/api/pv-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body (raw):', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response body (parsed):', responseJson);
    } catch (parseError) {
      console.log('Could not parse response as JSON:', parseError.message);
    }
    
    if (!response.ok) {
      console.error('❌ API request failed with status:', response.status);
    } else {
      console.log('✅ API request successful');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testPvQuotesAPI();
