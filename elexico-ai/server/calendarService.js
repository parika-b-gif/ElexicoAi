const { google } = require('googleapis')
const { getTokens } = require('./tokenStorage')

/**
 * Calendar Service Module
 * Provides helper functions for Google Calendar operations
 */

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

/**
 * Get authenticated calendar client for a user
 */
async function getCalendarClient(userId) {
  const tokenData = await getTokens(userId)
  
  if (!tokenData) {
    throw new Error('User not authenticated')
  }
  
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: tokenData.expiry_date
  })
  
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Fetch user's upcoming calendar events
 */
async function fetchUpcomingEvents(userId, maxResults = 10) {
  try {
    const calendar = await getCalendarClient(userId)
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    return response.data.items || []
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

/**
 * Create a calendar event
 */
async function createCalendarEvent(userId, eventData) {
  try {
    const calendar = await getCalendarClient(userId)
    
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: eventData.timeZone || 'UTC'
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: eventData.timeZone || 'UTC'
      },
      attendees: eventData.attendees?.map(email => ({ email })) || [],
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
      resource: event
    })
    
    return response.data
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

/**
 * Update an existing calendar event
 */
async function updateCalendarEvent(userId, eventId, eventData) {
  try {
    const calendar = await getCalendarClient(userId)
    
    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      resource: eventData
    })
    
    return response.data
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

/**
 * Delete a calendar event
 */
async function deleteCalendarEvent(userId, eventId) {
  try {
    const calendar = await getCalendarClient(userId)
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    })
    
    return true
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

/**
 * Check for scheduling conflicts
 */
async function checkAvailability(userId, startTime, endTime) {
  try {
    const calendar = await getCalendarClient(userId)
    
    const response = await calendar.freebusy.query({
      resource: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: 'primary' }]
      }
    })
    
    const busy = response.data.calendars.primary.busy || []
    return busy.length === 0 // true if available
  } catch (error) {
    console.error('Error checking availability:', error)
    throw error
  }
}

/**
 * Create a meeting event with Elexico AI link
 */
async function createElexicoMeeting(userId, { title, startTime, endTime, attendees, roomId }) {
  const meetingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/room/${roomId}`
  
  const eventData = {
    summary: title || 'Elexico AI Meeting',
    description: `Join the meeting: ${meetingUrl}\n\nPowered by Elexico AI`,
    startTime,
    endTime,
    attendees,
    location: meetingUrl
  }
  
  return await createCalendarEvent(userId, eventData)
}

module.exports = {
  fetchUpcomingEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  checkAvailability,
  createElexicoMeeting
}
