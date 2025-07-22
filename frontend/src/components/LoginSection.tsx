import React, { useRef } from 'react';

const LoginSection: React.FC = () => {
  const responseMessageRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    // No password field in the current form, so only email is used
    const loginData = { email };
    try {
      // IMPORTANT: Replace with your real backend API URL
      const apiURL = 'https://vinays-api-url.com/api/login';
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const result = await response.json();
      if (responseMessageRef.current) {
        if (response.ok) {
          responseMessageRef.current.textContent = result.message || 'Login Successful!';
          responseMessageRef.current.style.color = 'green';
        } else {
          responseMessageRef.current.textContent = result.message || 'Login Failed. Please check your credentials.';
          responseMessageRef.current.style.color = 'red';
        }
      }
    } catch (error) {
      if (responseMessageRef.current) {
        responseMessageRef.current.textContent = 'Could not connect to the server.';
        responseMessageRef.current.style.color = 'red';
      }
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <h2 className="login-title">Secure Access Made Simple</h2>
        <p className="login-subtitle">Accessing your account is easy. Pick your preferred login method.</p>
        <div className="social-login-container">
          <button className="social-login-btn"><i className="fab fa-google"></i> Continue with Google</button>
        </div>
        <div className="divider">
          <span>OR Register/Login with email</span>
        </div>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <i className="fas fa-envelope input-icon"></i>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
          </div>
          <button type="submit" className="btn btn-primary login-btn-main">Login</button>
          <div id="responseMessage" ref={responseMessageRef} style={{ marginTop: '1rem' }}></div>
        </form>
      </div>
    </section>
  );
};

export default LoginSection; 