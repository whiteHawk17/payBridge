import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './dashboard/Sidebar.module.css';
import { BACKEND_BASE_URL } from '../api/config';

interface SidebarProps {
  open: boolean;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, darkMode, onDarkModeToggle }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside className={styles.sidebar} id="sidebar" style={{ display: open ? 'flex' : 'none' }}>
      <div className={styles.sidebarProfile}>
        {user && user.photo ? (
          <img 
            src={user.photo.startsWith('http') ? user.photo : BACKEND_BASE_URL + user.photo} 
            alt={user.name} 
            className={styles.userAvatar} 
            style={{ width: 40, height: 40, borderRadius: '50%' }}
            onError={(e) => {
              console.error('Sidebar image failed to load:', e.currentTarget.src);
              // Hide the broken image and show initials instead
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.fallback-avatar') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
        ) : (
          <div className={`${styles.userAvatar} fallback-avatar`}>{user ? getInitials(user.name) : 'AM'}</div>
        )}
        <span className={styles.userMainName}>{user ? user.name : 'User'}</span>
      </div>
      <nav className={styles.sidebarNav}>
        <Link to="/dashboard" className={styles.navLink}><i className="fas fa-rocket"></i><span>Dashboard</span></Link>
        <Link to="/profile" className={styles.navLink}><i className="fas fa-user-circle"></i><span>Profile</span></Link>
        <Link to="/rooms/create" className={styles.navLink}><i className="fas fa-plus"></i><span>Create Room</span></Link>
        <Link to="/quickstats" className={styles.navLink}><i className="fas fa-chart-line"></i><span>Quick Stats</span></Link>
        <Link to="/past_transactions" className={styles.navLink}><i className="fas fa-history"></i><span>Past Transactions</span></Link>
        <Link to="/contact" className={styles.navLink}><i className="fas fa-headset"></i><span>Contact Us</span></Link>
        <Link to="/account_settings" className={styles.navLink}><i className="fas fa-cog"></i><span>Account Settings</span></Link>
        
        {/* Admin Dashboard Link - Only visible to admin users */}
        {user && user.role === 'admin' && (
          <Link to="/admin/dashboard" className={styles.navLink} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '16px', paddingTop: '16px' }}>
            <i className="fas fa-shield-alt" style={{ color: '#fbbf24' }}></i>
            <span style={{ color: '#fbbf24', fontWeight: '600' }}>Admin Panel</span>
          </Link>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar; 