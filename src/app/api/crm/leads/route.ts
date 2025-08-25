import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'pipeline'; // 'pipeline' or 'list'

    if (view === 'pipeline') {
      // Get pipeline statistics
      const { data: pipelineData, error } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          lead_status,
          estimated_value,
          probability,
          product_interests,
          priority,
          next_follow_up_date,
          assigned_to,
          assigned_user:users!customers_assigned_to_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pipeline data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Group by lead status
      const pipeline = {
        neu: pipelineData?.filter(c => c.lead_status === 'neu') || [],
        qualifiziert: pipelineData?.filter(c => c.lead_status === 'qualifiziert') || [],
        angebot_erstellt: pipelineData?.filter(c => c.lead_status === 'angebot_erstellt') || [],
        in_verhandlung: pipelineData?.filter(c => c.lead_status === 'in_verhandlung') || [],
        gewonnen: pipelineData?.filter(c => c.lead_status === 'gewonnen') || [],
        verloren: pipelineData?.filter(c => c.lead_status === 'verloren') || []
      };

      // Calculate statistics
      const stats = {
        total: pipelineData?.length || 0,
        neu: pipeline.neu.length,
        qualifiziert: pipeline.qualifiziert.length,
        angebot_erstellt: pipeline.angebot_erstellt.length,
        in_verhandlung: pipeline.in_verhandlung.length,
        gewonnen: pipeline.gewonnen.length,
        verloren: pipeline.verloren.length,
        totalValue: pipelineData?.reduce((sum, c) => sum + (c.estimated_value || 0), 0) || 0,
        averageValue: pipelineData?.length ? 
          (pipelineData.reduce((sum, c) => sum + (c.estimated_value || 0), 0) / pipelineData.length) : 0,
        conversionRate: pipelineData?.length ? 
          ((pipeline.gewonnen.length / pipelineData.length) * 100) : 0
      };

      return NextResponse.json({
        data: pipeline,
        stats
      });

    } else {
      // Get list view with filters
      const status = searchParams.get('status') || '';
      const assignedTo = searchParams.get('assigned_to') || '';
      const productInterest = searchParams.get('product_interest') || '';
      const priority = searchParams.get('priority') || '';

      let query = supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          lead_status,
          estimated_value,
          probability,
          product_interests,
          priority,
          next_follow_up_date,
          last_contact_date,
          created_at,
          assigned_to,
          assigned_user:users!customers_assigned_to_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('lead_status', status);
      }

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo);
      }

      if (productInterest) {
        query = query.contains('product_interests', [productInterest]);
      }

      if (priority) {
        query = query.eq('priority', parseInt(priority));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

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
        { error: 'Lead with this email already exists' },
        { status: 409 }
      );
    }

    // Create lead (customer with lead status)
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
        country: body.country || 'Deutschland',
        notes: body.notes || null,
        lead_status: 'neu',
        lead_source: body.lead_source || 'Manual',
        assigned_to: body.assigned_to || null,
        estimated_value: body.estimated_value || null,
        probability: 25, // Default for new leads
        product_interests: body.product_interests || [],
        priority: body.priority || 3,
        tags: body.tags || [],
        gdpr_consent: body.gdpr_consent || false,
        marketing_consent: body.marketing_consent || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create initial contact history entry
    await supabase
      .from('contact_history')
      .insert([{
        customer_id: data.id,
        contact_type: body.contact_type || 'website_formular',
        subject: 'Neuer Lead erstellt',
        content: `Neuer Lead wurde erstellt. Quelle: ${body.lead_source || 'Manual'}`,
        direction: 'inbound',
        metadata: {}
      }]);

    // Create notification for assigned user
    if (body.assigned_to) {
      await supabase
        .from('notifications')
        .insert([{
          user_id: body.assigned_to,
          customer_id: data.id,
          notification_type: 'neuer_lead',
          title: 'Neuer Lead zugewiesen',
          message: `Ihnen wurde ein neuer Lead zugewiesen: ${data.first_name} ${data.last_name}`,
          is_read: false,
          action_url: `/crm/customers/${data.id}`,
          metadata: {}
        }]);
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
