import React, { useState } from 'react';
import styles from './DangerZoneCard.module.css';
import axios from 'axios';

const DangerZoneCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.delete('/profile', { withCredentials: true });
      setSuccess(res.data.message || 'Account deleted successfully.');
      setTimeout(() => {
        window.location.href = '/login'; // Redirect to login page after deletion
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete account.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.profileCard + ' ' + styles.dangerZone}>
      <div className={styles.cardHeader}>
        <h2>Danger Zone</h2>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <div className={styles.notificationText}>
            <span className={styles.infoLabel}>Delete Account</span>
            <span className={styles.infoDescription}>Once you delete your account, there is no going back. Please be certain.</span>
          </div>
          <button className={styles.btn + ' ' + styles.btnDanger} onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>
    </div>
  );
};

export default DangerZoneCard; 