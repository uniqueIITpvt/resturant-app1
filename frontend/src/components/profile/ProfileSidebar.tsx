'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Edit,
  LogOut,
  User,
  ShoppingBag,
  MapPin,
  Settings,
  Loader2,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface ProfileSidebarProps {
  profile: UserProfile;
  currentTab: string;
  isLoading: boolean;
  onEditProfile: () => void;
  onTabChange: (
    tabId: 'personal-info' | 'orders' | 'addresses' | 'settings'
  ) => void;
  onLogout: () => void;
}

export default function ProfileSidebar({
  profile,
  currentTab,
  isLoading,
  onEditProfile,
  onTabChange,
  onLogout,
}: ProfileSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // To prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      id: 'personal-info',
      label: 'Personal Info',
      icon: <User className='w-4 h-4 sm:w-5 sm:h-5' />,
      onClick: () => {
        onTabChange('personal-info');
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className='w-4 h-4 sm:w-5 sm:h-5' />,
      onClick: () => {
        onTabChange('orders');
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: <MapPin className='w-4 h-4 sm:w-5 sm:h-5' />,
      onClick: () => {
        onTabChange('addresses');
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className='w-4 h-4 sm:w-5 sm:h-5' />,
      onClick: () => {
        onTabChange('settings');
        setMobileMenuOpen(false);
      },
    },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Header with Menu Toggle */}
      <div className='sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden'>
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center space-x-3'>
            <Link href='/' className='text-amber-600'>
              <Home className='w-5 h-5' />
            </Link>
            <h1 className='text-lg font-bold text-gray-900'>My Account</h1>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='p-2 text-gray-500 hover:text-amber-600 focus:outline-none transition-colors'
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 animate-slideDown'>
            <div className='p-4 border-b border-gray-100'>
              <div className='flex items-center space-x-3'>
                <div className='relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-100'>
                  {isLoading ? (
                    <div className='w-full h-full bg-gray-200 animate-pulse flex items-center justify-center'>
                      <Loader2 className='h-5 w-5 text-gray-400 animate-spin' />
                    </div>
                  ) : profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={profile.name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-xl font-bold text-white'>
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <h2 className='text-base font-semibold text-gray-900 truncate'>
                    {isLoading ? (
                      <div className='h-5 w-28 bg-gray-200 animate-pulse rounded'></div>
                    ) : (
                      profile.name
                    )}
                  </h2>
                  <p className='text-xs text-gray-500 truncate'>
                    {isLoading ? (
                      <div className='h-3 w-32 bg-gray-200 animate-pulse rounded'></div>
                    ) : (
                      profile.email
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onEditProfile();
                  setMobileMenuOpen(false);
                }}
                className='mt-3 w-full py-2 px-3 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center'
                disabled={isLoading}
              >
                <Edit className='w-3 h-3 mr-1.5' />
                Edit Profile
              </button>
            </div>

            <nav className='py-2'>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center px-4 py-3 ${
                    currentTab === item.id
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <span className='mr-3'>{item.icon}</span>
                  <span className='font-medium text-sm'>{item.label}</span>
                </button>
              ))}

              <div className='pt-2 mt-2 border-t border-gray-100'>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className='w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors'
                >
                  <LogOut className='w-4 h-4 mr-3' />
                  <span className='font-medium text-sm'>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className='hidden lg:block bg-white rounded-2xl shadow-sm sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col'>
        {/* User Info with Profile Image */}
        <div className='px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0'>
          <div className='flex flex-col items-center text-center'>
            <div className='relative w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-amber-100 shadow-sm'>
              {isLoading ? (
                <div className='w-full h-full bg-gray-200 animate-pulse flex items-center justify-center'>
                  <Loader2 className='h-8 w-8 text-gray-400 animate-spin' />
                </div>
              ) : profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.name}
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-3xl font-bold text-white'>
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>

            <h2 className='text-xl font-bold text-gray-900 mb-1'>
              {isLoading ? (
                <div className='h-7 w-32 bg-gray-200 animate-pulse rounded mx-auto'></div>
              ) : (
                profile.name
              )}
            </h2>

            <p className='text-gray-500 text-sm'>
              {isLoading ? (
                <div className='h-4 w-40 bg-gray-200 animate-pulse rounded mx-auto'></div>
              ) : (
                profile.email
              )}
            </p>

            <div className='mt-4 w-full'>
              <button
                onClick={onEditProfile}
                className='w-full py-2.5 px-4 text-sm bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center shadow-sm hover:shadow'
                disabled={isLoading}
              >
                <Edit className='w-4 h-4 mr-2' />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className='p-3 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent'>
          <div className='space-y-1'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${
                  currentTab === item.id
                    ? 'bg-amber-50 text-amber-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span
                  className={`mr-3 ${
                    currentTab === item.id ? 'text-amber-600' : 'text-gray-500'
                  }`}
                >
                  {item.icon}
                </span>
                <span className='font-medium text-base'>{item.label}</span>
              </button>
            ))}
          </div>

          <div className='pt-3 mt-3 border-t border-gray-100'>
            <button
              onClick={onLogout}
              className='w-full flex items-center px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors'
            >
              <LogOut className='w-5 h-5 mr-3' />
              <span className='font-medium text-base'>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
