#!/bin/bash

# Google Calendar Integration - Quick Setup Script
# This script helps you set up the Google Calendar integration for Elexico AI

echo "================================================"
echo "   Elexico AI - Google Calendar Integration"
echo "   Quick Setup Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -d "elexico-ai" ]; then
    echo "❌ Error: Please run this script from the root directory (where elexico-ai folder is located)"
    exit 1
fi

cd elexico-ai

# Step 1: Install Server Dependencies
echo "📦 Step 1: Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi
echo "✅ Server dependencies installed"
echo ""

# Step 2: Setup Server Environment
echo "⚙️  Step 2: Setting up server environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created server/.env file"
    echo "⚠️  IMPORTANT: You need to add your Google OAuth credentials to server/.env"
    echo ""
else
    echo "ℹ️  server/.env already exists (not overwriting)"
    echo ""
fi

# Step 3: Install Client Dependencies
echo "📦 Step 3: Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi
echo "✅ Client dependencies installed"
echo ""

# Step 4: Setup Client Environment
echo "⚙️  Step 4: Setting up client environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created client/.env file"
    echo ""
else
    echo "ℹ️  client/.env already exists (not overwriting)"
    echo ""
fi

cd ..

echo "================================================"
echo "✅ Installation Complete!"
echo "================================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up Google Cloud Console:"
echo "   - Go to: https://console.cloud.google.com"
echo "   - Create a project and enable Calendar API"
echo "   - Create OAuth 2.0 credentials"
echo "   - See GOOGLE_CALENDAR_SETUP.md for detailed instructions"
echo ""
echo "2. Add your Google credentials to server/.env:"
echo "   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com"
echo "   GOOGLE_CLIENT_SECRET=your-client-secret"
echo "   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback/google"
echo ""
echo "3. Start the server:"
echo "   cd server && npm run dev"
echo ""
echo "4. Start the client (in a new terminal):"
echo "   cd client && npm run dev"
echo ""
echo "5. Open http://localhost:5173 in your browser"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   elexico-ai/GOOGLE_CALENDAR_SETUP.md"
echo ""
echo "================================================"
