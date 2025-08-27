// @ts-ignore - imap-simple has no types
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

// IMAP-Konfiguration für IONOS mit imap-simple
const IMAP_CONFIG = {
  imap: {
    user: process.env.IMAP_USER || '',
    password: process.env.IMAP_PASSWORD || '',
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

// Kunden-E-Mail aus E-Mail-Adressen extrahieren (Legacy-Funktion für Kompatibilität)
function extractCustomerEmail(fromEmail: string, toEmails: string[]): string | null {
  const customerEmails = extractCustomerEmails(fromEmail, toEmails);
  return customerEmails.length > 0 ? customerEmails[0] : null;
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
async function saveEmailToDatabase(email: ParsedEmail, supabase: any): Promise<boolean> {
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
            sync_source: 'imap_simple',
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
      
      console.log(`✅ E-Mail gespeichert für ${customerEmail}: ${email.subject} (${isFromCustomer ? 'eingehend' : 'ausgehend'})`);
      savedCount++;
    }
    
    return savedCount > 0;
    
  } catch (error) {
    console.error('❌ Fehler beim Speichern der E-Mail:', error);
    return false;
  }
}

// Hauptfunktion: E-Mails synchronisieren mit imap-simple
export async function syncEmailsFromIMAP(sinceHours: number = 24): Promise<EmailSyncResult> {
  const result: EmailSyncResult = {
    success: false,
    emailsProcessed: 0,
    newEmails: 0,
    errors: []
  };
  
  let connection: any = null;
  
  try {
    console.log('📧 Starte E-Mail-Synchronisation mit imap-simple...');
    
    // Supabase-Client erstellen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Zeitpunkt für die Suche
    const since = new Date(Date.now() - (sinceHours * 60 * 60 * 1000));
    console.log(`📧 Synchronisiere E-Mails seit: ${since.toISOString()}`);
    
    // IMAP-Verbindung herstellen
    console.log('🔗 Verbinde mit IMAP-Server...');
    connection = await imaps.connect(IMAP_CONFIG);
    console.log('✅ IMAP-Verbindung hergestellt');
    
    // Beide Ordner synchronisieren: INBOX und Gesendete Objekte
    const foldersToSync = ['INBOX', 'Gesendete Objekte'];
    let allMessages: any[] = [];
    
    for (const folderName of foldersToSync) {
      try {
        console.log(`📧 Öffne Ordner: ${folderName}`);
        await connection.openBox(folderName);
        
        // Suche nach allen E-Mails (ohne Datumsfilter für Kompatibilität)
        const searchCriteria = ['ALL'];
        const messages = await connection.search(searchCriteria, { 
          bodies: '',
          struct: true 
        });
        
        console.log(`📧 ${messages.length} E-Mails in ${folderName} gefunden`);
        
        // Markiere Nachrichten mit dem Ordner
        const messagesWithFolder = messages.map((msg: any) => ({
          ...msg,
          folder: folderName
        }));
        
        allMessages = allMessages.concat(messagesWithFolder);
      } catch (folderError) {
        console.log(`⚠️ Konnte Ordner ${folderName} nicht öffnen:`, folderError);
        result.errors.push(`Ordner ${folderName} nicht verfügbar`);
      }
    }
    
    console.log(`📧 Insgesamt ${allMessages.length} E-Mails gefunden, verarbeite maximal 20...`);
    
    // Begrenze auf 20 E-Mails für erweiterte Suche
    const limitedMessages = allMessages.slice(-20);
    result.emailsProcessed = limitedMessages.length;
    
    // E-Mails verarbeiten
    for (const message of limitedMessages) {
      try {
        // E-Mail-Body aus parts extrahieren
        let emailBody = '';
        
        if (message.parts && message.parts.length > 0) {
          // Suche nach dem Hauptteil der E-Mail
          for (const part of message.parts) {
            if (part.body) {
              emailBody += part.body;
            }
          }
        }
        
        if (!emailBody) {
          console.log('⚠️ Kein E-Mail-Body in parts gefunden für UID:', message.attributes?.uid);
          console.log('⚠️ Message structure:', Object.keys(message));
          console.log('⚠️ Parts:', message.parts?.length || 0);
          continue;
        }
        
        // E-Mail-Inhalt parsen
        const parsed = await simpleParser(emailBody);
        
        // E-Mail-Adressen extrahieren mit verbesserter Logik
        let fromEmail = '';
        let toEmails: string[] = [];
        let ccEmails: string[] = [];
        
        // Hilfsfunktion: E-Mail-Adresse aus verschiedenen Formaten extrahieren
        function extractEmailAddress(emailField: any): string {
          if (!emailField) return '';
          
          if (typeof emailField === 'string') {
            // Direkte E-Mail-Adresse oder "Name <email@domain.com>" Format
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
        
        // Hilfsfunktion: Mehrere E-Mail-Adressen extrahieren
        function extractEmailAddresses(emailField: any): string[] {
          if (!emailField) return [];
          
          if (typeof emailField === 'string') {
            // Komma-getrennte E-Mail-Adressen
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
        
        // From-Adresse extrahieren
        fromEmail = extractEmailAddress(parsed.from);
        
        // To-Adressen extrahieren
        toEmails = extractEmailAddresses(parsed.to);
        
        // CC-Adressen extrahieren
        ccEmails = extractEmailAddresses(parsed.cc);
        
        console.log(`📧 Extrahierte E-Mail-Adressen:`);
        console.log(`   Von: "${fromEmail}"`);
        console.log(`   An: [${toEmails.join(', ')}]`);
        if (ccEmails.length > 0) {
          console.log(`   CC: [${ccEmails.join(', ')}]`);
        }
        
        console.log(`📧 Verarbeite E-Mail: Von "${fromEmail}" an "${toEmails.join(', ')}"${ccEmails.length > 0 ? ` CC: "${ccEmails.join(', ')}"` : ''} - ${parsed.subject}`);
        
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
          
          const saved = await saveEmailToDatabase(email, supabase);
          if (saved) {
            result.newEmails++;
          }
        }
      } catch (parseError) {
        console.error('❌ Fehler beim Verarbeiten der E-Mail:', parseError);
        result.errors.push(`Fehler beim Verarbeiten: ${parseError}`);
      }
    }
    
    result.success = true;
    console.log(`✅ E-Mail-Synchronisation abgeschlossen: ${result.newEmails}/${result.emailsProcessed} neue E-Mails`);
    
  } catch (error) {
    console.error('❌ Fehler bei der E-Mail-Synchronisation:', error);
    result.errors.push(`Allgemeiner Fehler: ${error}`);
  } finally {
    // IMAP-Verbindung schließen
    if (connection) {
      try {
        connection.end();
        console.log('📧 IMAP-Verbindung geschlossen');
      } catch (closeError) {
        console.error('❌ Fehler beim Schließen der IMAP-Verbindung:', closeError);
      }
    }
  }
  
  return result;
}

// IMAP-Verbindung testen mit imap-simple
export async function testIMAPConnection(): Promise<boolean> {
  let connection: any = null;
  
  try {
    console.log('🔍 Teste IMAP-Verbindung mit imap-simple...');
    connection = await imaps.connect(IMAP_CONFIG);
    console.log('✅ IMAP-Verbindung erfolgreich');
    
    // Postfächer auflisten
    const boxes = await connection.getBoxes();
    console.log('📧 Verfügbare Postfächer:', Object.keys(boxes));
    
    return true;
    
  } catch (error) {
    console.error('❌ IMAP-Verbindungstest fehlgeschlagen:', error);
    return false;
  } finally {
    if (connection) {
      try {
        connection.end();
      } catch (closeError) {
        console.error('❌ Fehler beim Schließen der Test-Verbindung:', closeError);
      }
    }
  }
}

// IMAP-Konfiguration anzeigen (ohne Passwort)
export function getIMAPConfig() {
  return {
    host: IMAP_CONFIG.imap.host,
    port: IMAP_CONFIG.imap.port,
    user: IMAP_CONFIG.imap.user,
    domainEmails: DOMAIN_EMAILS,
    configured: !!(IMAP_CONFIG.imap.user && IMAP_CONFIG.imap.password)
  };
}
