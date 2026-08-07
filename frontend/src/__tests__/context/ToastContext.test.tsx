import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/context/ToastContext';
import '@testing-library/jest-dom';

// Mock the Toast component
jest.mock('@/components/ui/Toast', () => {
  return function MockToast({
    message,
    type,
    onClose,
  }: {
    message: string;
    type: string;
    duration?: number;
    onClose: () => void;
  }) {
    return (
      <div data-testid={`toast-${type}`} onClick={onClose}>
        {message}
      </div>
    );
  };
});

// Test component that uses the toast context
const TestComponent = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Success message')}>
        Show Success Toast
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error Toast
      </button>
      <button onClick={() => showToast('Warning message', 'warning', 5000)}>
        Show Warning Toast
      </button>
      <button onClick={() => showToast('Info message', 'info')}>
        Show Info Toast
      </button>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('shows a success toast by default when type is not specified', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Click button to show success toast
    act(() => {
      screen.getByText('Show Success Toast').click();
    });

    // Success toast should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-success')).toHaveTextContent(
        'Success message'
      );
    });
  });

  it('shows an error toast when error type is specified', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Click button to show error toast
    act(() => {
      screen.getByText('Show Error Toast').click();
    });

    // Error toast should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
      expect(screen.getByTestId('toast-error')).toHaveTextContent(
        'Error message'
      );
    });
  });

  it('shows a warning toast when warning type is specified', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Click button to show warning toast
    act(() => {
      screen.getByText('Show Warning Toast').click();
    });

    // Warning toast should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
      expect(screen.getByTestId('toast-warning')).toHaveTextContent(
        'Warning message'
      );
    });
  });

  it('shows an info toast when info type is specified', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Click button to show info toast
    act(() => {
      screen.getByText('Show Info Toast').click();
    });

    // Info toast should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('toast-info')).toBeInTheDocument();
      expect(screen.getByTestId('toast-info')).toHaveTextContent(
        'Info message'
      );
    });
  });

  it('can show multiple toasts simultaneously', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show multiple toasts
    act(() => {
      screen.getByText('Show Success Toast').click();
      screen.getByText('Show Error Toast').click();
      screen.getByText('Show Warning Toast').click();
    });

    // All toasts should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
      expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
    });
  });

  it('removes a toast when onClose is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show success toast
    act(() => {
      screen.getByText('Show Success Toast').click();
    });

    // Toast should be displayed and then closed
    let toast: HTMLElement;
    await waitFor(() => {
      toast = screen.getByTestId('toast-success');
      expect(toast).toBeInTheDocument();
    });

    // Click the toast to trigger onClose
    act(() => {
      toast.click();
    });

    // Toast should be removed
    await waitFor(() => {
      expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
    });
  });

  it('throws an error when useToast is used outside a ToastProvider', () => {
    // Mock console.error to prevent the error from being logged during the test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    // Restore console.error
    console.error = originalConsoleError;
  });
});
