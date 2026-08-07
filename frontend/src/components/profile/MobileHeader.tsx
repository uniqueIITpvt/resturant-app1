'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Edit,
  LogOut,
  User,
  Package,
  MapPin,
  Settings,
  Loader2,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isLink?: boolean;
  href?: string;
  onClick?: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
}

interface MobileHeaderProps {
  profile: UserProfile;
  currentTab: string;
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  onEditProfile: () => void;
  onTabChange: (
    tabId: 'personal-info' | 'orders' | 'addresses' | 'settings'
  ) => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
}

export default function MobileHeader({
  profile,
  currentTab,
  isLoading,
  isMobileMenuOpen,
  onEditProfile,
  onTabChange,
  onLogout,
  //   onToggleMobileMenu,
  onCloseMobileMenu,
}: MobileHeaderProps) {
  const navItems: NavItem[] = [
    {
      id: 'personal-info',
      label: 'Personal Info',
      icon: <User className='w-5 h-5' />,
      onClick: () => onTabChange('personal-info'),
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <Package className='w-5 h-5' />,
      onClick: () => onTabChange('orders'),
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: <MapPin className='w-5 h-5' />,
      onClick: () => onTabChange('addresses'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className='w-5 h-5' />,
      onClick: () => onTabChange('settings'),
    },
  ];

  return (
    <>
      {/* Mobile header */}
      {/* <div className='bg-white shadow-sm lg:hidden sticky top-0 z-20'>
        <div className='container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between'>
          <h1 className='text-lg sm:text-xl font-bold text-gray-900'>
            My Account
          </h1>
          <button
            onClick={onToggleMobileMenu}
            className='p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors'
            aria-label='Menu'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 sm:h-6 sm:w-6 text-gray-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
        </div>
      </div> */}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 z-30 lg:hidden'>
          <div
            className='absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm'
            onClick={onCloseMobileMenu}
          ></div>
          <div className='absolute right-0 top-0 bottom-0 w-72 sm:w-80 bg-white shadow-xl transform transition-transform ease-in-out duration-300'>
            <div className='p-4 sm:p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>Menu</h2>
                <button
                  onClick={onCloseMobileMenu}
                  className='p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 text-gray-500'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className='py-2 overflow-y-auto max-h-[calc(100vh-120px)]'>
              {navItems.map((item) =>
                item.isLink ? (
                  <Link
                    key={item.id}
                    href={item.href || '#'}
                    className='flex items-center px-4 sm:px-6 py-3 sm:py-4 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors'
                    onClick={onCloseMobileMenu}
                  >
                    <span className='mr-3 text-gray-500'>{item.icon}</span>
                    <span className='text-sm sm:text-base'>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    className={`w-full flex items-center px-4 sm:px-6 py-3 sm:py-4 text-left transition-colors ${
                      currentTab === item.id
                        ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-500'
                        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                    onClick={() => {
                      item.onClick?.();
                      onCloseMobileMenu();
                    }}
                  >
                    <span className='mr-3 text-gray-500'>{item.icon}</span>
                    <span className='font-medium text-sm sm:text-base'>
                      {item.label}
                    </span>
                  </button>
                )
              )}
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <button
                  onClick={() => {
                    onCloseMobileMenu();
                    onLogout();
                  }}
                  className='w-full flex items-center px-4 sm:px-6 py-3 sm:py-4 text-left text-red-600 hover:bg-red-50 transition-colors'
                >
                  <LogOut className='w-5 h-5 mr-3' />
                  <span className='text-sm sm:text-base'>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile profile summary */}
      <div className='lg:hidden bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4 mx-3 sm:mx-4'>
        <div className='flex items-center space-x-3 sm:space-x-4'>
          <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-full relative overflow-hidden flex-shrink-0'>
            {isLoading ? (
              <div className='w-full h-full bg-gray-200 animate-pulse flex items-center justify-center'>
                <Loader2 className='h-5 w-5 sm:h-6 sm:w-6 text-gray-400 animate-spin' />
              </div>
            ) : profile.profileImage ? (
              <Image
                src={profile.profileImage}
                alt={profile.name}
                fill
                className='object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-white'>
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <h2 className='text-base sm:text-lg font-semibold text-gray-900 truncate'>
              {isLoading ? (
                <div className='h-5 sm:h-6 w-28 sm:w-32 bg-gray-200 animate-pulse rounded'></div>
              ) : (
                profile.name
              )}
            </h2>
            <p className='text-xs sm:text-sm text-gray-500 truncate'>
              {isLoading ? (
                <div className='h-3 sm:h-4 w-32 sm:w-40 bg-gray-200 animate-pulse rounded'></div>
              ) : (
                profile.email
              )}
            </p>
          </div>
          <button
            onClick={onEditProfile}
            className='flex-shrink-0 p-1.5 sm:p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors'
            disabled={isLoading}
          >
            <Edit className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        </div>

        {/* Mobile tab navigation */}
        <div className='flex mt-3 sm:mt-4 border-b border-gray-200 overflow-x-auto'>
          {navItems
            .filter((item) => !item.isLink)
            .map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex-1 min-w-0 py-2 sm:py-3 text-xs sm:text-sm font-medium text-center transition-colors whitespace-nowrap ${
                  currentTab === item.id
                    ? 'text-amber-600 border-b-2 border-amber-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className='px-1'>{item.label}</span>
              </button>
            ))}
        </div>
      </div>
    </>
  );
}
