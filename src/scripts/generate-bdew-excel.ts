// /src/scripts/generate-bdew-excel.ts
import { generateH25YearProfile, generateS25YearProfile } from '@/lib/bdewProfiles';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generiert Excel-CSV-Dateien für H25 und S25 BDEW-Profile
 */
function generateBDEWExcelFiles() {
  console.log('📊 Generiere BDEW-Profile als Excel-Dateien...\n');
  
  const year = 2024;
  
  // Generiere die Profile
  console.log('Generiere H25-Profil...');
  const h25Profile = generateH25YearProfile(year);
  
  console.log('Generiere S25-Profil...');
  const s25Profile = generateS25YearProfile(year);
  
  console.log(`H25-Profil: ${h25Profile.length} Werte`);
  console.log(`S25-Profil: ${s25Profile.length} Werte`);
  
  // Kürze Profile auf exakt 8760 Stunden (falls Schaltjahr)
  const h25Profile8760 = h25Profile.slice(0, 8760);
  const s25Profile8760 = s25Profile.slice(0, 8760);
  
  console.log(`H25-Profil gekürzt auf: ${h25Profile8760.length} Werte`);
  console.log(`S25-Profil gekürzt auf: ${s25Profile8760.length} Werte`);
  
  // Erstelle Datum/Uhrzeit-Array für 8760 Stunden
  const dateTimeArray: string[] = [];
  const startDate = new Date(year, 0, 1, 0, 0, 0); // 1. Januar, 00:00
  
  for (let hour = 0; hour < 8760; hour++) {
    const currentDate = new Date(startDate.getTime() + hour * 60 * 60 * 1000);
    const dateStr = currentDate.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = currentDate.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    dateTimeArray.push(`${dateStr} ${timeStr}`);
  }
  
  // Erstelle CSV-Inhalte
  function createCSVContent(profile: number[], profileName: string): string {
    let csv = `Datum/Uhrzeit;${profileName} [kWh]\n`;
    
    for (let i = 0; i < Math.min(profile.length, dateTimeArray.length); i++) {
      // Formatiere Wert mit deutschem Dezimaltrennzeichen
      const value = profile[i].toFixed(6).replace('.', ',');
      csv += `${dateTimeArray[i]};${value}\n`;
    }
    
    return csv;
  }
  
  // Erstelle H25-CSV
  const h25CSV = createCSVContent(h25Profile8760, 'H25');
  const h25FilePath = path.join(process.cwd(), 'public', 'BDEW_H25_Profil_2024.csv');
  fs.writeFileSync(h25FilePath, h25CSV, 'utf8');
  
  // Erstelle S25-CSV
  const s25CSV = createCSVContent(s25Profile8760, 'S25');
  const s25FilePath = path.join(process.cwd(), 'public', 'BDEW_S25_Profil_2024.csv');
  fs.writeFileSync(s25FilePath, s25CSV, 'utf8');
  
  // Statistiken (basierend auf 8760-Stunden-Profilen)
  const h25Sum = h25Profile8760.reduce((sum, val) => sum + val, 0);
  const s25Sum = s25Profile8760.reduce((sum, val) => sum + val, 0);
  const h25Avg = h25Sum / h25Profile8760.length;
  const s25Avg = s25Sum / s25Profile8760.length;
  const h25Max = Math.max(...h25Profile8760);
  const s25Max = Math.max(...s25Profile8760);
  const h25Min = Math.min(...h25Profile8760);
  const s25Min = Math.min(...s25Profile8760);
  
  console.log('\n📈 Statistiken:');
  console.log('─'.repeat(50));
  console.log(`H25-Profil:`);
  console.log(`  Jahressumme: ${h25Sum.toFixed(2)} kWh`);
  console.log(`  Durchschnitt: ${h25Avg.toFixed(6)} kWh/h`);
  console.log(`  Maximum: ${h25Max.toFixed(6)} kWh/h`);
  console.log(`  Minimum: ${h25Min.toFixed(6)} kWh/h`);
  
  console.log(`\nS25-Profil:`);
  console.log(`  Jahressumme: ${s25Sum.toFixed(2)} kWh`);
  console.log(`  Durchschnitt: ${s25Avg.toFixed(6)} kWh/h`);
  console.log(`  Maximum: ${s25Max.toFixed(6)} kWh/h`);
  console.log(`  Minimum: ${s25Min.toFixed(6)} kWh/h`);
  
  console.log('\n📁 Dateien erstellt:');
  console.log(`✅ ${h25FilePath}`);
  console.log(`✅ ${s25FilePath}`);
  
  console.log('\n💡 Hinweise:');
  console.log('- Die CSV-Dateien verwenden Semikolon (;) als Trennzeichen');
  console.log('- Dezimaltrennzeichen ist Komma (,) für Excel-Kompatibilität');
  console.log('- Die Dateien können direkt in Excel geöffnet werden');
  console.log('- Werte sind bereits dynamisiert (BDEW 2025 Formel)');
  console.log('- Normiert auf 1 MWh Jahresverbrauch');
  
  // Erstelle auch eine Zusammenfassung
  const summaryContent = `BDEW-Profile Zusammenfassung
Generiert am: ${new Date().toLocaleString('de-DE')}
Jahr: ${year}

H25-Profil (Haushalt):
- Datei: BDEW_H25_Profil_2024.csv
- Jahressumme: ${h25Sum.toFixed(2)} kWh
- Durchschnitt: ${h25Avg.toFixed(6)} kWh/h
- Maximum: ${h25Max.toFixed(6)} kWh/h
- Minimum: ${h25Min.toFixed(6)} kWh/h

S25-Profil (PV-Speicher Kombination):
- Datei: BDEW_S25_Profil_2024.csv
- Jahressumme: ${s25Sum.toFixed(2)} kWh
- Durchschnitt: ${s25Avg.toFixed(6)} kWh/h
- Maximum: ${s25Max.toFixed(6)} kWh/h
- Minimum: ${s25Min.toFixed(6)} kWh/h

Verwendung:
- H25: Für Haushalte ohne Batteriespeicher
- S25: Für Haushalte mit PV-Batteriespeicher
- Werte sind normiert auf 1 MWh (1000 kWh) Jahresverbrauch
- Für anderen Jahresverbrauch: Werte entsprechend skalieren
`;
  
  const summaryPath = path.join(process.cwd(), 'public', 'BDEW_Profile_Zusammenfassung.txt');
  fs.writeFileSync(summaryPath, summaryContent, 'utf8');
  console.log(`✅ ${summaryPath}`);
  
  console.log('\n🎉 Excel-Dateien erfolgreich generiert!');
}

// Führe Generierung aus, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  generateBDEWExcelFiles();
}

export { generateBDEWExcelFiles };
