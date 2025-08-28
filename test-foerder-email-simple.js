// Einfacher Test für die Förder-E-Mail-Konfiguration
require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

// SMTP-Transporter konfigurieren (gleiche Konfiguration wie in email-service.ts)
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

async function testFoerderEmailConfiguration() {
  console.log('🧪 Test der Förder-E-Mail-Konfiguration');
  console.log('=====================================');
  
  // E-Mail-Konfiguration anzeigen
  console.log('\n📧 Aktuelle E-Mail-Konfiguration:');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('Von (SMTP_FROM):', process.env.SMTP_FROM);
  console.log('An (FOERDER_REVIEW_EMAIL):', process.env.FOERDER_REVIEW_EMAIL);
  console.log('Fallback (NOTIFICATION_EMAIL):', process.env.NOTIFICATION_EMAIL);
  console.log('E-Mail Service aktiviert:', process.env.EMAIL_SERVICE_ENABLED);
  
  // Ziel-E-Mail bestimmen
  const targetEmail = process.env.FOERDER_REVIEW_EMAIL || process.env.NOTIFICATION_EMAIL || 's.behr@a4plus.eu';
  const fromEmail = process.env.SMTP_FROM || 'info@a4plus.eu';
  
  console.log('\n🎯 Finale Konfiguration:');
  console.log('Von:', fromEmail);
  console.log('An:', targetEmail);
  
  // SMTP-Verbindung testen
  console.log('\n🔍 Test 1: SMTP-Verbindung');
  console.log('---------------------------');
  
  try {
    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich');
  } catch (error) {
    console.error('❌ SMTP-Verbindung fehlgeschlagen:', error.message);
    return;
  }
  
  // Test-E-Mail senden (nur wenn E-Mail-Service aktiviert ist)
  if (process.env.EMAIL_SERVICE_ENABLED === 'true') {
    console.log('\n🔍 Test 2: Förder-Check Test-E-Mail senden');
    console.log('-------------------------------------------');
    
    const testEmailOptions = {
      from: fromEmail,
      to: targetEmail,
      subject: '🧪 Test: Förder-Check E-Mail-Konfiguration',
      text: `
Test der Förder-Check E-Mail-Konfiguration

Diese Test-E-Mail bestätigt, dass die Förder-Check E-Mails korrekt konfiguriert sind:

✅ SMTP-Server: ${process.env.SMTP_HOST}
✅ Von: ${fromEmail}  
✅ An: ${targetEmail}
✅ Zeitpunkt: ${new Date().toLocaleString('de-DE')}

Die Förder-Check E-Mails werden jetzt über SMTP (nicht mehr Mailjet) an s.behr@a4plus.eu gesendet.

---
A4Plus Förder-Monitoring System
Automatisch generiert am ${new Date().toLocaleString('de-DE')}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #10b981; margin-bottom: 10px;">
                🧪 Test: Förder-Check E-Mail-Konfiguration
              </h1>
              <p style="color: #6b7280; font-size: 16px; margin: 0;">
                Konfiguration erfolgreich getestet
              </p>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #059669; margin-top: 0;">✅ Konfiguration bestätigt</h2>
              <p><strong>SMTP-Server:</strong> ${process.env.SMTP_HOST}</p>
              <p><strong>Von:</strong> ${fromEmail}</p>
              <p><strong>An:</strong> ${targetEmail}</p>
              <p><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE')}</p>
            </div>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
              <h3 style="color: #0369a1; margin-top: 0;">📧 Wichtige Änderung</h3>
              <p style="margin: 0;">
                Die Förder-Check E-Mails werden jetzt über <strong>SMTP</strong> (nicht mehr Mailjet) 
                an <strong>s.behr@a4plus.eu</strong> gesendet.
              </p>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              A4Plus Förder-Monitoring System<br>
              Automatisch generiert am ${new Date().toLocaleString('de-DE')}
            </div>
          </div>
        </div>
      `
    };
    
    try {
      const info = await transporter.sendMail(testEmailOptions);
      console.log('✅ Test-E-Mail erfolgreich gesendet');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 An:', targetEmail);
    } catch (error) {
      console.error('❌ Fehler beim Senden der Test-E-Mail:', error.message);
    }
  } else {
    console.log('\n⚠️  E-Mail-Service ist deaktiviert (EMAIL_SERVICE_ENABLED=false)');
    console.log('Test-E-Mail wird nicht gesendet, aber Konfiguration ist korrekt.');
  }
  
  console.log('\n✅ Förder-E-Mail-Konfiguration Test abgeschlossen');
  console.log('=================================================');
  console.log('📋 Zusammenfassung der Änderungen:');
  console.log('• E-Mails werden über SMTP (IONOS) gesendet, nicht mehr über Mailjet');
  console.log('• Absender: info@a4plus.eu');
  console.log('• Empfänger für Förder-Checks: s.behr@a4plus.eu');
  console.log('• Konfiguration über FOERDER_REVIEW_EMAIL Umgebungsvariable');
}

// Test ausführen
testFoerderEmailConfiguration().catch(console.error);
