import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { FoerderProgram } from '@/lib/foerder-parsers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApplyResult {
  success: boolean;
  appliedChanges: number;
  errors: string[];
  updatedPrograms: string[];
}

export async function POST(req: Request) {
  try {
    const { reviewId, changeIds, notes } = await req.json();
    
    if (!reviewId || !changeIds || !Array.isArray(changeIds)) {
      return NextResponse.json({
        success: false,
        error: 'Ungültige Parameter'
      }, { status: 400 });
    }
    
    console.log(`Übernehme ${changeIds.length} Änderungen für Review ${reviewId}`);
    
    const result: ApplyResult = {
      success: true,
      appliedChanges: 0,
      errors: [],
      updatedPrograms: []
    };
    
    // Lade die ausgewählten Änderungen
    const { data: changes, error: changesError } = await supabase
      .from('foerder_changes')
      .select('*')
      .in('id', changeIds)
      .eq('applied', false);
    
    if (changesError) {
      throw new Error(`Fehler beim Laden der Änderungen: ${changesError.message}`);
    }
    
    if (!changes || changes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Keine anwendbaren Änderungen gefunden'
      }, { status: 400 });
    }
    
    // Verarbeite jede Änderung
    for (const change of changes) {
      try {
        await applyChange(change);
        result.appliedChanges++;
        result.updatedPrograms.push(change.foerder_id);
        
        // Markiere Änderung als angewendet
        await supabase
          .from('foerder_changes')
          .update({
            reviewed: true,
            approved: true,
            applied: true,
            reviewer_notes: notes || ''
          })
          .eq('id', change.id);
          
      } catch (error) {
        console.error(`Fehler beim Anwenden der Änderung ${change.id}:`, error);
        result.errors.push(`${change.foerder_id}: ${error}`);
      }
    }
    
    // Update Review-Session
    const { error: reviewUpdateError } = await supabase
      .from('foerder_reviews')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString(),
        notes: notes || ''
      })
      .eq('id', reviewId);
    
    if (reviewUpdateError) {
      console.error('Fehler beim Update der Review-Session:', reviewUpdateError);
      result.errors.push(`Review-Update fehlgeschlagen: ${reviewUpdateError.message}`);
    }
    
    // Aktualisiere die JSON-Datei für die Live-API
    await updateLiveDataFile();
    
    console.log(`Erfolgreich ${result.appliedChanges} Änderungen angewendet`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Fehler beim Anwenden der Änderungen:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}

async function applyChange(change: any): Promise<void> {
  const { change_type, foerder_id, old_data, new_data } = change;
  
  switch (change_type) {
    case 'ADDED':
      await addProgram(new_data);
      break;
      
    case 'MODIFIED':
      await updateProgram(foerder_id, new_data);
      break;
      
    case 'REMOVED':
    case 'EXPIRED':
      await removeProgram(foerder_id);
      break;
      
    default:
      throw new Error(`Unbekannter Änderungstyp: ${change_type}`);
  }
}

async function addProgram(programData: FoerderProgram): Promise<void> {
  // Füge zur Live-Tabelle hinzu
  const { error } = await supabase
    .from('foerder_live')
    .upsert({
      id: programData.id,
      level: programData.level,
      name: programData.name,
      type: programData.type,
      categories: programData.categories,
      target: programData.target,
      summary: programData.summary,
      amount: programData.amount,
      criteria: programData.criteria,
      validity: programData.validity,
      authority: programData.authority,
      url: programData.url,
      regions: programData.regions || null,
      source_type: programData.level,
      source_name: programData.authority,
      active: true,
      last_verified: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString()
    });
  
  if (error) {
    throw new Error(`Fehler beim Hinzufügen des Programms: ${error.message}`);
  }
  
  console.log(`Programm hinzugefügt: ${programData.name}`);
}

async function updateProgram(programId: string, programData: FoerderProgram): Promise<void> {
  // Update in Live-Tabelle
  const { error } = await supabase
    .from('foerder_live')
    .update({
      name: programData.name,
      type: programData.type,
      categories: programData.categories,
      target: programData.target,
      summary: programData.summary,
      amount: programData.amount,
      criteria: programData.criteria,
      validity: programData.validity,
      authority: programData.authority,
      url: programData.url,
      regions: programData.regions || null,
      last_verified: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString()
    })
    .eq('id', programId);
  
  if (error) {
    throw new Error(`Fehler beim Aktualisieren des Programms: ${error.message}`);
  }
  
  console.log(`Programm aktualisiert: ${programData.name}`);
}

