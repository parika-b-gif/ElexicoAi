# Quick Start Guide - Elexico AI

## Step 1: Install Dependencies

### Server Setup
```bash
cd server
npm install
```

### Client Setup
```bash
cd client
npm install
```

## Step 2: Configure Environment Variables

### Server Environment (server/.env)
Already configured with defaults:
```env
PORT=5000
NODE_ENV=development
```

### Client Environment (client/.env)
Already configured with defaults:
```env
VITE_SERVER_URL=http://localhost:5000
```

## Step 3: Start the Applications

### Terminal 1 - Start Server
```bash
cd server
npm start
```

You should see:
```
╔════════════════════════════════════════════════╗
║                                                ║
║        🚀 ELEXICO AI SERVER RUNNING 🚀        ║
║                                                ║
║        Port: 5000                              ║
║        Environment: development                ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### Terminal 2 - Start Client
```bash
cd client
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 4: Access the Application

1. Open your browser and go to: **http://localhost:3000**
2. You'll see the Elexico AI home page

## Step 5: Create Your First Meeting

### Option A: Create a New Room
1. Click **"Create New Room"** button
2. You'll be taken to the meeting room with a unique room ID
3. Allow camera and microphone permissions when prompted
4. Share the room ID with others to join

### Option B: Join an Existing Room
1. Enter a room code in the input field
2. Click **"Join Room"**
3. Allow camera and microphone permissions when prompted

## Step 6: Test Features

### Basic Controls
- 🎤 **Mute/Unmute**: Toggle your microphone
- 📹 **Camera On/Off**: Toggle your video
- 🖥️ **Screen Share**: Share your screen
- 📞 **Leave**: Exit the meeting

### Interactive Features
- ✋ **Hand Raise**: Click the hand icon to raise/lower your hand
- 😊 **Emoji Reactions**: Click the smile icon and select an emoji
- 💬 **Chat**: Click the message icon to open chat
- 👥 **Participants**: Click the users icon to see participant list
- 🔴 **Recording**: Click the circle icon to start/stop recording

## Testing with Multiple Participants

### Option 1: Multiple Browser Windows
1. Open the application in multiple browser windows/tabs
2. Use the same room ID to join from all windows
3. **Note**: Some browsers may limit camera access to one tab

### Option 2: Different Browsers
1. Open in Chrome, Firefox, Edge, etc.
2. Join the same room from each browser
3. Best for testing full functionality

### Option 3: Different Devices
1. Access from your phone, tablet, and computer
2. All devices join the same room
3. Most realistic testing scenario

## Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions (should be https:// or localhost)
- Allow camera/microphone when prompted
- Try refreshing the page

### Can't Connect to Server
- Ensure server is running on port 5000
- Check `.env` files are configured correctly
- Verify no firewall blocking connections

### Video Not Showing
- Check camera permissions in browser settings
- Ensure camera is not being used by another application
- Try different browser

### No Audio
- Check microphone permissions
- Verify microphone is not muted in system settings
- Test with browser's audio test

### Connection Issues
- Check network connectivity
- Ensure both peers can reach the signaling server
- May need TURN servers for certain networks (corporate/restrictive)

## Production Deployment Checklist

- [ ] Use HTTPS for both client and server
- [ ] Set proper CORS origins
- [ ] Implement authentication
- [ ] Add TURN servers for NAT traversal
- [ ] Enable rate limiting on server
- [ ] Add monitoring and logging
- [ ] Implement room passwords
- [ ] Set up database for persistent data
- [ ] Configure CDN for client assets
- [ ] Set up proper error tracking

## Development Tips

### Hot Reload
- Both client and server support hot reload
- Changes will reflect automatically
- Server uses nodemon (install with `npm i -g nodemon` and use `npm run dev`)

### Debugging WebRTC
- Open browser DevTools → Console
- Look for WebRTC connection logs
- Check `chrome://webrtc-internals` (Chrome) for detailed stats

### Testing Socket Events
- Use Socket.io DevTools browser extension
- Monitor events in browser console
- Check server logs for event flow

## Next Steps

1. Customize the design and branding
2. Add authentication system
3. Implement room passwords
4. Add more interactive features
5. Set up production deployment
6. Configure TURN servers
7. Add analytics and monitoring

## Helpful Commands

```bash
# Server
npm start              # Start server
npm run dev           # Start with nodemon (auto-reload)

# Client  
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Both
npm install           # Install dependencies
npm update            # Update dependencies
```

## Getting Help

- Check the main README.md for detailed documentation
- Review STRUCTURE.md for architecture overview
- Open browser DevTools console for errors
- Check server terminal for logs

---

**You're all set! Enjoy building with Elexico AI! 🚀**
