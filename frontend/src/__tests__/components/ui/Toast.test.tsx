import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast, { ToastContainer } from '@/components/ui/Toast';
import '@testing-library/jest-dom';

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test('renders with default props', () => {
    render(<Toast message='Test message' />);

    // Check if message is rendered
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Check for correct background color based on success type
    const toastContent = screen.getByText('Test message').closest('div.flex');
    expect(toastContent).toBeInTheDocument();
    expect(toastContent).toHaveClass('bg-green-500');
  });

  test('renders with different toast types', () => {
    const { rerender } = render(
      <Toast message='Success toast' type='success' />
    );
    expect(screen.getByText('Success toast')).toBeInTheDocument();
    expect(screen.getByRole('button').parentElement).toHaveClass(
      'bg-green-500'
    );

    rerender(<Toast message='Error toast' type='error' />);
    expect(screen.getByText('Error toast')).toBeInTheDocument();
    expect(screen.getByRole('button').parentElement).toHaveClass('bg-red-500');

    rerender(<Toast message='Warning toast' type='warning' />);
    expect(screen.getByText('Warning toast')).toBeInTheDocument();
    expect(screen.getByRole('button').parentElement).toHaveClass(
      'bg-amber-500'
    );

    rerender(<Toast message='Info toast' type='info' />);
    expect(screen.getByText('Info toast')).toBeInTheDocument();
    expect(screen.getByRole('button').parentElement).toHaveClass('bg-blue-500');
  });

  test('auto-closes after duration', async () => {
    const onCloseMock = jest.fn();
    render(
      <Toast message='Auto close test' duration={1000} onClose={onCloseMock} />
    );

    // Initially visible
    const toastContainer = screen
      .getByText('Auto close test')
      .closest('div[class*="fixed"]');
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer).toHaveClass('translate-y-0 opacity-100');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Verify proper classes
    expect(toastContainer).toHaveClass('translate-y-10 opacity-0');

    // Fast-forward more to trigger onClose callback (300ms animation)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Verify onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('closes when the close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onCloseMock = jest.fn();

    render(<Toast message='Close button test' onClose={onCloseMock} />);

    const toastContainer = screen
      .getByText('Close button test')
      .closest('div[class*="fixed"]');
    expect(toastContainer).toHaveClass('translate-y-0 opacity-100');

    // Click the close button
    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    // Check that it becomes invisible (opacity 0)
    expect(toastContainer).toHaveClass('translate-y-10 opacity-0');

    // Fast-forward to trigger onClose callback (300ms animation)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Verify onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  describe('ToastContainer Component', () => {
    test('renders multiple toasts', () => {
      const toasts = [
        { id: '1', message: 'Toast 1', type: 'success' as const },
        { id: '2', message: 'Toast 2', type: 'error' as const },
        { id: '3', message: 'Toast 3', type: 'info' as const },
      ];

      const removeToastMock = jest.fn();

      render(<ToastContainer toasts={toasts} removeToast={removeToastMock} />);

      // Check all toasts are rendered
      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
      expect(screen.getByText('Toast 3')).toBeInTheDocument();
    });

    test('calls removeToast when a toast is closed', async () => {
      const toasts = [
        { id: '123', message: 'Toast test', type: 'success' as const },
      ];

      const removeToastMock = jest.fn();

      render(<ToastContainer toasts={toasts} removeToast={removeToastMock} />);

      // Fast-forward time to trigger auto-close
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Fast-forward animation time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Verify removeToast was called with the correct ID
      expect(removeToastMock).toHaveBeenCalledWith('123');
    });
  });
});
