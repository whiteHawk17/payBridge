import React, { useState, useEffect } from 'react';
import StatsHeader from '../../components/quickstats/StatsHeader';
import KpiGrid from '../../components/quickstats/KpiGrid';
import GraphsGrid from '../../components/quickstats/GraphsGrid';
import styles from './QuickStatsPage.module.css';
import axios from 'axios';

const filterOptions = ['Last 30 Days', 'Last 90 Days', 'All Time'] as const;
type FilterKey = typeof filterOptions[number];

const filterToPeriod: Record<FilterKey, string> = {
  'Last 30 Days': '30d',
  'Last 90 Days': '90d',
  'All Time': 'all',
};

const QuickStatsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterKey>('Last 30 Days');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/dashboard/analytics?period=${filterToPeriod[filter]}`, { withCredentials: true })
      .then(res => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div className={styles.contentArea}>
      <StatsHeader onFilterChange={setFilter} />
      <KpiGrid analytics={analytics} loading={loading} />
      <GraphsGrid analytics={analytics} loading={loading} />
    </div>
  );
};

export default QuickStatsPage; 