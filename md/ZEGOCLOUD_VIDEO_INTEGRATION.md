# ZEGOCLOUD Video Integration

This document explains the ZEGOCLOUD Video integration for PayBridge's video calling feature.

## 🎥 **Overview**

PayBridge now uses ZEGOCLOUD Video for reliable, high-quality video calls. This provides:

- **Reliable long-distance calls**: Works across different networks and firewalls
- **Better connection quality**: ZEGOCLOUD's global infrastructure ensures stable connections
- **Automatic fallback**: Handles network issues gracefully with backup servers
- **Scalable**: Can handle multiple concurrent calls
- **Low latency**: Optimized for real-time communication

## 🔧 **Technical Implementation**

### **Backend Setup**

#### **1. ZEGOCLOUD Configuration (`backend/config/zegocloud.js`)**
```javascript
const crypto = require('crypto');

// ZEGOCLOUD credentials
const APP_ID = 900282506;
const SERVER_SECRET = '85a0d227b8c9c854ac8fbf7e5b050e30';
const SERVER_URL = 'wss://webliveroom900282506-api.coolzcloud.com/ws';
const BACKUP_SERVER_URL = 'wss://webliveroom900282506-api-bak.coolzcloud.com/ws';
const CALLBACK_SECRET = '4d0f0796f952852b2a165f68d26464dd';
```

#### **2. Token Generation (`backend/routes/video.js`)**
```javascript
// Generate ZEGOCLOUD video token
router.post('/token', jwtAuth, async (req, res) => {
  const { roomId } = req.body;
  const zegoUserId = generateUserId(userName, userId);
  const token = generateZegoToken(zegoUserId, roomId);
  
  res.json({ token, userId: zegoUserId, roomId, appId, serverUrl });
});
```

#### **3. Socket Handlers (`backend/utils/socketHandlers.js`)**
```javascript
// ZEGOCLOUD Video Call Signaling
socket.on('video_call_started', (data) => {
  socket.to(roomId).emit('video_call_started', {
    fromUserId: socket.userId,
    fromUserName: socket.userName
  });
});
```

### **Frontend Implementation**

#### **1. ZEGOCLOUD Video Client (`frontend/src/features/rooms/RoomViewPage.tsx`)**
```typescript
import ZegoExpressEngine from 'zego-express-engine-webrtc';

// Generate token from backend
const tokenData = await generateToken(roomId);

// Initialize ZEGOCLOUD engine
const engine = await initializeZegoEngine(tokenData.appId, tokenData.serverUrl);

// Login to room
const loginResult = await engine.loginRoom(tokenData.roomId, tokenData.token, {
  userID: tokenData.userId,
  userName: user.name
});
```

#### **2. Video Call State Management**
```typescript
// ZEGOCLOUD Video call state
const [localStream, setLocalStream] = useState<MediaStream | null>(null);
const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
const [zegoEngine, setZegoEngine] = useState<any>(null);
const [zegoToken, setZegoToken] = useState<string>('');
const [zegoUserId, setZegoUserId] = useState<string>('');
```

## 🚀 **How It Works**

### **1. Starting a Video Call**
1. User clicks video call button
2. Frontend requests token from backend (`/video/token`)
3. Backend generates ZEGOCLOUD token with user identity and room name
4. Frontend initializes ZEGOCLOUD engine with app ID and server URL
5. Frontend logs into ZEGOCLOUD room using the token
6. Frontend starts publishing local stream
7. Socket.IO notifies other users about the call
8. Other users receive incoming call notification

### **2. Accepting a Call**
1. User receives incoming call notification
2. User clicks accept
3. Frontend generates token and connects to same ZEGOCLOUD room
4. Frontend starts publishing local stream
5. Both users are now connected via ZEGOCLOUD's infrastructure

### **3. During the Call**
- **Local video**: User's camera feed
- **Remote video**: Other participant's camera feed
- **Controls**: Mute, video toggle, camera switching, end call
- **Connection status**: Real-time connection quality

### **4. Ending the Call**
1. User clicks end call button
2. Frontend stops publishing stream
3. Frontend logs out from ZEGOCLOUD room
4. Frontend destroys ZEGOCLOUD engine
5. Socket.IO notifies other users
6. Other users automatically disconnect

## 🔑 **ZEGOCLOUD Credentials**

### **Current Setup**
- **App ID**: `900282506`
- **Server Secret**: `85a0d227b8c9c854ac8fbf7e5b050e30`
- **Server URL**: `wss://webliveroom900282506-api.coolzcloud.com/ws`
- **Backup Server URL**: `wss://webliveroom900282506-api-bak.coolzcloud.com/ws`
- **Callback Secret**: `4d0f0796f952852b2a165f68d26464dd`

