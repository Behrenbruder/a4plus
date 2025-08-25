// E-Mail-Benachrichtigungen für Kunden- und PV-Anfragen
// Konfiguriert für info@a4plus.eu

interface PVQuoteData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  total_kwp?: number;
  annual_pv_kwh?: number;
  battery_kwh?: number;
  autarkie_pct?: number;
  annual_savings_eur?: number;
  created_at: string;
}

interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
  inquiry_type?: string;
  created_at: string;
}

// E-Mail-Konfiguration
const EMAIL_CONFIG = {
  from: process.env.SMTP_FROM || process.env.COMPANY_EMAIL || 'info@a4plus.eu',
  notificationEmail: process.env.NOTIFICATION_EMAIL || 'info@a4plus.eu',
  companyName: process.env.COMPANY_NAME || 'A4Plus',
  companyPhone: process.env.COMPANY_PHONE || '+49 (0) 123 456789',
  companyAddress: process.env.COMPANY_ADDRESS || 'Musterstraße 1, 12345 Musterstadt',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
};

// PV-Anfrage Benachrichtigung an info@a4plus.eu
export async function sendPVQuoteNotificationEmail(quoteData: PVQuoteData): Promise<void> {
  const subject = `🌞 Neue PV-Anfrage von ${quoteData.first_name} ${quoteData.last_name}`;
  
  const textContent = `
Neue PV-Angebots-Anfrage eingegangen!

KUNDENDATEN:
Name: ${quoteData.first_name} ${quoteData.last_name}
E-Mail: ${quoteData.email}
${quoteData.phone ? `Telefon: ${quoteData.phone}` : ''}
${quoteData.city ? `Ort: ${quoteData.city}` : ''}
${quoteData.postal_code ? `PLZ: ${quoteData.postal_code}` : ''}
${quoteData.address ? `Adresse: ${quoteData.address}` : ''}

PV-SYSTEM DETAILS:
${quoteData.total_kwp ? `• Geplante Leistung: ${quoteData.total_kwp.toFixed(2)} kWp` : ''}
${quoteData.annual_pv_kwh ? `• Erwarteter Jahresertrag: ${quoteData.annual_pv_kwh.toLocaleString('de-DE')} kWh` : ''}
${quoteData.battery_kwh && quoteData.battery_kwh > 0 ? `• Batteriespeicher: ${quoteData.battery_kwh} kWh` : ''}
${quoteData.autarkie_pct ? `• Autarkiegrad: ${quoteData.autarkie_pct.toFixed(0)}%` : ''}
${quoteData.annual_savings_eur ? `• Geschätzte jährliche Einsparung: ${quoteData.annual_savings_eur.toLocaleString('de-DE')} €` : ''}

VERWALTUNG:
Anfrage-ID: ${quoteData.id}
Eingegangen am: ${new Date(quoteData.created_at).toLocaleString('de-DE')}
Admin-Link: ${EMAIL_CONFIG.baseUrl}/admin/pv-quotes/${quoteData.id}

---
Diese E-Mail wurde automatisch generiert von ${EMAIL_CONFIG.companyName}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #10b981; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
          🌞 Neue PV-Anfrage eingegangen
        </h1>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0369a1; margin-top: 0;">Kundendaten</h2>
          <p><strong>Name:</strong> ${quoteData.first_name} ${quoteData.last_name}</p>
          <p><strong>E-Mail:</strong> <a href="mailto:${quoteData.email}">${quoteData.email}</a></p>
          ${quoteData.phone ? `<p><strong>Telefon:</strong> <a href="tel:${quoteData.phone}">${quoteData.phone}</a></p>` : ''}
          ${quoteData.city ? `<p><strong>Ort:</strong> ${quoteData.city}</p>` : ''}
          ${quoteData.postal_code ? `<p><strong>PLZ:</strong> ${quoteData.postal_code}</p>` : ''}
          ${quoteData.address ? `<p><strong>Adresse:</strong> ${quoteData.address}</p>` : ''}
        </div>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #10b981; margin-top: 0;">PV-System Details</h2>
          ${quoteData.total_kwp ? `<p><strong>Geplante Leistung:</strong> ${quoteData.total_kwp.toFixed(2)} kWp</p>` : ''}
          ${quoteData.annual_pv_kwh ? `<p><strong>Erwarteter Jahresertrag:</strong> ${quoteData.annual_pv_kwh.toLocaleString('de-DE')} kWh</p>` : ''}
          ${quoteData.battery_kwh && quoteData.battery_kwh > 0 ? `<p><strong>Batteriespeicher:</strong> ${quoteData.battery_kwh} kWh</p>` : ''}
          ${quoteData.autarkie_pct ? `<p><strong>Autarkiegrad:</strong> ${quoteData.autarkie_pct.toFixed(0)}%</p>` : ''}
          ${quoteData.annual_savings_eur ? `<p><strong>Geschätzte jährliche Einsparung:</strong> ${quoteData.annual_savings_eur.toLocaleString('de-DE')} €</p>` : ''}
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #d97706; margin-top: 0;">Verwaltung</h2>
          <p><strong>Anfrage-ID:</strong> ${quoteData.id}</p>
          <p><strong>Eingegangen am:</strong> ${new Date(quoteData.created_at).toLocaleString('de-DE')}</p>
          <p><a href="${EMAIL_CONFIG.baseUrl}/admin/pv-quotes/${quoteData.id}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Admin-Bereich öffnen</a></p>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Diese E-Mail wurde automatisch generiert von ${EMAIL_CONFIG.companyName}<br>
          ${EMAIL_CONFIG.companyAddress}<br>
          ${EMAIL_CONFIG.companyPhone}
        </div>
      </div>
    </div>
  `;

  console.log('📧 PV-Anfrage Benachrichtigung an', EMAIL_CONFIG.notificationEmail);
  console.log('Betreff:', subject);
  console.log('Text-Inhalt:', textContent);

  // E-Mail-Service verwenden
  const { sendEmail } = await import('./email-service');
  await sendEmail({
    to: EMAIL_CONFIG.notificationEmail,
    from: EMAIL_CONFIG.from,
    subject: subject,
    text: textContent,
    html: htmlContent
  });
}

