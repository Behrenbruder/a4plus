# Quick Start: API Deployment zu Vercel

## 🚀 Schnellstart (3 Schritte)

### 1. Environment Variables setzen
Gehe zu [Vercel Dashboard](https://vercel.com/dashboard) → Dein Projekt → Settings → Environment Variables

**Erforderliche Variables:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=dein_api_key
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
SMTP_HOST=dein_smtp_host
SMTP_PORT=587
SMTP_USER=dein_smtp_user
SMTP_PASS=dein_smtp_password
```

### 2. Deployment ausführen
**Option A: Automatisches Script (Windows)**
```cmd
deploy-to-vercel.bat
```

**Option B: Manuelle Befehle**
```bash
# Vercel CLI installieren (falls nicht vorhanden)
npm install -g vercel

# Bei Vercel anmelden
vercel login

# Production Deployment
vercel --prod
```

### 3. APIs testen
Nach dem Deployment sind deine APIs verfügbar unter:
- `https://a4plus.eu/api/dwd-gti`
- `https://a4plus.eu/api/pvgis`
- `https://a4plus.eu/api/customers`
- `https://a4plus.eu/api/installers`
- `https://a4plus.eu/api/emails`

## 🧪 API Test Beispiele

### DWD-GTI API
```bash
curl -X POST https://a4plus.eu/api/dwd-gti \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 51.1657,
    "lon": 10.4515,
    "faces": [{"tiltDeg": 35, "azimuthDeg": 0}],
    "pr": 0.88
  }'
```

### PVGIS API
```bash
curl -X POST https://a4plus.eu/api/pvgis \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 51.1657,
    "lon": 10.4515,
    "faces": [{"tiltDeg": 35, "azimuthDeg": 0}]
  }'
```

## 📁 Verfügbare Dateien

- `VERCEL-API-DEPLOYMENT.md` - Detaillierte Anleitung
- `deploy-to-vercel.bat` - Windows Deployment Script
- `deploy-to-vercel.sh` - Linux/Mac Deployment Script
- `vercel.json` - Vercel Konfiguration (bereits optimiert)

## ⚡ Wichtige Hinweise

1. **Environment Variables** müssen in Vercel Dashboard gesetzt werden
2. **Prisma** wird automatisch während des Builds generiert
3. **API Timeout** ist auf 30 Sekunden konfiguriert
4. **CORS** ist bereits für alle API Routes aktiviert
5. **Security Headers** sind konfiguriert

## 🔧 Troubleshooting

**Problem: Build Fehler**
```bash
# Lokal testen
npm run build
npx prisma generate
```

**Problem: Environment Variables fehlen**
- Überprüfe Vercel Dashboard → Settings → Environment Variables
- Stelle sicher, dass alle erforderlichen Variablen gesetzt sind

**Problem: API nicht erreichbar**
- Überprüfe Deployment Status im Vercel Dashboard
- Teste mit curl oder Postman
- Überprüfe Function Logs in Vercel

## 📞 Support

Bei Problemen:
1. Überprüfe Vercel Dashboard → Functions → Logs
2. Teste APIs lokal mit `npm run dev`
3. Überprüfe Environment Variables
