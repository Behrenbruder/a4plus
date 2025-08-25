// /src/scripts/show-bdew-profiles-table.ts
import { 
  generateH25Profile, 
  generateS25Profile,
  DayType 
} from '@/lib/bdewProfiles';

/**
 * Berechnet den Tag des Jahres (1-365/366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * BDEW Dynamisierungsfunktion
 */
function getDynamisierungsfaktor(dayOfYear: number): number {
  const t = dayOfYear;
  const factor = -3.92e-10 * Math.pow(t, 4) + 
                 3.20e-7 * Math.pow(t, 3) - 
                 7.02e-5 * Math.pow(t, 2) + 
                 2.10e-3 * t + 
                 1.24;
  
  return Math.round(factor * 10000) / 10000;
}

/**
 * Bestimmt den Tagestyp basierend auf Datum
 */
function getDayType(date: Date): DayType {
  const dayOfWeek = date.getDay();
  
  // Vereinfachte Feiertagslogik
  const isHoliday = isGermanHoliday(date);
  
  if (isHoliday || dayOfWeek === 0) return 'FT'; // Feiertag/Sonntag
  if (dayOfWeek === 6) return 'SA'; // Samstag
  return 'WT'; // Werktag
}

/**
 * Vereinfachte deutsche Feiertagslogik
 */
function isGermanHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const fixedHolidays = [
    [1, 1],   // Neujahr
    [5, 1],   // Tag der Arbeit
    [10, 3],  // Tag der Deutschen Einheit
    [12, 25], // 1. Weihnachtstag
    [12, 26]  // 2. Weihnachtstag
  ];
  
  return fixedHolidays.some(([m, d]) => month === m && day === d);
}

/**
 * Formatiert eine Zahl für die Tabellenanzeige
 */
function formatNumber(num: number, decimals: number = 3): string {
  return num.toFixed(decimals).padStart(8);
}

/**
 * Formatiert die Zeit (Viertelstunde)
 */
