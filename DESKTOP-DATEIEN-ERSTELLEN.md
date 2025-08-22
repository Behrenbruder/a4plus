# Desktop-Dateien für Leadverwaltung erstellen

## Problem
Die `Leadverwaltung-Starter.bat` wurde im Website-Ordner erstellt, aber Sie haben den `desktop-app` Ordner bereits auf den Desktop verschoben.

## Lösung: Dateien manuell auf Desktop erstellen

### Schritt 1: Leadverwaltung-Starter.bat auf Desktop erstellen

1. **Rechtsklick auf Desktop** → "Neu" → "Textdokument"
2. **Datei umbenennen** von "Neues Textdokument.txt" zu "Leadverwaltung-Starter.bat"
3. **Warnung bestätigen** über Dateierweiterung ändern
4. **Rechtsklick auf die .bat Datei** → "Bearbeiten"
5. **Folgenden Code einfügen**:

```batch
@echo off
title Leadverwaltung - Arteplus
echo.
echo ========================================
echo    Leadverwaltung wird gestartet...
echo ========================================
echo.

REM Wechsle zum Desktop-App Ordner
cd /d "%USERPROFILE%\Desktop\desktop-app"

REM Prüfe ob Node.js installiert ist
node --version >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Node.js ist nicht installiert!
    echo Bitte installieren Sie Node.js von https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Prüfe ob Dependencies installiert sind
if not exist "node_modules" (
    echo Dependencies werden installiert...
    echo Bitte warten...
    npm install
    if errorlevel 1 (
        echo FEHLER beim Installieren der Dependencies!
        pause
        exit /b 1
    )
)

REM Starte die Anwendung
echo Leadverwaltung wird gestartet...
npm start

REM Falls die Anwendung beendet wird
echo.
echo Leadverwaltung wurde beendet.
pause
```

6. **Datei speichern** (Strg+S) und schließen

### Schritt 2: Desktop-Verknüpfung erstellen

**Methode A: Einfach**
1. **Rechtsklick** auf `Leadverwaltung-Starter.bat`
2. **"Verknüpfung erstellen"** wählen
3. **Verknüpfung umbenennen** zu "Leadverwaltung"

**Methode B: Manuell**
1. **Rechtsklick auf Desktop** → "Neu" → "Verknüpfung"
2. **Pfad eingeben**: `%USERPROFILE%\Desktop\Leadverwaltung-Starter.bat`
3. **Name eingeben**: "Leadverwaltung"
4. **"Fertig stellen"** klicken

### Schritt 3: Testen
1. **Doppelklick** auf "Leadverwaltung" Verknüpfung
2. **Warten** bis Dependencies installiert sind (nur beim ersten Mal)
3. **Anwendung** sollte sich öffnen

## Alternative: PowerShell-Methode (schneller)

1. **PowerShell öffnen** (Windows-Taste + X → "Windows PowerShell")
2. **Folgenden Befehl ausführen**:

```powershell
# Erstelle die Starter-Datei
$batContent = @'
@echo off
title Leadverwaltung - Arteplus
echo.
echo ========================================
echo    Leadverwaltung wird gestartet...
echo ========================================
echo.

cd /d "%USERPROFILE%\Desktop\desktop-app"

node --version >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Node.js ist nicht installiert!
    echo Bitte installieren Sie Node.js von https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Dependencies werden installiert...
    echo Bitte warten...
    npm install
    if errorlevel 1 (
        echo FEHLER beim Installieren der Dependencies!
        pause
        exit /b 1
    )
)

echo Leadverwaltung wird gestartet...
npm start

echo.
echo Leadverwaltung wurde beendet.
pause
'@

# Schreibe die Datei auf Desktop
$batContent | Out-File -FilePath "$env:USERPROFILE\Desktop\Leadverwaltung-Starter.bat" -Encoding ASCII

# Erstelle Desktop-Verknüpfung
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Leadverwaltung.lnk")
$Shortcut.TargetPath = "$env:USERPROFILE\Desktop\Leadverwaltung-Starter.bat"
$Shortcut.WorkingDirectory = "$env:USERPROFILE\Desktop\desktop-app"
$Shortcut.Description = "Arteplus Leadverwaltung - CRM Desktop App"
$Shortcut.Save()

Write-Host "Leadverwaltung wurde erfolgreich auf dem Desktop eingerichtet!" -ForegroundColor Green
```

## Überprüfung

Nach der Erstellung sollten Sie auf dem Desktop haben:
- ✅ `desktop-app` Ordner (bereits vorhanden)
- ✅ `Leadverwaltung-Starter.bat` Datei
- ✅ `Leadverwaltung` Verknüpfung (mit Pfeil-Symbol)

## Bei Problemen

### Datei wird nicht als .bat erkannt
1. **Datei-Explorer öffnen**
2. **"Ansicht"** → **"Dateinamenerweiterungen"** aktivieren
3. **Datei umbenennen** und sicherstellen, dass sie auf `.bat` endet

### Node.js fehlt
1. **Node.js herunterladen**: https://nodejs.org
2. **Installieren** (Standard-Einstellungen)
3. **Computer neu starten**
4. **Leadverwaltung erneut starten**

Die Leadverwaltung ist dann bereit für den Einsatz!
