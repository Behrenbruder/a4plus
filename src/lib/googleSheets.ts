import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Google Sheets Service Account Konfiguration
interface GoogleSheetsConfig {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
}

export class GoogleSheetsService {
  private sheets: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    // Service Account Authentication
    const auth = new JWT({
      email: config.clientEmail,
      key: config.privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = config.spreadsheetId;
  }

  // Erstelle oder aktualisiere ein Arbeitsblatt
  async createOrUpdateSheet(sheetName: string, headers: string[]) {
    try {
      // Prüfe ob Sheet bereits existiert
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const existingSheet = spreadsheet.data.sheets?.find(
        (sheet: any) => sheet.properties.title === sheetName // eslint-disable-line @typescript-eslint/no-explicit-any
      );

      if (!existingSheet) {
        // Erstelle neues Sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });

        // Füge Header hinzu
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:${this.getColumnLetter(headers.length)}1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });

        // Formatiere Header
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: (await this.getSheetId(sheetName)),
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: headers.length,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                      textFormat: { bold: true },
                    },
                  },
                  fields: 'userEnteredFormat(backgroundColor,textFormat)',
                },
              },
            ],
          },
        });
      }

      return true;
    } catch (error) {
      console.error(`Fehler beim Erstellen/Aktualisieren des Sheets ${sheetName}:`, error);
      throw error;
    }
  }

  // Synchronisiere Daten zu Google Sheets
  async syncDataToSheet(sheetName: string, data: any[], headers: string[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      // Stelle sicher, dass das Sheet existiert
      await this.createOrUpdateSheet(sheetName, headers);

      // Lösche alle bestehenden Daten (außer Header)
      await this.clearSheetData(sheetName);

      if (data.length === 0) {
        return true;
      }

      // Konvertiere Daten zu 2D Array
      const values = data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
          if (value instanceof Date) return value.toISOString().split('T')[0];
          return String(value);
        })
      );

      // Füge Daten hinzu
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:${this.getColumnLetter(headers.length)}${values.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: values,
        },
      });

      // Auto-resize Spalten
      await this.autoResizeColumns(sheetName, headers.length);

      return true;
    } catch (error) {
      console.error(`Fehler beim Synchronisieren der Daten zu ${sheetName}:`, error);
      throw error;
    }
  }

  // Lösche Daten (außer Header)
  private async clearSheetData(sheetName: string) {
    try {
      const sheetId = await this.getSheetId(sheetName);
      
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteRange: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1, // Beginne nach dem Header
                },
                shiftDimension: 'ROWS',
              },
            },
          ],
        },
      });
    } catch (error) {
      // Ignoriere Fehler wenn keine Daten zum Löschen vorhanden sind
      console.log(`Keine Daten zum Löschen in ${sheetName}`);
    }
  }

  // Hole Sheet ID
  private async getSheetId(sheetName: string): Promise<number> {
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (sheet: any) => sheet.properties.title === sheetName // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    if (!sheet) {
      throw new Error(`Sheet ${sheetName} nicht gefunden`);
    }

    return sheet.properties.sheetId;
  }

  // Auto-resize Spalten
  private async autoResizeColumns(sheetName: string, columnCount: number) {
    try {
      const sheetId = await this.getSheetId(sheetName);
      
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: columnCount,
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error('Fehler beim Auto-Resize der Spalten:', error);
    }
  }

  // Konvertiere Spaltennummer zu Buchstaben (A, B, C, ..., AA, AB, etc.)
  private getColumnLetter(columnNumber: number): string {
    let result = '';
    while (columnNumber > 0) {
      columnNumber--;
      result = String.fromCharCode(65 + (columnNumber % 26)) + result;
      columnNumber = Math.floor(columnNumber / 26);
    }
    return result;
  }

  // Teste die Verbindung
  async testConnection(): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      return true;
    } catch (error) {
      console.error('Google Sheets Verbindungstest fehlgeschlagen:', error);
      return false;
    }
  }
}

// Hilfsfunktion zum Erstellen der Service-Instanz
export function createGoogleSheetsService(): GoogleSheetsService | null {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    console.error('Google Sheets Umgebungsvariablen nicht konfiguriert');
    return null;
  }

  return new GoogleSheetsService({
    clientEmail,
    privateKey,
    spreadsheetId,
  });
}
