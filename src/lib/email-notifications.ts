// Einfache E-Mail-Benachrichtigung für PV-Anfragen
// In einer Produktionsumgebung sollte ein professioneller E-Mail-Service verwendet werden

interface PVQuoteData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  total_kwp?: number;
  annual_pv_kwh?: number;
  battery_kwh?: number;
  autarkie_pct?: number;
  annual_savings_eur?: number;
  created_at: string;
}

export async function sendNotificationEmail(quoteData: PVQuoteData): Promise<void> {
  // Für Demo-Zwecke: Log in der Konsole
  // In der Produktion würde hier ein echter E-Mail-Service verwendet werden
  
  const emailContent = `
🌞 Neue PV-Angebots-Anfrage eingegangen!

Kunde: ${quoteData.first_name} ${quoteData.last_name}
E-Mail: ${quoteData.email}
${quoteData.phone ? `Telefon: ${quoteData.phone}` : ''}
${quoteData.city ? `Ort: ${quoteData.city}` : ''}

PV-System Details:
${quoteData.total_kwp ? `- Leistung: ${quoteData.total_kwp.toFixed(2)} kWp` : ''}
${quoteData.annual_pv_kwh ? `- Jahresertrag: ${quoteData.annual_pv_kwh.toLocaleString()} kWh` : ''}
${quoteData.battery_kwh && quoteData.battery_kwh > 0 ? `- Speicher: ${quoteData.battery_kwh} kWh` : ''}
${quoteData.autarkie_pct ? `- Autarkie: ${quoteData.autarkie_pct.toFixed(0)}%` : ''}
${quoteData.annual_savings_eur ? `- Jährliche Einsparung: ${quoteData.annual_savings_eur.toFixed(0)} €` : ''}

Anfrage-ID: ${quoteData.id}
Zeitpunkt: ${new Date(quoteData.created_at).toLocaleString('de-DE')}

Admin-Link: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/pv-quotes/${quoteData.id}
  `;

  console.log('📧 E-Mail-Benachrichtigung:', emailContent);

  // Hier würde in der Produktion ein echter E-Mail-Service integriert werden:
  // - Nodemailer mit SMTP
  // - SendGrid
  // - AWS SES
  // - Resend
  // - etc.

  // Beispiel für eine zukünftige Integration:
  /*
  if (process.env.EMAIL_SERVICE_ENABLED === 'true') {
    await sendEmail({
      to: process.env.NOTIFICATION_EMAIL || 'info@firma.de',
      subject: `Neue PV-Anfrage von ${quoteData.first_name} ${quoteData.last_name}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
  }
  */
}

export async function sendCustomerConfirmationEmail(quoteData: PVQuoteData): Promise<void> {
  // Bestätigungs-E-Mail an den Kunden
  const confirmationContent = `
Hallo ${quoteData.first_name} ${quoteData.last_name},

vielen Dank für Ihr Interesse an einer PV-Anlage!

Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.

Ihre Anfrage-Details:
${quoteData.total_kwp ? `- Geplante Leistung: ${quoteData.total_kwp.toFixed(2)} kWp` : ''}
${quoteData.annual_pv_kwh ? `- Erwarteter Jahresertrag: ${quoteData.annual_pv_kwh.toLocaleString()} kWh` : ''}
${quoteData.annual_savings_eur ? `- Geschätzte jährliche Einsparung: ${quoteData.annual_savings_eur.toFixed(0)} €` : ''}

Bei Fragen können Sie uns gerne kontaktieren.

Mit freundlichen Grüßen
Ihr Team
  `;

  console.log('📧 Kunden-Bestätigung:', confirmationContent);

  // Auch hier würde in der Produktion ein echter E-Mail-Service verwendet werden
}
