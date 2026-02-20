import { useState, useEffect } from 'react'
import { useParams, useNavigate }      from 'react-router-dom'
import { v4 as uuidv4 }               from 'uuid'
import {
  Mic, MicOff, Video, VideoOff,
  Monitor, MonitorOff, Hand, Smile,
  MessageSquare, Users, PhoneOff,
  Circle, Link, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import useWebRTC                from '../hooks/useWebRTC'
import useRecorder              from '../hooks/useRecorder'
import VideoTile                from './VideoTile'
import ChatPanel                from './ChatPanel'
import ParticipantsPanel        from './ParticipantsPanel'
import EmojiPicker              from './EmojiPicker'
import FloatingEmoji            from './FloatingEmoji'
import ScreenShareWarning       from './ScreenShareWarning'
import Toast                    from './Toast'

function gridClass(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count <= 4)  return 'grid-cols-2'
  return 'grid-cols-3'
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  return new Promise((resolve, reject) => {
    const el      = document.createElement('textarea')
    el.value      = text
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    try   { document.execCommand('copy'); document.body.removeChild(el); resolve() }
    catch (e) { document.body.removeChild(el); reject(e) }
  })
}

const MeetingRoom: React.FC = () => {
  const { roomId }   = useParams<{ roomId: string }>()
  const navigate     = useNavigate()

  const [userId]   = useState<string>(() => uuidv4())
  const [userName] = useState<string>(() => `User-${userId.slice(0, 6)}`)

  const [showChat,        setShowChat]        = useState(false)
  const [showParticipants,setShowParticipants] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker]  = useState(false)
  const [linkCopied,      setLinkCopied]       = useState(false)
  const [showShareModal,  setShowShareModal]   = useState(false)

  const {
    localStream, displayStream, peers,
    isAudioEnabled, isVideoEnabled, isScreenSharing,
    handRaisedUsers, emojis, chatMessages,
    screenShareWarning, setScreenShareWarning,
    socketConnected, toastMessage, toastType, showToast, setShowToast,
    toggleAudio, toggleVideo, startScreenShare, stopScreenShare,
    toggleHandRaise, sendEmoji, sendChatMessage, leaveRoom,
  } = useWebRTC(roomId!, userId, userName)

  const {
    isRecording, recordedChunks,
    startRecording, stopRecording, downloadRecording, clearRecording,
  } = useRecorder()

  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      downloadRecording()
      clearRecording()
    }
  }, [isRecording, recordedChunks, downloadRecording, clearRecording])

  const handleLeaveRoom = () => { leaveRoom(); navigate('/') }

  const handleEmojiSelect = (emoji: string) => {
    sendEmoji(emoji)
    setShowEmojiPicker(false)
  }

  const handleRecordingToggle = () => {
    if (isRecording) { stopRecording() }
    else if (localStream) { startRecording(localStream) }
  }

  const handleCopyLink = () => {
    const link = window.location.href
    copyToClipboard(link)
      .then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000) })
      .catch(() => setShowShareModal(true))
  }

  const meetingLink       = window.location.href
  const participantCount  = peers.length + 1

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-gray-900">

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-gray-900 font-semibold text-lg mb-1">Share meeting link</h2>
              <p className="text-gray-500 text-sm mb-4">Anyone with this link can join</p>
              <div className="flex gap-2">
                <input readOnly value={meetingLink} onFocus={e => e.target.select()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button
                  onClick={() => copyToClipboard(meetingLink).then(() => {
                    setLinkCopied(true); setShowShareModal(false)
                    setTimeout(() => setLinkCopied(false), 2000)
                  })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                >
                  <Check size={14} /> Copy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScreenShareWarning isVisible={screenShareWarning} onClose={() => setScreenShareWarning(false)} />
      <Toast message={toastMessage} type={toastType} isVisible={showToast}
        onClose={() => setShowToast(false)} duration={5000} />

      <motion.header
        initial={{ y: -80 }} animate={{ y: 0 }}
        className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Video className="text-white" size={20} />
            </div>
            <span className="text-gray-800 font-medium text-lg">Elexico AI</span>
          </div>

          <div className="bg-gray-100 px-3 py-1 rounded-md">
            <p className="text-gray-600 text-sm font-mono">{roomId}</p>
          </div>

          <button onClick={handleCopyLink}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            title="Share meeting link"
          >
            {linkCopied ? <><Check size={14} /><span>Copied!</span></> : <><Link size={14} /><span>Share</span></>}
          </button>

          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
            socketConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {socketConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRecording && (
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-md">
              <Circle className="text-red-500 fill-red-500" size={10} />
              <span className="text-red-600 text-sm font-medium">Recording</span>
            </motion.div>
          )}
          <div className="bg-gray-100 px-3 py-1.5 rounded-md text-gray-700 text-sm">
            {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden min-h-0">

        <div className="flex-1 p-4 overflow-hidden min-h-0">
          <div className={`grid ${gridClass(participantCount)} gap-4 h-full`}>

            <VideoTile
              stream={displayStream || localStream}
              userName={`${userName} (You)`}
              isLocal={true}
              isMuted={!isAudioEnabled}
              isVideoOff={!isVideoEnabled}
              isHandRaised={handRaisedUsers[userId] ?? false}
              isScreenSharing={isScreenSharing}
            />

            {peers.map(peerInfo => (
              <VideoTile
                key={peerInfo.peerID}
                stream={peerInfo.stream}
                userName={peerInfo.userName || `User-${peerInfo.peerID.slice(0, 6)}`}
                isLocal={false}
                isMuted={false}
                isVideoOff={!peerInfo.stream}
                isHandRaised={handRaisedUsers[peerInfo.userId] ?? false}
                isScreenSharing={false}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showChat && (
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-80 bg-white border-l border-gray-200 shadow-lg"
            >
              <ChatPanel messages={chatMessages} onSendMessage={sendChatMessage}
                onClose={() => setShowChat(false)} currentUserId={userId} />
            </motion.div>
          )}

          {showParticipants && (
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-80 bg-white border-l border-gray-200 shadow-lg"
            >
              <ParticipantsPanel
                participants={[
                  { userId, userName, isLocal: true },
                  ...peers.map(p => ({
                    userId:   p.userId   || p.peerID,
                    userName: p.userName || `User-${p.peerID.slice(0,6)}`,
                    isLocal:  false,
                  })),
                ]}
                handRaisedUsers={handRaisedUsers}
                onClose={() => setShowParticipants(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.footer
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-center gap-3 z-10 shadow-lg"
      >
        <ControlButton
          onClick={toggleAudio}
          active={!isAudioEnabled}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
          activeClass="bg-red-500 hover:bg-red-600"
        >
          {isAudioEnabled ? <Mic className="text-gray-700" size={22} /> : <MicOff className="text-white" size={22} />}
        </ControlButton>

        <ControlButton
          onClick={toggleVideo}
          active={!isVideoEnabled}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          activeClass="bg-red-500 hover:bg-red-600"
        >
          {isVideoEnabled ? <Video className="text-gray-700" size={22} /> : <VideoOff className="text-white" size={22} />}
        </ControlButton>

        <ControlButton
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          active={isScreenSharing}
          title={isScreenSharing ? 'Stop presenting' : 'Present now'}
          activeClass="bg-blue-500 hover:bg-blue-600"
        >
          {isScreenSharing
            ? <MonitorOff className="text-white" size={22} />
            : <Monitor className="text-gray-700" size={22} />}
        </ControlButton>

        <Divider />

        <ControlButton
          onClick={toggleHandRaise}
          active={!!handRaisedUsers[userId]}
          title={handRaisedUsers[userId] ? 'Lower hand' : 'Raise hand'}
          activeClass="bg-yellow-400 hover:bg-yellow-500"
        >
          <Hand className={handRaisedUsers[userId] ? 'text-gray-800' : 'text-gray-700'} size={22} />
        </ControlButton>

        <div className="relative">
          <ControlButton onClick={() => setShowEmojiPicker(v => !v)} title="Send reaction">
            <Smile className="text-gray-700" size={22} />
          </ControlButton>
          <AnimatePresence>
            {showEmojiPicker && (
              <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
            )}
          </AnimatePresence>
        </div>

        <ControlButton
          onClick={() => setShowChat(v => !v)}
          active={showChat}
          title="In-call messages"
          activeClass="bg-blue-500 hover:bg-blue-600"
        >
          <MessageSquare className={showChat ? 'text-white' : 'text-gray-700'} size={22} />
        </ControlButton>

        <ControlButton
          onClick={() => setShowParticipants(v => !v)}
          active={showParticipants}
          title="Participants"
          activeClass="bg-blue-500 hover:bg-blue-600"
        >
          <Users className={showParticipants ? 'text-white' : 'text-gray-700'} size={22} />
        </ControlButton>

        <ControlButton
          onClick={handleRecordingToggle}
          active={isRecording}
          title={isRecording ? 'Stop recording' : 'Start recording'}
          activeClass="bg-red-500 hover:bg-red-600"
        >
          <Circle className={isRecording ? 'text-white fill-white' : 'text-gray-700'} size={22} />
        </ControlButton>

        <Divider />

        <button onClick={handleLeaveRoom} title="Leave call"
          className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-all">
          <PhoneOff className="text-white" size={22} />
        </button>
      </motion.footer>

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 99999 }}>
        <AnimatePresence>
          {emojis.map(e => (
            <FloatingEmoji key={e.id} emoji={e.emoji} id={e.id} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface ControlButtonProps {
  onClick:     () => void
  children:    React.ReactNode
  title?:      string
  active?:     boolean
  activeClass?: string
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick, children, title, active, activeClass = 'bg-blue-500 hover:bg-blue-600',
}) => (
  <button onClick={onClick} title={title}
    className={`p-3 rounded-full transition-all ${active ? activeClass : 'bg-gray-200 hover:bg-gray-300'}`}>
    {children}
  </button>
)

const Divider: React.FC = () => (
  <div className="w-px h-8 bg-gray-300 mx-1" />
)

export default MeetingRoom
