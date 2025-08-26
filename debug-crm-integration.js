// Debug-Script für CRM-Integration
// Führen Sie dieses Script aus, um die CRM-Integration zu testen

// Lade .env.local Datei manuell (ohne dotenv)
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Entferne Anführungszeichen
          process.env[key.trim()] = value.trim();
        }
      }
    });
    console.log('✅ .env.local erfolgreich geladen');
  } catch (error) {
    console.error('❌ Fehler beim Laden der .env.local:', error.message);
    console.error('Stellen Sie sicher, dass die .env.local Datei existiert und die Supabase-Variablen enthält.');
  }
}

// Lade Umgebungsvariablen
loadEnvFile();

const { createClient } = require('@supabase/supabase-js');

// Konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Umgebungsvariablen fehlen:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Gesetzt' : '❌ Fehlt');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Gesetzt' : '❌ Fehlt');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugCRMIntegration() {
  console.log('🔍 Debug CRM-Integration\n');

  // 1. Teste Supabase-Verbindung
  console.log('1. Teste Supabase-Verbindung...');
  try {
    const { data, error } = await supabase.from('customers').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase-Verbindung fehlgeschlagen:', error.message);
      return;
    }
    console.log('✅ Supabase-Verbindung erfolgreich\n');
  } catch (error) {
    console.error('❌ Supabase-Verbindung fehlgeschlagen:', error.message);
    return;
  }

  // 2. Prüfe Tabellen-Schema
  console.log('2. Prüfe customers Tabelle...');
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Fehler beim Zugriff auf customers Tabelle:', error.message);
      console.error('Details:', error);
      
      // Prüfe ob die Tabelle überhaupt existiert
      if (error.message.includes('does not exist')) {
        console.error('🔍 Die customers Tabelle existiert nicht!');
        console.error('Sie müssen das CRM-Schema zuerst in Supabase ausführen:');
        console.error('1. Öffnen Sie Supabase Dashboard');
        console.error('2. Gehen Sie zu SQL Editor');
        console.error('3. Führen Sie supabase-crm-extended-schema.sql aus');
        return;
      }
    } else {
      console.log('✅ customers Tabelle ist zugänglich');
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      console.log('Verfügbare Spalten:', columns);
      
      // Prüfe ob CRM-Spalten vorhanden sind
      const requiredCrmColumns = ['lead_status', 'country', 'product_interests', 'priority', 'tags'];
      const missingColumns = requiredCrmColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('❌ CRM-Schema ist nicht vollständig installiert!');
        console.error('Fehlende Spalten:', missingColumns);
        console.error('');
        console.error('LÖSUNG:');
        console.error('1. Öffnen Sie Supabase Dashboard → SQL Editor');
        console.error('2. Führen Sie supabase-crm-extended-schema.sql aus');
        console.error('3. Oder führen Sie dieses SQL aus:');
        console.error('');
        console.error('-- Füge CRM-Spalten zur bestehenden customers Tabelle hinzu');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT \'neu\';');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT \'Deutschland\';');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS product_interests TEXT[] DEFAULT \'{}\';');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3;');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT \'{}\';');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS lead_source TEXT;');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2);');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS probability INTEGER;');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS gdpr_consent BOOLEAN DEFAULT false;');
        console.error('ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;');
        return;
      } else {
        console.log('✅ CRM-Schema ist vollständig installiert');
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Zugriff auf customers Tabelle:', error.message);
  }

  // 3. Teste CRM-Lead Erstellung (nur mit Basis-Spalten)
  console.log('\n3. Teste CRM-Lead Erstellung...');
  const testLeadData = {
    first_name: 'Test',
    last_name: 'Kunde',
    email: `test-${Date.now()}@example.com`
  };
  
  // Füge CRM-Spalten nur hinzu, wenn sie existieren
  const { data: schemaCheck } = await supabase.from('customers').select('*').limit(0);
  if (schemaCheck !== null) {
    // Erweiterte CRM-Daten nur wenn Schema vollständig ist
    testLeadData.country = 'Deutschland';
    testLeadData.lead_status = 'neu';
    testLeadData.lead_source = 'Debug-Test';
    testLeadData.estimated_value = null;
    testLeadData.probability = 25;
    testLeadData.product_interests = ['pv'];
    testLeadData.priority = 3;
    testLeadData.tags = ['debug', 'test'];
    testLeadData.notes = 'Debug-Test Lead';
    testLeadData.gdpr_consent = true;
    testLeadData.marketing_consent = false;
  }

  try {
    const { data: crmLead, error: crmError } = await supabase
      .from('customers')
      .insert([testLeadData])
      .select()
      .single();

    if (crmError) {
      console.error('❌ Fehler beim Erstellen des Test-Leads:', crmError.message);
      console.error('Details:', crmError);
      
      // Spezifische Fehleranalyse
      if (crmError.message.includes('enum')) {
        console.error('🔍 Enum-Fehler erkannt. Mögliche Ursachen:');
        console.error('- product_interests Array enthält ungültige Werte');
        console.error('- lead_status ist ungültig');
        console.error('Gültige product_interest Werte: pv, speicher, waermepumpe, fenster, tueren, daemmung, rollaeden');
        console.error('Gültige lead_status Werte: neu, qualifiziert, angebot_erstellt, in_verhandlung, gewonnen, verloren');
      }
      
      if (crmError.message.includes('RLS') || crmError.message.includes('policy')) {
        console.error('🔍 RLS-Policy-Fehler erkannt. Mögliche Ursachen:');
        console.error('- Row Level Security blockiert den Insert');
        console.error('- Service Role Key hat nicht die richtigen Berechtigungen');
      }
    } else {
      console.log('✅ Test-Lead erfolgreich erstellt:', crmLead.id);
      
      // 4. Teste Kontakt-Historie
      console.log('\n4. Teste Kontakt-Historie...');
      try {
        const { data: contactHistory, error: historyError } = await supabase
          .from('contact_history')
          .insert([{
            customer_id: crmLead.id,
            contact_type: 'website_formular',
            subject: 'Debug-Test Kontakt',
            content: 'Test-Nachricht für Debug',
            direction: 'inbound',
            metadata: {
              debug: true,
              timestamp: new Date().toISOString()
            }
          }])
          .select()
          .single();

        if (historyError) {
          console.error('❌ Fehler beim Erstellen der Kontakt-Historie:', historyError.message);
        } else {
          console.log('✅ Kontakt-Historie erfolgreich erstellt:', contactHistory.id);
        }
      } catch (error) {
        console.error('❌ Fehler bei Kontakt-Historie:', error.message);
      }

      // 5. Cleanup - Test-Lead löschen
      console.log('\n5. Cleanup - Test-Lead löschen...');
      try {
        const { error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', crmLead.id);

        if (deleteError) {
          console.error('❌ Fehler beim Löschen des Test-Leads:', deleteError.message);
        } else {
          console.log('✅ Test-Lead erfolgreich gelöscht');
        }
      } catch (error) {
        console.error('❌ Fehler beim Löschen:', error.message);
      }
    }
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error.message);
  }

  // 6. Prüfe bestehende Kunden
  console.log('\n6. Prüfe bestehende Kunden...');
  try {
    // Verwende nur Basis-Spalten die sicher existieren
    const { data: existingCustomers, error: listError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (listError) {
      console.error('❌ Fehler beim Laden der Kunden:', listError.message);
    } else {
      console.log('✅ Bestehende Kunden:', existingCustomers.length);
      existingCustomers.forEach(customer => {
        console.log(`- ${customer.first_name} ${customer.last_name} (${customer.email})`);
      });
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der Kunden:', error.message);
  }

  console.log('\n🏁 Debug abgeschlossen');
}

// Script ausführen
debugCRMIntegration().catch(console.error);
