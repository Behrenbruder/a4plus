const { sendFoerderConflictNotificationEmail, sendFoerderScanSummaryEmail, EMAIL_CONFIG } = require('./src/lib/foerder-email-notifications.ts');

// Test-Daten für Förder-Scan Ergebnis
const testScanResult = {
  id: 'test-scan-001',
  user_email: 'test@example.com',
  user_name: 'Test Benutzer',
  scan_type: 'Automatischer Scan',
  total_programs: 5,
  conflicts_found: 2,
  conflicts: [
    {
      conflictType: 'Förderbeträge unterschiedlich',
      severity: 'HIGH',
      confidence: 0.95,
      summary: 'Test-Konflikt für E-Mail-Konfiguration',
      ruleBasedAnalysis: {
        summary: 'Regel-basierte Analyse ergab Unterschiede in den Förderbeträgen'
      },
      aiAnalysis: {
        explanation: 'KI-Analyse zeigt signifikante Unterschiede zwischen den Programmen',
        recommendation: 'Überprüfung der Förderbedingungen empfohlen',
        keyDifferences: [
          'Unterschiedliche Förderhöhen',
          'Verschiedene Antragsfristen'
        ],
        confidence: 0.95
      }
    },
    {
      conflictType: 'Antragsfristen überschneiden sich',
      severity: 'MEDIUM',
      confidence: 0.78,
      summary: 'Zweiter Test-Konflikt',
      ruleBasedAnalysis: {
        summary: 'Überschneidende Antragsfristen erkannt'
      },
      aiAnalysis: {
        explanation: 'Zeitliche Konflikte zwischen verschiedenen Förderprogrammen',
        recommendation: 'Priorisierung der Anträge erforderlich',
        keyDifferences: [
          'Überschneidende Zeiträume',
          'Konkurrierende Programme'
        ],
        confidence: 0.78
      }
    }
  ],
  programs: [
    {
      program: {
        name: 'Test Förderprogramm 1',
        amount: 5000,
        deadline: '2025-12-31'
      },
      source: 'Test-Quelle'
    }
  ],
  created_at: new Date().toISOString()
};

async function testEmailConfiguration() {
  console.log('🧪 Test der Förder-E-Mail-Konfiguration');
  console.log('=====================================');
  
  // E-Mail-Konfiguration anzeigen
  console.log('\n📧 Aktuelle E-Mail-Konfiguration:');
  console.log('Von:', process.env.SMTP_FROM || 'info@a4plus.eu');
  console.log('An:', process.env.FOERDER_REVIEW_EMAIL || process.env.NOTIFICATION_EMAIL || 's.behr@a4plus.eu');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('E-Mail Service aktiviert:', process.env.EMAIL_SERVICE_ENABLED);
  
  console.log('\n🔍 Test 1: Förder-Konflikt Benachrichtigung');
  console.log('--------------------------------------------');
  
  try {
    await sendFoerderConflictNotificationEmail(testScanResult);
    console.log('✅ Förder-Konflikt E-Mail erfolgreich gesendet');
  } catch (error) {
    console.error('❌ Fehler beim Senden der Förder-Konflikt E-Mail:', error.message);
  }
  
  console.log('\n🔍 Test 2: Förder-Scan Zusammenfassung');
  console.log('--------------------------------------');
  
  try {
    await sendFoerderScanSummaryEmail(testScanResult);
    console.log('✅ Förder-Scan Zusammenfassung E-Mail erfolgreich gesendet');
  } catch (error) {
    console.error('❌ Fehler beim Senden der Förder-Scan Zusammenfassung:', error.message);
  }
  
  console.log('\n🔍 Test 3: E-Mail ohne Konflikte');
  console.log('--------------------------------');
  
  const noConflictResult = {
    ...testScanResult,
    conflicts_found: 0,
    conflicts: []
  };
  
  try {
    await sendFoerderScanSummaryEmail(noConflictResult);
    console.log('✅ E-Mail ohne Konflikte erfolgreich gesendet');
  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mail ohne Konflikte:', error.message);
  }
  
  console.log('\n✅ E-Mail-Konfiguration Test abgeschlossen');
  console.log('==========================================');
  console.log('Alle Förder-Check E-Mails werden jetzt an s.behr@a4plus.eu gesendet');
  console.log('SMTP-Versand über info@a4plus.eu (IONOS) ist konfiguriert');
}

// Test ausführen
if (require.main === module) {
  // Umgebungsvariablen laden
  require('dotenv').config({ path: '.env.local' });
  
  testEmailConfiguration().catch(console.error);
}

module.exports = { testEmailConfiguration };
