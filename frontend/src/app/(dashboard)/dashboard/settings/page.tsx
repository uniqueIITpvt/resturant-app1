'use client';

import { useState } from 'react';

import { Bell, Globe, Shield, Lock, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';


export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    siteName: 'Restaurant Business',
    siteDescription: 'A comprehensive restaurant management system',
    enableNotifications: true,
    orderNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    enableTwoFactor: false,
    sessionTimeout: '30',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your API
    alert('Settings saved successfully!');
  };

  return (
    <ProtectedRoute requiresAuth adminOnly>
      <div>
        <h1 className='text-2xl font-semibold text-gray-900 mb-6'>Settings</h1>

        <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-4 text-sm font-medium flex items-center ${
                activeTab === 'general'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className='h-5 w-5 mr-2' />
              General
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-4 text-sm font-medium flex items-center ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className='h-5 w-5 mr-2' />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-4 text-sm font-medium flex items-center ${
                activeTab === 'security'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className='h-5 w-5 mr-2' />
              Security
            </button>
          </div>

          <div className='p-6'>
            <form onSubmit={handleSubmit}>
              {activeTab === 'general' && (
                <div>
                  <div className='mb-6'>
                    <label
                      htmlFor='siteName'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Site Name
                    </label>
                    <input
                      type='text'
                      name='siteName'
                      id='siteName'
                      value={formData.siteName}
                      onChange={handleChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    />
                  </div>

                  <div className='mb-6'>
                    <label
                      htmlFor='siteDescription'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Site Description
                    </label>
                    <textarea
                      name='siteDescription'
                      id='siteDescription'
                      rows={3}
                      value={formData.siteDescription}
                      onChange={handleChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label
                        htmlFor='defaultCurrency'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Default Currency
                      </label>
                      <select
                        name='defaultCurrency'
                        id='defaultCurrency'
                        value={formData.defaultCurrency}
                        onChange={handleChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      >
                        <option value='USD'>US Dollar (USD)</option>
                        <option value='EUR'>Euro (EUR)</option>
                        <option value='GBP'>British Pound (GBP)</option>
                        <option value='JPY'>Japanese Yen (JPY)</option>
                        <option value='CAD'>Canadian Dollar (CAD)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor='defaultLanguage'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Default Language
                      </label>
                      <select
                        name='defaultLanguage'
                        id='defaultLanguage'
                        value={formData.defaultLanguage}
                        onChange={handleChange}
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      >
                        <option value='en'>English</option>
                        <option value='es'>Spanish</option>
                        <option value='fr'>French</option>
                        <option value='de'>German</option>
                        <option value='it'>Italian</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <div className='mb-6'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        name='enableNotifications'
                        id='enableNotifications'
                        checked={formData.enableNotifications}
                        onChange={handleChange}
                        className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                      />
                      <label
                        htmlFor='enableNotifications'
                        className='ml-2 block text-sm font-medium text-gray-700'
                      >
                        Enable All Notifications
                      </label>
                    </div>
                    <p className='mt-1 text-sm text-gray-500'>
                      Master toggle for all notification types
                    </p>
                  </div>

                  <div className='ml-6 space-y-4'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        name='orderNotifications'
                        id='orderNotifications'
                        checked={formData.orderNotifications}
                        onChange={handleChange}
                        disabled={!formData.enableNotifications}
                        className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50'
                      />
                      <label
                        htmlFor='orderNotifications'
                        className={`ml-2 block text-sm font-medium ${
                          formData.enableNotifications
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        Order Notifications
                      </label>
                    </div>

                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        name='emailNotifications'
                        id='emailNotifications'
                        checked={formData.emailNotifications}
                        onChange={handleChange}
                        disabled={!formData.enableNotifications}
                        className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50'
                      />
                      <label
                        htmlFor='emailNotifications'
                        className={`ml-2 block text-sm font-medium ${
                          formData.enableNotifications
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        Email Notifications
                      </label>
                    </div>

                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        name='smsNotifications'
                        id='smsNotifications'
                        checked={formData.smsNotifications}
                        onChange={handleChange}
                        disabled={!formData.enableNotifications}
                        className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50'
                      />
                      <label
                        htmlFor='smsNotifications'
                        className={`ml-2 block text-sm font-medium ${
                          formData.enableNotifications
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        SMS Notifications
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <div className='mb-6'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        name='enableTwoFactor'
                        id='enableTwoFactor'
                        checked={formData.enableTwoFactor}
                        onChange={handleChange}
                        className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                      />
                      <label
                        htmlFor='enableTwoFactor'
                        className='ml-2 block text-sm font-medium text-gray-700'
                      >
                        Enable Two-Factor Authentication
                      </label>
                    </div>
                    <p className='mt-1 text-sm text-gray-500'>
                      Require SMS verification code for all admin users
                    </p>
                  </div>

                  <div className='mb-6'>
                    <label
                      htmlFor='sessionTimeout'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Session Timeout (minutes)
                    </label>
                    <select
                      name='sessionTimeout'
                      id='sessionTimeout'
                      value={formData.sessionTimeout}
                      onChange={handleChange}
                      className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    >
                      <option value='15'>15 minutes</option>
                      <option value='30'>30 minutes</option>
                      <option value='60'>1 hour</option>
                      <option value='120'>2 hours</option>
                      <option value='240'>4 hours</option>
                    </select>
                    <p className='mt-1 text-sm text-gray-500'>
                      Time before users are automatically logged out
                    </p>
                  </div>

                  <div className='mb-6'>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>
                      User Role Information
                    </h3>
                    <div className='bg-gray-50 p-4 rounded-md'>
                      <div className='flex items-center mb-2'>
                        <Lock className='h-4 w-4 text-gray-500 mr-2' />
                        <p className='text-sm text-gray-600'>
                          Your current role:{' '}
                          <span className='font-medium'>{user?.role}</span>
                        </p>
                      </div>
                      <p className='text-xs text-gray-500'>
                        {user?.role === 'superadmin'
                          ? 'As a Super Admin, you have full access to all system features and settings.'
                          : 'As an Admin, you have access to most system features except user management.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className='mt-6 flex justify-end'>
                <button
                  type='submit'
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  <Save className='h-4 w-4 mr-2' />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
