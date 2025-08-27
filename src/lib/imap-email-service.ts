import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

// IMAP-Konfiguration für IONOS
const IMAP_CONFIG = {
  host: process.env.IMAP_HOST || 'imap.ionos.de',
  port: parseInt(process.env.IMAP_PORT || '993'),
  tls: true,
  user: process.env.IMAP_USER || '',
  password: process.env.IMAP_PASSWORD || '',
  tlsOptions: {
    rejectUnauthorized: false
  },
  connTimeout: 30000, // 30 Sekunden Verbindungs-Timeout
  authTimeout: 30000, // 30 Sekunden Auth-Timeout
  keepalive: false
};

// Maximale Anzahl E-Mails pro Ordner
const MAX_EMAILS_PER_FOLDER = 50;

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

// Kunden-E-Mail aus E-Mail-Adressen extrahieren
function extractCustomerEmail(fromEmail: string, toEmails: string[]): string | null {
  const normalizedFrom = normalizeEmail(fromEmail);
  
  // Wenn From-Adresse eine Domain-Adresse ist, dann ist es eine ausgehende E-Mail
  if (isDomainEmail(normalizedFrom)) {
    // Suche nach Kunden-E-Mail in To-Adressen
    const customerEmail = toEmails.find(email => !isDomainEmail(email));
    return customerEmail || null;
  } else {
    // Eingehende E-Mail - From ist die Kunden-E-Mail
    return fromEmail;
  }
}

// IMAP-Verbindung erstellen
function createImapConnection(): Promise<Imap> {
  return new Promise((resolve, reject) => {
    const imap = new Imap(IMAP_CONFIG);
    
    imap.once('ready', () => {
      console.log('✅ IMAP-Verbindung erfolgreich hergestellt');
      resolve(imap);
    });
    
    imap.once('error', (err: Error) => {
      console.error('❌ IMAP-Verbindungsfehler:', err);
      reject(err);
    });
    
    imap.connect();
  });
}

// E-Mails aus IMAP-Ordner abrufen
function fetchEmailsFromFolder(imap: Imap, folderName: string, since: Date): Promise<ParsedEmail[]> {
  return new Promise((resolve, reject) => {
    // Timeout für die gesamte Operation
    const timeout = setTimeout(() => {
      console.error(`⏰ Timeout beim Abrufen von E-Mails aus ${folderName}`);
      reject(new Error(`Timeout beim Abrufen von E-Mails aus ${folderName}`));
    }, 60000); // 60 Sekunden Timeout

    imap.openBox(folderName, true, (err, box) => {
      if (err) {
        clearTimeout(timeout);
        console.error(`❌ Fehler beim Öffnen des Ordners ${folderName}:`, err);
        reject(err);
        return;
      }

      console.log(`📧 Ordner ${folderName} geöffnet - ${box.messages.total} Nachrichten`);

      // Suche nach E-Mails seit dem angegebenen Datum
      const searchCriteria = ['SINCE', since];
      
      imap.search(searchCriteria, (err, results) => {
        if (err) {
          clearTimeout(timeout);
          console.error(`❌ Fehler bei der E-Mail-Suche in ${folderName}:`, err);
          reject(err);
          return;
        }

        if (!results || results.length === 0) {
          clearTimeout(timeout);
          console.log(`📧 Keine neuen E-Mails in ${folderName} seit ${since.toISOString()}`);
          resolve([]);
          return;
        }

        // Begrenze die Anzahl der E-Mails pro Ordner noch weiter für Tests
        const limitedResults = results.slice(-Math.min(MAX_EMAILS_PER_FOLDER, 10));
        console.log(`📧 ${results.length} E-Mails gefunden in ${folderName}, verarbeite die neuesten ${limitedResults.length}`);

        const emails: ParsedEmail[] = [];
        let processed = 0;
        let hasError = false;

        const fetch = imap.fetch(limitedResults, { bodies: '', struct: true });
        
        fetch.on('message', (msg, seqno) => {
          let buffer = '';
          
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });
          
          msg.once('end', async () => {
            if (hasError) return;
            
            try {
              const parsed = await simpleParser(buffer);
              
              // Nur E-Mails verarbeiten, die Domain-Adressen betreffen
              // @ts-ignore - mailparser types issue
              const fromEmail = String(parsed.from?.text || '');
              // @ts-ignore - mailparser types issue
              const toEmails = String(parsed.to?.text || '').split(',').map((e: string) => e.trim()).filter(e => e);
              const allEmails = [fromEmail, ...toEmails];
              
              if (allEmails.some(email => isDomainEmail(email))) {
                const email: ParsedEmail = {
                  messageId: parsed.messageId || `${seqno}-${Date.now()}`,
                  from: fromEmail,
                  to: toEmails,
                  cc: [],
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
                
                emails.push(email);
              }
              
              processed++;
              if (processed === limitedResults.length) {
                clearTimeout(timeout);
                resolve(emails);
              }
            } catch (parseError) {
              console.error('❌ Fehler beim Parsen der E-Mail:', parseError);
              processed++;
              if (processed === limitedResults.length) {
                clearTimeout(timeout);
                resolve(emails);
              }
            }
          });
        });
        
        fetch.once('error', (err) => {
          if (hasError) return;
          hasError = true;
          clearTimeout(timeout);
          console.error(`❌ Fehler beim Abrufen der E-Mails aus ${folderName}:`, err);
          reject(err);
        });

        fetch.once('end', () => {
          // Fallback falls keine Nachrichten verarbeitet wurden
          setTimeout(() => {
            if (processed === 0 && !hasError) {
              clearTimeout(timeout);
              console.log(`📧 Keine E-Mails verarbeitet in ${folderName}`);
              resolve(emails);
            }
          }, 5000);
        });
      });
    });
  });
}

