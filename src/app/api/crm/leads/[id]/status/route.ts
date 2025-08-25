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

    // Update probability based on status
    let probability = currentCustomer.probability;
    switch (status) {
      case 'neu':
        probability = 25;
        break;
      case 'qualifiziert':
        probability = 50;
        break;
      case 'angebot_erstellt':
        probability = 75;
        break;
      case 'in_verhandlung':
        probability = 85;
        break;
      case 'gewonnen':
        probability = 100;
        break;
      case 'verloren':
        probability = 0;
        break;
    }

    // Update customer status
    const { data, error } = await supabase
      .from('customers')
      .update({
        lead_status: status,
        probability: probability,
        last_contact_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create contact history entry
    await supabase
      .from('contact_history')
      .insert([{
        customer_id: id,
        user_id: user_id || null,
        contact_type: 'website_formular',
        subject: `Status geändert zu: ${status}`,
        content: reason || `Lead-Status wurde von "${currentCustomer.lead_status}" zu "${status}" geändert`,
        direction: 'outbound',
        metadata: {
          old_status: currentCustomer.lead_status,
          new_status: status,
          old_probability: currentCustomer.probability,
          new_probability: probability
        }
      }]);

    // Create notification for assigned user if status changed to won/lost
    if ((status === 'gewonnen' || status === 'verloren') && currentCustomer.assigned_to) {
      const notificationTitle = status === 'gewonnen' ? 'Lead gewonnen!' : 'Lead verloren';
      const notificationMessage = status === 'gewonnen' 
        ? `Glückwunsch! Der Lead ${currentCustomer.first_name} ${currentCustomer.last_name} wurde gewonnen.`
        : `Der Lead ${currentCustomer.first_name} ${currentCustomer.last_name} wurde als verloren markiert.`;

      await supabase
        .from('notifications')
        .insert([{
          user_id: currentCustomer.assigned_to,
          customer_id: id,
          notification_type: 'status_change',
          title: notificationTitle,
          message: notificationMessage,
          is_read: false,
          action_url: `/crm/customers/${id}`,
          metadata: {
            old_status: currentCustomer.lead_status,
            new_status: status
          }
        }]);
    }

    // If status is 'gewonnen', create a project automatically
    if (status === 'gewonnen' && currentCustomer.lead_status !== 'gewonnen') {
      const projectTitle = `${currentCustomer.product_interests?.[0] || 'Projekt'} - ${currentCustomer.first_name} ${currentCustomer.last_name}`;
      
      await supabase
        .from('projects')
        .insert([{
          customer_id: id,
          title: projectTitle,
          description: `Automatisch erstelltes Projekt für gewonnenen Lead`,
          status: 'planung',
          product_type: currentCustomer.product_interests?.[0] || 'pv',
          estimated_cost: currentCustomer.estimated_value,
          technical_specs: {},
          materials_list: {}
        }]);
    }

    return NextResponse.json({ 
      data,
      message: `Lead status successfully updated to ${status}` 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
