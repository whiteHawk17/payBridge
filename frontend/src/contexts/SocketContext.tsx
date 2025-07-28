import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BACKEND_BASE_URL } from '../api/config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = (token: string) => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io('http://localhost:3002', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Auto-connect when component mounts if user is authenticated
  useEffect(() => {
    const autoConnect = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await fetch(`${BACKEND_BASE_URL}/auth/me`, {
          credentials: 'include',
        });

        if (authResponse.ok) {
          // User is authenticated, get token and connect
          const tokenResponse = await fetch(`${BACKEND_BASE_URL}/auth/token`, {
            credentials: 'include',
          });
          
          if (tokenResponse.ok) {
            const { token } = await tokenResponse.json();
            if (token) {
              connect(token);
            }
          }
        }
      } catch (error) {
        console.error('Auto-connect error:', error);
      }
    };

    autoConnect();
  }, []);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 