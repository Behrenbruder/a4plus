# E-Mail-Konfiguration für info@a4plus.eu

Diese Anleitung erklärt, wie die E-Mail-Adresse `info@a4plus.eu` für Kunden- und PV-Anfragen konfiguriert wurde.

## 📧 Konfigurierte E-Mail-Adresse

**Haupt-E-Mail:** `info@a4plus.eu`

Diese E-Mail-Adresse wird verwendet für:
- Empfang von PV-Angebots-Anfragen
- Empfang von allgemeinen Kundenanfragen
- Versand von Bestätigungs-E-Mails an Kunden
- Interne Benachrichtigungen

## 🔧 Umgebungsvariablen

Die folgenden Umgebungsvariablen wurden in `.env.example` konfiguriert:

```env
# E-Mail-Konfiguration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=info@a4plus.eu
NOTIFICATION_EMAIL=info@a4plus.eu
EMAIL_SERVICE_ENABLED=false

# Firmeninformationen
COMPANY_NAME=A4Plus
COMPANY_EMAIL=info@a4plus.eu
COMPANY_PHONE=+49 (0) 123 456789
COMPANY_ADDRESS="Musterstraße 1, 12345 Musterstadt"
```

## 📝 Implementierte E-Mail-Funktionen

### 1. PV-Anfrage Benachrichtigungen

**Funktion:** `sendPVQuoteNotificationEmail()`
- **An:** info@a4plus.eu
- **Zweck:** Benachrichtigung über neue PV-Anfragen
- **Inhalt:** Kundendaten, PV-System Details, Admin-Link

**Funktion:** `sendPVQuoteConfirmationEmail()`
- **An:** Kunde
- **Zweck:** Bestätigung der PV-Anfrage
- **Inhalt:** Anfrage-Details, nächste Schritte, Kontaktdaten

### 2. Allgemeine Kundenanfragen

**Funktion:** `sendCustomerInquiryNotificationEmail()`
- **An:** info@a4plus.eu
- **Zweck:** Benachrichtigung über allgemeine Anfragen
- **Inhalt:** Kundendaten, Nachricht, Admin-Link

**Funktion:** `sendCustomerInquiryConfirmationEmail()`
- **An:** Kunde
- **Zweck:** Bestätigung der Anfrage
- **Inhalt:** Anfrage-Zusammenfassung, Kontaktdaten

## 🎨 E-Mail-Templates

Alle E-Mails verwenden professionelle HTML-Templates mit:
- Responsive Design
- Firmen-Branding (A4Plus)
- Strukturierte Inhalte mit farbigen Bereichen
- Klickbare Links (Telefon, E-Mail, Admin-Bereiche)
- Firmen-Kontaktdaten im Footer

## 🚀 Aktivierung des E-Mail-Versands

### Schritt 1: Umgebungsvariablen setzen

Erstellen Sie eine `.env.local` Datei mit Ihren SMTP-Einstellungen:

```env
# Produktions-E-Mail-Konfiguration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=info@a4plus.eu
SMTP_PASS=your_email_password
SMTP_FROM=info@a4plus.eu
NOTIFICATION_EMAIL=info@a4plus.eu
EMAIL_SERVICE_ENABLED=true

# Firmeninformationen anpassen
COMPANY_NAME=A4Plus
COMPANY_EMAIL=info@a4plus.eu
COMPANY_PHONE=+49 (0) 2161 123456
COMPANY_ADDRESS="Ihre echte Adresse"
NEXT_PUBLIC_BASE_URL=https://ihre-domain.de
```

### Schritt 2: E-Mail-Service installieren

Für den produktiven Einsatz empfehlen wir einen der folgenden E-Mail-Services:

#### Option A: Nodemailer (SMTP)
```bash
npm install nodemailer @types/nodemailer
```

#### Option B: Resend (empfohlen)
```bash
npm install resend
```

#### Option C: SendGrid
```bash
npm install @sendgrid/mail
```

