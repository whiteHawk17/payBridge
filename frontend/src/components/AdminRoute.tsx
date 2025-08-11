import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../api/config';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  console.log('AdminRoute rendered, loading:', loading, 'isAdmin:', isAdmin);

  useEffect(() => {
    console.log('AdminRoute useEffect triggered');
    // Check if user is authenticated and has admin role
    fetch(`${BACKEND_BASE_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('AdminRoute auth response:', data);
        // Check if user exists and has admin role
        if (data.user && data.user.role === 'admin') {
          console.log('User is admin, setting isAdmin to true');
          setIsAdmin(true);
        } else {
          console.log('User is not admin, setting isAdmin to false');
          setIsAdmin(false);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('AdminRoute auth error:', error);
        setIsAdmin(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect non-admin users to dashboard with error message
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
