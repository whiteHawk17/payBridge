import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './RoomViewPage.module.css';

interface RoomData {
  _id: string;
  buyerId?: any;
  sellerId?: any;
  status: string;
  transactionId?: string;
  createdAt: string;
}

interface TransactionData {
  _id: string;
  amount: number;
  description: string;
  paymentStatus: string;
  completionDate: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isSpeaking: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}

interface RoomViewPageProps {
  darkMode?: boolean;
}

const RoomViewPage: React.FC<RoomViewPageProps> = ({ darkMode = false }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Video conferencing state
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice Johnson', hasVideo: true, hasAudio: true, isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face' },
    { id: '2', name: 'Bob Williams', hasVideo: true, hasAudio: true, isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face' },
  ]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Alice Johnson', message: 'Welcome everyone! Glad we could connect today.', timestamp: '10:00 AM', isOwn: false },
    { id: '2', sender: 'You', message: 'Thanks, Alice! Looking forward to our discussion.', timestamp: '10:01 AM', isOwn: true },
    { id: '3', sender: 'Bob Williams', message: 'Apologies for the slight delay, joining now.', timestamp: '10:02 AM', isOwn: false },
    { id: '4', sender: 'You', message: 'No worries, Bob! We just started.', timestamp: '10:02 AM', isOwn: true },
    { id: '5', sender: 'Diana Miller', message: 'Can everyone see the presentation slides clearly?', timestamp: '10:05 AM', isOwn: false },
    { id: '6', sender: 'Ethan Brown', message: 'Yes, it\'s perfectly visible on my end.', timestamp: '10:06 AM', isOwn: false },
    { id: '7', sender: 'You', message: 'Looks great, Diana!', timestamp: '10:06 AM', isOwn: true },
    { id: '8', sender: 'Fiona Green', message: 'Question about slide 5, can we revisit that?', timestamp: '10:10 AM', isOwn: false },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  
  // Meeting controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/dashboard/rooms/${roomId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room details');
      }

      const roomData = await response.json();
      setRoom(roomData);

      // Fetch transaction details if available
      if (roomData.transactionId) {
        const txResponse = await fetch(`${BACKEND_BASE_URL}/dashboard/transactions/${roomData.transactionId}`, {
          credentials: 'include'
        });
        if (txResponse.ok) {
          const txData = await txResponse.json();
          setTransaction(txData);
        }
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load room details');
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const handleSendAiMessage = () => {
    if (aiMessage.trim()) {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: Date.now().toString(),
          sender: 'AI Assistant',
          message: `I've reviewed your request: "${aiMessage}". This appears to be a valid work validation query. I can help you analyze this further.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: false
        };
        setChatMessages([...chatMessages, aiResponse]);
      }, 1000);
      setAiMessage('');
    }
  };

  const handleLeaveRoom = () => {
    navigate('/dashboard');
  };

  const handleEndMeeting = () => {
    if (window.confirm('Are you sure you want to end the meeting for all participants?')) {
      navigate('/dashboard');
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  // Simulate participant interactions
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => ({
        ...p,
        isSpeaking: Math.random() > 0.8 // Random speaking indicator
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.roomContainer}>
        <div className={styles.loadingMessage}>Loading room...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className={styles.roomContainer}>
        <div className={styles.errorMessage}>
          {error || 'Room not found'}
          <button onClick={() => navigate('/dashboard')} className={styles.btn + ' ' + styles.btnPrimary}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

      return (
      <div className={`${styles.videoRoomContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.mainContent}>
        {/* Left Section - Video Area with Controls */}
        <div className={`${styles.leftSection} ${darkMode ? styles.darkMode : ''}`}>
          {/* Video Area */}
          <div className={`${styles.videoPanel} ${darkMode ? styles.darkMode : ''}`}>
            <div className={styles.meetingInfo}>
                              <h2>Active Meeting: Room {roomId}</h2>
              <div className={styles.meetingStats}>
                <span>{participants.length} Participants</span>
                <span className={styles.aiStatus}>AI Assistant Active</span>
              </div>
            </div>
            
            <div className={styles.participantsGrid}>
              {participants.map((participant) => (
                <div key={participant.id} className={styles.participantCard}>
                                  {participant.hasVideo ? (
                  <div className={styles.videoFeed}>
                    <img 
                      src={participant.avatar}
                      alt={participant.name}
                      className={styles.videoImage}
                    />
                    <div className={styles.videoOverlay}>
                      <div className={styles.videoIcon}>📹</div>
                      <div className={styles.videoLabel}>Live</div>
                    </div>
                  </div>
                ) : (
                    <div className={styles.avatarPlaceholder}>
                      <div className={styles.avatarLetter}>
                        {participant.name.charAt(0)}
                      </div>
                    </div>
                  )}
                  <div className={styles.participantName}>{participant.name}</div>
                  {!participant.hasAudio && (
                    <div className={styles.audioIndicator}>🔇</div>
                  )}
                  {participant.isSpeaking && (
                    <div className={styles.speakingIndicator}>🎤</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Control Bar - Directly under Video Grid */}
          <div className={`${styles.meetingControls} ${darkMode ? styles.darkMode : ''}`}>
            <div className={styles.controlButtons}>
              <button 
                className={`${styles.controlButton} ${isMuted ? styles.muted : ''}`}
                onClick={toggleMute}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              <button 
                className={`${styles.controlButton} ${!isVideoOn ? styles.videoOff : ''}`}
                onClick={toggleVideo}
              >
                {isVideoOn ? '📹' : '📷'}
              </button>
              <button 
                className={`${styles.controlButton} ${isScreenSharing ? styles.screenSharing : ''}`}
                onClick={toggleScreenShare}
              >
                🖥️
              </button>
            </div>
            
            <div className={styles.meetingActions}>
              <button className={styles.endMeetingButton} onClick={handleEndMeeting}>
                End Meeting for All
              </button>
              <button className={styles.leaveButton} onClick={handleLeaveRoom}>
                Leave Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Chat Panels */}
        <div className={`${styles.rightSection} ${darkMode ? styles.darkMode : ''}`}>
          {/* Meeting Chat Panel */}
          <div className={`${styles.chatPanel} ${darkMode ? styles.darkMode : ''}`}>
            <div className={styles.chatHeader}>
              <div className={styles.chatIcon}>💬</div>
              <h3>Meeting Chat</h3>
            </div>
            
            <div className={styles.chatMessages}>
              {chatMessages.map((message) => (
                <div key={message.id} className={`${styles.message} ${message.isOwn ? styles.ownMessage : ''}`}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageSender}>{message.sender}</span>
                    <span className={styles.messageTime}>{message.timestamp}</span>
                  </div>
                  <div className={styles.messageContent}>
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.chatInput}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className={styles.attachButton}>📎</button>
              <button className={styles.videoButton}>📹</button>
              <button className={styles.sendButton} onClick={handleSendMessage}>✈️</button>
            </div>
          </div>

          {/* AI Chatbot Panel */}
          <div className={`${styles.aiPanel} ${darkMode ? styles.darkMode : ''}`}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIcon}>🤖</div>
              <h3>AI Chatbot for Work Validation</h3>
            </div>
            
            <div className={styles.aiMessages}>
              <div className={styles.aiMessage}>
                <strong>AI Assistant:</strong> Hello! I am your ConnectMeet AI Assistant. I'm here to help validate work and provide instant feedback during this call. Feel free to ask me anything related to your tasks.
              </div>
              <div className={styles.aiMessage}>
                <strong>AI Assistant:</strong> For example, you can upload a document and ask: 'Can you check if this report meets the project guidelines?'
              </div>
            </div>
            
            <div className={styles.aiInput}>
              <input
                type="text"
                placeholder="Ask the AI about work validation..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendAiMessage()}
              />
              <button className={styles.attachButton}>📎</button>
              <button className={styles.videoButton}>📹</button>
              <button className={styles.aiSendButton} onClick={handleSendAiMessage}>✈️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomViewPage; 