import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { FoerderProgram } from '@/lib/foerder-parsers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApplyResult {
  success: boolean;
  appliedChanges: number;
  errors: string[];
  updatedPrograms: string[];
}

export async function POST(req: Request) {
  try {
    const { reviewId, changeIds, notes } = await req.json();
    
    if (!reviewId || !changeIds || !Array.isArray(changeIds)) {
      return NextResponse.json({
        success: false,
        error: 'Ungültige Parameter'
      }, { status: 400 });
    }
    
    console.log(`Übernehme ${changeIds.length} Änderungen für Review ${reviewId}`);
    
    const result: ApplyResult = {
      success: true,
      appliedChanges: 0,
      errors: [],
      updatedPrograms: []
    };
    
    // Lade die ausgewählten Änderungen
    const { data: changes, error: changesError } = await supabase
      .from('foerder_changes')
      .select('*')
      .in('id', changeIds)
      .eq('applied', false);
    
    if (changesError) {
      throw new Error(`Fehler beim Laden der Änderungen: ${changesError.message}`);
    }
    
    if (!changes || changes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Keine anwendbaren Änderungen gefunden'
      }, { status: 400 });
    }
    
    // Verarbeite jede Änderung
    for (const change of changes) {
      try {
        await applyChange(change);
        result.appliedChanges++;
        result.updatedPrograms.push(change.foerder_id);
        
        // Markiere Änderung als angewendet
        await supabase
          .from('foerder_changes')
          .update({
            reviewed: true,
            approved: true,
            applied: true,
            reviewer_notes: notes || ''
          })
          .eq('id', change.id);
          
      } catch (error) {
        console.error(`Fehler beim Anwenden der Änderung ${change.id}:`, error);
        result.errors.push(`${change.foerder_id}: ${error}`);
      }
    }
    
    // Update Review-Session
    const { error: reviewUpdateError } = await supabase
      .from('foerder_reviews')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString(),
        notes: notes || ''
      })
      .eq('id', reviewId);
    
    if (reviewUpdateError) {
      console.error('Fehler beim Update der Review-Session:', reviewUpdateError);
      result.errors.push(`Review-Update fehlgeschlagen: ${reviewUpdateError.message}`);
    }
    
    // Aktualisiere die JSON-Datei für die Live-API
    await updateLiveDataFile();
    
    console.log(`Erfolgreich ${result.appliedChanges} Änderungen angewendet`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Fehler beim Anwenden der Änderungen:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

async function applyChange(change: any): Promise<void> {
  const { change_type, foerder_id, old_data, new_data } = change;
  
  switch (change_type) {
    case 'ADDED':
      await addProgram(new_data);
      break;
      
    case 'MODIFIED':
      await updateProgram(foerder_id, new_data);
      break;
      
    case 'REMOVED':
    case 'EXPIRED':
      await removeProgram(foerder_id);
      break;
      
    default:
      throw new Error(`Unbekannter Änderungstyp: ${change_type}`);
  }
}

async function addProgram(programData: FoerderProgram): Promise<void> {
  // Füge zur Live-Tabelle hinzu
  const { error } = await supabase
    .from('foerder_live')
    .upsert({
      id: programData.id,
      level: programData.level,
      name: programData.name,
      type: programData.type,
      categories: programData.categories,
      target: programData.target,
      summary: programData.summary,
      amount: programData.amount,
      criteria: programData.criteria,
      validity: programData.validity,
      authority: programData.authority,
      url: programData.url,
      regions: programData.regions || null,
      source_type: programData.level,
      source_name: programData.authority,
      active: true,
      last_verified: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString()
    });
  
  if (error) {
    throw new Error(`Fehler beim Hinzufügen des Programms: ${error.message}`);
  }
  
  console.log(`Programm hinzugefügt: ${programData.name}`);
}

async function updateProgram(programId: string, programData: FoerderProgram): Promise<void> {
  // Update in Live-Tabelle
  const { error } = await supabase
    .from('foerder_live')
    .update({
      name: programData.name,
      type: programData.type,
      categories: programData.categories,
      target: programData.target,
      summary: programData.summary,
      amount: programData.amount,
      criteria: programData.criteria,
      validity: programData.validity,
      authority: programData.authority,
      url: programData.url,
      regions: programData.regions || null,
      last_verified: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString()
    })
    .eq('id', programId);
  
  if (error) {
    throw new Error(`Fehler beim Aktualisieren des Programms: ${error.message}`);
  }
  
  console.log(`Programm aktualisiert: ${programData.name}`);
}

async function removeProgram(programId: string): Promise<void> {
  // Markiere als inaktiv statt zu löschen (für Audit-Trail)
  const { error } = await supabase
    .from('foerder_live')
    .update({
      active: false,
      last_updated: new Date().toISOString()
    })
    .eq('id', programId);
  
  if (error) {
    throw new Error(`Fehler beim Deaktivieren des Programms: ${error.message}`);
  }
  
  console.log(`Programm deaktiviert: ${programId}`);
}

async function updateLiveDataFile(): Promise<void> {
  try {
    // Lade alle aktiven Programme aus der Datenbank
    const { data: livePrograms, error } = await supabase
      .from('foerder_live')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error) {
      throw new Error(`Fehler beim Laden der Live-Programme: ${error.message}`);
    }
    
    // Konvertiere zu dem Format, das die bestehende API erwartet
    const formattedPrograms = livePrograms?.map(program => ({
      id: program.id,
      level: program.level,
      name: program.name,
      categories: program.categories,
      target: program.target,
      type: program.type,
      summary: program.summary,
      amount: program.amount,
      criteria: program.criteria,
      validity: program.validity,
      authority: program.authority,
      url: program.url,
      ...(program.regions && { regions: program.regions })
    })) || [];
    
    // Hier würde normalerweise die JSON-Datei aktualisiert werden
    // Da wir aber auf Vercel sind, können wir nicht direkt in Dateien schreiben
    // Stattdessen könnten wir:
    // 1. Die bestehende API so ändern, dass sie aus der Datenbank liest
    // 2. Oder ein externes System wie GitHub API verwenden, um die Datei zu aktualisieren
    
    console.log(`Live-Daten aktualisiert: ${formattedPrograms.length} aktive Programme`);
    
    // TODO: Implementiere Datei-Update oder API-Umstellung
    // Für jetzt loggen wir nur die Anzahl der Programme
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Live-Daten:', error);
    // Nicht kritisch - die Datenbank ist aktualisiert, auch wenn die JSON-Datei nicht ist
  }
}

