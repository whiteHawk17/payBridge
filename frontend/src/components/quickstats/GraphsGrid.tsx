import React from 'react';
import styles from './GraphsGrid.module.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface GraphsGridProps {
  analytics: any;
  loading: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#fa8072'];

const GraphsGrid: React.FC<GraphsGridProps> = ({ analytics, loading }) => {
  // Prepare data for each chart
  // 1. Transaction Volume (LineChart)
  const volumeData = analytics?.weeklyVolume?.map((val: number, idx: number) => ({
    name: `Week ${idx + 1}`,
    volume: val,
  })) || [];

  // 2. Transaction Status (PieChart)
  const statusData = analytics?.statusCounts
    ? Object.entries(analytics.statusCounts).map(([key, value]) => ({ name: key, value }))
    : [];

  // 3. Transaction Value Distribution (BarChart)
  const valueDistData = analytics?.valueDistribution
    ? Object.entries(analytics.valueDistribution).map(([key, value]) => ({ name: key, value }))
    : [];

  // 4. Transaction by Category (RadarChart)
  const categoryData = analytics?.categoryBreakdown
    ? Object.entries(analytics.categoryBreakdown).map(([key, value]) => ({ category: key, value }))
    : [];

  return (
    <div className={styles.graphsGrid}>
      {/* Transaction Volume (LineChart) */}
      <div className={styles.graphCard}>
        <h3>Transaction Volume (₹)</h3>
        <div className={styles.chartPlaceholder}>
          {loading ? <p>Loading...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {/* Transaction Status (PieChart) */}
      <div className={styles.graphCard}>
        <h3>Transaction Status</h3>
        <div className={styles.chartPlaceholder}>
          {loading ? <p>Loading...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {/* Transaction Value Distribution (BarChart) */}
      <div className={styles.graphCard}>
        <h3>Transaction Value Distribution</h3>
        <div className={styles.chartPlaceholder}>
          {loading ? <p>Loading...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valueDistData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {/* Transaction by Category (RadarChart) */}
      <div className={styles.graphCard}>
        <h3>Transaction by Category</h3>
        <div className={styles.chartPlaceholder}>
          {loading ? <p>Loading...</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={categoryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis />
                <Radar name="Transactions" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphsGrid; 