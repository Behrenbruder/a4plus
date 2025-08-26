// Umfassender Test für Kontaktformular und PV-Rechner Integration
// Testet: Formular-Submission, CRM-Integration, E-Mail-Versand

const https = require('https');
const http = require('http');

// Test-Konfiguration
const BASE_URL = 'https://www.a4plus.eu';
const LOCAL_URL = 'http://localhost:3000';

// Verwende lokale URL wenn verfügbar, sonst Produktions-URL
const TEST_URL = process.env.NODE_ENV === 'development' ? LOCAL_URL : BASE_URL;

console.log('🧪 Starte umfassenden Integrations-Test...');
console.log('📍 Test-URL:', TEST_URL);

// HTTP Request Helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const lib = options.protocol === 'https:' ? https : http;
    
    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test 1: Kontaktformular-Submission
async function testContactForm() {
  console.log('\n📝 Test 1: Kontaktformular-Submission');
  
  try {
    const url = new URL('/kontakt', TEST_URL);
    
    // Simuliere Formular-Daten
    const formData = new URLSearchParams({
      name: 'Max Mustermann Test',
      email: 'test.kontakt@example.com',
      message: 'Dies ist eine Test-Nachricht vom automatischen Integrations-Test.',
      product_pv: 'on',
      product_speicher: 'on',
      product_waermepumpe: 'on'
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      protocol: url.protocol,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString()),
        'User-Agent': 'Integration-Test-Bot/1.0'
      }
    };

    console.log('📤 Sende Kontaktformular-Daten...');
    const response = await makeRequest(options, formData.toString());
    
    console.log('📊 Response Status:', response.statusCode);
    
    if (response.statusCode === 200 || response.statusCode === 302) {
      console.log('✅ Kontaktformular erfolgreich übermittelt');
      return true;
    } else {
      console.log('❌ Kontaktformular-Fehler:', response.statusCode);
      console.log('Response Body:', response.body);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Kontaktformular-Test fehlgeschlagen:', error.message);
    return false;
  }
}

// Test 2: PV-Rechner API
async function testPVQuoteAPI() {
  console.log('\n⚡ Test 2: PV-Rechner API');
  
  try {
    const url = new URL('/api/pv-quotes', TEST_URL);
    
    // Simuliere PV-Rechner Daten
    const pvData = {
      firstName: 'Anna',
      lastName: 'Beispiel Test',
      email: 'test.pv@example.com',
      phone: '+49 123 456789',
      address: 'Teststraße 123',
      city: 'Teststadt',
      postalCode: '12345',
      pvData: {
        totalKWp: 12.5,
        annualPV: 12000,
        annualConsumption: 4500,
        batteryKWh: 10,
        autarkie: 0.85,
        eigenverbrauch: 0.75,
        annualSavings: 1800,
        co2Savings: 6.2,
        paybackTime: 8.5,
        roofType: 'Satteldach',
        roofTilt: 35,
        electricityPrice: 32
      }
    };

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      protocol: url.protocol,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Integration-Test-Bot/1.0'
      }
    };

    console.log('📤 Sende PV-Rechner-Daten...');
    const response = await makeRequest(options, pvData);
    
    console.log('📊 Response Status:', response.statusCode);
    console.log('📄 Response Body:', response.body);
    
    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ PV-Rechner API erfolgreich');
      console.log('🆔 Quote ID:', response.body.id);
      return { success: true, id: response.body.id };
    } else {
      console.log('❌ PV-Rechner API-Fehler:', response.statusCode);
      return { success: false, error: response.body };
    }
    
  } catch (error) {
    console.error('❌ PV-Rechner API-Test fehlgeschlagen:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: CRM-Integration prüfen
async function testCRMIntegration() {
  console.log('\n🏢 Test 3: CRM-Integration');
  
  try {
    const url = new URL('/api/crm/customers', TEST_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + '?limit=5',
      method: 'GET',
      protocol: url.protocol,
      headers: {
        'User-Agent': 'Integration-Test-Bot/1.0'
      }
    };

    console.log('📤 Prüfe CRM-Kunden...');
    const response = await makeRequest(options);
    
    console.log('📊 Response Status:', response.statusCode);
    
    if (response.statusCode === 200 && response.body.data) {
      console.log('✅ CRM-Integration funktioniert');
      console.log('👥 Anzahl Kunden:', response.body.data.length);
      
      // Prüfe ob Test-Kunden vorhanden sind
      const testCustomers = response.body.data.filter(customer => 
        customer.email && (
          customer.email.includes('test.kontakt@example.com') ||
          customer.email.includes('test.pv@example.com')
        )
      );
      
      if (testCustomers.length > 0) {
        console.log('🎯 Test-Kunden im CRM gefunden:', testCustomers.length);
        testCustomers.forEach(customer => {
          console.log(`   - ${customer.first_name} ${customer.last_name} (${customer.email})`);
        });
      }
      
      return true;
    } else {
      console.log('❌ CRM-Integration-Fehler:', response.statusCode);
      return false;
    }
    
  } catch (error) {
    console.error('❌ CRM-Integration-Test fehlgeschlagen:', error.message);
    return false;
  }
}

// Test 4: E-Mail-Service prüfen
async function testEmailService() {
  console.log('\n📧 Test 4: E-Mail-Service');
  
  try {
    const url = new URL('/api/emails', TEST_URL);
    
    const testEmail = {
      to: 'test@example.com',
      subject: 'Integration Test E-Mail',
      text: 'Dies ist eine Test-E-Mail vom automatischen Integrations-Test.',
      html: '<p>Dies ist eine <strong>Test-E-Mail</strong> vom automatischen Integrations-Test.</p>'
    };

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      protocol: url.protocol,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Integration-Test-Bot/1.0'
      }
    };

    console.log('📤 Teste E-Mail-Service...');
    const response = await makeRequest(options, testEmail);
    
    console.log('📊 Response Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ E-Mail-Service funktioniert');
      return true;
    } else {
      console.log('❌ E-Mail-Service-Fehler:', response.statusCode);
      console.log('Response:', response.body);
      return false;
    }
    
  } catch (error) {
    console.error('❌ E-Mail-Service-Test fehlgeschlagen:', error.message);
    return false;
  }
}

