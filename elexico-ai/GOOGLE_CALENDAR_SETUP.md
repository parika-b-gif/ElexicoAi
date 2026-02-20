# Google Calendar Integration Setup Guide

Complete implementation guide for integrating Google Calendar OAuth authentication with Elexico AI.

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Google Cloud Console Setup](#google-cloud-console-setup)
- [Server Configuration](#server-configuration)
- [Client Configuration](#client-configuration)
- [Testing the Integration](#testing-the-integration)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Overview

This integration allows Elexico AI users to:
- ✅ Sign in with their Google account
- ✅ View their Google Calendar events
- ✅ Create calendar events for meetings
- ✅ Schedule Elexico AI meetings directly in Google Calendar
- ✅ Check calendar availability before scheduling

## Prerequisites

- Node.js 16+ installed
- Google Account
- Access to Google Cloud Console
- Running Elexico AI server and client

---

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter project name: `Elexico AI` (or your preferred name)
4. Click "Create"

### Step 2: Enable Required APIs

1. In the Google Cloud Console, navigate to **APIs & Services** → **Library**
2. Search and enable the following APIs:
   - **Google Calendar API**
   - **Google+ API** (for user profile info)

### Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (or Internal if using Google Workspace)
3. Click "Create"

**Fill in the required information:**
- **App name:** `Elexico AI`
- **User support email:** Your email
- **Developer contact information:** Your email

4. Click "Save and Continue"

**Add Scopes:**
1. Click "Add or Remove Scopes"
2. Add the following scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar.events`
3. Click "Update" → "Save and Continue"

**Test users (if using External):**
1. Add your email and any test users
2. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure:

   **Application type:** Web application

   **Name:** `Elexico AI Web Client`

   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:3001
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3001/auth/callback/google
   ```

4. Click "Create"

5. **IMPORTANT:** Copy the **Client ID** and **Client Secret** - you'll need these next!

---

## Server Configuration

### Step 1: Install Dependencies

```bash
cd elexico-ai/server
npm install
```

New packages added:
- `googleapis` - Google APIs client
- `express-session` - Session management

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Google credentials:
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Google OAuth Credentials (from Step 4 above)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback/google

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Step 3: Start the Server

```bash
npm run dev
```

The server should now be running on `http://localhost:3001` with Google OAuth routes available.

---

## Client Configuration

### Step 1: Install Dependencies

```bash
cd elexico-ai/client
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env`:
```env
VITE_API_URL=http://localhost:3001
```

### Step 3: Start the Client

```bash
npm run dev
```

The client should now be running on `http://localhost:5173`

---

## Testing the Integration

### 1. Test Google Authentication

1. Open your browser and navigate to `http://localhost:5173`
2. You should see a **"Connect Google Calendar"** button in the top right
3. Click the button
4. You'll be redirected to Google's login page
5. Sign in with your Google account
6. Review and accept the requested permissions
7. You'll be redirected back to Elexico AI

### 2. Test Calendar Access

1. After authentication, you should see your profile picture and name
2. Click **"View Calendar"** button
3. Your upcoming calendar events should be displayed

### 3. Test API Endpoints

You can test the API endpoints directly:

```bash
# Get auth URL
curl http://localhost:3001/auth/google

# Check auth status (replace USER_ID)
curl http://localhost:3001/api/auth/status?userId=USER_ID

# Get calendar events (replace USER_ID)
curl http://localhost:3001/api/calendar/events?userId=USER_ID
```

---

## Available API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Get Google OAuth URL |
| GET | `/auth/callback/google` | OAuth callback handler |
| GET | `/api/auth/status` | Check authentication status |
| POST | `/api/auth/logout` | Logout and clear tokens |

### Calendar Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/events` | Fetch user's calendar events |
| POST | `/api/calendar/events` | Create a new calendar event |

---

## Troubleshooting

### Common Issues

#### 1. "Redirect URI mismatch" error

**Problem:** Google shows an error about redirect URI mismatch

**Solution:** 
- Ensure your `GOOGLE_REDIRECT_URI` in `.env` matches exactly what's in Google Console
- Make sure the URI is added to "Authorized redirect URIs" in Google Console
- Common mistake: `http://localhost:3001/auth/callback/google` vs `http://localhost:3001/callback/google`

#### 2. "Access blocked" error

**Problem:** Google shows "This app isn't verified"

**Solution:**
- This is normal for development
- Click "Advanced" → "Go to Elexico AI (unsafe)"
- For production, submit for Google verification

#### 3. Cannot fetch calendar events

**Problem:** Events don't load after authentication

**Solution:**
- Check browser console for errors
- Verify `localStorage.getItem('googleUserId')` exists
- Check server logs for API errors
- Ensure Calendar API is enabled in Google Console

#### 4. Refresh token not received

**Problem:** User needs to re-authenticate frequently

**Solution:**
- Ensure `access_type: 'offline'` in OAuth URL generation
- Use `prompt: 'consent'` to force consent screen
- Check if refresh token is being stored in `tokenStorage.js`

---

## Production Deployment

### 1. Update Google Cloud Console

Add your production URLs to Google Console:

**Authorized JavaScript origins:**
```
https://elexico.ai
https://www.elexico.ai
```

**Authorized redirect URIs:**
```
https://api.elexico.ai/auth/callback/google
```

### 2. Update Environment Variables

**Server `.env`:**
```env
NODE_ENV=production
CLIENT_URL=https://elexico.ai
GOOGLE_REDIRECT_URI=https://api.elexico.ai/auth/callback/google
```

**Client `.env`:**
```env
VITE_API_URL=https://api.elexico.ai
```

### 3. Implement Secure Token Storage

⚠️ **Important:** The current implementation uses in-memory storage, which is **NOT suitable for production**.

Implement one of these solutions:

**Option A: PostgreSQL**
```bash
npm install pg
```
See comments in `tokenStorage.js` for PostgreSQL implementation example.

**Option B: MongoDB**
```bash
npm install mongodb
```

**Option C: Redis**
```bash
npm install redis
```

### 4. Security Best Practices

- ✅ Use HTTPS everywhere
- ✅ Store credentials in environment variables or secret manager (AWS Secrets Manager, etc.)
- ✅ Never commit `.env` files to Git
- ✅ Implement rate limiting
- ✅ Add security headers (helmet.js)
- ✅ Enable CORS only for your domains
- ✅ Rotate credentials regularly
- ✅ Monitor API quotas in Google Console

### 5. Submit for Google Verification

For production apps handling sensitive scopes:

1. Navigate to **OAuth consent screen** in Google Console
2. Click "Prepare for verification"
3. Fill out the verification form
4. Provide:
   - App homepage
   - Privacy policy URL
   - Terms of service URL
   - Demo video
5. Submit for review

---

## Architecture Overview

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       │ 1. Click "Connect Calendar"
       ▼
┌─────────────┐
│   Server    │        2. Generate OAuth URL
│ (Express)   ├───────────────────────────┐
└──────┬──────┘                           │
       │ ◄─────────────────────────────────┘
       │ 3. Redirect to Google
       │
       ▼
┌─────────────┐
│   Google    │
│   OAuth     │  4. User grants permission
└──────┬──────┘
       │
       │ 5. Redirect with code
       ▼
┌─────────────┐
│   Server    │  6. Exchange code for tokens
│             │  7. Store refresh_token
│             │  8. Redirect back to client
└──────┬──────┘
       │
       │ 9. Fetch calendar data
       ▼
┌─────────────┐
│   Client    │  10. Display events
│             │
└─────────────┘
```

---

## File Structure

```
elexico-ai/
├── server/
│   ├── authRoutes.js           # OAuth & Calendar API routes
│   ├── calendarService.js      # Calendar helper functions
│   ├── tokenStorage.js         # Token storage (in-memory)
│   ├── server.js               # Main server file (updated)
│   ├── .env.example            # Environment template
│   └── package.json            # Added googleapis
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── GoogleCalendarAuth.jsx  # Auth component
│   │   └── pages/
│   │       └── Home.jsx        # Updated with auth button
│   ├── .env.example
│   └── package.json
```

---

## Next Steps

After completing this integration, you can:

1. ✅ Add calendar event creation directly from meeting rooms
2. ✅ Implement meeting scheduling UI
3. ✅ Show calendar availability when scheduling meetings
4. ✅ Send calendar invites to meeting participants
5. ✅ Sync meeting recordings with Google Drive
6. ✅ Add reminder notifications via email

---

## Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review server logs for errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly
5. Ensure all APIs are enabled in Google Cloud Console

---

## Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Last Updated:** 2026-02-20

Happy coding! 🚀
