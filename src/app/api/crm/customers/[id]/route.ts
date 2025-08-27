import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Only select fields that exist in the basic schema
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      console.error('Error fetching customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch related PV quotes based on email address
    const { data: pvQuotes } = await supabase
      .from('pv_quotes')
      .select('*')
      .eq('email', data.email)
      .order('created_at', { ascending: false });

    // Add PV quotes to customer data
    const customerWithPVQuotes = {
      ...data,
      pv_quotes: pvQuotes || []
    };

    return NextResponse.json({ data: customerWithPVQuotes });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists for other customers
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', body.email)
      .neq('id', id)
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Another customer with this email already exists' },
        { status: 409 }
      );
    }

    // Update customer - only use basic schema fields that exist in database
    const { data, error } = await supabase
      .from('customers')
      .update({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        postal_code: body.postal_code || null,
        notes: body.notes || null,
        status: body.status || 'lead',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      console.error('Error updating customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Skip contact history creation since the table doesn't exist in basic schema
    // await supabase
    //   .from('contact_history')
    //   .insert([{
    //     customer_id: id,
    //     contact_type: 'website_formular',
    //     subject: 'Kundendaten aktualisiert',
    //     content: 'Kundendaten wurden im CRM-System aktualisiert',
    //     direction: 'inbound',
    //     metadata: {}
    //   }]);

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if customer exists
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Delete related records first (due to foreign key constraints)
    await Promise.all([
      supabase.from('contact_history').delete().eq('customer_id', id),
      supabase.from('documents').delete().eq('customer_id', id),
      supabase.from('projects').delete().eq('customer_id', id),
      supabase.from('quotes').delete().eq('customer_id', id),
      supabase.from('customer_subsidies').delete().eq('customer_id', id),
      supabase.from('notifications').delete().eq('customer_id', id),
      supabase.from('campaign_recipients').delete().eq('customer_id', id)
    ]);

    // Delete customer
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
