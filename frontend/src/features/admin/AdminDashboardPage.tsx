import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    pendingPayouts: 0
  });

  console.log('AdminDashboardPage rendered, user:', user);

  useEffect(() => {
    // Simple mock data for now - friend can replace with real API calls
    setStats({
      totalUsers: 15,
      totalTransactions: 8,
      totalAmount: 25000,
      pendingPayouts: 3
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔐 Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your platform here.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">💵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayouts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors">
              👥 Manage Users
            </button>
            <button className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors">
              💰 View Transactions
            </button>
            <button className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors">
              ⚙️ System Settings
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">📊 Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                <span>New user registered: John Doe</span>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-blue-500 mr-3">💰</span>
                <span>Payment released: ₹5,000</span>
              </div>
              <span className="text-sm text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-3">⚠️</span>
                <span>Dispute reported in Room #123</span>
              </div>
              <span className="text-sm text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>

        {/* Developer Note */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">💻 Developer Notes</h3>
          <p className="text-yellow-700 text-sm">
            This is a basic admin dashboard template. Your friend can expand it by:
          </p>
          <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside space-y-1">
            <li>Connecting real API endpoints for live data</li>
            <li>Adding user management functionality</li>
            <li>Implementing transaction monitoring</li>
            <li>Adding dispute resolution tools</li>
            <li>Creating detailed analytics charts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 