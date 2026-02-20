# 🎥 Elexico AI - Professional Video Conferencing Platform

A modern, full-stack video conferencing application with real-time communication, built using WebRTC, React, Node.js, and Socket.io. Features a stunning glassmorphism UI design.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green)
![Tech Stack](https://img.shields.io/badge/WebRTC-Enabled-orange)
![Tech Stack](https://img.shields.io/badge/Socket.io-4.6-black)

## 🌟 Features

### 🎬 Core Video Features
- **Multi-party Video Calls** - Connect with multiple participants simultaneously
- **High-Quality Audio/Video** - 720p video with echo cancellation
- **Screen Sharing** - Share your screen with all participants
- **Individual Controls** - Toggle audio/video independently

### 🎨 Beautiful UI/UX
- **Glassmorphism Design** - Modern, frosted-glass aesthetic
- **Smooth Animations** - Powered by Framer Motion
- **Responsive Layout** - Adapts to any screen size and participant count
- **Dark Theme** - Easy on the eyes with gradient backgrounds

### 🤝 Interactive Features
- **Hand Raise** 🙋 - Get attention without interrupting
- **Emoji Reactions** 😊 - Express yourself with floating emojis
- **Live Chat** 💬 - Text messaging alongside video
- **Recording** 🔴 - Record and download your meetings

## 🏗️ Architecture

```
elexico-ai/
├── server/              # Backend signaling server
│   ├── server.js        # Socket.io + Express server
│   └── package.json
│
└── client/              # Frontend React application
    ├── src/
    │   ├── components/  # React components
    │   ├── hooks/       # Custom React hooks
    │   └── pages/       # Page components
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd elexico-ai
```

2. **Setup Backend Server**
```bash
cd server
npm install
npm start
```

Server will run on `http://localhost:5000`

3. **Setup Frontend Client**
```bash
cd client
npm install
npm run dev
```

Client will run on `http://localhost:3000`

4. **Open in Browser**
```
Navigate to http://localhost:3000
```

## 📋 Environment Configuration

### Server (.env)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```env
VITE_SERVER_URL=http://localhost:5000
```

## 🎯 Usage

1. **Create a Room**: Click "Create New Room" on the home page
2. **Join a Room**: Enter a room code and click "Join Room"
3. **Share Room Code**: Share the room ID with others to join
4. **Controls**:
   - 🎤 Mute/Unmute microphone
   - 📹 Turn camera on/off
   - 🖥️ Share screen
   - ✋ Raise hand
   - 😊 Send emoji reactions
   - 💬 Open chat
   - 👥 View participants
   - 🔴 Record meeting
   - 📞 Leave call

## 🔧 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Socket.io Client** - WebSocket client
- **WebRTC** - Peer-to-peer communication

## 🏛️ WebRTC Architecture

This application uses a **mesh network topology**:
- Each peer connects directly to every other peer
- Best for small to medium groups (2-8 participants)
- Low latency and high quality
- No media server processing required

### Signaling Flow

1. User joins room → Server notifies existing participants
2. Initiating peer creates offer → Sends via Socket.io
3. Receiving peer creates answer → Sends back via Socket.io
4. ICE candidates exchanged → P2P connection established
5. Media streams flow directly between peers

## 📊 API Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{roomId, userId, userName}` | Join a room |
| `signal-send` | `{targetUserId, signal, userId}` | Send WebRTC signal |
| `toggle-hand` | `{userId, isRaised}` | Toggle hand raise |
| `emoji-reaction` | `{userId, emoji, userName}` | Send emoji |
| `chat-message` | `{userId, userName, message}` | Send chat message |
| `leave-room` | `{userId}` | Leave room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `room-participants` | `[{userId, userName, ...}]` | List of participants |
| `user-joined` | `{userId, userName, socketId}` | New user joined |
| `signal-receive` | `{userId, signal}` | Receive WebRTC signal |
| `hand-raised` | `{userId, isRaised, userName}` | Hand raise update |
| `emoji-received` | `{userId, emoji, userName, timestamp}` | Emoji broadcast |
| `chat-message-received` | `{userId, userName, message, timestamp}` | Chat message |
| `user-left` | `{userId, userName}` | User left room |

## 🎨 Design System

### Glassmorphism

All UI elements follow the glassmorphism design pattern:

```css
backdrop-blur-md
bg-white/10
border border-white/20
shadow-xl
```

### Color Palette

- **Background**: Deep dark to indigo gradient (`from-gray-900 via-purple-900 to-indigo-900`)
- **Primary**: Indigo (`indigo-600`)
- **Accent**: Purple to Indigo gradient
- **Surface**: White with 10% opacity
- **Border**: White with 20% opacity

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14.1+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |

**Note**: HTTPS or localhost required for camera/microphone access.

## 🔒 Security Considerations

- WebRTC connections are encrypted by default (DTLS-SRTP)
- Signaling server should use WSS in production
- Implement authentication for production use
- Consider TURN servers for NAT traversal
- Validate all socket events on the server

## 🚧 Known Limitations

- Mesh topology may struggle with 10+ participants (consider SFU)
- Recording only captures local stream
- No persistent chat/message history
- No waiting room or moderator controls

## 🔮 Future Enhancements

- [ ] SFU architecture for better scalability
- [ ] Virtual backgrounds and filters
- [ ] AI-powered noise suppression
- [ ] Live transcription and captions
- [ ] Waiting room and admission controls
- [ ] Polls, Q&A, and interactive features
- [ ] Breakout rooms
- [ ] Cloud recording
- [ ] Meeting analytics

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using React, Node.js, and WebRTC**
