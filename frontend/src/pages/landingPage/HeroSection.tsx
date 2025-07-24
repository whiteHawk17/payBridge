import React from 'react';
import  { jwtDecode }  from 'jwt-decode';
import { BACKEND_BASE_URL } from '../../api/config';

const HeroSection: React.FC = () => {
  const handleStartTransaction = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token as string);
        if (decoded.exp * 1000 > Date.now()) {
          // Token is valid, redirect to dashboard or transaction page
          window.location.href = '/dashboard';
          return;
        }
      } catch (e) {
        // Invalid token, fall through to login
      }
    }
    // Not authenticated, scroll to login
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="animated-headline">The Safest Way to Transact Online</h1>
        <p>We secure your funds and only release them when both parties are satisfied. Complete your deals with confidence.</p>
        <button className="btn btn-primary btn-large" onClick={handleStartTransaction}>
          Start a Secure Transaction
        </button>
      </div>
    </section>
  );
};

export default HeroSection; 