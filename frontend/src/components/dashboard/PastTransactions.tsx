import React, { useEffect, useState } from 'react';
import styles from './PastTransactions.module.css';
import { BACKEND_BASE_URL } from '../../api/config';

const PastTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Completed');

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/dashboard/past-transactions`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <section className={styles.pastTransactions}><h2>Past Transactions</h2><p>Loading...</p></section>;
  if (!transactions.length) return <section className={styles.pastTransactions}><h2>Past Transactions</h2><p>No transactions found.</p></section>;

  return (
    <section className={styles.pastTransactions}>
      <h2>Past Transactions</h2>
      <div className={styles.transactionTabs}>
        <button className={activeTab === 'Completed' ? styles.tabBtn + ' ' + styles.active : styles.tabBtn} onClick={() => setActiveTab('Completed')}>Completed</button>
        <button className={activeTab === 'Archived' ? styles.tabBtn + ' ' + styles.active : styles.tabBtn} onClick={() => setActiveTab('Archived')}>Archived</button>
      </div>
      <div className={styles.transactionList}>
        <div className={styles.transactionHeader}>
          <span>ID</span>
          <span>Category</span>
          <span>Date</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Action</span>
        </div>
        {transactions.filter(t => (activeTab === 'Completed' ? t.status === 'SUCCESS' : t.status !== 'SUCCESS')).map((t, idx) => (
          <div className={styles.transactionItem} key={t.id || idx}>
            <span className={styles.transactionId}>{t.id}</span>
            <span className={styles.transactionTitle}>{t.category}</span>
            <span className={styles.transactionDate}>{new Date(t.date).toLocaleDateString()}</span>
            <span className={`${styles.statusTag} ${styles[t.status.toLowerCase()] || styles.pending}`}>{t.status}</span>
            <span className={styles.transactionAmount}>₹{t.amount}</span>
            <a href="#" className={styles.viewLog}>View Log</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PastTransactions; 