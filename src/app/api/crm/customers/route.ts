import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const productInterest = searchParams.get('product_interest') || '';
    const assignedTo = searchParams.get('assigned_to') || '';

    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Skip product interest and assigned_to filters since these fields don't exist in basic schema
    // if (productInterest) {
    //   query = query.contains('product_interests', [productInterest]);
    // }

    // if (assignedTo) {
    //   query = query.eq('assigned_to', assignedTo);
    // }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      customers: data,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    // Create customer - only use basic schema fields that exist in database
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        postal_code: body.postal_code || null,
        notes: body.notes || null,
        status: body.status || 'lead'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Skip contact history creation since the table doesn't exist in basic schema
    // await supabase
    //   .from('contact_history')
    //   .insert([{
    //     customer_id: data.id,
    //     contact_type: 'website_formular',
    //     subject: 'Kunde erstellt',
    //     content: 'Neuer Kunde wurde im CRM-System angelegt',
    //     direction: 'inbound',
    //     metadata: {}
    //   }]);

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
