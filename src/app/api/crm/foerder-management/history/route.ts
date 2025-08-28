import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const range = searchParams.get('range');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Datum-Filter basierend auf Range
    let dateFilter = '';
    const now = new Date();
    
    switch (range) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = `AND created_at >= '${today.toISOString()}'`;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `AND created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = `AND created_at >= '${monthAgo.toISOString()}'`;
        break;
      default:
        // 'all' - kein Filter
        break;
    }

    // Historie aus verschiedenen Tabellen sammeln
    const history = [];

    // 1. Scan-Historie aus foerder_scans
    const { data: scans } = await supabase
      .from('foerder_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (scans) {
      for (const scan of scans) {
        if (!type || type === 'scan') {
          history.push({
            id: `scan-${scan.id}`,
            timestamp: scan.created_at,
            type: 'scan',
            title: `Förder-Scan durchgeführt`,
            description: `${scan.changes_found || 0} Änderungen gefunden, ${scan.conflicts_found || 0} Konflikte erkannt`,
            source: scan.source,
            metadata: {
              scanId: scan.id,
              changesFound: scan.changes_found,
              conflictsFound: scan.conflicts_found,
              status: scan.status,
              duration: scan.duration_ms
            }
          });
        }
      }
    }

    // 2. Approval-Historie aus foerder_changes
    const { data: changes } = await supabase
      .from('foerder_changes')
      .select('*')
      .not('reviewed_at', 'is', null)
      .order('reviewed_at', { ascending: false })
      .limit(limit);

    if (changes) {
      for (const change of changes) {
        if (!type || type === 'approval') {
          const isApproved = change.review_status === 'approved';
          history.push({
            id: `approval-${change.id}`,
            timestamp: change.reviewed_at,
            type: 'approval',
            title: `Änderung ${isApproved ? 'freigegeben' : 'abgelehnt'}`,
            description: `${change.change_type} für "${change.program_name}" wurde ${isApproved ? 'freigegeben' : 'abgelehnt'}`,
            source: change.source,
            user: change.reviewed_by,
            metadata: {
              changeId: change.id,
              changeType: change.change_type,
              programName: change.program_name,
              reviewStatus: change.review_status
            }
          });
        }
      }
    }

    // 3. Konflikt-Historie aus foerder_conflicts
    const { data: conflicts } = await supabase
      .from('foerder_conflicts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (conflicts) {
      for (const conflict of conflicts) {
        if (!type || type === 'conflict') {
          history.push({
            id: `conflict-${conflict.id}`,
            timestamp: conflict.created_at,
            type: 'conflict',
            title: `Konflikt erkannt: ${conflict.conflict_type}`,
            description: conflict.description || `Konflikt zwischen "${conflict.program_a_name}" und "${conflict.program_b_name}"`,
            source: `${conflict.source_a} vs ${conflict.source_b}`,
            metadata: {
              conflictId: conflict.id,
              conflictType: conflict.conflict_type,
              severity: conflict.severity,
              programAName: conflict.program_a_name,
              programBName: conflict.program_b_name,
              sourceA: conflict.source_a,
              sourceB: conflict.source_b,
              aiAnalysis: conflict.ai_analysis
            }
          });
        }
      }
    }

    // 4. System-Events (falls vorhanden)
    if (!type || type === 'system') {
      // Hier könnten System-Events aus einer separaten Tabelle kommen
      // Für jetzt fügen wir ein paar Mock-Events hinzu
      const systemEvents = [
        {
          id: 'system-startup',
          timestamp: new Date().toISOString(),
          type: 'system',
          title: 'System gestartet',
          description: 'Förder-Monitoring System wurde erfolgreich gestartet',
          metadata: {
            version: '1.0.0',
            aiEnabled: process.env.AI_CONFLICT_ANALYSIS_ENABLED === 'true'
          }
        }
      ];

      history.push(...systemEvents);
    }

    // Historie sortieren (neueste zuerst)
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Datum-Filter anwenden (falls nicht bereits in der DB-Query gemacht)
    let filteredHistory = history;
    if (range && range !== 'all') {
      const cutoffDate = getCutoffDate(range);
      filteredHistory = history.filter(entry => 
        new Date(entry.timestamp) >= cutoffDate
      );
    }

    // Limit anwenden
    filteredHistory = filteredHistory.slice(0, limit);

    return NextResponse.json({
      success: true,
      history: filteredHistory,
      total: filteredHistory.length,
      filters: {
        type: type || 'all',
        range: range || 'all',
        limit
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden der Historie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Historie' },
      { status: 500 }
    );
  }
}

function getCutoffDate(range: string): Date {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0); // Alle Einträge
  }
}
