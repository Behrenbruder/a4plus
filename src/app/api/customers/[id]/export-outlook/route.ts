import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createSupabaseServerClient()
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Create vCard format for Outlook import
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${customer.first_name} ${customer.last_name}
N:${customer.last_name};${customer.first_name};;;
EMAIL:${customer.email}
${customer.phone ? `TEL:${customer.phone}` : ''}
${customer.address ? `ADR:;;${customer.address};${customer.city || ''};${customer.postal_code || ''};;` : ''}
${customer.notes ? `NOTE:${customer.notes}` : ''}
ORG:Arteplus Kunde
CATEGORIES:Arteplus,${customer.status}
END:VCARD`

    const fileName = `${customer.first_name}_${customer.last_name}_contact.vcf`

    return new NextResponse(vCard, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
