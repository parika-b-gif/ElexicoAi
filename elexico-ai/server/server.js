require('dotenv').config()

const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const { createRedisAdapter } = require('./redisAdapter')

const rooms = new Map()

const SERVER_INSTANCE_ID = process.env.SERVER_INSTANCE_ID ||
  `srv-${Math.random().toString(36).slice(2, 8)}`

console.log(`\n🏷️  Instance: ${SERVER_INSTANCE_ID}\n`)

const rateLimits = new Map()

const LIMITS = {
  'sending-signal':    { max: 30, window: 1000 },
  'returning-signal':  { max: 30, window: 1000 },
  'emoji-reaction':    { max:  5, window: 1000 },
  'chat-message':      { max:  2, window: 1000 },
}

function checkRate(socketId, event) {
  const cfg = LIMITS[event]
  if (!cfg) return true
  if (!rateLimits.has(socketId)) rateLimits.set(socketId, {})
  const bucket = rateLimits.get(socketId)
  if (!bucket[event]) bucket[event] = []
  const now = Date.now()
  bucket[event] = bucket[event].filter(t => now - t < cfg.window)
  if (bucket[event].length >= cfg.max) return false
  bucket[event].push(now)
  return true
}

const app    = express()
const server = http.createServer(app)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Import auth routes
const authRoutes = require('./authRoutes')
app.use(authRoutes)

const io = new Server(server, {
  cors: { origin: true, methods: ['GET', 'POST'], credentials: true },
  pingInterval: 25000,
  pingTimeout:  60000,
})

async function initRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  const adapter  = await createRedisAdapter(redisUrl)
  if (adapter) {
    io.adapter(adapter)
    console.log(`✅ Redis adapter attached (${redisUrl})`)
  } else {
    console.log('⚠️  In-memory mode — single instance only')
  }
}

