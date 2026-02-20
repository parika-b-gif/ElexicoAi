# 📚 ELEXICO AI - WEBRTC ARCHITECTURE GUIDE

## Table of Contents
- [System Architecture](#system-architecture)
- [WebRTC Flow Explained](#webrtc-flow-explained)
- [How It All Works Together](#how-it-all-works-together)
- [Key Modules](#key-modules)
- [Production Deployment](#production-deployment)

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      ELEXICO AI ARCHITECTURE                   │
└────────────────────────────────────────────────────────────────┘

┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│  Browser A  │          │  Signaling  │          │  Browser B  │
│             │          │   Server    │          │             │
│ (Client)    │◄────────►│ (Socket.io) │◄────────►│  (Client)   │
│             │  WebSocket│             │ WebSocket│             │
└─────────────┘          └─────────────┘          └─────────────┘
      │                                                    │
      │                                                    │
      │               P2P Connection                       │
      │         (After Signaling Complete)                 │
      │                                                    │
      └────────────────────────────────────────────────────┘
                  Direct Audio/Video Stream
```

### Components

#### 1. **Signaling Server** (`server/`)
- **Technology**: Node.js + Express + Socket.io
- **Purpose**: Coordinate WebRTC connections
- **Responsibilities**:
  - Room management
  - Signal relay (offers, answers, ICE candidates)
  - Participant tracking
  - Chat/emoji distribution
  - Connection cleanup

#### 2. **Client Application** (`client/`)
- **Technology**: React + Vite + WebRTC API
- **Purpose**: User interface and P2P media handling
- **Responsibilities**:
  - Establish WebRTC connections
  - Capture/display media streams
  - UI for controls and participants
  - Local recording

---

## WebRTC Flow Explained

### Phase 1: User Joins Room

```javascript
// 1. User A enters room
socket.emit('join-room', { roomId, userId, userName })

// 2. Server adds them to room
roomManager.addParticipant(roomId, userId, userData)

// 3. Server responds with existing participants
socket.emit('room-participants', [
  { userId: 'user-b', userName: 'Bob' }
])
```

### Phase 2: Connection Initialization

```javascript
// 4. User A creates peer connection for User B
const peerConnection = new RTCPeerConnection(ICE_SERVERS)

// 5. User A adds their media stream
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream)
})

// 6. User A creates OFFER
const offer = await peerConnection.createOffer()
await peerConnection.setLocalDescription(offer)

// 7. User A sends OFFER to User B via server
socket.emit('signal-send', {
  targetUserId: 'user-b',
  userId: 'user-a',
  signal: offer
})
```

### Phase 3: Connection Negotiation

```javascript
// 8. Server relays OFFER to User B
io.to(userB.socketId).emit('signal-receive', {
  userId: 'user-a',
  signal: offer
})

// 9. User B receives OFFER and creates peer connection
const peerConnection = new RTCPeerConnection(ICE_SERVERS)

// 10. User B sets remote description (the offer)
await peerConnection.setRemoteDescription(offer)

// 11. User B creates ANSWER
const answer = await peerConnection.createAnswer()
await peerConnection.setLocalDescription(answer)

// 12. User B sends ANSWER back via server
socket.emit('signal-send', {
  targetUserId: 'user-a',
  userId: 'user-b',
  signal: answer
})
```

### Phase 4: ICE Candidate Exchange

```javascript
// 13. Both peers generate ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('signal-send', {
      targetUserId: targetPeerId,
      userId: myUserId,
      signal: { candidate: event.candidate }
    })
  }
}

// 14. Both peers receive and add ICE candidates
socket.on('signal-receive', ({ userId, signal }) => {
  if (signal.candidate) {
    peerConnection.addIceCandidate(signal.candidate)
  }
})
```

### Phase 5: Connection Established! 🎉

```javascript
// 15. Connection state changes to 'connected'
peerConnection.onconnectionstatechange = () => {
  console.log('Connection state:', peerConnection.connectionState)
  // 'connected' means P2P is established!
}

// 16. Remote media stream received
peerConnection.ontrack = (event) => {
  const remoteStream = event.streams[0]
  videoElement.srcObject = remoteStream
}
```

---

## How It All Works Together

### The Complete Journey

```
USER ACTIONS           SIGNALING SERVER        WEBRTC P2P
─────────────          ────────────────        ──────────
                                
User clicks            join-room event    
"Create Room"    ───►  Server creates room     
                       Stores user info        
                                               
User B joins           user-joined event       
the room         ───►  Broadcasts to User A
                                               
User A receives              │                 Creates RTCPeerConnection
notification     ◄───────────┘                 Adds local media tracks
                                               Creates OFFER (SDP)
                                                       │
Sends OFFER      ─────────────────►            setLocalDescription(offer)
via signaling                │                        │
                             │                        ▼
                       Relays to User B         
                             │                  
User B receives    ◄─────────┘                 setRemoteDescription(offer)
OFFER                                          Creates ANSWER (SDP)
                                               setLocalDescription(answer)
                                                       │
Sends ANSWER     ─────────────────►                   │
via signaling                │                        │
                             │                        ▼
                       Relays to User A               
                             │                  setRemoteDescription(answer)
User A receives    ◄─────────┘                 
ANSWER                                         
                                               
ICE Candidates   ◄────────────────────────────► ICE Candidates
exchanged via signaling server                  P2P connection established!
                                               
                                               Video/Audio flows directly
                                               (No server in media path)
