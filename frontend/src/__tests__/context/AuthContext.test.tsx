import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the auth context
const TestComponent = () => {
  const {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isRegularUser,
  } = useAuth();

  const testUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
  };

  const adminUser = {
    id: 'admin-123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
  };

  const superAdminUser = {
    id: 'superadmin-123',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'superadmin' as const,
  };

  return (
    <div>
      <div data-testid='loading-state'>{isLoading ? 'Loading' : 'Loaded'}</div>
      <div data-testid='authenticated'>{isAuthenticated() ? 'Yes' : 'No'}</div>
      <div data-testid='is-admin'>{isAdmin() ? 'Yes' : 'No'}</div>
      <div data-testid='is-superadmin'>{isSuperAdmin() ? 'Yes' : 'No'}</div>
      <div data-testid='is-user'>{isRegularUser() ? 'Yes' : 'No'}</div>

      {user && (
        <div data-testid='user-info'>
          <div data-testid='user-name'>{user.name}</div>
          <div data-testid='user-email'>{user.email}</div>
          <div data-testid='user-role'>{user.role}</div>
        </div>
      )}

      {token && <div data-testid='token'>{token}</div>}

      <button onClick={() => login('test-token', testUser)}>
        Login as User
      </button>
      <button onClick={() => login('admin-token', adminUser)}>
        Login as Admin
      </button>
      <button onClick={() => login('superadmin-token', superAdminUser)}>
        Login as SuperAdmin
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateUser({ name: 'Updated Name' })}>
        Update Name
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('initializes with null user and token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // User should not be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('No');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('token')).not.toBeInTheDocument();
  });

  it('loads user and token from localStorage on mount', async () => {
    const storedUser = {
      id: 'stored-123',
      name: 'Stored User',
      email: 'stored@example.com',
      role: 'user',
    };
    const storedToken = 'stored-token';

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'user') return JSON.stringify(storedUser);
      if (key === 'token') return storedToken;
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // User should be authenticated with stored data
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Yes');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Stored User');
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
  });

  it('logs in a user successfully', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Login as a regular user
    fireEvent.click(screen.getByText('Login as User'));

    // User should be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Yes');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'test@example.com'
    );
    expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');

    // Role checks should be correct
    expect(screen.getByTestId('is-user')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('No');
    expect(screen.getByTestId('is-superadmin')).toHaveTextContent('No');

    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'token',
      'test-token'
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      expect.any(String)
    );
  });

  it('logs in an admin user correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Login as admin
    fireEvent.click(screen.getByText('Login as Admin'));

    // Role checks should be correct
    expect(screen.getByTestId('is-user')).toHaveTextContent('No');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-superadmin')).toHaveTextContent('No');
  });

  it('logs in a superadmin user correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Login as superadmin
    fireEvent.click(screen.getByText('Login as SuperAdmin'));

    // Role checks should be correct
    expect(screen.getByTestId('is-user')).toHaveTextContent('No');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes'); // Admin function returns true for superadmins too
    expect(screen.getByTestId('is-superadmin')).toHaveTextContent('Yes');
  });

  it('logs out successfully', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Login then logout
    fireEvent.click(screen.getByText('Login as User'));
    fireEvent.click(screen.getByText('Logout'));

    // User should be logged out
    expect(screen.getByTestId('authenticated')).toHaveTextContent('No');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('token')).not.toBeInTheDocument();

    // Check if localStorage was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  it('updates user information', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
    });

    // Login first
    fireEvent.click(screen.getByText('Login as User'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');

    // Update user name
    fireEvent.click(screen.getByText('Update Name'));

    // Check if name was updated
    expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');

    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      expect.any(String)
    );
    const updatedUserJson = localStorageMock.setItem.mock.calls.find(
      (call) =>
        call[0] === 'user' && JSON.parse(call[1]).name === 'Updated Name'
    );
    expect(updatedUserJson).toBeTruthy();
  });

  it('handles localStorage errors gracefully', async () => {
    // Mock a parsing error when reading from localStorage
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'user') return 'invalid-json';
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Just verify user is not authenticated since localStorage had invalid data
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('No');
    });
  });
});
