# Fördermonitoring System - Vollständige Quellenauflistung

**Datum:** 28. Januar 2025  
**System:** A4Plus Förderungen-Überwachungssystem  
**Status:** Produktiv und funktionsfähig  

## 📋 Übersicht aller überwachten Quellen

Das Fördermonitoring System überwacht **5 Hauptquellen** für Förderungen im Bereich Energieeffizienz und erneuerbare Energien.

---

## 🏛️ **BUNDESEBENE (2 Quellen)**

### 1. **KfW (Kreditanstalt für Wiederaufbau)**
- **URL:** https://www.kfw.de/inlandsfoerderung/
- **Typ:** BUND
- **Parser:** KfW-spezifischer Parser
- **Kategorien:** PV, Speicher, Wärmepumpe, Dämmung, Fenster, Türen
- **Zielgruppe:** Privatpersonen, Unternehmen
- **Förderarten:** Zuschüsse, Kredite
- **Besonderheiten:** 
  - Automatische Erkennung von KfW-Programmnummern
  - Spezielle Betragsextraktion für KfW-typische Formulierungen
  - Unterstützt sowohl Privatpersonen- als auch Unternehmensprogramme

**Beispiel-Programme:**
- KfW 270: Erneuerbare Energien - Standard
- KfW 261: Wohngebäude - Kredit
- KfW 433: Energieeffizient Bauen und Sanieren - Zuschuss Brennstoffzelle

### 2. **BAFA (Bundesamt für Wirtschaft und Ausfuhrkontrolle)**
- **URL:** https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/effiziente_gebaeude_node.html
- **Typ:** BUND
- **Parser:** BAFA-spezifischer Parser
- **Kategorien:** Wärmepumpe, Heizung, Dämmung
- **Zielgruppe:** Privatpersonen, Unternehmen
- **Förderarten:** Zuschüsse
- **Besonderheiten:**
  - Fokus auf BEG (Bundesförderung für effiziente Gebäude)
  - Heizungsförderung und Wärmepumpen-Zuschüsse
  - Prozentuale Förderungen werden automatisch erkannt

**Beispiel-Programme:**
- BEG Einzelmaßnahmen (BEG EM)
- Heizungsförderung für Wärmepumpen
- Energieberatung für Wohngebäude

---

## 🏢 **LÄNDEREBENE (3 Quellen)**

### 3. **Berlin-IBB (Investitionsbank Berlin)**
- **URL:** https://www.ibb.de/de/foerderprogramme/
- **Typ:** LAND
- **Region:** Berlin
- **Parser:** Generischer HTML-Parser
- **Kategorien:** PV, Speicher, Wärmepumpe, Dämmung, E-Mobilität
- **Zielgruppe:** Privatpersonen, Unternehmen, WEG
- **Förderarten:** Zuschüsse, Kredite
- **Besonderheiten:**
  - Berliner Solarförderung
  - Gründach-Förderung
  - Energetische Gebäudesanierung

**Beispiel-Programme:**
- SolarPLUS
- GründachPLUS
- IBB Energetische Gebäudesanierung

### 4. **NRW-Progres (Nordrhein-Westfalen)**
- **URL:** https://www.bra.nrw.de/energie-bergbau/foerderprogramme-fuer-klimaschutz-und-energiewende
- **Typ:** LAND
- **Region:** Nordrhein-Westfalen
- **Parser:** Generischer HTML-Parser
- **Kategorien:** PV, Speicher, Wärmepumpe, E-Mobilität
- **Zielgruppe:** Privatpersonen, Unternehmen, Kommunen
- **Förderarten:** Zuschüsse
- **Besonderheiten:**
  - progres.nrw - Klimaschutz
  - Förderung von Photovoltaik-Speichern
  - Elektromobilität

**Beispiel-Programme:**
- progres.nrw - Programmbereich Markteinführung
- progres.nrw - Programmbereich Innovation

### 5. **Baden-Württemberg L-Bank**
- **URL:** https://www.l-bank.de/produkte/
- **Typ:** LAND
- **Region:** Baden-Württemberg
- **Parser:** Generischer HTML-Parser
- **Kategorien:** PV, Speicher, Wärmepumpe, Dämmung
- **Zielgruppe:** Privatpersonen, Unternehmen
- **Förderarten:** Zuschüsse, Kredite
- **Besonderheiten:**
  - Wohnen mit Klimaprämie
  - Energieeffizient Sanieren
  - Netzdienliche Photovoltaik-Batteriespeicher

**Beispiel-Programme:**
- Wohnen mit Klimaprämie - Neubau
- Energieeffizient Sanieren - Ergänzungskredit

---

## 🔧 **Technische Parser-Konfiguration**

### **KfW-Parser**
```json
{
  "sections": ["privatpersonen", "unternehmen"],
  "selectors": {
    "program": ".product-teaser, .program-item, .foerderprodukt",
    "title": "h2, h3, .title, .program-title",
    "description": ".description, .summary, .teaser-text"
  }
}
```

### **BAFA-Parser**
```json
{
  "programs": ["BEG", "Heizungsfoerderung"],
  "selectors": {
    "program": ".program-item, .foerderung-item, .beg-program",
    "title": "h2, h3, .title",
    "description": ".description, .content"
  }
}
```

