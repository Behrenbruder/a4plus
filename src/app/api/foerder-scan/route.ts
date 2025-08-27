import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { FoerderParserFactory, FoerderProgram, ParseResult } from '@/lib/foerder-parsers';
import { hybridConflictDetector, HybridConflictResult } from '@/lib/hybrid-conflict-detector';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ScanResult {
  success: boolean;
  scannedSources: number;
  totalPrograms: number;
  changes: number;
  errors: string[];
  scanId: string;
  conflicts?: number;
}

export async function POST(req: Request) {
  try {
    const { sources, force = false } = await req.json();
    const scanDate = new Date().toISOString().split('T')[0];
    const scanId = `scan-${Date.now()}`;
    
    console.log(`[${scanId}] Starte Förderungen-Scan für ${scanDate}`);
    
    // Hole aktive Quellen aus der Datenbank
    const { data: sourcesToScan, error: sourcesError } = await supabase
      .from('foerder_sources')
      .select('*')
      .eq('active', true);
    
    if (sourcesError) {
      throw new Error(`Fehler beim Laden der Quellen: ${sourcesError.message}`);
    }
    
    if (!sourcesToScan || sourcesToScan.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Keine aktiven Förderungsquellen gefunden'
      }, { status: 400 });
    }
    
    const results: ScanResult = {
      success: true,
      scannedSources: 0,
      totalPrograms: 0,
      changes: 0,
      errors: [],
      scanId
    };
    
    // Filtere Quellen wenn spezifische angegeben wurden
    const filteredSources = sources 
      ? sourcesToScan.filter(s => sources.includes(s.name))
      : sourcesToScan;
    
    console.log(`[${scanId}] Scanne ${filteredSources.length} Quellen`);
    
    for (const source of filteredSources) {
      try {
        console.log(`[${scanId}] Scanne Quelle: ${source.name}`);
        
        // Prüfe ob bereits heute gescannt wurde (außer bei force)
        if (!force) {
          const { data: existingScan } = await supabase
            .from('foerder_snapshots')
            .select('id')
            .eq('scan_date', scanDate)
            .eq('source_name', source.name)
            .single();
          
          if (existingScan) {
            console.log(`[${scanId}] Quelle ${source.name} bereits heute gescannt, überspringe`);
            continue;
          }
        }
        
        // Lade Website-Inhalt
        const websiteContent = await fetchWebsiteContent(source.url);
        if (!websiteContent) {
          results.errors.push(`Konnte ${source.name} nicht laden: ${source.url}`);
          continue;
        }
        
        // Parse mit entsprechendem Parser
        const parser = FoerderParserFactory.createParser(source.parser_type);
        const parseResult: ParseResult = await parser.parse(websiteContent, source.config);
        
        if (!parseResult.success) {
          results.errors.push(`Parser-Fehler für ${source.name}: ${parseResult.errors.join(', ')}`);
          continue;
        }
        
        console.log(`[${scanId}] ${source.name}: ${parseResult.programs.length} Programme gefunden`);
        
        // Speichere Snapshot
        const { error: snapshotError } = await supabase
          .from('foerder_snapshots')
          .upsert({
            scan_date: scanDate,
            source_type: source.type,
            source_name: source.name,
            raw_data: { content: websiteContent.substring(0, 50000) }, // Begrenzt für DB
            processed_data: parseResult.programs,
            scan_status: 'completed'
          }, {
            onConflict: 'scan_date,source_type,source_name'
          });
        
        if (snapshotError) {
          results.errors.push(`Snapshot-Fehler für ${source.name}: ${snapshotError.message}`);
          continue;
        }
        
        // Vergleiche mit vorherigem Scan und erstelle Diff
        const changes = await createDiffReport(source.name, parseResult.programs, scanDate);
        results.changes += changes;
        
        // Update last_scan
        await supabase
          .from('foerder_sources')
          .update({ last_scan: scanDate })
          .eq('id', source.id);
        
        results.scannedSources++;
        results.totalPrograms += parseResult.programs.length;
        
      } catch (error) {
        console.error(`[${scanId}] Fehler bei Quelle ${source.name}:`, error);
        results.errors.push(`Fehler bei ${source.name}: ${error}`);
      }
    }
    
    // Erkenne Konflikte zwischen Quellen
    console.log(`[${scanId}] Erkenne Konflikte zwischen Quellen...`);
    const conflictCount = await detectConflicts(scanDate);
    
    // Erstelle Review-Session wenn Änderungen oder Konflikte gefunden wurden
    if (results.changes > 0 || conflictCount > 0) {
      const { data: reviewSession, error: reviewError } = await supabase
        .from('foerder_reviews')
        .insert({
          scan_date: scanDate,
          total_changes: results.changes,
          total_conflicts: conflictCount,
          status: 'pending'
        })
        .select()
        .single();
      
      if (!reviewError && reviewSession) {
        // Sende E-Mail-Benachrichtigung mit Konflikt-Informationen
        await sendReviewNotification(reviewSession.id, { ...results, conflicts: conflictCount });
      }
    }
    
    console.log(`[${scanId}] Scan abgeschlossen:`, results);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Förder-Scan Fehler:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

