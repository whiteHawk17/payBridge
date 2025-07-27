import React, { useEffect, useState } from 'react';
import styles from './QuickStats.module.css';
import { BACKEND_BASE_URL } from '../../api/config';

const QuickStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/dashboard/stats`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <section className={styles.quickStats}><h2>Quick Stats</h2><p>Loading...</p></section>;
  if (!stats) return <section className={styles.quickStats}><h2>Quick Stats</h2><p>Failed to load stats.</p></section>;

  const statList = [
    { label: 'Total Transactions', icon: 'fas fa-rocket', value: stats.totalTransactions || 0 },
    { label: 'Successful Transactions', icon: 'fas fa-history', value: stats.successfulTransactions || 0 },
    { label: 'Pending Transactions', icon: 'fas fa-hourglass-half', value: stats.pendingTransactions || 0 },
    { label: 'Funds in Escrow', icon: 'fas fa-shield-alt', value: `₹${stats.fundsInEscrow || 0}` },
    { label: 'Disputes Resolved', icon: 'fas fa-gavel', value: stats.disputesResolved || 0 },
  ];

  return (
    <section className={styles.quickStats}>
      <h2>Quick Stats</h2>
      <div className={styles.statsGrid}>
        {statList.map((stat, idx) => (
          <div className={styles.statCard} key={idx}>
            <div className={styles.statHeader}>
              <span>{stat.label}</span> <i className={stat.icon}></i>
            </div>
            <p className={styles.statNumber}>{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickStats; 