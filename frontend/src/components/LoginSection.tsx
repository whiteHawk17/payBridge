import React, { useRef, useState } from 'react';
import { BACKEND_BASE_URL } from '../api/config';

const LoginSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const responseMessageRef = useRef<HTMLDivElement>(null);

  // Google OAuth (direct)
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_BASE_URL}/auth/google`;
  };

  // Email check and Google OAuth
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (res.ok && result.exists) {
        // Email exists, start Google OAuth for this email
        window.location.href = `${BACKEND_BASE_URL}/auth/google?email=${encodeURIComponent(email)}`;
      } else {
        setMessage('User does not exist.');
      }
    } catch {
      setMessage('Server error. Try again.');
    }
  };

  return (
    <section className="login-section" id="login-section">
      <div className="login-container">
        <h2 className="login-title">Secure Access Made Simple</h2>
        <p className="login-subtitle">Accessing your account is easy. Pick your preferred login method.</p>
        <div className="social-login-container">
          <button className="social-login-btn" onClick={handleGoogleLogin}>
            <i className="fab fa-google"></i> Continue with Google
          </button>
        </div>
        <div className="divider">
          <span>OR Login with email</span>
        </div>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <i className="fas fa-envelope input-icon"></i>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn-main">Login</button>
          <div id="responseMessage" ref={responseMessageRef} style={{ marginTop: '1rem', color: 'red' }}>
            {message}
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginSection; 