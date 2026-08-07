import { render, screen, waitFor, act } from '@testing-library/react';
import Dashboard from '@/app/(dashboard)/dashboard/page';
import React from 'react';

// Mock the React hooks and state updates to better control loading state
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  let mockIsLoading = true;

  return {
    ...originalReact,
    useState: jest.fn((initialValue) => {
      // For isLoading state
      if (initialValue === true && typeof initialValue === 'boolean') {
        return [
          mockIsLoading,
          (newValue) => {
            mockIsLoading = newValue;
          },
        ];
      }
      // For other states, just return the initialValue
      return [initialValue, jest.fn()];
    }),
    useEffect: jest.fn((fn) => fn()),
  };
});

// Mock next/link component
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a
      href={href}
      data-testid={`link-to-${href.replace(/\//g, '-')}`}
      {...props}
    >
      {children}
    </a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

// Mock Lucide icons
jest.mock('lucide-react', () => {
  return {
    Users: () => <div data-testid='users-icon'>Users Icon</div>,
    ShoppingBag: () => (
      <div data-testid='shopping-bag-icon'>ShoppingBag Icon</div>
    ),
    DollarSign: () => <div data-testid='dollar-sign-icon'>DollarSign Icon</div>,
    Layers: () => <div data-testid='layers-icon'>Layers Icon</div>,
    Activity: () => <div data-testid='activity-icon'>Activity Icon</div>,
    Calendar: () => <div data-testid='calendar-icon'>Calendar Icon</div>,
    ArrowUp: () => <div data-testid='arrow-up-icon'>ArrowUp Icon</div>,
    CheckCircle: () => (
      <div data-testid='check-circle-icon'>CheckCircle Icon</div>
    ),
    XCircle: () => <div data-testid='x-circle-icon'>XCircle Icon</div>,
    AlertCircle: () => (
      <div data-testid='alert-circle-icon'>AlertCircle Icon</div>
    ),
    UserPlus: () => <div data-testid='user-plus-icon'>UserPlus Icon</div>,
    ShoppingCart: () => (
      <div data-testid='shopping-cart-icon'>ShoppingCart Icon</div>
    ),
    CreditCard: () => <div data-testid='credit-card-icon'>CreditCard Icon</div>,
    Package: () => <div data-testid='package-icon'>Package Icon</div>,
    ChevronDown: () => (
      <div data-testid='chevron-down-icon'>ChevronDown Icon</div>
    ),
    Clock: () => <div data-testid='clock-icon'>Clock Icon</div>,
    ChevronRight: () => (
      <div data-testid='chevron-right-icon'>ChevronRight Icon</div>
    ),
  };
});

describe('Dashboard Page', () => {
  // Mock console.error to avoid noise in tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockRestore();
  });

  test('renders dashboard with header elements', async () => {
    render(<Dashboard />);

    // Check for basic UI elements that are always present
    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText('Go to Website')).toBeInTheDocument();
  });

  test('renders Admin User greeting', async () => {
    render(<Dashboard />);

    // Check for Admin User text in the welcome message
    const welcomeText = screen.getByText(/Welcome back/i);
    expect(welcomeText.textContent).toContain('Admin User');
  });

  test('renders loading spinner initially', async () => {
    // Modify the mock of useState to return isLoading=true
    jest.mock('react', () => {
      const originalReact = jest.requireActual('react');
      return {
        ...originalReact,
        useState: jest.fn().mockImplementation((init) => {
          if (init === true) {
            return [true, jest.fn()]; // Always return isLoading as true
          }
          return [init, jest.fn()];
        }),
        useEffect: jest.fn((fn) => fn()),
      };
    });

    render(<Dashboard />);

    // Since isLoading is mocked to be true, we should see the loading spinner
    expect(
      screen.getByRole('main').querySelector('.animate-spin')
    ).toBeInTheDocument();
  });
});
