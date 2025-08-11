import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    platformName: 'PayBridge',
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveUsers: false,
    maxTransactionAmount: 100000,
    supportEmail: 'support@paybridge.com'
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleInputChange = (key: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">⚙️ System Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Platform Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🏢 Platform Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => handleInputChange('platformName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Transaction Amount (₹)</label>
                <input
                  type="number"
                  value={settings.maxTransactionAmount}
                  onChange={(e) => handleInputChange('maxTransactionAmount', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* System Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🎛️ System Controls</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Temporarily disable platform access</p>
                </div>
                <button
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Send email alerts for important events</p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Auto-approve Users</h3>
                  <p className="text-sm text-gray-500">Automatically approve new user registrations</p>
                </div>
                <button
                  onClick={() => handleToggle('autoApproveUsers')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoApproveUsers ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoApproveUsers ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🚀 Actions</h2>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                💾 Save Settings
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                🔄 Reset to Default
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                📤 Export Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 