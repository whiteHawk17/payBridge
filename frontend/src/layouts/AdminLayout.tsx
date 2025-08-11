import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../api/config';

interface User {
  name: string;
  email: string;
  role: string;
}

const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user info
    fetch(`${BACKEND_BASE_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Admin Sidebar */}
      <aside style={{ 
        width: 280, 
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)', 
        color: '#fff', 
        padding: '24px 0',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Admin Header */}
        <div style={{ padding: '0 24px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>🔐 Admin Panel</h2>
          {user && (
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              <div style={{ fontWeight: '600' }}>{user.name}</div>
              <div style={{ opacity: 0.8 }}>{user.email}</div>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                marginTop: '8px',
                display: 'inline-block'
              }}>
                {user.role.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '24px 0' }}>
          <div style={{ padding: '0 24px' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, margin: '0 0 16px 0' }}>
              Dashboard
            </h3>
          </div>
          
          <Link 
            to="/admin/dashboard" 
            style={{ 
              color: '#fff', 
              display: 'block', 
              padding: '12px 24px',
              textDecoration: 'none',
              borderLeft: '3px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderLeftColor = '#60a5fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderLeftColor = 'transparent';
            }}
          >
            📊 Analytics Dashboard
          </Link>
          
          <Link 
            to="/admin/users" 
            style={{ 
              color: '#fff', 
              display: 'block', 
              padding: '12px 24px',
              textDecoration: 'none',
              borderLeft: '3px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderLeftColor = '#60a5fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderLeftColor = 'transparent';
            }}
          >
            👥 Users Management
          </Link>
          
          <Link 
            to="/admin/settings" 
            style={{ 
              color: '#fff', 
              display: 'block', 
              padding: '12px 24px',
              textDecoration: 'none',
              borderLeft: '3px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderLeftColor = '#60a5fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderLeftColor = 'transparent';
            }}
          >
            ⚙️ System Settings
          </Link>
        </nav>

        {/* Quick Actions */}
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, margin: '0 0 16px 0' }}>
            Quick Actions
          </h3>
          
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%',
              marginBottom: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            🏠 Go to User Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.8)',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.8)'}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f8fafc', minHeight: '100vh' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 