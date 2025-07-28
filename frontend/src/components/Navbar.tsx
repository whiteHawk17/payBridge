import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './dashboard/HeaderBar.module.css';
import { BACKEND_BASE_URL } from '../api/config';
import axios from 'axios';

interface NavbarProps {
  onSidebarToggle: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle, darkMode, onDarkModeToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('Navbar User Data:', data); // Debug log
        console.log('Navbar Photo URL:', data.photo); // Debug log
        setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  const handleDropdownToggle = () => {
    setDropdownOpen((open) => !open);
  };

  const handleLogout = async () => {
    await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className={styles.mainHeaderBar}>
      <button className={styles.sidebarToggleBtn} id="sidebar-toggle" onClick={onSidebarToggle}>
        <i className="fas fa-bars"></i>
      </button>
      <div className={styles.headerNav}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            styles.navBtn + (isActive ? ' ' + styles.headerNavLinkActive : '')
          }
          end
        >
          DashBoard <i className="fas fa-rocket"></i>
        </NavLink>
        <NavLink
          to="/rooms/create"
          className={({ isActive }) =>
            styles.headerNavLink + (isActive ? ' ' + styles.headerNavLinkActive : '')
          }
        >
          Create Room
        </NavLink>
        <NavLink
          to="/rooms/join"
          className={({ isActive }) =>
            styles.headerNavLink + (isActive ? ' ' + styles.headerNavLinkActive : '')
          }
        >
          Join Room
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            styles.headerNavLink + (isActive ? ' ' + styles.headerNavLinkActive : '')
          }
        >
          Profile
        </NavLink>
      </div>
      <div className={styles.headerActions}>
        <button
          className={styles.darkModeIconButton}
          onClick={onDarkModeToggle}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            cursor: 'pointer',
            marginRight: 12
          }}
        >
          <i className="fas fa-sun" style={{ display: darkMode ? 'none' : 'inline', color: '#111' }}></i>
          <i className="fas fa-moon" style={{ display: darkMode ? 'inline' : 'none', color: '#fff' }}></i>
        </button>
        <div className={styles.profileDropdown} id="profile-dropdown" ref={dropdownRef}>
          <div
            className={styles.userAvatarHeader}
            id="avatar-button"
            onClick={handleDropdownToggle}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
            tabIndex={0}
          >
            {user && user.photo ? (
              <img 
                src={user.photo.startsWith('http') ? user.photo : BACKEND_BASE_URL + user.photo} 
                alt={user.name} 
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('Image failed to load:', e.currentTarget.src);
                  console.log('User photo field:', user.photo);
                  console.log('BACKEND_BASE_URL:', BACKEND_BASE_URL);
                }}
              />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#5b21b6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18 }}>
                {user ? getInitials(user.name) : 'AM'}
              </div>
            )}
            <i className="fas fa-chevron-down"></i>
          </div>
          <div
            className={
              styles.dropdownMenu +
              (dropdownOpen ? ' ' + styles.profileDropdownActive : '')
            }
            style={{ zIndex: 10 }}
          >
            <button
              className={styles.dropdownItem}
              onClick={handleLogout}
              tabIndex={dropdownOpen ? 0 : -1}
              style={{ display: dropdownOpen ? 'flex' : 'none' }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 