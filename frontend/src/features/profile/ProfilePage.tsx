import React from 'react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileInfoCard from '../../components/profile/ProfileInfoCard';

import NotificationsCard from '../../components/profile/NotificationsCard';
import DangerZoneCard from '../../components/profile/DangerZoneCard';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  return (
    <div className={styles.contentArea}>
      <ProfileHeader />
      <ProfileInfoCard />
      
      <NotificationsCard />
      <DangerZoneCard />
    </div>
  );
};

export default ProfilePage; 