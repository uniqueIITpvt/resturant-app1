import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderDetailsModal from '@/components/modals/OrderDetailsModal';
import '@testing-library/jest-dom';
import toast from 'react-hot-toast';

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock confirm dialog
window.confirm = jest.fn();

// Mock API URL
process.env.NEXT_PUBLIC_API_URL =
  'https://resturant-app-backend-red.vercel.app';

// Mock order data
const mockOrder = {
  _id: 'order123',
  orderNumber: 'ORD-1234567',
  items: [
    {
      id: 'item1',
      name: 'Margherita Pizza',
      price: 14.99,
      quantity: 2,
      image: '/images/pizza.jpg',
      selectedAddons: [
        {
          title: 'Size',
          options: [{ name: 'Large', price: 3.0 }],
        },
      ],
    },
    {
      id: 'item2',
      name: 'Caesar Salad',
      price: 8.99,
      quantity: 1,
      image: '/images/salad.jpg',
    },
  ],
  subtotal: 41.97,
  tax: 3.35,
  deliveryFee: 4.99,
  coupon: {
    code: 'SAVE10',
    discountType: 'percentage',
    discountValue: 10,
    discountAmount: 4.2,
  },
  total: 46.11,
  status: 'pending',
  createdAt: '2023-06-15T18:30:00.000Z',
  paymentMethod: 'Credit Card',
  deliveryAddress: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postalCode: '12345',
  },
};

describe('OrderDetailsModal Component', () => {
  // Common props for testing
  const defaultProps = {
    isOpen: true,
    orderId: 'order123',
    onClose: jest.fn(),
    token: 'fake-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockOrder,
    });
  });

  it('fetches order details when opened with an orderId', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    // Check if fetch was called with the correct URL and token
    expect(global.fetch).toHaveBeenCalledWith(
      'https://resturant-app-backend-red.vercel.app/api/orders/order123',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-token',
        }),
      })
    );

    // Wait for order data to load
    await waitFor(() => {
      expect(screen.getByText('Order #ORD-1234567')).toBeInTheDocument();
    });
  });

  it('does not fetch order details when token is null', () => {
    render(<OrderDetailsModal {...defaultProps} token={null} />);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows loading state initially', () => {
    render(<OrderDetailsModal {...defaultProps} />);

    // The component uses a spinner rather than "Loading..." text
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      // The actual error message in the component
      expect(
        screen.getByText(
          'Could not load order details. Please try again later.'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays order items correctly', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      // Check if order items are displayed
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();

      // Check quantities - the component uses "Qty: 2" format
      expect(screen.getByText('Qty: 2')).toBeInTheDocument(); // Quantity of pizza
      expect(screen.getByText('Qty: 1')).toBeInTheDocument(); // Quantity of salad

      // Check if addon is displayed - the format has changed
      expect(screen.getByText('Size:')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      // The format used by the component is different - checking for the exact format
      expect(screen.getByText('16 June 2023')).toBeInTheDocument();
    });
  });

  it('displays order status with correct badge', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      const pendingBadge = screen.getByText('Pending');
      expect(pendingBadge).toBeInTheDocument();
      expect(pendingBadge).toHaveClass('bg-orange-100');
      expect(pendingBadge).toHaveClass('text-orange-800');
    });
  });

  it('displays price details correctly', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      // Check price components
      expect(screen.getByText('$41.97')).toBeInTheDocument(); // Subtotal
      expect(screen.getByText('$3.35')).toBeInTheDocument(); // Tax
      expect(screen.getByText('$4.99')).toBeInTheDocument(); // Delivery fee
      expect(screen.getByText('-$4.20')).toBeInTheDocument(); // Coupon discount
      expect(screen.getByText('$46.11')).toBeInTheDocument(); // Total
    });
  });

  it('displays delivery address correctly', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Anytown, CA 12345')).toBeInTheDocument();
    });
  });

  it('displays payment method correctly', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
    });
  });

  it('shows cancel button for pending orders', async () => {
    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel Order');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).not.toBeDisabled();
    });
  });

  it('does not show cancel button for non-pending orders', async () => {
    // Mock a completed order
    const completedOrder = { ...mockOrder, status: 'completed' };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => completedOrder,
    });

    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cancel Order')).not.toBeInTheDocument();
    });
  });

  it('asks for confirmation when trying to cancel an order', async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);

    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeInTheDocument();
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel Order'));

    // Confirm dialog should be shown
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure you want to cancel this order?')
    );
  });

  it('cancels order when confirmed', async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);

    // Mock successful cancel response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockOrder, status: 'cancelled' }),
      });

    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeInTheDocument();
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel Order'));

    // Should make PUT request to cancel the order
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://resturant-app-backend-red.vercel.app/api/orders/order123/cancel',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });

    // Should show success toast
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Order cancelled')
    );
  });

  it('does not cancel order when not confirmed', async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeInTheDocument();
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel Order'));

    // Second fetch should not happen (for cancellation)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('shows error toast when cancel request fails', async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);

    // Mock successful fetch for order details but failed cancellation
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Cannot cancel order' }),
      });

    render(<OrderDetailsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeInTheDocument();
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel Order'));

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to cancel order')
      );
    });
  });

  it('closes the modal when Close button is clicked', async () => {
    const onCloseMock = jest.fn();
    render(<OrderDetailsModal {...defaultProps} onClose={onCloseMock} />);

    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close'));

    expect(onCloseMock).toHaveBeenCalled();
  });
});
