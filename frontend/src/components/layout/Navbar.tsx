'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  ShoppingCart,
  AlignJustify,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CartItem, useCart } from '@/context/CartContext';
// import { useAuth } from '../context/AuthContext';
// import { useCart, CartItem } from '../context/CartContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { cart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const totalItems = isMounted
    ? cart.reduce((total: number, item: CartItem) => total + item.quantity, 0)
    : 0;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Admin links that only admin and superadmin can see
  const adminLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <header className='bg-white shadow-md sticky top-0 z-50'>
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <Link href='/' className='font-bold text-xl text-red-600'>
                Restaurant
              </Link>
            </div>
            <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === link.href
                      ? 'border-red-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className='hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4'>
            <Link
              href='/cart'
              className='p-2 text-gray-600 hover:text-gray-900 relative'
            >
              <ShoppingCart className='h-6 w-6' />
              {totalItems > 0 && (
                <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'>
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className='ml-3 relative group'>
                <div>
                  <button
                    type='button'
                    className='flex text-sm rounded-full focus:outline-none'
                    id='user-menu-button'
                  >
                    <span className='flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600'>
                      <User size={18} />
                    </span>
                  </button>
                </div>
                <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block'>
                  {/* Show admin links for admin and superadmin users */}
                  {(isAdmin() || isSuperAdmin()) && (
                    <>
                      {adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className='flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                          onClick={closeMenu}
                        >
                          {link.icon}
                          <span className='ml-2'>{link.label}</span>
                        </Link>
                      ))}
                      <hr className='my-1' />
                    </>
                  )}
                  <Link
                    href='/profile'
                    className='flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    onClick={closeMenu}
                  >
                    <User size={18} />
                    <span className='ml-2'>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    <LogOut size={18} />
                    <span className='ml-2'>Sign out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href='/auth/login'
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
              >
                Sign in
              </Link>
            )}
          </div>

          <div className='flex items-center sm:hidden'>
            <Link
              href='/cart'
              className='p-2 text-gray-600 hover:text-gray-900 relative mr-2'
            >
              <ShoppingCart className='h-6 w-6' />
              {totalItems > 0 && (
                <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'>
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              type='button'
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none'
              onClick={toggleMenu}
            >
              <span className='sr-only'>Open main menu</span>
              {isMenuOpen ? (
                <X className='block h-6 w-6' aria-hidden='true' />
              ) : (
                <AlignJustify className='block h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className='pt-2 pb-3 space-y-1'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === link.href
                  ? 'border-red-500 text-red-700 bg-red-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {user ? (
          <div className='pt-4 pb-3 border-t border-gray-200'>
            <div className='flex items-center px-4'>
              <div className='flex-shrink-0'>
                <span className='inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-600'>
                  <User className='h-6 w-6' />
                </span>
              </div>
              <div className='ml-3'>
                <div className='text-base font-medium text-gray-800'>
                  {user.name}
                </div>
                <div className='text-sm font-medium text-gray-500'>
                  {user.email || user.mobileNumber}
                </div>
              </div>
            </div>
            <div className='mt-3 space-y-1'>
              {/* Show admin links for admin and superadmin users in mobile menu */}
              {(isAdmin() || isSuperAdmin()) && (
                <>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className='flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                      onClick={closeMenu}
                    >
                      {link.icon}
                      <span className='ml-2'>{link.label}</span>
                    </Link>
                  ))}
                </>
              )}
              <Link
                href='/profile'
                className='flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                onClick={closeMenu}
              >
                <User size={18} />
                <span className='ml-2'>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className='flex w-full items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              >
                <LogOut size={18} />
                <span className='ml-2'>Sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className='pt-4 pb-3 border-t border-gray-200'>
            <div className='flex items-center justify-center'>
              <Link
                href='/auth/login'
                className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
                onClick={closeMenu}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
