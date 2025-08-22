# Vercel API Deployment Anleitung

## 1. Vercel Projekt Setup

### Schritt 1: Vercel CLI installieren (falls noch nicht installiert)
```bash
npm i -g vercel
```

### Schritt 2: Bei Vercel anmelden
```bash
vercel login
```

### Schritt 3: Projekt mit Vercel verknüpfen
```bash
vercel --prod
```

## 2. Environment Variables in Vercel konfigurieren

### Option A: Über Vercel Dashboard
1. Gehe zu https://vercel.com/dashboard
2. Wähle dein Projekt aus
3. Gehe zu "Settings" → "Environment Variables"
4. Füge folgende Variables hinzu:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=dein_google_maps_api_key
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_supabase_service_role_key
SMTP_HOST=dein_smtp_host
SMTP_PORT=587
SMTP_USER=dein_smtp_user
SMTP_PASS=dein_smtp_password
```

### Option B: Über Vercel CLI
```bash
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
```

## 3. API Routes Struktur (bereits korrekt implementiert)

Deine API Routes sind bereits optimal strukturiert:

```
src/app/api/
├── customers/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── export-outlook/
│           └── route.ts
├── dwd-gti/
│   └── route.ts
├── emails/
│   └── route.ts
├── foerderungen/
├── installers/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── leads/
├── pvgis/
│   └── route.ts
└── specific-yield-dwd/
    └── route.ts
```

## 4. API Endpoints nach Deployment

Nach dem Deployment sind deine APIs unter folgenden URLs verfügbar:
- `https://deine-domain.vercel.app/api/dwd-gti`
- `https://deine-domain.vercel.app/api/pvgis`
- `https://deine-domain.vercel.app/api/customers`
- `https://deine-domain.vercel.app/api/installers`
- `https://deine-domain.vercel.app/api/emails`
- etc.

## 5. Deployment Befehle

### Entwicklung testen
```bash
vercel dev
```

### Preview Deployment
```bash
vercel
```

### Production Deployment
```bash
vercel --prod
```

## 6. API Testing nach Deployment

### Test mit curl:
```bash
# DWD-GTI API testen
curl -X POST https://deine-domain.vercel.app/api/dwd-gti \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 51.1657,
    "lon": 10.4515,
    "faces": [{"tiltDeg": 35, "azimuthDeg": 0}],
    "pr": 0.88
  }'

# PVGIS API testen
curl -X POST https://deine-domain.vercel.app/api/pvgis \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 51.1657,
    "lon": 10.4515,
    "faces": [{"tiltDeg": 35, "azimuthDeg": 0}]
  }'
```

## 7. Wichtige Vercel-spezifische Konfigurationen

### Runtime Konfiguration (bereits implementiert)
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

### Function Timeout (bereits konfiguriert in vercel.json)
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 8. Monitoring und Debugging

### Logs anzeigen
```bash
vercel logs deine-domain.vercel.app
```

### Function Invocations anzeigen
Im Vercel Dashboard unter "Functions" → "Invocations"

## 9. Domain Setup (falls eigene Domain)

### Custom Domain hinzufügen
1. Vercel Dashboard → Settings → Domains
2. Domain hinzufügen
3. DNS Records konfigurieren

## 10. Troubleshooting

### Häufige Probleme:
1. **Environment Variables nicht verfügbar**: Stelle sicher, dass alle Env Vars in Vercel gesetzt sind
2. **API Timeout**: Erhöhe maxDuration in vercel.json
3. **CORS Probleme**: CORS Headers sind bereits in vercel.json konfiguriert
4. **Build Fehler**: Überprüfe dass Prisma korrekt generiert wird

### Debug Commands:
```bash
# Lokale Entwicklung mit Vercel
vercel dev

# Build lokal testen
vercel build

# Deployment Status prüfen
vercel ls
```

## 11. Performance Optimierung

### Edge Functions (optional)
Für bessere Performance kannst du bestimmte APIs als Edge Functions konfigurieren:

```typescript
export const runtime = 'edge';
```

### Caching
Für statische Daten kannst du Caching aktivieren:

```typescript
export const revalidate = 3600; // 1 Stunde
```

## 12. Security Best Practices

1. **API Keys**: Niemals in Client-Code verwenden
2. **Rate Limiting**: Implementiere Rate Limiting für öffentliche APIs
3. **Input Validation**: Validiere alle Eingaben (bereits implementiert)
4. **HTTPS**: Vercel verwendet automatisch HTTPS

## Nächste Schritte:

1. Environment Variables in Vercel Dashboard setzen
2. `vercel --prod` ausführen
3. APIs testen
4. Custom Domain konfigurieren (optional)
