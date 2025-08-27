// @ts-ignore - imap-simple has no types
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

// Domain-E-Mail-Adressen
const DOMAIN_EMAILS = [
  's.behr@a4plus.eu',
  'b.behr@a4plus.eu', 
  'l.behr@a4plus.eu',
  'info@a4plus.eu',
  'montage@a4plus.eu'
];

interface ParsedEmail {
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  text: string;
  html?: string;
  date: Date;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

interface EmailSyncResult {
  success: boolean;
  emailsProcessed: number;
  newEmails: number;
  errors: string[];
  accountResults: Array<{
    account: string;
    success: boolean;
    emailsProcessed: number;
    newEmails: number;
    errors: string[];
  }>;
}

interface IMAPAccount {
  email: string;
  password: string;
}

// Multi-IMAP-Konfiguration aus Environment-Variablen laden
function getIMAPAccounts(): IMAPAccount[] {
  const accountsString = process.env.IMAP_ACCOUNTS || '';
  const accounts = accountsString.split(',').map(email => email.trim()).filter(email => email);
  
  const imapAccounts: IMAPAccount[] = [];
  
  for (const email of accounts) {
    // E-Mail-Adresse zu Environment-Variable-Key konvertieren
    const key = email.replace('@', '_').replace('.', '_').toUpperCase();
    const passwordKey = `IMAP_PASSWORD_${key.replace('A4PLUS_EU', '').replace('_', '')}`;
    
    // Spezielle Mappings für die Passwort-Keys
    let password = '';
    switch (email) {
      case 'info@a4plus.eu':
        password = process.env.IMAP_PASSWORD_INFO || '';
        break;
      case 's.behr@a4plus.eu':
        password = process.env.IMAP_PASSWORD_SBEHR || '';
        break;
      case 'b.behr@a4plus.eu':
        password = process.env.IMAP_PASSWORD_BBEHR || '';
        break;
      case 'l.behr@a4plus.eu':
        password = process.env.IMAP_PASSWORD_LBEHR || '';
        break;
      case 'montage@a4plus.eu':
        password = process.env.IMAP_PASSWORD_MONTAGE || '';
        break;
      default:
        console.warn(`⚠️ Kein Passwort gefunden für ${email}`);
        continue;
    }
    
    if (password) {
      imapAccounts.push({ email, password });
    } else {
      console.warn(`⚠️ Leeres Passwort für ${email}`);
    }
  }
  
  return imapAccounts;
}

// IMAP-Konfiguration für einen Account erstellen
function createIMAPConfig(account: IMAPAccount) {
  return {
    imap: {
      user: account.email,
      password: account.password,
      host: process.env.IMAP_HOST || 'imap.ionos.de',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
      authTimeout: 30000,
      connTimeout: 30000,
      tlsOptions: {
        rejectUnauthorized: false
      }
    }
  };
}

// E-Mail-Adresse normalisieren
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Prüfen ob E-Mail von/an Domain-Adressen ist
function isDomainEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return DOMAIN_EMAILS.some(domainEmail => 
    normalized.includes(normalizeEmail(domainEmail))
  );
}

// Alle Kunden-E-Mails aus E-Mail-Adressen extrahieren
function extractCustomerEmails(fromEmail: string, toEmails: string[], ccEmails: string[] = []): string[] {
  const allEmails = [fromEmail, ...toEmails, ...ccEmails];
  
  // Alle Nicht-Domain-E-Mails sind potenzielle Kunden-E-Mails
  const customerEmails = allEmails.filter(email => !isDomainEmail(email));
  
  // Duplikate entfernen und normalisieren
  const uniqueCustomerEmails = [...new Set(customerEmails.map(email => normalizeEmail(email)))];
  
  return uniqueCustomerEmails;
}

