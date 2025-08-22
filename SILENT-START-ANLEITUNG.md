# Leadverwaltung ohne CMD-Fenster starten

## Problem
Die aktuelle `Leadverwaltung-Starter.bat` öffnet immer ein sichtbares CMD-Fenster, was störend sein kann.

## Lösungen

### Lösung 1: VBS-Script (Empfohlen - Komplett unsichtbar)

**Schritt 1: Dateien auf Desktop kopieren**
1. Kopieren Sie diese Dateien aus dem Website-Ordner auf Ihren Desktop:
   - `Leadverwaltung-Silent-Starter.vbs`
   - `Leadverwaltung-Starter.bat` (falls noch nicht vorhanden)

**Schritt 2: Desktop-Verknüpfung erstellen**
1. **Rechtsklick auf Desktop** → "Neu" → "Verknüpfung"
2. **Pfad eingeben**: `%USERPROFILE%\Desktop\Leadverwaltung-Silent-Starter.vbs`
3. **Name eingeben**: "Leadverwaltung (Silent)"
4. **"Fertig stellen"** klicken

**Schritt 3: Icon anpassen (Optional)**
1. **Rechtsklick** auf die Verknüpfung → "Eigenschaften"
2. **"Anderes Symbol..."** klicken
3. **Pfad eingeben**: `%SystemRoot%\System32\shell32.dll`
4. **Gewünschtes Icon auswählen** (z.B. Computer, Ordner, etc.)
5. **"OK"** klicken

### Lösung 2: Minimierte Batch-Datei

**Alternative Batch-Datei verwenden:**
- Verwenden Sie `Leadverwaltung-Starter-Silent.bat` statt der normalen Batch-Datei
- Diese startet minimiert und ist weniger störend

**Desktop-Verknüpfung erstellen:**
1. **Rechtsklick auf Desktop** → "Neu" → "Verknüpfung"
2. **Pfad eingeben**: `%USERPROFILE%\Desktop\Leadverwaltung-Starter-Silent.bat`
3. **Name eingeben**: "Leadverwaltung (Minimiert)"
4. **"Fertig stellen"** klicken

### Lösung 3: PowerShell-Automatisierung

**Alles automatisch einrichten:**

1. **PowerShell als Administrator öffnen** (Windows-Taste + X → "Windows PowerShell (Administrator)")
2. **Folgenden Code ausführen**:

```powershell
# Pfade definieren
$desktopPath = [Environment]::GetFolderPath("Desktop")
$websitePath = "C:\Users\Samuel\Desktop\Arteplus\Webseite\firma-website"

# VBS-Script auf Desktop kopieren
Copy-Item "$websitePath\Leadverwaltung-Silent-Starter.vbs" "$desktopPath\" -Force

# Batch-Datei auf Desktop kopieren (falls nicht vorhanden)
if (-not (Test-Path "$desktopPath\Leadverwaltung-Starter.bat")) {
    Copy-Item "$websitePath\Leadverwaltung-Starter-Silent.bat" "$desktopPath\Leadverwaltung-Starter.bat" -Force
}

# Desktop-Verknüpfung erstellen
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$desktopPath\Leadverwaltung.lnk")
$Shortcut.TargetPath = "$desktopPath\Leadverwaltung-Silent-Starter.vbs"
$Shortcut.WorkingDirectory = "$desktopPath\desktop-app"
$Shortcut.Description = "Arteplus Leadverwaltung - Startet ohne CMD-Fenster"
$Shortcut.IconLocation = "%SystemRoot%\System32\shell32.dll,1"
$Shortcut.Save()

Write-Host "✅ Leadverwaltung wurde erfolgreich für Silent-Start eingerichtet!" -ForegroundColor Green
Write-Host "📁 Dateien auf Desktop:" -ForegroundColor Yellow
Write-Host "   - Leadverwaltung-Silent-Starter.vbs" -ForegroundColor White
Write-Host "   - Leadverwaltung-Starter.bat" -ForegroundColor White
Write-Host "   - Leadverwaltung.lnk (Verknüpfung)" -ForegroundColor White
Write-Host "🚀 Doppelklick auf 'Leadverwaltung' zum Starten!" -ForegroundColor Green
```

## Wie es funktioniert

### VBS-Script Methode
- Das VBS-Script führt die Batch-Datei mit Parameter `0` aus
- Parameter `0` bedeutet "verstecktes Fenster"
- Kein CMD-Fenster wird angezeigt
- Die Anwendung startet trotzdem normal

### Minimierte Batch-Datei
- Verwendet `start "" /min` um sich selbst minimiert zu starten
- CMD-Fenster ist vorhanden, aber minimiert in der Taskleiste
- Weniger störend als normales Fenster

## Testen

1. **Doppelklick** auf die neue Verknüpfung
2. **Warten** (beim ersten Start werden Dependencies installiert)
3. **Leadverwaltung** sollte sich öffnen ohne sichtbares CMD-Fenster

## Bei Problemen

### VBS-Script wird blockiert
1. **Rechtsklick** auf VBS-Datei → "Eigenschaften"
2. **"Entsperren"** anklicken (falls vorhanden)
3. **"OK"** klicken

### Anwendung startet nicht
1. **Prüfen** ob `desktop-app` Ordner auf Desktop vorhanden ist
2. **Prüfen** ob Node.js installiert ist: `node --version` in CMD
3. **Manuell testen** mit der normalen Batch-Datei

### Fehler beim ersten Start
- Beim ersten Start werden Dependencies installiert
- Das kann 1-2 Minuten dauern
- Danach startet die Anwendung schneller

## Vorteile der Silent-Start Lösung

✅ **Kein störendes CMD-Fenster**
✅ **Sauberer Desktop**
✅ **Professioneller Eindruck**
✅ **Gleiche Funktionalität**
✅ **Einfach zu verwenden**

Die Leadverwaltung startet jetzt diskret im Hintergrund und öffnet nur das eigentliche Anwendungsfenster!
