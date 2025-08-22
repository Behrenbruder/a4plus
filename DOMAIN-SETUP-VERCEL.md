# Domain-Setup Problem beheben - www.a4plus.eu

## Problem
Die Website zeigt `ERR_SSL_PROTOCOL_ERROR` bei www.a4plus.eu, obwohl der Vercel-Build erfolgreich ist.

## Ursachen
1. **Domain noch nicht korrekt verknüpft** - DNS-Einstellungen fehlen oder sind falsch
2. **SSL-Zertifikat noch nicht ausgestellt** - Vercel benötigt Zeit für SSL-Generierung
3. **DNS-Propagation** - Änderungen brauchen Zeit (bis zu 48h)

## Sofortige Lösungsschritte

### Schritt 1: Vercel Domain-Einstellungen prüfen
1. **Vercel Dashboard öffnen**: https://vercel.com/dashboard
2. **Projekt auswählen**: firma-website
3. **Settings** → **Domains** öffnen
4. **Prüfen ob www.a4plus.eu korrekt hinzugefügt ist**

### Schritt 2: DNS-Einstellungen beim Domain-Provider
**Bei Ihrem Domain-Provider (wo a4plus.eu registriert ist):**

```
Typ: CNAME
Name: www
Wert: cname.vercel-dns.com

Typ: A (für Root-Domain a4plus.eu)
Name: @
Wert: 76.76.19.61
```

**Alternative (empfohlen):**
```
Typ: CNAME
Name: www
Wert: [ihr-vercel-projekt].vercel.app

Typ: CNAME  
Name: @
Wert: [ihr-vercel-projekt].vercel.app
```

### Schritt 3: Vercel Domain-Konfiguration
1. **In Vercel Dashboard**:
   - Domains → "Add Domain"
   - `a4plus.eu` hinzufügen (ohne www)
   - `www.a4plus.eu` hinzufügen
   - Beide als "Primary" markieren

2. **SSL-Zertifikat warten**:
   - Vercel generiert automatisch SSL-Zertifikate
   - Kann 5-10 Minuten dauern
   - Status in Domain-Settings prüfen

### Schritt 4: DNS-Propagation prüfen
**Online-Tools verwenden:**
- https://dnschecker.org
- Domain: www.a4plus.eu eingeben
- Warten bis alle Regionen "grün" sind

## Temporäre Lösungen

### Option 1: Vercel-URL verwenden
Bis die Domain funktioniert, verwenden Sie:
```
https://[projekt-name].vercel.app
```

### Option 2: Ohne www testen
Versuchen Sie:
```
https://a4plus.eu (ohne www)
```

## Häufige Probleme & Lösungen

### Problem: "Domain not found"
**Lösung:**
1. Domain in Vercel Dashboard entfernen
2. 5 Minuten warten
3. Domain erneut hinzufügen

### Problem: "SSL Certificate Error"
**Lösung:**
1. In Vercel: Settings → Domains
2. Bei der Domain auf "Refresh" klicken
3. SSL-Erneuerung abwarten (5-10 Min)

### Problem: "DNS not configured"
**Lösung:**
1. DNS-Einstellungen beim Provider prüfen
2. CNAME-Records korrekt setzen
3. 24-48h auf Propagation warten

## Vercel-spezifische Einstellungen

### Automatische HTTPS-Weiterleitung
Vercel leitet automatisch HTTP → HTTPS weiter.

### WWW-Weiterleitung
In `vercel.json` ist bereits konfiguriert:
```json
"redirects": [
  {
    "source": "/www.a4plus.eu/(.*)",
    "destination": "https://a4plus.eu/$1",
    "permanent": true
  }
]
```

## Debugging-Schritte

### 1. DNS-Lookup testen
```bash
nslookup www.a4plus.eu
```

### 2. SSL-Zertifikat prüfen
```bash
openssl s_client -connect www.a4plus.eu:443
```

### 3. Vercel-Logs prüfen
- Vercel Dashboard → Functions → View Logs
- Nach Fehlern suchen

## Zeitrahmen
- **DNS-Änderungen**: 5 Minuten - 48 Stunden
- **SSL-Zertifikat**: 5-10 Minuten nach DNS-Propagation
- **Vollständige Funktionalität**: Meist innerhalb 1 Stunde

## Support-Kontakt
Falls das Problem weiterhin besteht:
1. **Vercel Support**: https://vercel.com/help
2. **Domain-Provider Support** kontaktieren
3. **DNS-Einstellungen Screenshots** bereithalten

Die Website sollte nach korrekter DNS-Konfiguration und SSL-Zertifikat-Generierung normal funktionieren.
