/**
 * End-to-End Test für das Hybrid Förder-Monitoring System mit GPT-4o Mini
 * 
 * Testet:
 * - AI Conflict Analyzer
 * - Hybrid Conflict Detector
 * - Enhanced Email Notifications
 * - Integration mit Förder-Scan API
 */

const { aiConflictAnalyzer } = require('./src/lib/ai-conflict-analyzer');
const { hybridConflictDetector } = require('./src/lib/hybrid-conflict-detector');
const { sendFoerderConflictNotificationEmail, sendFoerderScanSummaryEmail } = require('./src/lib/foerder-email-notifications');

// Test-Daten für Förderprogramme
const testPrograms = {
  solarBund: {
    id: 'test-solar-bund',
    level: 'BUND',
    name: 'Bundesförderung für Solaranlagen',
    categories: ['Solar', 'Erneuerbare Energien'],
    target: 'PRIVAT',
    type: 'ZUSCHUSS',
    summary: 'Förderung für private Solaranlagen',
    amount: 'bis zu 10.000€',
    criteria: 'Mindestleistung 5 kWp',
    validity: '2024-2025',
    authority: 'BAFA',
    url: 'https://bafa.de/solar',
    regions: [{ bundesland: 'Deutschland' }]
  },
  
  solarLand: {
    id: 'test-solar-land',
    level: 'LAND',
    name: 'Landesförderung Solarenergie',
    categories: ['Solar', 'Photovoltaik'],
    target: 'PRIVAT',
    type: 'ZUSCHUSS',
    summary: 'Landesweite Solarförderung',
    amount: 'maximal 8.000€',
    criteria: 'Mindestleistung 3 kWp',
    validity: '2024',
    authority: 'Landesregierung',
    url: 'https://land.de/solar',
    regions: [{ bundesland: 'Bayern' }]
  },
  
  identicalProgram1: {
    id: 'test-identical-1',
    level: 'BUND',
    name: 'KfW Förderung Erneuerbare Energien',
    categories: ['Solar', 'Erneuerbare Energien'],
    target: 'PRIVAT',
    type: 'KREDIT',
    summary: 'Günstige Kredite für erneuerbare Energien',
    amount: 'bis zu 50.000€',
    criteria: 'Energieeffizienz-Standard',
    validity: '2024-2026',
    authority: 'KfW',
    url: 'https://kfw.de/270',
    regions: [{ bundesland: 'Deutschland' }]
  },
  
  identicalProgram2: {
    id: 'test-identical-2',
    level: 'BUND',
    name: 'KfW Förderung Erneuerbare Energien',
    categories: ['Solar', 'Erneuerbare Energien'],
    target: 'PRIVAT',
    type: 'KREDIT',
    summary: 'Günstige Kredite für erneuerbare Energien',
    amount: 'bis zu 75.000€', // Unterschiedlicher Betrag!
    criteria: 'Energieeffizienz-Standard',
    validity: '2024-2025', // Unterschiedliche Gültigkeit!
    authority: 'KfW',
    url: 'https://kfw.de/270',
    regions: [{ bundesland: 'Deutschland' }]
  }
};

/**
 * Test 1: AI Conflict Analyzer Verbindungstest
 */
