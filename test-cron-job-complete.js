// Test des kompletten Cron-Job-Ablaufs mit Supabase-Datenbank
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

console.log('🔄 Kompletter Cron-Job Ablauf Test');
console.log('===================================');
console.log(`Zeitpunkt: ${new Date().toLocaleString('de-DE')}`);
console.log('');

async function testCompleteCronJob() {
  try {
    // 1. Teste die echte API-Route die der Cron-Job verwendet
    console.log('📋 1. Teste echte Förder-Scan API (wie Cron-Job)');
    console.log('------------------------------------------------');
    
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://a4plus.eu';
    console.log(`API-URL: ${BASE_URL}/api/foerder-scan`);
    
    const scanResponse = await makeRequest(`${BASE_URL}/api/foerder-scan?force=true`, 'GET');
    
    console.log(`Status: ${scanResponse.status}`);
    console.log('Response:', JSON.stringify(scanResponse.data, null, 2));
    
    if (scanResponse.status === 200 && scanResponse.data) {
      const result = scanResponse.data;
      
      console.log('');
      console.log('📊 Scan-Ergebnisse:');
      console.log(`   Gescannte Quellen: ${result.scannedSources || 0}`);
      console.log(`   Gefundene Programme: ${result.totalPrograms || 0}`);
      console.log(`   Änderungen: ${result.changes || 0}`);
      console.log(`   Konflikte: ${result.conflicts || 0}`);
      console.log(`   Fehler: ${result.errors?.length || 0}`);
      
      if (result.errors && result.errors.length > 0) {
        console.log('');
        console.log('❌ Aufgetretene Fehler:');
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      // 2. Teste Supabase-Verbindung direkt
      console.log('');
      console.log('🗄️  2. Teste Supabase-Datenbank direkt');
      console.log('--------------------------------------');
      
      await testSupabaseDirectly();
      
    } else {
      console.log('❌ API-Aufruf fehlgeschlagen');
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Testen des Cron-Jobs:', error.message);
  }
  
  console.log('');
  console.log('✅ Test abgeschlossen');
  console.log('====================');
}

async function testSupabaseDirectly() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Supabase-Konfiguration fehlt');
      return;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔄 Lade aktive Förderungsquellen aus Supabase...');
    
    const { data: sources, error } = await supabase
      .from('foerder_sources')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error) {
      console.log('❌ Supabase-Fehler:', error.message);
      return;
    }
    
    if (!sources || sources.length === 0) {
      console.log('⚠️  Keine aktiven Förderungsquellen in der Datenbank gefunden');
      console.log('   Das erklärt, warum der Cron-Job keine Quellen scannt!');
      return;
    }
    
    console.log(`✅ ${sources.length} aktive Förderungsquellen in Supabase gefunden:`);
    console.log('');
    
    sources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.name}`);
      console.log(`   ID: ${source.id}`);
      console.log(`   Typ: ${source.type}`);
      console.log(`   URL: ${source.url}`);
      console.log(`   Parser: ${source.parser_type}`);
      console.log(`   Aktiv: ${source.active ? '✅ Ja' : '❌ Nein'}`);
      console.log(`   Letzter Scan: ${source.last_scan || 'Nie'}`);
      console.log(`   Konfiguration: ${JSON.stringify(source.config || {})}`);
      console.log('');
    });
    
    // 3. Teste jede Quelle einzeln
    console.log('🌐 3. Teste jede Supabase-Quelle einzeln');
    console.log('----------------------------------------');
    
    const urlResults = {
      success: 0,
      failed: 0,
      details: []
    };
    
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      console.log(`\n${i + 1}. ${source.name}`);
      console.log(`   URL: ${source.url}`);
      
      // Teste URL-Erreichbarkeit
      const urlTest = await testURL(source.url);
      
      if (urlTest.success) {
        console.log(`   ✅ URL erreichbar (${urlTest.status}) - ${urlTest.responseTime}ms`);
        urlResults.success++;
      } else {
        console.log(`   ❌ URL nicht erreichbar: ${urlTest.error}`);
        urlResults.failed++;
        urlResults.details.push({
          name: source.name,
          url: source.url,
          error: urlTest.error
        });
      }
    }
    
    // 4. Zusammenfassung
    console.log('\n📊 Supabase-Quellen URL-Test Zusammenfassung');
    console.log('--------------------------------------------');
    console.log(`Erfolgreich erreichbare URLs: ${urlResults.success}`);
    console.log(`Nicht erreichbare URLs: ${urlResults.failed}`);
    console.log(`Erfolgsrate: ${((urlResults.success / sources.length) * 100).toFixed(1)}%`);
    
    if (urlResults.details.length > 0) {
      console.log('\n❌ Nicht erreichbare Supabase-Quellen:');
      urlResults.details.forEach((detail, index) => {
        console.log(`${index + 1}. ${detail.name}`);
        console.log(`   URL: ${detail.url}`);
        console.log(`   Fehler: ${detail.error}`);
        console.log('');
      });
    }
    
    // 5. Vergleiche mit JSON-Datei
    console.log('🔍 4. Vergleiche Supabase vs JSON-Datei');
    console.log('---------------------------------------');
    
    try {
      const fs = require('fs');
      const path = require('path');
      const jsonPath = path.join(__dirname, 'src', 'data', 'foerderungen.json');
      
      if (fs.existsSync(jsonPath)) {
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const jsonPrograms = JSON.parse(jsonData);
        
        console.log(`Supabase-Quellen: ${sources.length}`);
        console.log(`JSON-Programme: ${jsonPrograms.length}`);
        console.log('');
        console.log('⚠️  WICHTIGER HINWEIS:');
        console.log('   Der Cron-Job verwendet nur die Supabase-Quellen!');
        console.log('   Die JSON-Datei wird nur für die /api/foerderungen Route verwendet.');
        console.log('   Das sind zwei verschiedene Systeme!');
      }
    } catch (error) {
      console.log('❌ Fehler beim Vergleichen mit JSON:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Fehler beim direkten Supabase-Zugriff:', error.message);
  }
}

async function testURL(url) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000
      };
      
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        
        resolve({
          success: true,
          status: res.statusCode,
          responseTime: responseTime
        });
      });
      
      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Timeout (30s)',
          responseTime: Date.now() - startTime
        });
      });
      
      req.end();
      
    } catch (error) {
      resolve({
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    }
  });
}

async function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Foerder-Test/1.0'
      },
      timeout: 30000
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
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Ausführen
if (require.main === module) {
  testCompleteCronJob().catch(console.error);
}

module.exports = { testCompleteCronJob };
