'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ChefHat,
  Search,
  Heart,
  ChevronDown,
  Coffee,
  Salad,
  Menu,
  Croissant,
  Sandwich,
  IceCream,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CartItem, useCart } from '@/context/CartContext';
import GlobalSearch from '../ui/GlobalSearch';

export default function UserNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { cart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileCategoriesExpanded, setMobileCategoriesExpanded] =
    useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // IMPORTANT: This navbar has a high z-index (9999) and creates a stacking context with 'isolation'.
  // All pages should have a top padding of at least 4rem (64px) to prevent content from being hidden
  // behind the navbar. Use the PageWrapper component or add 'pt-16' to the main container of your page.

  // Track scroll position to change navbar style when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle clicks outside the dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only process if one of the menus is open
      if (categoriesOpen || userDropdownOpen || isMenuOpen || isSearchOpen) {
        // Check if the click was outside the navbar
        const navbar = document.querySelector('header');
        const mobileMenu = mobileMenuRef.current;

        // Don't close mobile menu if click is inside it
        if (mobileMenu && mobileMenu.contains(event.target as Node)) {
          return;
        }

        if (navbar && !navbar.contains(event.target as Node)) {
          setCategoriesOpen(false);
          setUserDropdownOpen(false);
          setIsMenuOpen(false);
          setIsSearchOpen(false);
        } else {
          // For dropdowns, check if clicked outside the specific dropdown
          if (
            categoryRef.current &&
            !categoryRef.current.contains(event.target as Node)
          ) {
            setCategoriesOpen(false);
          }
          if (
            userDropdownRef.current &&
            !userDropdownRef.current.contains(event.target as Node)
          ) {
            setUserDropdownOpen(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoriesOpen, userDropdownOpen, isMenuOpen, isSearchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    // Force the menu to toggle regardless of other conditions
    setIsMenuOpen((prevState) => !prevState);
    // Close search when menu is opened
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Close menu when search is opened
    if (!isSearchOpen) setIsMenuOpen(false);
  };

  const toggleCategories = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoriesOpen(!categoriesOpen);
    setUserDropdownOpen(false);
  };

  const toggleUserDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserDropdownOpen(!userDropdownOpen);
    setCategoriesOpen(false);
  };

  const toggleMobileCategories = () => {
    setMobileCategoriesExpanded(!mobileCategoriesExpanded);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    setUserDropdownOpen(false);
  };

  const totalItems = isMounted
    ? cart.reduce((total: number, item: CartItem) => total + item.quantity, 0)
    : 0;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/features', label: 'Features' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const categories = [
    {
      icon: <Coffee size={18} />,
      label: 'All Categories',
      href: '/menu',
    },
    {
      icon: <Croissant size={18} />,
      label: 'Appetizers',
      href: '/menu?category=appetizers',
    },
    {
      icon: <ChefHat size={18} />,
      label: 'CHICKEN DISHES',
      href: '/menu?category=chicken%20dishes',
    },
    {
      icon: <Croissant size={18} />,
      label: 'BREAD',
      href: '/menu?category=bread',
    },
    {
      icon: <Sandwich size={18} />,
      label: 'BEEF DISHES',
      href: '/menu?category=beef%20dishes',
    },
    {
      icon: <ChefHat size={18} />,
      label: 'GRILLED DISHES',
      href: '/menu?category=grilled%20dishes',
    },
    {
      icon: <Sandwich size={18} />,
      label: 'SEAFOOD DISHES',
      href: '/menu?category=seafood%20dishes',
    },
    {
      icon: <Sandwich size={18} />,
      label: 'ROLLS/WRAPS',
      href: '/menu?category=rolls/wraps',
    },
    {
      icon: <Salad size={18} />,
      label: 'VEGETABLE DISHES',
      href: '/menu?category=vegetable%20dishes',
    },
    {
      icon: <Sandwich size={18} />,
      label: 'LAMB/GOAT DISHES',
      href: '/menu?category=lamb/goat%20dishes',
    },
    {
      icon: <Sandwich size={18} />,
      label: 'RICE DISHES',
      href: '/menu?category=rice%20dishes',
    },
    {
      icon: <IceCream size={18} />,
      label: 'DESSERTS',
      href: '/menu?category=desserts',
    },
    {
      icon: <Sandwich size={18} />,
      label: 'GOAT BIRYANI',
      href: '/menu?category=goat%20biryani',
    },
    {
      icon: <ChefHat size={18} />,
      label: 'CHICKEN BIRYANI',
      href: '/menu?category=chicken%20biryani',
    },
    {
      icon: <Salad size={18} />,
      label: 'VEGETABLE BIRYANI',
      href: '/menu?category=vegetable%20biryani',
    },
    {
      icon: <Coffee size={18} />,
      label: 'BEVERAGES',
      href: '/menu?category=beverages',
    },
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

  // Prevent clicks inside navbar from propagating
  const handleNavbarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMobileMenuClick = (e: React.MouseEvent) => {
    // This ensures clicks in the mobile menu don't bubble up
    e.stopPropagation();
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-[9999] isolation ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-lg h-16 border-b border-amber-100'
            : 'bg-gradient-to-r from-amber-800/95 via-amber-700/95 to-amber-600/95 text-white h-16'
        }`}
        onClick={handleNavbarClick}
      >
        <div className='container mx-auto px-4 max-w-7xl h-full relative'>
          <div className='flex justify-between items-center h-full'>
            {/* Logo */}
            <div className='flex-shrink-0 flex items-center group'>
              <Link href='/' className='flex items-center gap-2'>
                <div>
                  <img
                    src='/shaahi-biryani-logo.svg'
                    alt='Shaahi Biryani'
                    className={`w-10 h-10 ${
                      isScrolled ? 'opacity-100' : 'opacity-90'
                    }`}
                  />
                </div>
                <span
                  className={`font-bold text-xl md:text-2xl ${
                    isScrolled ? 'text-amber-700' : 'text-white'
                  } font-serif italic`}
                >
                  Shaahi Biryani
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className='hidden lg:flex items-center space-x-1'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium
                    ${
                      pathname === link.href
                        ? isScrolled
                          ? 'text-amber-700 font-semibold'
                          : 'text-white font-semibold'
                        : isScrolled
                        ? 'text-gray-700 hover:text-amber-700 hover:bg-amber-50'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }
                    ${
                      pathname === link.href
                        ? isScrolled
                          ? 'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-1/2 after:bg-amber-500 after:rounded-full'
                          : 'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-1/2 after:bg-white after:rounded-full'
                        : ''
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}

              {/* Categories Dropdown */}
              <div className='relative' ref={categoryRef}>
                <button
                  onClick={toggleCategories}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium
                    ${
                      isScrolled
                        ? 'text-gray-700 hover:text-amber-700 hover:bg-amber-50'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }
                    ${
                      categoriesOpen &&
                      (isScrolled
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-white/10')
                    }
                  `}
                >
                  Categories
                  <ChevronDown
                    size={16}
                    className={`ml-1 ${categoriesOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`absolute top-full left-0 mt-1 w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl py-1 z-50 ${
                    categoriesOpen ? 'block' : 'hidden'
                  } border border-amber-100`}
                  style={{ maxHeight: '70vh', overflowY: 'auto' }}
                >
                  {categories.map((category, index) => (
                    <Link
                      key={index}
                      href={category.href}
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 group transition-colors duration-150'
                      onClick={() => setCategoriesOpen(false)}
                    >
                      <span className='mr-3 text-amber-500 group-hover:text-amber-700 transition-colors duration-150'>
                        {category.icon}
                      </span>
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Desktop Right Icons */}
            <div className='hidden md:flex items-center space-x-3'>
              <button
                onClick={toggleSearch}
                aria-label='Search'
                className={`p-2 rounded-full
                  ${
                    isScrolled
                      ? 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                      : 'text-white hover:bg-white/10'
                  }
                  ${
                    isSearchOpen &&
                    (isScrolled ? 'bg-amber-50 text-amber-700' : 'bg-white/10')
                  }
                `}
              >
                <Search size={20} />
              </button>

              <Link
                href='/cart'
                aria-label='Shopping Cart'
                className={`p-2 rounded-full relative
                  ${
                    isScrolled
                      ? 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                      : 'text-white hover:bg-white/10'
                  }
                  ${
                    pathname === '/cart' &&
                    (isScrolled ? 'bg-amber-50 text-amber-700' : 'bg-white/10')
                  }
                `}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className='absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-600 rounded-full'>
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className='relative' ref={userDropdownRef}>
                  <button
                    type='button'
                    onClick={toggleUserDropdown}
                    aria-label='User menu'
                    className={`flex items-center justify-center h-9 w-9 rounded-full focus:outline-none
                      ${
                        isScrolled
                          ? userDropdownOpen
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700'
                          : userDropdownOpen
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    <User size={18} />
                  </button>
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1 bg-white/95 backdrop-blur-sm ring-1 ring-amber-100 focus:outline-none z-50 ${
                      userDropdownOpen ? 'block' : 'hidden'
                    }`}
                  >
                    {/* User info section */}
                    <div className='px-4 py-3 border-b border-amber-100 bg-amber-50/50'>
                      <div className='text-sm font-medium text-gray-900'>
                        {user.name}
                      </div>
                      <div className='text-xs text-gray-500 truncate'>
                        {user.email || user.mobileNumber}
                      </div>
                    </div>

                    {/* Show admin links for admin and superadmin users */}
                    {(isAdmin() || isSuperAdmin()) && (
                      <>
                        {adminLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 group transition-colors duration-150'
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <span className='mr-3 text-gray-500 group-hover:text-amber-700 transition-colors duration-150'>
                              {link.icon}
                            </span>
                            {link.label}
                          </Link>
                        ))}
                        <hr className='my-1 border-amber-100' />
                      </>
                    )}
                    <Link
                      href='/profile'
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 group transition-colors duration-150'
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User
                        size={18}
                        className='mr-3 text-gray-500 group-hover:text-amber-700 transition-colors duration-150'
                      />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 group transition-colors duration-150'
                    >
                      <LogOut
                        size={18}
                        className='mr-3 text-gray-500 group-hover:text-amber-700 transition-colors duration-150'
                      />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href='/auth/login'
                  className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md
                    ${
                      isScrolled
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:shadow-md'
                        : 'bg-white text-amber-700 hover:bg-white/90 shadow-sm'
                    }`}
                >
                  <User size={16} />
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile Toggle Buttons */}
            <div className='flex items-center gap-2 md:hidden'>
              <button
                onClick={toggleSearch}
                aria-label='Search'
                className={`p-2 rounded-full
                  ${
                    isScrolled
                      ? 'text-gray-600 hover:text-amber-700'
                      : 'text-white hover:bg-white/10'
                  }
                  ${
                    isSearchOpen &&
                    (isScrolled ? 'text-amber-700' : 'bg-white/10')
                  }
                `}
              >
                <Search size={20} />
              </button>

              <Link
                href='/cart'
                aria-label='Shopping Cart'
                className={`p-2 rounded-full relative
                  ${
                    isScrolled
                      ? 'text-gray-600 hover:text-amber-700'
                      : 'text-white hover:bg-white/10'
                  }`}
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className='absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-600 rounded-full'>
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                type='button'
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className={`p-2 rounded-md z-[101]
                  ${
                    isScrolled
                      ? isMenuOpen
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50/80'
                      : isMenuOpen
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                  }
                `}
                onClick={toggleMenu}
              >
                <span className='sr-only'>
                  {isMenuOpen ? 'Close menu' : 'Open main menu'}
                </span>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Search Bar - Appears when search is toggled */}
          {isSearchOpen && (
            <div className='absolute top-full left-0 right-0 z-40'>
              <GlobalSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                isDarkMode={!isScrolled}
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu - Now outside the header element so it's not affected by header styling */}
      <div
        ref={mobileMenuRef}
        className={`fixed md:hidden inset-0 top-16 bg-gradient-to-b from-white to-amber-50 z-[100] overflow-y-auto ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
        onClick={handleMobileMenuClick}
      >
        <div className='px-4 py-3 divide-y divide-amber-100'>
          {/* Mobile Navigation Links */}
          <div className='space-y-1 py-2'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-3 rounded-md text-base font-medium transition-colors duration-150 ${
                  pathname === link.href
                    ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600 pl-2'
                    : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Categories Section - With toggle */}
          <div className='py-3'>
            <button
              onClick={toggleMobileCategories}
              className='flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-700 transition-colors duration-150 rounded-md hover:bg-amber-50/70'
            >
              <span className='flex items-center'>
                <Menu size={18} className='mr-3 text-amber-500' />
                Categories
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 text-amber-500 ${
                  mobileCategoriesExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Categories Grid - Collapsed by default, toggleable */}
            <div
              className={`mt-2 overflow-hidden ${
                mobileCategoriesExpanded ? 'block' : 'hidden'
              }`}
            >
              <div
                className='grid grid-cols-1 sm:grid-cols-2 gap-1 px-3'
                style={{
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  paddingRight: '4px',
                  paddingBottom: '8px',
                }}
              >
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    href={category.href}
                    className='flex items-center py-2.5 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-md transition-colors duration-150'
                    onClick={closeMenu}
                  >
                    <span className='mr-3 text-amber-500'>{category.icon}</span>
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Other important links */}
          <div className='py-3'>
            <Link
              href='/favorites'
              className='flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-md transition-colors duration-150'
              onClick={closeMenu}
            >
              <Heart size={18} className='mr-3 text-rose-500' />
              Favorites
            </Link>
          </div>

          {/* User section */}
          {user ? (
            <div className='py-3'>
              <div className='bg-amber-50 p-4 rounded-md mb-3 shadow-sm'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <span className='inline-flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 text-amber-700'>
                      <User size={20} />
                    </span>
                  </div>
                  <div className='ml-3'>
                    <div className='text-base font-medium text-gray-800'>
                      {user.name}
                    </div>
                    <div className='text-sm font-medium text-gray-500 truncate max-w-[200px]'>
                      {user.email || user.mobileNumber}
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-1 mt-2'>
                {/* Admin links for mobile */}
                {(isAdmin() || isSuperAdmin()) && (
                  <>
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className='flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-md transition-colors duration-150'
                        onClick={closeMenu}
                      >
                        <span className='mr-3 text-amber-500'>{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                    <div className='border-t border-amber-100 my-2'></div>
                  </>
                )}
                <Link
                  href='/profile'
                  className='flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-md transition-colors duration-150'
                  onClick={closeMenu}
                >
                  <User size={18} className='mr-3 text-amber-500' />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className='flex items-center w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-md transition-colors duration-150'
                >
                  <LogOut size={18} className='mr-3 text-amber-500' />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className='pt-3 pb-4'>
              <div className='px-4'>
                <Link
                  href='/auth/login'
                  className='inline-flex items-center justify-center w-full gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:shadow-md'
                  onClick={closeMenu}
                >
                  <User size={18} />
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* Close button at bottom */}
          <div className='py-4 flex justify-center'>
            <button
              onClick={closeMenu}
              className='px-4 py-2 text-sm font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-50 transition-colors duration-150 shadow-sm'
            >
              Close Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