// Kunde anhand E-Mail-Adresse finden oder erstellen
async function findOrCreateCustomer(email: string, supabase: any): Promise<string | null> {
  try {
    const normalizedEmail = normalizeEmail(email);
    
    // Zuerst versuchen, bestehenden Kunden zu finden
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', normalizedEmail)
      .single();
    
    if (existingCustomer) {
      return existingCustomer.id;
    }
    
    // Wenn kein Kunde gefunden wurde, neuen erstellen
    const emailParts = email.split('@');
    const namePart = emailParts[0];
    
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert([{
        email: normalizedEmail,
        first_name: namePart,
        last_name: '',
        status: 'lead',
        source: 'email_sync',
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();
    
    if (createError) {
      console.error('❌ Fehler beim Erstellen des Kunden:', createError);
      return null;
    }
    
    console.log(`✅ Neuer Kunde erstellt für E-Mail: ${email}`);
    return newCustomer.id;
    
  } catch (error) {
    console.error('❌ Fehler bei findOrCreateCustomer:', error);
    return null;
  }
}

// E-Mail in Datenbank speichern
async function saveEmailToDatabase(email: ParsedEmail, supabase: any): Promise<boolean> {
  try {
    // Kunden-E-Mail extrahieren
    const customerEmail = extractCustomerEmail(email.from, email.to);
    if (!customerEmail) {
      console.log('⚠️ Keine Kunden-E-Mail gefunden, überspringe:', email.subject);
      return false;
    }
    
    // Kunde finden oder erstellen
    const customerId = await findOrCreateCustomer(customerEmail, supabase);
    if (!customerId) {
      console.error('❌ Kunde konnte nicht gefunden/erstellt werden für:', customerEmail);
      return false;
    }
    
    // Prüfen ob E-Mail bereits existiert
    const { data: existing } = await supabase
      .from('contact_history')
      .select('id')
      .eq('metadata->>message_id', email.messageId)
      .single();
    
    if (existing) {
      console.log('📧 E-Mail bereits vorhanden:', email.subject);
      return false;
    }
    
    // Richtung bestimmen
    const isFromCustomer = !isDomainEmail(email.from);
    
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
          sync_source: 'imap'
        }
      }]);
    
    if (insertError) {
      console.error('❌ Fehler beim Speichern der E-Mail:', insertError);
      return false;
    }
    
    // Letztes Kontaktdatum aktualisieren
    await supabase
      .from('customers')
      .update({ 
        last_contact_date: email.date.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId);
    
    console.log(`✅ E-Mail gespeichert: ${email.subject} (${isFromCustomer ? 'eingehend' : 'ausgehend'})`);
    return true;
    
  } catch (error) {
    console.error('❌ Fehler beim Speichern der E-Mail:', error);
    return false;
  }
}

