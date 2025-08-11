import React, { useState } from 'react';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './PaymentReleaseButton.module.css';

interface PaymentReleaseButtonProps {
  roomId: string;
  transactionId: string;
  amount: number;
  sellerName: string;
  onPaymentReleased: () => void;
}

const PaymentReleaseButton: React.FC<PaymentReleaseButtonProps> = ({
  roomId,
  transactionId,
  amount,
  sellerName,
  onPaymentReleased
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReleasePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/payment/release/${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        onPaymentReleased();
        setShowConfirmation(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to release payment');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className={styles.releaseButton}
        onClick={() => setShowConfirmation(true)}
      >
        💰 Release Payment to Seller
      </button>

      {showConfirmation && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>⚠️ Confirm Payment Release</h3>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.warningIcon}>
                ⚠️
              </div>
              
              <h4>Are you sure you want to release the payment?</h4>
              
              <div className={styles.paymentDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Amount:</span>
                  <span className={styles.value}>₹{amount.toLocaleString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Seller:</span>
                  <span className={styles.value}>{sellerName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Room ID:</span>
                  <span className={styles.value}>{roomId}</span>
                </div>
              </div>

              <div className={styles.warningText}>
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This action cannot be undone</li>
                  <li>Payment will be transferred to the seller's account</li>
                  <li>Make sure you're satisfied with the delivered work</li>
                </ul>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowConfirmation(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmButton}
                  onClick={handleReleasePayment}
                  disabled={loading}
                >
                  {loading ? 'Releasing...' : 'Yes, Release Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentReleaseButton;
