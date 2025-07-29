import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../../api/config';
import { useSocket } from '../../contexts/SocketContext';
import Chatbox from '../../components/rooms/Chatbox';
import WorkStatusPanel from '../../components/rooms/WorkStatusPanel';
import DisputeChatbot from '../../components/rooms/DisputeChatbot';
import styles from './RoomViewPage.module.css';

// Interfaces
interface RoomData {
  _id: string;
  buyerId?: any;
  sellerId?: any;
  status: string;
  transactionId?: string;
  createdAt: string;
}
interface User { id: string; name: string; email: string; role: string; }
interface RoomViewPageProps { darkMode?: boolean; }

const RoomViewPage: React.FC<RoomViewPageProps> = ({ darkMode = false }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Simplified video call state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<{fromUserId: string, fromUserName: string, offer: RTCSessionDescriptionInit} | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  
  // Work status and camera state
  const [showDisputeChatbot, setShowDisputeChatbot] = useState(false);
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>();
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Safely attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await fetch(`${BACKEND_BASE_URL}/auth/me`, { credentials: 'include' });
        if (userResponse.ok) setUser(await userResponse.json());

        if (roomId) {
            const roomResponse = await fetch(`${BACKEND_BASE_URL}/dashboard/rooms/${roomId}`, { credentials: 'include' });
            if (!roomResponse.ok) throw new Error('Failed to fetch room details');
            setRoom(await roomResponse.json());
        }

        await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        setCameraDevices(cameras);
        if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
      } catch (err: any) {
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [roomId]);
  
  // Determine user role
  useEffect(() => {
    if (user && room) {
      if (user.id === room.buyerId?._id) setUserRole('buyer');
      else if (user.id === room.sellerId?._id) setUserRole('seller');
    }
  }, [user, room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endVideoCall(false); // Don't emit event on unmount
    }
  }, []);

  const createPeerConnection = () => {
    if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
    }
    
    // Enhanced ICE configuration with multiple STUN servers and TURN servers
    const iceServers = [
      // Primary STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Free public TURN servers (no credentials required)
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      
      // Additional free TURN servers
      {
        urls: [
          'turn:relay.backups.cz:3478',
          'turn:relay.backups.cz:3478?transport=tcp'
        ]
      },
      
      // More STUN servers for redundancy
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun.voiparound.com:3478' },
      { urls: 'stun:stun.voipbuster.com:3478' },
      { urls: 'stun:stun.voipstunt.com:3478' },
      { urls: 'stun:stun.voxgratia.org:3478' }
    ];
    
    const pc = new RTCPeerConnection({ 
      iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });
    
    // Enhanced ICE candidate handling
    pc.onicecandidate = event => {
      console.log('ICE candidate generated:', event.candidate);
      if (event.candidate && socket) {
        socket.emit('ice_candidate', { roomId, candidate: event.candidate });
      }
    };
    
    // ICE connection state monitoring
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      setConnectionStatus(pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'failed') {
        console.log('ICE connection failed, trying to restart...');
        // Try to restart ICE
        pc.restartIce();
      }
    };
    
    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionStatus(pc.connectionState);
      
      if (pc.connectionState === 'failed') {
        console.log('Connection failed, ending call...');
        endVideoCall(true);
      }
    };
    
    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      if (pc.connectionState !== 'connected') {
        console.log('Connection timeout, ending call...');
        endVideoCall(true);
      }
    }, 30000); // 30 seconds timeout
    
    // Clear timeout when connection is established
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        clearTimeout(connectionTimeout);
      }
    };
    
    pc.ontrack = event => {
      console.log('Remote track received:', event.streams[0]);
      setRemoteStream(event.streams[0]);
    };
    
    peerConnectionRef.current = pc;
    return pc;
  };

  const getMedia = async () => {
    const constraints = {
      video: { 
        deviceId: selectedCamera ? { exact: selectedCamera } : undefined, 
        width: { ideal: 1280, min: 640, max: 1920 },
        height: { ideal: 720, min: 480, max: 1080 },
        frameRate: { ideal: 30, min: 15, max: 60 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: { ideal: 48000 },
        channelCount: { ideal: 2 }
      }
    };
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Media stream obtained:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error getting media:', error);
      // Fallback to basic constraints
      const fallbackConstraints = {
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
        audio: true
      };
      const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      setLocalStream(fallbackStream);
      return fallbackStream;
    }
  };
  
  // Logic for the CALLER
  const startVideoCall = async () => {
    try {
      if (!socket || !user || isVideoCallActive) return;
      
      console.log('Starting video call...');
      const stream = await getMedia();
      setIsVideoCallActive(true);
      
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind);
        pc.addTrack(track, stream);
      });
      
      console.log('Creating offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      console.log('Setting local description...');
      await pc.setLocalDescription(offer);
      
      console.log('Sending offer to other user...');
      socket.emit('offer', { roomId, offer, fromUserId: user.id, fromUserName: user.name });
      
    } catch (err) {
      console.error('Error starting video call:', err);
      alert("Could not start video call. Please check camera/mic permissions.");
      setIsVideoCallActive(false);
    }
  };
  
  // Logic for the CALLEE (when accepting the call)
  const acceptIncomingCall = async () => {
    try {
        if (!socket || !incomingCall || !user || isVideoCallActive) return;
        
        console.log('Accepting incoming call...');
        const stream = await getMedia();
        setIsVideoCallActive(true);
        
        const pc = createPeerConnection();
        stream.getTracks().forEach(track => {
          console.log('Adding track to peer connection:', track.kind);
          pc.addTrack(track, stream);
        });
        
        console.log('Setting remote description from offer...');
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        
        console.log('Creating answer...');
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        console.log('Setting local description...');
        await pc.setLocalDescription(answer);
        
        console.log('Sending answer to caller...');
        socket.emit('answer', { roomId, answer, fromUserId: user.id, fromUserName: user.name });
        setIncomingCall(null);
        
    } catch (err) {
        console.error('Error accepting call:', err);
        alert("Could not accept call. Please try again.");
        setIsVideoCallActive(false);
    }
  };

  // Logic for the CALLEE (when declining the call)
  const declineIncomingCall = () => {
    if (socket && incomingCall) {
      socket.emit('call_rejected', { roomId, fromUserId: user?.id });
    }
    setIncomingCall(null);
  };

  // Centralized cleanup function
  const endVideoCall = (notifyServer = true) => {
    if (notifyServer && socket) {
      socket.emit('end_video_call', { roomId, fromUserId: user?.id });
    }
    
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    
    setLocalStream(null);
    setRemoteStream(null);
    setIsVideoCallActive(false);
    setIncomingCall(null);
  };

  // Centralized Socket Listeners for WebRTC
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    const handleOffer = (data: { offer: RTCSessionDescriptionInit; fromUserId: string; fromUserName: string; }) => {
      // Ignore offers if we are in a call, already have an incoming call, or if it's our own offer
      if (isVideoCallActive || incomingCall || data.fromUserId === user.id) return;
      setIncomingCall(data);
    };

    const handleAnswer = (data: { answer: RTCSessionDescriptionInit; fromUserId: string; }) => {
      if (data.fromUserId !== user.id && peerConnectionRef.current) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };
    
    const handleIceCandidate = (data: { candidate: RTCIceCandidateInit; }) => {
      if (data.candidate && peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };
    
    const handleCallRejected = (data: { fromUserId: string }) => {
        // If I am the caller (peerConnection exists) and the other user rejected
        if (data.fromUserId !== user.id && peerConnectionRef.current) {
            alert("User has rejected your call.");
            endVideoCall(false); // End call locally, no need to notify server again
        }
    };

    const handleCallEnded = (data: { fromUserId: string }) => {
        // If the other user ended the call and a call was active
        if (data.fromUserId !== user.id && isVideoCallActive) {
            alert("The other user has ended the call.");
            endVideoCall(false); // End call locally
        }
    };

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('call_rejected', handleCallRejected);
    socket.on('end_video_call', handleCallEnded);

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('call_rejected', handleCallRejected);
      socket.off('end_video_call', handleCallEnded);
    };
  }, [socket, isConnected, user, isVideoCallActive, incomingCall]);


  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
      setIsMuted(!localStream.getAudioTracks()[0].enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
      setIsVideoOn(!localStream.getVideoTracks()[0].enabled);
    }
  };
  
  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    if(isVideoCallActive) {
      getMedia().then(newStream => {
        const newVideoTrack = newStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
        sender?.replaceTrack(newVideoTrack);
      });
    }
  };

  if (loading) return <div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><p>Loading room...</p></div>;
  if (error) return <div className={styles.errorContainer}><h2>Error</h2><p>{error}</p><button onClick={() => navigate('/dashboard')}>Back to Dashboard</button></div>;
  if (!room) return <div className={styles.errorContainer}><h2>Room Not Found</h2><p>The room you're looking for doesn't exist.</p><button onClick={() => navigate('/dashboard')}>Back to Dashboard</button></div>;

  return (
    <div className={`${styles.roomContainer} ${darkMode ? styles.darkMode : ''}`}>
      {incomingCall && !isVideoCallActive && (
        <div className={styles.incomingCallOverlay}>
          <div className={styles.incomingCallModal}>
            <h3>📹 Incoming Call</h3>
            <p>{incomingCall.fromUserName} is calling you</p>
            <button className={styles.acceptCallButton} onClick={acceptIncomingCall}>📞 Accept</button>
            <button className={styles.declineCallButton} onClick={declineIncomingCall}>❌ Decline</button>
          </div>
        </div>
      )}

      {isVideoCallActive && (
        <div className={styles.videoCallOverlay}>
          <div className={styles.videoCallContainer}>
            <div className={styles.connectionStatus}>
              Connection: {connectionStatus}
            </div>
            <div className={styles.remoteVideoContainer}>
              <video ref={remoteVideoRef} autoPlay playsInline className={styles.remoteVideo} />
              <div className={styles.remoteVideoLabel}>
                Remote User {remoteStream ? '(Connected)' : '(Connecting...)'}
              </div>
            </div>
            <div className={styles.localVideoContainer}>
              <video ref={localVideoRef} autoPlay playsInline muted className={styles.localVideo} />
              <div className={styles.localVideoLabel}>You</div>
            </div>
            <div className={styles.videoCallControls}>
              <select value={selectedCamera} onChange={(e) => handleCameraChange(e.target.value)} disabled={cameraDevices.length <= 1}>
                {cameraDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              <button onClick={toggleMute}>{isMuted ? '🔇' : '🎤'}</button>
              <button onClick={toggleVideo}>{isVideoOn ? '📹' : '📷'}</button>
              <button onClick={() => endVideoCall(true)} className={styles.endCallButton}>❌ End Call</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.mainContent}>
        <div className={styles.workStatusContainer}>
          {user && roomId && userRole && <WorkStatusPanel roomId={roomId} currentUserId={user.id} userRole={userRole} roomStatus={room} />}
        </div>
        <div className={styles.chatContainer}>
          {user && roomId && (
            <Chatbox 
              roomId={roomId} 
              currentUserId={user.id}
              isVideoCallActive={isVideoCallActive}
              onStartVideoCall={startVideoCall}
            />
          )}
        </div>
      </div>

      {showDisputeChatbot && user && roomId && userRole && (
        <DisputeChatbot
          roomId={roomId}
          currentUserId={user.id}
          userRole={userRole}
          isOpen={showDisputeChatbot}
          onClose={() => setShowDisputeChatbot(false)}
        />
      )}
    </div>
  );
};

export default RoomViewPage;