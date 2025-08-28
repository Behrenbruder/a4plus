import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get total scans count
    const { count: totalScans } = await supabase
      .from('foerder_snapshots')
      .select('*', { count: 'exact', head: true })

    // Get pending changes count
    const { count: pendingChanges } = await supabase
      .from('foerder_changes')
      .select('*', { count: 'exact', head: true })
      .eq('reviewed', false)

    // Get active conflicts count
    const { count: activeConflicts } = await supabase
      .from('foerder_conflicts')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false)

    // Get last scan date
    const { data: lastScan } = await supabase
      .from('foerder_snapshots')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Calculate next scan date (hourly)
    const nextScanDate = lastScan 
      ? new Date(new Date(lastScan.created_at).getTime() + 60 * 60 * 1000)
      : new Date(Date.now() + 60 * 60 * 1000)

    // Calculate success rate (scans without errors)
    const { count: successfulScans } = await supabase
      .from('foerder_snapshots')
      .select('*', { count: 'exact', head: true })
      .eq('scan_status', 'completed')

    const successRate = totalScans && totalScans > 0 
      ? Math.round((successfulScans || 0) / totalScans * 100)
      : 0

    const stats = {
      totalScans: totalScans || 0,
      pendingChanges: pendingChanges || 0,
      activeConflicts: activeConflicts || 0,
      lastScanDate: lastScan?.created_at || null,
      nextScanDate: nextScanDate.toISOString(),
      successRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching foerder management stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
