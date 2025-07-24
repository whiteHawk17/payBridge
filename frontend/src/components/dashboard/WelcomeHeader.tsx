import React, { useEffect, useState } from 'react';
import styles from './WelcomeHeader.module.css';
import { BACKEND_BASE_URL } from '../../api/config';

const WelcomeHeader: React.FC = () => {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.user && (data.user.name || data.user.fullName)) {
          setUserName(data.user.name || data.user.fullName);
        } else if (data.user && data.user.email) {
          setUserName(data.user.email.split('@')[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.welcomeHeader}>
      <h1>Welcome, {userName}!</h1>
      <p>Overview of your secure transactions and activities.</p>
    </div>
  );
};

export default WelcomeHeader; 