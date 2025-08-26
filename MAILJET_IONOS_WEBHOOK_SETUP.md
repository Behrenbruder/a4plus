# Mailjet + IONOS Webhook Setup - Schritt-für-Schritt Anleitung

## Übersicht

Diese Anleitung zeigt, wie Sie Mailjet mit IONOS verbinden und Webhooks einrichten, damit alle eingehenden E-Mails an @a4plus.eu automatisch im CRM erfasst werden.

## Schritt 1: Mailjet Account erstellen und konfigurieren

### 1.1 Mailjet Account einrichten
1. Gehen Sie zu [mailjet.com](https://www.mailjet.com)
2. Erstellen Sie einen kostenlosen Account
3. Bestätigen Sie Ihre E-Mail-Adresse
4. Loggen Sie sich in das Mailjet Dashboard ein

### 1.2 Domain zu Mailjet hinzufügen
1. Im Mailjet Dashboard: **Account Settings** → **Domains**
2. Klicken Sie auf **"Add a Domain"**
3. Geben Sie `a4plus.eu` ein
4. Wählen Sie **"Receiving emails"** (wichtig für Webhooks!)
5. Folgen Sie den DNS-Konfigurationsschritten

### 1.3 DNS-Einträge bei IONOS konfigurieren
Mailjet wird Ihnen DNS-Einträge anzeigen, die Sie bei IONOS hinzufügen müssen:

**Bei IONOS:**
1. Loggen Sie sich in Ihr IONOS Control Panel ein
2. Gehen Sie zu **Domains & SSL** → **DNS**
3. Wählen Sie `a4plus.eu` aus
4. Fügen Sie die von Mailjet bereitgestellten DNS-Einträge hinzu:

```
Typ: MX
Name: @
Wert: in-v3.mailjet.com
Priorität: 10

Typ: TXT
Name: @
Wert: [Mailjet Verification Code]

Typ: CNAME
Name: mj._domainkey
Wert: mj._domainkey.a4plus.eu.mailjet.com
```

### 1.4 Domain-Verifizierung abwarten
- Die Verifizierung kann 24-48 Stunden dauern
- Mailjet prüft automatisch die DNS-Einträge
- Sie erhalten eine E-Mail, wenn die Domain verifiziert ist

## Schritt 2: E-Mail-Weiterleitung konfigurieren

### 2.1 IONOS E-Mail-Weiterleitung einrichten
1. Im IONOS Control Panel: **E-Mail & Office** → **E-Mail**
2. Wählen Sie Ihre Domain `a4plus.eu`
3. Erstellen Sie Weiterleitungen für alle relevanten E-Mail-Adressen:

```
info@a4plus.eu → info@a4plus.eu.mailjet.com
kontakt@a4plus.eu → kontakt@a4plus.eu.mailjet.com
service@a4plus.eu → service@a4plus.eu.mailjet.com
[mitarbeiter]@a4plus.eu → [mitarbeiter]@a4plus.eu.mailjet.com
```

**Oder für alle E-Mails (Catch-All):**
```
*@a4plus.eu → catchall@a4plus.eu.mailjet.com
```

## Schritt 3: Mailjet Webhook konfigurieren

### 3.1 Webhook-URL vorbereiten
Ihre Webhook-URL wird sein:
```
https://a4plus.eu/api/emails/webhook
```

### 3.2 Webhook in Mailjet einrichten
1. Im Mailjet Dashboard: **Account Settings** → **Event API (webhooks)**
2. Klicken Sie auf **"Add webhook"**
3. Konfigurieren Sie den Webhook:

```
Webhook URL: https://a4plus.eu/api/emails/webhook
Events auswählen:
☑️ email (eingehende E-Mails)
☑️ bounce (falls E-Mail nicht zustellbar)
☑️ spam (Spam-Erkennung)

HTTP Method: POST
Content-Type: application/json
```

### 3.3 Webhook-Format konfigurieren
Mailjet sendet Webhooks in diesem Format:
```json
{
  "event": "email",
  "time": 1640995200,
  "MessageID": "123456789",
  "email": "info@a4plus.eu",
  "mj_campaign_id": 0,
  "mj_contact_id": 0,
  "customcampaign": "",
  "mj_message_id": "123456789",
  "smtp_reply": "",
  "CustomID": "",
  "Payload": "",
  "from_email": "kunde@example.com",
  "from_name": "Max Mustermann",
  "subject": "Anfrage zu PV-Anlage",
  "text_part": "Hallo, ich interessiere mich für eine PV-Anlage...",
  "html_part": "<p>Hallo, ich interessiere mich für eine PV-Anlage...</p>"
}
```

## Schritt 4: Webhook-API für Mailjet anpassen

### 4.1 Mailjet-spezifische Webhook-Handler erstellen
Erstellen Sie eine neue Datei: `src/app/api/emails/mailjet-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Mailjet webhook received');
    
    const body = await request.json();
    console.log('📧 Mailjet payload:', JSON.stringify(body, null, 2));

    // Mailjet sendet Events als Array
    const events = Array.isArray(body) ? body : [body];

    for (const event of events) {
      if (event.event === 'email') {
        await processIncomingEmail(event);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Mailjet webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processIncomingEmail(event: any) {
  try {
    const {
      from_email,
      from_name,
      email: to_email,
      subject,
      text_part,
      html_part,
      MessageID,
      time
    } = event;

    // Nur @a4plus.eu E-Mails verarbeiten
    if (!to_email?.includes('@a4plus.eu')) {
      console.log('📧 Skipping non-a4plus.eu email:', to_email);
      return;
    }

    console.log(`📧 Processing email from ${from_email} to ${to_email}`);

    // Kunde finden oder erstellen
    const customer = await findOrCreateCustomer(from_email, from_name);
    
    if (!customer) {
      console.error('❌ Failed to process customer');
      return;
    }

    // E-Mail in contact_history speichern
    const { data: contactEntry, error: contactError } = await supabase
      .from('contact_history')
      .insert({
        customer_id: customer.id,
        contact_type: 'email',
        subject: subject || 'Kein Betreff',
        content: text_part || html_part || '',
        direction: 'inbound',
        metadata: {
          from: `${from_name} <${from_email}>`,
          to: to_email,
          messageId: MessageID,
          receivedAt: new Date().toISOString(),
          originalDate: new Date(time * 1000).toISOString(),
          mailjetEvent: event
        }
      })
      .select()
      .single();

    if (contactError) {
      console.error('❌ Error storing contact history:', contactError);
      return;
    }

    console.log('✅ Email stored successfully:', contactEntry.id);

  } catch (error) {
    console.error('❌ Error processing email:', error);
  }
}

async function findOrCreateCustomer(email: string, name?: string) {
  try {
    // Existierenden Kunden suchen
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (existingCustomer) {
      console.log('✅ Found existing customer:', existingCustomer.id);
      return existingCustomer;
    }

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Error finding customer:', findError);
      return null;
    }

    // Neuen Kunden erstellen
    console.log('📝 Creating new customer for:', email);
    
    // Name aus Mailjet-Daten oder E-Mail ableiten
    let firstName = 'Unbekannt';
    let lastName = 'Kunde';
    
    if (name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || 'Unbekannt';
      lastName = nameParts.slice(1).join(' ') || 'Kunde';
    } else {
      const emailParts = email.split('@')[0];
      const parts = emailParts.split(/[._-]/);
      firstName = parts[0] || 'Unbekannt';
      lastName = parts[1] || 'Kunde';
    }

    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        email: email,
        first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        last_name: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        lead_status: 'neu',
        lead_source: 'Email',
        notes: `Automatisch erstellt durch Mailjet-Webhook am ${new Date().toLocaleString('de-DE')}`
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating customer:', createError);
      return null;
    }

    console.log('✅ Created new customer:', newCustomer.id);
    return newCustomer;

  } catch (error) {
    console.error('❌ Error in findOrCreateCustomer:', error);
    return null;
  }
}

// GET endpoint für Testing
export async function GET() {
  return NextResponse.json({
    service: 'Mailjet Email Webhook',
    status: 'active',
    endpoint: '/api/emails/mailjet-webhook',
    description: 'Receives incoming emails from Mailjet and stores them in CRM'
  });
}
```

### 4.2 Webhook-URL in Mailjet aktualisieren
Ändern Sie die Webhook-URL in Mailjet zu:
```
https://a4plus.eu/api/emails/mailjet-webhook
```

## Schritt 5: Testing und Verifizierung

### 5.1 Webhook testen
1. Senden Sie eine Test-E-Mail an `info@a4plus.eu`
2. Überprüfen Sie die Logs in Ihrem CRM
3. Verifizieren Sie, dass die E-Mail im CRM erscheint

### 5.2 Mailjet Event-Logs überprüfen
1. Im Mailjet Dashboard: **Statistics** → **Event API**
2. Überprüfen Sie, ob Webhooks erfolgreich gesendet wurden
3. Schauen Sie sich Fehler-Logs an, falls vorhanden

## Schritt 6: Erweiterte Konfiguration

### 6.1 Alle @a4plus.eu E-Mails erfassen
Um sicherzustellen, dass alle Mitarbeiter-E-Mails erfasst werden:

1. **Catch-All Weiterleitung** bei IONOS einrichten:
   ```
   *@a4plus.eu → catchall@a4plus.eu.mailjet.com
   ```

2. **Webhook-Filter** anpassen, um interne E-Mails zu erkennen:
   ```typescript
   // In der processIncomingEmail Funktion
   const isInternalEmail = from_email.includes('@a4plus.eu');
   const isCustomerEmail = !isInternalEmail;
   
   // Verschiedene Behandlung für interne vs. Kunden-E-Mails
   ```

### 6.2 E-Mail-Kategorisierung
```typescript
// E-Mails nach Empfänger kategorisieren
const getEmailCategory = (toEmail: string) => {
  if (toEmail.includes('info@')) return 'Allgemeine Anfrage';
  if (toEmail.includes('kontakt@')) return 'Kontakt';
  if (toEmail.includes('service@')) return 'Service';
  return 'Sonstige';
};
```

## Schritt 7: Monitoring und Wartung

### 7.1 Webhook-Monitoring einrichten
- Überwachen Sie Mailjet Event-Logs regelmäßig
- Setzen Sie Alerts für fehlgeschlagene Webhooks
- Überprüfen Sie CRM-Logs auf Verarbeitungsfehler

### 7.2 Backup-Strategie
- Mailjet speichert E-Mails für 30 Tage
- Implementieren Sie regelmäßige Backups der CRM-Daten
- Dokumentieren Sie die Webhook-Konfiguration

## Troubleshooting

### Häufige Probleme:
1. **DNS-Propagation dauert zu lange** → Warten Sie 24-48 Stunden
2. **Webhook wird nicht ausgelöst** → Überprüfen Sie die URL und Events
3. **E-Mails kommen nicht an** → Prüfen Sie IONOS-Weiterleitungen
4. **Doppelte E-Mails** → Implementieren Sie Duplikat-Erkennung

### Debug-Befehle:
```bash
# Webhook-Status prüfen
curl https://a4plus.eu/api/emails/mailjet-webhook

# DNS-Einträge prüfen
nslookup -type=MX a4plus.eu
```

---

**Nächste Schritte nach der Einrichtung:**
1. Testen Sie mit echten E-Mails
2. Überwachen Sie die ersten Tage intensiv
3. Optimieren Sie die Kundenerkennung
4. Implementieren Sie erweiterte Features (Anhänge, Templates, etc.)

Diese Konfiguration stellt sicher, dass alle E-Mails an @a4plus.eu automatisch im CRM erfasst werden und die komplette Kommunikation zwischen Kunden und Mitarbeitern sichtbar ist.
