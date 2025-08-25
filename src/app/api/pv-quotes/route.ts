import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotificationEmail } from '@/lib/email-notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Prüfe Umgebungsvariablen
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey
      });
      return NextResponse.json(
        { error: 'Server-Konfigurationsfehler' },
        { status: 500 }
      );
    }

    const data = await request.json();
    console.log('Received data:', JSON.stringify(data, null, 2));
    
    // Validiere erforderliche Felder
    const requiredFields = ['firstName', 'lastName', 'email'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Feld ${field} ist erforderlich` },
          { status: 400 }
        );
      }
    }

    // Bereite Daten für die Datenbank vor
    const quoteData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      postal_code: data.postalCode || null,
      
      // PV-Rechner Daten
      roof_type: data.pvData?.roofType || null,
      roof_tilt_deg: data.pvData?.roofTilt || null,
      annual_consumption_kwh: data.pvData?.annualConsumption || null,
      electricity_price_ct_per_kwh: data.pvData?.electricityPrice || null,
      
      // Dachflächen als JSON
      roof_faces: data.pvData?.roofFaces ? JSON.stringify(data.pvData.roofFaces) : null,
      
      // System-Konfiguration
      total_kwp: data.pvData?.totalKWp || null,
      annual_pv_kwh: data.pvData?.annualPV || null,
      battery_kwh: data.pvData?.batteryKWh || null,
      
      // E-Auto Daten
      ev_km_per_year: data.pvData?.evData?.kmPerYear || null,
      ev_kwh_per_100km: data.pvData?.evData?.kWhPer100km || null,
      ev_home_charging_share: data.pvData?.evData?.homeChargingShare || null,
      ev_charger_power_kw: data.pvData?.evData?.chargerPowerKW || null,
      
      // Wärmepumpe
      heat_pump_consumption_kwh: data.pvData?.heatPumpConsumption || null,
      
      // Berechnungsergebnisse
      autarkie_pct: data.pvData?.autarkie ? data.pvData.autarkie * 100 : null,
      eigenverbrauch_pct: data.pvData?.eigenverbrauch ? data.pvData.eigenverbrauch * 100 : null,
      annual_savings_eur: data.pvData?.annualSavings || null,
      co2_savings_tons: data.pvData?.co2Savings || null,
      payback_time_years: data.pvData?.paybackTime || null,
      
      status: 'new'
    };

    console.log('Prepared quote data:', JSON.stringify(quoteData, null, 2));

    // Speichere in der Datenbank
    const { data: insertedData, error } = await supabase
      .from('pv_quotes')
      .insert([quoteData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: 'Fehler beim Speichern der Anfrage',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    console.log('Successfully inserted data:', insertedData);

    // E-Mail-Benachrichtigung senden
    try {
      await sendNotificationEmail(insertedData);
    } catch (emailError) {
      console.error('E-Mail-Benachrichtigung fehlgeschlagen:', emailError);
      // Fehler bei E-Mail soll die Anfrage nicht blockieren
    }

    return NextResponse.json({
      success: true,
      message: 'Ihre Anfrage wurde erfolgreich übermittelt',
      id: insertedData.id
    });

  } catch (error) {
    console.error('API error details:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    let query = supabase
      .from('pv_quotes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Anfragen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
