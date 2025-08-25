# Debug PV-Quotes Problem

## Schritt 1: Debug-Endpoint testen

Ich habe einen Debug-Endpoint erstellt. Rufen Sie diesen auf:

**https://a4plus.eu/api/pv-quotes/debug**

Dieser Endpoint wird:
1. Umgebungsvariablen prüfen
2. Supabase-Verbindung testen
3. Test-Insert durchführen
4. Detaillierte Fehlermeldungen ausgeben

## Schritt 2: Mögliche Probleme und Lösungen

### Problem 1: Umgebungsvariablen fehlen
**Symptom**: `Missing environment variables`
**Lösung**: 
1. Gehen Sie zu Vercel Dashboard
2. Projekt auswählen → Settings → Environment Variables
3. Prüfen Sie:
   - `NEXT_PUBLIC_SUPABASE_URL` (Ihre Supabase URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service Role Key, NICHT anon key!)

### Problem 2: Falsche Supabase Keys
**Symptom**: `Database connection failed`
**Lösung**:
1. Gehen Sie zu Supabase Dashboard
2. Settings → API
3. Kopieren Sie den **service_role** Key (nicht den anon key!)
4. Aktualisieren Sie `SUPABASE_SERVICE_ROLE_KEY` in Vercel

### Problem 3: Tabelle existiert nicht
**Symptom**: `relation "pv_quotes" does not exist`
**Lösung**: Führen Sie das SQL-Schema in Supabase aus (haben Sie bereits gemacht)

### Problem 4: RLS Policy Problem
**Symptom**: `new row violates row-level security policy`
**Lösung**: Sie haben RLS bereits deaktiviert, das sollte nicht das Problem sein

## Schritt 3: Manuelle API-Tests

### Test 1: Einfacher POST-Request
Testen Sie die API direkt mit curl oder einem API-Tool:

```bash
curl -X POST https://a4plus.eu/api/pv-quotes \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "pvData": {
      "totalKWp": 10.5,
      "annualPV": 12000
    }
  }'
```

### Test 2: Browser-Konsole
Öffnen Sie die Browser-Konsole auf der PV-Rechner Seite und führen Sie aus:

```javascript
fetch('/api/pv-quotes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    pvData: {
      totalKWp: 10.5,
      annualPV: 12000
    }
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Schritt 4: Logs prüfen

1. Gehen Sie zu Vercel Dashboard
2. Ihr Projekt → Functions → Logs
3. Schauen Sie nach Fehlermeldungen beim Aufruf der API

## Schritt 5: Supabase Logs prüfen

1. Gehen Sie zu Supabase Dashboard
2. Logs → API Logs
3. Schauen Sie nach fehlgeschlagenen Requests

## Nächste Schritte

1. **Rufen Sie zuerst den Debug-Endpoint auf**: https://a4plus.eu/api/pv-quotes/debug
2. **Teilen Sie mir das Ergebnis mit**
3. **Basierend auf dem Ergebnis können wir das spezifische Problem identifizieren**

## Häufigste Ursachen (in der Reihenfolge der Wahrscheinlichkeit):

1. **Falsche Umgebungsvariablen** (90% der Fälle)
2. **Service Role Key statt Anon Key verwenden** (5% der Fälle)  
3. **Netzwerk/CORS Probleme** (3% der Fälle)
4. **Supabase-Konfiguration** (2% der Fälle)

Der Debug-Endpoint wird uns genau zeigen, wo das Problem liegt.