async function testAIConnection() {
  console.log('\n🔍 Test 1: AI Conflict Analyzer Verbindungstest');
  console.log('='.repeat(50));
  
  try {
    const isConnected = await aiConflictAnalyzer.testConnection();
    
    if (isConnected) {
      console.log('✅ AI-Verbindung erfolgreich');
      console.log(`📊 KI-Analyse aktiviert: ${aiConflictAnalyzer.isEnabled()}`);
    } else {
      console.log('❌ AI-Verbindung fehlgeschlagen');
      console.log('ℹ️  Überprüfen Sie OPENAI_API_KEY und AI_CONFLICT_ANALYSIS_ENABLED');
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ Fehler beim AI-Verbindungstest:', error.message);
    return false;
  }
}

/**
 * Test 2: Einzelne AI-Konflikt-Analyse
 */
async function testSingleAIAnalysis() {
  console.log('\n🤖 Test 2: Einzelne AI-Konflikt-Analyse');
  console.log('='.repeat(50));
  
  try {
    const analysis = await aiConflictAnalyzer.analyzeConflict(
      testPrograms.identicalProgram1,
      testPrograms.identicalProgram2,
      'Test-Quelle-1',
      'Test-Quelle-2'
    );
    
    if (analysis) {
      console.log('✅ AI-Analyse erfolgreich');
      console.log(`🔍 Konflikt erkannt: ${analysis.hasConflict}`);
      console.log(`📊 Konflikt-Typ: ${analysis.conflictType}`);
      console.log(`⚡ Schweregrad: ${analysis.severity}`);
      console.log(`🎯 Konfidenz: ${(analysis.confidence * 100).toFixed(1)}%`);
      console.log(`💡 Erklärung: ${analysis.explanation}`);
      console.log(`🔧 Empfehlung: ${analysis.recommendation}`);
      
      if (analysis.keyDifferences.length > 0) {
        console.log('📋 Wichtige Unterschiede:');
        analysis.keyDifferences.forEach((diff, index) => {
          console.log(`   ${index + 1}. ${diff}`);
        });
      }
    } else {
      console.log('❌ AI-Analyse nicht verfügbar');
    }
    
    return analysis;
  } catch (error) {
    console.error('❌ Fehler bei AI-Analyse:', error.message);
    return null;
  }
}

/**
 * Test 3: Hybrid Conflict Detection
 */
async function testHybridDetection() {
  console.log('\n⚙️ Test 3: Hybrid Conflict Detection');
  console.log('='.repeat(50));
  
  const testCases = [
    {
      name: 'Ähnliche Programme (verschiedene Beträge)',
      programA: testPrograms.solarBund,
      programB: testPrograms.solarLand,
      sourceA: 'BAFA-Website',
      sourceB: 'Landesportal'
    },
    {
      name: 'Identische Programme (Konflikt erwartet)',
      programA: testPrograms.identicalProgram1,
      programB: testPrograms.identicalProgram2,
      sourceA: 'KfW-Portal-Alt',
      sourceB: 'KfW-Portal-Neu'
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Teste: ${testCase.name}`);
    console.log('-'.repeat(30));
    
    try {
      const result = await hybridConflictDetector.detectConflict(
        testCase.programA,
        testCase.programB,
        testCase.sourceA,
        testCase.sourceB
      );
      
      console.log(`✅ Hybrid-Analyse abgeschlossen`);
      console.log(`🚨 Konflikt erkannt: ${result.hasConflict}`);
      console.log(`📊 Konflikt-Typ: ${result.conflictType}`);
      console.log(`⚡ Schweregrad: ${result.severity}`);
      
      if (result.confidence) {
        console.log(`🎯 KI-Konfidenz: ${(result.confidence * 100).toFixed(1)}%`);
      }
      
      console.log(`⚙️ Regel-basiert: ${result.ruleBasedAnalysis.summary}`);
      
      if (result.aiAnalysis) {
        console.log(`🤖 KI-Analyse: ${result.aiAnalysis.explanation}`);
        console.log(`💡 KI-Empfehlung: ${result.aiAnalysis.recommendation}`);
      } else {
        console.log(`🤖 KI-Analyse: Nicht verfügbar`);
      }
      
      results.push({
        testCase: testCase.name,
        result
      });
      
    } catch (error) {
      console.error(`❌ Fehler bei ${testCase.name}:`, error.message);
    }
  }
  
  return results;
}

/**
 * Test 4: Enhanced Email Notifications
 */
async function testEmailNotifications(hybridResults) {
  console.log('\n📧 Test 4: Enhanced Email Notifications');
  console.log('='.repeat(50));
  
  // Erstelle Mock-Scan-Ergebnis
  const mockScanResult = {
    id: 'test-scan-' + Date.now(),
    user_email: 'test@example.com',
    user_name: 'Test User',
    scan_type: 'Hybrid AI Test',
    total_programs: 4,
    conflicts_found: hybridResults.filter(r => r.result.hasConflict).length,
    conflicts: hybridResults.map(r => r.result),
    programs: [
      { program: testPrograms.solarBund, source: 'BAFA-Website' },
      { program: testPrograms.solarLand, source: 'Landesportal' },
      { program: testPrograms.identicalProgram1, source: 'KfW-Portal-Alt' },
      { program: testPrograms.identicalProgram2, source: 'KfW-Portal-Neu' }
    ],
    created_at: new Date().toISOString()
  };
  
  try {
    // Test Konflikt-Benachrichtigung
    if (mockScanResult.conflicts_found > 0) {
      console.log('📧 Sende Konflikt-Benachrichtigung...');
      await sendFoerderConflictNotificationEmail(mockScanResult);
      console.log('✅ Konflikt-Benachrichtigung gesendet');
    }
    
    // Test Scan-Zusammenfassung
    console.log('📧 Sende Scan-Zusammenfassung...');
    await sendFoerderScanSummaryEmail(mockScanResult);
    console.log('✅ Scan-Zusammenfassung gesendet');
    
    return true;
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error.message);
    return false;
  }
}

/**
 * Test 5: Performance und Kosten-Analyse
 */
async function testPerformanceAndCosts() {
  console.log('\n⚡ Test 5: Performance und Kosten-Analyse');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  let aiCallsCount = 0;
  
  // Simuliere mehrere Konflikt-Erkennungen
  const testPairs = [
    [testPrograms.solarBund, testPrograms.solarLand],
    [testPrograms.identicalProgram1, testPrograms.identicalProgram2],
    [testPrograms.solarBund, testPrograms.identicalProgram1]
  ];
  
  console.log(`🔍 Teste ${testPairs.length} Programm-Paare...`);
  
  for (let i = 0; i < testPairs.length; i++) {
    const [programA, programB] = testPairs[i];
    
    try {
      const result = await hybridConflictDetector.detectConflict(
        programA,
        programB,
        `Quelle-A-${i}`,
        `Quelle-B-${i}`
      );
      
      if (result.aiAnalysis) {
        aiCallsCount++;
      }
      
      console.log(`✅ Paar ${i + 1}: ${result.hasConflict ? 'Konflikt' : 'OK'} (${result.aiAnalysis ? 'mit KI' : 'nur Regeln'})`);
      
    } catch (error) {
      console.error(`❌ Fehler bei Paar ${i + 1}:`, error.message);
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n📊 Performance-Statistiken:');
  console.log(`⏱️  Gesamtdauer: ${duration}ms`);
  console.log(`🤖 KI-Aufrufe: ${aiCallsCount}`);
  console.log(`⚡ Durchschnitt pro Paar: ${Math.round(duration / testPairs.length)}ms`);
  
  // Geschätzte Kosten (GPT-4o Mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens)
  const estimatedInputTokens = aiCallsCount * 1000; // Geschätzt 1000 Tokens pro Aufruf
  const estimatedOutputTokens = aiCallsCount * 200; // Geschätzt 200 Tokens pro Antwort
  const estimatedCostUSD = (estimatedInputTokens * 0.15 / 1000000) + (estimatedOutputTokens * 0.60 / 1000000);
  
  console.log(`💰 Geschätzte Kosten: $${estimatedCostUSD.toFixed(6)} USD`);
  console.log(`💰 Hochgerechnet (1000 Scans): $${(estimatedCostUSD * 1000).toFixed(4)} USD`);
  
  return {
    duration,
    aiCallsCount,
    estimatedCostUSD
  };
}

/**
 * Haupttest-Funktion
 */
async function runAllTests() {
  console.log('🚀 Hybrid Förder-Monitoring System - End-to-End Test');
  console.log('='.repeat(60));
  console.log(`📅 Gestartet am: ${new Date().toLocaleString('de-DE')}`);
  
  const results = {
    aiConnection: false,
    aiAnalysis: null,
    hybridResults: [],
    emailSent: false,
    performance: null
  };
  
  try {
    // Test 1: AI-Verbindung
    results.aiConnection = await testAIConnection();
    
    // Test 2: Einzelne AI-Analyse (nur wenn Verbindung OK)
    if (results.aiConnection) {
      results.aiAnalysis = await testSingleAIAnalysis();
    }
    
    // Test 3: Hybrid Detection
    results.hybridResults = await testHybridDetection();
    
    // Test 4: Email Notifications
    results.emailSent = await testEmailNotifications(results.hybridResults);
    
    // Test 5: Performance
    results.performance = await testPerformanceAndCosts();
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error);
  }
  
  // Zusammenfassung
  console.log('\n📋 TEST-ZUSAMMENFASSUNG');
  console.log('='.repeat(60));
  console.log(`🔗 AI-Verbindung: ${results.aiConnection ? '✅ OK' : '❌ Fehler'}`);
  console.log(`🤖 AI-Analyse: ${results.aiAnalysis ? '✅ OK' : '❌ Fehler'}`);
  console.log(`⚙️  Hybrid-Tests: ${results.hybridResults.length} durchgeführt`);
  console.log(`📧 E-Mail-Versand: ${results.emailSent ? '✅ OK' : '❌ Fehler'}`);
  
  if (results.performance) {
    console.log(`⚡ Performance: ${results.performance.duration}ms für ${results.performance.aiCallsCount} KI-Aufrufe`);
    console.log(`💰 Geschätzte Kosten: $${results.performance.estimatedCostUSD.toFixed(6)} USD`);
  }
  
  const conflictsFound = results.hybridResults.filter(r => r.result.hasConflict).length;
  console.log(`🚨 Konflikte gefunden: ${conflictsFound}/${results.hybridResults.length}`);
  
  console.log('\n🎉 Test abgeschlossen!');
  console.log(`📅 Beendet am: ${new Date().toLocaleString('de-DE')}`);
  
  return results;
}

// Test ausführen, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testAIConnection,
  testSingleAIAnalysis,
  testHybridDetection,
  testEmailNotifications,
  testPerformanceAndCosts
};
