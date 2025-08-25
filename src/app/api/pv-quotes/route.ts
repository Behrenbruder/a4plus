import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/email-notifications';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Speichere in der lokalen Prisma-Datenbank
    const prismaData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      postalCode: data.postalCode || null,
      
      // Grundlegende PV-Rechner Eingabedaten
      annualConsumptionKwh: data.pvData?.annualConsumption || null,
      electricityPriceCtPerKwh: data.pvData?.electricityPrice || null,
      
      // Detaillierte Dachflächen-Informationen (JSON String mit allen Details)
      roofFaces: data.pvData?.roofFaces && data.pvData.roofFaces.length > 0 ? JSON.stringify(data.pvData.roofFaces) : null,
      
      // System-Konfiguration und Berechnungen
      totalKwp: data.pvData?.totalKwp || null,
      estimatedTotalModules: data.pvData?.estimatedTotalModules || null,
      annualPvKwh: data.pvData?.annualPvProduction || null,
      
      // Speicher
      batteryKwh: data.pvData?.batteryKwh || null,
      
      // E-Auto Daten (alle EV-Daten)
      evKmPerYear: data.pvData?.evData?.kmPerYear || null,
      evKwhPer100km: data.pvData?.evData?.kWhPer100km || null,
      evHomeChargingShare: data.pvData?.evData?.homeChargingShare || null,
      evChargerPowerKw: data.pvData?.evData?.chargerPowerKW || null,
      evAnnualConsumptionKwh: data.pvData?.evData?.annualConsumption || null,
      
      // Wärmepumpe
      heatPumpConsumptionKwh: data.pvData?.heatPumpConsumption || null,
      
      // Berechnungsergebnisse (behalten für Übersicht)
      autarkiePct: data.pvData?.autarkiePct || null,
      eigenverbrauchPct: data.pvData?.eigenverbrauchPct || null,
      annualSavingsEur: data.pvData?.annualSavingsEur || null,
      co2SavingsTons: data.pvData?.co2Savings || null,
      paybackTimeYears: data.pvData?.paybackTime || null,
      
      // Zusätzliche technische Details
      roofType: data.pvData?.roofType || null,
      totalRoofArea: data.pvData?.totalRoofArea || null,
      usableRoofArea: data.pvData?.usableRoofArea || null,
      averageGti: data.pvData?.averageGti || null,
      averageOrientation: data.pvData?.averageOrientation || null,
      averageTilt: data.pvData?.averageTilt || null,
      
      status: 'new'
    };

    console.log('Prepared quote data:', JSON.stringify(prismaData, null, 2));

    const insertedData = await prisma.pvQuote.create({
      data: prismaData
    });

    console.log('Successfully saved to Prisma database:', insertedData.id);

    // E-Mail-Benachrichtigung senden
    try {
      // Konvertiere Prisma-Daten für E-Mail-Funktion
      const emailData = {
        id: insertedData.id.toString(),
        first_name: insertedData.firstName,
        last_name: insertedData.lastName,
        email: insertedData.email,
        phone: insertedData.phone ?? undefined,
        city: insertedData.city ?? undefined,
        total_kwp: insertedData.totalKwp ?? undefined,
        autarkie_pct: insertedData.autarkiePct ?? undefined,
        annual_savings_eur: insertedData.annualSavingsEur ?? undefined,
        created_at: insertedData.createdAt.toISOString()
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    // Baue Prisma-Query
    const where = status ? { status } : {};
    
    const [data, total] = await Promise.all([
      prisma.pvQuote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pvQuote.count({ where })
    ]);

    // Konvertiere Prisma-Daten für Frontend-Kompatibilität
    const convertedData = data.map((quote: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      id: quote.id,
      firstName: quote.firstName,
      lastName: quote.lastName,
      first_name: quote.firstName,
      last_name: quote.lastName,
      email: quote.email,
      phone: quote.phone,
      street: quote.address,
      city: quote.city,
      postalCode: quote.postalCode,
      
      // Comprehensive PV data
      annualConsumptionKwh: quote.annualConsumptionKwh,
      electricityPriceCtPerKwh: quote.electricityPriceCtPerKwh,
      totalKwp: quote.totalKwp,
      total_kwp: quote.totalKwp,
      estimatedTotalModules: quote.estimatedTotalModules,
      annualPvKwh: quote.annualPvKwh,
      batteryKwh: quote.batteryKwh,
      
      // EV data
      evKmPerYear: quote.evKmPerYear,
      evKwhPer100km: quote.evKwhPer100km,
      evHomeChargingShare: quote.evHomeChargingShare,
      evChargerPowerKw: quote.evChargerPowerKw,
      evAnnualConsumptionKwh: quote.evAnnualConsumptionKwh,
      
      // Heat pump
      heatPumpConsumptionKwh: quote.heatPumpConsumptionKwh,
      
      // Results
      autarkiePct: quote.autarkiePct,
      autarkie_pct: quote.autarkiePct,
      eigenverbrauchPct: quote.eigenverbrauchPct,
      annualSavingsEur: quote.annualSavingsEur,
      annual_savings_eur: quote.annualSavingsEur,
      co2SavingsTons: quote.co2SavingsTons,
      paybackTimeYears: quote.paybackTimeYears,
      
      // Roof data
      roofFaces: quote.roofFaces,
      roofType: quote.roofType,
      totalRoofArea: quote.totalRoofArea,
      usableRoofArea: quote.usableRoofArea,
      averageGti: quote.averageGti,
      averageOrientation: quote.averageOrientation,
      averageTilt: quote.averageTilt,
      
      status: quote.status,
      created_at: quote.createdAt
    }));

    return NextResponse.json({
      data: convertedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