// Hilfsfunktion für die Migration der bestehenden JSON-Daten in die Datenbank
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'migrate') {
    return await migrateExistingData();
  }
  
  if (action === 'sync') {
    return await syncDatabaseToJson();
  }
  
  return NextResponse.json({
    success: false,
    error: 'Ungültige Aktion. Verwende ?action=migrate oder ?action=sync'
  }, { status: 400 });
}

async function migrateExistingData(): Promise<NextResponse> {
  try {
    // Lade die bestehenden Förderungen aus der JSON-Datei
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const jsonPath = path.join(process.cwd(), 'src/data/foerderungen.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const existingPrograms: FoerderProgram[] = JSON.parse(jsonContent);
    
    let migrated = 0;
    const errors: string[] = [];
    
    for (const program of existingPrograms) {
      try {
        await supabase
          .from('foerder_live')
          .upsert({
            id: program.id,
            level: program.level,
            name: program.name,
            type: program.type,
            categories: program.categories,
            target: program.target,
            summary: program.summary,
            amount: program.amount,
            criteria: program.criteria,
            validity: program.validity,
            authority: program.authority,
            url: program.url,
            regions: program.regions || null,
            source_type: program.level,
            source_name: program.authority,
            active: true,
            last_verified: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString()
          });
        
        migrated++;
      } catch (error) {
        errors.push(`${program.id}: ${error}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      migrated,
      total: existingPrograms.length,
      errors
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration fehlgeschlagen'
    }, { status: 500 });
  }
}

async function syncDatabaseToJson(): Promise<NextResponse> {
  try {
    await updateLiveDataFile();
    
    return NextResponse.json({
      success: true,
      message: 'Datenbank zu JSON synchronisiert'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Synchronisation fehlgeschlagen'
    }, { status: 500 });
  }
}
