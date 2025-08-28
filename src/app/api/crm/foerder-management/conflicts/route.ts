import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('foerder_conflicts')
      .select('*')
      .order('created_at', { ascending: false });

    // Status-Filter anwenden
    if (status && status !== 'all') {
      const statusMap = {
        'pending': 'PENDING',
        'resolved': 'RESOLVED',
        'ignored': 'IGNORED'
      };
      query = query.eq('resolution_status', statusMap[status as keyof typeof statusMap] || status.toUpperCase());
    }

    // Severity-Filter anwenden
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity.toUpperCase());
    }

    // Limit anwenden
    query = query.limit(limit);

    const { data: conflicts, error } = await query;

    if (error) {
      console.error('Supabase Fehler:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Konflikte' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conflicts: conflicts || [],
      total: conflicts?.length || 0,
      filters: {
        status: status || 'all',
        severity: severity || 'all',
        limit
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden der Konflikte:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}
