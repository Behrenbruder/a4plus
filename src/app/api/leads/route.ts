import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // nur diesen Import verwenden

// Optional: zum Testen im Browser
export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/leads" });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const required = [
      "bundesland","haustyp","dachform","personen",
      "eigentuemer","plz","adresse","wantsOffer"
    ];
    for (const k of required) {
      if (data[k] === undefined || data[k] === null || data[k] === "") {
        return NextResponse.json({ ok:false, error:`Feld fehlt: ${k}` }, { status: 400 });
      }
    }

    if (data.wantsOffer) {
      if (!data.firstName || !data.lastName || !data.email || !data.phone) {
        return NextResponse.json({ ok:false, error:"Bitte Kontaktdaten vollständig angeben." }, { status: 400 });
      }
    }

    const lead = await prisma.lead.create({
      data: {
        bundesland:  String(data.bundesland),
        haustyp:     String(data.haustyp),
        dachform:    String(data.dachform),
        personen:    String(data.personen),
        eigentuemer: Boolean(data.eigentuemer),
        plz:         String(data.plz),
        adresse:     String(data.adresse),
        wantsOffer:  Boolean(data.wantsOffer),
        firstName:   data.firstName || null,
        lastName:    data.lastName || null,
        email:       data.email || null,
        phone:       data.phone || null,
      },
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok:false, error:"Serverfehler" }, { status: 500 });
  }
}
