import { useState, useEffect } from 'react'
import { Calendar, LogOut, User } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * GoogleCalendarAuth Component
 * Handles Google OAuth authentication and displays user calendar info
 */
const GoogleCalendarAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [showEvents, setShowEvents] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    const storedUserId = localStorage.getItem('googleUserId')
    if (storedUserId) {
      checkAuthStatus(storedUserId)
    }

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('userId')
    const email = params.get('email')
    const name = params.get('name')

    if (userId && email) {
      // Store user info
      localStorage.setItem('googleUserId', userId)
      setUser({ userId, email, name: decodeURIComponent(name) })
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const checkAuthStatus = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/status?userId=${userId}`)
      const data = await response.json()

      if (data.authenticated) {
        setUser({ userId, ...data.userInfo })
      } else {
        localStorage.removeItem('googleUserId')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/google`)
      const data = await response.json()

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error('Error initiating Google login:', error)
      alert('Failed to connect to Google. Please try again.')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
      })

      localStorage.removeItem('googleUserId')
      setUser(null)
      setEvents([])
      setShowEvents(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const fetchCalendarEvents = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/calendar/events?userId=${user.userId}`)
      const data = await response.json()

      if (data.events) {
        setEvents(data.events)
        setShowEvents(true)
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      alert('Failed to fetch calendar events')
    } finally {
      setLoading(false)
    }
  }

  const formatEventTime = (dateTime) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!user) {
    return (
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:shadow-md transition-all disabled:opacity-50"
      >
        <Calendar className="w-5 h-5" />
        {loading ? 'Connecting...' : 'Connect Google Calendar'}
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      {/* User Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Actions */}
      <div className="flex gap-2">
        <button
          onClick={fetchCalendarEvents}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Calendar className="w-4 h-4" />
          {loading ? 'Loading...' : 'View Calendar'}
        </button>
      </div>

      {/* Calendar Events */}
      {showEvents && (
        <div className="border-t pt-3 space-y-2">
          <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="text-sm text-gray-600">No upcoming events</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">{event.summary}</p>
                  <p className="text-sm text-gray-600">
                    {formatEventTime(event.start?.dateTime || event.start?.date)}
                  </p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GoogleCalendarAuth
