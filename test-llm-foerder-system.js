/**
 * Test Script für das LLM-basierte Fördermonitoring System
 * 
 * Testet die neue GPT-4o-mini Integration für die Analyse von Förderungswebsites
 * Endpoint: /api/foerder-scan/llm
 */

const https = require('https');
const fs = require('fs');

// Konfiguration
const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS_FILE = 'test-llm-results.json';

// Test-Utilities
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LLM-Foerder-Test-Script/1.0'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = (url.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: e.message
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

function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`[${timestamp}] ${statusIcon} ${testName} - ${status}`);
  if (details) {
    console.log(`    ${details}`);
  }
}

function saveTestResults(results) {
  try {
    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log(`\n📄 Test-Ergebnisse gespeichert in: ${TEST_RESULTS_FILE}`);
  } catch (error) {
    console.error('❌ Fehler beim Speichern der Test-Ergebnisse:', error.message);
  }
}

// Test-Funktionen
async function testLLMEndpointAvailability() {
  console.log('\n🔍 Test 1: LLM Endpoint Verfügbarkeit');
  
  try {
    const response = await makeRequest('/api/foerder-scan/llm', 'GET');
    
    if (response.statusCode === 200) {
      logTest('LLM Endpoint GET', 'PASS', 'Endpoint ist erreichbar');
      return { success: true, response };
    } else {
      logTest('LLM Endpoint GET', 'FAIL', `Status Code: ${response.statusCode}`);
      return { success: false, error: `Unexpected status code: ${response.statusCode}`, response };
    }
  } catch (error) {
    logTest('LLM Endpoint GET', 'FAIL', `Fehler: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testLLMScanExecution() {
  console.log('\n🤖 Test 2: LLM Scan Ausführung');
  
  try {
    console.log('   Starte LLM-basierten Förderung-Scan...');
    const startTime = Date.now();
    
    const response = await makeRequest('/api/foerder-scan/llm', 'POST');
    const duration = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      const data = response.body;
      
      // Validiere Response-Struktur
      const requiredFields = ['success', 'scannedPrograms', 'changesDetected', 'emailSent', 'results'];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length > 0) {
        logTest('LLM Scan Response Struktur', 'FAIL', `Fehlende Felder: ${missingFields.join(', ')}`);
        return { success: false, error: 'Invalid response structure', response };
      }
      
      logTest('LLM Scan Ausführung', 'PASS', `Dauer: ${duration}ms, Programme: ${data.scannedPrograms}, Änderungen: ${data.changesDetected}`);
      
      // Detaillierte Analyse der Ergebnisse
      if (data.results && Array.isArray(data.results)) {
        console.log(`   📊 Analysierte Programme: ${data.results.length}`);
        
        const successfulScans = data.results.filter(r => r.success).length;
        const failedScans = data.results.filter(r => !r.success).length;
        
        console.log(`   ✅ Erfolgreiche Scans: ${successfulScans}`);
        console.log(`   ❌ Fehlgeschlagene Scans: ${failedScans}`);
        
        // Zeige Details zu den ersten paar Ergebnissen
        data.results.slice(0, 3).forEach((result, index) => {
          if (result.success && result.data) {
            console.log(`   📋 Programm ${index + 1}: ${result.data.name || 'Unbekannt'}`);
            if (result.data.foerderhoehe) {
              console.log(`      💰 Förderhöhe: ${result.data.foerderhoehe}`);
            }
            if (result.data.laufzeit) {
              console.log(`      ⏰ Laufzeit: ${result.data.laufzeit}`);
            }
          }
        });
        
        // Token-Verbrauch und Kosten
        if (data.totalTokens) {
          console.log(`   🔢 Token-Verbrauch: ${data.totalTokens}`);
          console.log(`   💸 Geschätzte Kosten: €${data.estimatedCost || 'N/A'}`);
        }
      }
      
      return { success: true, response, duration };
    } else {
      logTest('LLM Scan Ausführung', 'FAIL', `Status Code: ${response.statusCode}`);
      return { success: false, error: `Unexpected status code: ${response.statusCode}`, response };
    }
  } catch (error) {
    logTest('LLM Scan Ausführung', 'FAIL', `Fehler: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testLLMDataQuality() {
  console.log('\n📊 Test 3: LLM Datenqualität');
  
  try {
    // Führe einen Scan aus und analysiere die Datenqualität
    const response = await makeRequest('/api/foerder-scan/llm', 'POST');
    
    if (response.statusCode !== 200) {
      logTest('LLM Datenqualität', 'FAIL', 'Scan fehlgeschlagen');
      return { success: false, error: 'Scan failed' };
    }
    
    const data = response.body;
    if (!data.results || !Array.isArray(data.results)) {
      logTest('LLM Datenqualität', 'FAIL', 'Keine Ergebnisse verfügbar');
      return { success: false, error: 'No results available' };
    }
    
    let qualityScore = 0;
    let totalPrograms = 0;
    const qualityMetrics = {
      hasName: 0,
      hasDescription: 0,
      hasFoerderhoehe: 0,
      hasLaufzeit: 0,
      hasVoraussetzungen: 0,
      hasValidStructure: 0
    };
    
    data.results.forEach(result => {
      if (result.success && result.data) {
        totalPrograms++;
        const programData = result.data;
        
        // Prüfe verschiedene Qualitätskriterien
        if (programData.name && programData.name.trim().length > 0) {
          qualityMetrics.hasName++;
          qualityScore += 20;
        }
        
        if (programData.beschreibung && programData.beschreibung.trim().length > 10) {
          qualityMetrics.hasDescription++;
          qualityScore += 20;
        }
        
        if (programData.foerderhoehe && programData.foerderhoehe.trim().length > 0) {
          qualityMetrics.hasFoerderhoehe++;
          qualityScore += 20;
        }
        
        if (programData.laufzeit && programData.laufzeit.trim().length > 0) {
          qualityMetrics.hasLaufzeit++;
          qualityScore += 20;
        }
        
        if (programData.voraussetzungen && Array.isArray(programData.voraussetzungen) && programData.voraussetzungen.length > 0) {
          qualityMetrics.hasVoraussetzungen++;
          qualityScore += 20;
        }
        
        // Prüfe auf gültige JSON-Struktur
        if (typeof programData === 'object' && programData !== null) {
          qualityMetrics.hasValidStructure++;
        }
      }
    });
    
    const averageQuality = totalPrograms > 0 ? qualityScore / (totalPrograms * 100) : 0;
    
    console.log(`   📈 Qualitäts-Metriken:`);
    console.log(`      Programme mit Namen: ${qualityMetrics.hasName}/${totalPrograms} (${Math.round(qualityMetrics.hasName/totalPrograms*100)}%)`);
    console.log(`      Programme mit Beschreibung: ${qualityMetrics.hasDescription}/${totalPrograms} (${Math.round(qualityMetrics.hasDescription/totalPrograms*100)}%)`);
    console.log(`      Programme mit Förderhöhe: ${qualityMetrics.hasFoerderhoehe}/${totalPrograms} (${Math.round(qualityMetrics.hasFoerderhoehe/totalPrograms*100)}%)`);
    console.log(`      Programme mit Laufzeit: ${qualityMetrics.hasLaufzeit}/${totalPrograms} (${Math.round(qualityMetrics.hasLaufzeit/totalPrograms*100)}%)`);
    console.log(`      Programme mit Voraussetzungen: ${qualityMetrics.hasVoraussetzungen}/${totalPrograms} (${Math.round(qualityMetrics.hasVoraussetzungen/totalPrograms*100)}%)`);
    
    if (averageQuality >= 0.7) {
      logTest('LLM Datenqualität', 'PASS', `Durchschnittliche Qualität: ${Math.round(averageQuality * 100)}%`);
      return { success: true, qualityScore: averageQuality, metrics: qualityMetrics };
    } else if (averageQuality >= 0.5) {
      logTest('LLM Datenqualität', 'WARN', `Durchschnittliche Qualität: ${Math.round(averageQuality * 100)}% (verbesserungswürdig)`);
      return { success: true, qualityScore: averageQuality, metrics: qualityMetrics, warning: 'Quality could be improved' };
    } else {
      logTest('LLM Datenqualität', 'FAIL', `Durchschnittliche Qualität: ${Math.round(averageQuality * 100)}% (zu niedrig)`);
      return { success: false, qualityScore: averageQuality, metrics: qualityMetrics };
    }
    
  } catch (error) {
    logTest('LLM Datenqualität', 'FAIL', `Fehler: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testErrorHandling() {
  console.log('\n🛡️ Test 4: Fehlerbehandlung');
  
  try {
    // Test mit ungültiger HTTP-Methode
    const invalidMethodResponse = await makeRequest('/api/foerder-scan/llm', 'DELETE');
    
    if (invalidMethodResponse.statusCode === 405) {
      logTest('Ungültige HTTP-Methode', 'PASS', 'Korrekte 405 Method Not Allowed Antwort');
    } else {
      logTest('Ungültige HTTP-Methode', 'FAIL', `Erwartete 405, erhielt ${invalidMethodResponse.statusCode}`);
    }
    
    return { success: true };
  } catch (error) {
    logTest('Fehlerbehandlung', 'FAIL', `Fehler: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPerformanceMetrics() {
  console.log('\n⚡ Test 5: Performance-Metriken');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('/api/foerder-scan/llm', 'POST');
    const totalDuration = Date.now() - startTime;
    
    if (response.statusCode === 200) {
      const data = response.body;
      const programsScanned = data.scannedPrograms || 0;
      const avgTimePerProgram = programsScanned > 0 ? totalDuration / programsScanned : 0;
      
      console.log(`   ⏱️ Gesamt-Scan-Zeit: ${totalDuration}ms`);
      console.log(`   📊 Programme gescannt: ${programsScanned}`);
      console.log(`   ⚡ Durchschnitt pro Programm: ${Math.round(avgTimePerProgram)}ms`);
      
      // Performance-Bewertung
      if (totalDuration < 60000) { // unter 1 Minute
        logTest('Performance', 'PASS', `Scan abgeschlossen in ${totalDuration}ms`);
      } else if (totalDuration < 120000) { // unter 2 Minuten
        logTest('Performance', 'WARN', `Scan dauerte ${totalDuration}ms (langsam)`);
      } else {
        logTest('Performance', 'FAIL', `Scan dauerte ${totalDuration}ms (zu langsam)`);
      }
      
      return { 
        success: true, 
        totalDuration, 
        programsScanned, 
        avgTimePerProgram 
      };
    } else {
      logTest('Performance', 'FAIL', 'Scan fehlgeschlagen');
      return { success: false, error: 'Scan failed' };
    }
  } catch (error) {
    logTest('Performance', 'FAIL', `Fehler: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Haupt-Test-Funktion
async function runAllTests() {
  console.log('🚀 LLM-Fördermonitoring System Test Suite');
  console.log('==========================================');
  console.log(`Ziel-URL: ${BASE_URL}`);
  console.log(`Startzeit: ${new Date().toISOString()}\n`);
  
  const testResults = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    tests: {}
  };
  
  // Test 1: Endpoint Verfügbarkeit
  testResults.tests.availability = await testLLMEndpointAvailability();
  
  // Test 2: LLM Scan Ausführung
  testResults.tests.execution = await testLLMScanExecution();
  
  // Test 3: Datenqualität (nur wenn Scan erfolgreich)
  if (testResults.tests.execution.success) {
    testResults.tests.dataQuality = await testLLMDataQuality();
  }
  
  // Test 4: Fehlerbehandlung
  testResults.tests.errorHandling = await testErrorHandling();
  
  // Test 5: Performance
  testResults.tests.performance = await testPerformanceMetrics();
  
  // Zusammenfassung
  console.log('\n📋 Test-Zusammenfassung');
  console.log('=======================');
  
  const totalTests = Object.keys(testResults.tests).length;
  const passedTests = Object.values(testResults.tests).filter(test => test.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`✅ Erfolgreich: ${passedTests}/${totalTests}`);
  console.log(`❌ Fehlgeschlagen: ${failedTests}/${totalTests}`);
  console.log(`📊 Erfolgsrate: ${Math.round(passedTests/totalTests*100)}%`);
  
  testResults.summary = {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: passedTests/totalTests
  };
  
  // Empfehlungen
  console.log('\n💡 Empfehlungen:');
  if (failedTests === 0) {
    console.log('   🎉 Alle Tests bestanden! Das LLM-System ist einsatzbereit.');
  } else {
    console.log('   ⚠️ Einige Tests sind fehlgeschlagen. Bitte überprüfen Sie:');
    if (!testResults.tests.availability?.success) {
      console.log('     - Server-Verfügbarkeit und Netzwerkverbindung');
    }
    if (!testResults.tests.execution?.success) {
      console.log('     - OpenAI API-Konfiguration und Umgebungsvariablen');
    }
    if (!testResults.tests.dataQuality?.success) {
      console.log('     - LLM-Prompts und Datenextraktion');
    }
  }
  
  // Speichere Ergebnisse
  saveTestResults(testResults);
  
  console.log(`\n🏁 Test-Suite abgeschlossen um ${new Date().toISOString()}`);
  
  return testResults;
}

// Führe Tests aus, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Kritischer Fehler in der Test-Suite:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testLLMEndpointAvailability,
  testLLMScanExecution,
  testLLMDataQuality,
  testErrorHandling,
  testPerformanceMetrics
};
