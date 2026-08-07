import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '@/components/modals/ConfirmModal';
import '@testing-library/jest-dom';

describe('ConfirmModal Component', () => {
  // Common props for testing
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirmMock = jest.fn();

    render(<ConfirmModal {...defaultProps} onConfirm={onConfirmMock} />);

    await user.click(screen.getByText('Confirm'));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancelMock = jest.fn();

    render(<ConfirmModal {...defaultProps} onCancel={onCancelMock} />);

    await user.click(screen.getByText('Cancel'));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onCancelMock = jest.fn();

    render(<ConfirmModal {...defaultProps} onCancel={onCancelMock} />);

    // Find the backdrop using a more reliable selector
    const backdrop = document.querySelector(
      'div.fixed.inset-0.backdrop-blur-sm'
    );

    // Ensure backdrop is found and clickable
    expect(backdrop).toBeInTheDocument();
    if (backdrop instanceof HTMLElement) {
      await user.click(backdrop);
      expect(onCancelMock).toHaveBeenCalledTimes(1);
    }
  });

  test('calls onCancel when close button (X) is clicked', async () => {
    const user = userEvent.setup();
    const onCancelMock = jest.fn();

    render(<ConfirmModal {...defaultProps} onCancel={onCancelMock} />);

    // Find the X button
    const closeButton = screen.getByRole('button', { name: '' }); // X button has no accessible name
    await user.click(closeButton);
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  test('renders custom button text', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText='Yes, Delete'
        cancelText='No, Keep It'
      />
    );

    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('No, Keep It')).toBeInTheDocument();
  });

  test('renders different modal types with appropriate styling', () => {
    const { rerender } = render(
      <ConfirmModal {...defaultProps} type='delete' />
    );
    // Delete type should have a red button
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-red-600');

    // Test warning type
    rerender(<ConfirmModal {...defaultProps} type='warning' />);
    expect(screen.getByText('Confirm')).toHaveClass('bg-yellow-600');

    // Test info type
    rerender(<ConfirmModal {...defaultProps} type='info' />);
    expect(screen.getByText('Confirm')).toHaveClass('bg-blue-600');

    // Test success type
    rerender(<ConfirmModal {...defaultProps} type='success' />);
    expect(screen.getByText('Confirm')).toHaveClass('bg-green-600');
  });

  test('renders appropriate icon for each type', () => {
    const types = ['delete', 'warning', 'info', 'success'] as const;

    types.forEach((type) => {
      const { unmount } = render(
        <ConfirmModal {...defaultProps} type={type} />
      );

      // Find icon wrapper - using more specific targeting to ensure proper type
      const titleElement = screen.getByText('Confirm Action');
      const parentElement = titleElement.parentElement;
      const iconContainer = parentElement?.querySelector('div:first-child');

      expect(iconContainer).toBeInTheDocument();

      // Different icons have different colors based on type
      if (type === 'delete') {
        expect(iconContainer?.firstElementChild).toHaveClass('text-red-600');
      } else if (type === 'warning') {
        expect(iconContainer?.firstElementChild).toHaveClass('text-yellow-500');
      } else if (type === 'info') {
        expect(iconContainer?.firstElementChild).toHaveClass('text-blue-500');
      } else if (type === 'success') {
        expect(iconContainer?.firstElementChild).toHaveClass('text-green-500');
      }

      unmount();
    });
  });
});
