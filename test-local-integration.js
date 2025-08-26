// Lokaler Test für Form-Integration
// Testet nur die wichtigsten Funktionen lokal

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

console.log('🧪 Starte lokalen Integrations-Test...');

// Test 1: Umgebungsvariablen prüfen
function testEnvironmentVariables() {
  console.log('\n📋 Test 1: Umgebungsvariablen');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_SERVICE_ENABLED'
  ];

  const results = {};
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    results[varName] = value ? '✅ Konfiguriert' : '❌ Fehlt';
    console.log(`${varName}: ${results[varName]}`);
  });

  const allConfigured = Object.values(results).every(status => status.includes('✅'));
  console.log(`\nErgebnis: ${allConfigured ? '✅ Alle Variablen konfiguriert' : '❌ Fehlende Konfiguration'}`);
  
  return allConfigured;
}

// Test 2: Supabase-Verbindung
async function testSupabaseConnection() {
  console.log('\n🗄️ Test 2: Supabase-Verbindung');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase-Konfiguration fehlt');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Teste Verbindung zur customers Tabelle
    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Supabase-Verbindung fehlgeschlagen:', error.message);
      return false;
    }

    console.log('✅ Supabase-Verbindung erfolgreich');
    return true;
    
  } catch (error) {
    console.log('❌ Supabase-Test fehlgeschlagen:', error.message);
    return false;
  }
}

// Test 3: SMTP-Verbindung
async function testSMTPConnection() {
  console.log('\n📧 Test 3: SMTP-Verbindung');
  
  try {
    if (process.env.EMAIL_SERVICE_ENABLED !== 'true') {
      console.log('⚠️ E-Mail-Service deaktiviert');
      return true; // Nicht als Fehler werten
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich');
    return true;
    
  } catch (error) {
    console.log('❌ SMTP-Verbindung fehlgeschlagen:', error.message);
    return false;
  }
}

// Test 4: CRM-Tabellen prüfen
async function testCRMTables() {
  console.log('\n🏢 Test 4: CRM-Tabellen');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase-Konfiguration fehlt');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const tables = ['customers', 'contact_history', 'pv_quotes'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        results[table] = error ? `❌ ${error.message}` : '✅ OK';
      } catch (err) {
        results[table] = `❌ ${err.message}`;
      }
    }
    
    Object.entries(results).forEach(([table, status]) => {
      console.log(`${table}: ${status}`);
    });
    
    const allTablesOK = Object.values(results).every(status => status.includes('✅'));
    console.log(`\nErgebnis: ${allTablesOK ? '✅ Alle Tabellen verfügbar' : '❌ Tabellen-Probleme'}`);
    
    return allTablesOK;
    
  } catch (error) {
    console.log('❌ CRM-Tabellen-Test fehlgeschlagen:', error.message);
    return false;
  }
}

// Haupt-Test-Funktion
async function runLocalTests() {
  console.log('🚀 Starte lokale Tests...\n');
  
  const results = {
    environment: false,
    supabase: false,
    smtp: false,
    crmTables: false
  };

  // Führe alle Tests aus
  results.environment = testEnvironmentVariables();
  
  if (results.environment) {
    results.supabase = await testSupabaseConnection();
    results.smtp = await testSMTPConnection();
    results.crmTables = await testCRMTables();
  } else {
    console.log('\n⚠️ Überspringe weitere Tests wegen fehlender Umgebungsvariablen');
  }

  // Zusammenfassung
  console.log('\n📋 LOKALE TEST-ZUSAMMENFASSUNG');
  console.log('===============================');
  console.log('📋 Umgebungsvariablen:', results.environment ? '✅ OK' : '❌ FEHLER');
  console.log('🗄️ Supabase-Verbindung:', results.supabase ? '✅ OK' : '❌ FEHLER');
  console.log('📧 SMTP-Verbindung:', results.smtp ? '✅ OK' : '❌ FEHLER');
  console.log('🏢 CRM-Tabellen:', results.crmTables ? '✅ OK' : '❌ FEHLER');

  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Ergebnis: ${successCount}/${totalTests} Tests erfolgreich`);

  if (successCount === totalTests) {
    console.log('🎉 Alle lokalen Tests bestanden! Basis-Integration funktioniert.');
    console.log('\n💡 Nächste Schritte:');
    console.log('   1. Starte den Development-Server: npm run dev');
    console.log('   2. Teste das Kontaktformular auf http://localhost:3000/kontakt');
    console.log('   3. Teste den PV-Rechner auf http://localhost:3000/pv-rechner');
  } else {
    console.log('⚠️ Einige Tests fehlgeschlagen. Bitte Konfiguration prüfen.');
    
    if (!results.environment) {
      console.log('\n🔧 EMPFEHLUNG: .env.local Datei prüfen und fehlende Variablen ergänzen');
    }
    if (!results.supabase) {
      console.log('🔧 EMPFEHLUNG: Supabase-URL und Service-Key in .env.local prüfen');
    }
    if (!results.smtp) {
      console.log('🔧 EMPFEHLUNG: SMTP-Konfiguration in .env.local prüfen');
    }
    if (!results.crmTables) {
      console.log('🔧 EMPFEHLUNG: CRM-Tabellen in Supabase erstellen/prüfen');
    }
  }

  return results;
}

// Test ausführen
if (require.main === module) {
  runLocalTests().catch(console.error);
}

module.exports = { runLocalTests };