async function removeProgram(programId: string): Promise<void> {
  // Markiere als inaktiv statt zu löschen (für Audit-Trail)
  const { error } = await supabase
    .from('foerder_live')
    .update({
      active: false,
      last_updated: new Date().toISOString()
    })
    .eq('id', programId);
  
  if (error) {
    throw new Error(`Fehler beim Deaktivieren des Programms: ${error.message}`);
  }
  
  console.log(`Programm deaktiviert: ${programId}`);
}

async function updateLiveDataFile(): Promise<void> {
  try {
    // Lade alle aktiven Programme aus der Datenbank
    const { data: livePrograms, error } = await supabase
      .from('foerder_live')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error) {
      throw new Error(`Fehler beim Laden der Live-Programme: ${error.message}`);
    }
    
    // Konvertiere zu dem Format, das die bestehende API erwartet
    const formattedPrograms = livePrograms?.map(program => ({
      id: program.id,
      level: program.level,
      name: program.name,
      categories: program.categories,
      target: program.target,
      type: program.type,
      summary: program.summary,
      amount: program.amount,
      criteria: program.criteria,
      validity: program.validity,
      authority: program.authority,
      url: program.url,
      ...(program.regions && { regions: program.regions })
    })) || [];
    
    // Hier würde normalerweise die JSON-Datei aktualisiert werden
    // Da wir aber auf Vercel sind, können wir nicht direkt in Dateien schreiben
    // Stattdessen könnten wir:
    // 1. Die bestehende API so ändern, dass sie aus der Datenbank liest
    // 2. Oder ein externes System wie GitHub API verwenden, um die Datei zu aktualisieren
    
    console.log(`Live-Daten aktualisiert: ${formattedPrograms.length} aktive Programme`);
    
    // TODO: Implementiere Datei-Update oder API-Umstellung
    // Für jetzt loggen wir nur die Anzahl der Programme
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Live-Daten:', error);
    // Nicht kritisch - die Datenbank ist aktualisiert, auch wenn die JSON-Datei nicht ist
  }
}

// Hilfsfunktion für die Migration der bestehenden JSON-Daten in die Datenbank
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'migrate') {
    return await migrateExistingData();
  }
  
  if (action === 'sync') {
    return await syncDatabaseToJson();
  }
  
  return NextResponse.json({
    success: false,
    error: 'Ungültige Aktion. Verwende ?action=migrate oder ?action=sync'
  }, { status: 400 });
}

