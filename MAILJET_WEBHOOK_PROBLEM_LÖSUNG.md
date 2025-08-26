# Mailjet Webhook Problem - Lösung

## 🔍 Problem Identifiziert

Die Mailjet-Webhook-Integration funktioniert nicht, weil es ein **Domain-Routing-Problem** gibt:

### Aktuelle Situation:
1. **a4plus.eu** → Leitet mit HTTP 308 zu **www.a4plus.eu** weiter
2. **www.a4plus.eu** → API-Route `/api/emails/mailjet-webhook` existiert nicht (404/405 Fehler)
3. **Mailjet** → Sendet Webhooks wahrscheinlich an die falsche URL

## 🚨 Kritische Erkenntnisse

### Test-Ergebnisse:
```
GET https://a4plus.eu/api/emails/mailjet-webhook
→ Status: 308 (Redirect zu www.a4plus.eu)

GET https://www.a4plus.eu/api/emails/mailjet-webhook  
→ Status: 404 (Route nicht gefunden)

POST https://www.a4plus.eu/api/emails/mailjet-webhook
→ Status: 405 (Method not allowed)
```

### Das bedeutet:
- Die Webhook-Route ist nur auf `a4plus.eu` verfügbar
- Aber `a4plus.eu` leitet alle Requests zu `www.a4plus.eu` weiter
- Bei POST-Redirects gehen oft die Payload-Daten verloren
- Mailjet kann die Webhooks nicht erfolgreich zustellen

## ✅ Lösungsansätze

### Option 1: Mailjet-Konfiguration korrigieren (EMPFOHLEN)
```
Aktuell: https://www.a4plus.eu/api/emails/mailjet-webhook
Korrekt:  https://a4plus.eu/api/emails/mailjet-webhook
```

### Option 2: Domain-Routing korrigieren
- API-Routen sollten auf beiden Domains funktionieren
- Oder: Redirects für API-Routen deaktivieren

### Option 3: Webhook-URL in Vercel konfigurieren
- Sicherstellen, dass die Route auf beiden Domains verfügbar ist

## 🔧 Sofortige Maßnahmen

### 1. Mailjet-Dashboard prüfen
1. Einloggen in Mailjet-Dashboard
2. Zu "Account Settings" → "Event notifications (webhooks)" gehen
3. Aktuelle Webhook-URL prüfen
4. Falls `www.a4plus.eu` → ändern zu `a4plus.eu`

### 2. Webhook-URL testen
```bash
# Korrekte URL testen
curl -X POST https://a4plus.eu/api/emails/mailjet-webhook \
  -H "Content-Type: application/json" \
  -d '[{"event":"email","from_email":"test@example.com","email":"info@a4plus.eu"}]'
```

### 3. DNS/Vercel-Konfiguration prüfen
- Beide Domains sollten die gleichen API-Routen haben
- Oder: API-Routen von Redirects ausschließen

## 📋 Nächste Schritte

### Sofort:
1. ✅ Problem identifiziert
2. 🔄 Mailjet-Webhook-URL korrigieren
3. 🧪 Webhook-Funktionalität testen

### Danach:
1. 📧 Test-E-Mails senden
2. 🔍 CRM-Integration prüfen
3. 📊 Logging verbessern

## 🎯 Erwartetes Ergebnis

Nach der Korrektur sollten:
- ✅ Mailjet-Webhooks erfolgreich ankommen
- ✅ E-Mails automatisch im CRM erscheinen
- ✅ Bidirektionale E-Mail-Synchronisation funktionieren

## 🔍 Debug-Befehle

```bash
# Webhook-Status prüfen
node debug-mailjet-webhook.js

# Direkt testen (ohne www)
curl -X GET https://a4plus.eu/api/emails/mailjet-webhook

# Mit www testen
curl -X GET https://www.a4plus.eu/api/emails/mailjet-webhook
```

## 📞 Support

Falls das Problem weiterhin besteht:
1. Mailjet-Event-Logs prüfen
2. Vercel-Deployment-Logs prüfen  
3. DNS-Konfiguration bei IONOS prüfen
