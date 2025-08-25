import nodemailer from 'nodemailer';

// E-Mail-Service für IONOS SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true für 465, false für andere Ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Für IONOS SMTP
    ciphers: 'SSLv3'
  }
});

// E-Mail-Interface
interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

// E-Mail senden
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Überprüfen ob E-Mail-Service aktiviert ist
    if (process.env.EMAIL_SERVICE_ENABLED !== 'true') {
      console.log('📧 E-Mail-Service deaktiviert - E-Mail wird nur geloggt:');
      console.log(`An: ${options.to}`);
      console.log(`Von: ${options.from}`);
      console.log(`Betreff: ${options.subject}`);
      console.log(`Text: ${options.text}`);
      return;
    }

    // SMTP-Verbindung testen
    await transporter.verify();
    console.log('✅ SMTP-Verbindung erfolgreich');

    // E-Mail senden
    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    console.log('📧 E-Mail erfolgreich gesendet:', info.messageId);
    console.log('📧 An:', options.to);
    console.log('📧 Betreff:', options.subject);

  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error);
    
    // Detaillierte Fehlerbehandlung
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('🔐 Authentifizierungsfehler - Überprüfen Sie SMTP-Zugangsdaten');
      } else if (error.message.includes('connection')) {
        console.error('🌐 Verbindungsfehler - Überprüfen Sie SMTP-Host und Port');
      } else if (error.message.includes('timeout')) {
        console.error('⏰ Timeout-Fehler - SMTP-Server antwortet nicht');
      }
    }
    
    throw error;
  }
}

// SMTP-Verbindung testen
export async function testSMTPConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ SMTP-Verbindung zu', process.env.SMTP_HOST, 'erfolgreich');
    return true;
  } catch (error) {
    console.error('❌ SMTP-Verbindung fehlgeschlagen:', error);
    return false;
  }
}

// E-Mail-Konfiguration anzeigen (ohne Passwort)
export function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
    enabled: process.env.EMAIL_SERVICE_ENABLED === 'true'
  };
}
