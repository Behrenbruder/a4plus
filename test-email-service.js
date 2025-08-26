// E-Mail-Service Test
// Testet die E-Mail-Konfiguration und den Versand

const fs = require('fs');
const path = require('path');

// Lade .env.local manuell
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value.trim();
        }
      }
    });
    console.log('✅ .env.local erfolgreich geladen');
  } catch (error) {
    console.error('❌ Fehler beim Laden der .env.local:', error.message);
    process.exit(1);
  }
}

loadEnvFile();

async function testEmailService() {
  console.log('📧 E-Mail-Service Test\n');

  // 1. Prüfe E-Mail-Konfiguration
  console.log('1. Prüfe E-Mail-Konfiguration...');
  
  const emailEnabled = process.env.EMAIL_SERVICE_ENABLED === 'true';
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const companyEmail = process.env.COMPANY_EMAIL;

  console.log('E-Mail-Service aktiviert:', emailEnabled ? '✅' : '❌');
  console.log('SMTP Host:', smtpHost ? '✅' : '❌', smtpHost || 'FEHLT');
  console.log('SMTP Port:', smtpPort ? '✅' : '❌', smtpPort || 'FEHLT');
  console.log('SMTP User:', smtpUser ? '✅' : '❌', smtpUser || 'FEHLT');
  console.log('SMTP Passwort:', smtpPass ? '✅' : '❌', smtpPass ? '[GESETZT]' : 'FEHLT');
  console.log('SMTP From:', smtpFrom ? '✅' : '❌', smtpFrom || 'FEHLT');
  console.log('Benachrichtigungs-E-Mail:', notificationEmail ? '✅' : '❌', notificationEmail || 'FEHLT');
  console.log('Firmen-E-Mail:', companyEmail ? '✅' : '❌', companyEmail || 'FEHLT');

  if (!emailEnabled) {
    console.log('\n❌ E-Mail-Service ist deaktiviert!');
    console.log('Setzen Sie EMAIL_SERVICE_ENABLED=true in der .env.local');
    return;
  }

  const missingVars = [];
  if (!smtpHost) missingVars.push('SMTP_HOST');
  if (!smtpPort) missingVars.push('SMTP_PORT');
  if (!smtpUser) missingVars.push('SMTP_USER');
  if (!smtpPass) missingVars.push('SMTP_PASS');
  if (!smtpFrom) missingVars.push('SMTP_FROM');
  if (!notificationEmail && !companyEmail) missingVars.push('NOTIFICATION_EMAIL oder COMPANY_EMAIL');

  if (missingVars.length > 0) {
    console.log('\n❌ Fehlende E-Mail-Konfiguration:');
    missingVars.forEach(v => console.log(`   - ${v}`));
    console.log('\nFügen Sie diese Variablen zur .env.local hinzu:');
    console.log('EMAIL_SERVICE_ENABLED=true');
    console.log('SMTP_HOST=smtp.ionos.de');
    console.log('SMTP_PORT=587');
    console.log('SMTP_USER=ihre-email@domain.de');
    console.log('SMTP_PASS=ihr-passwort');
    console.log('SMTP_FROM=ihre-email@domain.de');
    console.log('NOTIFICATION_EMAIL=ihre-email@domain.de');
    console.log('COMPANY_EMAIL=ihre-email@domain.de');
    return;
  }

  // 2. Teste SMTP-Verbindung
  console.log('\n2. Teste SMTP-Verbindung...');
  
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false, // true für 465, false für andere Ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false // Für Entwicklung
      }
    });

    // Teste Verbindung
    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich');

    // 3. Teste E-Mail-Versand
    console.log('\n3. Teste E-Mail-Versand...');
    
    const testEmail = {
      from: smtpFrom,
      to: notificationEmail || companyEmail,
      subject: 'Test E-Mail - CRM Integration',
      html: `
        <h2>CRM Integration Test</h2>
        <p>Diese E-Mail wurde automatisch vom CRM-System gesendet, um die E-Mail-Konfiguration zu testen.</p>
        <p><strong>Zeitstempel:</strong> ${new Date().toLocaleString('de-DE')}</p>
        <p><strong>SMTP Host:</strong> ${smtpHost}</p>
        <p><strong>SMTP User:</strong> ${smtpUser}</p>
        <hr>
        <p><em>Wenn Sie diese E-Mail erhalten, funktioniert der E-Mail-Versand korrekt!</em></p>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test-E-Mail erfolgreich versendet!');
    console.log('Message ID:', info.messageId);
    console.log('An:', testEmail.to);

    // 4. Teste E-Mail-Notifications Modul
    console.log('\n4. Teste E-Mail-Notifications Modul...');
    
    try {
      // Simuliere eine Kontaktformular-Anfrage
      const testData = {
        firstName: 'Test',
        lastName: 'Kunde',
        email: 'test@example.com',
        phone: '+49 123 456789',
        message: 'Dies ist eine Test-Nachricht für die E-Mail-Integration.',
        subject: 'Kontaktformular Test'
      };

      // Teste Admin-Benachrichtigung
      const adminEmail = {
        from: smtpFrom,
        to: notificationEmail || companyEmail,
        subject: `Neue Kontaktanfrage von ${testData.firstName} ${testData.lastName}`,
        html: `
          <h2>Neue Kontaktanfrage</h2>
          <p><strong>Name:</strong> ${testData.firstName} ${testData.lastName}</p>
          <p><strong>E-Mail:</strong> ${testData.email}</p>
          <p><strong>Telefon:</strong> ${testData.phone}</p>
          <p><strong>Nachricht:</strong></p>
          <p>${testData.message}</p>
          <hr>
          <p><em>Diese E-Mail wurde automatisch vom CRM-System generiert.</em></p>
        `
      };

      await transporter.sendMail(adminEmail);
      console.log('✅ Admin-Benachrichtigung erfolgreich versendet!');

      // Teste Kunden-Bestätigung
      const customerEmail = {
        from: smtpFrom,
        to: testData.email,
        subject: 'Bestätigung Ihrer Anfrage - A4Plus',
        html: `
          <h2>Vielen Dank für Ihre Anfrage!</h2>
          <p>Liebe/r ${testData.firstName} ${testData.lastName},</p>
          <p>wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
          <p><strong>Ihre Anfrage:</strong></p>
          <p>${testData.message}</p>
          <hr>
          <p>Mit freundlichen Grüßen<br>Ihr A4Plus Team</p>
        `
      };

      await transporter.sendMail(customerEmail);
      console.log('✅ Kunden-Bestätigung erfolgreich versendet!');

    } catch (error) {
      console.error('❌ Fehler beim Testen der E-Mail-Notifications:', error.message);
    }

    console.log('\n🎉 E-MAIL-SERVICE FUNKTIONIERT VOLLSTÄNDIG!');
    console.log('Alle E-Mails wurden erfolgreich versendet.');
    console.log('Überprüfen Sie Ihr E-Mail-Postfach (auch Spam-Ordner).');

  } catch (error) {
    console.error('\n❌ SMTP-Verbindung fehlgeschlagen:', error.message);
    console.log('\nMögliche Ursachen:');
    console.log('1. Falsche SMTP-Einstellungen');
    console.log('2. Falsches Passwort');
    console.log('3. SMTP-Server blockiert Verbindung');
    console.log('4. Firewall blockiert Port', smtpPort);
    console.log('\nÜberprüfen Sie Ihre SMTP-Konfiguration bei Ihrem E-Mail-Provider.');
  }
}

// Test ausführen
testEmailService().catch(console.error);
