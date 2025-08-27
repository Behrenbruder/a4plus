import { FoerderProgram } from './foerder-parsers';
import { aiConflictAnalyzer, AIConflictAnalysis } from './ai-conflict-analyzer';

export interface HybridConflictResult {
  hasConflict: boolean;
  conflictType: string;
  severity: string;
  summary: string;
  confidence?: number;
  aiAnalysis?: AIConflictAnalysis;
  ruleBasedAnalysis: {
    hasConflict: boolean;
    type: string;
    summary: string;
    severity: string;
  };
  recommendation?: string;
  explanation?: string;
}

export class HybridConflictDetector {
  
  /**
   * Hauptfunktion für Hybrid-Konflikt-Erkennung
   * Kombiniert regel-basierte und KI-basierte Analyse
   */
  async detectConflict(
    programA: FoerderProgram,
    programB: FoerderProgram,
    sourceA: string,
    sourceB: string
  ): Promise<HybridConflictResult> {
    
    // Phase 1: Regel-basierte Schnell-Erkennung
    const ruleBasedResult = this.detectRuleBasedConflict(programA, programB);
    
    // Phase 2: Entscheidung ob KI-Analyse nötig ist
    const needsAIAnalysis = this.shouldUseAI(ruleBasedResult, programA, programB);
    
    let aiAnalysis: AIConflictAnalysis | null = null;
    
    // Phase 3: KI-Analyse für komplexe Fälle
    if (needsAIAnalysis && aiConflictAnalyzer.isEnabled()) {
      console.log(`KI-Analyse für ${programA.name} vs ${programB.name} gestartet`);
      aiAnalysis = await aiConflictAnalyzer.analyzeConflict(programA, programB, sourceA, sourceB);
    }
    
    // Phase 4: Kombiniere Ergebnisse
    return this.combineResults(ruleBasedResult, aiAnalysis);
  }
  
  /**
   * Regel-basierte Konflikt-Erkennung (wie bisher)
   */
  private detectRuleBasedConflict(
    programA: FoerderProgram, 
    programB: FoerderProgram
  ): HybridConflictResult['ruleBasedAnalysis'] {
    const conflicts: string[] = [];
    let severity = 'LOW';
    
    // Vergleiche Förderbeträge
    if (programA.amount !== programB.amount && 
        programA.amount !== 'Siehe Programmbedingungen' && 
        programB.amount !== 'Siehe Programmbedingungen') {
      conflicts.push(`Betrag: ${programA.amount} vs ${programB.amount}`);
      severity = 'HIGH';
    }
    
    // Vergleiche Gültigkeit
    if (programA.validity !== programB.validity && 
        programA.validity !== 'laufend' && 
        programB.validity !== 'laufend') {
      conflicts.push(`Gültigkeit: ${programA.validity} vs ${programB.validity}`);
      severity = severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
    }
    
    // Vergleiche Zielgruppen
    if (programA.target !== programB.target) {
      conflicts.push(`Zielgruppe: ${programA.target} vs ${programB.target}`);
      severity = severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
    }
    
    // Vergleiche Kategorien
    const categoriesA = new Set(programA.categories);
    const categoriesB = new Set(programB.categories);
    const commonCategories = [...categoriesA].filter(cat => categoriesB.has(cat));
    
    if (commonCategories.length === 0 && programA.categories.length > 0 && programB.categories.length > 0) {
      conflicts.push(`Keine gemeinsamen Kategorien`);
    }
    
    const hasConflict = conflicts.length > 0;
    const type = hasConflict ? (conflicts.some(c => c.includes('Betrag')) ? 'AMOUNT_MISMATCH' : 
                               conflicts.some(c => c.includes('Gültigkeit')) ? 'VALIDITY_CONFLICT' : 
                               'CRITERIA_DIFFERENT') : 'NO_CONFLICT';
    
    return {
      hasConflict,
      type,
      summary: conflicts.join('; '),
      severity
    };
  }
  