### **Security Notes**
- Credentials are stored in backend configuration
- Tokens are generated server-side for security
- Each user gets a unique identity in the room
- Tokens expire automatically (1 hour by default)

## 📱 **Features**

### **Video Call Features**
- ✅ **High-quality video**: Up to 720p resolution
- ✅ **Crystal clear audio**: Opus codec with noise suppression
- ✅ **Camera switching**: Switch between multiple cameras
- ✅ **Mute/unmute**: Audio control during calls
- ✅ **Video on/off**: Camera control during calls
- ✅ **Connection status**: Real-time connection quality
- ✅ **Automatic reconnection**: Handles network issues
- ✅ **Backup servers**: Automatic failover

### **UI Features**
- ✅ **Incoming call overlay**: WhatsApp-style call interface
- ✅ **Video controls**: Easy-to-use call controls
- ✅ **Local video preview**: Picture-in-picture view
- ✅ **Remote video display**: Main video area
- ✅ **Connection indicator**: Shows call status

## 🛠 **Troubleshooting**

### **Common Issues**

#### **1. Token Generation Failed**
- Check ZEGOCLOUD credentials in `backend/config/zegocloud.js`
- Verify account has video capabilities enabled
- Check network connectivity to ZEGOCLOUD

#### **2. Camera Not Working**
- Ensure camera permissions are granted
- Check if camera is being used by another application
- Try refreshing the page

#### **3. Audio Issues**
- Check microphone permissions
- Verify audio device selection
- Test with different browsers

#### **4. Connection Problems**
- Check internet connection
- Verify firewall settings
- Try different network (mobile vs WiFi)
- Check if backup server is accessible

### **Error Messages**
- **"Failed to generate video token"**: Backend token generation issue
- **"Camera access denied"**: Browser permissions issue
- **"Connection failed"**: Network or ZEGOCLOUD service issue
- **"Room not found"**: Invalid room ID
- **"Login failed"**: Token or room access issue

## 🔮 **Future Enhancements**

### **Planned Features**
- **Group video calls**: Multiple participants
- **Screen sharing**: Desktop sharing capability
- **Recording**: Call recording (optional)
- **Background blur**: Privacy enhancement
- **Virtual backgrounds**: Custom backgrounds
- **Call scheduling**: Scheduled meetings

### **Advanced Features**
- **AI noise cancellation**: Better audio quality
- **Video filters**: Real-time effects
- **Call analytics**: Usage statistics
- **Integration**: Calendar integration
- **Notifications**: Call alerts
- **Archiving**: Call history

## 📊 **Performance**

### **Bandwidth Requirements**
- **Minimum**: 100 kbps upload/download
- **Recommended**: 1 Mbps upload/download
- **HD Quality**: 2+ Mbps upload/download

### **Device Support**
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Tablets**: iPad, Android tablets

## 🔒 **Security & Privacy**

### **Encryption**
- **End-to-end encryption**: All video/audio encrypted
- **Secure signaling**: HTTPS for all communications
- **Token-based access**: Secure room access
- **No recording**: Calls not stored by default

### **Privacy Features**
- **Permission-based access**: User controls camera/mic
- **Mute options**: Audio privacy during calls
- **Video toggle**: Visual privacy during calls
- **End call anytime**: User control over calls

## 🎯 **Usage Examples**

### **Business Meeting**
1. **Create room** for meeting
2. **Start video call** with 📹 button
3. **Share screen** for presentations (future)
4. **Record meeting** for later review (future)
5. **End call** when finished

### **Client Consultation**
1. **Join client room**
2. **Start video call** for face-to-face
3. **Share documents** via chat
4. **Use AI assistant** for validation
5. **End call** and follow up

### **Team Collaboration**
1. **Create team room**
2. **Start group video call** (future)
3. **Share work progress**
4. **Collaborate in real-time**
5. **End call** when done

## 📞 **Support**

For issues with ZEGOCLOUD Video integration:

1. **Check logs**: Backend console for errors
2. **Test token generation**: Verify `/video/token` endpoint
3. **Check browser console**: Frontend errors
4. **Verify credentials**: ZEGOCLOUD account status
5. **Contact support**: For persistent issues

## 🔧 **Configuration**

### **Token Expiration**
```javascript
// Default token expiration (1 hour)
const expireTime = 3600;

// Custom expiration (e.g., 2 hours)
const expireTime = 7200;
```

### **Server URLs**
```javascript
// Primary server
const SERVER_URL = 'wss://webliveroom900282506-api.coolzcloud.com/ws';

// Backup server (automatic failover)
const BACKUP_SERVER_URL = 'wss://webliveroom900282506-api-bak.coolzcloud.com/ws';
```

### **User ID Generation**
```javascript
// Unique user ID for each session
const generateUserId = (userName, userId) => {
  return `${userName}_${userId}_${Date.now()}`;
};
``` 