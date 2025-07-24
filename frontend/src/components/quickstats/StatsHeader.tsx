import React, { useState } from 'react';
import styles from './StatsHeader.module.css';

// Import FilterKey from QuickStatsPage or define it here for reuse
export const filterOptions = ['Last 30 Days', 'Last 90 Days', 'All Time'] as const;
export type FilterKey = typeof filterOptions[number];

const filters = filterOptions;

interface StatsHeaderProps {
  onFilterChange?: (filter: FilterKey) => void;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>(filters[0]);

  const handleFilterClick = (filter: FilterKey) => {
    setActiveFilter(filter);
    if (onFilterChange) onFilterChange(filter);
  };

  return (
    <div className={styles.statsHeader}>
      <div className={styles.headerText}>
        <h1>Stats & Analytics</h1>
        <p>An overview of your transaction history and performance.</p>
      </div>
      <div className={styles.dateFilter}>
        {filters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? styles.filterBtn + ' ' + styles.active : styles.filterBtn}
            onClick={() => handleFilterClick(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatsHeader; 