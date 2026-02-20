import { io } from 'socket.io-client'

let socket = null

export const initializeSocket = (serverUrl) => {
  if (socket) {
    return socket
  }

  console.log('🔌 Initializing Socket.io connection to:', serverUrl)

  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('✅ Connected to signaling server, Socket ID:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from signaling server. Reason:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('🔥 Connection error:', error.message)
  })

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
  })

  return socket
}

export const getSocket = () => {
  return socket
}

export const joinRoom = (roomId, userId, userName) => {
  if (!socket) {
    console.error('❌ Socket not initialized')
    return
  }

  console.log(`🚪 Joining room: ${roomId} as ${userName}`)

  socket.emit('join-room', {
    roomId,
    userId,
    userName,
  })
}

export const sendSignal = (targetUserId, userId, signal) => {
  if (!socket) {
    console.error('❌ Socket not initialized')
    return
  }

  socket.emit('signal-send', {
    targetUserId,
    userId,
    signal,
  })

  const signalType = signal.type || 'ICE candidate'
  console.log(`📡 Sent ${signalType} to ${targetUserId.slice(0, 6)}}...`)
}

export const onSignalReceive = (callback) => {
  if (!socket) return

  socket.on('signal-receive', callback)
}

export const onRoomParticipants = (callback) => {
  if (!socket) return

  socket.on('room-participants', callback)
}

export const onUserJoined = (callback) => {
  if (!socket) return

  socket.on('user-joined', callback)
}

export const onUserLeft = (callback) => {
  if (!socket) return

  socket.on('user-left', callback)
}

export const sendChatMessage = (userId, userName, message) => {
  if (!socket) return

  socket.emit('chat-message', {
    userId,
    userName,
    message,
  })
}

export const onChatMessage = (callback) => {
  if (!socket) return

  socket.on('chat-message-received', callback)
}

export const sendEmoji = (userId, userName, emoji) => {
  if (!socket) return

  socket.emit('emoji-reaction', {
    userId,
    userName,
    emoji,
  })
}

export const onEmojiReceived = (callback) => {
  if (!socket) return

  socket.on('emoji-received', callback)
}

export const toggleHandRaise = (userId, isRaised) => {
  if (!socket) return

  socket.emit('toggle-hand', {
    userId,
    isRaised,
  })
}

export const onHandRaised = (callback) => {
  if (!socket) return

  socket.on('hand-raised', callback)
}

export const sendRecordingState = (userId, isRecording) => {
  if (!socket) return

  socket.emit('recording-state', {
    userId,
    isRecording,
  })
}

export const onRecordingState = (callback) => {
  if (!socket) return

  socket.on('recording-state-update', callback)
}

export const leaveRoom = (userId) => {
  if (!socket) return

  console.log('👋 Leaving room')
  socket.emit('leave-room', { userId })
}

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting socket')
    socket.disconnect()
    socket = null
  }
}

export const isConnected = () => {
  return socket ? socket.connected : false
}

export const removeListener = (eventName, callback) => {
  if (socket) {
    socket.off(eventName, callback)
  }
}

export const removeAllListeners = (eventName) => {
  if (socket) {
    socket.removeAllListeners(eventName)
  }
}
