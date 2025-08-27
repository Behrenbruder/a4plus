import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status, reason, user_id } = body;

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['neu', 'qualifiziert', 'angebot_erstellt', 'in_verhandlung', 'gewonnen', 'verloren'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get current customer data
    const { data: currentCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Update customer status (only update fields that exist in basic schema)
    const { data, error } = await supabase
      .from('customers')
      .update({
        lead_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Note: Additional features like contact history, notifications, and projects
    // are disabled because the required tables don't exist in the basic schema
    console.log(`Lead status updated from "${currentCustomer.lead_status}" to "${status}" for customer ${id}`);

    return NextResponse.json({ 
      data,
      message: `Lead status successfully updated to ${status}` 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
