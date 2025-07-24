import React from 'react';
import WelcomeHeader from '../../components/dashboard/WelcomeHeader';
import QuickStats from '../../components/dashboard/QuickStats';
import ActiveRooms from '../../components/dashboard/ActiveRooms';
import PastTransactions from '../../components/dashboard/PastTransactions';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  return (
    <div className={styles.contentArea}>
      <WelcomeHeader />
      <QuickStats />
      <ActiveRooms />
      <PastTransactions />
    </div>
  );
};

export default DashboardPage; 