import React from 'react';
import PageHeader from '../../components/pasttransactions/PageHeader';
import TransactionsTable from '../../components/pasttransactions/TransactionsTable';
import styles from './PastTransactionsPage.module.css';

const PastTransactionsPage: React.FC = () => {
  console.log('PastTransactionsPage rendering');
  return (
    <div className={styles.contentArea}>
      <PageHeader />
      <TransactionsTable />
    </div>
  );
};

export default PastTransactionsPage; 