app.get('/health', (_req, res) => {
  let totalUsers = 0
  rooms.forEach(users => { totalUsers += users.length })
  res.json({
    status: 'ok',
    instanceId: SERVER_INSTANCE_ID,
    activeRooms: rooms.size,
    totalUsers,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

app.get('/stats', (_req, res) => {
  const data = []
  rooms.forEach((users, roomId) => {
    data.push({ roomId, userCount: users.length, users: users.map(u => u.userName || u.socketId) })
  })
  res.json({ instanceId: SERVER_INSTANCE_ID, rooms: data })
})

io.on('connection', (socket) => {
  const ts = () => new Date().toISOString().slice(11, 23)
  const log = (evt, msg) =>
    console.log(`[${ts()}] [${SERVER_INSTANCE_ID}] [${socket.id.slice(0,6)}] ${evt}: ${msg}`)

  log('connect', `new connection from ${socket.handshake.address}`)

  socket.on('join-room', ({ roomId, userId, userName }) => {
    if (!roomId || typeof roomId !== 'string') return

    const safeName = String(userName || `User-${socket.id.slice(0,6)}`).slice(0, 32)
    log('join-room', `${safeName} → ${roomId}`)

    socket.roomId   = roomId
    socket.userId   = userId
    socket.userName = safeName
    socket.join(roomId)

    const existingUsers = (rooms.get(roomId) || []).slice()

    if (existingUsers.length >= 6) {
      socket.emit('room-full')
      return
    }

    if (!rooms.has(roomId)) rooms.set(roomId, [])
    rooms.get(roomId).push({ socketId: socket.id, userId, userName: safeName })

    socket.emit('all-users', existingUsers)

    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName: safeName,
    })

    log('join-room', `${safeName} joined, ${existingUsers.length} existing peers`)
  })

  socket.on('sending-signal', ({ to, from, signal, callerUserId, callerUserName }) => {
    if (!checkRate(socket.id, 'sending-signal')) return
    if (!to || !signal) return
    log('sending-signal', `→ ${String(to).slice(0,6)} (offer/ICE)`)
    io.to(to).emit('user-signal', {
      signal,
      from,
      callerUserId:   callerUserId   || socket.userId   || '',
      callerUserName: callerUserName || socket.userName || `User-${socket.id.slice(0,6)}`,
    })
  })

  socket.on('returning-signal', ({ to, signal }) => {
    if (!checkRate(socket.id, 'returning-signal')) return
    if (!to || !signal) return
    log('returning-signal', `→ ${String(to).slice(0,6)} (answer/ICE)`)
    io.to(to).emit('receiving-returned-signal', { signal, id: socket.id })
  })

  socket.on('emoji-reaction', ({ emoji, roomId: rid, userId: uid, userName: uName }) => {
    if (!checkRate(socket.id, 'emoji-reaction')) return
    const room = rid || socket.roomId
    if (!room) return
    io.to(room).emit('emoji-received', {
      emoji,
      userId:    uid   || socket.userId,
      userName:  uName || socket.userName,
      timestamp: Date.now(),
    })
  })

  socket.on('chat-message', ({ message, roomId: rid, userId: uid, userName: uName }) => {
    if (!checkRate(socket.id, 'chat-message')) {
      socket.emit('rate-limited', { event: 'chat-message', retryAfterMs: 1000 })
      return
    }
    const room = rid || socket.roomId
    if (!room) return
    const safeMsg = String(message || '').slice(0, 500).trim()
    if (!safeMsg) return
    io.to(room).emit('chat-message-received', {
      message:   safeMsg,
      userId:    uid   || socket.userId,
      userName:  uName || socket.userName,
      timestamp: Date.now(),
    })
  })

  socket.on('toggle-hand', ({ userId: uid, isRaised }) => {
    if (!socket.roomId) return
    io.to(socket.roomId).emit('hand-raised', {
      userId:   uid || socket.userId,
      isRaised: !!isRaised,
    })
  })

  socket.on('leave-room', () => { cleanup() })

  socket.on('disconnect', (reason) => {
    log('disconnect', `${socket.userName || '?'} (${reason})`)
    cleanup()
    rateLimits.delete(socket.id)
  })

  socket.on('ping-check', () => {
    socket.emit('pong-check', { serverTs: Date.now(), instanceId: SERVER_INSTANCE_ID })
  })

  function cleanup() {
    const roomId = socket.roomId
    if (!roomId) return

    const users = rooms.get(roomId)
    if (users) {
      const updated = users.filter(u => u.socketId !== socket.id)
      if (updated.length === 0) rooms.delete(roomId)
      else rooms.set(roomId, updated)
    }

    socket.to(roomId).emit('user-left', {
      socketId: socket.id,
      userId:   socket.userId,
      userName: socket.userName,
    })

    socket.leave(roomId)
    socket.roomId   = null
    socket.userId   = null
    socket.userName = null

    log('cleanup', `removed from ${roomId}`)
  }
})

const PORT = parseInt(process.env.PORT || '5000', 10)

async function start() {
  await initRedis()
  server.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║          🚀  ELEXICO AI  —  SIGNALING SERVER  🚀             ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  Instance : ${SERVER_INSTANCE_ID.padEnd(47)}║
  ║  Port     : ${String(PORT).padEnd(47)}║
  ║  Protocol : simple-peer (mesh, max 6 users)                 ║
  ║  Events   : join-room → all-users / user-joined             ║
  ║             sending-signal  → user-signal                   ║
  ║             returning-signal → receiving-returned-signal    ║
  ║  Health   : http://localhost:${PORT}/health${' '.repeat(Math.max(0,18-String(PORT).length))}║
  ╚══════════════════════════════════════════════════════════════╝
    `)
  })
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1) })

process.on('SIGTERM', () => { server.close(() => process.exit(0)) })
process.on('SIGINT',  () => { server.close(() => process.exit(0)) })
process.on('uncaughtException',  err => { console.error('💥', err); process.exit(1) })
process.on('unhandledRejection', err => { console.error('💥', err); process.exit(1) })