// Bestätigungs-E-Mail an den Kunden für PV-Anfragen
export async function sendPVQuoteConfirmationEmail(quoteData: PVQuoteData): Promise<void> {
  const subject = `Ihre PV-Anfrage bei ${EMAIL_CONFIG.companyName} - Bestätigung`;
  
  const textContent = `
Hallo ${quoteData.first_name} ${quoteData.last_name},

vielen Dank für Ihr Interesse an einer Photovoltaikanlage!

Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden, um ein individuelles Angebot zu erstellen.

IHRE ANFRAGE-DETAILS:
${quoteData.total_kwp ? `• Geplante Leistung: ${quoteData.total_kwp.toFixed(2)} kWp` : ''}
${quoteData.annual_pv_kwh ? `• Erwarteter Jahresertrag: ${quoteData.annual_pv_kwh.toLocaleString('de-DE')} kWh` : ''}
${quoteData.battery_kwh && quoteData.battery_kwh > 0 ? `• Batteriespeicher: ${quoteData.battery_kwh} kWh` : ''}
${quoteData.autarkie_pct ? `• Autarkiegrad: ${quoteData.autarkie_pct.toFixed(0)}%` : ''}
${quoteData.annual_savings_eur ? `• Geschätzte jährliche Einsparung: ${quoteData.annual_savings_eur.toLocaleString('de-DE')} €` : ''}

NÄCHSTE SCHRITTE:
1. Wir prüfen Ihre Anfrage und erstellen ein individuelles Angebot
2. Sie erhalten von uns eine detaillierte Wirtschaftlichkeitsberechnung
3. Bei Interesse vereinbaren wir einen Vor-Ort-Termin

Bei Fragen können Sie uns gerne kontaktieren:
Telefon: ${EMAIL_CONFIG.companyPhone}
E-Mail: ${EMAIL_CONFIG.from}

Mit freundlichen Grüßen
Ihr ${EMAIL_CONFIG.companyName} Team

---
${EMAIL_CONFIG.companyName}
${EMAIL_CONFIG.companyAddress}
${EMAIL_CONFIG.companyPhone}
${EMAIL_CONFIG.from}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #10b981; margin-bottom: 20px; text-align: center;">
          Vielen Dank für Ihre PV-Anfrage!
        </h1>
        
        <p>Hallo ${quoteData.first_name} ${quoteData.last_name},</p>
        
        <p>vielen Dank für Ihr Interesse an einer Photovoltaikanlage! Wir haben Ihre Anfrage erhalten und werden uns <strong>innerhalb von 24 Stunden</strong> bei Ihnen melden, um ein individuelles Angebot zu erstellen.</p>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #10b981; margin-top: 0;">Ihre Anfrage-Details</h2>
          ${quoteData.total_kwp ? `<p><strong>Geplante Leistung:</strong> ${quoteData.total_kwp.toFixed(2)} kWp</p>` : ''}
          ${quoteData.annual_pv_kwh ? `<p><strong>Erwarteter Jahresertrag:</strong> ${quoteData.annual_pv_kwh.toLocaleString('de-DE')} kWh</p>` : ''}
          ${quoteData.battery_kwh && quoteData.battery_kwh > 0 ? `<p><strong>Batteriespeicher:</strong> ${quoteData.battery_kwh} kWh</p>` : ''}
          ${quoteData.autarkie_pct ? `<p><strong>Autarkiegrad:</strong> ${quoteData.autarkie_pct.toFixed(0)}%</p>` : ''}
          ${quoteData.annual_savings_eur ? `<p><strong>Geschätzte jährliche Einsparung:</strong> ${quoteData.annual_savings_eur.toLocaleString('de-DE')} €</p>` : ''}
        </div>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #0369a1; margin-top: 0;">Nächste Schritte</h2>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Wir prüfen Ihre Anfrage und erstellen ein individuelles Angebot</li>
            <li>Sie erhalten von uns eine detaillierte Wirtschaftlichkeitsberechnung</li>
            <li>Bei Interesse vereinbaren wir einen Vor-Ort-Termin</li>
          </ol>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #d97706; margin-top: 0;">Kontakt</h2>
          <p>Bei Fragen können Sie uns gerne kontaktieren:</p>
          <p><strong>Telefon:</strong> <a href="tel:${EMAIL_CONFIG.companyPhone}">${EMAIL_CONFIG.companyPhone}</a></p>
          <p><strong>E-Mail:</strong> <a href="mailto:${EMAIL_CONFIG.from}">${EMAIL_CONFIG.from}</a></p>
        </div>

        <p>Mit freundlichen Grüßen<br>
        Ihr ${EMAIL_CONFIG.companyName} Team</p>

        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          ${EMAIL_CONFIG.companyName}<br>
          ${EMAIL_CONFIG.companyAddress}<br>
          ${EMAIL_CONFIG.companyPhone}<br>
          <a href="mailto:${EMAIL_CONFIG.from}">${EMAIL_CONFIG.from}</a>
        </div>
      </div>
    </div>
  `;

  console.log('📧 PV-Anfrage Bestätigung an', quoteData.email);
  console.log('Betreff:', subject);

  // E-Mail-Service verwenden
  const { sendEmail } = await import('./email-service');
  await sendEmail({
    to: quoteData.email,
    from: EMAIL_CONFIG.from,
    subject: subject,
    text: textContent,
    html: htmlContent
  });
}

