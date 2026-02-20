# Elexico AI - Backend Server

WebRTC signaling server for Elexico AI video conferencing application.

## Features

- 🔌 Socket.io for real-time signaling
- 🎯 Room-based architecture
- 👥 Multi-participant support
- ✋ Hand raise functionality
- 😊 Emoji reactions
- 💬 Live chat
- 🔴 Recording state management

## Installation

```bash
npm install
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the server directory:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Socket Events

### Client → Server

- `join-room` - Join a video conference room
- `signal-send` - Send WebRTC signal to peer
- `toggle-hand` - Raise/lower hand
- `emoji-reaction` - Send emoji reaction
- `chat-message` - Send chat message
- `recording-state` - Update recording status
- `leave-room` - Leave the room

### Server → Client

- `room-participants` - List of existing participants
- `user-joined` - New user joined notification
- `signal-receive` - Receive WebRTC signal
- `hand-raised` - Hand raise state change
- `emoji-received` - Emoji reaction broadcast
- `chat-message-received` - Chat message broadcast
- `recording-state-update` - Recording state change
- `user-left` - User left notification

## API Endpoints

- `GET /health` - Health check endpoint

## Architecture

The server maintains rooms in memory using a Map structure:
- Each room contains participants
- Each participant has: socketId, userName, isHandRaised, joinedAt
- Automatic cleanup of empty rooms
