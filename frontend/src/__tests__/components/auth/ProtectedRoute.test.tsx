import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute Component', () => {
  // Common mocks
  const pushMock = jest.fn();
  const mockRouter = { push: pushMock };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  test('shows loading spinner when auth is loading', () => {
    // Mock the auth context with loading state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
      isAuthenticated: () => false,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    // Check that loading spinner is displayed
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', async () => {
    // Mock the auth context with not authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: () => false,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/auth/login');
    });
  });

  test('renders children when user is authenticated for a protected route', async () => {
    // Mock the auth context with authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: () => true,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('redirects regular user from admin-only route', async () => {
    // Mock the auth context with authenticated but not admin state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: () => true,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(
      <ProtectedRoute adminOnly>
        <div>Admin content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  test('allows admin user to access admin route', async () => {
    // Mock the auth context with admin state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: () => true,
      isAdmin: () => true,
      isSuperAdmin: () => false,
    });

    render(
      <ProtectedRoute adminOnly>
        <div>Admin content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('redirects admin from superadmin-only route', async () => {
    // Mock the auth context with admin but not superadmin state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: () => true,
      isAdmin: () => true,
      isSuperAdmin: () => false,
    });

    render(
      <ProtectedRoute superAdminOnly>
        <div>Superadmin content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  test('allows superadmin user to access superadmin route', async () => {
    // Mock the auth context with superadmin state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: () => true,
      isAdmin: () => true,
      isSuperAdmin: () => true,
    });

    render(
      <ProtectedRoute superAdminOnly>
        <div>Superadmin content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Superadmin content')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('renders public route content when requiresAuth is false', async () => {
    // Mock the auth context with not authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: () => false,
      isAdmin: () => false,
      isSuperAdmin: () => false,
    });

    render(
      <ProtectedRoute requiresAuth={false}>
        <div>Public content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Public content')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
