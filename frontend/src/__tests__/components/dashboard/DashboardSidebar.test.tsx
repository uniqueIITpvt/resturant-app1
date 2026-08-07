import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next/link
interface MockLinkProps {
  children: React.ReactNode;
  href: string;
  onClick?: () => void;
  className?: string;
  title?: string;
}

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    onClick,
    className,
    title,
  }: MockLinkProps) => {
    return (
      <a
        href={href}
        onClick={onClick}
        className={className}
        title={title}
        data-testid='mock-link'
      >
        {children}
      </a>
    );
  };

  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('DashboardSidebar Component', () => {
  // Common props
  const defaultProps = {
    sidebarOpen: false,
    setSidebarOpen: jest.fn(),
    handleLogout: jest.fn(),
    collapsed: false,
    setCollapsed: jest.fn(),
  };

  // Mock user data
  const mockRegularUser = {
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
  };

  const mockAdminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  const mockSuperAdminUser = {
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'superadmin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  test('renders the mobile sidebar correctly when open', () => {
    // Mock auth context for regular user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockRegularUser,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(<DashboardSidebar {...defaultProps} sidebarOpen={true} />);

    // Check for mobile sidebar elements - use getAllByText to handle multiple occurrences
    expect(screen.getAllByText('Admin Panel').length).toBeGreaterThan(0);

    // Find the close button via its X icon
    const closeButton = document.querySelector('.lucide-x');
    expect(closeButton).toBeInTheDocument();

    // Check for "Go to Website" text - use getAllByText since it appears in both mobile and desktop
    expect(screen.getAllByText('Go to Website').length).toBeGreaterThan(0);

    // Check for mobile backdrop
    const backdrop = document.querySelector('.backdrop-blur-sm');
    expect(backdrop).toBeInTheDocument();
  });

  test('closes mobile sidebar when backdrop is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockRegularUser,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(<DashboardSidebar {...defaultProps} sidebarOpen={true} />);

    // Find and click the backdrop
    const backdrop = document.querySelector('.backdrop-blur-sm');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    // Verify that setSidebarOpen was called with false
    expect(defaultProps.setSidebarOpen).toHaveBeenCalledWith(false);
  });

  test('renders user information correctly', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockAdminUser,
      isAdmin: () => true,
      isSuperAdmin: () => false,
    });

    const { container } = render(<DashboardSidebar {...defaultProps} />);

    // Get mobile sidebar user info container
    const userInfoContainers = container.querySelectorAll(
      '.flex-shrink-0.border-t'
    );

    // Check that there's at least one container with the user info
    expect(userInfoContainers.length).toBeGreaterThan(0);

    // Look for user info in the DOM
    const userName = document.querySelector(
      '.text-sm.font-medium.text-gray-900'
    );
    const userEmail = document.querySelector('.text-xs.text-gray-500');

    expect(userName?.textContent).toBe('Admin User');
    expect(userEmail?.textContent).toBe('admin@example.com');

    // Check for the avatar with first letter
    const avatarElements = container.querySelectorAll(
      '.flex-shrink-0.w-8.h-8.bg-amber-100'
    );
    expect(avatarElements.length).toBeGreaterThan(0);
    expect(avatarElements[0].textContent).toBe('A');
  });

  test('calls handleLogout when logout button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockRegularUser,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(<DashboardSidebar {...defaultProps} sidebarOpen={true} />);

    // Get all svg elements
    const logoutIcon = document.querySelector('.lucide-log-out');
    expect(logoutIcon).toBeInTheDocument();

    // Click the parent button of the logout icon
    const logoutButton = logoutIcon?.closest('button');
    fireEvent.click(logoutButton!);

    // Verify handleLogout was called
    expect(defaultProps.handleLogout).toHaveBeenCalled();
  });

  test('filters navigation items correctly for regular user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockRegularUser,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(<DashboardSidebar {...defaultProps} />);

    // Regular users should see Dashboard and Settings
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);

    // Regular users should not see admin-only items
    expect(screen.queryByText('Orders')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  test('filters navigation items correctly for admin user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockAdminUser,
      isAdmin: () => true,
      isSuperAdmin: () => false,
    });

    render(<DashboardSidebar {...defaultProps} />);

    // Admins should see Dashboard, Orders, Products, etc.
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Orders').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Products').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);

    // Admins should not see superadmin-only items
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  test('filters navigation items correctly for superadmin user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockSuperAdminUser,
      isAdmin: () => true,
      isSuperAdmin: () => true,
    });

    render(<DashboardSidebar {...defaultProps} />);

    // Superadmins should see all items
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Orders').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Users').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Products').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  test('toggles collapsed state on desktop sidebar', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockAdminUser,
      isAdmin: () => true,
      isSuperAdmin: () => false,
    });

    const { container } = render(<DashboardSidebar {...defaultProps} />);

    // Find the ChevronLeft icon in the desktop sidebar (not mobile)
    const chevronIcon = container.querySelector('.lucide-chevron-left');
    expect(chevronIcon).toBeInTheDocument();

    // Find and click the collapse button containing the chevron
    const collapseButton = chevronIcon?.closest('button');
    if (collapseButton) {
      fireEvent.click(collapseButton);

      // Verify setCollapsed was called with true
      expect(defaultProps.setCollapsed).toHaveBeenCalledWith(true);
    }
  });

  test('renders collapsed sidebar correctly', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockAdminUser,
      isAdmin: () => true,
      isSuperAdmin: () => false,
    });

    const { container } = render(
      <DashboardSidebar {...defaultProps} collapsed={true} />
    );

    // When collapsed, the "lg:w-20" class should be present on the desktop sidebar
    const desktopSidebar = container.querySelector(
      '.lg\\:flex.lg\\:flex-col.lg\\:fixed.lg\\:inset-y-0.lg\\:w-20'
    );
    expect(desktopSidebar).toBeInTheDocument();

    // Find the ChevronRight icon in the collapsed sidebar
    const expandIcon = container.querySelector('.lucide-chevron-right');
    expect(expandIcon).toBeInTheDocument();

    // Click the expand button
    const expandButton = expandIcon?.closest('button');
    if (expandButton) {
      fireEvent.click(expandButton);

      // Verify setCollapsed was called with false
      expect(defaultProps.setCollapsed).toHaveBeenCalledWith(false);
    }
  });

  test('highlights the current route in navigation', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockAdminUser,
      isAdmin: () => true,
      isSuperAdmin: () => false,
    });

    // Set the current path to /dashboard
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<DashboardSidebar {...defaultProps} />);

    // Get all links
    const navLinks = screen.getAllByTestId('mock-link');

    // Check that at least one Dashboard link has the active classes
    const dashboardLinks = navLinks.filter(
      (link) =>
        link.textContent?.includes('Dashboard') &&
        link.className.includes('bg-amber-50') &&
        link.className.includes('text-amber-600')
    );

    expect(dashboardLinks.length).toBeGreaterThan(0);

    // Check that Orders links don't have the active classes
    const ordersLinks = navLinks.filter(
      (link) =>
        link.textContent?.includes('Orders') &&
        link.className.includes('bg-amber-50') &&
        link.className.includes('text-amber-600')
    );

    expect(ordersLinks.length).toBe(0);
  });

  test('closes sidebar on mobile when a navigation link is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockRegularUser,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(<DashboardSidebar {...defaultProps} sidebarOpen={true} />);

    // Find a navigation link in the mobile sidebar
    const mobileNavLinks = screen
      .getAllByTestId('mock-link')
      .filter(
        (link) =>
          link.className.includes('group flex items-center px-3 py-2.5') &&
          link.textContent?.includes('Dashboard')
      );

    // Should find at least one link
    expect(mobileNavLinks.length).toBeGreaterThan(0);

    // Click the first matching link
    fireEvent.click(mobileNavLinks[0]);

    // Verify setSidebarOpen was called with false
    expect(defaultProps.setSidebarOpen).toHaveBeenCalledWith(false);
  });
});
