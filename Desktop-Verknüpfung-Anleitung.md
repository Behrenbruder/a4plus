# Desktop-Verknüpfung für Leadverwaltung erstellen

## Automatische Methode (empfohlen)

### Schritt 1: Starter-Datei verwenden
Die Datei `Leadverwaltung-Starter.bat` wurde bereits erstellt. Diese Datei:
- Startet automatisch die Leadverwaltung
- Prüft ob Node.js installiert ist
- Installiert Dependencies falls nötig
- Zeigt hilfreiche Meldungen an

### Schritt 2: Desktop-Verknüpfung erstellen

**Methode A: Rechtsklick-Menü**
1. Rechtsklick auf `Leadverwaltung-Starter.bat`
2. "Verknüpfung erstellen" wählen
3. Verknüpfung auf Desktop verschieben
4. Verknüpfung umbenennen zu "Leadverwaltung"

**Methode B: Manuell**
1. Rechtsklick auf Desktop → "Neu" → "Verknüpfung"
2. Pfad eingeben: `%USERPROFILE%\Desktop\Leadverwaltung-Starter.bat`
3. Name eingeben: "Leadverwaltung"
4. "Fertig stellen" klicken

### Schritt 3: Icon anpassen (optional)
1. Rechtsklick auf Verknüpfung → "Eigenschaften"
2. "Anderes Symbol..." klicken
3. Wählen Sie ein passendes Icon (z.B. Ordner-Symbol oder Haus-Symbol)

## Manuelle Methode (für Fortgeschrittene)

### PowerShell-Verknüpfung erstellen
```powershell
# PowerShell als Administrator öffnen und ausführen:
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Leadverwaltung.lnk")
$Shortcut.TargetPath = "$env:USERPROFILE\Desktop\Leadverwaltung-Starter.bat"
$Shortcut.WorkingDirectory = "$env:USERPROFILE\Desktop\desktop-app"
$Shortcut.Description = "Arteplus Leadverwaltung - CRM Desktop App"
$Shortcut.Save()
```

## Verwendung

### Erste Nutzung
1. Doppelklick auf "Leadverwaltung" Desktop-Icon
2. Warten bis Dependencies installiert sind (nur beim ersten Mal)
3. Anwendung öffnet sich automatisch

### Tägliche Nutzung
1. Doppelklick auf "Leadverwaltung"
2. Anwendung startet sofort (Dependencies bereits installiert)

## Fehlerbehebung

### "Node.js ist nicht installiert"
1. Node.js von https://nodejs.org herunterladen
2. Installieren (Standard-Einstellungen verwenden)
3. Computer neu starten
4. Leadverwaltung erneut starten

### "Fehler beim Installieren der Dependencies"
1. Internet-Verbindung prüfen
2. Als Administrator ausführen:
   - Rechtsklick auf Verknüpfung → "Als Administrator ausführen"

### Anwendung startet nicht
1. Prüfen ob `desktop-app` Ordner auf Desktop existiert
2. Prüfen ob alle Dateien im Ordner vorhanden sind
3. Starter-Datei direkt ausführen für detaillierte Fehlermeldungen

## Für andere Mitarbeiter

### Verteilung der Anwendung
1. **Ordner kopieren**: `desktop-app` Ordner auf jeden PC kopieren
2. **Starter-Datei kopieren**: `Leadverwaltung-Starter.bat` mit kopieren
3. **Verknüpfung erstellen**: Diese Anleitung befolgen
4. **Node.js installieren**: Falls noch nicht vorhanden

### Zentrale Installation (IT-Administrator)
```batch
REM Batch-Skript für automatische Installation auf allen PCs
xcopy "\\server\shared\desktop-app" "%USERPROFILE%\Desktop\desktop-app" /E /I /Y
copy "\\server\shared\Leadverwaltung-Starter.bat" "%USERPROFILE%\Desktop\"
REM Verknüpfung erstellen (PowerShell-Befehl hier einfügen)
```

## Vorteile der Starter-Datei

✅ **Automatische Prüfungen** - Node.js und Dependencies
✅ **Benutzerfreundlich** - Klare Meldungen und Anweisungen  
✅ **Fehlerbehandlung** - Hilfreiche Fehlermeldungen
✅ **Einfache Verteilung** - Eine Datei für alle PCs
✅ **Professionell** - Sieht aus wie eine echte Anwendung

Die Leadverwaltung ist jetzt bereit für den täglichen Einsatz!
