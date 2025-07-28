import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import FileUpload from './FileUpload';
import styles from './Chatbox.module.css';

interface Attachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  messageType: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  timestamp: Date;
  type: 'CHAT' | 'EVIDENCE';
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'DOCUMENT';
  attachments: Attachment[];
  status: 'SENT' | 'DELIVERED' | 'READ';
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
}

interface ChatboxProps {
  roomId: string;
  currentUserId: string;
  isVideoCallActive?: boolean;
  onStartVideoCall?: () => void;
  onEndVideoCall?: () => void;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  isMuted?: boolean;
  isVideoOn?: boolean;
}

const Chatbox: React.FC<ChatboxProps> = ({ 
  roomId, 
  currentUserId,
  isVideoCallActive = false,
  onStartVideoCall,
  onEndVideoCall,
  onToggleMute,
  onToggleVideo,
  isMuted = false,
  isVideoOn = true
}) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room
    socket.emit('join_room', roomId);

    // Listen for room joined event
    socket.on('room_joined', (data: { roomId: string; messages: Message[] }) => {
      if (data.roomId === roomId) {
        setMessages(data.messages);
      }
    });

    // Listen for new messages
    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark message as read if it's not from current user
      if (message.senderId !== currentUserId) {
        setTimeout(() => {
          socket.emit('mark_as_read', { messageId: message.id, roomId });
        }, 1000);
      }
    });

    // Listen for message status updates
    socket.on('message_status_update', (data: { messageId: string; status: string; readBy?: string }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === data.messageId) {
          return {
            ...msg,
            status: data.status as 'SENT' | 'DELIVERED' | 'READ',
            readBy: data.readBy && data.status === 'READ' 
              ? [...msg.readBy, { userId: data.readBy, readAt: new Date() }]
              : msg.readBy
          };
        }
        return msg;
      }));
    });

    // Listen for user joined
    socket.on('user_joined', (data: { userId: string; userName: string }) => {
      console.log(`${data.userName} joined the room`);
    });

    // Listen for user left
    socket.on('user_left', (data: { userId: string; userName: string }) => {
      console.log(`${data.userName} left the room`);
    });

    // Listen for typing indicators
    socket.on('user_typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(user => user !== data.userName), data.userName]);
      } else {
        setTypingUsers(prev => prev.filter(user => user !== data.userName));
      }
    });

    // Listen for errors
    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    return () => {
      socket.off('room_joined');
      socket.off('new_message');
      socket.off('message_status_update');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
      socket.off('error');
      socket.emit('leave_room', roomId);
    };
  }, [socket, roomId, currentUserId]);

  const handleSend = () => {
    if ((input.trim() || uploadedFiles.length > 0) && socket && isConnected) {
      const messageType = uploadedFiles.length > 0 
        ? uploadedFiles[0].messageType as 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'DOCUMENT'
        : 'TEXT';
      
      socket.emit('send_message', {
        roomId,
        content: input.trim() || (uploadedFiles.length > 0 ? `Sent ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}` : ''),
        type: 'CHAT',
        messageType,
        attachments: uploadedFiles
      });
      
      setInput('');
      setUploadedFiles([]);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('typing', { roomId, isTyping: false });
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Handle typing indicator
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing', { roomId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('typing', { roomId, isTyping: false });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleFileUpload = (files: Attachment[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === currentUserId;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return '✓';
      case 'DELIVERED': return '✓✓';
      case 'READ': return '✓✓';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return styles.statusSent;
      case 'DELIVERED': return styles.statusDelivered;
      case 'READ': return styles.statusRead;
      default: return '';
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    const { BACKEND_BASE_URL } = require('../../api/config');
    const fileUrl = `${BACKEND_BASE_URL}${attachment.url}`;

    switch (attachment.messageType) {
      case 'IMAGE':
        return (
          <div className={styles.imageAttachment}>
            <img src={fileUrl} alt={attachment.originalName} />
            <span className={styles.fileName}>{attachment.originalName}</span>
          </div>
        );
      
      case 'VIDEO':
        return (
          <div className={styles.videoAttachment}>
            <video controls>
              <source src={fileUrl} type={attachment.mimeType} />
              Your browser does not support the video tag.
            </video>
            <span className={styles.fileName}>{attachment.originalName}</span>
          </div>
        );
      
      case 'AUDIO':
        return (
          <div className={styles.audioAttachment}>
            <audio controls>
              <source src={fileUrl} type={attachment.mimeType} />
              Your browser does not support the audio tag.
            </audio>
            <span className={styles.fileName}>{attachment.originalName}</span>
          </div>
        );
      
      default:
        return (
          <div className={styles.fileAttachment}>
            <div className={styles.fileIcon}>📄</div>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{attachment.originalName}</span>
              <span className={styles.fileSize}>{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <a href={fileUrl} download className={styles.downloadButton}>
              📥
            </a>
          </div>
        );
    }
  };

  return (
    <div className={styles.chatboxContainer}>
      <div className={styles.chatboxHeader}>
        <div className={styles.headerLeft}>
          <h3>Room Chat</h3>
          <div className={styles.connectionStatus}>
            <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        {/* Video Call Controls */}
        <div className={styles.videoCallControls}>
          {!isVideoCallActive ? (
            <button 
              className={styles.videoCallButton}
              onClick={onStartVideoCall}
              disabled={!isConnected}
              title="Start Video Call"
            >
              📹
            </button>
          ) : (
            <>
              <button 
                className={`${styles.videoControlButton} ${isMuted ? styles.muted : ''}`}
                onClick={onToggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              <button 
                className={`${styles.videoControlButton} ${!isVideoOn ? styles.videoOff : ''}`}
                onClick={onToggleVideo}
                title={isVideoOn ? 'Turn off video' : 'Turn on video'}
              >
                {isVideoOn ? '📹' : '📷'}
              </button>
              <button 
                className={styles.endCallButton}
                onClick={onEndVideoCall}
                title="End Video Call"
              >
                ❌
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className={styles.chatboxMessages}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.message} ${isOwnMessage(msg) ? styles.sent : styles.received}`}>
            {!isOwnMessage(msg) && (
              <div className={styles.messageSender}>
                {msg.senderPhoto ? (
                  <img 
                    src={msg.senderPhoto.startsWith('http') ? msg.senderPhoto : require('../../api/config').BACKEND_BASE_URL + msg.senderPhoto} 
                    alt={msg.senderName} 
                    className={styles.senderAvatar}
                  />
                ) : (
                  <div className={styles.senderAvatarFallback}>
                    {msg.senderName ? msg.senderName[0].toUpperCase() : '?'}
                  </div>
                )}
                <span className={styles.senderName}>{msg.senderName}</span>
              </div>
            )}
            
            {msg.content && <p>{msg.content}</p>}
            
            {msg.attachments && msg.attachments.length > 0 && (
              <div className={styles.attachments}>
                {msg.attachments.map((attachment, index) => (
                  <div key={index} className={styles.attachment}>
                    {renderAttachment(attachment)}
                  </div>
                ))}
              </div>
            )}
            
            <div className={styles.messageFooter}>
              <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
              {isOwnMessage(msg) && (
                <span className={`${styles.messageStatus} ${getStatusColor(msg.status)}`}>
                  {getStatusIcon(msg.status)}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className={styles.typingIndicator}>
            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className={styles.uploadedFiles}>
          <div className={styles.uploadedFilesHeader}>
            <span>Files to send ({uploadedFiles.length})</span>
            <button onClick={() => setUploadedFiles([])}>Clear All</button>
          </div>
          <div className={styles.uploadedFilesList}>
            {uploadedFiles.map((file, index) => (
              <div key={index} className={styles.uploadedFileItem}>
                <span className={styles.fileName}>{file.originalName}</span>
                <button onClick={() => removeUploadedFile(index)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.chatboxInput}>
        <button 
          className={styles.attachButton}
          onClick={() => setShowFileUpload(true)}
          disabled={!isConnected}
        >
          📎
        </button>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button onClick={handleSend} disabled={!isConnected || (!input.trim() && uploadedFiles.length === 0)}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>

      {showFileUpload && (
        <FileUpload
          onFileUpload={handleFileUpload}
          onClose={() => setShowFileUpload(false)}
          roomId={roomId}
        />
      )}
    </div>
  );
};

export default Chatbox; 