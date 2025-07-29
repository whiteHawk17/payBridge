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
  
  // Video call state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<{fromUserId: string, fromUserName: string, offer: RTCSessionDescriptionInit} | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  
  // Component state
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

  /**
   * Creates the RTCPeerConnection. This is the critical part for long-distance calls.
   */
  const createPeerConnection = () => {
    if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
    }
    
    // **FIX:** Re-added TURN servers. They are essential for connecting across different networks.
    // The free servers below can be unreliable. For a production app, use a paid service like Twilio.
    const iceServers = [
      // Google's public STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      
      // Public TURN server (acts as a relay when direct connection fails)
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
    ];
    
    const pc = new RTCPeerConnection({ 
      iceServers,
      iceCandidatePoolSize: 10,
    });
    
    // Set up a connection timeout to prevent getting stuck
    const connectionTimeout = setTimeout(() => {
      if (pc.connectionState !== 'connected') {
        console.error('Connection timed out after 30 seconds. Ending call.');
        endVideoCall(true); // End the call if it's not connected
      }
    }, 30000);

    pc.onicecandidate = event => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', { roomId, candidate: event.candidate });
      }
    };

    // Consolidated state change handler for better logic
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('Connection state changed to:', state);
      setConnectionStatus(state);
      
      if (state === 'connected') {
        clearTimeout(connectionTimeout); // Success! Clear the timeout.
      } else if (state === 'failed') {
        console.warn('Connection failed. Attempting to restart ICE...');
        pc.restartIce();
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media devices not supported in this browser');
    }

    const constraintConfigs = [
      { video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } },
      { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: true },
      { video: true, audio: true },
    ];

    let lastError: any = null;
    for (const config of constraintConfigs) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(config);
        setLocalStream(stream);
        return stream;
      } catch (error: any) {
        lastError = error;
      }
    }
    throw new Error(`Failed to access media devices: ${lastError?.name || 'Unknown error'} - ${lastError?.message || 'No media devices available'}`);
  };
  
  const startVideoCall = async () => {
    try {
      if (!socket || !user || isVideoCallActive) return;
      await checkDeviceAvailability();
      const stream = await getMedia();
      setIsVideoCallActive(true);
      
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      
      socket.emit('offer', { roomId, offer, fromUserId: user.id, fromUserName: user.name });
      
    } catch (err: any) {
      console.error('Error starting video call:', err);
      let errorMessage = "Could not start video call. ";
      if (err.name === 'NotAllowedError') {
        errorMessage += "Camera/microphone access was denied. Please allow permissions in your browser settings.";
      } else if (err.name === 'NotFoundError') {
        errorMessage += "No camera or microphone found. Please check if your devices are connected.";
      } else {
        errorMessage += err.message || "Please check camera/microphone permissions.";
      }
      alert(errorMessage);
      setIsVideoCallActive(false);
    }
  };
  
  const acceptIncomingCall = async () => {
    try {
        if (!socket || !incomingCall || !user || isVideoCallActive) return;
        const stream = await getMedia();
        setIsVideoCallActive(true);
        
        const pc = createPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('answer', { roomId, answer, fromUserId: user.id, fromUserName: user.name });
        setIncomingCall(null);
        
    } catch (err) {
        console.error('Error accepting call:', err);
        alert("Could not accept call. Please try again.");
        setIsVideoCallActive(false);
    }
  };

  const declineIncomingCall = () => {
    if (socket && incomingCall) {
      socket.emit('call_rejected', { roomId, fromUserId: user?.id });
    }
    setIncomingCall(null);
  };

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

  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    const handleOffer = (data: { offer: RTCSessionDescriptionInit; fromUserId: string; fromUserName: string; }) => {
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
        if (data.fromUserId !== user.id && peerConnectionRef.current) {
            alert("User has rejected your call.");
            endVideoCall(false);
        }
    };

    const handleCallEnded = (data: { fromUserId: string }) => {
        if (data.fromUserId !== user.id && isVideoCallActive) {
            alert("The other user has ended the call.");
            endVideoCall(false);
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
  
  const checkDeviceAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      
      if (cameras.length === 0) {
        throw new Error('No camera found. Please connect a camera and try again.');
      }
      
      if (microphones.length === 0) {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
      
      return true;
    } catch (error) {
      console.error('Error checking device availability:', error);
      throw error;
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
