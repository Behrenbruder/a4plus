import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { resolution } = await request.json();
    const resolvedParams = await params;
    const conflictId = resolvedParams.id;

    if (!resolution || !['RESOLVED', 'IGNORED'].includes(resolution)) {
      return NextResponse.json(
        { error: 'Ungültige Auflösung. Nur "RESOLVED" oder "IGNORED" erlaubt.' },
        { status: 400 }
      );
    }

    // Konflikt als gelöst/ignoriert markieren
    const { data: conflict, error: updateError } = await supabase
      .from('foerder_conflicts')
      .update({
        resolution_status: resolution,
        resolved_at: new Date().toISOString(),
        resolved_by: 'admin' // Hier könnte die echte User-ID stehen
      })
      .eq('id', conflictId)
      .select()
      .single();

    if (updateError) {
      console.error('Fehler beim Aktualisieren des Konflikts:', updateError);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Konflikts' },
        { status: 500 }
      );
    }

    if (!conflict) {
      return NextResponse.json(
        { error: 'Konflikt nicht gefunden' },
        { status: 404 }
      );
    }

    // Optional: Wenn der Konflikt als RESOLVED markiert wird,
    // könnten hier weitere Aktionen ausgeführt werden
    if (resolution === 'RESOLVED') {
      // Z.B. automatische Bereinigung der betroffenen Daten
      // oder Benachrichtigungen senden
      console.log(`Konflikt ${conflictId} wurde als gelöst markiert`);
    }

    return NextResponse.json({
      success: true,
      conflict,
      message: `Konflikt wurde als ${resolution === 'RESOLVED' ? 'gelöst' : 'ignoriert'} markiert`
    });

  } catch (error) {
    console.error('Fehler beim Lösen des Konflikts:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}
