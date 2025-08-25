/**
 * Test-Skript für Google Sheets Synchronisation
 * 
 * Dieses Skript testet die Google Sheets Integration ohne die Next.js App zu starten.
 * Führen Sie es aus mit: node test-google-sheets-sync.js
 */

const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Lade Umgebungsvariablen
require('dotenv').config({ path: '.env.local' });

async function testGoogleSheetsSync() {
  console.log('🚀 Starte Google Sheets Synchronisation Test...\n');

  // 1. Umgebungsvariablen prüfen
  console.log('1. Prüfe Umgebungsvariablen...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_SHEETS_CLIENT_EMAIL',
    'GOOGLE_SHEETS_PRIVATE_KEY',
    'GOOGLE_SHEETS_SPREADSHEET_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Fehlende Umgebungsvariablen:', missingVars.join(', '));
    console.log('   Bitte konfigurieren Sie diese in Ihrer .env.local Datei');
    return;
  }
  console.log('✅ Alle Umgebungsvariablen vorhanden\n');

  // 2. Supabase Verbindung testen
  console.log('2. Teste Supabase Verbindung...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase Fehler:', error.message);
      return;
    }
    console.log('✅ Supabase Verbindung erfolgreich\n');
  } catch (error) {
    console.error('❌ Supabase Verbindung fehlgeschlagen:', error.message);
    return;
  }

  // 3. Google Sheets Verbindung testen
  console.log('3. Teste Google Sheets Verbindung...');
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    console.log('✅ Google Sheets Verbindung erfolgreich');
    console.log(`   Spreadsheet: "${spreadsheet.data.properties.title}"`);
    console.log(`   Sheets: ${spreadsheet.data.sheets.length} Arbeitsblätter\n`);
  } catch (error) {
    console.error('❌ Google Sheets Verbindung fehlgeschlagen:', error.message);
    if (error.message.includes('Invalid JWT')) {
      console.log('   Tipp: Überprüfen Sie den GOOGLE_SHEETS_PRIVATE_KEY');
    }
    if (error.message.includes('not found')) {
      console.log('   Tipp: Überprüfen Sie die GOOGLE_SHEETS_SPREADSHEET_ID');
    }
    if (error.message.includes('permission')) {
      console.log('   Tipp: Stellen Sie sicher, dass der Service Account Zugriff auf das Spreadsheet hat');
    }
    return;
  }

  // 4. Test-Daten zu Google Sheets schreiben
  console.log('4. Teste Schreibvorgang zu Google Sheets...');
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Erstelle Test-Sheet falls nicht vorhanden
    const testSheetName = 'Test-Sync';
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    const existingSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties.title === testSheetName
    );

    if (!existingSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: testSheetName,
                },
              },
            },
          ],
        },
      });
      console.log(`   ✅ Test-Sheet "${testSheetName}" erstellt`);
    }

    // Schreibe Test-Daten
    const testData = [
      ['ID', 'Name', 'Email', 'Datum'],
      ['1', 'Test User', 'test@example.com', new Date().toISOString().split('T')[0]],
      ['2', 'Max Mustermann', 'max@example.com', new Date().toISOString().split('T')[0]]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${testSheetName}!A1:D3`,
      valueInputOption: 'RAW',
      requestBody: {
        values: testData,
      },
    });

    console.log('✅ Test-Daten erfolgreich geschrieben\n');
  } catch (error) {
    console.error('❌ Schreibvorgang fehlgeschlagen:', error.message);
    return;
  }

  // 5. Vollständige Synchronisation testen (falls Daten vorhanden)
  console.log('5. Teste vollständige Synchronisation...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Prüfe ob Kunden-Daten vorhanden sind
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .limit(5);

    if (error) {
      console.log('⚠️  Keine Kunden-Daten zum Testen verfügbar');
    } else if (customers && customers.length > 0) {
      console.log(`   📊 ${customers.length} Kunden-Datensätze gefunden`);
      
      // Simuliere Synchronisation
      const auth = new JWT({
        email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      
      // Erstelle Kunden-Sheet
      const customerSheetName = 'Kunden-Test';
      const headers = ['ID', 'Vorname', 'Nachname', 'Email', 'Telefon', 'Status', 'Erstellt'];
      
      const formattedData = customers.map(customer => [
        customer.id,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone || '',
        customer.status,
        customer.created_at ? customer.created_at.split('T')[0] : ''
      ]);

      const allData = [headers, ...formattedData];

      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `${customerSheetName}!A1:G${allData.length}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: allData,
        },
      });

      console.log(`✅ ${customers.length} Kunden-Datensätze synchronisiert`);
    } else {
      console.log('   ℹ️  Keine Kunden-Daten zum Synchronisieren vorhanden');
    }
  } catch (error) {
    console.error('❌ Synchronisation fehlgeschlagen:', error.message);
  }

  console.log('\n🎉 Test abgeschlossen!');
  console.log('\nNächste Schritte:');
  console.log('1. Überprüfen Sie Ihr Google Sheets Dokument');
  console.log('2. Starten Sie Ihre Next.js App: npm run dev');
  console.log('3. Testen Sie die API: curl http://localhost:3000/api/sync-google-sheets');
  console.log('4. Führen Sie eine manuelle Synchronisation durch: curl -X POST http://localhost:3000/api/sync-google-sheets');
}

// Führe Test aus
testGoogleSheetsSync().catch(console.error);
