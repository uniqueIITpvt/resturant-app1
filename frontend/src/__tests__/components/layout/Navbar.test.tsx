import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import '@testing-library/jest-dom';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/'),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-testid='mock-link'>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock useAuth hook
jest.mock('@/context/AuthContext', () => {
  const originalModule = jest.requireActual('@/context/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn(() => ({
      user: null,
      logout: jest.fn(),
      isAdmin: jest.fn().mockReturnValue(false),
      isSuperAdmin: jest.fn().mockReturnValue(false),
    })),
  };
});

// Mock useCart hook
jest.mock('@/context/CartContext', () => {
  const originalModule = jest.requireActual('@/context/CartContext');
  return {
    ...originalModule,
    useCart: jest.fn(() => ({
      cart: [],
    })),
  };
});

describe('Navbar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset pathname mock
    (usePathname as jest.Mock).mockReturnValue('/');

    // Reset authentication status
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      logout: jest.fn(),
      isAdmin: jest.fn().mockReturnValue(false),
      isSuperAdmin: jest.fn().mockReturnValue(false),
    });

    // Reset cart
    (useCart as jest.Mock).mockReturnValue({
      cart: [],
    });
  });

  // Using simple render since we've mocked the hooks directly
  const customRender = (ui: React.ReactElement) => render(ui);

  it('renders site title', () => {
    customRender(<Navbar />);
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
  });

  it('renders main nav links', () => {
    customRender(<Navbar />);
    const links = screen.getAllByTestId('mock-link');

    // Check if links contain the expected text
    const navTexts = ['Home', 'Menu', 'About', 'Contact'];
    navTexts.forEach((text) => {
      const linkWithText = links.find((link) => link.textContent === text);
      expect(linkWithText).toBeInTheDocument();
    });
  });

  it('shows cart icon with 0 items initially', () => {
    customRender(<Navbar />);
    // Find cart link by its href
    const cartLinks = screen
      .getAllByTestId('mock-link')
      .filter((link) => link.getAttribute('href') === '/cart');
    expect(cartLinks.length).toBeGreaterThan(0);

    // Cart count shouldn't be visible if there are no items
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows cart count when items are present', () => {
    // Mock cart with items
    (useCart as jest.Mock).mockReturnValue({
      cart: [
        { id: '1', quantity: 2 },
        { id: '2', quantity: 3 },
      ],
    });

    customRender(<Navbar />);
    // Using getAllByText since there might be multiple elements with the same text
    const cartCountElements = screen.getAllByText('5');
    expect(cartCountElements.length).toBeGreaterThan(0);
  });

  it('shows "Sign in" button if not authenticated', () => {
    customRender(<Navbar />);

    // Find all Sign in links and buttons
    const signInElements = screen.getAllByText('Sign in');
    expect(signInElements.length).toBeGreaterThan(0);

    // Check at least one is a link to the login page
    const signInLink = screen
      .getAllByTestId('mock-link')
      .find((link) => link.getAttribute('href') === '/auth/login');
    expect(signInLink).toBeInTheDocument();
  });

  it('toggles mobile menu on click', () => {
    customRender(<Navbar />);

    // Get the mobile menu container
    const menuButton = screen.getByRole('button', { name: /open main menu/i });

    // First click to open the mobile menu
    fireEvent.click(menuButton);

    // Find the mobile menu container
    const mobileMenu = screen
      .getAllByText('Home')[1]
      .closest('div')?.parentElement;
    expect(mobileMenu).toHaveClass('block');
    expect(mobileMenu).not.toHaveClass('hidden');
  });

  it('shows user info when authenticated', () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com', role: 'user' },
      logout: jest.fn(),
      isAdmin: jest.fn().mockReturnValue(false),
      isSuperAdmin: jest.fn().mockReturnValue(false),
    });

    customRender(<Navbar />);

    // Open mobile menu to see user info
    const toggleBtn = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(toggleBtn);

    // Check if user name and email are displayed in mobile menu
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows admin links for admin users', () => {
    // Mock admin user
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      logout: jest.fn(),
      isAdmin: jest.fn().mockReturnValue(true),
      isSuperAdmin: jest.fn().mockReturnValue(false),
    });

    customRender(<Navbar />);

    // Open mobile menu to see admin links
    const toggleBtn = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(toggleBtn);

    // Check for admin links (using getAllByText since there may be multiple elements)
    const dashboardLinks = screen.getAllByText('Dashboard');
    const settingsLinks = screen.getAllByText('Settings');

    expect(dashboardLinks.length).toBeGreaterThan(0);
    expect(settingsLinks.length).toBeGreaterThan(0);
  });

  // Previously skipped test, now fixed to work reliably
  it('calls logout function when sign out is clicked', async () => {
    const mockLogout = jest.fn();

    // Mock authenticated user with the logout function
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com', role: 'user' },
      logout: mockLogout,
      isAdmin: jest.fn().mockReturnValue(false),
      isSuperAdmin: jest.fn().mockReturnValue(false),
    });

    customRender(<Navbar />);

    // Open mobile menu to access sign out button
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Find and click the sign out button in mobile menu (using the last one which should be in mobile menu)
    const signOutButtons = screen.getAllByText('Sign out');
    await act(async () => {
      fireEvent.click(signOutButtons[signOutButtons.length - 1]);
    });

    // Check if logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
