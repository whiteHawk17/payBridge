import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import CreateRoomPage from './features/rooms/CreateRoomPage';
import QuickStatsPage from './features/quickstats/QuickStatsPage';
import PastTransactionsPage from './features/pasttransactions/PastTransactionsPage';
import ContactPage from './features/contact/ContactPage';
import AccountSettingsPage from './features/accountsettings/AccountSettingsPage';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import UsersManagementPage from './features/admin/UsersManagementPage';
import SettingsPage from './features/admin/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    // Only add landing-page class on landing page
    if (location.pathname === '/') {
      document.body.classList.add('landing-page');
    } else {
      document.body.classList.remove('landing-page');
    }
  }, [location.pathname]);

  const handleDarkModeToggle = () => setDarkMode((prev) => !prev);

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
      {/* User protected routes */}
      <Route element={<AppLayout darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />}>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/rooms/create" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
        <Route path="/quickstats" element={<ProtectedRoute><QuickStatsPage /></ProtectedRoute>} />
        <Route path="/past_transactions" element={<ProtectedRoute><PastTransactionsPage /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
        <Route path="/account_settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
      </Route>
      {/* Admin protected routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UsersManagementPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        {/* Add more admin routes here */}
      </Route>
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
