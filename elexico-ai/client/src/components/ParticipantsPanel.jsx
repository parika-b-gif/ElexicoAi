import { motion } from 'framer-motion'
import { X, Hand, Mic, MicOff } from 'lucide-react'

const ParticipantsPanel = ({ participants, handRaisedUsers, onClose }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-gray-800 font-medium text-lg">
          Participants ({participants.length})
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="text-gray-600" size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((participant) => (
          <motion.div
            key={participant.userId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 hover:bg-gray-50  rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {participant.userName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-gray-800 font-medium text-sm">
                  {participant.userName}
                  {participant.isLocal && ' (You)'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {handRaisedUsers[participant.userId] && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-yellow-500"
                >
                  <Hand size={18} />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ParticipantsPanel
