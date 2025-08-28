// Umfassender Test für den Förder-Check Cron Job
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

// Konfiguration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://a4plus.eu';
const API_ENDPOINT = `${BASE_URL}/api/foerder-scan`;

async function testFoerderCronJob() {
  console.log('🔍 Förder-Check Cron Job Diagnose');
  console.log('==================================');
  console.log(`Basis-URL: ${BASE_URL}`);
  console.log(`API-Endpoint: ${API_ENDPOINT}`);
  console.log(`Aktuelle Zeit: ${new Date().toLocaleString('de-DE')}`);
  
  // 1. Cron Job Konfiguration prüfen
  console.log('\n📋 1. Cron Job Konfiguration');
  console.log('-----------------------------');
  console.log('Vercel Cron Schedule: "0 * * * *" (jede Stunde zur Minute 0)');
  console.log('⚠️  PROBLEM IDENTIFIZIERT: Der Cron läuft JEDE Stunde, nicht nur um 2 Uhr!');
  console.log('   Das bedeutet er sollte um 0:00, 1:00, 2:00, 3:00, etc. laufen');
  
  // 2. Umgebungsvariablen prüfen
  console.log('\n🔧 2. Umgebungsvariablen');
  console.log('------------------------');
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
  console.log('FOERDER_REVIEW_EMAIL:', process.env.FOERDER_REVIEW_EMAIL);
  console.log('EMAIL_SERVICE_ENABLED:', process.env.EMAIL_SERVICE_ENABLED);
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Gesetzt ✅' : 'Nicht gesetzt ❌');
  console.log('AI_CONFLICT_ANALYSIS_ENABLED:', process.env.AI_CONFLICT_ANALYSIS_ENABLED);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Gesetzt ✅' : 'Nicht gesetzt ❌');
  
  // 3. API-Endpoint Erreichbarkeit testen
  console.log('\n🌐 3. API-Endpoint Erreichbarkeit');
  console.log('----------------------------------');
  
  try {
    console.log('Teste GET-Request an /api/foerder-scan...');
    const getResponse = await makeRequest(API_ENDPOINT, 'GET');
    console.log('✅ GET-Request erfolgreich');
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getResponse.data, null, 2));
  } catch (error) {
    console.error('❌ GET-Request fehlgeschlagen:', error.message);
  }
  
  // 4. Manueller Förder-Scan Test
  console.log('\n🔄 4. Manueller Förder-Scan Test');
  console.log('--------------------------------');
  
  try {
    console.log('Starte manuellen Förder-Scan mit force=true...');
    const postResponse = await makeRequest(API_ENDPOINT, 'POST', { force: true });
    console.log('✅ POST-Request erfolgreich');
    console.log('Status:', postResponse.status);
    console.log('Scan-Ergebnis:', JSON.stringify(postResponse.data, null, 2));
    
    // Analysiere Scan-Ergebnis
    if (postResponse.data.success) {
      console.log('\n📊 Scan-Analyse:');
      console.log(`- Gescannte Quellen: ${postResponse.data.scannedSources}`);
      console.log(`- Gefundene Programme: ${postResponse.data.totalPrograms}`);
      console.log(`- Änderungen: ${postResponse.data.changes}`);
      console.log(`- Konflikte: ${postResponse.data.conflicts || 0}`);
      console.log(`- Fehler: ${postResponse.data.errors?.length || 0}`);
      
      if (postResponse.data.errors && postResponse.data.errors.length > 0) {
        console.log('\n❌ Fehler beim Scannen:');
        postResponse.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      // Prüfe ob E-Mail gesendet werden sollte
      if (postResponse.data.changes > 0 || (postResponse.data.conflicts && postResponse.data.conflicts > 0)) {
        console.log('\n📧 E-Mail-Benachrichtigung sollte gesendet werden');
        console.log(`   Grund: ${postResponse.data.changes} Änderungen, ${postResponse.data.conflicts || 0} Konflikte`);
        console.log(`   Ziel-E-Mail: ${process.env.FOERDER_REVIEW_EMAIL || 'Nicht konfiguriert'}`);
      } else {
        console.log('\n📧 Keine E-Mail-Benachrichtigung erforderlich (keine Änderungen/Konflikte)');
      }
      
    } else {
      console.log('❌ Scan fehlgeschlagen:', postResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ POST-Request fehlgeschlagen:', error.message);
    console.error('Details:', error.stack);
  }
  
  // 5. Supabase Verbindung testen
  console.log('\n🗄️  5. Supabase Verbindung Test');
  console.log('-------------------------------');
  
  try {
    const supabaseTestResponse = await makeRequest(`${BASE_URL}/api/ping-search`, 'GET');
    console.log('✅ Supabase-Verbindung funktioniert (über ping-search)');
  } catch (error) {
    console.error('❌ Supabase-Verbindung Problem:', error.message);
  }
  
  // 6. OpenAI API Test
  console.log('\n🤖 6. OpenAI API Test');
  console.log('---------------------');
  
  if (process.env.OPENAI_API_KEY && process.env.AI_CONFLICT_ANALYSIS_ENABLED === 'true') {
    try {
      const openaiTest = await testOpenAI();
      console.log('✅ OpenAI API funktioniert');
      console.log('Modell-Response:', openaiTest.substring(0, 100) + '...');
    } catch (error) {
      console.error('❌ OpenAI API Problem:', error.message);
      console.error('   Das könnte erklären, warum kein ChatGPT-Guthaben abgebucht wurde');
    }
  } else {
    console.log('⚠️  OpenAI API nicht konfiguriert oder deaktiviert');
    console.log('   AI_CONFLICT_ANALYSIS_ENABLED:', process.env.AI_CONFLICT_ANALYSIS_ENABLED);
    console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Gesetzt' : 'Nicht gesetzt');
  }
  
  // 7. Vercel Cron Job Status
  console.log('\n⏰ 7. Vercel Cron Job Diagnose');
  console.log('------------------------------');
  console.log('Aktuelle Cron-Konfiguration in vercel.json:');
  console.log('  Path: /api/foerder-scan');
  console.log('  Schedule: "0 * * * *" (jede Stunde zur Minute 0)');
  console.log('');
  console.log('🔍 Mögliche Probleme:');
  console.log('1. ❌ Cron läuft jede Stunde, nicht nur um 2 Uhr');
  console.log('2. ⚠️  Vercel Cron Jobs können manchmal verzögert oder übersprungen werden');
  console.log('3. ⚠️  Timeout-Probleme bei langen Scan-Vorgängen (30s Limit)');
  console.log('4. ⚠️  Umgebungsvariablen könnten in Vercel anders sein als lokal');
  console.log('5. ⚠️  Supabase-Verbindung könnte in der Produktionsumgebung fehlschlagen');
  
  // 8. Empfohlene Lösungen
  console.log('\n💡 8. Empfohlene Lösungen');
  console.log('-------------------------');
  console.log('1. 🔧 Cron Schedule ändern auf "0 2 * * *" für nur 2 Uhr morgens');
  console.log('2. 📧 E-Mail-Benachrichtigung auch bei erfolgreichen Scans ohne Änderungen senden');
  console.log('3. 📝 Logging in Vercel Functions aktivieren');
  console.log('4. ⏱️  Timeout-Handling verbessern');
  console.log('5. 🔄 Retry-Mechanismus für fehlgeschlagene Scans');
  
  console.log('\n✅ Diagnose abgeschlossen');
  console.log('========================');
  
  return {
    timestamp: new Date().toISOString(),
    cronSchedule: '0 * * * *',
    baseUrl: BASE_URL,
    environmentVariables: {
      baseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      emailEnabled: process.env.EMAIL_SERVICE_ENABLED === 'true',
      openaiKey: !!process.env.OPENAI_API_KEY,
      aiEnabled: process.env.AI_CONFLICT_ANALYSIS_ENABLED === 'true',
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      reviewEmail: process.env.FOERDER_REVIEW_EMAIL
    }
  };
}

async function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Foerder-Cron-Test/1.0'
      }
    };
    
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testOpenAI() {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Test: Antworte mit "OpenAI API funktioniert korrekt"'
        }
      ],
      max_tokens: 50
    })
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Zusätzliche Funktion: Cron Schedule korrigieren
async function fixCronSchedule() {
  console.log('\n🔧 Cron Schedule Korrektur');
  console.log('---------------------------');
  console.log('Aktuelle Schedule: "0 * * * *" (jede Stunde)');
  console.log('Empfohlene Schedule: "0 2 * * *" (nur um 2 Uhr morgens)');
  console.log('');
  console.log('Um das zu ändern, bearbeiten Sie vercel.json:');
  console.log('');
  console.log('  "crons": [');
  console.log('    {');
  console.log('      "path": "/api/foerder-scan",');
  console.log('      "schedule": "0 2 * * *"  // <- Änderung hier');
  console.log('    }');
  console.log('  ]');
  console.log('');
  console.log('Dann deployen Sie die Änderung mit: vercel --prod');
}

// Test ausführen
if (require.main === module) {
  testFoerderCronJob()
    .then((result) => {
      console.log('\n📋 Test-Zusammenfassung:', JSON.stringify(result, null, 2));
      
      // Zeige Cron Schedule Fix
      fixCronSchedule();
    })
    .catch(console.error);
}

module.exports = { testFoerderCronJob, fixCronSchedule };
