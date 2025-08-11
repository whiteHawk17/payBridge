import React from 'react';
import styles from './PolicyPage.module.css';

const RefundPolicy: React.FC = () => {
  return (
    <div className={styles['policy-container']}>
      <div className={styles['policy-content']}>
        <h1>Cancellation and Refund Policy</h1>
        <p className={styles['last-updated']}>Last updated on {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        
        <div className={styles['policy-section']}>
          <h2>1. Transaction Cancellation</h2>
          <p>Transactions can be cancelled under the following circumstances:</p>
          <ul>
            <li>Before the seller begins work on the project</li>
            <li>Within 24 hours of transaction initiation (if no work has commenced)</li>
            <li>By mutual agreement between buyer and seller</li>
            <li>Due to technical issues or system errors</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>2. Refund Eligibility</h2>
          <p>Refunds are available in the following cases:</p>
          <ul>
            <li>Transaction cancellation before work begins</li>
            <li>Seller fails to deliver within agreed timeframe</li>
            <li>Quality of work does not meet agreed standards</li>
            <li>Dispute resolution favors the buyer</li>
            <li>Technical issues preventing service delivery</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>3. Refund Process</h2>
          <p>Refund processing follows these steps:</p>
          <ol>
            <li>Refund request submitted through the platform</li>
            <li>Review of request and supporting documentation</li>
            <li>Decision made within 3-5 business days</li>
            <li>Refund processed to original payment method</li>
            <li>Confirmation sent to user</li>
          </ol>
        </div>

        <div className={styles['policy-section']}>
          <h2>4. Refund Timeline</h2>
          <p>Refund processing times:</p>
          <ul>
            <li>Platform review: 3-5 business days</li>
            <li>Payment processor: 5-10 business days</li>
            <li>Bank processing: 3-7 business days</li>
            <li>Total timeline: 11-22 business days</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>5. Non-Refundable Items</h2>
          <p>The following are not eligible for refunds:</p>
          <ul>
            <li>Platform fees and transaction charges</li>
            <li>Completed work that meets agreed specifications</li>
            <li>Services already consumed or delivered</li>
            <li>Disputes resolved in favor of the seller</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>6. Dispute Resolution</h2>
          <p>For disputes regarding refunds:</p>
          <ul>
            <li>Submit detailed dispute through the platform</li>
            <li>Provide evidence and documentation</li>
            <li>Mediation process initiated</li>
            <li>Final decision made by PayBridge team</li>
          </ul>
        </div>

        <div className={styles['policy-section']}>
          <h2>7. Contact Information</h2>
          <p>For refund and cancellation requests, contact us at:</p>
          <p>Email: vini17102005@gmail.com</p>
          <p>Phone: 8949716631</p>
          <p>Email: aadityamathur1077@gmail.com</p>
          <p>Phone: +91 8826019356</p>
          <p>Helpdesk: Available through the platform</p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
