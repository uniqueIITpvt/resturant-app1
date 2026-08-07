'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { ToastProvider } from '../../context/ToastContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider position='top-center' maxToasts={3}>
      <div className='min-h-screen relative'>
        {/* Simple Logo Header */}
        <div className='absolute top-4 left-4 z-50'>
          <Link
            href='/'
            className='flex items-center space-x-2 group transition-all duration-200 hover:scale-105'
          >
            <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200'>
              <Shield className='w-6 h-6 text-white' />
            </div>
            <div className='hidden sm:block'>
              <span className='text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-200'>
                Restaurant
              </span>
              <p className='text-xs text-gray-500 -mt-1'>Back to Home</p>
            </div>
          </Link>
        </div>

        {/* Auth Content */}
        <div className='w-full'>{children}</div>
      </div>
    </ToastProvider>
  );
}
