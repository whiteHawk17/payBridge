import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../assets/dashboardTheme.css';

interface AppLayoutProps {
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ darkMode, onDarkModeToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  return (
    <div className={darkMode ? 'dark-mode' : ''} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} darkMode={darkMode} onDarkModeToggle={onDarkModeToggle} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar onSidebarToggle={handleSidebarToggle} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout; 