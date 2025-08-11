import React, { useState, useEffect } from 'react';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './SellerPaymentDetailsForm.module.css';

interface SellerPaymentDetails {
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  accountHolderName: string;
}

interface SellerPaymentDetailsFormProps {
  roomId: string;
  onDetailsSubmitted: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const SellerPaymentDetailsForm: React.FC<SellerPaymentDetailsFormProps> = ({
  roomId,
  onDetailsSubmitted,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState<SellerPaymentDetails>({
    upiId: '',
    bankAccount: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingDetails, setExistingDetails] = useState<SellerPaymentDetails | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingDetails();
    }
  }, [isOpen, roomId]);

  const fetchExistingDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/dashboard/rooms/${roomId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const roomData = await response.json();
        if (roomData.sellerPaymentDetails && roomData.sellerPaymentDetails.isDetailsComplete) {
          setExistingDetails(roomData.sellerPaymentDetails);
          setFormData(roomData.sellerPaymentDetails);
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing details:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/dashboard/rooms/${roomId}/seller-payment-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onDetailsSubmitted();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save payment details');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>💰 Payment Details Setup</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalContent}>
          {existingDetails ? (
            <div className={styles.existingDetails}>
              <p>✅ Your payment details are already set up!</p>
              <div className={styles.detailsDisplay}>
                <div><strong>UPI ID:</strong> {existingDetails.upiId}</div>
                <div><strong>Account:</strong> {existingDetails.bankAccount}</div>
                <div><strong>IFSC:</strong> {existingDetails.ifscCode}</div>
                <div><strong>Name:</strong> {existingDetails.accountHolderName}</div>
              </div>
              <button className={styles.editButton} onClick={() => setExistingDetails(null)}>
                ✏️ Edit Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className={styles.description}>
                Please provide your payment details so we can release funds to you when the work is completed.
              </p>
              
              <div className={styles.formGroup}>
                <label htmlFor="upiId">UPI ID *</label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="yourname@upi"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bankAccount">Bank Account Number</label>
                <input
                  type="text"
                  id="bankAccount"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ifscCode">IFSC Code</label>
                <input
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="SBIN0001234"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="accountHolderName">Account Holder Name</label>
                <input
                  type="text"
                  id="accountHolderName"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Your Full Name"
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerPaymentDetailsForm;
