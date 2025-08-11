import React from 'react';
import styles from './PolicyPage.module.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className={styles['policy-container']}>
      <div className={styles['policy-content']}>
        <h1>Privacy Policy</h1>
        <p className={styles['last-updated']}>Last updated on {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        
        <div className={styles['policy-section']}>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a transaction, or contact us for support.</p>
          <ul>
            <li>Personal identification information (name, email address, phone number)</li>
            <li>Payment information (processed securely through our payment partners)</li>
            <li>Transaction history and communication records</li>
            <li>Device and usage information</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in our operations</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>5. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>7. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to enhance your experience and analyze usage patterns.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>8. Contact Information</h2>
          <p>For privacy-related questions, please contact us at:</p>
          <p>Email: vini17102005@gmail.com</p>
          <p>Phone: 8949716631</p>
          <p>Email: aadityamathur1077@gmail.com</p>
          <p>Phone: +91 8826019356</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
