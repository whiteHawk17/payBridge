import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { BACKEND_BASE_URL } from '../api/config';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { socket, connect, disconnect } = useSocket();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the existing /auth/me endpoint to check authentication
        const response = await fetch(`${BACKEND_BASE_URL}/auth/me`, {
          credentials: 'include',
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
          
          // Get token for socket connection
          const tokenResponse = await fetch(`${BACKEND_BASE_URL}/auth/token`, {
            credentials: 'include',
          });
          
          if (tokenResponse.ok) {
            const { token } = await tokenResponse.json();
            if (token) {
              connect(token);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [connect]);

  const login = async (token: string) => {
    try {
      // For Google OAuth, the token is already set in HTTP-only cookie
      // Just check authentication again
      const response = await fetch(`${BACKEND_BASE_URL}/auth/me`, {
        credentials: 'include',
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
        
        // Connect to socket with the token
        connect(token);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear HTTP-only cookie
      await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      disconnect();
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };
}; 