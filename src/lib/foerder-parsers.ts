// Adapter/Parser für verschiedene Förderungsquellen
// Erstellt: 2025-01-27

import { JSDOM } from 'jsdom';

export interface FoerderProgram {
  id: string;
  level: "BUND" | "LAND";
  name: string;
  categories: string[];
  target: "PRIVAT" | "GEWERBLICH" | "BEIDES" | "PRIVAT / GEWERBLICH" | "GEWERBLICH / WEG";
  type: "ZUSCHUSS" | "KREDIT" | "STEUER" | "VERGUETUNG" | "VERGÜTUNG" | "STEUERERLEICHTERUNG";
  summary: string;
  amount: string;
  criteria: string;
  validity: string;
  authority: string;
  url: string;
  regions?: { bundesland: string }[];
}

export interface ParseResult {
  success: boolean;
  programs: FoerderProgram[];
  errors: string[];
  metadata: {
    source: string;
    scannedAt: Date;
    totalFound: number;
  };
}

export abstract class FoerderParser {
  abstract parse(html: string, config: any): Promise<ParseResult>;
  
  protected normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');
  }
  
  protected extractCategories(text: string): string[] {
    const categories: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Kategorien-Mapping
    const categoryMap = {
      'pv': ['photovoltaik', 'solaranlage', 'solar', 'pv-anlage'],
      'speicher': ['batteriespeicher', 'stromspeicher', 'speicher', 'batterie'],
      'wärmepumpe': ['wärmepumpe', 'heizung', 'heizungstausch'],
      'fenster': ['fenster', 'verglasung'],
      'türen': ['türen', 'haustür', 'eingangstür'],
      'dämmung': ['dämmung', 'isolierung', 'wärmedämmung'],
      'beschattung': ['sonnenschutz', 'beschattung', 'rolladen']
    };
    
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        categories.push(category.charAt(0).toUpperCase() + category.slice(1));
      }
    }
    
    return categories.length > 0 ? categories : ['Allgemein'];
  }
  
  protected extractTarget(text: string): FoerderProgram['target'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('privat') && lowerText.includes('gewerblich')) {
      return 'BEIDES';
    }
    if (lowerText.includes('gewerblich') || lowerText.includes('unternehmen')) {
      return 'GEWERBLICH';
    }
    if (lowerText.includes('privat') || lowerText.includes('eigenheim')) {
      return 'PRIVAT';
    }
    
    return 'BEIDES'; // Default
  }
  
  protected extractType(text: string): FoerderProgram['type'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('zuschuss') || lowerText.includes('förderung')) {
      return 'ZUSCHUSS';
    }
    if (lowerText.includes('kredit') || lowerText.includes('darlehen')) {
      return 'KREDIT';
    }
    if (lowerText.includes('steuer') || lowerText.includes('steuererleichterung')) {
      return 'STEUERERLEICHTERUNG';
    }
    if (lowerText.includes('vergütung') || lowerText.includes('einspeise')) {
      return 'VERGÜTUNG';
    }
    
    return 'ZUSCHUSS'; // Default
  }
}

