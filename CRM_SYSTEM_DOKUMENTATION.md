# ArtePlus CRM System - Vollständige Dokumentation

## Übersicht

Das ArtePlus CRM System ist eine umfassende Lösung für das Management von Leads, Kunden, Projekten und allen geschäftlichen Aktivitäten. Es wurde speziell für Unternehmen im Bereich erneuerbarer Energien und Gebäudesanierung entwickelt.

## Funktionsumfang

### ✅ Bereits implementiert

1. **Erweiterte Datenbankstruktur** (`supabase-crm-extended-schema.sql`)
   - Benutzer-Management mit Rollen
   - Erweiterte Kundendaten mit Lead-Pipeline
   - Produktinteressen-Tracking
   - Kontakt-Historie
   - Dokumenten-Management
   - Projekte mit detailliertem Tracking
   - Angebots-System
   - Förderungen und Zuschüsse
   - Benachrichtigungen
   - Automatisierungsregeln
   - Marketing-Kampagnen
   - KPI-Metriken

2. **TypeScript-Typen** (`src/lib/crm-types.ts`)
   - Vollständige Typisierung aller Datenstrukturen
   - Form-Typen für Eingaben
   - API-Response-Typen
   - Filter- und Such-Typen
   - Dashboard- und Analytics-Typen

3. **Benutzeroberfläche**
   - **Navigationsleiste** (`src/components/crm/Sidebar.tsx`)
     - Rollenbasierte Navigation
     - Responsive Design
     - Hierarchische Menüstruktur
   - **Anmeldesystem** (`src/components/crm/LoginForm.tsx`)
     - Einheitliches Login für alle Rollen
     - Demo-Zugangsdaten
     - Rollenauswahl
   - **Layout-System** (`src/components/crm/CRMLayout.tsx`)
     - Authentifizierung
     - Session-Management
     - Responsive Layout
   - **Dashboard** (`src/components/crm/Dashboard.tsx`)
     - KPI-Übersicht
     - Lead-Pipeline Visualisierung
     - Produktinteressen-Statistiken
     - Aktivitäten-Feed
     - Schnellaktionen

4. **Hauptseite** (`src/app/crm/page.tsx`)
   - Integration aller Komponenten
   - Routing-Setup

## Systemarchitektur

### Frontend-Struktur
```
src/
├── app/crm/                    # CRM-Routen
├── components/crm/             # CRM-Komponenten
├── lib/crm-types.ts           # TypeScript-Typen
└── lib/supabase.ts            # Datenbankverbindung
```

### Datenbankstruktur

#### Haupttabellen
- `users` - Benutzer mit Rollen (admin, vertrieb, monteur, kunde)
- `customers` - Erweiterte Kundendaten mit Lead-Pipeline
- `contact_history` - Alle Kundeninteraktionen
- `documents` - Dateien und Dokumente
- `projects` - Projektmanagement
- `quotes` - Angebotssystem
- `subsidies` - Förderungen und Zuschüsse
- `notifications` - Benachrichtigungssystem
- `automation_rules` - Automatisierungsregeln
- `marketing_campaigns` - Marketing-Kampagnen
- `kpi_metrics` - KPI-Tracking

#### Enum-Typen
- `lead_status` - Lead-Pipeline-Status
- `product_interest` - Produktkategorien
- `user_role` - Benutzerrollen
- `contact_type` - Kontaktarten
- `document_type` - Dokumenttypen
- `notification_type` - Benachrichtigungstypen

## Benutzerrollen

### Admin
- Vollzugriff auf alle Funktionen
- Benutzerverwaltung
- Systemeinstellungen
- Automatisierung
- Berichte und Analytics

### Vertrieb
- Kunden- und Lead-Management
- Angebotserstellung
- Projektübersicht
- Marketing-Tools
- Berichte

### Monteur
- Projektausführung
- Dokumentation
- Zeiterfassung
- Materialverwaltung

### Kunde
- Projektübersicht
- Kommunikation
- Dokumenteneinsicht
- Status-Updates

## Demo-Zugangsdaten

- **Admin:** admin@arteplus.de / admin123
- **Vertrieb:** vertrieb@arteplus.de / vertrieb123
- **Monteur:** monteur@arteplus.de / monteur123
- **Kunde:** kunde@beispiel.de / kunde123

## Installation und Setup

### 1. Abhängigkeiten installieren
```bash
npm install @heroicons/react
```

