const { google } = require('googleapis')
const express = require('express')
const router = express.Router()
const { storeTokens, getTokens } = require('./tokenStorage')

// OAuth2 Client Configuration
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

// Scopes for Google Calendar and User Info
const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar.events'
]

/**
 * Step 1: Generate Google OAuth URL
 * Frontend redirects user to this URL
 */
router.get('/auth/google', (req, res) => {
  try {
    const oauth2Client = getOAuth2Client()
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: SCOPES,
      prompt: 'consent' // Force consent screen to get refresh token
    })
    
    res.json({ authUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    res.status(500).json({ error: 'Failed to generate auth URL' })
  }
})

/**
 * Step 2: OAuth Callback Handler
 * Google redirects here after user grants permission
 */
router.get('/auth/callback/google', async (req, res) => {
  const { code } = req.query
  
  if (!code) {
    return res.status(400).send('Missing authorization code')
  }
  
  try {
    const oauth2Client = getOAuth2Client()
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()
    
    // Store tokens securely (with user ID)
    await storeTokens(userInfo.id, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    })
    
    // Redirect to frontend with user info
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    res.redirect(
      `${clientUrl}/auth-success?userId=${userInfo.id}&email=${encodeURIComponent(userInfo.email)}&name=${encodeURIComponent(userInfo.name)}`
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    res.redirect(`${clientUrl}/auth-error?message=${encodeURIComponent(error.message)}`)
  }
})

/**
 * Get authenticated user's calendar events
 */
router.get('/api/calendar/events', async (req, res) => {
  const { userId } = req.query
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' })
  }
  
  try {
    const tokenData = await getTokens(userId)
    
    if (!tokenData) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date
    })
    
    // Handle token refresh automatically
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        // Store new refresh token
        await storeTokens(userId, {
          ...tokenData,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date
        })
      }
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Fetch upcoming events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    res.json({
      events: response.data.items || [],
      userInfo: {
        email: tokenData.email,
        name: tokenData.name,
        picture: tokenData.picture
      }
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    res.status(500).json({ error: 'Failed to fetch calendar events' })
  }
})

/**
 * Create a calendar event for a meeting
 */
router.post('/api/calendar/events', async (req, res) => {
  const { userId, summary, description, startTime, endTime, attendees } = req.body
  
  if (!userId || !summary || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  try {
    const tokenData = await getTokens(userId)
    
    if (!tokenData) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      },
      attendees: attendees?.map(email => ({ email })) || [],
      conferenceData: {
        createRequest: {
          requestId: `elexico-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    }
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1
    })
    
    res.json({ event: response.data })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    res.status(500).json({ error: 'Failed to create calendar event' })
  }
})

/**
 * Check if user is authenticated
 */
router.get('/api/auth/status', async (req, res) => {
  const { userId } = req.query
  
  if (!userId) {
    return res.json({ authenticated: false })
  }
  
  try {
    const tokenData = await getTokens(userId)
    
    if (!tokenData) {
      return res.json({ authenticated: false })
    }
    
    res.json({
      authenticated: true,
      userInfo: {
        email: tokenData.email,
        name: tokenData.name,
        picture: tokenData.picture
      }
    })
  } catch (error) {
    console.error('Error checking auth status:', error)
    res.json({ authenticated: false })
  }
})

/**
 * Logout - Clear stored tokens
 */
router.post('/api/auth/logout', async (req, res) => {
  const { userId } = req.body
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' })
  }
  
  try {
    const { deleteTokens } = require('./tokenStorage')
    await deleteTokens(userId)
    res.json({ success: true })
  } catch (error) {
    console.error('Error logging out:', error)
    res.status(500).json({ error: 'Failed to logout' })
  }
})

module.exports = router
