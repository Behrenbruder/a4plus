import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/email-notifications';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  // Cloudflare-freundliche Headers setzen
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const data = await request.json();
    console.log('Received data:', JSON.stringify(data, null, 2));
    
    // Validiere erforderliche Felder
    const requiredFields = ['firstName', 'lastName', 'email'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Feld ${field} ist erforderlich` },
          { status: 400, headers }
        );
      }
    }

    // Prüfe Umgebungsvariablen
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Datenbank-Konfiguration fehlt' },
        { status: 500, headers }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Speichere in Supabase (nur Felder die in der DB existieren)
    const supabaseData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      postal_code: data.postalCode || null,
      
      // Grundlegende PV-Rechner Eingabedaten
      roof_type: data.pvData?.roofType || null,
      roof_tilt_deg: data.pvData?.roofTilt || null,
      annual_consumption_kwh: data.pvData?.annualConsumption || null,
      electricity_price_ct_per_kwh: data.pvData?.electricityPrice || null,
      
      // Detaillierte Dachflächen-Informationen (JSON)
      roof_faces: data.pvData?.roofFaces && data.pvData.roofFaces.length > 0 ? data.pvData.roofFaces : null,
      
      // System-Konfiguration und Berechnungen
      total_kwp: data.pvData?.totalKWp || null,
      annual_pv_kwh: data.pvData?.annualPV || null,
      
      // Speicher
      battery_kwh: data.pvData?.batteryKWh || null,
      
      // E-Auto Daten (nur die Felder die in der DB existieren)
      ev_km_per_year: data.pvData?.evData?.kmPerYear || null,
      ev_kwh_per_100km: data.pvData?.evData?.kWhPer100km || null,
      ev_home_charging_share: data.pvData?.evData?.homeChargingShare || null,
      ev_charger_power_kw: data.pvData?.evData?.chargerPowerKW || null,
      
      // Wärmepumpe
      heat_pump_consumption_kwh: data.pvData?.heatPumpConsumption || null,
      
      // Berechnungsergebnisse
      autarkie_pct: data.pvData?.autarkie ? (data.pvData.autarkie * 100) : null,
      eigenverbrauch_pct: data.pvData?.eigenverbrauch ? (data.pvData.eigenverbrauch * 100) : null,
      annual_savings_eur: data.pvData?.annualSavings || null,
      co2_savings_tons: data.pvData?.co2Savings || null,
      payback_time_years: data.pvData?.paybackTime || null,
      
      status: 'new'
    };

    console.log('Prepared quote data:', JSON.stringify(supabaseData, null, 2));

    const { data: insertedData, error: insertError } = await supabase
      .from('pv_quotes')
      .insert([supabaseData])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { 
          error: 'Fehler beim Speichern der Daten',
          details: process.env.NODE_ENV === 'development' ? insertError.message : undefined
        },
        { status: 500, headers }
      );
    }

    console.log('Successfully saved to Supabase:', insertedData.id);

    // E-Mail-Benachrichtigung senden
    try {
      // Konvertiere Supabase-Daten für E-Mail-Funktion
      const emailData = {
        id: insertedData.id.toString(),
        first_name: insertedData.first_name,
        last_name: insertedData.last_name,
        email: insertedData.email,
        phone: insertedData.phone ?? undefined,
        city: insertedData.city ?? undefined,
        total_kwp: insertedData.total_kwp ?? undefined,
        autarkie_pct: insertedData.autarkie_pct ?? undefined,
        annual_savings_eur: insertedData.annual_savings_eur ?? undefined,
        created_at: insertedData.created_at
      };
      
      await sendNotificationEmail(emailData);
    } catch (emailError) {
      console.error('E-Mail-Benachrichtigung fehlgeschlagen:', emailError);
      // Fehler bei E-Mail soll die Anfrage nicht blockieren
    }

    return NextResponse.json({
      success: true,
      message: 'Ihre Anfrage wurde erfolgreich übermittelt',
      id: insertedData.id
    }, { headers });

  } catch (error) {
    console.error('API error details:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500, headers }
    );
  }
}

// OPTIONS Handler für CORS Preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Prüfe Umgebungsvariablen
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Datenbank-Konfiguration fehlt' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    // Baue Supabase-Query
    let query = supabase
      .from('pv_quotes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Daten' },
        { status: 500 }
      );
    }

    // Konvertiere Supabase-Daten für Frontend-Kompatibilität
    const convertedData = data?.map((quote: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      id: quote.id,
      firstName: quote.first_name,
      lastName: quote.last_name,
      first_name: quote.first_name,
      last_name: quote.last_name,
      email: quote.email,
      phone: quote.phone,
      street: quote.street,
      city: quote.city,
      postalCode: quote.postal_code,
      
      // Comprehensive PV data
      annualConsumptionKwh: quote.annual_consumption_kwh,
      electricityPriceCtPerKwh: quote.electricity_price_ct_per_kwh,
      totalKwp: quote.total_kwp,
      total_kwp: quote.total_kwp,
      estimatedTotalModules: quote.estimated_total_modules,
      annualPvKwh: quote.annual_pv_kwh,
      batteryKwh: quote.battery_kwh,
      
      // EV data
      evKmPerYear: quote.ev_km_per_year,
      evKwhPer100km: quote.ev_kwh_per_100km,
      evHomeChargingShare: quote.ev_home_charging_share,
      evChargerPowerKw: quote.ev_charger_power_kw,
      evAnnualConsumptionKwh: quote.ev_annual_consumption_kwh,
      
      // Heat pump
      heatPumpConsumptionKwh: quote.heat_pump_consumption_kwh,
      
      // Results
      autarkiePct: quote.autarkie_pct,
      autarkie_pct: quote.autarkie_pct,
      eigenverbrauchPct: quote.eigenverbrauch_pct,
      annualSavingsEur: quote.annual_savings_eur,
      annual_savings_eur: quote.annual_savings_eur,
      co2SavingsTons: quote.co2_savings_tons,
      paybackTimeYears: quote.payback_time_years,
      
      // Roof data
      roofFaces: quote.roof_faces,
      roofType: quote.roof_type,
      totalRoofArea: quote.total_roof_area,
      usableRoofArea: quote.usable_roof_area,
      averageGti: quote.average_gti,
      averageOrientation: quote.average_orientation,
      averageTilt: quote.average_tilt,
      
      status: quote.status,
      created_at: quote.created_at
    })) || [];

    return NextResponse.json({
      data: convertedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}
