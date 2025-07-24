import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      {/* TODO: Replace with actual AdminSidebar and AdminNavbar */}
      <aside style={{ width: 240, background: '#222', color: '#fff', minHeight: '100vh', padding: 24 }}>
        <h2>Admin Panel</h2>
        <nav>
          <Link to="/admin/dashboard" style={{ color: '#fff', display: 'block', margin: '12px 0' }}>Dashboard</Link>
          <Link to="/admin/users" style={{ color: '#fff', display: 'block', margin: '12px 0' }}>Users</Link>
          <Link to="/admin/settings" style={{ color: '#fff', display: 'block', margin: '12px 0' }}>Settings</Link>
        </nav>
      </aside>
      <div style={{ flex: 1, background: '#f5f5f5', minHeight: '100vh' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 