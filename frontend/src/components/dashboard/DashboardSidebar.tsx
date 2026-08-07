'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  UserPlus,
  ExternalLink,
  ChevronRight,
  X,
  ChevronLeft,
  Calendar,
  Mail,
} from 'lucide-react';
import { RiCoupon2Fill } from 'react-icons/ri';
import { useAuth } from '@/context/AuthContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  access: 'all' | 'admin' | 'superadmin';
}

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
  collapsed,
  setCollapsed,
}: DashboardSidebarProps) {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const pathname = usePathname();

  // Navigation items with access control
  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      access: 'all',
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: <ShoppingBag size={20} />,
      access: 'admin',
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: <UserPlus size={20} />,
      access: 'admin',
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: <Users size={20} />,
      access: 'superadmin',
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: <ShoppingBag size={20} />,
      access: 'admin',
    },
    {
      name: 'Coupons',
      href: '/dashboard/coupons',
      icon: <RiCoupon2Fill size={20} />,
      access: 'admin',
    },
    {
      name: 'Event Offers',
      href: '/dashboard/event-offers',
      icon: <Calendar size={20} />,
      access: 'admin',
    },
    {
      name: 'Email',
      href: '/dashboard/email',
      icon: <Mail size={20} />,
      access: 'admin',
    },
    // {
    //   name: 'Images',
    //   href: '/dashboard/images',
    //   icon: <ImageIcon size={20} />,
    //   access: 'admin',
    // },
    // {
    //   name: 'API Health',
    //   href: '/dashboard/api-health',
    //   icon: <Activity size={20} />,
    //   access: 'admin',
    // },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings size={20} />,
      access: 'all',
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (item.access === 'all') return true;
    if (item.access === 'admin' && (isAdmin() || isSuperAdmin())) return true;
    if (item.access === 'superadmin' && isSuperAdmin()) return true;
    return false;
  });

  // Get panel name based on user role
  const getPanelName = () => {
    if (!user?.role) return 'Dashboard';

    switch (user.role.toLowerCase()) {
      case 'superadmin':
        return 'Super Admin Panel';
      case 'admin':
        return 'Admin Panel';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div className='lg:hidden'>
        <div
          className={`fixed inset-y-0 left-0 flex flex-col w-72 bg-white shadow-xl border-r border-gray-100 pt-5 pb-4 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-all duration-300 ease-in-out z-50`}
        >
          <div className='flex items-center justify-between px-5'>
            <div className='flex-1 flex justify-start'>
              <span className='text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-transparent bg-clip-text'>
                {getPanelName()}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className='text-gray-500 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all'
            >
              <X size={20} />
            </button>
          </div>

          {/* Go to Website button for mobile */}
          <div className='px-5 mt-6'>
            <Link
              href='/'
              className='flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow w-full group'
            >
              <ExternalLink
                size={16}
                className='group-hover:translate-x-0.5 transition-transform'
              />
              <span>Go to Website</span>
            </Link>
          </div>

          <div className='mt-6 flex-1 overflow-y-auto px-3'>
            <nav className='space-y-1.5'>
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-amber-50 text-amber-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
                  }`}
                >
                  <span
                    className={`mr-3 transition-colors ${
                      pathname === item.href
                        ? 'text-amber-600'
                        : 'text-gray-500 group-hover:text-amber-600'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className='flex-shrink-0 border-t border-gray-100 p-4 mt-2'>
            <div className='flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200'>
              <div className='flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold'>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className='ml-3 flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {user?.name || 'User'}
                </p>
                <p className='text-xs text-gray-500 truncate'>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className='ml-auto p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-all'
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } transition-all duration-300`}
      >
        <div className='flex flex-col flex-grow border-r border-gray-100 pt-5 bg-white shadow-sm overflow-y-auto'>
          <div
            className={`flex items-center flex-shrink-0 px-5 ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!collapsed && (
              <span className='text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-transparent bg-clip-text'>
                {getPanelName()}
              </span>
            )}
            {collapsed && (
              <div className='w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center'>
                <button
                  onClick={() => setCollapsed(false)}
                  className='p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className='p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Go to Website button for desktop */}
          <div
            className={`px-4 mt-6 ${collapsed ? 'flex justify-center' : ''}`}
          >
            {collapsed ? (
              <Link
                href='/'
                className='flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-sm hover:shadow'
                title='Go to Website'
              >
                <ExternalLink size={18} />
              </Link>
            ) : (
              <Link
                href='/'
                className='flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow w-full group'
              >
                <ExternalLink
                  size={16}
                  className='group-hover:translate-x-0.5 transition-transform'
                />
                <span>Go to Website</span>
              </Link>
            )}
          </div>

          <div className='mt-6 flex-grow flex flex-col'>
            <nav className='flex-1 px-3 pb-4 space-y-1.5'>
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center ${
                    collapsed ? 'justify-center' : ''
                  } px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-amber-50 text-amber-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
                  }`}
                  title={collapsed ? item.name : ''}
                >
                  <span
                    className={`${collapsed ? '' : 'mr-3'} transition-colors ${
                      pathname === item.href
                        ? 'text-amber-600'
                        : 'text-gray-500 group-hover:text-amber-600'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className='flex-shrink-0 border-t border-gray-100 p-4 mt-2'>
            {collapsed ? (
              <div className='flex flex-col items-center'>
                <div className='w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold'>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  onClick={() => setCollapsed(false)}
                  className='mt-4 p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100'
                  title='Expand Sidebar'
                >
                  <ChevronRight size={16} className='rotate-180' />
                </button>
              </div>
            ) : (
              <div className='flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200'>
                <div className='flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold'>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className='ml-3 flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {user?.name || 'User'}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className='ml-auto p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-all'
                  title='Logout'
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