// Kunde anhand E-Mail-Adresse finden (OHNE automatische Erstellung)
async function findExistingCustomer(email: string, supabase: any): Promise<string | null> {
  try {
    // E-Mail-Adresse aus "Name <email@domain.com>" Format extrahieren
    let cleanEmail = email;
    const emailMatch = email.match(/<([^>]+)>/);
    if (emailMatch) {
      cleanEmail = emailMatch[1];
    }
    
    const normalizedEmail = normalizeEmail(cleanEmail);
    console.log(`🔍 Suche bestehenden Kunden für E-Mail: "${email}" -> normalisiert: "${normalizedEmail}"`);
    
    // Nur nach bestehenden Kunden suchen, KEINE neuen erstellen
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name')
      .eq('email', normalizedEmail)
      .single();
    
    if (existingCustomer) {
      console.log(`✅ Bestehender Kunde gefunden: ${existingCustomer.first_name} ${existingCustomer.last_name} (${existingCustomer.email})`);
      return existingCustomer.id;
    }
    
    console.log(`⚠️ Kein bestehender Kunde gefunden für: ${normalizedEmail} - E-Mail wird übersprungen`);
    return null;
    
  } catch (error) {
    console.error('❌ Fehler bei findExistingCustomer:', error);
    return null;
  }
}