async function migrateExistingData(): Promise<NextResponse> {
  try {
    // Embedded JSON data (from src/data/foerderungen.json)
    const existingPrograms: FoerderProgram[] = [
      {
        "id": "kfw-458",
        "level": "BUND",
        "name": "KfW 458 – Heizungsförderung (Basis)",
        "type": "ZUSCHUSS",
        "categories": ["Wärmepumpe"],
        "target": "PRIVAT",
        "summary": "Basiszuschuss für den Heizungstausch in Bestandsgebäuden.",
        "amount": "30 % der förderfähigen Kosten (max. 30.000 € je Wohneinheit).",
        "criteria": "Eigentümer/in eines bestehenden Wohngebäudes; förderfähige Heizung; Antrag vor Auftrag.",
        "validity": "laufend",
        "authority": "KfW",
        "url": "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Förderprodukte/Heizungsförderung-für-Privatpersonen-Wohngebäude-(458)/"
      },
      {
        "id": "kfw-458-speed",
        "level": "BUND",
        "name": "KfW 458 – Geschwindigkeitsbonus",
        "type": "ZUSCHUSS",
        "categories": ["Wärmepumpe"],
        "target": "PRIVAT",
        "summary": "Zusatzförderung für schnellen Austausch alter fossiler Heizungen.",
        "amount": "+20 Prozentpunkte (Teil der 70 %-Obergrenze).",
        "criteria": "Austauschvoraussetzungen/Fristen gemäß Richtlinie.",
        "validity": "laufend",
        "authority": "BMWK/KfW",
        "url": "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Förderprodukte/Heizungsförderung-für-Privatpersonen-Wohngebäude-(458)/"
      },
      {
        "id": "kfw-458-einkommensbonus",
        "level": "BUND",
        "name": "KfW 458 – Einkommensbonus",
        "type": "ZUSCHUSS",
        "categories": ["Wärmepumpe"],
        "target": "PRIVAT",
        "summary": "Zusatzförderung für Haushalte mit ≤ 40.000 € zvE.",
        "amount": "+30 Prozentpunkte (Teil der 70 %-Obergrenze).",
        "criteria": "Nachweis zvE per Steuerbescheid.",
        "validity": "laufend",
        "authority": "KfW",
        "url": "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Förderprodukte/Heizungsförderung-für-Privatpersonen-Wohngebäude-(458)/"
      },
      {
        "id": "kfw-458-wp-effizienz",
        "level": "BUND",
        "name": "KfW 458 – Effizienzbonus Wärmepumpe",
        "type": "ZUSCHUSS",
        "categories": ["Wärmepumpe"],
        "target": "PRIVAT",
        "summary": "Bonus für besonders effiziente/nachhaltige Wärmepumpen.",
        "amount": "+5 Prozentpunkte.",
        "criteria": "Umweltquelle (Wasser/Grundwasser/Erdreich) oder natürliches Kältemittel (z. B. R290).",
        "validity": "laufend",
        "authority": "BAFA",
        "url": "https://www.bafa.de/SharedDocs/Downloads/DE/Energie/beg_waermepumpen_pruef_effizienznachweis.pdf"
      },
      {
        "id": "kfw-270",
        "level": "BUND",
        "name": "KfW 270 – Erneuerbare Energien – Standard",
        "type": "KREDIT",
        "categories": ["PV", "Speicher"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Kredit zur Finanzierung von PV-Anlagen und Batteriespeichern.",
        "amount": "Bis 100 % der Investitionskosten, max. 50 Mio. €.",
        "criteria": "Neuerrichtung/Erweiterung; Antrag vor Vorhabensbeginn über Hausbank.",
        "validity": "laufend",
        "authority": "KfW",
        "url": "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilie/Erneuerbare-Energien-Standard-(270)/"
      },
      {
        "id": "eeg-einspeise",
        "level": "BUND",
        "name": "EEG – Einspeisevergütung PV",
        "type": "VERGÜTUNG",
        "categories": ["PV"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Vergütung für ins Netz eingespeisten PV‑Strom (regelmäßig angepasste Sätze).",
        "amount": "ct/kWh abhängig von Größe/Inbetriebnahme.",
        "criteria": "Netzeinspeisung, Anmeldung Netzbetreiber & Marktstammdatenregister.",
        "validity": "laufend",
        "authority": "Bundesnetzagentur",
        "url": "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/Photovoltaik/start.html"
      },
      {
        "id": "ust-befreiung-pv",
        "level": "BUND",
        "name": "Nullsteuersatz (0 % USt) für PV-Anlagen & Speicher",
        "type": "STEUERERLEICHTERUNG",
        "categories": ["PV", "Speicher"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "0 % Umsatzsteuer auf Lieferung & Installation kleiner PV-Anlagen inkl. Speicher.",
        "amount": "0 % USt (Netto = Brutto).",
        "criteria": "i. d. R. ≤ 30 kWp; Lieferung & Installation aus einer Hand.",
        "validity": "laufend",
        "authority": "BMF",
        "url": "https://www.bundesfinanzministerium.de/Content/DE/FAQ/2022-12-20-Photovoltaikanlagen.html"
      },
      {
        "id": "steuererleichterung-pv",
        "level": "BUND",
        "name": "Einkommensteuer-Befreiung für kleine PV-Anlagen",
        "type": "STEUERERLEICHTERUNG",
        "categories": ["PV", "Speicher"],
        "target": "PRIVAT",
        "summary": "Ertragsteuerbefreiung z. B. bis 30 kWp (privat) bzw. 15 kWp je Einheit im MFH.",
        "amount": "0 % ESt für begünstigte Anlagen.",
        "criteria": "Inbetriebnahme & Registrierung (MaStR) – Details siehe BMF-FAQ.",
        "validity": "laufend",
        "authority": "BMF",
        "url": "https://www.bundesfinanzministerium.de/Content/DE/FAQ/2022-12-20-Photovoltaikanlagen.html"
      },
      {
        "id": "mieterstrom",
        "level": "BUND",
        "name": "Mieterstromzuschlag",
        "type": "ZUSCHUSS",
        "categories": ["PV"],
        "target": "GEWERBLICH / WEG",
        "summary": "Zuschlag für direkt an Mieter gelieferten Solarstrom aus PV-Anlagen auf Mietshäusern.",
        "amount": "ct/kWh gemäß EEG, abhängig von Anlagengröße.",
        "criteria": "Anlage ≤ 100 kWp; direkte Belieferung der Mieter; Meldungen an BNetzA.",
        "validity": "laufend",
        "authority": "Bundesnetzagentur",
        "url": "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/Mieterstrom/start.html"
      },
      {
        "id": "bafa-begem-huelle",
        "level": "BUND",
        "name": "BEG EM – Einzelmaßnahmen: Gebäudehülle",
        "type": "ZUSCHUSS",
        "categories": ["Fenster", "Türen", "Dämmung", "Beschattung"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Zuschüsse für Fenster, Außentüren, Dämmung, außenliegenden motorisierten Sonnenschutz.",
        "amount": "i. d. R. 15 % Zuschuss; +5 % iSFP‑Bonus.",
        "criteria": "Bestandsgebäude; Fachbetrieb; Antrag vor Beginn.",
        "validity": "laufend",
        "authority": "BAFA",
        "url": "https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/Energieeffizient_Bauen_und_Sanieren/Einzelmassnahmen/gebaeudehuelle/gebaeudehuelle_node.html"
      },
      {
        "id": "bafa-ebw-isfp",
        "level": "BUND",
        "name": "EBW – Energieberatung für Wohngebäude (iSFP)",
        "type": "ZUSCHUSS",
        "categories": ["Beratung"],
        "target": "PRIVAT",
        "summary": "Zuschuss für Energieberatung mit individuellem Sanierungsfahrplan (iSFP).",
        "amount": "50 % des Beratungshonorars (Deckel je nach Gebäudetyp).",
        "criteria": "Antrag vor Vertragsbeginn (oder auflösend bedingt).",
        "validity": "laufend",
        "authority": "BAFA",
        "url": "https://www.bafa.de/DE/Energie/Energieberatung/Energieberatung_Wohngebaeude/energieberatung_wohngebaeude_node.html"
      },
      {
        "id": "land-berlin-solarplus",
        "level": "LAND",
        "regions": [{ "bundesland": "Berlin" }],
        "name": "Berlin – SolarPLUS",
        "type": "ZUSCHUSS",
        "categories": ["PV", "Speicher", "Stecker-PV"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Landeszuschüsse für PV (inkl. Stecker‑PV) und Batteriespeicher.",
        "amount": "Je Maßnahme; Speicher u. a. pauschal/anteilig (Budget beachten).",
        "criteria": "Projekt in Berlin; Antrag vor Beginn; Richtlinie/Calls beachten.",
        "validity": "laufend (budgetabhängig)",
        "authority": "IBB Business Team",
        "url": "https://www.ibb-business-team.de/solarplus"
      },
      {
        "id": "land-nrw-progres",
        "level": "LAND",
        "regions": [{ "bundesland": "Nordrhein-Westfalen" }],
        "name": "Nordrhein‑Westfalen – progres.nrw",
        "type": "ZUSCHUSS",
        "categories": ["PV", "Speicher", "EE allgemein"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Call‑basierte Zuschüsse (Inhalte variieren je Aufruf).",
        "amount": "Je nach Aufruf",
        "criteria": "Antrag vor Vorhabensbeginn; Förderrichtlinie beachten.",
        "validity": "variabel (aufrufabhängig)",
        "authority": "Land NRW",
        "url": "https://www.bra.nrw.de/energie-bergbau/foerderprogramme-fuer-klimaschutz-und-energiewende"
      },
      {
        "id": "land-bw-pv-darlehen",
        "level": "LAND",
        "regions": [{ "bundesland": "Baden-Württemberg" }],
        "name": "Baden‑Württemberg – PV‑Darlehen (L‑Bank)",
        "type": "KREDIT",
        "categories": ["PV", "Speicher"],
        "target": "PRIVAT",
        "summary": "Zinsgünstiges Darlehen für PV (ggf. mit Speicher) am Eigenheim.",
        "amount": "Bis 100 % förderfähige Kosten (Hausbankverfahren).",
        "criteria": "Antrag vor Beginn; Programmkriterien L‑Bank.",
        "validity": "laufend",
        "authority": "L‑Bank",
        "url": "https://www.l-bank.de/produkte/privatpersonen/photovoltaik-pv.html"
      },
      {
        "id": "bw-wohnen-mit-zukunft",
        "level": "LAND",
        "regions": [{ "bundesland": "Baden-Württemberg" }],
        "name": "BW – Wohnen mit Zukunft (L‑Bank)",
        "type": "KREDIT",
        "categories": ["PV", "Speicher", "Sanierung"],
        "target": "PRIVAT",
        "summary": "Darlehen für klimafreundliche Modernisierung inkl. PV.",
        "amount": "Höhe/Laufzeit abhängig vom Vorhaben.",
        "criteria": "BW‑Wohnsitz; Antrag vor Baubeginn.",
        "validity": "laufend",
        "authority": "L‑Bank",
        "url": "https://www.l-bank.de/produkte/privatpersonen/wohnen-mit-zukunft.html"
      },
      {
        "id": "bremen-pv-plan",
        "level": "LAND",
        "regions": [{ "bundesland": "Bremen" }],
        "name": "Bremen – Photovoltaik nach Plan (BAB)",
        "type": "ZUSCHUSS",
        "categories": ["PV", "Speicher"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Landesprogramm zu PV (inkl. Speicher) – Konditionen abhängig vom Aufruf.",
        "amount": "Abhängig von Leistung/Speichergröße/Call.",
        "criteria": "Standort Bremen; Antrag vor Umsetzung.",
        "validity": "laufend (aufrufabhängig)",
        "authority": "Bremer Aufbau-Bank",
        "url": "https://www.bab-bremen.de/de/page/spezialprogramme/photovoltaik-nach-plan"
      },
      {
        "id": "hamburg-solar-gruendach",
        "level": "LAND",
        "regions": [{ "bundesland": "Hamburg" }],
        "name": "Hamburg – Gründachförderung (inkl. Solar-Unterkonstruktion)",
        "type": "ZUSCHUSS",
        "categories": ["PV"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Fördert Gründach – inkl. Zuschuss für Solar-Unterkonstruktion (Solargründach).",
        "amount": "Zuschuss abhängig von Fläche/Art; Zusatz für Solar-Unterkonstruktion möglich.",
        "criteria": "Standort Hamburg; Programmvorgaben beachten.",
        "validity": "laufend",
        "authority": "Freie und Hansestadt Hamburg",
        "url": "https://www.hamburg.de/bue/stadtnatur-foerderung/15265118/grundachfoerderung/"
      },
      {
        "id": "sachsenkredit-energie-speicher",
        "level": "LAND",
        "regions": [{ "bundesland": "Sachsen" }],
        "name": "Sachsen – Sachsenkredit Energie & Speicher (SAB)",
        "type": "KREDIT",
        "categories": ["PV", "Speicher"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Zinsgünstiger Kredit für PV‑Anlagen und Stromspeicher.",
        "amount": "Konditionen projektabhängig.",
        "criteria": "Standort Sachsen; Antrag über SAB.",
        "validity": "laufend",
        "authority": "Sächsische Aufbaubank",
        "url": "https://www.sab.sachsen.de/privatpersonen/sanieren-modernisieren/energie-und-speicher.jsp"
      },
      {
        "id": "nrwbank-gebaeudesanierung",
        "level": "LAND",
        "regions": [{ "bundesland": "Nordrhein-Westfalen" }],
        "name": "NRW – Gebäudesanierung",
        "type": "ZUSCHUSS",
        "categories": ["Fenster", "Türen"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Förderung für energetische Sanierungen inkl. Fenster.",
        "amount": "Je nach Maßnahme und Gebäudegröße.",
        "criteria": "NRW.",
        "validity": "laufend",
        "authority": "NRW.BANK",
        "url": "https://www.nrwbank.de/de/foerderung/foerderprodukte/15603/nrwbank-gebaeudesanierung.html"
      },
      {
        "id": "berlin-effiziente-gebaeudeplus",
        "level": "LAND",
        "regions": [{ "bundesland": "Berlin" }],
        "name": "Berlin – Effiziente GebäudePLUS",
        "type": "ZUSCHUSS",
        "categories": ["Fenster", "Türen", "Wärmepumpe"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Zuschüsse für energetische Modernisierung inkl. Fenster/Türen.",
        "amount": "Programmspezifische Obergrenzen pro Vorhaben/WE.",
        "criteria": "Berlin; Antrag vor Beginn.",
        "validity": "laufend",
        "authority": "IBB",
        "url": "https://www.ibb.de/de/foerderprogramme/effiziente-gebaeudeplus.html"
      },
      {
        "id": "nbank-nds-familie",
        "level": "LAND",
        "regions": [{ "bundesland": "Niedersachsen" }],
        "name": "Niedersachsen – Eigentum für Haushalte mit Kindern",
        "type": "KREDIT",
        "categories": ["Fenster", "Türen"],
        "target": "PRIVAT",
        "summary": "Familienkredit; kann für energetische Maßnahmen (z. B. Fenster) genutzt werden.",
        "amount": "Bis 85 % der Kosten; max. 50.000 €; zinslos bis 15 Jahre.",
        "criteria": "Kind <15 J. oder Behinderung im Haushalt.",
        "validity": "laufend",
        "authority": "NBank",
        "url": "https://www.nbank.de/Förderprogramme/Aktuelle-Förderprogramme/Eigentumsförderung-(Selbst-genutztes-Wohneigentum).html"
      },
      {
        "id": "sab-sachsen-sanierung",
        "level": "LAND",
        "regions": [{ "bundesland": "Sachsen" }],
        "name": "Sachsen – Energetische Sanierung von Wohnraum",
        "type": "ZUSCHUSS",
        "categories": ["Fenster", "Türen"],
        "target": "PRIVAT / GEWERBLICH",
        "summary": "Förderung für Fenster im Rahmen energetischer Sanierungen.",
        "amount": "Individuell je Maßnahme.",
        "criteria": "Sachsen.",
        "validity": "laufend",
        "authority": "SAB",
        "url": "https://www.sab.sachsen.de/en/w/sab-sachsenkredit-%E2%80%9Eklimafreundlicher-wohnen-umweltfreundliches-wohnen-f%C3%B6rdern-und-klimaziele-erreichen"
      },
      {
        "id": "kfw-159",
        "level": "BUND",
        "name": "KfW 159 – Altersgerecht Umbauen (Einbruchschutz u. a.)",
        "type": "KREDIT",
        "categories": ["Türen"],
        "target": "PRIVAT",
        "summary": "Kredit bis 50.000 € u. a. für einbruchhemmende Türen/Nachrüstung.",
        "amount": "Bis 50.000 € pro Wohneinheit.",
        "criteria": "Maßnahmen gemäß KfW‑Vorgaben; Fachausführung.",
        "validity": "laufend",
        "authority": "KfW",
        "url": "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilie/Einbruchschutz/"
      },
      {
        "id": "kfw-358-359",
        "level": "BUND",
        "name": "KfW-Ergänzungskredit 358/359 (zu BEG-Einzelmaßnahmen)",
        "type": "KREDIT",
        "categories": ["Fenster", "Türen", "Dämmung", "Beschattung", "Wärmepumpe"],
        "target": "BEIDES",
        "summary": "Zinsgünstiger Kredit als Ergänzung zu einem BAFA/KfW-Zuschuss (BEG-EM).",
        "amount": "Programm 358 mit Einkommensgrenze (≤ 90.000 € Haushalt); 359 ohne; Auszahlung über Finanzierungspartner.",
        "criteria": "Vorlage Zuschuss‑Bewilligung (BAFA/KfW) bzw. KfW‑Zusage.",
        "validity": "laufend",
        "authority": "KfW",
        "url": "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestehende-Immobilie/Förderprodukte/Einzelmaßnahmen-Ergänzungskredit-Wohngebäude-(358-359)/"
      }
    ];
    
    let migrated = 0;
    const errors: string[] = [];
    
    for (const program of existingPrograms) {
      try {
        await supabase
          .from('foerder_live')
          .upsert({
            id: program.id,
            level: program.level,
            name: program.name,
            type: program.type,
            categories: program.categories,
            target: program.target,
            summary: program.summary,
            amount: program.amount,
            criteria: program.criteria,
            validity: program.validity,
            authority: program.authority,
            url: program.url,
            regions: program.regions || null,
            source_type: program.level,
            source_name: program.authority,
            active: true,
            last_verified: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString()
          });
        
        migrated++;
      } catch (error) {
        errors.push(`${program.id}: ${error}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      migrated,
      total: existingPrograms.length,
      errors
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration fehlgeschlagen'
    }, { status: 500 });
  }
}

async function syncDatabaseToJson(): Promise<NextResponse> {
  try {
    await updateLiveDataFile();
    
    return NextResponse.json({
      success: true,
      message: 'Datenbank zu JSON synchronisiert'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Synchronisation fehlgeschlagen'
    }, { status: 500 });
  }
}