// Allgemeine Kundenanfrage Benachrichtigung an info@a4plus.eu
export async function sendCustomerInquiryNotificationEmail(customerData: CustomerData): Promise<void> {
  const subject = `📞 Neue Kundenanfrage von ${customerData.first_name} ${customerData.last_name}`;
  
  const textContent = `
Neue Kundenanfrage eingegangen!

KUNDENDATEN:
Name: ${customerData.first_name} ${customerData.last_name}
E-Mail: ${customerData.email}
${customerData.phone ? `Telefon: ${customerData.phone}` : ''}
${customerData.address ? `Adresse: ${customerData.address}` : ''}
${customerData.inquiry_type ? `Anfrage-Typ: ${customerData.inquiry_type}` : ''}

NACHRICHT:
${customerData.message || 'Keine Nachricht hinterlassen'}

VERWALTUNG:
Anfrage-ID: ${customerData.id}
Eingegangen am: ${new Date(customerData.created_at).toLocaleString('de-DE')}
Admin-Link: ${EMAIL_CONFIG.baseUrl}/admin/customers/${customerData.id}

---
Diese E-Mail wurde automatisch generiert von ${EMAIL_CONFIG.companyName}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #10b981; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
          📞 Neue Kundenanfrage eingegangen
        </h1>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0369a1; margin-top: 0;">Kundendaten</h2>
          <p><strong>Name:</strong> ${customerData.first_name} ${customerData.last_name}</p>
          <p><strong>E-Mail:</strong> <a href="mailto:${customerData.email}">${customerData.email}</a></p>
          ${customerData.phone ? `<p><strong>Telefon:</strong> <a href="tel:${customerData.phone}">${customerData.phone}</a></p>` : ''}
          ${customerData.address ? `<p><strong>Adresse:</strong> ${customerData.address}</p>` : ''}
          ${customerData.inquiry_type ? `<p><strong>Anfrage-Typ:</strong> ${customerData.inquiry_type}</p>` : ''}
        </div>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #10b981; margin-top: 0;">Nachricht</h2>
          <p style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;">
            ${customerData.message || 'Keine Nachricht hinterlassen'}
          </p>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #d97706; margin-top: 0;">Verwaltung</h2>
          <p><strong>Anfrage-ID:</strong> ${customerData.id}</p>
          <p><strong>Eingegangen am:</strong> ${new Date(customerData.created_at).toLocaleString('de-DE')}</p>
          <p><a href="${EMAIL_CONFIG.baseUrl}/admin/customers/${customerData.id}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Admin-Bereich öffnen</a></p>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Diese E-Mail wurde automatisch generiert von ${EMAIL_CONFIG.companyName}<br>
          ${EMAIL_CONFIG.companyAddress}<br>
          ${EMAIL_CONFIG.companyPhone}
        </div>
      </div>
    </div>
  `;

  console.log('📧 Kundenanfrage Benachrichtigung an', EMAIL_CONFIG.notificationEmail);
  console.log('Betreff:', subject);

  // Hier würde in der Produktion ein echter E-Mail-Service integriert werden
  if (process.env.EMAIL_SERVICE_ENABLED === 'true') {
    // await sendEmail({
    //   to: EMAIL_CONFIG.notificationEmail,
    //   from: EMAIL_CONFIG.from,
    //   subject: subject,
    //   text: textContent,
    //   html: htmlContent
    // });
  }
}

