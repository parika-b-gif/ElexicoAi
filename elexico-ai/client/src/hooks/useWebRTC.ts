/// <reference types="vite/client" />

import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket }                               from 'socket.io-client'
import SimplePeer                                   from 'simple-peer'
import { useScreenShare }                           from './useScreenShare'

export interface PeerInfo {

  peerID: string

  peer: SimplePeer.Instance

  stream: MediaStream | null

  userId: string

  userName: string
}

export interface ChatMessage {
  message:   string
  userId:    string
  userName:  string
  timestamp: number
}

export interface EmojiParticle {
  id:       string
  emoji:    string
  userId:   string
  userName: string
}

export interface WebRTCReturn {
  localStream:         MediaStream | null
  displayStream:       MediaStream | null
  peers:               PeerInfo[]
  isAudioEnabled:      boolean
  isVideoEnabled:      boolean
  isScreenSharing:     boolean
  handRaisedUsers:     Record<string, boolean>
  emojis:              EmojiParticle[]
  chatMessages:        ChatMessage[]
  screenShareWarning:  boolean
  socketConnected:     boolean
  toastMessage:        string
  toastType:           'info' | 'success' | 'warning' | 'error'
  showToast:           boolean
  setScreenShareWarning: (v: boolean) => void
  setShowToast:          (v: boolean) => void
  toggleAudio:         () => void
  toggleVideo:         () => void
  startScreenShare:    () => Promise<void>
  stopScreenShare:     () => void
  toggleHandRaise:     () => void
  sendEmoji:           (emoji: string) => void
  sendChatMessage:     (message: string) => void
  leaveRoom:           () => void
}

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
}

