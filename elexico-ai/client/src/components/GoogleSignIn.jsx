import { useEffect, useState } from 'react'
import { LogOut, User } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

/**
 * Google Sign-In Component using Google Identity Services
 * Modern, secure authentication with JWT token verification
 */
const GoogleSignIn = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is already signed in
    const sessionToken = localStorage.getItem('sessionToken')
    if (sessionToken) {
      verifySession(sessionToken)
    } else {
      setLoading(false)
    }

    // Check if using placeholder/invalid Client ID
    const isPlaceholder = !GOOGLE_CLIENT_ID || 
                          GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID') || 
                          GOOGLE_CLIENT_ID === 'your-client-id-here.apps.googleusercontent.com'

    // Only load Google script if we have a valid Client ID
    if (!isPlaceholder) {
      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = initializeGoogleSignIn
        document.body.appendChild(script)
      } else {
        initializeGoogleSignIn()
      }
    }

    return () => {
      // Cleanup
      if (window.google && !isPlaceholder) {
        window.google.accounts.id.cancel()
      }
    }
  }, [])

  const initializeGoogleSignIn = () => {
    if (!window.google || !GOOGLE_CLIENT_ID) {
      return // Don't initialize if requirements not met
    }

    // Check if using placeholder Client ID
    const isPlaceholder = GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID') || 
                          GOOGLE_CLIENT_ID === 'your-client-id-here.apps.googleusercontent.com'
    
    if (isPlaceholder) {
      return // Don't initialize with placeholder ID
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      // Render the Sign-In button only if the container exists
      const buttonContainer = document.getElementById('googleSignInButton')
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        })
      }
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err)
      setError('Failed to initialize Google Sign-In')
    }
  }

  const handleCredentialResponse = async (response) => {
    const credential = response.credential

    if (!credential) {
      setError('No credential received from Google')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Send JWT to backend for verification
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      })

      const data = await res.json()

      if (data.success) {
        // Store session token
        localStorage.setItem('sessionToken', data.sessionToken)
        
        // Store user info
        setUser(data.user)
        
        console.log('✅ Successfully signed in:', data.user.email)
      } else {
        setError(data.error || 'Authentication failed')
        console.error('Authentication failed:', data.error)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error during authentication:', err)
    } finally {
      setLoading(false)
    }
  }

  const verifySession = async (sessionToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      })

      const data = await res.json()

      if (data.valid) {
        setUser(data.user)
      } else {
        // Invalid session, clear storage
        localStorage.removeItem('sessionToken')
      }
    } catch (err) {
      console.error('Error verifying session:', err)
      localStorage.removeItem('sessionToken')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const sessionToken = localStorage.getItem('sessionToken')

    if (sessionToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        })
      } catch (err) {
        console.error('Error during logout:', err)
      }
    }

    // Clear local state and storage
    localStorage.removeItem('sessionToken')
    setUser(null)

    // Sign out from Google
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }

    console.log('✅ Signed out successfully')
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-300 rounded"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">
        {error}
      </div>
    )
  }

  // Signed in state
  if (user) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-lg shadow-md p-3">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-10 h-10 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-600 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    )
  }

  // Sign in button state
  // Check if using placeholder/invalid Client ID
  const isPlaceholder = !GOOGLE_CLIENT_ID || 
                        GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID') || 
                        GOOGLE_CLIENT_ID === 'your-client-id-here.apps.googleusercontent.com'

  if (isPlaceholder) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">
              Google Sign-In Not Configured
            </h3>
            <p className="text-sm text-yellow-800 mb-2">
              You need to set up your Google Client ID to enable authentication.
            </p>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
            >
              Get Client ID →
            </a>
            <p className="text-xs text-yellow-700 mt-2">
              See <code className="bg-yellow-100 px-1 rounded">SETUP_INSTRUCTIONS.txt</code> for step-by-step guide
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div id="googleSignInButton"></div>
    </div>
  )
}

export default GoogleSignIn
