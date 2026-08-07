import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

describe('DashboardHeader Component', () => {
  test('renders the header with the correct title', () => {
    const mockSetSidebarOpen = jest.fn();
    render(<DashboardHeader setSidebarOpen={mockSetSidebarOpen} />);

    // Check that the title is rendered
    expect(screen.getByText('Unique Café Admin')).toBeInTheDocument();
  });

  test('calls setSidebarOpen when the menu button is clicked', () => {
    const mockSetSidebarOpen = jest.fn();
    render(<DashboardHeader setSidebarOpen={mockSetSidebarOpen} />);

    // Find and click the menu button
    const menuButton = screen.getByRole('button', { name: /open sidebar/i });
    fireEvent.click(menuButton);

    // Check that setSidebarOpen was called with true
    expect(mockSetSidebarOpen).toHaveBeenCalledWith(true);
  });

  test('renders the menu icon', () => {
    const mockSetSidebarOpen = jest.fn();
    render(<DashboardHeader setSidebarOpen={mockSetSidebarOpen} />);

    // Check that the menu icon is rendered (using its aria-hidden attribute)
    const menuIcon = document.querySelector('[aria-hidden="true"]');
    expect(menuIcon).toBeInTheDocument();
  });

  test('has the proper responsive classes', () => {
    const mockSetSidebarOpen = jest.fn();
    render(<DashboardHeader setSidebarOpen={mockSetSidebarOpen} />);

    // Check for responsive classes
    const header = screen.getByRole('button').closest('div');
    expect(header).toHaveClass('lg:hidden');
  });
});
