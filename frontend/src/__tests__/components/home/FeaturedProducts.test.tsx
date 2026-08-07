import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/__tests__/utils/test-utils';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import '@testing-library/jest-dom';

// Mock the ProductAddonsModal component
jest.mock('@/components/modals/ProductAddonsModal', () => {
  return function MockProductAddonsModal({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
  }) {
    return isOpen ? (
      <div data-testid='product-addons-modal'>
        <button onClick={onClose} data-testid='close-modal-button'>
          Close
        </button>
      </div>
    ) : null;
  };
});

// Sample product data for tests
const mockProducts = [
  {
    _id: '1',
    name: 'Product 1',
    description: 'Description for product 1',
    price: 12.99,
    category: 'Beverages',
    image: {
      url: '/images/product1.jpg',
    },
  },
  {
    _id: '2',
    name: 'Product 2',
    description: 'Description for product 2',
    price: 9.99,
    category: 'Food',
    image: {
      url: '/images/product2.jpg',
    },
  },
  {
    _id: '3',
    name: 'Product 3',
    description: 'Description for product 3',
    price: 14.99,
    category: 'Desserts',
    image: {
      url: '/images/product3.jpg',
    },
  },
  {
    _id: '4',
    name: 'Product 4',
    description: 'Description for product 4',
    price: 7.99,
    category: 'Sides',
    image: {
      url: '/images/product4.jpg',
    },
  },
];

// Mock fetch before tests
global.fetch = jest.fn();

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock console.error to reduce noise in test output
console.error = jest.fn();

describe('FeaturedProducts Component', () => {
  test('renders loading state initially', () => {
    // Mock fetch to delay response
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<FeaturedProducts />);

    // Check loading indicators are present
    expect(screen.getByText("Chef's Selection")).toBeInTheDocument();
    expect(screen.getByText('Featured Dishes')).toBeInTheDocument();

    // Verify loading animation is shown
    const loadingDots = screen
      .getAllByRole('generic', { hidden: true })
      .filter((el) => el.className.includes('animate-pulse'));
    expect(loadingDots.length).toBeGreaterThan(0);
  });

  test('renders products after successful data fetch', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    );

    render(<FeaturedProducts />);

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.getByText(/Discover our chef's selection of exceptional dishes/)
      ).toBeInTheDocument();
    });

    // Check if products are rendered
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('Beverages')).toBeInTheDocument();

    // Check for "Add to Cart" buttons
    const addToCartButtons = screen.getAllByText('Add to Cart');
    expect(addToCartButtons.length).toBe(4);

    // Check for "Explore Full Menu" link
    expect(screen.getByText('Explore Full Menu')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<FeaturedProducts />);

    // Component should not render when there's an error
    await waitFor(() => {
      expect(screen.queryByText('Featured Dishes')).not.toBeInTheDocument();
    });

    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
  });

  test('opens product modal when Add to Cart is clicked', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    );

    render(<FeaturedProducts />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    // Click "Add to Cart" button for the first product
    const addToCartButtons = screen.getAllByText('Add to Cart');
    await user.click(addToCartButtons[0]);

    // Check if modal is opened
    expect(screen.getByTestId('product-addons-modal')).toBeInTheDocument();

    // Close the modal
    await user.click(screen.getByTestId('close-modal-button'));

    // Check if modal is closed
    expect(
      screen.queryByTestId('product-addons-modal')
    ).not.toBeInTheDocument();
  });

  test('shows fallback UI when no products are returned', async () => {
    // Mock empty response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(<FeaturedProducts />);

    // Component should not render when there are no products
    await waitFor(() => {
      expect(screen.queryByText('Featured Dishes')).not.toBeInTheDocument();
    });
  });
});
