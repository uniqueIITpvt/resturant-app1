import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginErrorMessage from '@/app/(auth)/auth/components/LoginErrorMessage';

// Mock next/link
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

describe('LoginErrorMessage Component', () => {
  test('renders default message when no message prop is provided', () => {
    render(<LoginErrorMessage />);

    expect(
      screen.getByText('No user found with the provided credentials.')
    ).toBeInTheDocument();
  });

  test('renders custom error message when provided', () => {
    const customMessage = 'Custom error message';
    render(<LoginErrorMessage message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('renders reset password link', () => {
    render(<LoginErrorMessage />);

    const resetPasswordLink = screen.getByText('Reset password');
    expect(resetPasswordLink).toBeInTheDocument();
    expect(resetPasswordLink.closest('a')).toHaveAttribute(
      'href',
      '/auth/forgot-password'
    );
  });

  test('renders sign up link by default', () => {
    render(<LoginErrorMessage />);

    const signUpLink = screen.getByText('Create an account');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/auth/register');
  });

  test('does not render sign up link when showSignUp is false', () => {
    render(<LoginErrorMessage showSignUp={false} />);

    expect(screen.queryByText('Create an account')).not.toBeInTheDocument();
  });
});
