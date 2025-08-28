import { NextRequest, NextResponse } from 'next/server'
import foerderungen from '@/data/foerderungen.json'
import { 
  analyzeFoerderungWithLLM, 
  compareFoerderungData, 
  generateEmailSummary,
  type FoerderungData,
  type ComparisonResult 
} from '@/lib/llm-foerder-service'
import { sendEmail } from '@/lib/email-service'

interface LLMScanResult {
  success: boolean
  summary: {
    totalScanned: number
    successful: number
    failed: number
    newEntries: number
    statusChanges: number
    contentChanges: number
    totalTokensUsed: number
    estimatedCost: number
  }
  results: FoerderungData[]
  comparisons: ComparisonResult[]
  emailSummary?: string
  error?: string
  timestamp: string
}

// Mock storage for previous scan results (in production, use database)
let previousScanResults: FoerderungData[] = []

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting LLM-based förderung scan...')
    
    const results: FoerderungData[] = []
    const comparisons: ComparisonResult[] = []
    let totalTokensUsed = 0
    let successful = 0
    let failed = 0

    // Analyze each förderung with LLM
    for (const foerderung of foerderungen) {
      console.log(`🔍 Analyzing: ${foerderung.name}`)
      
      const analysisResult = await analyzeFoerderungWithLLM(
        foerderung.id,
        foerderung.name,
        foerderung.url
      )

      totalTokensUsed += analysisResult.tokensUsed

      if (analysisResult.success && analysisResult.data) {
        results.push(analysisResult.data)
        successful++

        // Compare with previous results if available
        const previousResult = previousScanResults.find(p => p.id === foerderung.id)
        if (previousResult) {
          const comparison = await compareFoerderungData(previousResult, analysisResult.data)
          comparisons.push(comparison)
        } else {
          // New entry
          comparisons.push({
            hasChanges: true,
            changeType: 'new',
            changes: [{
              field: 'status',
              oldValue: 'unknown',
              newValue: analysisResult.data.status,
              importance: 'high'
            }],
            summary: `Neue Förderung hinzugefügt: ${analysisResult.data.name}`,
            confidence: analysisResult.data.confidence
          })
        }
      } else {
        failed++
        console.error(`❌ Failed to analyze ${foerderung.name}:`, analysisResult.error)
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Update previous results for next comparison
    previousScanResults = results

    // Generate summary statistics
    const changesCount = comparisons.filter(c => c.hasChanges).length
    const newEntries = comparisons.filter(c => c.changeType === 'new').length
    const statusChanges = comparisons.filter(c => c.changeType === 'status_change').length
    const contentChanges = comparisons.filter(c => c.changeType === 'content_change').length

    // Estimate cost (GPT-4o-mini pricing: $0.15/1M input tokens, $0.60/1M output tokens)
    // Rough estimate: ~70% input, 30% output
    const inputTokens = Math.round(totalTokensUsed * 0.7)
    const outputTokens = Math.round(totalTokensUsed * 0.3)
    const estimatedCost = (inputTokens * 0.15 / 1000000) + (outputTokens * 0.60 / 1000000)

    // Generate email summary if there are changes
    let emailSummary: string | undefined
    if (changesCount > 0) {
      emailSummary = await generateEmailSummary(
        comparisons.filter(c => c.hasChanges),
        new Date().toISOString()
      )

      // Send email notification
      try {
        await sendEmail({
          to: process.env.FOERDER_REVIEW_EMAIL || process.env.NOTIFICATION_EMAIL || 's.behr@a4plus.eu',
          from: process.env.SMTP_FROM || process.env.COMPANY_EMAIL || 'info@a4plus.eu',
          subject: `🤖 LLM Fördermonitoring: ${changesCount} Änderungen erkannt`,
          text: emailSummary,
          html: emailSummary.replace(/\n/g, '<br>')
        })
        console.log('✅ Email notification sent')
      } catch (emailError) {
        console.error('❌ Failed to send email notification:', emailError)
      }
    }

    const scanResult: LLMScanResult = {
      success: true,
      summary: {
        totalScanned: foerderungen.length,
        successful,
        failed,
        newEntries,
        statusChanges,
        contentChanges,
        totalTokensUsed,
        estimatedCost: Math.round(estimatedCost * 100) / 100 // Round to 2 decimal places
      },
      results,
      comparisons,
      emailSummary,
      timestamp: new Date().toISOString()
    }

    console.log('✅ LLM scan completed:', scanResult.summary)

    return NextResponse.json(scanResult)

  } catch (error) {
    console.error('❌ Error in LLM förderung scan:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      summary: {
        totalScanned: 0,
        successful: 0,
        failed: foerderungen.length,
        newEntries: 0,
        statusChanges: 0,
        contentChanges: 0,
        totalTokensUsed: 0,
        estimatedCost: 0
      },
      results: [],
      comparisons: [],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for retrieving last scan results
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      lastScanResults: previousScanResults,
      totalPrograms: foerderungen.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