const useWebRTC = (
  roomId:   string,
  userId:   string,
  userName: string,
): WebRTCReturn => {

  const [localStream,         setLocalStream]         = useState<MediaStream | null>(null)
  const [peers,               setPeers]               = useState<PeerInfo[]>([])
  const [isAudioEnabled,      setIsAudioEnabled]      = useState(true)
  const [isVideoEnabled,      setIsVideoEnabled]      = useState(true)
  const [handRaisedUsers,     setHandRaisedUsers]     = useState<Record<string, boolean>>({})
  const [emojis,              setEmojis]              = useState<EmojiParticle[]>([])
  const [chatMessages,        setChatMessages]        = useState<ChatMessage[]>([])
  const [screenShareWarning,  setScreenShareWarning]  = useState(false)
  const [socketConnected,     setSocketConnected]     = useState(false)
  const [toastMessage,        setToastMessage]        = useState('')
  const [toastType,           setToastType]           = useState<WebRTCReturn['toastType']>('info')
  const [showToast,           setShowToast]           = useState(false)

  const socketRef      = useRef<Socket | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const peersRef       = useRef<Map<string, SimplePeer.Instance>>(new Map())

  const pendingPeersRef = useRef<Array<() => void>>([])

  const pendingIdentityRef = useRef<Map<string, { userId: string; userName: string }>>(new Map())

  const upsertPeer = useCallback((peerID: string, updates: Partial<PeerInfo>) => {
    setPeers(prev => {
      const idx = prev.findIndex(p => p.peerID === peerID)
      if (idx === -1) {

        return [...prev, { peerID, peer: updates.peer!, stream: null, userId: '', userName: '', ...updates }]
      }
      const copy = [...prev]
      copy[idx] = { ...copy[idx], ...updates }
      return copy
    })
  }, [])

  const removePeer = useCallback((peerID: string) => {
    peersRef.current.get(peerID)?.destroy()
    peersRef.current.delete(peerID)
    setPeers(prev => prev.filter(p => p.peerID !== peerID))
  }, [])

  const createPeer = useCallback((
    targetSocketId: string,
    targetUserId:   string,
    targetUserName: string,
    stream:         MediaStream,
  ): SimplePeer.Instance => {
    console.log('🔗 createPeer (initiator) →', targetSocketId.slice(0, 6))

    const peer = new SimplePeer({
      initiator: true,
      trickle:   false,
      stream,
      config:    ICE_CONFIG,
    })

    peer.on('signal', (signal: SimplePeer.SignalData) => {
      socketRef.current?.emit('sending-signal', {
        to:             targetSocketId,
        from:           socketRef.current.id,
        signal,
        callerUserId:   userId,
        callerUserName: userName,
      })
    })

    peer.on('stream', (remoteStream: MediaStream) => {
      console.log('🎥 Stream received from', targetSocketId.slice(0, 6))
      upsertPeer(targetSocketId, { stream: remoteStream })
    })

    peer.on('error', (err: Error) => {
      console.error('❌ Peer error (initiator):', err.message)
    })

    peer.on('close', () => {
      console.log('🔌 Peer closed (initiator):', targetSocketId.slice(0, 6))
      removePeer(targetSocketId)
    })

    peersRef.current.set(targetSocketId, peer)
    upsertPeer(targetSocketId, { peer, userId: targetUserId, userName: targetUserName })

    return peer
  }, [upsertPeer, removePeer])

  const addPeer = useCallback((
    incomingSignal: SimplePeer.SignalData,
    callerSocketId: string,
    callerUserId:   string,
    callerUserName: string,
    stream:         MediaStream,
  ): SimplePeer.Instance => {
    console.log('🔗 addPeer (receiver) ← ', callerSocketId.slice(0, 6))

    const peer = new SimplePeer({
      initiator: false,
      trickle:   false,
      stream,
      config:    ICE_CONFIG,
    })

    peer.on('signal', (signal: SimplePeer.SignalData) => {
      socketRef.current?.emit('returning-signal', {
        to: callerSocketId,
        signal,
      })
    })

    peer.on('stream', (remoteStream: MediaStream) => {
      console.log('🎥 Stream received from', callerSocketId.slice(0, 6))
      upsertPeer(callerSocketId, { stream: remoteStream })
    })

    peer.on('error', (err: Error) => {
      console.error('❌ Peer error (receiver):', err.message)
    })

    peer.on('close', () => {
      console.log('🔌 Peer closed (receiver):', callerSocketId.slice(0, 6))
      removePeer(callerSocketId)
    })

    peer.signal(incomingSignal)

    peersRef.current.set(callerSocketId, peer)
    upsertPeer(callerSocketId, { peer, userId: callerUserId, userName: callerUserName })

    return peer
  }, [upsertPeer, removePeer])

  const {
    isScreenSharing,
    screenStream,
    startScreenShare: _startScreenShare,
    stopScreenShare,
  } = useScreenShare({
    localStreamRef,
    peersRef,
    onStart: () => {
      setScreenShareWarning(false)
      setToastMessage('Screen sharing started')
      setToastType('success')
      setShowToast(true)
    },
    onStop: () => {
      setScreenShareWarning(false)
    },
    onError: (err) => {
      setScreenShareWarning(false)
      setToastMessage(`Screen share failed: ${err.message}`)
      setToastType('warning')
      setShowToast(true)
    },
  })

  const displayStream = isScreenSharing ? screenStream : localStream

  const startScreenShare = useCallback(async () => {
    setScreenShareWarning(true)
    await _startScreenShare()
  }, [_startScreenShare])

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
    .then(stream => {
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
      localStreamRef.current = stream
      setLocalStream(stream)

      console.log('🎥 Local media ready')
    })
    .catch(err => console.warn('⚠️  Media unavailable:', err.message))

    return () => {
      cancelled = true
      localStreamRef.current?.getTracks().forEach(t => t.stop())

    }
  }, [])

  useEffect(() => {
    if (!localStream) return
    const queued = pendingPeersRef.current.splice(0)
    if (queued.length > 0) {
      console.log(`⏳ Flushing ${queued.length} queued peer connection(s)`)
      queued.forEach(fn => fn())
    }
  }, [localStream])

  useEffect(() => {
    if (!roomId || !userId) return

    const serverUrl = import.meta.env.VITE_SERVER_URL ||
      `http://${window.location.hostname}:5000`

    console.log('🔌 Connecting to', serverUrl)

    const socket = io(serverUrl, {
      transports:          ['websocket', 'polling'],
      reconnection:        true,
      reconnectionDelay:   1000,
      reconnectionAttempts: 20,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      setSocketConnected(true)

      socket.emit('join-room', { roomId, userId, userName })
    })

    socket.on('disconnect', (reason: string) => {
      console.warn('❌ Socket disconnected:', reason)
      setSocketConnected(false)
    })

    socket.on('connect_error', (err: Error) => {
      console.error('🔥 Connection error:', err.message)
    })

    socket.io.on('reconnect', () => {
      console.log('🔄 Reconnected — rejoining room')
      socket.emit('join-room', { roomId, userId, userName })
    })

    socket.on('room-full', () => {
      setToastMessage('Room is full (max 6 participants)')
      setToastType('warning')
      setShowToast(true)
    })

    socket.on('all-users', (users: Array<{ socketId: string; userId: string; userName: string }>) => {
      console.log('👥 Existing peers:', users.length)

      const connect = () => users.forEach(u => {
        if (!peersRef.current.has(u.socketId)) {
          createPeer(u.socketId, u.userId, u.userName, localStreamRef.current!)
        }
      })

      if (localStreamRef.current) {
        connect()
      } else {

        console.warn('⏳ all-users queued (stream not ready)')
        pendingPeersRef.current.push(connect)
      }
    })

    socket.on('user-joined', ({ socketId, userId: uid, userName: uName }: {
      socketId: string; userId: string; userName: string
    }) => {
      console.log('🚪 user-joined:', uName, `(${socketId.slice(0,6)})`)
      pendingIdentityRef.current.set(socketId, { userId: uid, userName: uName })
    })

    socket.on('user-signal', ({ signal, from, callerUserId, callerUserName }: {
      signal:         SimplePeer.SignalData;
      from:           string;
      callerUserId?:  string;
      callerUserName?:string;
    }) => {

      const identity = pendingIdentityRef.current.get(from)
      pendingIdentityRef.current.delete(from)
      const resolvedUserId   = callerUserId   || identity?.userId   || ''
      const resolvedUserName = callerUserName || identity?.userName || `User-${from.slice(0,6)}`

      const connect = () => {

        if (peersRef.current.has(from)) {
          peersRef.current.get(from)?.signal(signal)
        } else {
          addPeer(signal, from, resolvedUserId, resolvedUserName, localStreamRef.current!)
        }
      }

      if (localStreamRef.current) {
        connect()
      } else {
        console.warn('⏳ user-signal queued (stream not ready)')
        pendingPeersRef.current.push(connect)
      }
    })

    socket.on('receiving-returned-signal', ({ signal, id }: {
      signal: SimplePeer.SignalData;
      id:     string;
    }) => {
      const peer = peersRef.current.get(id)
      if (peer && !peer.destroyed) {
        peer.signal(signal)
      }
    })

    socket.on('user-left', ({ socketId }: { socketId: string }) => {
      console.log('👋 User left:', socketId.slice(0, 6))
      removePeer(socketId)
      setHandRaisedUsers(prev => {
        const n = { ...prev }
        delete n[socketId]
        return n
      })
    })

    socket.on('emoji-received', ({ userId: uid, emoji, userName: uName, timestamp }: {
      userId: string; emoji: string; userName: string; timestamp: number
    }) => {
      const id = `${timestamp}-${uid}-${Math.random().toString(36).slice(2, 8)}`
      setEmojis(prev => [...prev, { id, emoji, userId: uid, userName: uName }])
      setTimeout(() => setEmojis(prev => prev.filter(e => e.id !== id)), 3500)
    })

    socket.on('chat-message-received', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg])
    })

    socket.on('hand-raised', ({ userId: uid, isRaised }: { userId: string; isRaised: boolean }) => {
      setHandRaisedUsers(prev => ({ ...prev, [uid]: isRaised }))
    })

    // Host control events
    socket.on('force-mute', () => {
      const track = localStreamRef.current?.getAudioTracks()[0]
      if (track) {
        track.enabled = false
        setIsAudioEnabled(false)
        setToastMessage('Host muted all participants')
        setToastType('info')
        setShowToast(true)
      }
    })

    socket.on('removed-by-host', ({ reason }: { reason: string }) => {
      setToastMessage(reason || 'You were removed from the meeting')
      setToastType('warning')
      setShowToast(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    })

    socket.on('meeting-locked', ({ locked }: { locked: boolean }) => {
      setToastMessage(locked ? 'Meeting locked by host' : 'Meeting unlocked by host')
      setToastType('info')
      setShowToast(true)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null

      peersRef.current.forEach(p => p.destroy())
      peersRef.current.clear()
      setPeers([])
    }
  }, [roomId, userId, userName, createPeer, addPeer, removePeer])

  const toggleAudio = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) { track.enabled = !track.enabled; setIsAudioEnabled(track.enabled) }
  }, [])

  const toggleVideo = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (track) { track.enabled = !track.enabled; setIsVideoEnabled(track.enabled) }
  }, [])

  const toggleHandRaise = useCallback(() => {
    const isRaised = !handRaisedUsers[userId]
    setHandRaisedUsers(prev => ({ ...prev, [userId]: isRaised }))
    socketRef.current?.emit('toggle-hand', { userId, isRaised })
  }, [userId, handRaisedUsers])

  const sendEmoji = useCallback((emoji: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('emoji-reaction', { userId, emoji, userName })

      const id = `${Date.now()}-${userId}-local`
      setEmojis(prev => [...prev, { id, emoji, userId, userName }])
      setTimeout(() => setEmojis(prev => prev.filter(e => e.id !== id)), 3500)
    }
  }, [userId, userName])

  const sendChatMessage = useCallback((message: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat-message', { userId, userName, message })
    }
  }, [userId, userName])

  const leaveRoom = useCallback(() => {

    stopScreenShare()
    peersRef.current.forEach(p => p.destroy())
    peersRef.current.clear()
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    socketRef.current?.emit('leave-room', { userId })
    socketRef.current?.disconnect()
  }, [userId, stopScreenShare])

  return {
    localStream,
    displayStream,
    peers,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    handRaisedUsers,
    emojis,
    chatMessages,
    screenShareWarning,
    socketConnected,
    toastMessage,
    toastType,
    showToast,
    setScreenShareWarning,
    setShowToast,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    toggleHandRaise,
    sendEmoji,
    sendChatMessage,
    leaveRoom,
  }
}

export default useWebRTC
