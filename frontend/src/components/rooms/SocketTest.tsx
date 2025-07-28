import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { BACKEND_BASE_URL } from '../../api/config';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const SocketTest: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/auth/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      setMessages(prev => [...prev, 'Connected to socket server']);
    });

    socket.on('disconnect', () => {
      setMessages(prev => [...prev, 'Disconnected from socket server']);
    });

    socket.on('error', (error) => {
      setMessages(prev => [...prev, `Error: ${error.message}`]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
    };
  }, [socket]);

  const sendTestMessage = () => {
    if (socket && testMessage.trim()) {
      socket.emit('send_message', {
        roomId: 'test-room',
        content: testMessage,
        type: 'CHAT'
      });
      setMessages(prev => [...prev, `Sent: ${testMessage}`]);
      setTestMessage('');
    }
  };

  const connectSocket = async () => {
    try {
      const tokenResponse = await fetch(`${BACKEND_BASE_URL}/auth/token`, {
        credentials: 'include',
      });
      
      if (tokenResponse.ok) {
        const { token } = await tokenResponse.json();
        if (token) {
          // The socket context will handle the connection
          setMessages(prev => [...prev, 'Attempting to connect to socket...']);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, `Failed to get token: ${error}`]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Socket Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Authentication Status</h3>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        {user && (
          <div>
            <p>User: {user.name} ({user.email})</p>
            <p>Role: {user.role}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Socket Status</h3>
        <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
        <p>Socket ID: {socket?.id || 'Not connected'}</p>
        <button onClick={connectSocket} disabled={isConnected}>
          Connect Socket
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Message</h3>
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Enter test message"
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button onClick={sendTestMessage} disabled={!isConnected}>
          Send Test Message
        </button>
      </div>

      <div>
        <h3>Messages</h3>
        <div style={{ 
          height: '200px', 
          overflowY: 'auto', 
          border: '1px solid #ccc', 
          padding: '10px',
          backgroundColor: '#f9f9f9'
        }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocketTest; 