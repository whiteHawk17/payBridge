import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../api/config';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(res => res.ok)
      .then(ok => {
        setAuthenticated(ok);
        setLoading(false);
      })
      .catch(() => {
        setAuthenticated(false);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // or a spinner
  return authenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute; 