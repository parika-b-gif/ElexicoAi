╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  🔐 GOOGLE SIGN-IN SETUP - GET YOUR CLIENT ID                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

⚠️  YOUR APP IS RUNNING BUT GOOGLE SIGN-IN IS NOT CONFIGURED!

You're seeing a yellow warning box because you need to get a 
Google Client ID. This takes about 5 minutes.

┌───────────────────────────────────────────────────────────────┐
│ OPTION 1: Quick Setup (Recommended)                          │
└───────────────────────────────────────────────────────────────┘

Follow these simple steps:

1️⃣  Open Google Cloud Console
   🔗 https://console.cloud.google.com/apis/credentials

2️⃣  Create OAuth Credentials
   • Click "Create Credentials" → "OAuth client ID"
   • Application type: Web application
   • Name: Elexico AI
   • Authorized JavaScript origins:
     ✓ http://localhost:3001
     ✓ http://localhost:5000
   • Click "Create"

3️⃣  Copy Your Client ID
   It looks like: 123456789-abcdefg.apps.googleusercontent.com

4️⃣  Update Configuration Files

   📝 Edit: elexico-ai/client/.env
   
   Change this line:
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   
   To (paste your real Client ID):
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

   📝 Edit: elexico-ai/server/.env
   
   Change this line:
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   
   To (paste your real Client ID):
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

5️⃣  Restart Your Servers
   
   Stop both (press Ctrl+C) then restart:
   
   Terminal 1: cd elexico-ai/server && npm start
   Terminal 2: cd elexico-ai/client && npm run dev

6️⃣  Refresh Your Browser
   The yellow warning should be gone and you'll see "Sign in with Google"!

┌───────────────────────────────────────────────────────────────┐
│ First Time? Need OAuth Consent Screen Setup?                 │
└───────────────────────────────────────────────────────────────┘

If you get an error about "OAuth consent screen", you need to 
configure it first:

1. Go to: APIs & Services → OAuth consent screen
2. Select "External" user type → Create
3. Fill in:
   • App name: Elexico AI
   • User support email: your-email@gmail.com
   • Developer contact: your-email@gmail.com
4. Click "Save and Continue" through all steps
5. Add yourself as a test user
6. Then go back and create the OAuth client ID (steps above)

┌───────────────────────────────────────────────────────────────┐
│ 🆘 Troubleshooting                                            │
└───────────────────────────────────────────────────────────────┘

❌ "The given client ID is not found"
   → You're using the placeholder. Replace it with your real ID.

❌ "origin not allowed"  
   → Make sure you added http://localhost:3001 to Authorized 
     JavaScript origins in Google Cloud Console.

❌ Still see yellow warning after updating
   → Did you restart BOTH servers? Vite needs restart to pick up
     new environment variables.

❌ Button doesn't appear
   → Check browser console for errors
   → Verify both .env files have the same Client ID

┌───────────────────────────────────────────────────────────────┐
│ 📖 More Help                                                  │
└───────────────────────────────────────────────────────────────┘

For detailed instructions with screenshots:
📄 See: elexico-ai/GOOGLE_SIGN_IN_SETUP.md

For production deployment:
📄 See: elexico-ai/GOOGLE_SIGN_IN_SETUP.md (Production section)

═══════════════════════════════════════════════════════════════

✅ Once configured, you'll be able to:
   • Sign in with one click
   • See your profile picture
   • Join video meetings as an authenticated user
   • Future: Schedule meetings, access history

═══════════════════════════════════════════════════════════════
