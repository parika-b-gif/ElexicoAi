# Google Identity Services (GSI) Setup Guide

Complete implementation guide for secure "Sign in with Google" authentication using Google Identity Services for Elexico AI.

## 📋 Table of Contents
- [Overview](#overview)
- [Why Google Identity Services?](#why-google-identity-services)
- [Prerequisites](#prerequisites)
- [Google Cloud Console Setup](#google-cloud-console-setup)
- [Server Configuration](#server-configuration)
- [Client Configuration](#client-configuration)
- [Testing the Integration](#testing-the-integration)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Overview

This implementation provides a **modern, secure authentication system** using Google Identity Services (GSI), which is Google's latest authentication solution.

### Features
- ✅ One-click sign-in with Google
- ✅ JWT token verification on backend
- ✅ Secure session management
- ✅ CSRF protection built-in
- ✅ Automatic token expiration handling
- ✅ Production-ready security practices

---

## Why Google Identity Services?

Google Identity Services (GSI) is **superior** to the older OAuth 2.0 flow for several reasons:

| Feature | GSI (Modern) | OAuth 2.0 (Legacy) |
|---------|--------------|---------------------|
| User Experience | One-click button | Multi-step redirect |
| CSRF Protection | Built-in | Manual implementation |
| Token Format | JWT (verifiable) | Opaque tokens |
| Setup Complexity | Simple | Complex |
| Mobile Support | Excellent | Limited |
| Security | Enhanced | Standard |

---

## Prerequisites

- Node.js 16+ installed
- Google Account
- Access to Google Cloud Console
- Running Elexico AI server and client

---

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Elexico AI`
4. Click **"Create"**
5. Wait for the project to be created and select it

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** user type (or "Internal" if using Google Workspace)
3. Click **"Create"**

**Fill in the required information:**

| Field | Value |
|-------|-------|
| App name | `Elexico AI` |
| User support email | Your email address |
| App logo | (Optional) Upload your logo |
| Application home page | `http://localhost:3001` (or your domain) |
| Developer contact information | Your email address |

4. Click **"Save and Continue"**

**Add Scopes:**
1. Click **"Add or Remove Scopes"**
2. Add these **non-sensitive** scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. Click **"Update"**
4. Click **"Save and Continue"**

**Test users (if External):**
1. Click **"Add Users"**
2. Add your email and any test users (up to 100)
3. Click **"Save and Continue"**
4. Review and click **"Back to Dashboard"**

### Step 3: Create OAuth 2.0 Client ID

1. Navigate to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**

**Configure the client:**

| Field | Value |
|-------|-------|
| Application type | **Web application** |
| Name | `Elexico AI Web Client` |

**Authorized JavaScript origins:**
```
http://localhost:3001
http://localhost:5000
```

**Authorized redirect URIs:**
```
(Leave empty - not needed for GSI)
```

3. Click **"Create"**
4. **IMPORTANT:** A dialog will appear with your credentials:
   - Copy the **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
   - You don't need the Client Secret for GSI
   - Click **"OK"**

### Step 4: Copy Your Client ID

Your Client ID will look like:
```
123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

**Keep this safe** - you'll need it for both frontend and backend configuration!

---

## Server Configuration

### Step 1: Navigate to Server Directory

```bash
cd elexico-ai/server
```

### Step 2: Install Dependencies

```bash
npm install
```

New packages installed:
- `google-auth-library` - For JWT token verification

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Google Client ID:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3001

# Google Identity Services Client ID
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com

# Optional: Redis for distributed sessions
REDIS_URL=redis://localhost:6379
```

**Replace** `YOUR_CLIENT_ID_HERE` with the Client ID you copied from Google Cloud Console.

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
🏷️  Instance: srv-main

🔴 REDIS │ ⚠️  Connection failed (optional - using in-memory mode)

🌐 SERVER │ ✅ Server running on: http://localhost:5000

🏓 SOCKET.IO │ ✅ WebSocket ready
```

---

## Client Configuration

### Step 1: Navigate to Client Directory

```bash
cd elexico-ai/client
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your configuration:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Use the SAME Client ID** from Google Cloud Console.

### Step 4: Start the Client

```bash
npm run dev
```

You should see:
```
  VITE v5.4.21  ready in 148 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: http://172.18.19.187:3001/
```

---

## Testing the Integration

### 1. Open the Application

Open your browser and navigate to: `http://localhost:3001`

### 2. Sign In with Google

1. You should see a **"Sign in with Google"** button in the top right corner
2. Click the button
3. A Google sign-in popup will appear
4. Select your Google account
5. Review and grant permissions
6. **You're signed in!** You should see your profile picture and name

### 3. Test Session Persistence

1. Refresh the page
2. You should remain signed in (session is stored)
3. Close and reopen the browser
4. You should still be signed in

### 4. Test Sign Out

1. Click the logout icon (arrow icon) next to your name
2. You should be signed out
3. The "Sign in with Google" button should reappear

### 5. Test API Endpoints

Open a new terminal and test the endpoints:

```bash
# Sign in first through the UI, then get your session token from localStorage
# In browser console: localStorage.getItem('sessionToken')

# Verify session
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
     http://localhost:5000/auth/verify

# Get current user info
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
     http://localhost:5000/auth/me

# Logout
curl -X POST \
     -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
     http://localhost:5000/auth/logout
```

---

## Security Features

This implementation includes **production-grade security**:

### 1. JWT Token Verification ✅
- Backend verifies token signature with Google's public keys
- Validates audience (client ID) to prevent token substitution
- Checks token expiration automatically

### 2. CSRF Protection ✅
- Google GSI has built-in CSRF tokens
- No additional CSRF implementation needed

### 3. Secure Session Management ✅
- Sessions stored server-side (not exposed to client)
- Session tokens are cryptographically random (32 bytes)
- Automatic session cleanup after 24 hours of inactivity

### 4. Email Verification ✅
- Only accepts verified Google accounts
- Blocks unverified email addresses

### 5. Secure Headers ✅
- CORS configured to allow only specific origins
- Content-Type validation on all endpoints

### 6. Error Handling ✅
- Expired tokens return proper 401 status
- Invalid tokens are rejected immediately
- Detailed error messages in development, generic in production

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/google` | Sign in with Google JWT | No |
| GET | `/auth/verify` | Verify session token | Yes |
| GET | `/auth/me` | Get current user info | Yes |
| POST | `/auth/logout` | Sign out and invalidate session | Yes |

### POST /auth/google

Sign in with Google credential.

**Request:**
```json
{
  "credential": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "a1b2c3...",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://...",
    "givenName": "John",
    "familyName": "Doe"
  }
}
```

### GET /auth/verify

Verify if session token is valid.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://..."
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Google Sign-In configuration error"

**Problem:** Frontend can't initialize Google Sign-In

**Solutions:**
- ✅ Check that `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- ✅ Restart Vite dev server after adding environment variables
- ✅ Verify Client ID format (should end with `.apps.googleusercontent.com`)
- ✅ Check browser console for specific errors

#### 2. "Invalid token" error

**Problem:** Backend rejects the Google JWT

**Solutions:**
- ✅ Ensure `GOOGLE_CLIENT_ID` in server `.env` matches the one in Google Console
- ✅ Verify the Client ID is the same in both frontend and backend
- ✅ Check that OAuth Consent Screen is properly configured
- ✅ Make sure your Google account is added as a test user (if in testing mode)

#### 3. "Origin not allowed"

**Problem:** Google shows "unauthorized_client" or origin error

**Solutions:**
- ✅ Add `http://localhost:3001` to Authorized JavaScript origins in Google Console
- ✅ Wait 5-10 minutes for Google's changes to propagate
- ✅ Clear browser cache and cookies
- ✅ Try in an incognito window

#### 4. "This app isn't verified"

**Problem:** Google shows warning about unverified app

**Solution:**
- ✅ This is normal for development
- ✅ Click "Advanced" → "Go to Elexico AI (unsafe)"
- ✅ For production, submit app for verification (see Production section)

#### 5. Button doesn't appear

**Problem:** Sign-in button is missing

**Solutions:**
- ✅ Check browser console for JavaScript errors
- ✅ Ensure Google script loads: `https://accounts.google.com/gsi/client`
- ✅ Verify `<div id="googleSignInButton"></div>` exists in DOM
- ✅ Check Network tab to confirm script loaded successfully

#### 6. "CORS error"

**Problem:** Browser blocks API requests

**Solutions:**
- ✅ Verify `CLIENT_URL` in server `.env` matches frontend URL
- ✅ Check CORS configuration in `server.js`
- ✅ Ensure server is running on port 5000
- ✅ Clear browser cache

---

## Production Deployment

### 1. Update Google Cloud Console

Add your production URLs:

**Authorized JavaScript origins:**
```
https://elexico.ai
https://www.elexico.ai
```

*Remove* localhost URLs or create a separate production Client ID.

### 2. Update Environment Variables

**Server `.env`:**
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://elexico.ai
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
```

**Client `.env`:**
```env
VITE_API_URL=https://api.elexico.ai
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
```

### 3. Implement Persistent Session Storage

⚠️ **Critical:** The current implementation uses **in-memory sessions**, which will be lost on server restart.

**Production options:**

#### Option A: Redis (Recommended)
```bash
npm install redis
```

```javascript
// In googleAuth.js, replace Map with Redis
const redis = require('redis')
const client = redis.createClient({ url: process.env.REDIS_URL })

// Store session
await client.set(`session:${token}`, JSON.stringify(session), {
  EX: 86400 // 24 hours
})

// Get session
const data = await client.get(`session:${token}`)
const session = JSON.parse(data)
```

#### Option B: PostgreSQL
```bash
npm install pg
```

```sql
CREATE TABLE sessions (
  token VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_last_active ON sessions(last_active);
```

#### Option C: MongoDB
```bash
npm install mongodb
```

### 4. Enable HTTPS

```bash
# Use a reverse proxy like nginx or Caddy
# Example nginx configuration:
server {
    listen 443 ssl;
    server_name api.elexico.ai;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Security Hardening

```bash
# Install security packages
npm install helmet express-rate-limit
```

```javascript
// In server.js
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// Add security headers
app.use(helmet())

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts'
})

app.use('/auth/google', authLimiter)
```

### 6. Monitoring and Logging

```javascript
// Add logging
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Log authentication events
logger.info('User signed in', { userId, email, timestamp });
```

### 7. Submit for Google Verification

For production apps:

1. Navigate to **OAuth consent screen** in Google Console
2. Click **"Publish App"** (if still in testing)
3. Click **"Prepare for verification"**
4. Fill out the verification form:
   - App homepage URL
   - Privacy policy URL (required)
   - Terms of service URL
   - Demo video showing the authentication flow
   - Justification for requested scopes
5. Submit for review (takes 3-7 days usually)

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User clicks "Sign in"                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│          Google Identity Services (GSI) Popup               │
│  - User selects Google account                              │
│  - Google verifies user identity                            │
│  - Google generates signed JWT token                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - Receives JWT from Google                                 │
│  - Sends JWT to backend: POST /auth/google                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                        │
│  1. Verify JWT signature with Google's public keys          │
│  2. Validate audience (client ID)                           │
│  3. Check token expiration                                  │
│  4. Extract user info (email, name, picture)                │
│  5. Generate session token                                  │
│  6. Store session server-side                               │
│  7. Return session token to client                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - Store session token in localStorage                      │
│  - Display user profile                                     │
│  - Include session token in subsequent API requests         │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
elexico-ai/
├── server/
│   ├── googleAuth.js           # ✨ GSI authentication logic
│   ├── server.js               # Main server (updated)
│   ├── package.json            # Added google-auth-library
│   ├── .env.example            # Environment template
│   └── .env                    # Your config (not committed)
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── GoogleSignIn.jsx    # ✨ Sign-in button component
│   │   └── pages/
│   │       └── Home.jsx        # Updated with GoogleSignIn
│   ├── .env.example            # Environment template
│   └── .env                    # Your config (not committed)
│
└── GOOGLE_SIGN_IN_SETUP.md     # This file
```

---

## Comparison: OAuth 2.0 vs GSI

| Aspect | OAuth 2.0 (Previous) | GSI (Current) |
|--------|---------------------|---------------|
| **User Flow** | Redirect → consent → callback | One-click popup |
| **Implementation** | ~500 lines of code | ~200 lines of code |
| **Token Type** | Access + Refresh tokens | JWT only |
| **Verification** | API call to Google | Local signature check |
| **Security** | Good | Excellent (built-in CSRF) |
| **Mobile UX** | Poor (redirect issues) | Excellent (native support) |
| **Calendar Access** | ✅ Yes | ❌ No (auth only) |
| **Offline Access** | ✅ Yes (refresh token) | ❌ No |
| **Use Case** | API access needed | Authentication only |

**When to use OAuth 2.0:**
- Need to access Google APIs (Calendar, Drive, etc.)
- Need offline access
- Need to perform actions on behalf of user

**When to use GSI:**
- Only need user authentication
- Want best user experience
- Simpler implementation
- **This is what we're using now!**

---

## Next Steps

After completing authentication:

1. ✅ **Add user database** - Store user preferences, settings
2. ✅ **Implement rooms** - Associate rooms with authenticated users
3. ✅ **Add permissions** - Control who can create/join rooms
4. ✅ **Meeting history** - Track user's past meetings
5. ✅ **Scheduled meetings** - Link with calendar (requires OAuth 2.0)

---

## Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [google-auth-library npm package](https://www.npmjs.com/package/google-auth-library)
- [JWT.io - Test JWT tokens](https://jwt.io/)
- [Google Cloud Console](https://console.cloud.google.com)

---

## Support

If you encounter issues:

1. ✅ Check the [Troubleshooting](#troubleshooting) section
2. ✅ Verify environment variables are set correctly
3. ✅ Ensure Google Cloud Console configuration is complete
4. ✅ Check browser console and server logs
5. ✅ Test in incognito mode to rule out cache issues

---

**Last Updated:** 2026-02-20

**Implementation:** Production-Ready ✅

Happy coding! 🚀