// E-Mail in Datenbank speichern
async function saveEmailToDatabase(email: ParsedEmail, supabase: any, sourceAccount: string): Promise<boolean> {
  try {
    // Alle Kunden-E-Mails extrahieren
    const customerEmails = extractCustomerEmails(email.from, email.to, email.cc);
    if (customerEmails.length === 0) {
      console.log('⚠️ Keine Kunden-E-Mail gefunden, überspringe:', email.subject);
      return false;
    }
    
    console.log(`📧 Gefundene Kunden-E-Mails: ${customerEmails.join(', ')}`);
    
    let savedCount = 0;
    
    // E-Mail für jeden beteiligten Kunden speichern
    for (const customerEmail of customerEmails) {
      // Bestehenden Kunden finden (OHNE automatische Erstellung)
      const customerId = await findExistingCustomer(customerEmail, supabase);
      if (!customerId) {
        console.log('⚠️ Kein bestehender Kunde gefunden für:', customerEmail, '- E-Mail wird übersprungen');
        continue;
      }
      
      // Prüfen ob E-Mail bereits für diesen Kunden existiert
      const { data: existing } = await supabase
        .from('contact_history')
        .select('id')
        .eq('metadata->>message_id', email.messageId)
        .eq('customer_id', customerId)
        .single();
      
      if (existing) {
        console.log(`📧 E-Mail bereits vorhanden für Kunde ${customerEmail}:`, email.subject);
        continue;
      }
      
      // Richtung bestimmen basierend auf der spezifischen Kunden-E-Mail
      const isFromCustomer = normalizeEmail(email.from).includes(normalizeEmail(customerEmail));
      
      // E-Mail speichern
      const { error: insertError } = await supabase
        .from('contact_history')
        .insert([{
          customer_id: customerId,
          contact_type: 'email',
          subject: email.subject,
          content: email.text,
          direction: isFromCustomer ? 'inbound' : 'outbound',
          created_at: email.date.toISOString(),
          metadata: {
            message_id: email.messageId,
            from_email: email.from,
            to_emails: email.to,
            cc_emails: email.cc || [],
            has_attachments: email.attachments.length > 0,
            attachments: email.attachments,
            html_content: email.html,
            sync_source: 'imap_multi',
            source_account: sourceAccount,
            customer_email: customerEmail
          }
        }]);
      
      if (insertError) {
        console.error(`❌ Fehler beim Speichern der E-Mail für ${customerEmail}:`, insertError);
        continue;
      }
      
      // Letztes Kontaktdatum aktualisieren
      await supabase
        .from('customers')
        .update({ 
          last_contact_date: email.date.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);
      
      console.log(`✅ E-Mail gespeichert für ${customerEmail}: ${email.subject} (${isFromCustomer ? 'eingehend' : 'ausgehend'}) [${sourceAccount}]`);
      savedCount++;
    }
    
    return savedCount > 0;
    
  } catch (error) {
    console.error('❌ Fehler beim Speichern der E-Mail:', error);
    return false;
  }
}

// E-Mail-Adressen extrahieren (gleiche Logik wie im Single-Account Service)
function extractEmailAddress(emailField: any): string {
  if (!emailField) return '';
  
  if (typeof emailField === 'string') {
    const match = emailField.match(/<([^>]+)>/);
    return match ? match[1] : emailField;
  }
  
  // @ts-ignore - mailparser types issue
  if (emailField.value && emailField.value.length > 0) {
    // @ts-ignore - mailparser types issue
    return emailField.value[0].address || '';
  }
  
  // @ts-ignore - mailparser types issue
  if (emailField.text) {
    // @ts-ignore - mailparser types issue
    const match = emailField.text.match(/<([^>]+)>/);
    // @ts-ignore - mailparser types issue
    return match ? match[1] : emailField.text;
  }
  
  return '';
}

function extractEmailAddresses(emailField: any): string[] {
  if (!emailField) return [];
  
  if (typeof emailField === 'string') {
    return emailField.split(',').map(e => {
      const trimmed = e.trim();
      const match = trimmed.match(/<([^>]+)>/);
      return match ? match[1] : trimmed;
    }).filter(e => e && e.includes('@'));
  }
  
  // @ts-ignore - mailparser types issue
  if (emailField.value && Array.isArray(emailField.value)) {
    // @ts-ignore - mailparser types issue
    return emailField.value.map((addr: any) => addr.address || '').filter((e: string) => e && e.includes('@'));
  }
  
  // @ts-ignore - mailparser types issue
  if (emailField.text) {
    // @ts-ignore - mailparser types issue
    return emailField.text.split(',').map((e: string) => {
      const trimmed = e.trim();
      const match = trimmed.match(/<([^>]+)>/);
      return match ? match[1] : trimmed;
    }).filter((e: string) => e && e.includes('@'));
  }
  
  return [];
}

// E-Mails für einen Account und spezifischen Kunden synchronisieren (Performance-optimiert)
async function syncAccountEmailsForCustomer(
  account: IMAPAccount, 
  supabase: any, 
  customerEmail: string, 
  customerId: string, 
  sinceHours: number = 24
): Promise<{
  success: boolean;
  emailsProcessed: number;
  newEmails: number;
  errors: string[];
}> {
  const result: {
    success: boolean;
    emailsProcessed: number;
    newEmails: number;
    errors: string[];
  } = {
    success: false,
    emailsProcessed: 0,
    newEmails: 0,
    errors: []
  };
  
  let connection: any = null;
  
  try {
    console.log(`📧 Synchronisiere Account ${account.email} für Kunde: ${customerEmail}`);
    
    const imapConfig = createIMAPConfig(account);
    
    // IMAP-Verbindung herstellen
    connection = await imaps.connect(imapConfig);
    console.log(`✅ IMAP-Verbindung hergestellt für ${account.email}`);
    
    // Beide Ordner synchronisieren: INBOX und Gesendete Objekte
    const foldersToSync = ['INBOX', 'Gesendete Objekte'];
    let allMessages: any[] = [];
    
    for (const folderName of foldersToSync) {
      try {
        console.log(`📧 Öffne Ordner: ${folderName} für ${account.email}`);
        await connection.openBox(folderName);
        
        // LÖSUNG: Verwende separate, einfache Suchkriterien ohne komplexe OR-Struktur
        let messages: any[] = [];
        console.log(`📧 Suche E-Mails mit separaten Kriterien in ${folderName} für ${account.email}`);
        
        try {
          // Drei separate Suchen mit korrekter IMAP-Syntax
          const fromMessages = await connection.search([['FROM', customerEmail]], { bodies: '', struct: true });
          const toMessages = await connection.search([['TO', customerEmail]], { bodies: '', struct: true });
          const ccMessages = await connection.search([['CC', customerEmail]], { bodies: '', struct: true });
          
          // Alle Ergebnisse zusammenführen und Duplikate entfernen
          const allFoundMessages = [
            ...(Array.isArray(fromMessages) ? fromMessages : []),
            ...(Array.isArray(toMessages) ? toMessages : []),
            ...(Array.isArray(ccMessages) ? ccMessages : [])
          ];
          
          // Duplikate anhand der UID entfernen
          const uniqueMessages = allFoundMessages.filter((msg, index, arr) => 
            arr.findIndex(m => m.attributes?.uid === msg.attributes?.uid) === index
          );
          
          messages = uniqueMessages.slice(-15); // Maximal 15 E-Mails
          console.log(`✅ Separate Suche erfolgreich: ${messages.length} relevante E-Mails gefunden`);
          
        } catch (searchError) {
          console.log(`⚠️ Separate Suche fehlgeschlagen in ${folderName} für ${account.email}:`, searchError);
          // Fallback: Alle E-Mails laden und clientseitig filtern
          try {
            const allMessages = await connection.search(['ALL'], { bodies: '', struct: true });
            if (allMessages && Array.isArray(allMessages) && allMessages.length > 0) {
              messages = allMessages.slice(-10);
              console.log(`✅ Fallback erfolgreich: ${messages.length} E-Mails geladen`);
            } else {
              messages = [];
            }
          } catch (fallbackError) {
            console.log(`❌ Auch Fallback fehlgeschlagen:`, fallbackError);
            messages = [];
          }
        }
        
        console.log(`📧 ${messages.length} E-Mails mit ${customerEmail} in ${folderName} gefunden für ${account.email}`);
        
        const messagesWithFolder = messages.map((msg: any) => ({
          ...msg,
          folder: folderName
        }));
        
        allMessages = allMessages.concat(messagesWithFolder);
      } catch (folderError) {
        console.log(`⚠️ Konnte Ordner ${folderName} nicht öffnen für ${account.email}:`, folderError);
        result.errors.push(`Ordner ${folderName} nicht verfügbar`);
      }
    }
    
    console.log(`📧 Insgesamt ${allMessages.length} relevante E-Mails für ${customerEmail} gefunden in ${account.email}`);
    
    result.emailsProcessed = allMessages.length;
    
    // E-Mails verarbeiten
    for (const message of allMessages) {
      try {
        let emailBody = '';
        
        if (message.parts && message.parts.length > 0) {
          for (const part of message.parts) {
            if (part.body) {
              emailBody += part.body;
            }
          }
        }
        
        if (!emailBody) {
          console.log(`⚠️ Kein E-Mail-Body gefunden für UID: ${message.attributes?.uid} [${account.email}]`);
          continue;
        }
        
        const parsed = await simpleParser(emailBody);
        
        const fromEmail = extractEmailAddress(parsed.from);
        const toEmails = extractEmailAddresses(parsed.to);
        const ccEmails = extractEmailAddresses(parsed.cc);
        
        // KRITISCH: Prüfen ob diese E-Mail tatsächlich mit dem spezifischen Kunden in Verbindung steht
        const normalizedCustomerEmail = normalizeEmail(customerEmail);
        const allEmailAddresses = [fromEmail, ...toEmails, ...ccEmails];
        const isRelevantForCustomer = allEmailAddresses.some(email => 
          normalizeEmail(email).includes(normalizedCustomerEmail)
        );
        
        if (!isRelevantForCustomer) {
          console.log(`⚠️ E-Mail nicht relevant für Kunde ${customerEmail}, überspringe: ${parsed.subject} (Von: ${fromEmail}, An: [${toEmails.join(', ')}])`);
          continue;
        }
        
        // Prüfen ob E-Mail bereits für diesen Kunden existiert
        const { data: existing } = await supabase
          .from('contact_history')
          .select('id')
          .eq('metadata->>message_id', parsed.messageId || `${message.attributes.uid}-${Date.now()}`)
          .eq('customer_id', customerId)
          .single();
        
        if (existing) {
          console.log(`📧 E-Mail bereits vorhanden für Kunde ${customerEmail}:`, parsed.subject);
          continue;
        }
        
        // Richtung bestimmen
        const isFromCustomer = normalizeEmail(fromEmail).includes(normalizedCustomerEmail);
        
        // E-Mail speichern
        const { error: insertError } = await supabase
          .from('contact_history')
          .insert([{
            customer_id: customerId,
            contact_type: 'email',
            subject: parsed.subject || 'Kein Betreff',
            content: parsed.text || '',
            direction: isFromCustomer ? 'inbound' : 'outbound',
            created_at: (parsed.date || new Date()).toISOString(),
            metadata: {
              message_id: parsed.messageId || `${message.attributes.uid}-${Date.now()}`,
              from_email: fromEmail,
              to_emails: toEmails,
              cc_emails: ccEmails || [],
              has_attachments: (parsed.attachments || []).length > 0,
              attachments: (parsed.attachments || []).map(att => ({
                filename: att.filename || 'unbekannt',
                contentType: att.contentType || 'application/octet-stream',
                size: att.size || 0
              })),
              html_content: parsed.html,
              sync_source: 'imap_multi_customer',
              source_account: account.email,
              customer_email: customerEmail
            }
          }]);
        
        if (insertError) {
          console.error(`❌ Fehler beim Speichern der E-Mail für ${customerEmail}:`, insertError);
          continue;
        }
        
        // Letztes Kontaktdatum aktualisieren
        await supabase
          .from('customers')
          .update({ 
            last_contact_date: (parsed.date || new Date()).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId);
        
        console.log(`✅ E-Mail gespeichert für ${customerEmail}: ${parsed.subject} (${isFromCustomer ? 'eingehend' : 'ausgehend'}) [${account.email}]`);
        result.newEmails++;
        
      } catch (parseError) {
        console.error(`❌ Fehler beim Verarbeiten der E-Mail für ${account.email}:`, parseError);
        result.errors.push(`Fehler beim Verarbeiten: ${String(parseError)}`);
      }
    }
    
    result.success = true;
    console.log(`✅ Kundenspezifische E-Mail-Synchronisation abgeschlossen für ${account.email}: ${result.newEmails}/${result.emailsProcessed} neue E-Mails`);
    
  } catch (error) {
    console.error(`❌ Fehler bei der kundenspezifischen E-Mail-Synchronisation für ${account.email}:`, error);
    result.errors.push(`Allgemeiner Fehler: ${String(error)}`);
  } finally {
    if (connection) {
      try {
        connection.end();
        console.log(`📧 IMAP-Verbindung geschlossen für ${account.email}`);
      } catch (closeError) {
        console.error(`❌ Fehler beim Schließen der IMAP-Verbindung für ${account.email}:`, closeError);
      }
    }
  }
  
  return result;
}

// E-Mails für einen Account synchronisieren (allgemeine Synchronisation)
async function syncAccountEmails(account: IMAPAccount, supabase: any, sinceHours: number = 24): Promise<{
  success: boolean;
  emailsProcessed: number;
  newEmails: number;
  errors: string[];
}> {
  const result: {
    success: boolean;
    emailsProcessed: number;
    newEmails: number;
    errors: string[];
  } = {
    success: false,
    emailsProcessed: 0,
    newEmails: 0,
    errors: []
  };
  
  let connection: any = null;
  
  try {
    console.log(`📧 Synchronisiere Account: ${account.email}`);
    
    const imapConfig = createIMAPConfig(account);
    
    // IMAP-Verbindung herstellen
    connection = await imaps.connect(imapConfig);
    console.log(`✅ IMAP-Verbindung hergestellt für ${account.email}`);
    
    // Beide Ordner synchronisieren: INBOX und Gesendete Objekte
    const foldersToSync = ['INBOX', 'Gesendete Objekte'];
    let allMessages: any[] = [];
    
    for (const folderName of foldersToSync) {
      try {
        console.log(`📧 Öffne Ordner: ${folderName} für ${account.email}`);
        await connection.openBox(folderName);
        
        const searchCriteria = ['ALL'];
        const messages = await connection.search(searchCriteria, { 
          bodies: '',
          struct: true 
        });
        
        console.log(`📧 ${messages.length} E-Mails in ${folderName} gefunden für ${account.email}`);
        
        const messagesWithFolder = messages.map((msg: any) => ({
          ...msg,
          folder: folderName
        }));
        
        allMessages = allMessages.concat(messagesWithFolder);
      } catch (folderError) {
        console.log(`⚠️ Konnte Ordner ${folderName} nicht öffnen für ${account.email}:`, folderError);
        result.errors.push(`Ordner ${folderName} nicht verfügbar`);
      }
    }
    
    console.log(`📧 Insgesamt ${allMessages.length} E-Mails gefunden für ${account.email}, verarbeite maximal 20...`);
    
    const limitedMessages = allMessages.slice(-20);
    result.emailsProcessed = limitedMessages.length;
    
    // E-Mails verarbeiten
    for (const message of limitedMessages) {
      try {
        let emailBody = '';
        
        if (message.parts && message.parts.length > 0) {
          for (const part of message.parts) {
            if (part.body) {
              emailBody += part.body;
            }
          }
        }
        
        if (!emailBody) {
          console.log(`⚠️ Kein E-Mail-Body gefunden für UID: ${message.attributes?.uid} [${account.email}]`);
          continue;
        }
        
        const parsed = await simpleParser(emailBody);
        
        const fromEmail = extractEmailAddress(parsed.from);
        const toEmails = extractEmailAddresses(parsed.to);
        const ccEmails = extractEmailAddresses(parsed.cc);
        
        console.log(`📧 [${account.email}] Extrahierte E-Mail-Adressen:`);
        console.log(`   Von: "${fromEmail}"`);
        console.log(`   An: [${toEmails.join(', ')}]`);
        if (ccEmails.length > 0) {
          console.log(`   CC: [${ccEmails.join(', ')}]`);
        }
        
        const allEmails = [fromEmail, ...toEmails, ...ccEmails];
        
        if (allEmails.some(email => isDomainEmail(email))) {
          const email: ParsedEmail = {
            messageId: parsed.messageId || `${message.attributes.uid}-${Date.now()}`,
            from: fromEmail,
            to: toEmails,
            cc: ccEmails,
            subject: parsed.subject || 'Kein Betreff',
            text: parsed.text || '',
            html: parsed.html || undefined,
            date: parsed.date || new Date(),
            attachments: (parsed.attachments || []).map(att => ({
              filename: att.filename || 'unbekannt',
              contentType: att.contentType || 'application/octet-stream',
              size: att.size || 0
            }))
          };
          
          const saved = await saveEmailToDatabase(email, supabase, account.email);
          if (saved) {
            result.newEmails++;
          }
        }
      } catch (parseError) {
        console.error(`❌ Fehler beim Verarbeiten der E-Mail für ${account.email}:`, parseError);
        result.errors.push(`Fehler beim Verarbeiten: ${String(parseError)}`);
      }
    }
    
    result.success = true;
    console.log(`✅ E-Mail-Synchronisation abgeschlossen für ${account.email}: ${result.newEmails}/${result.emailsProcessed} neue E-Mails`);
    
  } catch (error) {
    console.error(`❌ Fehler bei der E-Mail-Synchronisation für ${account.email}:`, error);
    result.errors.push(`Allgemeiner Fehler: ${String(error)}`);
  } finally {
    if (connection) {
      try {
        connection.end();
        console.log(`📧 IMAP-Verbindung geschlossen für ${account.email}`);
      } catch (closeError) {
        console.error(`❌ Fehler beim Schließen der IMAP-Verbindung für ${account.email}:`, closeError);
      }
    }
  }
  
  return result;
}

// Kundenspezifische E-Mail-Synchronisation (Performance-optimiert)
export async function syncEmailsForSpecificCustomer(customerEmail: string, sinceHours: number = 24): Promise<EmailSyncResult> {
  const result: EmailSyncResult = {
    success: false,
    emailsProcessed: 0,
    newEmails: 0,
    errors: [],
    accountResults: []
  };
  
  try {
    console.log(`📧 Starte kundenspezifische E-Mail-Synchronisation für: ${customerEmail}`);
    
    // Supabase-Client erstellen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Kunden-ID ermitteln
    const customerId = await findExistingCustomer(customerEmail, supabase);
    if (!customerId) {
      result.errors.push(`Kunde mit E-Mail ${customerEmail} nicht gefunden`);
      return result;
    }
    
    // IMAP-Accounts laden
    const accounts = getIMAPAccounts();
    console.log(`📧 Gefundene IMAP-Accounts: ${accounts.map(a => a.email).join(', ')}`);
    
    if (accounts.length === 0) {
      result.errors.push('Keine IMAP-Accounts konfiguriert');
      return result;
    }
    
    // Jeden Account nach E-Mails für diesen spezifischen Kunden durchsuchen
    for (const account of accounts) {
      const accountResult = await syncAccountEmailsForCustomer(account, supabase, customerEmail, customerId, sinceHours);
      
      result.accountResults.push({
        account: account.email,
        success: accountResult.success,
        emailsProcessed: accountResult.emailsProcessed,
        newEmails: accountResult.newEmails,
        errors: accountResult.errors
      });
      
      result.emailsProcessed += accountResult.emailsProcessed;
      result.newEmails += accountResult.newEmails;
      result.errors.push(...accountResult.errors.map((err: string) => `[${account.email}] ${err}`));
    }
    
    result.success = result.accountResults.some(r => r.success);
    console.log(`✅ Kundenspezifische E-Mail-Synchronisation abgeschlossen für ${customerEmail}: ${result.newEmails}/${result.emailsProcessed} neue E-Mails`);
    
  } catch (error) {
    console.error('❌ Fehler bei der kundenspezifischen E-Mail-Synchronisation:', error);
    result.errors.push(`Allgemeiner Fehler: ${String(error)}`);
  }
  
  return result;
}

// Hauptfunktion: E-Mails von allen Accounts synchronisieren (für allgemeine Synchronisation)
export async function syncEmailsFromMultipleIMAP(sinceHours: number = 24): Promise<EmailSyncResult> {
  const result: EmailSyncResult = {
    success: false,
    emailsProcessed: 0,
    newEmails: 0,
    errors: [],
    accountResults: []
  };
  
  try {
    console.log('📧 Starte Multi-Account E-Mail-Synchronisation...');
    
    // Supabase-Client erstellen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // IMAP-Accounts laden
    const accounts = getIMAPAccounts();
    console.log(`📧 Gefundene IMAP-Accounts: ${accounts.map(a => a.email).join(', ')}`);
    
    if (accounts.length === 0) {
      result.errors.push('Keine IMAP-Accounts konfiguriert');
      return result;
    }
    
    // Jeden Account synchronisieren
    for (const account of accounts) {
      const accountResult = await syncAccountEmails(account, supabase, sinceHours);
      
      result.accountResults.push({
        account: account.email,
        success: accountResult.success,
        emailsProcessed: accountResult.emailsProcessed,
        newEmails: accountResult.newEmails,
        errors: accountResult.errors
      });
      
      result.emailsProcessed += accountResult.emailsProcessed;
      result.newEmails += accountResult.newEmails;
      result.errors = result.errors.concat(accountResult.errors.map(err => `[${account.email}] ${err}`));
    }
    
    result.success = result.accountResults.some(r => r.success);
    console.log(`✅ Multi-Account E-Mail-Synchronisation abgeschlossen: ${result.newEmails}/${result.emailsProcessed} neue E-Mails`);
    
  } catch (error) {
    console.error('❌ Fehler bei der Multi-Account E-Mail-Synchronisation:', error);
    result.errors.push(`Allgemeiner Fehler: ${String(error)}`);
  }
  
  return result;
}

// Multi-IMAP-Konfiguration anzeigen
export function getMultiIMAPConfig() {
  const accounts = getIMAPAccounts();
  return {
    host: process.env.IMAP_HOST || 'imap.ionos.de',
    port: parseInt(process.env.IMAP_PORT || '993'),
    accounts: accounts.map(a => ({ email: a.email, configured: !!a.password })),
    domainEmails: DOMAIN_EMAILS,
    totalAccounts: accounts.length
  };
}
