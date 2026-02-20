import { useState } from 'react'
import { Users, MicOff, UserX, Lock, Unlock, Shield, X } from 'lucide-react'

/**
 * HostControls Component - Host-only meeting management
 * Allows host to: mute all, remove participants, lock meeting
 */

const HostControls = ({ 
  participants, 
  userId, 
  isHost,
  onMuteAll, 
  onRemoveParticipant, 
  onToggleLock,
  isLocked,
  onClose 
}) => {
  const [confirmRemove, setConfirmRemove] = useState(null)

  if (!isHost) return null

  const handleRemoveParticipant = (participantId) => {
    if (confirmRemove === participantId) {
      onRemoveParticipant(participantId)
      setConfirmRemove(null)
    } else {
      setConfirmRemove(participantId)
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmRemove(null), 3000)
    }
  }

  return (
    <div className="fixed right-4 top-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Host Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 space-y-2">
        <button
          onClick={onMuteAll}
          className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
        >
          <MicOff className="w-5 h-5" />
          <span className="font-medium">Mute All Participants</span>
        </button>

        <button
          onClick={onToggleLock}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isLocked
              ? 'bg-red-50 hover:bg-red-100 text-red-700'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          <span className="font-medium">
            {isLocked ? 'Meeting Locked' : 'Lock Meeting'}
          </span>
        </button>
      </div>

      {/* Participants List */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">
            Participants ({participants.length})
          </h4>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {participants.map((participant) => {
            const isCurrentUser = participant.userId === userId
            const isParticipantHost = participant.isHost

            return (
              <div
                key={participant.userId || participant.socketId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(participant.userName || 'User').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {!participant.isAudioEnabled && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {participant.userName || `User-${participant.socketId?.slice(0, 6)}`}
                      {isCurrentUser && ' (You)'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isParticipantHost ? '👑 Host' : 'Participant'}
                    </p>
                  </div>
                </div>

                {/* Remove Button (only for non-host participants) */}
                {!isCurrentUser && !isParticipantHost && (
                  <button
                    onClick={() => handleRemoveParticipant(participant.socketId)}
                    className={`ml-2 p-2 rounded-lg transition-all ${
                      confirmRemove === participant.socketId
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
                    title={confirmRemove === participant.socketId ? 'Click again to confirm' : 'Remove participant'}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>Host Powers:</strong> You can mute all participants, remove users, 
          and lock the meeting to prevent new joins.
        </p>
      </div>
    </div>
  )
}

export default HostControls
