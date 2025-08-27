import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { FoerderProgram } from './foerder-parsers';

// Schema für die KI-Antwort
const ConflictAnalysisSchema = z.object({
  hasConflict: z.boolean(),
  conflictType: z.enum(['AMOUNT_MISMATCH', 'VALIDITY_CONFLICT', 'CRITERIA_DIFFERENT', 'DUPLICATE_PROGRAM', 'NO_CONFLICT']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  recommendation: z.string(),
  keyDifferences: z.array(z.string()),
  areProgramsIdentical: z.boolean()
});

export type AIConflictAnalysis = z.infer<typeof ConflictAnalysisSchema>;

export class AIConflictAnalyzer {
  private model;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.AI_CONFLICT_ANALYSIS_ENABLED === 'true';
    this.model = openai('gpt-4o-mini');
  }

  async analyzeConflict(
    programA: FoerderProgram, 
    programB: FoerderProgram,
    sourceA: string,
    sourceB: string
  ): Promise<AIConflictAnalysis | null> {
    if (!this.enabled || !process.env.OPENAI_API_KEY) {
      console.log('AI-Konflikt-Analyse deaktiviert oder API-Key fehlt');
      return null;
    }

    try {
      const prompt = this.buildAnalysisPrompt(programA, programB, sourceA, sourceB);
      
      const { object } = await generateObject({
        model: this.model,
        prompt,
        schema: ConflictAnalysisSchema,
      });

      console.log(`AI-Analyse für ${programA.name} vs ${programB.name}: ${object.conflictType} (${object.confidence})`);
      
      return object;
    } catch (error) {
      console.error('Fehler bei AI-Konflikt-Analyse:', error);
      return null;
    }
  }

  private buildAnalysisPrompt(
    programA: FoerderProgram, 
    programB: FoerderProgram,
    sourceA: string,
    sourceB: string
  ): string {
    return `
Du bist ein Experte für deutsche Förderprogramme. Analysiere diese zwei Programme und erkenne, ob es sich um einen echten Konflikt handelt.

PROGRAMM A (Quelle: ${sourceA}):
Name: ${programA.name}
Betrag: ${programA.amount}
Gültigkeit: ${programA.validity}
Zielgruppe: ${programA.target}
Kategorien: ${programA.categories.join(', ')}
Kriterien: ${programA.criteria}
Zusammenfassung: ${programA.summary}

PROGRAMM B (Quelle: ${sourceB}):
Name: ${programB.name}
Betrag: ${programB.amount}
Gültigkeit: ${programB.validity}
Zielgruppe: ${programB.target}
Kategorien: ${programB.categories.join(', ')}
Kriterien: ${programB.criteria}
Zusammenfassung: ${programB.summary}

ANALYSE-KRITERIEN:
1. Sind das identische Programme? (gleicher Name, gleiche Behörde)
2. Gibt es echte Widersprüche bei Förderbeträgen?
3. Sind die Gültigkeitszeiträume wirklich unterschiedlich?
4. Unterscheiden sich die Zielgruppen wesentlich?

WICHTIGE REGELN:
- "bis zu X€" und "maximal X€" sind KEIN Konflikt
- Verschiedene Laufzeiten sind nur bei identischen Programmen ein Konflikt
- Ähnliche Namen bedeuten nicht automatisch identische Programme
- Berücksichtige regionale Unterschiede

Gib eine detaillierte Analyse auf Deutsch zurück mit konkreten Handlungsempfehlungen.
`;
  }

  async batchAnalyze(conflicts: Array<{
    programA: FoerderProgram;
    programB: FoerderProgram;
    sourceA: string;
    sourceB: string;
  }>): Promise<Array<AIConflictAnalysis | null>> {
    if (!this.enabled) {
      return conflicts.map(() => null);
    }

    // Parallel verarbeiten, aber mit Rate-Limiting
    const results: Array<AIConflictAnalysis | null> = [];
    
    for (let i = 0; i < conflicts.length; i++) {
      const conflict = conflicts[i];
      const analysis = await this.analyzeConflict(
        conflict.programA,
        conflict.programB,
        conflict.sourceA,
        conflict.sourceB
      );
      
      results.push(analysis);
      
      // Rate-Limiting: 100ms Pause zwischen Anfragen
      if (i < conflicts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  isEnabled(): boolean {
    return this.enabled && !!process.env.OPENAI_API_KEY;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const testProgram: FoerderProgram = {
        id: 'test',
        level: 'BUND',
        name: 'Test Programm',
        categories: ['Solar'],
        target: 'PRIVAT',
        type: 'ZUSCHUSS',
        summary: 'Test',
        amount: '1000€',
        criteria: 'Test',
        validity: '2024',
        authority: 'Test',
        url: 'https://test.de',
        regions: [{ bundesland: 'Deutschland' }]
      };

      const result = await this.analyzeConflict(testProgram, testProgram, 'test1', 'test2');
      return result !== null;
    } catch (error) {
      console.error('AI-Verbindungstest fehlgeschlagen:', error);
      return false;
    }
  }
}

// Singleton-Instanz
export const aiConflictAnalyzer = new AIConflictAnalyzer();
