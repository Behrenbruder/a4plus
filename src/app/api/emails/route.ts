import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, testSMTPConnection, getEmailConfig } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html } = body;

    // Validiere erforderliche Felder
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'Fehlende erforderliche Felder: to, subject, und text oder html' },
        { status: 400 }
      );
    }

    // Sende E-Mail
    await sendEmail({
      to,
      from: process.env.SMTP_FROM || 'info@a4plus.eu',
      subject,
      text: text || '',
      html: html || text || ''
    });

    return NextResponse.json({
      success: true,
      message: 'E-Mail erfolgreich gesendet'
    });

  } catch (error) {
    console.error('E-Mail API Fehler:', error);
    return NextResponse.json(
      { 
        error: 'Fehler beim E-Mail-Versand',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'test') {
      // Teste SMTP-Verbindung
      const isConnected = await testSMTPConnection();
      const config = getEmailConfig();

      return NextResponse.json({
        connected: isConnected,
        config: {
          host: config.host,
          port: config.port,
          user: config.user,
          enabled: config.enabled
        }
      });
    }

    // Standard-Antwort mit E-Mail-Konfiguration
    const config = getEmailConfig();
    return NextResponse.json({
      service: 'E-Mail Service',
      status: 'aktiv',
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
        enabled: config.enabled
      }
    });

  } catch (error) {
    console.error('E-Mail API GET Fehler:', error);
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der E-Mail-Konfiguration',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
