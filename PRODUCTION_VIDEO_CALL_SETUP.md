# Production Video Call Setup Guide

## 🎥 **Current Status**

The video call feature has been implemented with ZEGOCLOUD integration, but there are some TypeScript issues that need to be resolved for production deployment.

## 🔧 **Issues to Fix**

### **1. ZEGOCLOUD SDK Import Issues**
- TypeScript errors with ZEGOCLOUD SDK import
- Need to properly configure types for the ZEGOCLOUD SDK

### **2. API Method Names**
- The ZEGOCLOUD SDK method names may be different from what's currently used
- Need to verify the correct API calls

## 🚀 **Production Deployment Steps**

### **Step 1: Fix ZEGOCLOUD SDK Integration**

1. **Install ZEGOCLOUD SDK properly:**
```bash
cd frontend
npm install zego-express-engine-webrtc@latest
```

2. **Create a type declaration file:**
Create `frontend/src/types/zego-express-engine-webrtc.d.ts`:
```typescript
declare module 'zego-express-engine-webrtc' {
  export default class ZegoExpressEngine {
    static createEngine(config: any): any;
    static createEngineWithProfile(config: any): any;
    
    loginRoom(roomID: string, token: string, user: any): Promise<any>;
    startPublishingStream(streamID: string, config?: any): Promise<any>;
    startPlayingStream(streamID: string, config?: any): Promise<any>;
    stopPublishingStream(streamID: string): void;
    stopPlayingStream(streamID: string): void;
    logoutRoom(): void;
    destroyEngine(): void;
    getLocalStream(): Promise<MediaStream>;
    getRemoteStream(streamID: string): Promise<MediaStream>;
    
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
  }
}
```

### **Step 2: Update RoomViewPage.tsx**

Replace the ZEGOCLOUD engine initialization with the correct API:

```typescript
// Initialize ZEGOCLOUD Engine
const initializeZegoEngine = async (appId: number, serverUrl: string) => {
  try {
    console.log('Initializing ZEGOCLOUD engine with appId:', appId, 'serverUrl:', serverUrl);
    
    // Create ZEGOCLOUD engine instance
    const engine = ZegoExpressEngine.createEngine({
      appID: appId,
      server: serverUrl,
      scenario: 3 // Communication mode
    });
    
    // Set up event listeners
    engine.on('roomStateUpdate', (roomID: string, state: string, errorCode: number, extendedData: any) => {
      console.log('Room state update:', { roomID, state, errorCode, extendedData });
      if (state === 'CONNECTED') {
        setConnectionStatus('connected');
      } else if (state === 'DISCONNECTED') {
        setConnectionStatus('disconnected');
      }
    });

    engine.on('publisherStateUpdate', (streamID: string, state: string, errorCode: number, extendedData: any) => {
      console.log('Publisher state update:', { streamID, state, errorCode, extendedData });
    });

    engine.on('playerStateUpdate', (streamID: string, state: string, errorCode: number, extendedData: any) => {
      console.log('Player state update:', { streamID, state, errorCode, extendedData });
      if (state === 'PLAYING') {
        setConnectionStatus('connected');
      }
    });

    // Handle remote stream addition
    engine.on('roomStreamUpdate', (roomID: string, updateType: string, streamList: any[], extendedData: any) => {
      console.log('Room stream update:', { roomID, updateType, streamList, extendedData });
      
      if (updateType === 'ADD') {
        // New stream added - start playing it
        streamList.forEach(async (streamInfo) => {
          if (streamInfo.streamID !== zegoUserId) { // Don't play our own stream
            console.log('Starting to play remote stream:', streamInfo.streamID);
            setRemoteStreamID(streamInfo.streamID);
            
            try {
              const result = await engine.startPlayingStream(streamInfo.streamID, {
                audio: true,
                video: true
              });
              
              if (result.code === 0) {
                console.log('Successfully started playing remote stream');
              } else {
                console.error('Failed to start playing remote stream:', result);
              }
            } catch (error) {
              console.error('Error starting remote stream:', error);
            }
          }
        });
      } else if (updateType === 'DELETE') {
        // Stream removed
        streamList.forEach((streamInfo) => {
          if (streamInfo.streamID === remoteStreamID) {
            console.log('Remote stream removed:', streamInfo.streamID);
            setRemoteStream(null);
            setRemoteStreamID('');
          }
        });
      }
    });

    // Handle remote stream media
    engine.on('playerRecvVideoFirstFrame', (streamID: string) => {
      console.log('Received first video frame from:', streamID);
      // Get the remote stream and attach to video element
      if (remoteVideoRef.current) {
        engine.getRemoteStream(streamID).then((stream) => {
          if (stream) {
            console.log('Got remote stream for video element:', stream);
            setRemoteStream(stream);
            remoteVideoRef.current!.srcObject = stream;
          }
        }).catch((error) => {
          console.error('Error getting remote stream:', error);
        });
      }
    });

    setZegoEngine(engine);
    return engine;
  } catch (error) {
    console.error('Error initializing ZEGOCLOUD engine:', error);
    throw error;
  }
};
```

### **Step 3: Test Video Call Functionality**

1. **Start the backend server:**
```bash
cd backend
npm start
```

2. **Start the frontend:**
```bash
cd frontend
npm start
```

3. **Test the video call:**
- Open the application in two different browsers or incognito windows
- Create a room and join it from both browsers
- Click the video call button to start a call
- Check if remote video is visible

### **Step 4: Production Deployment**

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Deploy to your hosting platform:**
- Upload the `build` folder to your web server
- Ensure HTTPS is enabled (required for camera access)

3. **Configure environment variables:**
- Set `BACKEND_BASE_URL` to your production backend URL
- Ensure CORS is properly configured

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Camera not working:**
   - Check browser permissions
   - Ensure HTTPS is enabled
   - Test with different browsers

2. **Remote video not showing:**
   - Check ZEGOCLOUD credentials
   - Verify token generation
   - Check network connectivity

3. **Connection issues:**
   - Check firewall settings
   - Verify ZEGOCLOUD server URLs
   - Test with different networks

### **Debug Steps:**

1. **Check browser console for errors**
2. **Verify ZEGOCLOUD token generation**
3. **Test with the VideoCallTest component**
4. **Check network connectivity to ZEGOCLOUD servers**

## 📋 **Checklist for Production**

- [ ] ZEGOCLOUD SDK properly installed
- [ ] TypeScript errors resolved
- [ ] Video call functionality tested
- [ ] Remote video visible
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Performance optimized

## 🎯 **Expected Result**

After completing these steps, you should have:
- ✅ Working video calls between users
- ✅ Remote user video visible
- ✅ Proper error handling
- ✅ Production-ready deployment
- ✅ Cross-browser compatibility

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify ZEGOCLOUD credentials
3. Test with the VideoCallTest component
4. Check network connectivity
5. Review the troubleshooting section above

The video call feature should work properly in production once the TypeScript issues are resolved and the correct ZEGOCLOUD API methods are used. 