### 2. Datenbank einrichten
```sql
-- Führe das Schema aus:
psql -f supabase-crm-extended-schema.sql
```

### 3. Umgebungsvariablen
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. CRM starten
```bash
npm run dev
# Navigiere zu: http://localhost:3000/crm
```

## Noch zu implementierende Features

### 1. Kundenstammdaten-Management
- **Komponenten zu erstellen:**
  - `src/components/crm/CustomerList.tsx`
  - `src/components/crm/CustomerForm.tsx`
  - `src/components/crm/CustomerDetail.tsx`
- **API-Routen zu erweitern:**
  - `src/app/api/crm/customers/route.ts`
  - `src/app/api/crm/customers/[id]/route.ts`

### 2. Lead-Pipeline System
- **Komponenten zu erstellen:**
  - `src/components/crm/LeadPipeline.tsx`
  - `src/components/crm/LeadCard.tsx`
  - `src/components/crm/StatusChangeModal.tsx`
- **Features:**
  - Drag & Drop für Status-Änderungen
  - Automatische Follow-up Erinnerungen
  - Lead-Scoring

### 3. Produktinteresse-Tracking
- **Komponenten zu erstellen:**
  - `src/components/crm/ProductInterestMatrix.tsx`
  - `src/components/crm/ProductRecommendations.tsx`
- **Features:**
  - Automatische Produktempfehlungen
  - Cross-Selling Opportunities

### 4. Kontakt-Historie & Chat
- **Komponenten zu erstellen:**
  - `src/components/crm/ContactHistory.tsx`
  - `src/components/crm/ChatInterface.tsx`
  - `src/components/crm/EmailComposer.tsx`
- **Features:**
  - Real-time Chat
  - E-Mail Integration
  - Anruf-Logging

### 5. Dokumenten-Management
- **Komponenten zu erstellen:**
  - `src/components/crm/DocumentLibrary.tsx`
  - `src/components/crm/DocumentUpload.tsx`
  - `src/components/crm/DocumentViewer.tsx`
- **Features:**
  - Datei-Upload mit Drag & Drop
  - Versionierung
  - Automatische Kategorisierung

### 6. Automatisierte Benachrichtigungen
- **Komponenten zu erstellen:**
  - `src/components/crm/NotificationCenter.tsx`
  - `src/components/crm/AutomationRules.tsx`
- **Features:**
  - E-Mail Benachrichtigungen
  - Slack Integration
  - Push Notifications

### 7. Website-Integration
- **API-Routen zu erstellen:**
  - `src/app/api/crm/lead-capture/route.ts`
  - `src/app/api/crm/pv-calculator-integration/route.ts`
- **Features:**
  - Automatische Lead-Erfassung
  - PV-Rechner Integration
  - Kontaktformular-Integration

### 8. Excel/Google Sheets Sync
- **Services zu erweitern:**
  - `src/lib/googleSheets.ts` (bereits vorhanden)
  - `src/lib/excelSync.ts`
- **Features:**
  - Automatische Datenexporte
  - Bidirektionale Synchronisation
  - Scheduled Exports

### 9. Follow-Up Automation
- **Komponenten zu erstellen:**
  - `src/components/crm/FollowUpScheduler.tsx`
  - `src/components/crm/EmailTemplates.tsx`
- **Features:**
  - Automatische E-Mail-Sequenzen
  - Terminplanung
  - Reminder-System

### 10. Fördermittel-Integration
- **Komponenten zu erstellen:**
  - `src/components/crm/SubsidyMatcher.tsx`
  - `src/components/crm/SubsidyTracker.tsx`
- **Features:**
  - Automatische Förderprüfung
  - Antragsassistent
  - Status-Tracking

### 11. Kostenschätzung & Kalkulation
- **Komponenten zu erstellen:**
  - `src/components/crm/CostCalculator.tsx`
  - `src/components/crm/QuoteGenerator.tsx`
- **Features:**
  - Automatische Preisberechnung
  - Material- und Arbeitskosten
  - Margen-Kalkulation

### 12. Marketing Automation
- **Komponenten zu erstellen:**
  - `src/components/crm/CampaignBuilder.tsx`
  - `src/components/crm/NewsletterEditor.tsx`
- **Features:**
  - E-Mail-Kampagnen
  - Newsletter-System
  - Lead-Nurturing

