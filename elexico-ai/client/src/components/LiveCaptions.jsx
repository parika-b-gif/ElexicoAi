import { useState, useEffect, useRef } from 'react'
import { Subtitles, X } from 'lucide-react'

/**
 * LiveCaptions Component - Real-time Speech-to-Text
 * Uses Web Speech API (Chrome/Edge only)
 * For production, consider: Deepgram, AssemblyAI, Google Cloud Speech-to-Text
 */

const LiveCaptions = ({ isEnabled, onClose }) => {
  const [captions, setCaptions] = useState([])
  const [currentCaption, setCurrentCaption] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const captionsEndRef = useRef(null)

  useEffect(() => {
    if (!isEnabled) return

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.')
      return
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US' // Change as needed

    recognition.onstart = () => {
      console.log('🎤 Live captions started')
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setCaptions(prev => [...prev, { text: finalTranscript.trim(), timestamp }].slice(-10)) // Keep last 10
        setCurrentCaption('')
      } else {
        setCurrentCaption(interimTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        // Restart automatically
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            // Already started
          }
        }, 1000)
      } else {
        setError(`Error: ${event.error}`)
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended')
      setIsListening(false)
      // Auto-restart if still enabled
      if (isEnabled) {
        try {
          recognition.start()
        } catch (e) {
          console.log('Could not restart recognition')
        }
      }
    }

    recognitionRef.current = recognition

    // Start recognition
    try {
      recognition.start()
    } catch (e) {
      console.error('Could not start recognition:', e)
      setError('Could not start speech recognition')
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [isEnabled])

  // Auto-scroll to bottom
  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [captions, currentCaption])

  if (!isEnabled) return null

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-30">
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Subtitles className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm">Live Captions</span>
            {isListening && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 text-xs">Listening</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Captions Display */}
        <div className="max-h-32 overflow-y-auto space-y-2">
          {captions.length === 0 && !currentCaption && !error && (
            <p className="text-gray-400 text-sm text-center py-2">
              {isListening ? 'Listening for speech...' : 'Initializing...'}
            </p>
          )}

          {/* Previous captions */}
          {captions.map((caption, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-gray-500 text-xs shrink-0">{caption.timestamp}</span>
              <p className="text-white text-sm">{caption.text}</p>
            </div>
          ))}

          {/* Current interim caption */}
          {currentCaption && (
            <div className="flex gap-2">
              <span className="text-gray-500 text-xs shrink-0">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <p className="text-gray-300 text-sm italic">{currentCaption}</p>
            </div>
          )}

          <div ref={captionsEndRef} />
        </div>

        {/* Browser Support Info */}
        {!error && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-gray-400 text-xs">
              💡 For best results, speak clearly. Captions work best in Chrome and Edge.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveCaptions
