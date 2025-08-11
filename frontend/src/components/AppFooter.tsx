import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AppFooter.module.css';

const AppFooter: React.FC = () => {
  return (
    <footer className={styles['app-footer']}>
      <div className={styles['footer-content']}>
        <div className={styles['footer-section']}>
          <h4>PayBridge</h4>
          <p>Secure payment escrow platform for safe transactions</p>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>Support</h4>
          <ul>
            <li>Email: vini17102005@gmail.com</li>
            <li>Phone: 8949716631</li>
          </ul>
        </div>
      </div>
      
      <div className={styles['footer-bottom']}>
        <p>&copy; 2025 PayBridge. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default AppFooter;
