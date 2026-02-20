#!/bin/bash

# Google Identity Services - Quick Setup Script
# This script helps you set up Google Sign-In for Elexico AI

echo "================================================"
echo "   Elexico AI - Google Sign-In Setup"
echo "   Production-Ready Authentication"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -d "elexico-ai" ]; then
    echo "❌ Error: Please run this script from the root directory"
    exit 1
fi

cd elexico-ai

echo "📦 Step 1: Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi
echo "✅ Server dependencies installed"
echo ""

echo "⚙️  Step 2: Setting up server environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created server/.env file"
    echo ""
else
    echo "ℹ️  server/.env already exists"
    echo ""
fi

echo "📦 Step 3: Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi
echo "✅ Client dependencies installed"
echo ""

echo "⚙️  Step 4: Setting up client environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created client/.env file"
    echo ""
else
    echo "ℹ️  client/.env already exists"
    echo ""
fi

cd ..

echo "================================================"
echo "✅ Installation Complete!"
echo "================================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up Google Cloud Console (5 minutes):"
echo "   a. Go to: https://console.cloud.google.com"
echo "   b. Create a project"
echo "   c. Configure OAuth consent screen"
echo "   d. Create OAuth 2.0 Web Client ID"
echo "   e. Copy your Client ID"
echo ""
echo "2. Configure the Client ID:"
echo "   • Edit server/.env:"
echo "     GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com"
echo ""
echo "   • Edit client/.env:"
echo "     VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com"
echo ""
echo "3. Start the servers:"
echo "   • Terminal 1 (Server):"
echo "     cd server && npm start"
echo ""
echo "   • Terminal 2 (Client):"
echo "     cd client && npm run dev"
echo ""
echo "4. Open http://localhost:3001 in your browser"
echo ""
echo "📖 For detailed instructions, see:"
echo "   elexico-ai/GOOGLE_SIGN_IN_SETUP.md"
echo ""
echo "🔒 Security Features:"
echo "   ✅ JWT token verification"
echo "   ✅ CSRF protection (built-in)"
echo "   ✅ Secure session management"
echo "   ✅ Email verification enforced"
echo "   ✅ Production-ready code"
echo ""
echo "================================================"
