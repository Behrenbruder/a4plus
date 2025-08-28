import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewed = searchParams.get('reviewed')
    const changeType = searchParams.get('change_type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('foerder_changes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (reviewed !== null) {
      query = query.eq('reviewed', reviewed === 'true')
    }

    if (changeType) {
      query = query.eq('change_type', changeType)
    }

    const { data: changes, error } = await query

    if (error) {
      console.error('Error fetching changes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch changes' },
        { status: 500 }
      )
    }

    return NextResponse.json(changes || [])
  } catch (error) {
    console.error('Error fetching foerder changes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch changes' },
      { status: 500 }
    )
  }
}