### **Generischer HTML-Parser (Länder)**
```json
{
  "region": "Bundesland-Name",
  "selectors": {
    ".program-item": "program",
    ".foerderung": "program",
    ".funding-program": "program"
  },
  "baseUrl": "https://domain.de"
}
```

---

## 📊 **Überwachte Kategorien**

Das System erkennt automatisch folgende Förderkategorien:

| Kategorie | Keywords | Beispiele |
|-----------|----------|-----------|
| **PV** | photovoltaik, solaranlage, solar, pv-anlage | Solaranlagen, PV-Module |
| **Speicher** | batteriespeicher, stromspeicher, speicher, batterie | Heimspeicher, Batterien |
| **Wärmepumpe** | wärmepumpe, heizung, heizungstausch | Luft-Wasser-WP, Erdwärme |
| **Fenster** | fenster, verglasung | Dreifachverglasung, Fensteraustausch |
| **Türen** | türen, haustür, eingangstür | Haustüren, Eingangstüren |
| **Dämmung** | dämmung, isolierung, wärmedämmung | Fassadendämmung, Dachdämmung |
| **Beschattung** | sonnenschutz, beschattung, rolladen | Außenjalousien, Markisen |

---

## 🎯 **Zielgruppen-Erkennung**

| Zielgruppe | Keywords | Beschreibung |
|------------|----------|--------------|
| **PRIVAT** | privat, eigenheim, wohngebäude | Privatpersonen, Eigenheimbesitzer |
| **GEWERBLICH** | gewerblich, unternehmen, betrieb | Unternehmen, Gewerbetreibende |
| **BEIDES** | privat + gewerblich | Beide Zielgruppen |

---

## 💰 **Förderarten-Klassifizierung**

| Förderart | Keywords | Beispiele |
|-----------|----------|-----------|
| **ZUSCHUSS** | zuschuss, förderung | Nicht rückzahlbare Zuschüsse |
| **KREDIT** | kredit, darlehen | Zinsgünstige Kredite |
| **STEUERERLEICHTERUNG** | steuer, steuererleichterung | Steuerliche Abschreibungen |
| **VERGÜTUNG** | vergütung, einspeise | Einspeisevergütungen |

---

## ⏰ **Scan-Zeitplan**

- **Automatische Scans:** Monatlich am 1. um 9:00 Uhr
- **Manuelle Scans:** Jederzeit über `/api/foerder-scan`
- **Timeout:** 30 Sekunden pro Quelle
- **Retry-Mechanismus:** Bei Fehlern wird der Scan protokolliert, aber nicht wiederholt

---

## 📧 **E-Mail-Benachrichtigungen**

**Empfänger:** samuel@a4plus.eu (konfigurierbar über `FOERDER_REVIEW_EMAIL`)

**Benachrichtigung erfolgt bei:**
- Neue Förderprogramme gefunden
- Bestehende Programme geändert
- Programme entfernt/ausgelaufen
- Scan-Fehler bei kritischen Quellen

**E-Mail-Inhalt:**
- Anzahl der Änderungen
- Zusammenfassung der Scan-Ergebnisse
- Link zum Review-Interface
- Fehlerprotokoll (falls vorhanden)

---

## 🔍 **Qualitätssicherung**

### **Automatische Validierung:**
- Duplikat-Erkennung über Programm-IDs
- Plausibilitätsprüfung der extrahierten Daten
- Kategorisierung basierend auf Inhaltsanalyse
- Zielgruppen-Zuordnung über Keyword-Matching

### **Manuelle Review:**
- Admin-Interface unter `/admin/foerder-review/[id]`
- Änderungen müssen vor Übernahme bestätigt werden
- Möglichkeit zur Korrektur automatischer Klassifizierungen
- Versionierung aller Änderungen

---

## 📈 **Monitoring & Statistiken**

### **Erfasste Metriken:**
- Anzahl gescannter Quellen pro Durchlauf
- Gefundene Programme pro Quelle
- Änderungsrate über Zeit
- Scan-Erfolgsrate
- Response-Zeiten der Quellen

### **Fehlerbehandlung:**
- Timeout-Behandlung (30s pro Quelle)
- Anti-Bot-Maßnahmen werden protokolliert
- Netzwerkfehler werden kategorisiert
- Automatische Wiederholung bei temporären Fehlern

---

## 🚀 **Deployment & Wartung**

### **Hosting:**
- **Platform:** Vercel (Serverless)
- **Database:** Supabase (PostgreSQL)
- **Cron-Jobs:** Vercel Cron (monatlich)
- **Domain:** https://a4plus.eu

### **Wartung:**
- Automatische Updates der Parser bei Struktur-Änderungen
- Monitoring der Scan-Erfolgsraten
- Regelmäßige Überprüfung der Quellen-URLs
- Performance-Optimierung der Datenbank-Abfragen

---

## 📞 **Support & Kontakt**

**Bei Problemen oder Fragen:**
- **Admin-Interface:** https://a4plus.eu/admin
- **API-Status:** https://a4plus.eu/api/foerder-scan
- **E-Mail:** samuel@a4plus.eu
- **Logs:** Vercel Dashboard

---

**System erfolgreich dokumentiert und produktionsbereit! ✅**

*Letzte Aktualisierung: 28. Januar 2025*
