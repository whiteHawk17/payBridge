import React from 'react';
import styles from './ProfileHeader.module.css';

const ProfileHeader: React.FC = () => (
  <div className={styles.profileHeader}>
    <h1>Profile Settings</h1>
    <p>Manage your personal information, security, and notification preferences.</p>
  </div>
);

export default ProfileHeader; 