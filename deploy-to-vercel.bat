@echo off
setlocal enabledelayedexpansion

REM Vercel Deployment Script für a4plus.eu (Windows Version)
REM Dieses Script automatisiert den Deployment-Prozess

echo 🚀 Starting Vercel Deployment for a4plus.eu...
echo.

REM 1. Überprüfen ob Vercel CLI installiert ist
echo [INFO] Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo [SUCCESS] Vercel CLI installed successfully
) else (
    echo [SUCCESS] Vercel CLI is already installed
)

REM 2. Überprüfen ob User eingeloggt ist
echo [INFO] Checking Vercel authentication...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Not logged in to Vercel. Please login...
    vercel login
)

REM 3. Dependencies installieren und Prisma generieren
echo [INFO] Installing dependencies and generating Prisma client...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed

npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [SUCCESS] Prisma client generated

REM 4. Build lokal testen
echo [INFO] Testing local build...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Local build failed
    pause
    exit /b 1
)
echo [SUCCESS] Local build successful

REM 5. Environment Variables überprüfen
echo [INFO] Checking environment variables...
if not exist ".env.local" (
    echo [WARNING] .env.local not found. Make sure to set environment variables in Vercel Dashboard
    echo Required variables:
    echo - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    echo - NEXT_PUBLIC_SUPABASE_URL
    echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo - SUPABASE_SERVICE_ROLE_KEY
    echo - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    echo.
)

REM 6. Deployment-Typ auswählen
echo Select deployment type:
echo 1) Preview deployment (vercel)
echo 2) Production deployment (vercel --prod)
echo 3) Development server (vercel dev)
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo [INFO] Starting preview deployment...
    vercel
    if %errorlevel% neq 0 (
        echo [ERROR] Preview deployment failed
        pause
        exit /b 1
    )
    echo [SUCCESS] Preview deployment completed!
    set deployment_type=preview
) else if "%choice%"=="2" (
    echo [INFO] Starting production deployment...
    vercel --prod
    if %errorlevel% neq 0 (
        echo [ERROR] Production deployment failed
        pause
        exit /b 1
    )
    echo [SUCCESS] Production deployment completed!
    echo [INFO] Your APIs are now available at:
    echo - https://a4plus.eu/api/dwd-gti
    echo - https://a4plus.eu/api/pvgis
    echo - https://a4plus.eu/api/customers
    echo - https://a4plus.eu/api/installers
    echo - https://a4plus.eu/api/emails
    set deployment_type=production
) else if "%choice%"=="3" (
    echo [INFO] Starting development server...
    echo [WARNING] This will start a local development server with Vercel's environment
    vercel dev
    goto :end
) else (
    echo [ERROR] Invalid choice
    pause
    exit /b 1
)

REM 7. API Tests anbieten
echo.
set /p test_apis="Do you want to test the APIs? (y/n): "

if /i "%test_apis%"=="y" (
    echo [INFO] Testing APIs...
    
    if "%deployment_type%"=="production" (
        set DOMAIN=https://a4plus.eu
    ) else (
        set /p DOMAIN="Enter the preview URL (from Vercel output): "
    )
    
    echo [INFO] Testing DWD-GTI API...
    curl -X POST "!DOMAIN!/api/dwd-gti" ^
        -H "Content-Type: application/json" ^
        -d "{\"lat\": 51.1657, \"lon\": 10.4515, \"faces\": [{\"tiltDeg\": 35, \"azimuthDeg\": 0}], \"pr\": 0.88}" ^
        -w "\nHTTP Status: %%{http_code}\n" ^
        -s
    
    echo.
    echo [INFO] Testing PVGIS API...
    curl -X POST "!DOMAIN!/api/pvgis" ^
        -H "Content-Type: application/json" ^
        -d "{\"lat\": 51.1657, \"lon\": 10.4515, \"faces\": [{\"tiltDeg\": 35, \"azimuthDeg\": 0}]}" ^
        -w "\nHTTP Status: %%{http_code}\n" ^
        -s
)

:end
echo.
echo [SUCCESS] Deployment process completed!
echo [INFO] Check your Vercel dashboard for more details: https://vercel.com/dashboard
echo.
pause
