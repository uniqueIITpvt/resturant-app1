'use client';

import { Menu } from 'lucide-react';

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardHeader({
  setSidebarOpen,
}: DashboardHeaderProps) {
  return (
    <div className='sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-100 shadow-sm lg:hidden'>
      <button
        type='button'
        className='px-4 border-r border-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 lg:hidden'
        onClick={() => setSidebarOpen(true)}
      >
        <span className='sr-only'>Open sidebar</span>
        <Menu className='h-5 w-5' aria-hidden='true' />
      </button>
      <div className='flex-1 flex justify-center px-4 lg:px-0'>
        <div className='flex-1 flex'>
          <div className='w-full flex items-center justify-between'>
            <span className='text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-500 text-transparent bg-clip-text'>
              Unique Café Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