// Bestätigungs-E-Mail an den Kunden für allgemeine Anfragen
export async function sendCustomerInquiryConfirmationEmail(customerData: CustomerData): Promise<void> {
  const subject = `Ihre Anfrage bei ${EMAIL_CONFIG.companyName} - Bestätigung`;
  
  const textContent = `
Hallo ${customerData.first_name} ${customerData.last_name},

vielen Dank für Ihre Anfrage!

Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.

IHRE ANFRAGE:
${customerData.inquiry_type ? `Anfrage-Typ: ${customerData.inquiry_type}` : ''}
Nachricht: ${customerData.message || 'Keine spezielle Nachricht'}

Bei dringenden Fragen können Sie uns gerne direkt kontaktieren:
Telefon: ${EMAIL_CONFIG.companyPhone}
E-Mail: ${EMAIL_CONFIG.from}

Mit freundlichen Grüßen
Ihr ${EMAIL_CONFIG.companyName} Team

---
${EMAIL_CONFIG.companyName}
${EMAIL_CONFIG.companyAddress}
${EMAIL_CONFIG.companyPhone}
${EMAIL_CONFIG.from}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #10b981; margin-bottom: 20px; text-align: center;">
          Vielen Dank für Ihre Anfrage!
        </h1>
        
        <p>Hallo ${customerData.first_name} ${customerData.last_name},</p>
        
        <p>vielen Dank für Ihre Anfrage! Wir haben Ihre Nachricht erhalten und werden uns <strong>schnellstmöglich</strong> bei Ihnen melden.</p>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #10b981; margin-top: 0;">Ihre Anfrage</h2>
          ${customerData.inquiry_type ? `<p><strong>Anfrage-Typ:</strong> ${customerData.inquiry_type}</p>` : ''}
          <p><strong>Nachricht:</strong></p>
          <p style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;">
            ${customerData.message || 'Keine spezielle Nachricht'}
          </p>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #d97706; margin-top: 0;">Kontakt</h2>
          <p>Bei dringenden Fragen können Sie uns gerne direkt kontaktieren:</p>
          <p><strong>Telefon:</strong> <a href="tel:${EMAIL_CONFIG.companyPhone}">${EMAIL_CONFIG.companyPhone}</a></p>
          <p><strong>E-Mail:</strong> <a href="mailto:${EMAIL_CONFIG.from}">${EMAIL_CONFIG.from}</a></p>
        </div>

        <p>Mit freundlichen Grüßen<br>
        Ihr ${EMAIL_CONFIG.companyName} Team</p>

        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          ${EMAIL_CONFIG.companyName}<br>
          ${EMAIL_CONFIG.companyAddress}<br>
          ${EMAIL_CONFIG.companyPhone}<br>
          <a href="mailto:${EMAIL_CONFIG.from}">${EMAIL_CONFIG.from}</a>
        </div>
      </div>
    </div>
  `;

  console.log('📧 Kundenanfrage Bestätigung an', customerData.email);
  console.log('Betreff:', subject);

  // Hier würde in der Produktion ein echter E-Mail-Service integriert werden
  if (process.env.EMAIL_SERVICE_ENABLED === 'true') {
    // await sendEmail({
    //   to: customerData.email,
    //   from: EMAIL_CONFIG.from,
    //   subject: subject,
    //   text: textContent,
    //   html: htmlContent
    // });
  }
}

// Legacy-Funktionen für Rückwärtskompatibilität
export async function sendNotificationEmail(quoteData: PVQuoteData): Promise<void> {
  return sendPVQuoteNotificationEmail(quoteData);
}

export async function sendCustomerConfirmationEmail(quoteData: PVQuoteData): Promise<void> {
  return sendPVQuoteConfirmationEmail(quoteData);
}

// Export der E-Mail-Konfiguration für andere Module
export { EMAIL_CONFIG };
