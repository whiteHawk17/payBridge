import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './DisputeChatbot.module.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  message: string;
  timestamp: Date;
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
  }>;
}

interface DisputeChatbotProps {
  roomId: string;
  currentUserId: string;
  userRole: 'buyer' | 'seller';
  isOpen: boolean;
  onClose: () => void;
}

const DisputeChatbot: React.FC<DisputeChatbotProps> = ({
  roomId,
  currentUserId,
  userRole,
  isOpen,
  onClose
}) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [disputeStatus, setDisputeStatus] = useState<string>('PENDING');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/dispute-chat`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setDisputeStatus(data.status || 'PENDING');
        
        // Add welcome message if no messages exist
        if (!data.messages || data.messages.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            sender: 'ai',
            message: `🤖 Welcome to AI Dispute Resolution! I'm here to help resolve this dispute fairly. 

Please provide:
• Clear description of the issue
• Supporting evidence (screenshots, documents, etc.)
• Any relevant communication history

I'll analyze both sides and provide a fair decision. Let's start by understanding your perspective.`,
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to initialize dispute chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date(),
      attachments: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', inputMessage);
      uploadedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/dispute-message`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        if (data.aiResponse) {
          const aiMessage: ChatMessage = {
            id: Date.now().toString() + '_ai',
            sender: 'ai',
            message: data.aiResponse,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        }

        // Update dispute status if changed
        if (data.status) {
          setDisputeStatus(data.status);
        }

        // Emit socket event
        socket?.emit('dispute_message', { roomId, message: inputMessage });
      }
    } catch (error) {
      console.error('Failed to send dispute message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        sender: 'system',
        message: '❌ Failed to send message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setUploadedFiles([]);
    }
  };

  const requestAIDecision = async () => {
    setIsTyping(true);
    
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/ai-decision`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        const decisionMessage: ChatMessage = {
          id: Date.now().toString() + '_decision',
          sender: 'ai',
          message: `🤖 **AI Decision Reached**

**Decision:** ${data.decision}

**Reasoning:** ${data.reasoning}

**Next Steps:** ${data.nextSteps}

${data.decision === 'BUYER_WINS' ? '✅ Buyer wins the dispute' : 
  data.decision === 'SELLER_WINS' ? '✅ Seller wins the dispute' : 
  '🤝 Compromise reached'}

You can accept this decision or escalate to admin review.`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, decisionMessage]);
        setDisputeStatus('AI_DECIDED');
        
        // Emit socket event
        socket?.emit('ai_decision_reached', { roomId, decision: data.decision });
      }
    } catch (error) {
      console.error('Failed to get AI decision:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const acceptAIDecision = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/accept-ai-decision`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const acceptMessage: ChatMessage = {
          id: Date.now().toString() + '_accept',
          sender: 'system',
          message: `✅ ${userRole === 'buyer' ? 'Buyer' : 'Seller'} has accepted the AI decision. Dispute resolved!`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, acceptMessage]);
        setDisputeStatus('RESOLVED');
        
        // Emit socket event
        socket?.emit('ai_decision_accepted', { roomId, acceptedBy: userRole });
      }
    } catch (error) {
      console.error('Failed to accept AI decision:', error);
    }
  };

  const escalateToAdmin = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/rooms/${roomId}/escalate-dispute`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const escalateMessage: ChatMessage = {
          id: Date.now().toString() + '_escalate',
          sender: 'system',
          message: `📞 Dispute escalated to admin review. An admin will review the case and provide a final decision within 24-48 hours.`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, escalateMessage]);
        setDisputeStatus('ESCALATED');
        
        // Emit socket event
        socket?.emit('dispute_escalated', { roomId });
      }
    } catch (error) {
      console.error('Failed to escalate dispute:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatbotOverlay}>
      <div className={styles.chatbotContainer}>
        <div className={styles.chatbotHeader}>
          <div className={styles.headerInfo}>
            <h3>🤖 AI Dispute Resolution</h3>
            <span className={`${styles.status} ${styles[disputeStatus.toLowerCase()]}`}>
              {disputeStatus.replace('_', ' ')}
            </span>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`${styles.message} ${styles[message.sender]}`}
            >
              <div className={styles.messageContent}>
                <div className={styles.messageText}>
                  {message.message.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className={styles.attachments}>
                    {message.attachments.map((file, index) => (
                      <div key={index} className={styles.attachment}>
                        <span className={styles.fileIcon}>📎</span>
                        <span className={styles.fileName}>{file.originalName}</span>
                        <a 
                          href={`${BACKEND_BASE_URL}${file.url}`} 
                          download 
                          className={styles.downloadLink}
                        >
                          📥
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className={`${styles.message} ${styles.ai}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.fileUpload}>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
              id="dispute-file-input"
            />
            <label htmlFor="dispute-file-input" className={styles.fileLabel}>
              📎 Attach
            </label>
            {uploadedFiles.length > 0 && (
              <div className={styles.fileList}>
                {uploadedFiles.map((file, index) => (
                  <span key={index} className={styles.fileItem}>
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.messageInput}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe your issue or provide evidence..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage} className={styles.sendBtn}>
              📤
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {disputeStatus === 'PENDING' && (
            <button onClick={requestAIDecision} className={styles.aiDecisionBtn}>
              🤖 Request AI Decision
            </button>
          )}
          
          {disputeStatus === 'AI_DECIDED' && (
            <>
              <button onClick={acceptAIDecision} className={styles.acceptBtn}>
                ✅ Accept Decision
              </button>
              <button onClick={escalateToAdmin} className={styles.escalateBtn}>
                📞 Escalate to Admin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeChatbot; 