import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { changeIds, action } = await request.json();

    if (!changeIds || !Array.isArray(changeIds) || changeIds.length === 0) {
      return NextResponse.json(
        { error: 'Keine Change-IDs angegeben' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Ungültige Aktion. Nur "approve" oder "reject" erlaubt.' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Alle Changes einzeln verarbeiten
    for (const changeId of changeIds) {
      try {
        if (action === 'approve') {
          // Change als approved markieren
          const { data: change, error: fetchError } = await supabase
            .from('foerder_changes')
            .select('*')
            .eq('id', changeId)
            .single();

          if (fetchError) {
            errors.push({ changeId, error: `Fehler beim Laden: ${fetchError.message}` });
            continue;
          }

          if (!change) {
            errors.push({ changeId, error: 'Change nicht gefunden' });
            continue;
          }

          // Change als approved markieren
          const { error: updateError } = await supabase
            .from('foerder_changes')
            .update({
              review_status: 'approved',
              reviewed_at: new Date().toISOString(),
              reviewed_by: 'bulk-admin'
            })
            .eq('id', changeId);

          if (updateError) {
            errors.push({ changeId, error: `Update-Fehler: ${updateError.message}` });
            continue;
          }

          // Änderung auf Live-Daten anwenden
          const applyResult = await applyChangeToLiveData(change);
          if (!applyResult.success) {
            errors.push({ changeId, error: `Apply-Fehler: ${applyResult.error}` });
            continue;
          }

          results.push({ changeId, status: 'approved', applied: true });

        } else if (action === 'reject') {
          // Change als rejected markieren
          const { error: updateError } = await supabase
            .from('foerder_changes')
            .update({
              review_status: 'rejected',
              reviewed_at: new Date().toISOString(),
              reviewed_by: 'bulk-admin'
            })
            .eq('id', changeId);

          if (updateError) {
            errors.push({ changeId, error: `Update-Fehler: ${updateError.message}` });
            continue;
          }

          results.push({ changeId, status: 'rejected' });
        }

      } catch (error) {
        console.error(`Fehler bei Change ${changeId}:`, error);
        errors.push({ 
          changeId, 
          error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      errorCount: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk-Approve Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}

async function applyChangeToLiveData(change: any): Promise<{ success: boolean; error?: string }> {
  try {
    const changeData = typeof change.change_data === 'string' 
      ? JSON.parse(change.change_data) 
      : change.change_data;

    switch (change.change_type) {
      case 'ADDED':
        const { error: insertError } = await supabase
          .from('foerder_live')
          .insert({
            program_id: changeData.id,
            name: changeData.name,
            level: changeData.level,
            categories: changeData.categories,
            target: changeData.target,
            type: changeData.type,
            summary: changeData.summary,
            amount: changeData.amount,
            criteria: changeData.criteria,
            validity: changeData.validity,
            authority: changeData.authority,
            url: changeData.url,
            regions: changeData.regions,
            source: change.source,
            last_updated: new Date().toISOString()
          });

        if (insertError) {
          return { success: false, error: insertError.message };
        }
        break;

      case 'MODIFIED':
        const { error: updateError } = await supabase
          .from('foerder_live')
          .update({
            name: changeData.name,
            categories: changeData.categories,
            target: changeData.target,
            type: changeData.type,
            summary: changeData.summary,
            amount: changeData.amount,
            criteria: changeData.criteria,
            validity: changeData.validity,
            authority: changeData.authority,
            url: changeData.url,
            regions: changeData.regions,
            last_updated: new Date().toISOString()
          })
          .eq('program_id', changeData.id)
          .eq('source', change.source);

        if (updateError) {
          return { success: false, error: updateError.message };
        }
        break;

      case 'REMOVED':
      case 'EXPIRED':
        const { error: deleteError } = await supabase
          .from('foerder_live')
          .delete()
          .eq('program_id', changeData.id)
          .eq('source', change.source);

        if (deleteError) {
          return { success: false, error: deleteError.message };
        }
        break;

      default:
        return { success: false, error: `Unbekannter Change-Type: ${change.change_type}` };
    }

    return { success: true };

  } catch (error) {
    console.error('Fehler beim Anwenden der Änderung:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler' 
    };
  }
}
