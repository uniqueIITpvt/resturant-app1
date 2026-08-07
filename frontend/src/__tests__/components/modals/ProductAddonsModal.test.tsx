import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductAddonsModal from '@/components/modals/ProductAddonsModal';
import '@testing-library/jest-dom';
import { useCart } from '@/context/CartContext';
import React from 'react';

// Mock the CartContext
jest.mock('@/context/CartContext', () => ({
  useCart: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn();

// Mock API URL - Update to match what's in the component
process.env.NEXT_PUBLIC_API_URL =
  'https://resturant-app-backend-red.vercel.app';

// Mock product data
const mockProduct = {
  _id: 'product123',
  name: 'Margherita Pizza',
  description: 'Classic Italian pizza with tomato sauce and mozzarella',
  price: 14.99,
  category: 'Pizza',
  image: {
    url: '/images/pizza.jpg',
  },
  addonGroups: [
    {
      title: 'Size',
      required: true,
      options: [
        { name: 'Medium', price: 0 },
        { name: 'Large', price: 3 },
        { name: 'Extra Large', price: 5 },
      ],
    },
    {
      title: 'Extra Toppings',
      required: false,
      options: [
        { name: 'Pepperoni', price: 2 },
        { name: 'Mushrooms', price: 1.5 },
        { name: 'Extra Cheese', price: 1.5 },
        { name: 'Olives', price: 1 },
      ],
    },
  ],
};

describe('ProductAddonsModal Component', () => {
  // Common props for testing
  const defaultProps = {
    productId: 'product123',
    isOpen: true,
    onClose: jest.fn(),
  };

  const addToCartMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useCart hook implementation
    (useCart as jest.Mock).mockReturnValue({
      addToCart: addToCartMock,
    });

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProduct,
    });
  });

  it('fetches product data when opened', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    // Check if fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://resturant-app-backend-red.vercel.app/api/products/product123'
    );

    // Wait for product data to load
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<ProductAddonsModal {...defaultProps} />);

    // Find the loading spinner instead of looking for text
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load product details')
      ).toBeInTheDocument();
    });
  });

  it('shows product details after loading', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Classic Italian pizza with tomato sauce and mozzarella'
        )
      ).toBeInTheDocument();
      // Use getAllByText since there might be multiple elements with the same text
      const priceElements = screen.getAllByText(/14\.99/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  it('shows addon groups and options', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      // Check addon group titles
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Extra Toppings')).toBeInTheDocument();

      // Check addon options
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
      expect(screen.getByText('Pepperoni')).toBeInTheDocument();
      expect(screen.getByText('Mushrooms')).toBeInTheDocument();
    });
  });

  it('indicates which addon groups are required', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  it('shows addon prices correctly', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      // Use getAllByText since there might be multiple elements with the same price
      expect(screen.getAllByText(/\+\$0\.00/i)[0]).toBeInTheDocument(); // Medium
      expect(screen.getAllByText(/\+\$3\.00/i)[0]).toBeInTheDocument(); // Large
      expect(screen.getAllByText(/\+\$5\.00/i)[0]).toBeInTheDocument(); // Extra Large
      expect(screen.getAllByText(/\+\$2\.00/i)[0]).toBeInTheDocument(); // Pepperoni
    });
  });

  it('allows changing quantity', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    });

    // Get quantity controls by their icons/structure
    const increaseButton = document
      .querySelector('button svg.lucide-plus')
      ?.closest('button');
    const decreaseButton = document
      .querySelector('button svg.lucide-minus')
      ?.closest('button');
    const quantityDisplay = document.querySelector(
      '.border-t.border-b.border-gray-300'
    );

    // Verify they exist
    expect(increaseButton).toBeInTheDocument();
    expect(decreaseButton).toBeInTheDocument();
    expect(quantityDisplay).toBeInTheDocument();
    expect(quantityDisplay).toHaveTextContent('1');

    // Increase quantity
    if (increaseButton) fireEvent.click(increaseButton);
    expect(quantityDisplay).toHaveTextContent('2');

    // Increase again
    if (increaseButton) fireEvent.click(increaseButton);
    expect(quantityDisplay).toHaveTextContent('3');

    // Decrease quantity
    if (decreaseButton) fireEvent.click(decreaseButton);
    expect(quantityDisplay).toHaveTextContent('2');
  });

  it('prevents decreasing quantity below 1', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    });

    const decreaseButton = document
      .querySelector('button svg.lucide-minus')
      ?.closest('button');
    const quantityDisplay = document.querySelector(
      '.border-t.border-b.border-gray-300'
    );

    expect(decreaseButton).toBeInTheDocument();
    expect(quantityDisplay).toBeInTheDocument();
    expect(quantityDisplay).toHaveTextContent('1');

    // Try to decrease below 1
    if (decreaseButton) fireEvent.click(decreaseButton);

    // Quantity should remain at 1
    expect(quantityDisplay).toHaveTextContent('1');
  });

  it('allows selecting addons', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    // Select Large size
    fireEvent.click(screen.getByText('Large'));

    // Select Pepperoni topping
    fireEvent.click(screen.getByText('Pepperoni'));

    // Verify changes to the total price
    await waitFor(() => {
      // Check for total price display
      const totalElement = screen.getByText('Total').nextElementSibling;
      expect(totalElement).toBeInTheDocument();
      expect(totalElement).toHaveTextContent(/19\.99/);
    });
  });

  it('calls addToCart when Add to Cart button is clicked', async () => {
    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    // Select Large size (required addon)
    fireEvent.click(screen.getByText('Large'));

    // Click Add to Cart button
    fireEvent.click(screen.getByText('Add to Cart'));

    // Check if addToCart was called with expected product format
    expect(addToCartMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'product123', // The ID is from _id in the product but renamed to id
        name: 'Margherita Pizza',
        price: 14.99,
        quantity: 1,
        // The component adds the image URL too
        image: '/images/pizza.jpg',
        // The component passes selectedAddons directly
        selectedAddons: expect.arrayContaining([
          expect.objectContaining({
            title: 'Size',
          }),
        ]),
      })
    );
  });

  it('shows error when trying to add to cart without required addons', async () => {
    // Mock toast.error to capture the error message
    const mockToast = { error: jest.fn() };
    jest.mock('react-hot-toast', () => mockToast);

    // Clean any existing mocks for this test
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockProduct,
        addonGroups: [
          {
            title: 'Size',
            required: true,
            options: [
              { name: 'Medium', price: 0 },
              { name: 'Large', price: 3 },
            ],
          },
        ],
      }),
    });

    // Reset addToCart mock for this test
    addToCartMock.mockClear();

    render(<ProductAddonsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    // Make sure "Size" addon group is rendered
    expect(screen.getByText('Size')).toBeInTheDocument();

    // Normally, the component auto-selects the first option of required groups
    // We need to deselect it before testing
    const mediumOption = screen.getByLabelText('Medium');
    expect(mediumOption).toBeInTheDocument();

    // Uncheck the Medium option (which is auto-selected)
    fireEvent.click(mediumOption);

    // Click Add to Cart
    fireEvent.click(screen.getByText('Add to Cart'));

    // addToCart should not be called because required addons are missing
    expect(addToCartMock).not.toHaveBeenCalled();
  });

  it('closes the modal when X button is clicked', async () => {
    const onCloseMock = jest.fn();
    render(<ProductAddonsModal {...defaultProps} onClose={onCloseMock} />);

    await waitFor(() => {
      // Use the X button icon instead of text
      const closeButton = document
        .querySelector('button svg.lucide-x')
        ?.closest('button');
      expect(closeButton).toBeInTheDocument();
      if (closeButton) fireEvent.click(closeButton);
    });

    expect(onCloseMock).toHaveBeenCalled();
  });
});
