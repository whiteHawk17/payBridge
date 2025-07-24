import React, { useState } from 'react';
import { PaymentMethod } from '../../features/accountsettings/AccountSettingsPage';
import styles from './AddMethodModal.module.css';

interface AddMethodModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (method: PaymentMethod) => void;
}

const AddMethodModal: React.FC<AddMethodModalProps> = ({ open, onClose, onAdd }) => {
  const [type, setType] = useState<'upi' | 'bank'>('upi');
  const [upi, setUpi] = useState('');
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'upi') {
      if (!upi.trim()) return alert('Please enter a valid UPI ID.');
      onAdd({ type: 'upi', upi, default: false });
    } else {
      if (!account.trim() || !ifsc.trim()) return alert('Please enter valid bank details.');
      onAdd({ type: 'bank', account, ifsc, default: false });
    }
    setUpi('');
    setAccount('');
    setIfsc('');
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h3>Add Payment Method</h3>
        <form onSubmit={handleSubmit}>
          <label>
            <input type="radio" name="methodType" value="upi" checked={type === 'upi'} onChange={() => setType('upi')} /> UPI ID
          </label>
          <label>
            <input type="radio" name="methodType" value="bank" checked={type === 'bank'} onChange={() => setType('bank')} /> Bank Account
          </label>
          {type === 'upi' ? (
            <div className={styles.formGroup}>
              <label htmlFor="upi-id">UPI ID</label>
              <input type="text" id="upi-id" placeholder="example@upi" value={upi} onChange={e => setUpi(e.target.value)} />
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label htmlFor="account-number">Account Number</label>
              <input type="text" id="account-number" placeholder="1234567890" value={account} onChange={e => setAccount(e.target.value)} />
              <label htmlFor="ifsc">IFSC Code</label>
              <input type="text" id="ifsc" placeholder="SBIN0000001" value={ifsc} onChange={e => setIfsc(e.target.value)} />
            </div>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.btn + ' ' + styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btn + ' ' + styles.btnPrimary}>Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMethodModal; 