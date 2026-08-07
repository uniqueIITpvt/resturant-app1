import { render, screen } from '@testing-library/react';
import ClientNavbarWrapper from '@/components/layout/ClientNavbarWrapper';
import '@testing-library/jest-dom';

// Mock the usePathname hook from next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock UserNavbar component
jest.mock('@/components/layout/UserNavbar', () => () => <div>UserNavbar</div>);

import { usePathname } from 'next/navigation';

describe('ClientNavbarWrapper', () => {
  it('renders UserNavbar on non-dashboard pages', () => {
    usePathname.mockReturnValue('/home');

    render(<ClientNavbarWrapper />);
    expect(screen.getByText('UserNavbar')).toBeInTheDocument();
  });

  it('does not render UserNavbar on dashboard pages', () => {
    usePathname.mockReturnValue('/dashboard');

    render(<ClientNavbarWrapper />);
    expect(screen.queryByText('UserNavbar')).not.toBeInTheDocument();
  });
});
