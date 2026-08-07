'use client';

import { BadgeCheck, Truck, CreditCard } from 'lucide-react';

interface SettingsTabProps {
  isLoading: boolean;
  onDeleteAccount: () => void;
}

export default function SettingsTab({
  isLoading,
  onDeleteAccount,
}: SettingsTabProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
      <div className='border-b border-gray-200 p-4 sm:p-6'>
        <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
          Account Settings
        </h2>
        <p className='mt-1 text-xs sm:text-sm text-gray-500'>
          Manage your notifications and account preferences
        </p>
      </div>

      <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
        <div className='border-b border-gray-100 pb-4 sm:pb-6'>
          <h3 className='text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4'>
            Notifications
          </h3>

          <div className='space-y-3 sm:space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
              <div className='flex items-start sm:items-center'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0'>
                  <BadgeCheck className='w-4 h-4 sm:w-5 sm:h-5 text-amber-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium text-gray-900'>
                    Email Notifications
                  </h4>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Receive updates about your orders and account
                  </p>
                </div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer self-end sm:self-auto'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  defaultChecked
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600'></div>
              </label>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
              <div className='flex items-start sm:items-center'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0'>
                  <BadgeCheck className='w-4 h-4 sm:w-5 sm:h-5 text-amber-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-sm font-medium text-gray-900'>
                    SMS Notifications
                  </h4>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Receive text messages about your orders
                  </p>
                </div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer self-end sm:self-auto'>
                <input type='checkbox' className='sr-only peer' />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600'></div>
              </label>
            </div>
          </div>
        </div>

        <div className='border-b border-gray-100 pb-4 sm:pb-6'>
          <h3 className='text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4'>
            Security
          </h3>

          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
            <div className='flex items-start sm:items-center flex-1 min-w-0'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0'>
                <Truck className='w-4 h-4 sm:w-5 sm:h-5 text-amber-600' />
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-medium text-gray-900'>
                  Two-Factor Authentication
                </h4>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <button className='w-full sm:w-auto px-3 py-2 bg-amber-600 text-white text-xs sm:text-sm rounded-lg hover:bg-amber-700 transition-colors'>
              Enable
            </button>
          </div>
        </div>

        <div>
          <h3 className='text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4'>
            Payment Methods
          </h3>

          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4'>
            <div className='flex items-start sm:items-center flex-1 min-w-0'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0'>
                <CreditCard className='w-4 h-4 sm:w-5 sm:h-5 text-amber-600' />
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-medium text-gray-900'>
                  Saved Payment Methods
                </h4>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Manage your cards and payment options
                </p>
              </div>
            </div>
            <button className='w-full sm:w-auto px-3 py-2 border border-gray-300 text-xs sm:text-sm rounded-lg hover:bg-gray-50 transition-colors'>
              Manage
            </button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className='mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100'>
          <h3 className='text-base sm:text-lg font-medium text-red-600 mb-3 sm:mb-4'>
            Danger Zone
          </h3>

          <div className='p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50'>
            <h4 className='text-sm font-medium text-red-700 mb-2'>
              Delete Account
            </h4>
            <p className='text-xs text-red-600 mb-3 sm:mb-4'>
              This action cannot be undone. All your data will be permanently
              removed.
            </p>
            <button
              onClick={onDeleteAccount}
              disabled={isLoading}
              className='w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center'
            >
              {isLoading && (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
              )}
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