export class KfWParser extends FoerderParser {
  async parse(html: string, config: any): Promise<ParseResult> {
    const errors: string[] = [];
    const programs: FoerderProgram[] = [];
    
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // KfW-spezifische Selektoren
      const programElements = document.querySelectorAll('.product-teaser, .program-item, .foerderprodukt');
      
      for (const element of programElements) {
        try {
          const titleElement = element.querySelector('h2, h3, .title, .program-title');
          const descElement = element.querySelector('.description, .summary, .teaser-text');
          const linkElement = element.querySelector('a');
          
          if (!titleElement || !descElement) continue;
          
          const title = this.normalizeText(titleElement.textContent || '');
          const description = this.normalizeText(descElement.textContent || '');
          const url = linkElement?.getAttribute('href') || '';
          
          // KfW-Programmnummer extrahieren
          const programMatch = title.match(/KfW\s*(\d+)/i);
          const programNumber = programMatch ? programMatch[1] : Math.random().toString(36).substr(2, 9);
          
          const program: FoerderProgram = {
            id: `kfw-${programNumber}`,
            level: 'BUND',
            name: title,
            categories: this.extractCategories(title + ' ' + description),
            target: this.extractTarget(description),
            type: this.extractType(title + ' ' + description),
            summary: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
            amount: this.extractAmount(description),
            criteria: this.extractCriteria(description),
            validity: 'laufend',
            authority: 'KfW',
            url: url.startsWith('http') ? url : `https://www.kfw.de${url}`
          };
          
          programs.push(program);
        } catch (error) {
          errors.push(`Fehler beim Parsen eines KfW-Programms: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Allgemeiner KfW-Parser-Fehler: ${error}`);
    }
    
    return {
      success: errors.length === 0,
      programs,
      errors,
      metadata: {
        source: 'KfW',
        scannedAt: new Date(),
        totalFound: programs.length
      }
    };
  }
  
  private extractAmount(text: string): string {
    // Typische KfW-Beträge extrahieren
    const amountPatterns = [
      /bis zu ([\d.,]+)\s*€/i,
      /max\.\s*([\d.,]+)\s*€/i,
      /(\d+)\s*%\s*der\s*kosten/i,
      /([\d.,]+)\s*€\s*je\s*wohneinheit/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Siehe Programmbedingungen';
  }
  
  private extractCriteria(text: string): string {
    // Vereinfachte Kriterien-Extraktion
    const sentences = text.split(/[.!?]+/);
    const criteriaKeywords = ['antrag', 'voraussetzung', 'bedingung', 'erforderlich'];
    
    const criteriaSentences = sentences.filter(sentence => 
      criteriaKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    return criteriaSentences.length > 0 
      ? criteriaSentences.join('. ').trim()
      : 'Siehe Programmbedingungen auf der KfW-Website';
  }
}

export class BAFAParser extends FoerderParser {
  async parse(html: string, config: any): Promise<ParseResult> {
    const errors: string[] = [];
    const programs: FoerderProgram[] = [];
    
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // BAFA-spezifische Selektoren
      const programElements = document.querySelectorAll('.program-item, .foerderung-item, .beg-program');
      
      for (const element of programElements) {
        try {
          const titleElement = element.querySelector('h2, h3, .title');
          const descElement = element.querySelector('.description, .content');
          const linkElement = element.querySelector('a');
          
          if (!titleElement) continue;
          
          const title = this.normalizeText(titleElement.textContent || '');
          const description = this.normalizeText(descElement?.textContent || '');
          const url = linkElement?.getAttribute('href') || '';
          
          const program: FoerderProgram = {
            id: `bafa-${Math.random().toString(36).substr(2, 9)}`,
            level: 'BUND',
            name: title,
            categories: this.extractCategories(title + ' ' + description),
            target: this.extractTarget(description),
            type: this.extractType(title),
            summary: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
            amount: this.extractBAFAAmount(description),
            criteria: 'Antrag vor Vorhabensbeginn; Details siehe BAFA-Website',
            validity: 'laufend',
            authority: 'BAFA',
            url: url.startsWith('http') ? url : `https://www.bafa.de${url}`
          };
          
          programs.push(program);
        } catch (error) {
          errors.push(`Fehler beim Parsen eines BAFA-Programms: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Allgemeiner BAFA-Parser-Fehler: ${error}`);
    }
    
    return {
      success: errors.length === 0,
      programs,
      errors,
      metadata: {
        source: 'BAFA',
        scannedAt: new Date(),
        totalFound: programs.length
      }
    };
  }
  
  private extractBAFAAmount(text: string): string {
    const amountPatterns = [
      /(\d+)\s*%\s*zuschuss/i,
      /bis zu ([\d.,]+)\s*€/i,
      /(\d+)\s*prozentpunkte/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Siehe BAFA-Richtlinien';
  }
}

export class GenericHTMLParser extends FoerderParser {
  async parse(html: string, config: any): Promise<ParseResult> {
    const errors: string[] = [];
    const programs: FoerderProgram[] = [];
    
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Generische Selektoren basierend auf Konfiguration
      const selectors = config.selectors || {
        '.program-item': 'program',
        '.foerderung': 'program',
        '.funding-program': 'program'
      };
      
      for (const [selector, type] of Object.entries(selectors)) {
        const elements = document.querySelectorAll(selector);
        
        for (const element of elements) {
          try {
            const titleElement = element.querySelector('h1, h2, h3, .title, .name');
            const descElement = element.querySelector('.description, .summary, .content, p');
            const linkElement = element.querySelector('a');
            
            if (!titleElement) continue;
            
            const title = this.normalizeText(titleElement.textContent || '');
            const description = this.normalizeText(descElement?.textContent || '');
            const url = linkElement?.getAttribute('href') || '';
            
            const program: FoerderProgram = {
              id: `${config.region?.toLowerCase().replace(/\s+/g, '-') || 'generic'}-${Math.random().toString(36).substr(2, 9)}`,
              level: config.region ? 'LAND' : 'BUND',
              name: title,
              categories: this.extractCategories(title + ' ' + description),
              target: this.extractTarget(description),
              type: this.extractType(title + ' ' + description),
              summary: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
              amount: 'Siehe Programmbedingungen',
              criteria: 'Siehe Förderrichtlinien',
              validity: 'laufend',
              authority: config.authority || 'Landesförderbank',
              url: url.startsWith('http') ? url : `${config.baseUrl || ''}${url}`,
              regions: config.region ? [{ bundesland: config.region }] : undefined
            };
            
            programs.push(program);
          } catch (error) {
            errors.push(`Fehler beim Parsen eines generischen Programms: ${error}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Allgemeiner HTML-Parser-Fehler: ${error}`);
    }
    
    return {
      success: errors.length === 0,
      programs,
      errors,
      metadata: {
        source: config.region || 'Generic',
        scannedAt: new Date(),
        totalFound: programs.length
      }
    };
  }
}

export class FoerderParserFactory {
  static createParser(type: string): FoerderParser {
    switch (type.toUpperCase()) {
      case 'KFW':
        return new KfWParser();
      case 'BAFA':
        return new BAFAParser();
      case 'GENERIC_HTML':
      default:
        return new GenericHTMLParser();
    }
  }
}

// LLM-Integration für intelligente Extraktion
export class LLMFoerderAnalyzer {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async analyzeProgram(rawText: string, url: string): Promise<Partial<FoerderProgram>> {
    try {
      const prompt = `
Analysiere das folgende Förderprogramm und extrahiere strukturierte Informationen:

URL: ${url}
Text: ${rawText}

Bitte extrahiere folgende Informationen im JSON-Format:
- name: Vollständiger Name des Programms
- categories: Array von Kategorien (PV, Speicher, Wärmepumpe, Fenster, Türen, Dämmung, Beschattung)
- target: Zielgruppe (PRIVAT, GEWERBLICH, BEIDES)
- type: Förderart (ZUSCHUSS, KREDIT, STEUERERLEICHTERUNG, VERGÜTUNG)
- summary: Kurze Zusammenfassung (max. 200 Zeichen)
- amount: Förderhöhe/Betrag
- criteria: Fördervoraussetzungen
- validity: Gültigkeitsdauer
- authority: Fördergeber

Antworte nur mit gültigem JSON.
      `;
      
      // Hier würde die LLM-API aufgerufen werden
      // Für jetzt verwenden wir eine vereinfachte Implementierung
      return this.fallbackAnalysis(rawText, url);
      
    } catch (error) {
      console.error('LLM-Analyse fehlgeschlagen:', error);
      return this.fallbackAnalysis(rawText, url);
    }
  }
  
  private fallbackAnalysis(text: string, url: string): Partial<FoerderProgram> {
    const parser = new GenericHTMLParser();
    
    return {
      name: text.substring(0, 100),
      categories: parser['extractCategories'](text),
      target: parser['extractTarget'](text),
      type: parser['extractType'](text),
      summary: text.substring(0, 200),
      amount: 'Siehe Programmbedingungen',
      criteria: 'Siehe Förderrichtlinien',
      validity: 'laufend',
      authority: 'Fördergeber'
    };
  }
}
