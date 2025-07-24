import React, { useState } from 'react';
import styles from './NotificationsCard.module.css';

const NotificationsCard: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className={styles.profileCard}>
      <div className={styles.cardHeader}>
        <h2>Notifications</h2>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <div className={styles.notificationText}>
            <span className={styles.infoLabel}>Email Notifications</span>
            <span className={styles.infoDescription}>Receive updates about your transactions and account activity.</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications((v) => !v)}
            />
            <span className={styles.slider + ' ' + styles.round}></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationsCard; 