async function fetchWebsiteContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Fehler beim Laden von ${url}:`, error);
    return null;
  }
}

async function createDiffReport(sourceName: string, newPrograms: FoerderProgram[], scanDate: string): Promise<number> {
  try {
    // Hole letzten Snapshot
    const { data: lastSnapshot } = await supabase
      .from('foerder_snapshots')
      .select('processed_data')
      .eq('source_name', sourceName)
      .eq('scan_status', 'completed')
      .neq('scan_date', scanDate)
      .order('scan_date', { ascending: false })
      .limit(1)
      .single();
    
    if (!lastSnapshot) {
      console.log(`Kein vorheriger Snapshot für ${sourceName}, alle Programme als neu markiert`);
      // Alle Programme als neu hinzugefügt markieren
      for (const program of newPrograms) {
        await supabase
          .from('foerder_changes')
          .insert({
            scan_date: scanDate,
            change_type: 'ADDED',
            foerder_id: program.id,
            new_data: program,
            change_summary: `Neues Programm: ${program.name}`
          });
      }
      return newPrograms.length;
    }
    
    const oldPrograms: FoerderProgram[] = lastSnapshot.processed_data || [];
    const changes: any[] = [];
    
    // Erstelle Maps für effizienten Vergleich
    const oldMap = new Map(oldPrograms.map(p => [p.id, p]));
    const newMap = new Map(newPrograms.map(p => [p.id, p]));
    
    // Finde neue Programme
    for (const [id, program] of newMap) {
      if (!oldMap.has(id)) {
        changes.push({
          scan_date: scanDate,
          change_type: 'ADDED',
          foerder_id: id,
          new_data: program,
          change_summary: `Neues Programm: ${program.name}`
        });
      }
    }
    
    // Finde entfernte Programme
    for (const [id, program] of oldMap) {
      if (!newMap.has(id)) {
        changes.push({
          scan_date: scanDate,
          change_type: 'REMOVED',
          foerder_id: id,
          old_data: program,
          change_summary: `Programm entfernt: ${program.name}`
        });
      }
    }
    
    // Finde geänderte Programme
    for (const [id, newProgram] of newMap) {
      const oldProgram = oldMap.get(id);
      if (oldProgram && hasSignificantChanges(oldProgram, newProgram)) {
        changes.push({
          scan_date: scanDate,
          change_type: 'MODIFIED',
          foerder_id: id,
          old_data: oldProgram,
          new_data: newProgram,
          change_summary: generateChangeSummary(oldProgram, newProgram)
        });
      }
    }
    
    // Speichere alle Änderungen
    if (changes.length > 0) {
      const { error } = await supabase
        .from('foerder_changes')
        .insert(changes);
      
      if (error) {
        console.error('Fehler beim Speichern der Änderungen:', error);
        return 0;
      }
    }
    
    console.log(`${sourceName}: ${changes.length} Änderungen gefunden`);
    return changes.length;
    
  } catch (error) {
    console.error(`Fehler beim Erstellen des Diff-Reports für ${sourceName}:`, error);
    return 0;
  }
}

async function detectConflicts(scanDate: string): Promise<number> {
  try {
    // Hole alle Programme vom aktuellen Scan
    const { data: snapshots } = await supabase
      .from('foerder_snapshots')
      .select('source_name, processed_data')
      .eq('scan_date', scanDate)
      .eq('scan_status', 'completed');
    
    if (!snapshots || snapshots.length < 2) {
      return 0; // Keine Konflikte möglich mit weniger als 2 Quellen
    }
    
    const conflicts: any[] = [];
    const allPrograms: Map<string, { program: FoerderProgram, source: string }[]> = new Map();
    
    // Sammle alle Programme gruppiert nach ähnlichen Namen/IDs
    for (const snapshot of snapshots) {
      const programs: FoerderProgram[] = snapshot.processed_data || [];
      
      for (const program of programs) {
        const normalizedName = program.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const key = normalizedName.substring(0, 20); // Erste 20 Zeichen für Ähnlichkeitsvergleich
        
        if (!allPrograms.has(key)) {
          allPrograms.set(key, []);
        }
        allPrograms.get(key)!.push({ program, source: snapshot.source_name });
      }
    }
    
    // Erkenne Konflikte mit Hybrid-System
    for (const [key, programGroup] of allPrograms) {
      if (programGroup.length > 1) {
        // Vergleiche alle Programme in dieser Gruppe mit Hybrid-Detektor
        for (let i = 0; i < programGroup.length; i++) {
          for (let j = i + 1; j < programGroup.length; j++) {
            const programA = programGroup[i];
            const programB = programGroup[j];
            
            // Verwende Hybrid-Konflikt-Detektor
            const hybridResult = await hybridConflictDetector.detectConflict(
              programA.program,
              programB.program,
              programA.source,
              programB.source
            );
            
            if (hybridResult.hasConflict) {
              conflicts.push({
                scan_date: scanDate,
                foerder_id: `${programA.program.id}_vs_${programB.program.id}`,
                conflict_type: hybridResult.conflictType,
                source_a: programA.source,
                source_b: programB.source,
                data_a: programA.program,
                data_b: programB.program,
                conflict_summary: hybridResult.summary,
                severity: hybridResult.severity,
                confidence: hybridResult.confidence,
                ai_analysis: hybridResult.aiAnalysis,
                rule_based_analysis: hybridResult.ruleBasedAnalysis,
                recommendation: hybridResult.recommendation,
                explanation: hybridResult.explanation
              });
            }
          }
        }
      }
    }
    
    // Speichere Konflikte
    if (conflicts.length > 0) {
      const { error } = await supabase
        .from('foerder_conflicts')
        .insert(conflicts);
      
      if (error) {
        console.error('Fehler beim Speichern der Konflikte:', error);
        return 0;
      }
    }
    
    console.log(`${conflicts.length} Hybrid-Konflikte erkannt`);
    return conflicts.length;
    
  } catch (error) {
    console.error('Fehler bei der Hybrid-Konflikt-Erkennung:', error);
    return 0;
  }
}

function comparePrograms(programA: FoerderProgram, programB: FoerderProgram): {
  hasConflict: boolean;
  type: string;
  summary: string;
  severity: string;
} {
  const conflicts: string[] = [];
  let severity = 'LOW';
  
  // Vergleiche Förderbeträge
  if (programA.amount !== programB.amount && 
      programA.amount !== 'Siehe Programmbedingungen' && 
      programB.amount !== 'Siehe Programmbedingungen') {
    conflicts.push(`Betrag: ${programA.amount} vs ${programB.amount}`);
    severity = 'HIGH';
  }
  
  // Vergleiche Gültigkeit
  if (programA.validity !== programB.validity && 
      programA.validity !== 'laufend' && 
      programB.validity !== 'laufend') {
    conflicts.push(`Gültigkeit: ${programA.validity} vs ${programB.validity}`);
    severity = severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
  }
  
  // Vergleiche Zielgruppen
  if (programA.target !== programB.target) {
    conflicts.push(`Zielgruppe: ${programA.target} vs ${programB.target}`);
    severity = severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
  }
  
  // Vergleiche Kategorien
  const categoriesA = new Set(programA.categories);
  const categoriesB = new Set(programB.categories);
  const commonCategories = [...categoriesA].filter(cat => categoriesB.has(cat));
  
  if (commonCategories.length === 0 && programA.categories.length > 0 && programB.categories.length > 0) {
    conflicts.push(`Keine gemeinsamen Kategorien`);
  }
  
  const hasConflict = conflicts.length > 0;
  const type = hasConflict ? (conflicts.some(c => c.includes('Betrag')) ? 'AMOUNT_MISMATCH' : 
                             conflicts.some(c => c.includes('Gültigkeit')) ? 'VALIDITY_CONFLICT' : 
                             'CRITERIA_DIFFERENT') : '';
  
  return {
    hasConflict,
    type,
    summary: conflicts.join('; '),
    severity
  };
}

function hasSignificantChanges(old: FoerderProgram, new_: FoerderProgram): boolean {
  // Prüfe wichtige Felder auf Änderungen
  const significantFields = ['name', 'amount', 'criteria', 'validity', 'summary'];
  
  for (const field of significantFields) {
    if (old[field as keyof FoerderProgram] !== new_[field as keyof FoerderProgram]) {
      return true;
    }
  }
  
  // Prüfe Arrays
  if (JSON.stringify(old.categories) !== JSON.stringify(new_.categories)) {
    return true;
  }
  
  if (JSON.stringify(old.regions) !== JSON.stringify(new_.regions)) {
    return true;
  }
  
  return false;
}

function generateChangeSummary(old: FoerderProgram, new_: FoerderProgram): string {
  const changes: string[] = [];
  
  if (old.name !== new_.name) {
    changes.push(`Name: "${old.name}" → "${new_.name}"`);
  }
  
  if (old.amount !== new_.amount) {
    changes.push(`Betrag: "${old.amount}" → "${new_.amount}"`);
  }
  
  if (old.validity !== new_.validity) {
    changes.push(`Gültigkeit: "${old.validity}" → "${new_.validity}"`);
  }
  
  if (old.summary !== new_.summary) {
    changes.push('Beschreibung geändert');
  }
  
  if (old.criteria !== new_.criteria) {
    changes.push('Kriterien geändert');
  }
  
  return changes.length > 0 ? changes.join('; ') : 'Kleinere Änderungen';
}

async function sendReviewNotification(reviewId: string, scanResults: ScanResult): Promise<void> {
  try {
    const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://a4plus.eu'}/admin/foerder-review/${reviewId}`;
    const crmUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://a4plus.eu'}/crm`;
    
    // E-Mail-Inhalt erstellen
    const conflictText = scanResults.conflicts && scanResults.conflicts > 0 ? ` und ${scanResults.conflicts} Konflikte` : '';
    const emailSubject = `🔍 Förderungen-Update: ${scanResults.changes} Änderungen${conflictText} gefunden`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Förderungen-Scan Ergebnis</h2>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Scan-Zusammenfassung</h3>
          <ul>
            <li><strong>${scanResults.changes}</strong> Änderungen gefunden</li>
            <li><strong>${scanResults.scannedSources}</strong> Quellen gescannt</li>
            <li><strong>${scanResults.totalPrograms}</strong> Programme insgesamt</li>
            ${scanResults.conflicts && scanResults.conflicts > 0 ? `<li><strong>${scanResults.conflicts}</strong> Konflikte zwischen Quellen erkannt</li>` : ''}
          </ul>
        </div>
        
        ${scanResults.conflicts && scanResults.conflicts > 0 ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #d97706;">⚠️ Konflikte erkannt</h3>
            <p>Es wurden <strong>${scanResults.conflicts}</strong> Konflikte zwischen verschiedenen Förderungsquellen gefunden. Diese erfordern eine manuelle Überprüfung und Anweisung zur Verarbeitung.</p>
            <p><strong>Bitte geben Sie bei der Überprüfung textbasierte Anweisungen an, wie diese Konflikte aufgelöst werden sollen.</strong></p>
          </div>
        ` : ''}
        
        ${scanResults.errors.length > 0 ? `
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626;">⚠️ Fehler beim Scannen</h3>
            <ul>
              ${scanResults.errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewUrl}" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px 10px 0;">
            🔍 Änderungen überprüfen & Upload bestätigen
          </a>
          <a href="${crmUrl}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 0 10px 0;">
            📋 CRM-System öffnen
          </a>
        </div>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #6b7280;">
          <p><strong>Nächste Schritte:</strong></p>
          <ol>
            <li>Klicken Sie auf "Änderungen überprüfen", um die gefundenen Änderungen und Konflikte zu sehen</li>
            <li>Bei Konflikten: Geben Sie textbasierte Anweisungen zur Auflösung ein</li>
            <li>Wählen Sie die Änderungen aus, die Sie übernehmen möchten</li>
            <li>Klicken Sie auf "Upload bestätigen" um die Änderungen zu aktivieren</li>
            <li>Der Verlauf wird automatisch im CRM-System dokumentiert</li>
          </ol>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Diese E-Mail wurde automatisch vom Förderungen-Überwachungssystem generiert.<br>
          Scan-ID: ${scanResults.scanId} | Review-ID: ${reviewId}
        </p>
      </div>
    `;
    
    const emailText = `
Förderungen-Scan Ergebnis

${scanResults.changes} Änderungen gefunden
${scanResults.scannedSources} Quellen gescannt  
${scanResults.totalPrograms} Programme insgesamt
${scanResults.conflicts && scanResults.conflicts > 0 ? `${scanResults.conflicts} Konflikte zwischen Quellen erkannt` : ''}

${scanResults.conflicts && scanResults.conflicts > 0 ? `
KONFLIKTE ERKANNT:
Es wurden ${scanResults.conflicts} Konflikte zwischen verschiedenen Förderungsquellen gefunden.
Diese erfordern eine manuelle Überprüfung und textbasierte Anweisungen zur Auflösung.
` : ''}

${scanResults.errors.length > 0 ? `
Fehler beim Scannen:
${scanResults.errors.join('\n')}
` : ''}

Nächste Schritte:
1. Änderungen überprüfen: ${reviewUrl}
2. CRM-System: ${crmUrl}
3. Bei Konflikten textbasierte Anweisungen eingeben
4. Upload bestätigen und Verlauf wird dokumentiert

Scan-ID: ${scanResults.scanId}
Review-ID: ${reviewId}
    `;
    
    // Sende E-Mail über bestehenden E-Mail-Service
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://a4plus.eu'}/api/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.FOERDER_REVIEW_EMAIL || 'samuel@a4plus.eu',
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
        type: 'foerder-review'
      })
    });
    
    if (!response.ok) {
      throw new Error(`E-Mail-Service Fehler: ${response.status}`);
    }
    
    console.log(`Review-Benachrichtigung erfolgreich gesendet für Review ${reviewId}`);
    
  } catch (error) {
    console.error('Fehler beim Senden der Review-Benachrichtigung:', error);
    // Nicht kritisch - der Scan war erfolgreich, auch wenn die E-Mail fehlschlägt
  }
}

// GET für manuelle Auslösung (nur für Development/Testing)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get('force') === 'true';
  
  // Führe Scan für alle Quellen aus
  const response = await POST(new Request(req.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force })
  }));
  
  return response;
}
