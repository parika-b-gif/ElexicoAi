const {
  addParticipant,
  removeParticipant,
  getParticipant,
  getRoomParticipantsList,
  SERVER_INSTANCE_ID,
} = require('./roomManager');

const rateLimitState = new Map();

const RATE_LIMITS = {
  emoji:  { maxCount: 5,  windowMs: 1000 },
  chat:   { maxCount: 2,  windowMs: 1000 },
  signal: { maxCount: 20, windowMs: 1000 },
};

function checkRateLimit(socketId, eventType) {
  if (!rateLimitState.has(socketId)) {
    rateLimitState.set(socketId, { emoji: [], chat: [], signal: [] });
  }
  const state = rateLimitState.get(socketId);
  const { maxCount, windowMs } = RATE_LIMITS[eventType];
  const now = Date.now();
  state[eventType] = state[eventType].filter(t => now - t < windowMs);
  if (state[eventType].length >= maxCount) return false;
  state[eventType].push(now);
  return true;
}

function cleanupRateLimit(socketId) {
  rateLimitState.delete(socketId);
}

function log(socketId, event, msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] [${SERVER_INSTANCE_ID}] [${socketId.slice(0,6)}] ${event}: ${msg}`);
}

function handleLeaveRoom(socket, io) {
  const { roomId, userId, userName } = socket;
  if (!roomId || !userId) return;

  removeParticipant(roomId, userId);
  socket.leave(roomId);

  socket.to(roomId).emit('user-left', { userId, userName, socketId: socket.id });

  socket.roomId   = null;
  socket.userId   = null;
  socket.userName = null;
}

function registerSocketHandlers(socket, io) {

  log(socket.id, 'connect', `from ${socket.handshake.address}`);

  socket.on('join-room', ({ roomId, userId, userName }) => {

    if (!roomId || typeof roomId !== 'string' || roomId.length > 64) {
      socket.emit('error', { message: 'Invalid roomId' });
      return;
    }
    if (!userId || typeof userId !== 'string' || userId.length > 64) {
      socket.emit('error', { message: 'Invalid userId' });
      return;
    }
    const safeName = String(userName || 'Anonymous').slice(0, 32);

    log(socket.id, 'join-room', `${safeName} → room ${roomId}`);

    if (socket.roomId && socket.roomId !== roomId) {
      handleLeaveRoom(socket, io);
    }

    socket.roomId   = roomId;
    socket.userId   = userId;
    socket.userName = safeName;

    socket.join(roomId);
    addParticipant(roomId, userId, { socketId: socket.id, userName: safeName });

    const existingParticipants = getRoomParticipantsList(roomId)
      .filter(p => p.userId !== userId);

    socket.emit('room-participants', existingParticipants);

    socket.to(roomId).emit('user-joined', {
      userId,
      userName: safeName,
      socketId: socket.id,
    });

    log(socket.id, 'join-room', `${safeName} in, ${existingParticipants.length} pre-existing peers`);
  });

  socket.on('signal-send', ({ targetUserId, userId: senderId, signal }) => {

    if (!checkRateLimit(socket.id, 'signal')) return;

    if (!targetUserId || !signal) return;

    const target = getParticipant(socket.roomId, targetUserId);
    const targetSocketId = target?.socketId;

    if (!targetSocketId) {
      log(socket.id, 'signal-send', `⚠️  no socket found for userId ${targetUserId.slice(0,6)}`);
      return;
    }

    log(socket.id, 'signal-send', `→ ${targetSocketId.slice(0,6)} (${signal.type || 'candidate'})`);

    io.to(targetSocketId).emit('signal-receive', {
      userId: socket.userId,
      signal,
    });
  });

  socket.on('emoji-reaction', ({ emoji, roomId, userId: uid, userName: uName }) => {

    if (!checkRateLimit(socket.id, 'emoji')) {
      log(socket.id, 'emoji-reaction', 'rate limited - drop');
      return;
    }

    const targetRoom = roomId || socket.roomId;
    if (!targetRoom) return;

    log(socket.id, 'emoji-reaction', `${emoji} in ${targetRoom}`);

    io.to(targetRoom).emit('emoji-received', {
      emoji,
      userId:    uid    || socket.userId,
      userName:  uName  || socket.userName,
      timestamp: Date.now(),
    });
  });

  socket.on('chat-message', ({ message, roomId, userId: uid, userName: uName }) => {

    if (!checkRateLimit(socket.id, 'chat')) {
      socket.emit('rate-limited', { event: 'chat-message', retryAfterMs: 1000 });
      return;
    }

    const targetRoom = roomId || socket.roomId;
    if (!targetRoom) return;

    const safeMsg = String(message || '').slice(0, 500).trim();
    if (!safeMsg) return;

    log(socket.id, 'chat-message', `"${safeMsg.slice(0, 40)}" in ${targetRoom}`);

    io.to(targetRoom).emit('chat-message-received', {
      message:   safeMsg,
      userId:    uid   || socket.userId,
      userName:  uName || socket.userName,
      timestamp: Date.now(),
    });
  });

  socket.on('toggle-hand', ({ userId: uid, isRaised }) => {
    const targetRoom = socket.roomId;
    if (!targetRoom) return;

    log(socket.id, 'toggle-hand', `${uid} isRaised=${isRaised}`);

    io.to(targetRoom).emit('hand-raised', {
      userId:   uid || socket.userId,
      isRaised: !!isRaised,
    });
  });

  // Host controls
  socket.on('host:mute-all', ({ roomId }) => {
    const targetRoom = roomId || socket.roomId;
    if (!targetRoom) return;

    log(socket.id, 'host:mute-all', `muting all in ${targetRoom}`);

    // Broadcast to all participants except the host
    socket.to(targetRoom).emit('force-mute', {
      fromHost: socket.userId,
      timestamp: Date.now(),
    });
  });

  socket.on('host:remove-participant', ({ roomId, peerId }) => {
    const targetRoom = roomId || socket.roomId;
    if (!targetRoom || !peerId) return;

    log(socket.id, 'host:remove-participant', `removing ${peerId.slice(0,6)} from ${targetRoom}`);

    const participant = getParticipant(targetRoom, peerId);
    if (participant?.socketId) {
      const targetSocket = io.sockets.sockets.get(participant.socketId);
      if (targetSocket) {
        targetSocket.emit('removed-by-host', {
          reason: 'Host removed you from the meeting',
        });
        targetSocket.disconnect(true);
      }
    }
  });

  socket.on('host:lock-meeting', ({ roomId }) => {
    const targetRoom = roomId || socket.roomId;
    if (!targetRoom) return;

    log(socket.id, 'host:lock-meeting', `locking ${targetRoom}`);

    // Store lock state in room metadata (you may want to use roomManager for this)
    // For now, broadcast to all participants
    io.to(targetRoom).emit('meeting-locked', {
      locked: true,
      byHost: socket.userId,
    });
  });

  socket.on('host:unlock-meeting', ({ roomId }) => {
    const targetRoom = roomId || socket.roomId;
    if (!targetRoom) return;

    log(socket.id, 'host:unlock-meeting', `unlocking ${targetRoom}`);

    // Clear lock state
    io.to(targetRoom).emit('meeting-locked', {
      locked: false,
      byHost: socket.userId,
    });
  });

  socket.on('leave-room', () => {
    log(socket.id, 'leave-room', `${socket.userName} leaving ${socket.roomId}`);
    handleLeaveRoom(socket, io);
  });

  socket.on('disconnect', (reason) => {
    log(socket.id, 'disconnect', `${socket.userName || '?'} (${reason})`);
    handleLeaveRoom(socket, io);
    cleanupRateLimit(socket.id);
  });

  socket.on('ping-check', () => {
    socket.emit('pong-check', { serverTs: Date.now(), instanceId: SERVER_INSTANCE_ID });
  });
}

module.exports = { registerSocketHandlers };
