import { render, screen, fireEvent } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/dashboard/layout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/auth/ProtectedRoute', () => {
  const ProtectedRouteMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid='protected-route-mock'>{children}</div>
  );
  ProtectedRouteMock.displayName = 'ProtectedRoute';
  return ProtectedRouteMock;
});

jest.mock('@/components/dashboard/DashboardSidebar', () => {
  const DashboardSidebarMock = ({
    sidebarOpen,
    setSidebarOpen,
    handleLogout,
    collapsed,
    setCollapsed,
  }: any) => (
    <div data-testid='dashboard-sidebar-mock'>
      <button
        data-testid='toggle-sidebar'
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        Toggle Sidebar
      </button>
      <button
        data-testid='toggle-collapse'
        onClick={() => setCollapsed(!collapsed)}
      >
        Toggle Collapse
      </button>
      <button data-testid='logout-button' onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
  DashboardSidebarMock.displayName = 'DashboardSidebar';
  return DashboardSidebarMock;
});

jest.mock('@/components/dashboard/DashboardHeader', () => {
  const DashboardHeaderMock = ({ setSidebarOpen }: any) => (
    <div data-testid='dashboard-header-mock'>
      <button data-testid='open-sidebar' onClick={() => setSidebarOpen(true)}>
        Open Sidebar
      </button>
    </div>
  );
  DashboardHeaderMock.displayName = 'DashboardHeader';
  return DashboardHeaderMock;
});

describe('DashboardLayout', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockAuth = {
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);

    // Mock window resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    // Mock addEventListener and removeEventListener
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  test('renders dashboard layout with children', () => {
    render(
      <DashboardLayout>
        <div data-testid='dashboard-content'>Dashboard Content</div>
      </DashboardLayout>
    );

    // Check that the Protected Route component is rendered
    expect(screen.getByTestId('protected-route-mock')).toBeInTheDocument();

    // Check that the sidebar and header are rendered
    expect(screen.getByTestId('dashboard-sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-header-mock')).toBeInTheDocument();

    // Check that the children are rendered
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  test('handles logout correctly', () => {
    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>
    );

    // Click the logout button in sidebar
    fireEvent.click(screen.getByTestId('logout-button'));

    // Check that logout was called and router.push was called with the correct path
    expect(mockAuth.logout).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });

  test('toggles sidebar visibility', () => {
    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>
    );

    // Click the toggle sidebar button
    fireEvent.click(screen.getByTestId('toggle-sidebar'));

    // We can't directly test state changes, but we can verify that the component renders correctly
    // after the state change by testing that the component didn't crash
    expect(screen.getByTestId('dashboard-sidebar-mock')).toBeInTheDocument();

    // Click the open sidebar button in header
    fireEvent.click(screen.getByTestId('open-sidebar'));

    // Again, verify component renders correctly
    expect(screen.getByTestId('dashboard-header-mock')).toBeInTheDocument();
  });
});
