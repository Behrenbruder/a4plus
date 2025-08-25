import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('pv_quotes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Anfrage nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Validiere erlaubte Felder
    const allowedFields = ['status', 'notes'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Keine gültigen Felder zum Aktualisieren' },
        { status: 400 }
      );
    }

    // Validiere Status-Werte
    if (updateData.status) {
      const validStatuses = ['new', 'contacted', 'quoted', 'converted', 'declined'];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { error: 'Ungültiger Status' },
          { status: 400 }
        );
      }
    }

    const { data: updatedData, error } = await supabase
      .from('pv_quotes')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren der Anfrage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Anfrage erfolgreich aktualisiert',
      data: updatedData
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('pv_quotes')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Löschen der Anfrage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Anfrage erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
