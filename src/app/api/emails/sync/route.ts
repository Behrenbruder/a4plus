import { NextRequest, NextResponse } from 'next/server'
import { syncEmailsFromMultipleIMAP, syncEmailsForSpecificCustomer, getMultiIMAPConfig } from '@/lib/imap-email-service-multi'

// POST /api/emails/sync - Synchronize emails from IMAP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sinceHours = 24, customerEmail } = body

    if (customerEmail) {
      console.log(`📧 Starting customer-specific email sync for ${customerEmail} (last ${sinceHours} hours)...`)
      
      // Synchronize emails for specific customer (performance optimized)
      const result = await syncEmailsForSpecificCustomer(customerEmail, sinceHours)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Customer-specific email sync completed successfully for ${customerEmail}`,
          data: {
            emailsProcessed: result.emailsProcessed,
            newEmails: result.newEmails,
            errors: result.errors,
            customerEmail: customerEmail
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Customer-specific email sync failed',
          details: result.errors,
          customerEmail: customerEmail
        }, { status: 500 })
      }
    } else {
      console.log(`📧 Starting full email sync for last ${sinceHours} hours...`)

      // Synchronize all emails
      const result = await syncEmailsFromMultipleIMAP(sinceHours)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Email sync completed successfully`,
          data: {
            emailsProcessed: result.emailsProcessed,
            newEmails: result.newEmails,
            errors: result.errors
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Email sync failed',
          details: result.errors
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('❌ Error in email sync API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/emails/sync - Get multi-account IMAP configuration
export async function GET() {
  try {
    console.log('🔍 Getting multi-account IMAP configuration...')
    
    // Get multi-account configuration
    const config = getMultiIMAPConfig()

    return NextResponse.json({
      success: true,
      config: {
        host: config.host,
        port: config.port,
        accounts: config.accounts,
        domainEmails: config.domainEmails,
        totalAccounts: config.totalAccounts
      }
    })

  } catch (error) {
    console.error('❌ Error getting IMAP configuration:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get IMAP configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
