import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './CreateRoomForm.module.css';

// Declare Razorpay as a global variable
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CreateRoomForm: React.FC = () => {
  const [role, setRole] = useState<'buyer' | 'seller'>();
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [otherPartyEmail, setOtherPartyEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailValidation, setEmailValidation] = useState<{isValid: boolean, message: string}>({isValid: true, message: ''});
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const navigate = useNavigate();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => setError('Failed to load payment gateway');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change with validation
  const handleEmailChange = (email: string) => {
    setOtherPartyEmail(email);
    
    if (!email) {
      setEmailValidation({isValid: true, message: ''});
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailValidation({isValid: false, message: 'Please enter a valid email address'});
      return;
    }
    
    setEmailValidation({isValid: true, message: ''});
  };

  // Verify email with backend
  const verifyEmail = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      return response.ok && data.isValid;
    } catch (error) {
      console.log('Email verification error:', error);
      return true; // Assume valid if verification fails
    }
  };

  // Handle Razorpay payment
  const handlePayment = async (roomId: string, amount: number, description: string) => {
    try {
      // Create payment order
      const response = await fetch(`${BACKEND_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          roomId,
          amount,
          description
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Initialize Razorpay payment
      const options = {
        key: data.key,
        amount: data.amount * 100, // Convert to paise
        currency: data.currency,
        name: 'PayBridge',
        description: description,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment with backend
            const verifyResponse = await fetch(`${BACKEND_BASE_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok) {
              setSuccess('Payment successful! Room created and activated.');
              setTimeout(() => {
                navigate(`/rooms/${verifyData.roomId}`);
              }, 2000);
            } else {
              setError('Payment verification failed: ' + verifyData.error);
            }
          } catch (error) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled. You can try again.');
          },
        },
        on: {
          failed: (response: any) => {
            setError('Payment failed: ' + (response.error.description || 'Unknown error'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment initialization failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that a role is selected
    if (!role) {
      setError('Please select your role (Buyer or Seller)');
      return;
    }

    // Validate email
    if (!otherPartyEmail.trim()) {
      setError('Please enter the other party\'s email address');
      return;
    }

    if (!validateEmail(otherPartyEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Verify email with backend
    const isEmailValid = await verifyEmail(otherPartyEmail);
    if (!isEmailValid) {
      setError('Email verification failed. Please check the email address.');
      return;
    }

    // Check if Razorpay is loaded
    if (!isRazorpayLoaded) {
      setError('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestBody = {
        role,
        description,
        price: parseFloat(price),
        date,
        otherPartyEmail: otherPartyEmail.trim()
      };
      
      console.log('Submitting form with role:', role, 'Full request body:', requestBody);
      
      const response = await fetch(`${BACKEND_BASE_URL}/dashboard/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // If user is buyer, initiate payment
      if (role === 'buyer') {
        setSuccess('Room created! Initiating payment...');
        await handlePayment(data.room._id, parseFloat(price), description);
      } else {
        // If user is seller, just show success and redirect
        setSuccess('Room created successfully! Waiting for buyer to make payment...');
        setTimeout(() => {
          navigate(`/rooms/${data.room._id}`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1>Create New Transaction Room</h1>
        <p>Initiate a secure transaction by defining your role and transaction details.</p>
        {!isRazorpayLoaded && (
          <div className={styles.loadingMessage}>
            <i className="fas fa-spinner fa-spin"></i> Loading payment gateway...
          </div>
        )}
      </div>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Your Role <span style={{color: 'red'}}>*</span></label>
          <div className={styles.roleSelector}>
            <label className={role === 'buyer' ? styles.roleOption + ' ' + styles.active : styles.roleOption}>
              <input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} />
              <div className={styles.roleContent}>
                <i className="fas fa-shopping-cart"></i>
                <strong>I am a Buyer</strong>
              </div>
            </label>
            <label className={role === 'seller' ? styles.roleOption + ' ' + styles.active : styles.roleOption}>
              <input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} />
              <div className={styles.roleContent}>
                <i className="fas fa-tag"></i>
                <strong>I am a Seller</strong>
              </div>
            </label>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="item-description">Item/Service Description</label>
          <textarea id="item-description" rows={4} placeholder="e.g., Vintage Camera, Graphic Design Service" required value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="other-party-email">
            Other Party's Email <span style={{color: 'red'}}>*</span>
          </label>
          <input 
            type="email" 
            id="other-party-email" 
            placeholder="e.g., john@example.com" 
            required 
            value={otherPartyEmail} 
            onChange={e => handleEmailChange(e.target.value)}
            className={!emailValidation.isValid ? styles.errorInput : ''}
          />
          {!emailValidation.isValid && (
            <div className={styles.validationError}>
              {emailValidation.message}
            </div>
          )}
          <small className={styles.helpText}>
            An invitation email will be sent to this address with room details
          </small>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price (₹)</label>
            <input type="number" id="price" placeholder="e.g., 500.00" required value={price} onChange={e => setPrice(e.target.value)} />
            {role === 'buyer' && price && (
              <div className={styles.commissionInfo}>
                <small>
                  Commission: ₹{(parseFloat(price) * 0.05).toFixed(2)} (5%)<br/>
                  Total: ₹{(parseFloat(price) * 1.05).toFixed(2)}
                </small>
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="completion-date">Desired Completion Date</label>
            <input type="date" id="completion-date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.btn + ' ' + styles.btnSecondary} onClick={() => navigate('/dashboard')}>Cancel</button>
          <button type="submit" className={styles.btn + ' ' + styles.btnPrimary} disabled={isLoading}>
            {isLoading ? 'Creating...' : role === 'buyer' ? 'Create Room & Pay' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomForm; 