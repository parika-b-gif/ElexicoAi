# Elexico AI - Client

Professional video conferencing application built with React, WebRTC, and modern UI technologies.

## Features

✨ **Core Video Features**
- Multi-party video conferencing using WebRTC mesh network
- Real-time audio/video streaming
- Screen sharing capabilities
- Individual audio/video controls

🎨 **Modern UI/UX**
- Glassmorphism design language
- Smooth animations with Framer Motion
- Responsive grid layout (adapts to participant count)
- Dark-to-indigo gradient background

🤝 **Interactive Features**
- ✋ Hand raise with visual indicators
- 😊 Emoji reactions with floating animations
- 💬 Live chat with message history
- 👥 Participant list with status indicators
- 🔴 Recording functionality (download as .webm)

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Socket.io Client** - Real-time communication
- **WebRTC** - Peer-to-peer video/audio

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the client directory:

```env
VITE_SERVER_URL=http://localhost:5000
```

## Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── MeetingRoom.jsx       # Main meeting interface
│   │   ├── VideoTile.jsx          # Individual video tile component
│   │   ├── ChatPanel.jsx          # Live chat sidebar
│   │   ├── ParticipantsPanel.jsx  # Participants list
│   │   ├── EmojiPicker.jsx        # Emoji selector
│   │   └── FloatingEmoji.jsx      # Floating emoji animation
│   ├── hooks/
│   │   ├── useWebRTC.js           # WebRTC connection management
│   │   └── useRecorder.js         # Recording functionality
│   ├── pages/
│   │   └── Home.jsx               # Landing/lobby page
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Key Components

### MeetingRoom
Main component that orchestrates the entire meeting experience. Handles:
- WebRTC connections via useWebRTC hook
- Recording via useRecorder hook
- UI state management
- Panel visibility toggling

### useWebRTC Hook
Custom hook managing all WebRTC functionality:
- Socket.io connection to signaling server
- Local media stream initialization
- Peer connection management (offer/answer/ICE)
- Audio/video/screen share controls
- Hand raise and emoji reactions
- Chat messaging

### VideoTile
Displays individual participant video with:
- Video stream or avatar fallback
- Mute/video-off indicators
- Hand raise overlay
- Screen sharing badge
- Connection quality indicator

## Glassmorphism Design

All UI elements use the glassmorphism effect:

```css
.glass {
  backdrop-blur: medium;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

## WebRTC Architecture

The application uses a **mesh network** topology where each peer connects directly to every other peer. This provides:
- Lower latency
- Better quality for small groups (2-6 participants)
- No server-side media processing

For larger groups, consider implementing SFU (Selective Forwarding Unit) architecture.

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+

**Note:** HTTPS or localhost required for camera/microphone access.

## Known Limitations

- Mesh topology may struggle with 10+ participants
- Recording captures local stream only (not mixed audio/video)
- No persistent chat history
- No breakout rooms

## Future Enhancements

- [ ] SFU architecture for scalability
- [ ] Virtual backgrounds
- [ ] Noise suppression
- [ ] Transcription/captions
- [ ] Waiting room
- [ ] Polls and Q&A
- [ ] Breakout rooms
