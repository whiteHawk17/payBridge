import React from 'react';
import styles from './PolicyPage.module.css';

const TermsAndConditions: React.FC = () => {
  return (
    <div className={styles['policy-container']}>
      <div className={styles['policy-content']}>
        <h1>Terms and Conditions</h1>
        <p className={styles['last-updated']}>Last updated on {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        
        <div className={styles['policy-section']}>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using PayBridge ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>2. Description of Service</h2>
          <p>PayBridge is a secure payment escrow platform that facilitates transactions between buyers and sellers, ensuring secure payment processing and dispute resolution.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>4. Payment Terms</h2>
          <p>All payments are processed through secure payment gateways. PayBridge holds funds in escrow until the transaction is completed or a dispute is resolved.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>5. Prohibited Activities</h2>
          <p>Users may not use the Service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>6. Dispute Resolution</h2>
          <p>In case of disputes, PayBridge provides a mediation service. Final decisions are made based on evidence provided by both parties.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>7. Limitation of Liability</h2>
          <p>PayBridge shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>8. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website.</p>
        </div>

        <div className={styles['policy-section']}>
          <h2>9. Contact Information</h2>
          <p>For questions about these Terms and Conditions, please contact us at:</p>
          <p>Email: vini17102005@gmail.com</p>
          <p>Phone: 8949716631</p>
          <p>Email: aadityamathur1077@gmail.com</p>
          <p>Phone: +91 8826019356</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
