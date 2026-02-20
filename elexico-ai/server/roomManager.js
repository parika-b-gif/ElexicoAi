const SERVER_INSTANCE_ID = process.env.SERVER_INSTANCE_ID ||
  `srv-${Math.random().toString(36).slice(2, 8)}`;

console.log(`\n🏷️  SERVER INSTANCE ID: ${SERVER_INSTANCE_ID}\n`);

const rooms = new Map();

function addParticipant(roomId, userId, { socketId, userName }) {
  let isNewRoom = false;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, { participants: new Map(), createdAt: Date.now() });
    isNewRoom = true;
    console.log(`🏠 Room created: ${roomId}`);
  }

  const room = rooms.get(roomId);
  room.participants.set(userId, {
    socketId,
    userName,
    serverInstanceId: SERVER_INSTANCE_ID,
    joinedAt: Date.now(),
  });

  const participantCount = room.participants.size;
  console.log(`👤 ${userName} joined room ${roomId} (${participantCount} total on this instance)`);

  return { isNewRoom, participantCount };
}

function removeParticipant(roomId, userId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const userData = room.participants.get(userId);
  if (!userData) return null;

  room.participants.delete(userId);

  const remaining = room.participants.size;
  console.log(`👋 ${userData.userName} left room ${roomId} (${remaining} remaining on this instance)`);

  if (remaining === 0) {
    rooms.delete(roomId);
    console.log(`🗑️  Room ${roomId} deleted (empty)`);
  }

  return userData;
}

function updateParticipant(roomId, userId, updates) {
  const room = rooms.get(roomId);
  if (!room) return;
  const participant = room.participants.get(userId);
  if (!participant) return;
  Object.assign(participant, updates);
}

function isParticipantInRoom(roomId, userId) {
  return rooms.get(roomId)?.participants.has(userId) ?? false;
}

function getParticipant(roomId, userId) {
  return rooms.get(roomId)?.participants.get(userId) ?? null;
}

function getRoomParticipantsList(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.participants.entries()).map(([userId, data]) => ({
    userId,
    ...data,
  }));
}

function getRoomSize(roomId) {
  return rooms.get(roomId)?.participants.size ?? 0;
}

function getActiveRoomCount() {
  return rooms.size;
}

function getStats() {
  let totalParticipants = 0;
  const roomList = [];

  for (const [roomId, room] of rooms) {
    const count = room.participants.size;
    totalParticipants += count;
    roomList.push({
      roomId,
      participantCount: count,
      ageSeconds: Math.floor((Date.now() - room.createdAt) / 1000),
      serverInstanceId: SERVER_INSTANCE_ID,
    });
  }

  return {
    serverInstanceId: SERVER_INSTANCE_ID,
    activeRooms: rooms.size,
    totalParticipants,
    rooms: roomList,
  };
}

module.exports = {
  addParticipant,
  removeParticipant,
  updateParticipant,
  isParticipantInRoom,
  getParticipant,
  getRoomParticipantsList,
  getRoomSize,
  getActiveRoomCount,
  getStats,
  SERVER_INSTANCE_ID,
};