```

### Why Each Step Matters

#### Step 1: User Joins Room
**Without this**: No one knows anyone else is there. Can't start connections.

#### Step 2: Create RTCPeerConnection
**Without this**: No WebRTC connection object to manage media and network.

#### Step 3: Add Local Stream
**Without this**: Nothing to send to remote peer. Silent black video!

#### Step 4-5: Offer/Answer Exchange
**Without this**: Peers don't know each other's capabilities (codecs, formats). Can't negotiate.

#### Step 6: ICE Candidate Exchange
**Without this**: Peers can't find network path to each other. Both behind firewalls!

#### Step 7: Connection Established
**Result**: Direct peer-to-peer media flow. Low latency, no server bandwidth cost.

---

## Key Modules

### Server Modules

#### `server.js` - Main Server
- Express HTTP server setup
- Socket.io initialization
- Health check endpoints
- Graceful shutdown handling

#### `socketHandler.js` - Event Router
- All Socket.io event handlers
- Signaling message relay
- Room event broadcasting
- Comprehensive comments on signaling

#### `roomManager.js` - State Management
- Room creation/deletion
- Participant tracking
- Efficient data structures (Map)
- Memory leak prevention

### Client Modules

#### `services/webrtc.js` - WebRTC Utilities
- RTCPeerConnection helpers
- Offer/Answer creation
- ICE candidate handling
- Track management
- Detailed WebRTC explanations

#### `services/socket.js` - Signaling Client
- Socket.io connection management
- Event emitters/listeners
- Clean API for signaling
- Comprehensive signaling documentation

#### `hooks/useWebRTC.js` - Main WebRTC Hook
- Coordinates entire WebRTC flow
- Manages peer connections
- Handles media streams
- State management for UI

#### `hooks/useRecorder.js` - Recording Hook
- MediaRecorder API wrapper
- Stream merging (local + remote)
- Blob handling
- Download generation

#### `components/` - UI Components
- `MeetingRoom.jsx` - Main meeting interface
- `VideoTile.jsx` - Individual video displays
- `ChatPanel.jsx` - Real-time chat
- `EmojiPicker.jsx` - Reaction selector
- `FloatingEmoji.jsx` - Animated reactions
- `ParticipantsPanel.jsx` - Participant list
- `ScreenShareWarning.jsx` - Safety alert
- `Toast.jsx` - Notifications

---

## Production Deployment

### Environment Variables

#### Server (`.env`)
```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

#### Client (`.env`)
```env
VITE_SERVER_URL=https://api.yourdomain.com
```

### Production Considerations

#### 1. **HTTPS Required**
- Browser requires HTTPS for `getUserMedia()` (except localhost)
- Deploy both client and server with SSL certificates

#### 2. **TURN Server for Strict Firewalls**
```javascript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'password'
    }
  ]
}
```

#### 3. **Scalability**
- For 100+ concurrent users, consider:
  - Redis for room state (shared across server instances)
  - Load balancer with sticky sessions
  - Horizontal scaling of signaling servers

#### 4. **Monitoring**
- Track active rooms: `GET /stats`
- Monitor server health: `GET /health`
- Set up logging (Winston, Pino)
- Error tracking (Sentry)

#### 5. **Security**
- Rate limiting on Socket.io events
- Room ID validation
- User authentication (JWT)
- CORS configuration
- Input sanitization

#### 6. **Performance**
- Enable gzip compression
- Optimize bundle size
- Lazy load components
- Use production React build

---

## Common Issues & Solutions

### Issue: "ICE connection failed"
**Cause**: Can't establish P2P connection
**Solution**: Add TURN server to ICE configuration

### Issue: "getUserMedia() not allowed"
**Cause**: Not HTTPS or user denied permissions
**Solution**: Use HTTPS, request permissions properly

### Issue: "Infinite screen sharing mirror"
**Cause**: User selected "Entire Screen" including meeting window
**Solution**: Implemented ScreenShareWarning component with detection

### Issue: "Memory leak over time"
**Cause**: Peer connections not closed on disconnect
**Solution**: Always call `peerConnection.close()` in cleanup

### Issue: "Echo/feedback in audio"
**Cause**: Audio from speakers being picked up by microphone
**Solution**: Use headphones, enable `echoCancellation: true`

---

## Testing

### Local Testing
```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev

# Open two browser windows:
# Window 1: http://localhost:3000
# Window 2: http://localhost:3000 (incognito)
```

### Multi-Device Testing
1. Find your local IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
2. Update `.env` files with your IP
3. Access from phone/tablet on same network

---

## Architecture Benefits

✅ **Modular**: Easy to maintain and extend
✅ **Scalable**: Can handle multiple rooms and users
✅ **Production-Ready**: Error handling, cleanup, security
✅ **Well-Documented**: Comprehensive comments explaining WebRTC
✅ **Clean Code**: Separation of concerns, clear structure
✅ **Responsive**: Works on mobile and desktop
✅ **Feature-Rich**: Chat, emojis, recording, screen share

---

## Next Steps for Production

1. **Add Authentication**: Firebase Auth or JWT
2. **Persistent Rooms**: Store room data in database
3. **Recording Storage**: Upload to AWS S3/Cloud Storage
4. **Analytics**: Track usage, connection quality
5. **Room Passwords**: Private meetings
6. **Whiteboard**: Canvas-based drawing tool
7. **File Sharing**: WebRTC Data Channels
8. **Virtual Backgrounds**: TensorFlow.js segmentation

---

## Resources

- [WebRTC Basics](https://webrtc.org/getting-started/overview)
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [STUN/TURN Servers](https://www.twilio.com/docs/stun-turn)

---

**Built with ❤️ for production use**
