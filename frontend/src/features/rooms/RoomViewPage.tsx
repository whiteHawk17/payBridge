import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../../api/config';
import { useSocket } from '../../contexts/SocketContext';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import Chatbox from '../../components/rooms/Chatbox';
import WorkStatusPanel from '../../components/rooms/WorkStatusPanel';
import DisputeChatbot from '../../components/rooms/DisputeChatbot';
import SellerPaymentDetailsForm from '../../components/rooms/SellerPaymentDetailsForm';
import styles from './RoomViewPage.module.css';

// Interfaces
interface RoomData {
  _id: string;
  buyerId?: any;
  sellerId?: any;
  status: string;
  transactionId?: string;
  createdAt: string;
  price?: number;
  description?: string;
  sellerPaymentDetails?: {
    upiId?: string;
    bankAccount?: string;
    ifscCode?: string;
    accountHolderName?: string;
    isDetailsComplete?: boolean;
  };
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

  // State for call notifications and status
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ fromUserId: string, fromUserName: string } | null>(null);
  const [isCalling, setIsCalling] = useState(false); // To show "Calling..." status to the caller
  
  // Component state
  const [showDisputeChatbot, setShowDisputeChatbot] = useState(false);
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>();

  // Payment details form state
  const [showPaymentDetailsForm, setShowPaymentDetailsForm] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await fetch(`${BACKEND_BASE_URL}/auth/me`, { credentials: 'include' });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          console.error("User not authenticated");
        }

        if (roomId) {
            const roomResponse = await fetch(`${BACKEND_BASE_URL}/dashboard/rooms/${roomId}`, { credentials: 'include' });
            if (!roomResponse.ok) throw new Error('Failed to fetch room details');
            setRoom(await roomResponse.json());
        }
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

  // FIX: Added useEffect to join the socket room when the component loads.
  // This is the most likely reason the notification wasn't being received.
  useEffect(() => {
    if (socket && isConnected && user && roomId) {
      console.log('Joining socket room:', { roomId, userId: user.id });
      socket.emit('join_room', { roomId, userId: user.id });
    } else {
      console.log('Cannot join room:', { socket: !!socket, isConnected, user: !!user, roomId });
    }
    return () => {
      if (socket && isConnected && user && roomId) {
        console.log('Leaving socket room:', { roomId, userId: user.id });
        socket.emit('leave_room', { roomId, userId: user.id });
      }
    };
  }, [socket, isConnected, user, roomId]);


  // Function to start the ZegoCloud UI Kit
  const setupZegoCall = async (element: HTMLDivElement) => {
    if (!user || !roomId) {
        alert("User or Room ID is missing. Cannot start the call.");
        return;
    }

    const appID = parseInt(process.env.REACT_APP_ZEGO_APP_ID || '0');
    const serverSecret = process.env.REACT_APP_ZEGO_SERVER_SECRET || '';
    
    try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, user.id, user.name);
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
            container: element,
            sharedLinks: [{ name: 'Copy link', url: window.location.href }],
            scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
            showScreenSharingButton: false,
            onLeaveRoom: () => endVideoCall(),
        });
    } catch (err) {
        console.error("Error starting ZegoCloud call:", err);
        alert("Failed to start video call. Please check your credentials and try again.");
        setIsVideoCallActive(false);
    }
  };
  
  // Function to initiate the call via sockets
  const initiateCall = () => {
    if (!user || !socket || !roomId) {
      console.log('Cannot initiate call:', { user: !!user, socket: !!socket, roomId });
      return;
    }
    console.log('Initiating call with data:', { roomId, fromUserId: user.id, fromUserName: user.name });
    setIsCalling(true);
    socket.emit('outgoing_call', {
        roomId,
        fromUserId: user.id,
        fromUserName: user.name,
    });
  };

  // Function to accept an incoming call
  const acceptIncomingCall = () => {
    if (!socket || !incomingCall) return;
    socket.emit('accept_call', { roomId, fromUserId: incomingCall.fromUserId });
    setIncomingCall(null);
    setIsVideoCallActive(true);
  };

  // Function to decline an incoming call
  const declineIncomingCall = () => {
    if (!socket || !incomingCall) return;
    socket.emit('decline_call', { roomId, fromUserId: incomingCall.fromUserId });
    setIncomingCall(null);
  };

  // FIX: Added function to handle cancelling an outgoing call
  const cancelOutgoingCall = () => {
    if (!socket) return;
    socket.emit('cancel_call', { roomId });
    setIsCalling(false);
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    setIsCalling(false);
    if (videoContainerRef.current) {
      videoContainerRef.current.innerHTML = '';
    }
  };

  const handlePaymentDetailsSubmitted = () => {
    setShowPaymentDetailsForm(false);
    // Refresh room data to show updated status
    if (roomId) {
      fetch(`${BACKEND_BASE_URL}/dashboard/rooms/${roomId}`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => setRoom(data))
        .catch(err => console.error('Failed to refresh room data:', err));
    }
  };

  // Socket listeners for the call notification flow
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('Socket not connected:', { socket: !!socket, isConnected });
      return;
    }

    console.log('Setting up socket listeners for video call notifications');

    const handleIncomingCall = (data: { fromUserId: string, fromUserName: string }) => {
        console.log('Received incoming call:', data);
        if (!isVideoCallActive && !isCalling) {
            setIncomingCall(data);
        }
    };

    const handleCallAccepted = () => {
        console.log('Call accepted');
        setIsCalling(false);
        setIsVideoCallActive(true);
    };

    const handleCallDeclined = () => {
        console.log('Call declined');
        setIsCalling(false);
        alert("User declined the call.");
    };
    
    // FIX: Added handler for when the caller cancels
    const handleCallCancelled = () => {
        console.log('Call cancelled');
        setIncomingCall(null);
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_declined', handleCallDeclined);
    socket.on('call_cancelled', handleCallCancelled); // FIX: Listen for cancellation

    return () => {
        socket.off('incoming_call', handleIncomingCall);
        socket.off('call_accepted', handleCallAccepted);
        socket.off('call_declined', handleCallDeclined);
        socket.off('call_cancelled', handleCallCancelled); // FIX: Cleanup listener
    };
  }, [socket, isConnected, isVideoCallActive, isCalling]);

  // Effect to initiate the call once the component is ready
  useEffect(() => {
    if (isVideoCallActive && videoContainerRef.current) {
        videoContainerRef.current.innerHTML = '';
        setupZegoCall(videoContainerRef.current);
    }
  }, [isVideoCallActive]);


  if (loading) return <div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><p>Loading room...</p></div>;
  if (error) return <div className={styles.errorContainer}><h2>Error</h2><p>{error}</p><button onClick={() => navigate('/dashboard')}>Back to Dashboard</button></div>;
  if (!room) return <div className={styles.errorContainer}><h2>Room Not Found</h2><p>The room you're looking for doesn't exist.</p><button onClick={() => navigate('/dashboard')}>Back to Dashboard</button></div>;

  return (
    <div className={`${styles.roomContainer} ${darkMode ? styles.darkMode : ''}`}>
      {/* Show incoming call notification */}
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

      {/* Show "Calling..." status to the caller */}
      {isCalling && (
          <div className={styles.incomingCallOverlay}>
              <div className={styles.incomingCallModal}>
                  <h3>Calling...</h3>
                  <p>Waiting for the other user to accept.</p>
                  <button className={styles.declineCallButton} onClick={cancelOutgoingCall}>Cancel</button>
              </div>
          </div>
      )}

      {/* The ZegoCloud UI will be rendered inside this div */}
      {isVideoCallActive ? (
        <div className={styles.videoCallOverlay}>
          <div className={styles.videoCallContainer} ref={videoContainerRef} style={{ width: '100%', height: '100%' }}>
            {/* ZegoUIKitPrebuilt will fill this container */}
          </div>
        </div>
      ) : (
        // Your original page content remains here when call is not active
        <div className={styles.mainContent}>
          {/* Payment Details Prompt for Sellers */}
          {user && roomId && userRole === 'seller' && room && (
            <div className={styles.paymentPrompt}>
              {!room.sellerPaymentDetails?.isDetailsComplete ? (
                <div className={styles.paymentAlert}>
                  <div className={styles.paymentAlertContent}>
                    <span>💰</span>
                    <div>
                      <h4>Payment Details Required</h4>
                      <p>Add your UPI ID and bank details to receive payments when work is completed.</p>
                    </div>
                    <button 
                      className={styles.addPaymentButton}
                      onClick={() => setShowPaymentDetailsForm(true)}
                    >
                      Add Payment Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.paymentSuccess}>
                  <div className={styles.paymentSuccessContent}>
                    <span>✅</span>
                    <div>
                      <h4>Payment Details Complete</h4>
                      <p>Your payment details are set up. You'll receive payments when buyers release funds.</p>
                    </div>
                    <button 
                      className={styles.editPaymentButton}
                      onClick={() => setShowPaymentDetailsForm(true)}
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.workStatusContainer}>
            {user && roomId && userRole && <WorkStatusPanel roomId={roomId} currentUserId={user.id} userRole={userRole} roomStatus={room} />}
          </div>
          <div className={styles.chatContainer}>
            {user && roomId && (
              <Chatbox 
                roomId={roomId} 
                currentUserId={user.id}
                isVideoCallActive={isVideoCallActive}
                onStartVideoCall={initiateCall}
              />
            )}
          </div>
        </div>
      )}

      {showDisputeChatbot && user && roomId && userRole && (
        <DisputeChatbot
          roomId={roomId}
          currentUserId={user.id}
          userRole={userRole}
          isOpen={showDisputeChatbot}
          onClose={() => setShowDisputeChatbot(false)}
        />
      )}

      {/* Seller Payment Details Form */}
      {user && roomId && userRole === 'seller' && (
        <SellerPaymentDetailsForm
          roomId={roomId}
          onDetailsSubmitted={handlePaymentDetailsSubmitted}
          isOpen={showPaymentDetailsForm}
          onClose={() => setShowPaymentDetailsForm(false)}
        />
      )}
    </div>
  );
};

export default RoomViewPage;
