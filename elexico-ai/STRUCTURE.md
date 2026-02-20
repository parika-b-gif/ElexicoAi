# Project Structure

```
elexico-ai/
│
├── server/                          # Backend Signaling Server
│   ├── server.js                    # Main server file with Socket.io
│   ├── package.json                 # Server dependencies
│   ├── .env                         # Server environment variables
│   ├── .gitignore
│   └── README.md                    # Server documentation
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # React Components
│   │   │   ├── MeetingRoom.jsx      # Main meeting interface
│   │   │   ├── VideoTile.jsx        # Individual video tile
│   │   │   ├── ChatPanel.jsx        # Chat sidebar
│   │   │   ├── ParticipantsPanel.jsx # Participants list
│   │   │   ├── EmojiPicker.jsx      # Emoji selector
│   │   │   └── FloatingEmoji.jsx    # Floating emoji animation
│   │   ├── hooks/                   # Custom React Hooks
│   │   │   ├── useWebRTC.js         # WebRTC connection logic
│   │   │   └── useRecorder.js       # Recording functionality
│   │   ├── pages/                   # Page Components
│   │   │   └── Home.jsx             # Landing/lobby page
│   │   ├── App.jsx                  # App router
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML template
│   ├── package.json                 # Client dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js            # PostCSS config
│   ├── .env                         # Client environment variables
│   ├── .gitignore
│   └── README.md                    # Client documentation
│
└── README.md                        # Main project documentation
```

## Component Hierarchy

```
App
├── Home (Landing Page)
│   └── Join/Create Room Controls
│
└── MeetingRoom (Main Meeting Interface)
    ├── Header
    │   ├── Logo
    │   ├── Room Info
    │   └── Recording Indicator
    │
    ├── Video Grid
    │   ├── VideoTile (Local)
    │   └── VideoTile[] (Remote Peers)
    │
    ├── Side Panels (Conditional)
    │   ├── ChatPanel
    │   └── ParticipantsPanel
    │
    ├── Control Bar
    │   ├── Audio Toggle
    │   ├── Video Toggle
    │   ├── Screen Share
    │   ├── Hand Raise
    │   ├── EmojiPicker
    │   ├── Recording Toggle
    │   ├── Chat Toggle
    │   ├── Participants Toggle
    │   └── Leave Button
    │
    └── FloatingEmoji[] (Overlay)
```

## Data Flow

```
Socket.io Server
      ↕
useWebRTC Hook
      ↕
MeetingRoom Component
      ↓
Child Components (VideoTile, ChatPanel, etc.)
```

## Key Files Explained

### Backend

- **server.js**: Main signaling server handling WebRTC signaling, room management, and real-time events

### Frontend

- **useWebRTC.js**: Core WebRTC logic including peer connections, media streams, and signaling
- **useRecorder.js**: MediaRecorder API implementation for local recording
- **MeetingRoom.jsx**: Main meeting interface orchestrating all features
- **VideoTile.jsx**: Reusable component for displaying participant video
- **ChatPanel.jsx**: Real-time chat interface
- **ParticipantsPanel.jsx**: Participant list with status indicators

## Technology Dependencies

### Server
- express: ^4.18.2
- socket.io: ^4.6.1
- cors: ^2.8.5
- dotenv: ^16.0.3

### Client
- react: ^18.2.0
- react-router-dom: ^6.21.0
- socket.io-client: ^4.6.1
- lucide-react: ^0.309.0
- framer-motion: ^11.0.0
- tailwindcss: ^3.4.0
- uuid: ^9.0.1
