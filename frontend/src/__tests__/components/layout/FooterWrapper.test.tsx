import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FooterWrapper from '@/components/layout/FooterWrapper';
import { usePathname } from 'next/navigation';

// Mock the next/navigation hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the Footer component
jest.mock('@/components/layout/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid='footer-component'>Footer Component</div>,
}));

describe('FooterWrapper Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Footer component on regular pages', () => {
    // Mock the pathname to be a regular page
    (usePathname as jest.Mock).mockReturnValue('/about');

    render(<FooterWrapper />);

    // Check if Footer component is rendered
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
  });

  test('does not render Footer component on dashboard pages', () => {
    // Mock the pathname to be a dashboard page
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(<FooterWrapper />);

    // Check that Footer component is not rendered
    expect(screen.queryByTestId('footer-component')).not.toBeInTheDocument();
  });

  test('does not render Footer on nested dashboard pages', () => {
    // Mock the pathname to be a nested dashboard page
    (usePathname as jest.Mock).mockReturnValue('/dashboard/users');

    render(<FooterWrapper />);

    // Check that Footer component is not rendered
    expect(screen.queryByTestId('footer-component')).not.toBeInTheDocument();
  });
});
