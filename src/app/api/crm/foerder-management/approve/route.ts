import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { changeId, approved, notes } = await request.json()

    if (!changeId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: changeId, approved' },
        { status: 400 }
      )
    }

    // Update the change record
    const { error: updateError } = await supabase
      .from('foerder_changes')
      .update({
        reviewed: true,
        approved,
        reviewer_notes: notes || null
      })
      .eq('id', changeId)

    if (updateError) {
      console.error('Error updating change:', updateError)
      return NextResponse.json(
        { error: 'Failed to update change' },
        { status: 500 }
      )
    }

    // If approved, apply the change to the live data
    if (approved) {
      const { data: change } = await supabase
        .from('foerder_changes')
        .select('*')
        .eq('id', changeId)
        .single()

      if (change) {
        try {
          await applyChangeToLiveData(change)
          
          // Mark as applied
          await supabase
            .from('foerder_changes')
            .update({ applied: true })
            .eq('id', changeId)
        } catch (applyError) {
          console.error('Error applying change to live data:', applyError)
          // Don't fail the approval, but log the error
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}

async function applyChangeToLiveData(change: any) {
  const { change_type, foerder_id, new_data } = change

  switch (change_type) {
    case 'ADDED':
      // Insert new förderung
      if (new_data) {
        await supabase
          .from('foerder_live')
          .insert({
            id: foerder_id,
            ...new_data,
            last_updated: new Date().toISOString()
          })
      }
      break

    case 'MODIFIED':
      // Update existing förderung
      if (new_data) {
        await supabase
          .from('foerder_live')
          .update({
            ...new_data,
            last_updated: new Date().toISOString()
          })
          .eq('id', foerder_id)
      }
      break

    case 'REMOVED':
    case 'EXPIRED':
      // Mark as inactive or remove
      await supabase
        .from('foerder_live')
        .update({
          active: false,
          last_updated: new Date().toISOString()
        })
        .eq('id', foerder_id)
      break

    default:
      console.warn(`Unknown change type: ${change_type}`)
  }
}
