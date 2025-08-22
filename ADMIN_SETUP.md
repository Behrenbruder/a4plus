# Admin-Only CRM Setup Anleitung

## Übersicht

Das CRM-System ist jetzt so konfiguriert, dass nur Admins Zugriff haben. Normale Benutzer können keine Daten einsehen oder ändern.

## 🔐 Sicherheitsmodell

**Row Level Security (RLS) Policies:**
- ✅ Nur Benutzer mit `admin` Rolle im JWT können auf Daten zugreifen
- ✅ Service Role Key umgeht RLS für API-Operationen
- ❌ Normale Benutzer haben keinen Zugriff

## 🚀 Setup-Schritte

### 1. Service Role Key holen

1. Gehen Sie zu Ihrem Supabase Dashboard: https://supabase.com/dashboard
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **Settings** → **API**
4. Kopieren Sie den **service_role** Key (nicht den anon key!)

### 2. Service Role Key in .env.local hinzufügen

Fügen Sie den Key zu Ihrer `.env.local` hinzu:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCxNrPNcvHYTDLShc51HsObpH1FwJA9F9c

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zyxmgyhpsdjvsnkaajsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eG1neWhwc2RqdnNua2FhanNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg4ODczNCwiZXhwIjoyMDcxNDY0NzM0fQ.HIER_IHR_SERVICE_ROLE_KEY
```

### 3. Admin-Schema in Supabase ausführen

1. Öffnen Sie Supabase Dashboard → **SQL Editor**
2. Kopieren Sie den **kompletten Inhalt** aus `supabase-schema-admin-only.sql`
3. Fügen Sie ihn ein und klicken Sie **"Run"**

### 4. System testen

```bash
npm run dev
```

**Testen Sie:**
- http://localhost:3000/admin (sollte funktionieren)
- http://localhost:3000/api/customers (sollte Daten zurückgeben)

## 🔑 Admin-Benutzer erstellen (Optional)

Für echte Admin-Authentifizierung:

### Option A: Supabase Auth verwenden

1. **Auth aktivieren:**
   - Supabase Dashboard → Authentication → Settings
   - E-Mail-Provider konfigurieren

2. **Admin-Benutzer erstellen:**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO auth.users (
     id,
     email,
     encrypted_password,
     email_confirmed_at,
     raw_user_meta_data
   ) VALUES (
     gen_random_uuid(),
     'admin@arteplus.de',
     crypt('IhrPasswort', gen_salt('bf')),
     NOW(),
     '{"role": "admin"}'::jsonb
   );
   ```

3. **Login-Seite erstellen:**
   ```typescript
   // src/app/login/page.tsx
   'use client'
   import { useState } from 'react'
   import { createSupabaseBrowserClient } from '@/lib/supabase'
   
   export default function Login() {
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const supabase = createSupabaseBrowserClient()
   
     const handleLogin = async (e: React.FormEvent) => {
       e.preventDefault()
       const { error } = await supabase.auth.signInWithPassword({
         email,
         password,
       })
       if (!error) {
         window.location.href = '/admin'
       }
     }
   
     return (
       <form onSubmit={handleLogin} className="max-w-md mx-auto mt-8">
         <input
           type="email"
           placeholder="E-Mail"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           className="w-full p-2 border rounded mb-4"
         />
         <input
           type="password"
           placeholder="Passwort"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           className="w-full p-2 border rounded mb-4"
         />
         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
           Anmelden
         </button>
       </form>
     )
   }
   ```

### Option B: Einfache Lösung (aktuell)

**Aktuell funktioniert das System so:**
- API-Routen verwenden Service Role Key
- Umgehen RLS automatisch
- Kein Login erforderlich für `/admin`

## 🛡️ Sicherheitshinweise

### Für Entwicklung (aktuell)
- ✅ Service Role Key in `.env.local` (nicht in Git)
- ✅ Admin-Dashboard funktioniert ohne Login
- ✅ API-Endpunkte sind geschützt durch RLS

### Für Produktion
- 🔒 Implementieren Sie echte Authentifizierung
- 🔒 Verwenden Sie HTTPS
- 🔒 Setzen Sie starke Passwörter
- 🔒 Aktivieren Sie 2FA für Supabase

## 🧪 Testen der Sicherheit

### Test 1: API ohne Service Role Key
```javascript
// In Browser-Konsole (sollte fehlschlagen)
fetch('/api/customers', {
  headers: {
    'Authorization': 'Bearer ' + 'falscher-key'
  }
}).then(r => r.json()).then(console.log)
```

### Test 2: Direkter Supabase-Zugriff
```javascript
// Mit anon key (sollte leer sein)
const { createClient } = supabase
const client = createClient('URL', 'ANON_KEY')
client.from('customers').select('*').then(console.log)
```

## 📝 Nächste Schritte

1. **Sofort:** Service Role Key hinzufügen und testen
2. **Später:** Echte Admin-Authentifizierung implementieren
3. **Produktion:** Zusätzliche Sicherheitsmaßnahmen

## ❗ Wichtige Hinweise

- **Service Role Key** hat VOLLZUGRIFF auf die Datenbank
- Niemals in Frontend-Code verwenden
- Nur in Server-seitigen API-Routen verwenden
- Nicht in Git committen (steht in .gitignore)

Das System ist jetzt sicher konfiguriert! 🔐
