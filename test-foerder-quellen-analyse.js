// Analyse aller Förderungsquellen aus der JSON-Datei
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('🔍 Förderungsquellen Analyse');
console.log('============================');
console.log(`Zeitpunkt: ${new Date().toLocaleString('de-DE')}`);
console.log('');

async function analyzeFoerderQuellen() {
  try {
    // 1. Lade Förderungsquellen aus JSON-Datei
    console.log('📋 1. Förderungsquellen aus JSON-Datei laden');
    console.log('---------------------------------------------');
    
    const jsonPath = path.join(__dirname, 'src', 'data', 'foerderungen.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log(`❌ JSON-Datei nicht gefunden: ${jsonPath}`);
      return;
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const foerderungen = JSON.parse(jsonData);
    
    console.log(`✅ ${foerderungen.length} Förderungsprogramme aus JSON geladen`);
    console.log('');
    
    // 2. Analysiere alle Programme
    console.log('📊 2. Programme-Übersicht');
    console.log('-------------------------');
    
    const bundesPrograms = foerderungen.filter(p => p.level === 'BUND');
    const landPrograms = foerderungen.filter(p => p.level === 'LAND');
    
    console.log(`Bundesweite Programme: ${bundesPrograms.length}`);
    console.log(`Landes-Programme: ${landPrograms.length}`);
    console.log('');
    
    // Kategorien analysieren
    const allCategories = new Set();
    const categoryCount = {};
    
    foerderungen.forEach(p => {
      p.categories.forEach(cat => {
        allCategories.add(cat);
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });
    
    console.log('📈 Programme nach Kategorien:');
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} Programme`);
      });
    console.log('');
    
    // 3. Teste alle URLs
    console.log('🌐 3. URL-Tests für alle Programme');
    console.log('----------------------------------');
    
    const urlResults = {
      success: 0,
      failed: 0,
      details: []
    };
    
    for (let i = 0; i < foerderungen.length; i++) {
      const program = foerderungen[i];
      console.log(`\n${i + 1}. ${program.name}`);
      console.log(`   ID: ${program.id}`);
      console.log(`   Level: ${program.level}`);
      console.log(`   Kategorien: ${program.categories.join(', ')}`);
      console.log(`   URL: ${program.url}`);
      
      // Teste URL
      const urlTest = await testURL(program.url);
      
      if (urlTest.success) {
        console.log(`   ✅ URL erreichbar (${urlTest.status}) - ${urlTest.responseTime}ms`);
        urlResults.success++;
      } else {
        console.log(`   ❌ URL nicht erreichbar: ${urlTest.error}`);
        urlResults.failed++;
        urlResults.details.push({
          id: program.id,
          name: program.name,
          url: program.url,
          error: urlTest.error
        });
      }
    }
    
    // 4. Detaillierte Auflistung nach Level
    console.log('\n📋 4. Detaillierte Auflistung');
    console.log('-----------------------------');
    
    console.log('\n🏛️  BUNDESWEITE PROGRAMME:');
    bundesPrograms.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Typ: ${p.type}`);
      console.log(`   Kategorien: ${p.categories.join(', ')}`);
      console.log(`   Zielgruppe: ${p.target}`);
      console.log(`   Behörde: ${p.authority}`);
      console.log(`   URL: ${p.url}`);
      console.log('');
    });
    
    console.log('\n🏢 LANDES-PROGRAMME:');
    landPrograms.forEach((p, index) => {
      const regions = p.regions ? p.regions.map(r => r.bundesland).join(', ') : 'Nicht spezifiziert';
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Typ: ${p.type}`);
      console.log(`   Kategorien: ${p.categories.join(', ')}`);
      console.log(`   Zielgruppe: ${p.target}`);
      console.log(`   Bundesländer: ${regions}`);
      console.log(`   Behörde: ${p.authority}`);
      console.log(`   URL: ${p.url}`);
      console.log('');
    });
    
    // 5. Zusammenfassung der URL-Tests
    console.log('\n📊 5. URL-Test Zusammenfassung');
    console.log('------------------------------');
    console.log(`Erfolgreich erreichbare URLs: ${urlResults.success}`);
    console.log(`Nicht erreichbare URLs: ${urlResults.failed}`);
    console.log(`Erfolgsrate: ${((urlResults.success / foerderungen.length) * 100).toFixed(1)}%`);
    
    if (urlResults.details.length > 0) {
      console.log('\n❌ Nicht erreichbare Programme:');
      urlResults.details.forEach((detail, index) => {
        console.log(`${index + 1}. ${detail.name} (${detail.id})`);
        console.log(`   URL: ${detail.url}`);
        console.log(`   Fehler: ${detail.error}`);
        console.log('');
      });
    }
    
    // 6. Teste Förder-Scan API
    console.log('\n🔄 6. Teste Förder-Scan API');
    console.log('---------------------------');
    
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://a4plus.eu';
      console.log(`API-URL: ${BASE_URL}/api/foerder-scan`);
      
      const scanResponse = await makeRequest(`${BASE_URL}/api/foerder-scan`, 'GET');
      
      if (scanResponse.status === 200) {
        console.log('✅ Förder-Scan API erreichbar');
        console.log(`Response: ${JSON.stringify(scanResponse.data, null, 2)}`);
      } else {
        console.log(`⚠️  Förder-Scan API Status: ${scanResponse.status}`);
        console.log(`Response: ${JSON.stringify(scanResponse.data)}`);
      }
    } catch (error) {
      console.log(`❌ Fehler beim Testen der Förder-Scan API: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der Analyse:', error.message);
  }
  
  console.log('\n✅ Analyse abgeschlossen');
  console.log('========================');
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
      timeout: 15000
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
  analyzeFoerderQuellen().catch(console.error);
}

module.exports = { analyzeFoerderQuellen };
