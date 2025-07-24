import React, { useEffect, useState } from 'react';
import styles from './dashboard/Sidebar.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface SidebarProps {
  open: boolean;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, darkMode, onDarkModeToggle }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    axios.get('/profile', { withCredentials: true })
      .then(res => setUser(res.data))
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
          <img src={user.photo} alt={user.name} className={styles.userAvatar} style={{ width: 40, height: 40, borderRadius: '50%' }} />
        ) : (
          <div className={styles.userAvatar}>{user ? getInitials(user.name) : 'AM'}</div>
        )}
        <span className={styles.userMainName}>{user ? user.name : 'User'}</span>
      </div>
      <div className={styles.darkmodeToggleContainer}>
        <button
          className={styles.toggleButton + (darkMode ? ' ' + styles.toggleButtonActive : '')}
          onClick={onDarkModeToggle}
          aria-pressed={darkMode}
        >
          <span className={styles.toggleThumb}></span>
        </button>
        <span className={styles.darkmodeLabel}>Dark Mode</span>
      </div>
      <nav className={styles.sidebarNav}>
        <Link to="/dashboard" className={styles.navLink}><i className="fas fa-rocket"></i><span>Dashboard</span></Link>
        <Link to="/profile" className={styles.navLink}><i className="fas fa-user-circle"></i><span>Profile</span></Link>
        <Link to="/rooms/create" className={styles.navLink}><i className="fas fa-plus"></i><span>Create Room</span></Link>
        <Link to="/quickstats" className={styles.navLink}><i className="fas fa-chart-line"></i><span>Quick Stats</span></Link>
        <Link to="/past_transactions" className={styles.navLink}><i className="fas fa-history"></i><span>Past Transactions</span></Link>
        <Link to="/contact" className={styles.navLink}><i className="fas fa-headset"></i><span>Contact Us</span></Link>
        <Link to="/account_settings" className={styles.navLink}><i className="fas fa-cog"></i><span>Account Settings</span></Link>
      </nav>
    </aside>
  );
};

export default Sidebar; 