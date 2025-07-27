import React from 'react';
import styles from './KpiGrid.module.css';

interface KpiGridProps {
  analytics: any;
  loading: boolean;
}

const KpiGrid: React.FC<KpiGridProps> = ({ analytics, loading }) => {
  if (loading) return <div className={styles.kpiGrid}><p>Loading...</p></div>;
  if (!analytics || !analytics.kpis) return <div className={styles.kpiGrid}><p>No data.</p></div>;
  
  const kpis = [
    {
      icon: 'fas fa-wallet',
      label: 'Total Transaction Volume',
      value: `₹${(analytics.kpis.totalVolume || 0).toLocaleString('en-IN')}`,
    },
    {
      icon: 'fas fa-check-double',
      label: 'Success Rate',
      value: `${(analytics.kpis.successRate || 0).toFixed(1)}%`,
    },
    {
      icon: 'fas fa-calculator',
      label: 'Average Transaction Value',
      value: `₹${(analytics.kpis.avgValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    },
    {
      icon: 'fas fa-chart-line',
      label: 'Total Transactions',
      value: `${analytics.kpis.totalTransactions || 0}`,
    },
  ];
  
  return (
    <div className={styles.kpiGrid}>
      {kpis.map((kpi, idx) => (
        <div className={styles.kpiCard} key={idx}>
          <div className={styles.kpiIcon}><i className={kpi.icon}></i></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>{kpi.label}</span>
            <p className={styles.kpiValue}>{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiGrid; 