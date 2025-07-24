import React from 'react';
import styles from './PageHeader.module.css';

const PageHeader: React.FC = () => (
  <div className={styles.pageHeader}>
    <h1>Transaction History</h1>
    <p>Review all your past transactions and their statuses.</p>
  </div>
);

export default PageHeader; 