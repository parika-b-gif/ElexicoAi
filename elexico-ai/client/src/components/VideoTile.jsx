import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Hand, Monitor } from 'lucide-react'
import useActiveSpeaker from '../hooks/useActiveSpeaker'

const VideoTile = ({
  stream,
  userName,
  isLocal,
  isMuted,
  isVideoOff,
  isHandRaised,
  isScreenSharing,
}) => {
  const videoRef = useRef(null)
  const isSpeaking = useActiveSpeaker(stream, -50)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`relative bg-gray-900 rounded-xl overflow-hidden aspect-video group shadow-lg transition-all duration-300 ${
        isSpeaking && !isMuted
          ? 'border-4 border-green-400 shadow-green-400/50 shadow-2xl ring-4 ring-green-400/30'
          : 'border border-gray-700'
      }`}
    >
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isMuted}
          className={`w-full h-full object-cover ${isLocal && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white font-medium text-sm">{userName}</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        {isHandRaised && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg"
          >
            <Hand className="text-gray-800" size={18} />
          </motion.div>
        )}

        {isScreenSharing && (
          <div className="absolute top-2 left-2 bg-blue-500 px-2 py-1 rounded-md flex items-center space-x-1 shadow-lg">
            <Monitor className="text-white" size={14} />
            <span className="text-white text-xs font-medium">Presenting</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm truncate">
                {userName} {isLocal && '(You)'}
              </span>
              {isSpeaking && !isMuted && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="flex space-x-0.5"
                >
                  <div className="w-1 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-3 bg-green-400 rounded-full"></div>
                </motion.div>
              )}
            </div>
            {isMuted && (
              <div className="bg-red-500 rounded-full p-1 shadow-lg">
                <MicOff className="text-white" size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VideoTile