// Test 5: Supabase-Verbindung prüfen
async function testSupabaseConnection() {
  console.log('\n🗄️ Test 5: Supabase-Verbindung');
  
  try {
    const url = new URL('/api/customers/debug', TEST_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      protocol: url.protocol,
      headers: {
        'User-Agent': 'Integration-Test-Bot/1.0'
      }
    };

    console.log('📤 Prüfe Supabase-Verbindung...');
    const response = await makeRequest(options);
    
    console.log('📊 Response Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ Supabase-Verbindung funktioniert');
      if (response.body.config) {
        console.log('🔧 Supabase URL:', response.body.config.url ? '✓ Konfiguriert' : '❌ Fehlt');
        console.log('🔑 Service Key:', response.body.config.serviceKey ? '✓ Konfiguriert' : '❌ Fehlt');
      }
      return true;
    } else {
      console.log('❌ Supabase-Verbindung-Fehler:', response.statusCode);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Supabase-Verbindung-Test fehlgeschlagen:', error.message);
    return false;
  }
}

// Haupt-Test-Funktion
async function runAllTests() {
  console.log('🚀 Starte alle Integrations-Tests...\n');
  
  const results = {
    contactForm: false,
    pvQuoteAPI: false,
    crmIntegration: false,
    emailService: false,
    supabaseConnection: false
  };

  // Führe alle Tests aus
  results.contactForm = await testContactForm();
  results.pvQuoteAPI = (await testPVQuoteAPI()).success;
  results.crmIntegration = await testCRMIntegration();
  results.emailService = await testEmailService();
  results.supabaseConnection = await testSupabaseConnection();

  // Zusammenfassung
  console.log('\n📋 TEST-ZUSAMMENFASSUNG');
  console.log('========================');
  console.log('📝 Kontaktformular:', results.contactForm ? '✅ OK' : '❌ FEHLER');
  console.log('⚡ PV-Rechner API:', results.pvQuoteAPI ? '✅ OK' : '❌ FEHLER');
  console.log('🏢 CRM-Integration:', results.crmIntegration ? '✅ OK' : '❌ FEHLER');
  console.log('📧 E-Mail-Service:', results.emailService ? '✅ OK' : '❌ FEHLER');
  console.log('🗄️ Supabase-Verbindung:', results.supabaseConnection ? '✅ OK' : '❌ FEHLER');

  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Ergebnis: ${successCount}/${totalTests} Tests erfolgreich`);

  if (successCount === totalTests) {
    console.log('🎉 Alle Tests bestanden! Integration funktioniert vollständig.');
  } else {
    console.log('⚠️ Einige Tests fehlgeschlagen. Bitte Konfiguration prüfen.');
    
    // Spezifische Empfehlungen
    if (!results.supabaseConnection) {
      console.log('\n🔧 EMPFEHLUNG: Supabase-Konfiguration in .env.local prüfen');
    }
    if (!results.emailService) {
      console.log('🔧 EMPFEHLUNG: E-Mail-SMTP-Konfiguration in .env.local prüfen');
    }
    if (!results.crmIntegration) {
      console.log('🔧 EMPFEHLUNG: CRM-Tabellen in Supabase prüfen');
    }
  }

  return results;
}

// Test ausführen
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
