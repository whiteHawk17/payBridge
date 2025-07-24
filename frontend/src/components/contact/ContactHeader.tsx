import React from 'react';
import styles from './ContactHeader.module.css';

const ContactHeader: React.FC = () => (
  <div className={styles.pageHeader}>
    <h1>Get in Touch</h1>
    <p>Have questions or need support? We're here to help.</p>
  </div>
);

export default ContactHeader; 