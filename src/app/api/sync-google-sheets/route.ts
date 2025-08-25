import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseSyncService } from '@/lib/databaseSync';

// POST /api/sync-google-sheets - Manuelle Synchronisation
export async function POST(request: NextRequest) {
  try {
    const syncService = createDatabaseSyncService();
    if (!syncService) {
      return NextResponse.json(
        { error: 'Synchronisation Service konnte nicht initialisiert werden' },
        { status: 500 }
      );
    }

    // Führe Synchronisation durch
    const result = await syncService.syncAllTables();

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Alle Tabellen erfolgreich synchronisiert' 
        : 'Synchronisation teilweise fehlgeschlagen',
      results: result.results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fehler bei der Google Sheets Synchronisation:', error);
    return NextResponse.json(
      { 
        error: 'Synchronisation fehlgeschlagen',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET /api/sync-google-sheets - Status und Verbindungstest
export async function GET(request: NextRequest) {
  try {
    const syncService = createDatabaseSyncService();
    if (!syncService) {
      return NextResponse.json(
        { error: 'Synchronisation Service konnte nicht initialisiert werden' },
        { status: 500 }
      );
    }

    // Teste Verbindungen
    const connections = await syncService.testConnections();

    return NextResponse.json({
      status: 'Service verfügbar',
      connections: {
        supabase: connections.supabase ? 'Verbunden' : 'Fehler',
        googleSheets: connections.googleSheets ? 'Verbunden' : 'Fehler'
      },
      ready: connections.supabase && connections.googleSheets,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fehler beim Verbindungstest:', error);
    return NextResponse.json(
      { 
        error: 'Verbindungstest fehlgeschlagen',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