function formatTime(quarterHour: number): string {
  const hour = Math.floor(quarterHour / 4);
  const minute = (quarterHour % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Zeigt BDEW Profile als Tabelle an
 */
function showBDEWProfilesTable() {
  console.log('📊 BDEW Standardlastprofile 2025 - Dynamisierte Profile\n');
  console.log('═'.repeat(120));
  console.log('Basierend auf den aktualisierten BDEW-Profilen H25 (Haushalt) und S25 (PV-Speicher)');
  console.log('Alle Werte sind auf 1 MWh Jahresverbrauch normiert');
  console.log('═'.repeat(120));
  
  // Beispieltage für verschiedene Jahreszeiten und Tagestypen
  const exampleDates = [
    { date: new Date(2025, 0, 1), name: 'Neujahr (Feiertag)' },      // 1. Januar
    { date: new Date(2025, 0, 15), name: 'Winter Werktag' },         // 15. Januar
    { date: new Date(2025, 0, 18), name: 'Winter Samstag' },         // 18. Januar
    { date: new Date(2025, 3, 15), name: 'Frühling Werktag' },       // 15. April
    { date: new Date(2025, 6, 15), name: 'Sommer Werktag' },         // 15. Juli
    { date: new Date(2025, 9, 15), name: 'Herbst Werktag' },         // 15. Oktober
    { date: new Date(2025, 11, 25), name: '1. Weihnachtstag' },      // 25. Dezember
  ];
  
  for (const example of exampleDates) {
    const dayOfYear = getDayOfYear(example.date);
    const dayType = getDayType(example.date);
    const dynFactor = getDynamisierungsfaktor(dayOfYear);
    const h25Profile = generateH25Profile(example.date);
    const s25Profile = generateS25Profile(example.date);
    
    console.log(`\n🗓️  ${example.name} (${example.date.toLocaleDateString('de-DE')})`);
    console.log(`    Tag des Jahres: ${dayOfYear}, Tagestyp: ${dayType}, Dynamisierungsfaktor: ${dynFactor}`);
    console.log('─'.repeat(120));
    console.log('Zeit  │    H25 (Haushalt)    │  S25 (PV-Speicher)  │ Zeit  │    H25 (Haushalt)    │  S25 (PV-Speicher)');
    console.log('──────┼──────────────────────┼──────────────────────┼───────┼──────────────────────┼──────────────────────');
    
    // Zeige nur jede 4. Viertelstunde (stündlich) für bessere Übersicht
    for (let i = 0; i < 48; i += 2) { // 48 Halbstunden = 24 Stunden, zeige jede 2. = stündlich
      const time1 = formatTime(i * 2);
      const h25_1 = formatNumber(h25Profile[i * 2]);
      const s25_1 = formatNumber(s25Profile[i * 2]);
      
      let line = `${time1} │ ${h25_1} │ ${s25_1} │`;
      
      // Zweite Spalte (12 Stunden später)
      const j = i + 48;
      if (j < 96) {
        const time2 = formatTime(j);
        const h25_2 = formatNumber(h25Profile[j]);
        const s25_2 = formatNumber(s25Profile[j]);
        line += ` ${time2} │ ${h25_2} │ ${s25_2}`;
      } else {
        line += '       │                      │                     ';
      }
      
      console.log(line);
    }
  }
  
  // Zeige Dynamisierungsfaktoren für das ganze Jahr
  console.log('\n\n📈 Dynamisierungsfaktoren im Jahresverlauf');
  console.log('═'.repeat(80));
  console.log('Monat     │ Tag 1  │ Tag 15 │ Tag 30 │ Min    │ Max    │ Durchschnitt');
  console.log('──────────┼────────┼────────┼────────┼────────┼────────┼─────────────');
  
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(2025, month + 1, 0).getDate();
    
    const day1 = getDayOfYear(new Date(2025, month, 1));
    const day15 = getDayOfYear(new Date(2025, month, Math.min(15, daysInMonth)));
    const day30 = getDayOfYear(new Date(2025, month, Math.min(30, daysInMonth)));
    
    const factor1 = getDynamisierungsfaktor(day1);
    const factor15 = getDynamisierungsfaktor(day15);
    const factor30 = getDynamisierungsfaktor(day30);
    
    // Berechne Min, Max und Durchschnitt für den Monat
    let minFactor = Infinity;
    let maxFactor = -Infinity;
    let sumFactor = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfYear = getDayOfYear(new Date(2025, month, day));
      const factor = getDynamisierungsfaktor(dayOfYear);
      minFactor = Math.min(minFactor, factor);
      maxFactor = Math.max(maxFactor, factor);
      sumFactor += factor;
    }
    
    const avgFactor = sumFactor / daysInMonth;
    
    console.log(
      `${monthNames[month].padEnd(9)} │ ${factor1.toFixed(4)} │ ${factor15.toFixed(4)} │ ${factor30.toFixed(4)} │ ${minFactor.toFixed(4)} │ ${maxFactor.toFixed(4)} │ ${avgFactor.toFixed(6)}`
    );
  }
  
  // Zeige Statistiken
  console.log('\n\n📊 Jahresstatistiken der Dynamisierungsfaktoren');
  console.log('═'.repeat(60));
  
  let yearMin = Infinity;
  let yearMax = -Infinity;
  let yearSum = 0;
  let yearCount = 0;
  
  for (let day = 1; day <= 365; day++) {
    const factor = getDynamisierungsfaktor(day);
    yearMin = Math.min(yearMin, factor);
    yearMax = Math.max(yearMax, factor);
    yearSum += factor;
    yearCount++;
  }
  
  const yearAvg = yearSum / yearCount;
  
  console.log(`Minimum:      ${yearMin.toFixed(4)} (Tag ${Array.from({length: 365}, (_, i) => i + 1).find(day => getDynamisierungsfaktor(day) === yearMin)})`);
  console.log(`Maximum:      ${yearMax.toFixed(4)} (Tag ${Array.from({length: 365}, (_, i) => i + 1).find(day => getDynamisierungsfaktor(day) === yearMax)})`);
  console.log(`Durchschnitt: ${yearAvg.toFixed(6)}`);
  console.log(`Spannweite:   ${(yearMax - yearMin).toFixed(4)}`);
  
  // Zeige Formel
  console.log('\n\n🧮 BDEW Dynamisierungsformel');
  console.log('═'.repeat(80));
  console.log('x = x₀ * (-3,92E-10 * t⁴ + 3,20E-7 * t³ - 7,02E-5 * t² + 2,10E-3 * t + 1,24)');
  console.log('');
  console.log('Dabei ist:');
  console.log('x  = der resultierende dynamisierte Viertelstundenwert');
  console.log('x₀ = der Basis-Viertelstundenwert aus der Profiltabelle');
  console.log('t  = der Tag des Jahres (1 = 1. Januar, 365 = 31. Dezember)');
  console.log('');
  console.log('Rundung:');
  console.log('- Dynamisierungsfaktor: 4 Nachkommastellen');
  console.log('- Endergebnis: 3 Nachkommastellen');
  
  console.log('\n🎉 BDEW Profile Tabelle vollständig angezeigt!');
}

// Führe Anzeige aus, wenn Skript direkt aufgerufen wird
if (require.main === module) {
  showBDEWProfilesTable();
}

export { showBDEWProfilesTable };
