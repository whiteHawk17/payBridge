import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import CreateRoomPage from './features/rooms/CreateRoomPage';
import JoinRoomPage from './features/rooms/JoinRoomPage';
import RoomViewPage from './features/rooms/RoomViewPage';
import QuickStatsPage from './features/quickstats/QuickStatsPage';
import PastTransactionsPage from './features/pasttransactions/PastTransactionsPage';
import ContactPage from './features/contact/ContactPage';
import AccountSettingsPage from './features/accountsettings/AccountSettingsPage';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import UsersManagementPage from './features/admin/UsersManagementPage';
import SettingsPage from './features/admin/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SocketTest from './components/rooms/SocketTest';
import CameraTest from './components/rooms/CameraTest';
// Import policy pages
import TermsPage from './features/policies/TermsPage';
import PrivacyPage from './features/policies/PrivacyPage';
import RefundPage from './features/policies/RefundPage';

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
    <SocketProvider>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          {/* Policy pages - accessible without login */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund-policy" element={<RefundPage />} />
          {/* Contact page - accessible without login */}
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        {/* User protected routes */}
        <Route element={<AppLayout darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/rooms/create" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
          <Route path="/rooms/join" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
          <Route path="/rooms/:roomId" element={<ProtectedRoute><RoomViewPage darkMode={darkMode} /></ProtectedRoute>} />
          <Route path="/quickstats" element={<ProtectedRoute><QuickStatsPage /></ProtectedRoute>} />
          <Route path="/past_transactions" element={<ProtectedRoute><PastTransactionsPage /></ProtectedRoute>} />
          <Route path="/account_settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
        <Route path="/socket-test" element={<ProtectedRoute><SocketTest /></ProtectedRoute>} />
        <Route path="/camera-test" element={<ProtectedRoute><CameraTest /></ProtectedRoute>} />
        </Route>
        {/* Admin protected routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersManagementPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          {/* Add more admin routes here */}
        </Route>
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
