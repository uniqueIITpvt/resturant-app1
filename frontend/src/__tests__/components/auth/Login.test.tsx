import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/(auth)/auth/login/page';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/utils/api';

// Mock the necessary dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('@/utils/api', () => ({
  post: jest.fn(),
}));

// Mock console.error to prevent error logs during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock next/link component
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Login Page', () => {
  // Common mocks
  const pushMock = jest.fn();
  const loginMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('/'),
    });
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
    });
  });

  test('renders login form elements', () => {
    render(<LoginPage />);

    // Check for form elements
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();

    // Check for link text - using getByRole with name to find the link
    const registerLink = screen.getByRole('link', {
      name: /create a new account/i,
    });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  test('validates email field', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);

    // Test empty email
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.blur(emailInput);
    expect(await screen.findByText('Email is required')).toBeInTheDocument();

    // Test invalid email format
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();

    // Test valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.blur(emailInput);
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Please enter a valid email address')
    ).not.toBeInTheDocument();
  });

  test('validates password field', async () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/password/i);

    // Test empty password
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.blur(passwordInput);
    expect(await screen.findByText('Password is required')).toBeInTheDocument();

    // Test short password
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.blur(passwordInput);
    expect(
      await screen.findByText('Password must be at least 6 characters')
    ).toBeInTheDocument();

    // Test valid password
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.blur(passwordInput);
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Password must be at least 6 characters')
    ).not.toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement;
    // Find the eye icon button near the password field
    const visibilityToggle = document.querySelector(
      'button.text-gray-400'
    ) as HTMLButtonElement;
    expect(visibilityToggle).not.toBeNull();

    // Password should be hidden by default
    expect(passwordInput.type).toBe('password');

    // Click to show password
    fireEvent.click(visibilityToggle);
    expect(passwordInput.type).toBe('text');

    // Click to hide password again
    fireEvent.click(visibilityToggle);
    expect(passwordInput.type).toBe('password');
  });

  test('successful login redirects user to homepage', async () => {
    // Mock API response
    (api.post as jest.Mock).mockResolvedValueOnce({
      token: 'test-token',
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      },
    });

    render(<LoginPage />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123', name: 'password' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Check if login function was called
      expect(loginMock).toHaveBeenCalledWith('test-token', {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });

      // Check if toast was shown
      expect(toast.success).toHaveBeenCalledWith('Welcome back, Test User!');

      // Check if redirected to homepage
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  test('admin login redirects to dashboard', async () => {
    // Mock API response for admin user
    (api.post as jest.Mock).mockResolvedValueOnce({
      token: 'admin-token',
      user: {
        id: '2',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
    });

    render(<LoginPage />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'adminpass', name: 'password' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Check if redirected to dashboard
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login error', async () => {
    // Mock API error
    const errorMessage = 'Invalid password';
    (api.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<LoginPage />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword', name: 'password' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Check if error message is displayed
      expect(
        screen.getByText(/Incorrect password for test@example.com/i)
      ).toBeInTheDocument();
    });
  });

  test('shows OTP verification form when required', async () => {
    // Mock API response requiring OTP verification
    (api.post as jest.Mock).mockResolvedValueOnce({
      requiresVerification: true,
      userId: 'user123',
      email: 'unverified@example.com',
      sentMethods: ['email'],
    });

    render(<LoginPage />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'unverified@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123', name: 'password' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Check if OTP verification form is displayed with login-specific messaging
      expect(
        screen.getByText(/Account Verification Required/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Your account needs verification before you can sign in/i
        )
      ).toBeInTheDocument();
      expect(screen.getByText(/Back to login/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /verify code/i })
      ).toBeInTheDocument();
    });
  });

  test('completes login verification flow successfully', async () => {
    // Mock login API response requiring verification
    (api.post as jest.Mock).mockResolvedValueOnce({
      requiresVerification: true,
      userId: 'user123',
      email: 'unverified@example.com',
      sentMethods: ['email'],
    });

    // Mock fetch for OTP verification
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Verification successful',
        token: 'verified-token',
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'unverified@example.com',
          role: 'user',
        },
      }),
    });

    render(<LoginPage />);

    // Fill in login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'unverified@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123', name: 'password' },
    });

    // Submit login form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for OTP verification form to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Account Verification Required/i)
      ).toBeInTheDocument();
    });

    // Fill in OTP (simulate entering 6-digit code)
    const otpInputs = screen.getAllByRole('textbox');
    const otpDigits = ['1', '2', '3', '4', '5', '6'];

    otpDigits.forEach((digit, index) => {
      fireEvent.change(otpInputs[index], { target: { value: digit } });
    });

    // Wait for verification to complete and login to succeed
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('verified-token', {
        id: 'user123',
        name: 'Test User',
        email: 'unverified@example.com',
        role: 'user',
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Welcome back, Test User! Account verified successfully.'
      );
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });
});