// Hauptfunktion: E-Mails synchronisieren (vereinfacht)
export async function syncEmailsFromIMAP(sinceHours: number = 24): Promise<EmailSyncResult> {
  const result: EmailSyncResult = {
    success: false,
    emailsProcessed: 0,
    newEmails: 0,
    errors: []
  };
  
  let imap: Imap | null = null;
  
  try {
    // Supabase-Client erstellen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Zeitpunkt für die Suche
    const since = new Date(Date.now() - (sinceHours * 60 * 60 * 1000));
    console.log(`📧 Synchronisiere E-Mails seit: ${since.toISOString()}`);
    
    // IMAP-Verbindung herstellen
    imap = await createImapConnection();
    
    // Nur INBOX abrufen für Test
    console.log('📧 Teste nur INBOX mit maximal 5 E-Mails...');
    const emails = await fetchEmailsFromFolder(imap, 'INBOX', since);
    console.log(`📧 ${emails.length} E-Mails aus INBOX abgerufen`);
    
    result.emailsProcessed = emails.length;
    
    // E-Mails in Datenbank speichern
    for (const email of emails) {
      try {
        const saved = await saveEmailToDatabase(email, supabase);
        if (saved) {
          result.newEmails++;
        }
      } catch (saveError) {
        console.error('❌ Fehler beim Speichern:', saveError);
        result.errors.push(`Fehler beim Speichern: ${saveError}`);
      }
    }
    
    result.success = true;
    console.log(`✅ E-Mail-Synchronisation abgeschlossen: ${result.newEmails}/${result.emailsProcessed} neue E-Mails`);
    
  } catch (error) {
    console.error('❌ Fehler bei der E-Mail-Synchronisation:', error);
    result.errors.push(`Allgemeiner Fehler: ${error}`);
  } finally {
    // IMAP-Verbindung schließen
    if (imap) {
      try {
        imap.end();
        console.log('📧 IMAP-Verbindung geschlossen');
      } catch (closeError) {
        console.error('❌ Fehler beim Schließen der IMAP-Verbindung:', closeError);
      }
    }
  }
  
  return result;
}

// IMAP-Verbindung testen
export async function testIMAPConnection(): Promise<boolean> {
  let imap: Imap | null = null;
  
  try {
    console.log('🔍 Teste IMAP-Verbindung...');
    imap = await createImapConnection();
    
    // Postfächer auflisten
    return new Promise((resolve) => {
      imap!.getBoxes((err, boxes) => {
        if (err) {
          console.error('❌ Fehler beim Abrufen der Postfächer:', err);
          resolve(false);
        } else {
          console.log('✅ IMAP-Verbindung erfolgreich');
          console.log('📧 Verfügbare Postfächer:', Object.keys(boxes));
          resolve(true);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ IMAP-Verbindungstest fehlgeschlagen:', error);
    return false;
  } finally {
    if (imap) {
      try {
        imap.end();
      } catch (closeError) {
        console.error('❌ Fehler beim Schließen der Test-Verbindung:', closeError);
      }
    }
  }
}

// IMAP-Konfiguration anzeigen (ohne Passwort)
export function getIMAPConfig() {
  return {
    host: IMAP_CONFIG.host,
    port: IMAP_CONFIG.port,
    user: IMAP_CONFIG.user,
    domainEmails: DOMAIN_EMAILS,
    configured: !!(IMAP_CONFIG.user && IMAP_CONFIG.password)
  };
}
