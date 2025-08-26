import { NextRequest, NextResponse } from 'next/server'

interface EmailMessage {
  id: string
  created_at: string
  from_email: string
  to_email: string
  subject: string
  content: string
  is_from_customer: boolean
  is_read: boolean
  attachments?: string[]
  message_type: 'email'
}

// GET /api/crm/customers/[id]/emails - Fetch email history for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id

    // Mock data - in production, this would fetch from database
    const mockEmails: EmailMessage[] = [
      {
        id: '1',
        created_at: '2025-01-25T14:30:00Z',
        from_email: 'max.mustermann@email.com',
        to_email: 'info@arteplus.de',
        subject: 'Anfrage für PV-Anlage',
        content: 'Hallo,\n\nich interessiere mich für eine PV-Anlage für mein Einfamilienhaus. Könnten Sie mir ein Angebot erstellen?\n\nVielen Dank\nMax Mustermann',
        is_from_customer: true,
        is_read: true,
        message_type: 'email'
      },
      {
        id: '2',
        created_at: '2025-01-25T15:45:00Z',
        from_email: 'info@arteplus.de',
        to_email: 'max.mustermann@email.com',
        subject: 'Re: Anfrage für PV-Anlage',
        content: 'Hallo Herr Mustermann,\n\nvielen Dank für Ihre Anfrage! Gerne erstellen wir Ihnen ein individuelles Angebot für eine PV-Anlage.\n\nUm Ihnen ein präzises Angebot unterbreiten zu können, benötigen wir noch einige Informationen:\n\n- Größe und Ausrichtung Ihres Daches\n- Ihr jährlicher Stromverbrauch\n- Gewünschte Anlagenleistung\n- Interesse an einem Batteriespeicher\n\nGerne können wir auch einen Termin für eine kostenlose Vor-Ort-Beratung vereinbaren.\n\nBeste Grüße\nIhr Arteplus Team',
        is_from_customer: false,
        is_read: true,
        message_type: 'email'
      },
      {
        id: '3',
        created_at: '2025-01-26T09:15:00Z',
        from_email: 'max.mustermann@email.com',
        to_email: 'info@arteplus.de',
        subject: 'Re: Anfrage für PV-Anlage - Weitere Informationen',
        content: 'Hallo,\n\nhier sind die gewünschten Informationen:\n\n- Dach: Süd-Ausrichtung, ca. 80m², Neigung 35°\n- Stromverbrauch: ca. 4.500 kWh/Jahr\n- Gewünschte Leistung: 8-10 kWp\n- Ja, Interesse an Batteriespeicher (8-10 kWh)\n\nEin Vor-Ort-Termin wäre super. Wann hätten Sie Zeit?\n\nViele Grüße\nMax Mustermann',
        is_from_customer: true,
        is_read: true,
        message_type: 'email'
      },
      {
        id: '4',
        created_at: '2025-01-26T11:30:00Z',
        from_email: 'info@arteplus.de',
        to_email: 'max.mustermann@email.com',
        subject: 'Re: Anfrage für PV-Anlage - Terminvorschlag',
        content: 'Hallo Herr Mustermann,\n\nvielen Dank für die detaillierten Informationen! Basierend auf Ihren Angaben können wir Ihnen eine 9,6 kWp PV-Anlage mit 10 kWh Batteriespeicher anbieten.\n\nFür den Vor-Ort-Termin hätte ich folgende Termine frei:\n- Dienstag, 30.01. um 14:00 Uhr\n- Mittwoch, 31.01. um 10:00 Uhr\n- Donnerstag, 01.02. um 15:00 Uhr\n\nWelcher Termin würde Ihnen passen?\n\nBeste Grüße\nMarkus Weber\nArteplus GmbH',
        is_from_customer: false,
        is_read: true,
        message_type: 'email'
      }
    ]

    // Sort by creation date
    const sortedEmails = mockEmails.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      emails: sortedEmails
    })

  } catch (error) {
    console.error('Error fetching email history:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch email history' 
      },
      { status: 500 }
    )
  }
}

// POST /api/crm/customers/[id]/emails - Send new email to customer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id
    const body = await request.json()
    
    const { to_email, subject, content } = body

    if (!to_email || !subject || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: to_email, subject, content' 
        },
        { status: 400 }
      )
    }

    // Mock sending email - in production, this would:
    // 1. Send actual email via email service (SendGrid, AWS SES, etc.)
    // 2. Save to database
    // 3. Create contact history entry
    // 4. Update customer last_contact_date

    const newEmail: EmailMessage = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      from_email: 'info@arteplus.de',
      to_email,
      subject,
      content,
      is_from_customer: false,
      is_read: true,
      message_type: 'email'
    }

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      email: newEmail
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email' 
      },
      { status: 500 }
    )
  }
}