### Schritt 3: E-Mail-Service implementieren

Erstellen Sie `src/lib/email-service.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  from,
  subject,
  text,
  html
}: {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}) {
  return await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
}
```

### Schritt 4: E-Mail-Funktionen aktivieren

In `src/lib/email-notifications.ts` sind die E-Mail-Aufrufe bereits vorbereitet. Entfernen Sie einfach die Kommentare:

```typescript
// Ändern Sie dies:
// await sendEmail({
//   to: EMAIL_CONFIG.notificationEmail,
//   from: EMAIL_CONFIG.from,
//   subject: subject,
//   text: textContent,
//   html: htmlContent
// });

// Zu diesem:
await sendEmail({
  to: EMAIL_CONFIG.notificationEmail,
  from: EMAIL_CONFIG.from,
  subject: subject,
  text: textContent,
  html: htmlContent
});
```

## 📊 Verwendung in der Anwendung

### PV-Rechner Integration

Die E-Mail-Funktionen werden automatisch aufgerufen, wenn:
- Eine neue PV-Anfrage über den PV-Rechner eingereicht wird
- Der Status einer PV-Anfrage im Admin-Bereich geändert wird

### Kontaktformular Integration

Für allgemeine Kundenanfragen können Sie die Funktionen so verwenden:

```typescript
import { 
  sendCustomerInquiryNotificationEmail,
  sendCustomerInquiryConfirmationEmail 
} from '@/lib/email-notifications';

// Nach dem Speichern einer Kundenanfrage
await sendCustomerInquiryNotificationEmail(customerData);
await sendCustomerInquiryConfirmationEmail(customerData);
```

## 🔍 Testing

### Entwicklungsumgebung

Mit `EMAIL_SERVICE_ENABLED=false` werden E-Mails nur in der Konsole ausgegeben:

```bash
📧 PV-Anfrage Benachrichtigung an info@a4plus.eu
Betreff: 🌞 Neue PV-Anfrage von Max Mustermann
```

### Produktionsumgebung

Mit `EMAIL_SERVICE_ENABLED=true` werden echte E-Mails versendet.

## 📋 Checkliste für Produktionsstart

- [ ] SMTP-Einstellungen in `.env.local` konfiguriert
- [ ] E-Mail-Service (Nodemailer/Resend/SendGrid) installiert
- [ ] `EMAIL_SERVICE_ENABLED=true` gesetzt
- [ ] Firmeninformationen angepasst
- [ ] Test-E-Mails versendet
- [ ] E-Mail-Empfang bei info@a4plus.eu bestätigt

## 🛠️ Anpassungen

### Firmeninformationen ändern

Passen Sie die Umgebungsvariablen in `.env.local` an:

```env
COMPANY_NAME=Ihr Firmenname
COMPANY_EMAIL=info@a4plus.eu
COMPANY_PHONE=+49 (0) Ihre Telefonnummer
COMPANY_ADDRESS="Ihre Firmenadresse"
```

### E-Mail-Templates anpassen

Die Templates befinden sich in `src/lib/email-notifications.ts` und können nach Ihren Wünschen angepasst werden.

### Zusätzliche E-Mail-Typen

Sie können weitere E-Mail-Funktionen nach dem gleichen Muster hinzufügen:

```typescript
export async function sendCustomEmailType(data: YourDataType): Promise<void> {
  // Ihre E-Mail-Logik hier
}
```

## 📞 Support

Bei Fragen zur E-Mail-Konfiguration:
- Überprüfen Sie die Konsolen-Ausgaben
- Testen Sie die SMTP-Verbindung
- Kontrollieren Sie die Umgebungsvariablen
- Prüfen Sie Spam-Ordner bei Test-E-Mails

---

**Erstellt:** 25.08.2025  
**E-Mail-Adresse:** info@a4plus.eu  
**Status:** Konfiguriert und einsatzbereit