### 13. Dashboard & KPIs
- **Komponenten zu erweitern:**
  - `src/components/crm/AdvancedCharts.tsx`
  - `src/components/crm/ReportBuilder.tsx`
- **Features:**
  - Interaktive Charts
  - Custom Reports
  - Export-Funktionen

## API-Struktur

### Geplante API-Endpunkte

```
/api/crm/
├── customers/
│   ├── GET /           # Liste aller Kunden
│   ├── POST /          # Neuen Kunden erstellen
│   ├── GET /[id]       # Kunde abrufen
│   ├── PUT /[id]       # Kunde aktualisieren
│   └── DELETE /[id]    # Kunde löschen
├── leads/
│   ├── GET /           # Lead-Pipeline
│   ├── POST /          # Neuen Lead erstellen
│   └── PUT /[id]/status # Lead-Status ändern
├── projects/
│   ├── GET /           # Alle Projekte
│   ├── POST /          # Neues Projekt
│   └── GET /[id]       # Projekt-Details
├── quotes/
│   ├── GET /           # Alle Angebote
│   ├── POST /          # Neues Angebot
│   └── GET /[id]/pdf   # Angebot als PDF
├── documents/
│   ├── GET /           # Dokumente auflisten
│   ├── POST /upload    # Dokument hochladen
│   └── GET /[id]       # Dokument abrufen
├── notifications/
│   ├── GET /           # Benachrichtigungen
│   └── PUT /[id]/read  # Als gelesen markieren
├── subsidies/
│   ├── GET /           # Verfügbare Förderungen
│   └── POST /check     # Förderprüfung
└── analytics/
    ├── GET /dashboard  # Dashboard-Daten
    ├── GET /pipeline   # Pipeline-Statistiken
    └── GET /revenue    # Umsatz-Berichte
```

## Sicherheit

### Row Level Security (RLS)
- Alle Tabellen haben RLS aktiviert
- Rollenbasierte Zugriffskontrolle
- Benutzer sehen nur ihre zugewiesenen Daten

### Authentifizierung
- Supabase Auth Integration
- JWT-basierte Sessions
- Sichere Passwort-Hashing

## Performance-Optimierungen

### Datenbankindizes
- Alle wichtigen Felder sind indiziert
- GIN-Indizes für Array-Felder
- Composite-Indizes für häufige Abfragen

### Frontend-Optimierungen
- Lazy Loading für große Listen
- Virtualisierung für Performance
- Optimistic Updates

## Deployment

### Produktionsumgebung
1. Supabase-Projekt einrichten
2. Schema deployen
3. RLS-Policies aktivieren
4. Umgebungsvariablen setzen
5. Vercel/Netlify Deployment

### Monitoring
- Supabase Dashboard für DB-Monitoring
- Vercel Analytics für Frontend
- Error Tracking mit Sentry

## Wartung und Updates

### Regelmäßige Aufgaben
- Datenbank-Backups
- Performance-Monitoring
- Security-Updates
- Feature-Updates

### Datenmigrationen
- Versionierte Schema-Änderungen
- Rollback-Strategien
- Daten-Validierung

## Support und Dokumentation

### Benutzerhandbuch
- Schritt-für-Schritt Anleitungen
- Video-Tutorials
- FAQ-Bereich

### Entwickler-Dokumentation
- API-Referenz
- Code-Beispiele
- Best Practices

## Roadmap

### Phase 1 (Aktuell)
- ✅ Grundlegende Struktur
- ✅ Authentifizierung
- ✅ Dashboard

### Phase 2 (Nächste Schritte)
- [ ] Kundenverwaltung
- [ ] Lead-Pipeline
- [ ] Kontakt-Management

### Phase 3 (Erweiterte Features)
- [ ] Automatisierung
- [ ] Marketing-Tools
- [ ] Advanced Analytics

### Phase 4 (Integration)
- [ ] Website-Integration
- [ ] Externe APIs
- [ ] Mobile App

## Fazit

Das ArtePlus CRM System bietet eine solide Grundlage für ein umfassendes Kundenmanagement. Die modulare Architektur ermöglicht eine schrittweise Implementierung aller gewünschten Features. Die bereits implementierten Komponenten zeigen die Richtung und Qualität des Systems auf.

Die nächsten Schritte sollten sich auf die Implementierung der Kundenverwaltung und des Lead-Pipeline-Systems konzentrieren, da diese die Kernfunktionalitäten des CRM darstellen.
