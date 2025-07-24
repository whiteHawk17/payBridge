import React, { useEffect } from 'react';
import { BACKEND_BASE_URL } from '../../api/config';
import { Link } from 'react-router-dom';

const MainHeader: React.FC = () => {
  useEffect(() => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const logoUp = document.getElementById('logo-scrollUp');
    if (themeToggleBtn) {
      themeToggleBtn.onclick = () => {
        body.classList.toggle('light-mode');
      };
    }
    if (logoUp) {
      logoUp.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      
    }
    return () => {
      if (themeToggleBtn) themeToggleBtn.onclick = null;
      if (logoUp) logoUp.onclick = null;
    };
  }, []);

  const handleLoginClick = () => {
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinNowClick = () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/google`;
  };

  return (
    <header className="main-header">
      <nav className="navbar">
        <div className="logo btn" id="logo-scrollUp">Pay<span>Bridge</span></div>
        <ul className="nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#about-us">About Us</a></li>
        </ul>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={handleLoginClick}>Login</button>
          <button className="btn btn-primary" onClick={handleJoinNowClick}>Join Now &rarr;</button>
          <button className="btn theme-toggle-btn" id="theme-toggle">
            <i className="fas fa-sun sun-icon"></i>
            <i className="fas fa-moon moon-icon"></i>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default MainHeader; 