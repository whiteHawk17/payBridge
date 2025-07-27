import React, { useState, useEffect } from 'react';
import StatsHeader from '../../components/quickstats/StatsHeader';
import KpiGrid from '../../components/quickstats/KpiGrid';
import GraphsGrid from '../../components/quickstats/GraphsGrid';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './QuickStatsPage.module.css';

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
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/dashboard/analytics?period=${filterToPeriod[filter]}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          console.error('Failed to fetch analytics');
          setAnalytics(null);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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