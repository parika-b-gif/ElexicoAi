const { OAuth2Client } = require('google-auth-library')
const express = require('express')
const router = express.Router()

// Initialize Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// In-memory session storage (replace with Redis/DB in production)
const sessions = new Map()

/**
 * Generate a secure session token
 */
function generateSessionToken() {
  return require('crypto').randomBytes(32).toString('hex')
}

/**
 * Verify Google JWT Token
 * This is the secure way to validate "Sign in with Google"
 */
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Verify it's for our app
    })
    
    const payload = ticket.getPayload()
    
    // Verify the token is from Google's domain
    const domain = payload['hd'] // Hosted domain (if applicable)
    
    return {
      userId: payload['sub'], // Google user ID
      email: payload['email'],
      emailVerified: payload['email_verified'],
      name: payload['name'],
      picture: payload['picture'],
      givenName: payload['given_name'],
      familyName: payload['family_name'],
      locale: payload['locale'],
    }
  } catch (error) {
    console.error('Token verification error:', error.message)
    throw new Error('Invalid token')
  }
}

/**
 * POST /auth/google
 * Endpoint to handle Google Sign-In
 * 
 * Body: { credential: "JWT_TOKEN_FROM_GOOGLE" }
 * Returns: { success, sessionToken, user }
 */
router.post('/auth/google', async (req, res) => {
  const { credential } = req.body
  
  // Validate request
  if (!credential) {
    return res.status(400).json({
      success: false,
      error: 'Missing credential'
    })
  }
  
  try {
    // Verify the Google JWT token
    const user = await verifyGoogleToken(credential)
    
    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email not verified'
      })
    }
    
    // Generate session token
    const sessionToken = generateSessionToken()
    
    // Store session
    sessions.set(sessionToken, {
      user,
      createdAt: new Date(),
      lastActive: new Date(),
    })
    
    console.log(`✅ User signed in: ${user.email} (${user.name})`)
    
    // Return session token and user info
    res.json({
      success: true,
      sessionToken,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        givenName: user.givenName,
        familyName: user.familyName,
      }
    })
    
  } catch (error) {
    console.error('Authentication error:', error.message)
    
    // Handle specific error cases
    if (error.message.includes('Token used too late') || 
        error.message.includes('Token expired')) {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please sign in again.'
      })
    }
    
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    })
  }
})

/**
 * GET /auth/verify
 * Verify if session token is valid
 * 
 * Headers: { Authorization: "Bearer SESSION_TOKEN" }
 * Returns: { valid, user }
 */
router.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      valid: false,
      error: 'Missing authorization header'
    })
  }
  
  const sessionToken = authHeader.substring(7) // Remove "Bearer "
  const session = sessions.get(sessionToken)
  
  if (!session) {
    return res.status(401).json({
      valid: false,
      error: 'Invalid or expired session'
    })
  }
  
  // Update last active time
  session.lastActive = new Date()
  
  res.json({
    valid: true,
    user: {
      id: session.user.userId,
      email: session.user.email,
      name: session.user.name,
      picture: session.user.picture,
    }
  })
})

/**
 * POST /auth/logout
 * Logout and invalidate session
 * 
 * Headers: { Authorization: "Bearer SESSION_TOKEN" }
 * Returns: { success }
 */
router.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({
      success: false,
      error: 'Missing authorization header'
    })
  }
  
  const sessionToken = authHeader.substring(7)
  const deleted = sessions.delete(sessionToken)
  
  if (deleted) {
    console.log('✅ User logged out')
  }
  
  res.json({ success: true })
})

/**
 * Middleware to protect routes
 * Use this on routes that require authentication
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required'
    })
  }
  
  const sessionToken = authHeader.substring(7)
  const session = sessions.get(sessionToken)
  
  if (!session) {
    return res.status(401).json({
      error: 'Invalid or expired session'
    })
  }
  
  // Update last active
  session.lastActive = new Date()
  
  // Attach user to request
  req.user = session.user
  next()
}

/**
 * Example protected route
 * GET /auth/me
 * Returns current user info
 */
router.get('/auth/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      givenName: req.user.givenName,
      familyName: req.user.familyName,
    }
  })
})

// Clean up expired sessions periodically (every hour)
setInterval(() => {
  const now = Date.now()
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours
  
  let cleaned = 0
  sessions.forEach((session, token) => {
    if (now - session.lastActive.getTime() > SESSION_TIMEOUT) {
      sessions.delete(token)
      cleaned++
    }
  })
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired sessions`)
  }
}, 60 * 60 * 1000)

module.exports = { router, requireAuth }
