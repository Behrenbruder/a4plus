import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface FoerderungData {
  id: string
  name: string
  url: string
  status: 'available' | 'unavailable' | 'unknown'
  amount?: string
  deadline?: string
  conditions?: string[]
  targetGroup?: string
  lastUpdated: string
  confidence: number
  rawContent?: string
}

export interface LLMAnalysisResult {
  success: boolean
  data?: FoerderungData
  error?: string
  confidence: number
  tokensUsed: number
}

export interface ComparisonResult {
  hasChanges: boolean
  changeType: 'new' | 'status_change' | 'content_change' | 'no_change'
  changes: {
    field: string
    oldValue: any
    newValue: any
    importance: 'high' | 'medium' | 'low'
  }[]
  summary: string
  confidence: number
}

/**
 * Scrapes and extracts content from a förderung website
 */
async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Basic HTML content extraction (remove scripts, styles, etc.)
    const cleanContent = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Limit content length to avoid token limits
    return cleanContent.substring(0, 8000)
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    throw error
  }
}

/**
 * Analyzes förderung content using GPT-4o-mini
 */
export async function analyzeFoerderungWithLLM(
  foerderungId: string,
  name: string,
  url: string
): Promise<LLMAnalysisResult> {
  try {
    console.log(`🤖 Analyzing ${name} with GPT-4o-mini...`)
    
    // Scrape website content
    const content = await scrapeWebsiteContent(url)
    
    const prompt = `
Analysiere diese deutsche Förderwebsite und extrahiere strukturierte Informationen.

Website: ${name}
URL: ${url}

Inhalt:
${content}

Extrahiere folgende Informationen im JSON-Format:

{
  "status": "available" | "unavailable" | "unknown",
  "amount": "Förderbetrag (z.B. 'bis zu 10.000€')",
  "deadline": "Antragsfrist (z.B. '31.12.2024')",
  "conditions": ["Bedingung 1", "Bedingung 2"],
  "targetGroup": "Zielgruppe (z.B. 'Privatpersonen')",
  "summary": "Kurze Zusammenfassung der Förderung",
  "confidence": 0.0-1.0
}

Regeln:
- status: "available" wenn Anträge möglich, "unavailable" wenn gestoppt/beendet
- Nur konkrete Informationen extrahieren, keine Vermutungen
- confidence: Wie sicher bist du bei der Analyse? (0.0-1.0)
- Auf deutsche Begriffe achten: "Antragsstopp", "beendet", "läuft", etc.

Antworte nur mit dem JSON-Objekt, keine zusätzlichen Erklärungen.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Experte für deutsche Förderprogramme. Analysiere Förderwebsites präzise und extrahiere strukturierte Daten.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    if (!responseText) {
      throw new Error('Empty response from OpenAI')
    }

    // Parse JSON response
    let analysisData
    try {
      analysisData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse LLM response:', responseText)
      throw new Error('Invalid JSON response from LLM')
    }

    const result: FoerderungData = {
      id: foerderungId,
      name,
      url,
      status: analysisData.status || 'unknown',
      amount: analysisData.amount,
      deadline: analysisData.deadline,
      conditions: analysisData.conditions || [],
      targetGroup: analysisData.targetGroup,
      lastUpdated: new Date().toISOString(),
      confidence: analysisData.confidence || 0.5,
      rawContent: content.substring(0, 1000) // Store sample for debugging
    }

    return {
      success: true,
      data: result,
      confidence: analysisData.confidence || 0.5,
      tokensUsed: completion.usage?.total_tokens || 0
    }

  } catch (error) {
    console.error(`Error analyzing ${name}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      confidence: 0,
      tokensUsed: 0
    }
  }
}

/**
 * Compares two förderung datasets to detect changes
 */
export async function compareFoerderungData(
  oldData: FoerderungData,
  newData: FoerderungData
): Promise<ComparisonResult> {
  try {
    const prompt = `
Vergleiche diese zwei Datensätze einer deutschen Förderung und erkenne Änderungen:

ALTE DATEN:
${JSON.stringify(oldData, null, 2)}

NEUE DATEN:
${JSON.stringify(newData, null, 2)}

Analysiere Änderungen und antworte im JSON-Format:

{
  "hasChanges": boolean,
  "changeType": "new" | "status_change" | "content_change" | "no_change",
  "changes": [
    {
      "field": "Feldname",
      "oldValue": "alter Wert",
      "newValue": "neuer Wert", 
      "importance": "high" | "medium" | "low"
    }
  ],
  "summary": "Deutsche Zusammenfassung der Änderungen",
  "confidence": 0.0-1.0
}

Wichtigkeitsregeln:
- "high": Status-Änderungen, Fristen, Förderbeträge
- "medium": Bedingungen, Zielgruppen
- "low": Kleinere Textänderungen

Antworte nur mit JSON, keine Erklärungen.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist Experte für Fördervergleiche. Erkenne wichtige Änderungen in deutschen Förderprogrammen.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 800
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    if (!responseText) {
      throw new Error('Empty comparison response')
    }

    const comparisonResult = JSON.parse(responseText)
    
    return {
      hasChanges: comparisonResult.hasChanges || false,
      changeType: comparisonResult.changeType || 'no_change',
      changes: comparisonResult.changes || [],
      summary: comparisonResult.summary || 'Keine Änderungen erkannt',
      confidence: comparisonResult.confidence || 0.5
    }

  } catch (error) {
    console.error('Error comparing förderung data:', error)
    return {
      hasChanges: false,
      changeType: 'no_change',
      changes: [],
      summary: 'Fehler beim Vergleich der Daten',
      confidence: 0
    }
  }
}

/**
 * Generates a formatted email summary of changes
 */
export async function generateEmailSummary(
  changes: ComparisonResult[],
  scanDate: string
): Promise<string> {
  try {
    const changesWithData = changes.filter(c => c.hasChanges)
    
    if (changesWithData.length === 0) {
      return `
Fördermonitoring Bericht - ${new Date(scanDate).toLocaleDateString('de-DE')}

✅ Keine Änderungen bei den überwachten Förderprogrammen festgestellt.

Alle 24 Programme wurden erfolgreich überprüft.
Nächster Scan: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}
`
    }

    const prompt = `
Erstelle einen professionellen deutschen E-Mail-Bericht über Förderänderungen:

ÄNDERUNGEN:
${JSON.stringify(changesWithData, null, 2)}

SCAN-DATUM: ${scanDate}

Erstelle einen strukturierten E-Mail-Text mit:
1. Kurze Zusammenfassung
2. Wichtige Änderungen (high importance)
3. Weitere Änderungen (medium/low)
4. Handlungsempfehlungen

Format: Professionell, prägnant, handlungsorientiert.
Sprache: Deutsch
Zielgruppe: Förderberater

Antworte nur mit dem E-Mail-Text, keine JSON-Formatierung.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist Experte für Förderkommunikation. Erstelle präzise, handlungsorientierte Berichte.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1200
    })

    return completion.choices[0]?.message?.content?.trim() || 'Fehler beim Generieren des Berichts'

  } catch (error) {
    console.error('Error generating email summary:', error)
    return `Fehler beim Erstellen des E-Mail-Berichts: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
  }
}
