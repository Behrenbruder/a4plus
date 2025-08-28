import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const activities = []

    // Get recent scans
    const { data: recentScans } = await supabase
      .from('foerder_snapshots')
      .select('id, created_at, scan_status, source_name, error_message')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentScans) {
      for (const scan of recentScans) {
        activities.push({
          id: `scan-${scan.id}`,
          type: 'scan' as const,
          message: scan.scan_status === 'completed' 
            ? `Scan von ${scan.source_name} erfolgreich abgeschlossen`
            : `Scan von ${scan.source_name} fehlgeschlagen: ${scan.error_message || 'Unbekannter Fehler'}`,
          timestamp: scan.created_at,
          status: scan.scan_status === 'completed' ? 'success' as const : 'error' as const
        })
      }
    }

    // Get recent approvals
    const { data: recentApprovals } = await supabase
      .from('foerder_changes')
      .select('id, created_at, change_type, foerder_id, reviewed, approved')
      .eq('reviewed', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentApprovals) {
      for (const approval of recentApprovals) {
        activities.push({
          id: `approval-${approval.id}`,
          type: 'approval' as const,
          message: approval.approved 
            ? `Änderung für ${approval.foerder_id} genehmigt (${approval.change_type})`
            : `Änderung für ${approval.foerder_id} abgelehnt (${approval.change_type})`,
          timestamp: approval.created_at,
          status: approval.approved ? 'success' as const : 'warning' as const
        })
      }
    }

    // Get recent conflicts
    const { data: recentConflicts } = await supabase
      .from('foerder_conflicts')
      .select('id, created_at, foerder_id, conflict_type, resolved, severity')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentConflicts) {
      for (const conflict of recentConflicts) {
        activities.push({
          id: `conflict-${conflict.id}`,
          type: 'conflict' as const,
          message: conflict.resolved 
            ? `Konflikt für ${conflict.foerder_id} gelöst (${conflict.conflict_type})`
            : `Neuer Konflikt für ${conflict.foerder_id} erkannt (${conflict.conflict_type})`,
          timestamp: conflict.created_at,
          status: conflict.resolved ? 'success' as const : 
                  conflict.severity === 'HIGH' ? 'error' as const : 'warning' as const
        })
      }
    }

    // Sort all activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return only the 10 most recent activities
    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    console.error('Error fetching foerder management activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