  /**
   * Entscheidet ob KI-Analyse nötig ist
   */
  private shouldUseAI(
    ruleBasedResult: HybridConflictResult['ruleBasedAnalysis'],
    programA: FoerderProgram,
    programB: FoerderProgram
  ): boolean {
    // KI nur bei unklaren oder komplexen Fällen verwenden
    
    // 1. Ähnliche Namen könnten identische Programme sein
    const namesSimilar = this.areNamesSimilar(programA.name, programB.name);
    if (namesSimilar) {
      console.log(`Ähnliche Namen erkannt: ${programA.name} vs ${programB.name}`);
      return true;
    }
    
    // 2. Regel-basierte Analyse hat Konflikte gefunden, aber niedrige Priorität
    if (ruleBasedResult.hasConflict && ruleBasedResult.severity === 'LOW') {
      return true;
    }
    
    // 3. Komplexe Beträge die schwer zu vergleichen sind
    if (this.hasComplexAmounts(programA.amount, programB.amount)) {
      return true;
    }
    
    // 4. Verschiedene Behörden aber ähnliche Programme
    if (programA.authority !== programB.authority && namesSimilar) {
      return true;
    }
    
    // 5. Unklare Gültigkeitszeiträume
    if (this.hasUnclearValidity(programA.validity, programB.validity)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Prüft ob Namen ähnlich sind
   */
  private areNamesSimilar(nameA: string, nameB: string): boolean {
    const normalizedA = nameA.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedB = nameB.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Einfache Ähnlichkeitsprüfung
    const shorter = normalizedA.length < normalizedB.length ? normalizedA : normalizedB;
    const longer = normalizedA.length >= normalizedB.length ? normalizedA : normalizedB;
    
    // Wenn der kürzere Name zu 80% im längeren enthalten ist
    const similarity = this.calculateSimilarity(shorter, longer);
    return similarity > 0.6;
  }
  
  /**
   * Berechnet Ähnlichkeit zwischen zwei Strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  /**
   * Berechnet Levenshtein-Distanz
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Prüft ob Beträge komplex zu vergleichen sind
   */
  private hasComplexAmounts(amountA: string, amountB: string): boolean {
    // Komplexe Beträge: Prozentsätze, Bereiche, Formeln
    const complexPatterns = [
      /\d+\s*%/,           // Prozentsätze
      /bis zu/i,           // Bereiche
      /je\s+\w+/i,         // Pro Einheit
      /max\./i,            // Maximum
      /abhängig/i,         // Abhängig von
      /nach\s+\w+/i        // Nach Kriterien
    ];
    
    return complexPatterns.some(pattern => 
      pattern.test(amountA) || pattern.test(amountB)
    );
  }
  
  /**
   * Prüft ob Gültigkeitszeiträume unklar sind
   */
  private hasUnclearValidity(validityA: string, validityB: string): boolean {
    const unclearPatterns = [
      /bis\s+auf\s+weiteres/i,
      /voraussichtlich/i,
      /geplant/i,
      /\d{4}\s*-\s*\d{4}/,  // Zeiträume
      /quartal/i,
      /halbjahr/i
    ];
    
    return unclearPatterns.some(pattern => 
      pattern.test(validityA) || pattern.test(validityB)
    );
  }
  
  /**
   * Kombiniert regel-basierte und KI-Ergebnisse
   */
  private combineResults(
    ruleBasedResult: HybridConflictResult['ruleBasedAnalysis'],
    aiAnalysis: AIConflictAnalysis | null
  ): HybridConflictResult {
    
    // Wenn keine KI-Analyse verfügbar, verwende nur regel-basierte Ergebnisse
    if (!aiAnalysis) {
      return {
        hasConflict: ruleBasedResult.hasConflict,
        conflictType: ruleBasedResult.type,
        severity: ruleBasedResult.severity,
        summary: ruleBasedResult.summary,
        ruleBasedAnalysis: ruleBasedResult,
        explanation: 'Regel-basierte Analyse (KI nicht verfügbar)'
      };
    }
    
    // KI-Analyse verfügbar - intelligente Kombination
    const finalHasConflict = this.decideFinalConflict(ruleBasedResult, aiAnalysis);
    const finalSeverity = this.decideFinalSeverity(ruleBasedResult, aiAnalysis);
    const finalType = aiAnalysis.conflictType !== 'NO_CONFLICT' ? aiAnalysis.conflictType : ruleBasedResult.type;
    
    return {
      hasConflict: finalHasConflict,
      conflictType: finalType,
      severity: finalSeverity,
      summary: this.createCombinedSummary(ruleBasedResult, aiAnalysis),
      confidence: aiAnalysis.confidence,
      aiAnalysis,
      ruleBasedAnalysis: ruleBasedResult,
      recommendation: aiAnalysis.recommendation,
      explanation: aiAnalysis.explanation
    };
  }
  
  /**
   * Entscheidet finalen Konflikt-Status
   */
  private decideFinalConflict(
    ruleBasedResult: HybridConflictResult['ruleBasedAnalysis'],
    aiAnalysis: AIConflictAnalysis
  ): boolean {
    // Hohe KI-Konfidenz überstimmt regel-basierte Analyse
    if (aiAnalysis.confidence > 0.8) {
      return aiAnalysis.hasConflict;
    }
    
    // Bei niedriger Konfidenz: Konservativ - wenn einer Konflikt sieht, dann Konflikt
    return ruleBasedResult.hasConflict || aiAnalysis.hasConflict;
  }
  
  /**
   * Entscheidet finalen Schweregrad
   */
  private decideFinalSeverity(
    ruleBasedResult: HybridConflictResult['ruleBasedAnalysis'],
    aiAnalysis: AIConflictAnalysis
  ): string {
    const severityOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
    
    const ruleScore = severityOrder[ruleBasedResult.severity as keyof typeof severityOrder] || 1;
    const aiScore = severityOrder[aiAnalysis.severity as keyof typeof severityOrder] || 1;
    
    // Gewichtete Kombination basierend auf KI-Konfidenz
    const weight = aiAnalysis.confidence;
    const combinedScore = (ruleScore * (1 - weight)) + (aiScore * weight);
    
    if (combinedScore >= 2.5) return 'HIGH';
    if (combinedScore >= 1.5) return 'MEDIUM';
    return 'LOW';
  }
  
  /**
   * Erstellt kombinierte Zusammenfassung
   */
  private createCombinedSummary(
    ruleBasedResult: HybridConflictResult['ruleBasedAnalysis'],
    aiAnalysis: AIConflictAnalysis
  ): string {
    const parts: string[] = [];
    
    if (ruleBasedResult.summary) {
      parts.push(`Regel-basiert: ${ruleBasedResult.summary}`);
    }
    
    if (aiAnalysis.explanation) {
      parts.push(`KI-Analyse: ${aiAnalysis.explanation}`);
    }
    
    return parts.join(' | ');
  }
  
  /**
   * Batch-Verarbeitung für mehrere Konflikte
   */
  async detectConflicts(conflicts: Array<{
    programA: FoerderProgram;
    programB: FoerderProgram;
    sourceA: string;
    sourceB: string;
  }>): Promise<HybridConflictResult[]> {
    const results: HybridConflictResult[] = [];
    
    for (const conflict of conflicts) {
      const result = await this.detectConflict(
        conflict.programA,
        conflict.programB,
        conflict.sourceA,
        conflict.sourceB
      );
      results.push(result);
    }
    
    return results;
  }
}

// Singleton-Instanz
export const hybridConflictDetector = new HybridConflictDetector();
