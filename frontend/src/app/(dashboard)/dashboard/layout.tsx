'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  // Check window width on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setCollapsed(window.innerWidth < 1280 && window.innerWidth >= 1024);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <ProtectedRoute requiresAuth adminOnly>
      <div className='min-h-screen bg-gray-50'>
        {/* Sidebar */}
        <DashboardSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Content area */}
        <div
          className={`${
            collapsed ? 'lg:pl-20' : 'lg:pl-64'
          } flex flex-col min-h-screen transition-all duration-300`}
        >
          {/* Mobile header */}
          <DashboardHeader setSidebarOpen={setSidebarOpen} />

          {/* Main content */}
          <main className='flex-1 overflow-auto'>
            <div className='py-6'>
              <div className='  mx-auto px-4 sm:px-6 lg:px-8'>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
