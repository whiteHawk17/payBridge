import React, { useState } from 'react';
import styles from './CreateRoomForm.module.css';

const CreateRoomForm: React.FC = () => {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend
    alert('Room created!');
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1>Create New Transaction Room</h1>
        <p>Initiate a secure transaction by defining your role and transaction details.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Your Role</label>
          <div className={styles.roleSelector}>
            <label className={role === 'buyer' ? styles.roleOption + ' ' + styles.active : styles.roleOption}>
              <input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} />
              <div className={styles.roleContent}>
                <i className="fas fa-shopping-cart"></i>
                <strong>I am a Buyer</strong>
                <span>Purchase an item or service securely.</span>
              </div>
            </label>
            <label className={role === 'seller' ? styles.roleOption + ' ' + styles.active : styles.roleOption}>
              <input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} />
              <div className={styles.roleContent}>
                <i className="fas fa-tag"></i>
                <strong>I am a Seller</strong>
                <span>Sell an item or offer a service with peace of mind.</span>
              </div>
            </label>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="item-description">Item/Service Description</label>
          <textarea id="item-description" rows={4} placeholder="e.g., Vintage Camera, Graphic Design Service" required value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price (₹)</label>
            <input type="number" id="price" placeholder="e.g., 500.00" required value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="completion-date">Desired Completion Date</label>
            <input type="date" id="completion-date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea id="notes" rows={3} placeholder="Any special instructions, conditions, or delivery details?" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.btn + ' ' + styles.btnSecondary} onClick={() => window.location.href = '/dashboard'}>Cancel</button>
          <button type="submit" className={styles.btn + ' ' + styles.btnPrimary}>Create Room</button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomForm; 