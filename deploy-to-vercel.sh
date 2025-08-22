#!/bin/bash

# Vercel Deployment Script für a4plus.eu
# Dieses Script automatisiert den Deployment-Prozess

echo "🚀 Starting Vercel Deployment for a4plus.eu..."

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgabe
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Überprüfen ob Vercel CLI installiert ist
print_status "Checking if Vercel CLI is installed..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    if [ $? -eq 0 ]; then
        print_success "Vercel CLI installed successfully"
    else
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
else
    print_success "Vercel CLI is already installed"
fi

# 2. Überprüfen ob User eingeloggt ist
print_status "Checking Vercel authentication..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    print_warning "Not logged in to Vercel. Please login..."
    vercel login
fi

# 3. Dependencies installieren und Prisma generieren
print_status "Installing dependencies and generating Prisma client..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

npx prisma generate
if [ $? -eq 0 ]; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# 4. Build lokal testen
print_status "Testing local build..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Local build successful"
else
    print_error "Local build failed"
    exit 1
fi

# 5. Environment Variables überprüfen
print_status "Checking environment variables..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Make sure to set environment variables in Vercel Dashboard"
    echo "Required variables:"
    echo "- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
fi

# 6. Deployment-Typ auswählen
echo ""
echo "Select deployment type:"
echo "1) Preview deployment (vercel)"
echo "2) Production deployment (vercel --prod)"
echo "3) Development server (vercel dev)"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_status "Starting preview deployment..."
        vercel
        if [ $? -eq 0 ]; then
            print_success "Preview deployment completed!"
        else
            print_error "Preview deployment failed"
            exit 1
        fi
        ;;
    2)
        print_status "Starting production deployment..."
        vercel --prod
        if [ $? -eq 0 ]; then
            print_success "Production deployment completed!"
            print_status "Your APIs are now available at:"
            echo "- https://a4plus.eu/api/dwd-gti"
            echo "- https://a4plus.eu/api/pvgis"
            echo "- https://a4plus.eu/api/customers"
            echo "- https://a4plus.eu/api/installers"
            echo "- https://a4plus.eu/api/emails"
        else
            print_error "Production deployment failed"
            exit 1
        fi
        ;;
    3)
        print_status "Starting development server..."
        print_warning "This will start a local development server with Vercel's environment"
        vercel dev
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# 7. API Tests anbieten
if [ "$choice" = "1" ] || [ "$choice" = "2" ]; then
    echo ""
    read -p "Do you want to test the APIs? (y/n): " test_apis
    
    if [ "$test_apis" = "y" ] || [ "$test_apis" = "Y" ]; then
        print_status "Testing APIs..."
        
        # Domain ermitteln
        if [ "$choice" = "2" ]; then
            DOMAIN="https://a4plus.eu"
        else
            # Für Preview Deployment müsste die URL aus der Vercel Ausgabe extrahiert werden
            read -p "Enter the preview URL (from Vercel output): " DOMAIN
        fi
        
        # DWD-GTI API testen
        print_status "Testing DWD-GTI API..."
        curl -X POST "$DOMAIN/api/dwd-gti" \
            -H "Content-Type: application/json" \
            -d '{
                "lat": 51.1657,
                "lon": 10.4515,
                "faces": [{"tiltDeg": 35, "azimuthDeg": 0}],
                "pr": 0.88
            }' \
            -w "\nHTTP Status: %{http_code}\n" \
            -s
        
        echo ""
        print_status "Testing PVGIS API..."
        curl -X POST "$DOMAIN/api/pvgis" \
            -H "Content-Type: application/json" \
            -d '{
                "lat": 51.1657,
                "lon": 10.4515,
                "faces": [{"tiltDeg": 35, "azimuthDeg": 0}]
            }' \
            -w "\nHTTP Status: %{http_code}\n" \
            -s
    fi
fi

echo ""
print_success "Deployment process completed!"
print_status "Check your Vercel dashboard for more details: https://vercel.com/dashboard"
