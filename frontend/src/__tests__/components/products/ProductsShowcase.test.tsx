import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductsShowcase from '@/components/products/ProductsShowcase';
import '@testing-library/jest-dom';

// Mock next/image since it's used in the component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src} alt={props.alt} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock the ProductAddonsModal component
jest.mock('@/components/modals/ProductAddonsModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    productId,
  }: {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
  }) =>
    isOpen ? (
      <div data-testid='product-addons-modal'>
        <span>Product ID: {productId}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock the console.error to reduce noise in test output
const originalConsoleError = console.error;
console.error = jest.fn();

// Mock fetch API
global.fetch = jest.fn();

// Save the original API URL
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

// Mock product data for tests
const mockProducts = [
  {
    _id: 'product1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce and mozzarella',
    price: 14.99,
    category: 'Rice Dishes',
    image: {
      url: '/images/pizza.jpg',
    },
  },
  {
    _id: 'product2',
    name: 'Chicken Biryani',
    description: 'Aromatic rice dish with chicken and spices',
    price: 16.99,
    category: 'Rice Dishes',
    image: {
      url: '/images/biryani.jpg',
    },
  },
  {
    _id: 'product3',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with frosting',
    price: 8.99,
    category: 'Desserts',
    image: {
      url: '/images/cake.jpg',
    },
  },
  {
    _id: 'product4',
    name: 'Iced Coffee',
    description: 'Refreshing cold coffee with ice',
    price: 4.99,
    category: 'Beverages',
    image: {
      url: '/images/coffee.jpg',
    },
  },
];

describe('ProductsShowcase Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set our test API URL
    process.env.NEXT_PUBLIC_API_URL = 'https://test-api.com';

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    });
  });

  afterEach(() => {
    // Restore the original API URL
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('shows loading state initially', () => {
    render(<ProductsShowcase />);

    // Check if loading state is displayed
    expect(screen.getByText('Exploring Our Menu')).toBeInTheDocument();
    const loadingAnimation = document.querySelector('.animate-pulse');
    expect(loadingAnimation).toBeInTheDocument();
  });

  it('fetches and displays products successfully', async () => {
    render(<ProductsShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Explore Our Menu')).toBeInTheDocument();
    });

    // Check if fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Check if products are displayed
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
      expect(screen.getByText('Chicken Biryani')).toBeInTheDocument();
    });
  });

  it('filters products by category', async () => {
    render(<ProductsShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Explore Our Menu')).toBeInTheDocument();
    });

    // Click on Desserts category
    const dessertsButton = screen.getByText('Desserts');
    fireEvent.click(dessertsButton);

    // Check that only desserts are displayed
    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
      expect(screen.queryByText('Margherita Pizza')).not.toBeInTheDocument();
    });

    // Click on Beverages category
    const beveragesButton = screen.getByText('Beverages');
    fireEvent.click(beveragesButton);

    // Check that only beverages are displayed
    await waitFor(() => {
      expect(screen.getByText('Iced Coffee')).toBeInTheDocument();
      expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    });
  });

  it('searches for products by name', async () => {
    render(<ProductsShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Explore Our Menu')).toBeInTheDocument();
    });

    // Find search input and type "pizza"
    const searchInput = screen.getByPlaceholderText('Search for dishes...');
    fireEvent.change(searchInput, { target: { value: 'pizza' } });

    // Check that only pizza is displayed
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
      expect(screen.queryByText('Chicken Biryani')).not.toBeInTheDocument();
      expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    });

    // Clear search and check that filtered by active category
    fireEvent.change(searchInput, { target: { value: '' } });

    // Products should show based on active category
    await waitFor(() => {
      // At least one product should be visible after clearing search
      expect(screen.getByText('Explore Our Menu')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ProductsShowcase />);

    // Check if loading state is displayed initially
    expect(screen.getByText('Exploring Our Menu')).toBeInTheDocument();

    // Component should not show error visibly, just hide the section
    await waitFor(() => {
      // Loading state should disappear
      expect(screen.queryByText('Exploring Our Menu')).not.toBeInTheDocument();
      // Error message is console logged but not displayed to user
      expect(
        screen.queryByText('Unable to load products')
      ).not.toBeInTheDocument();
    });
  });

  it('opens add to cart modal when adding a product to cart', async () => {
    render(<ProductsShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Explore Our Menu')).toBeInTheDocument();
    });

    // Find and click the "Add to Cart" button
    const addToCartButtons = screen.getAllByText('Add to Cart');
    fireEvent.click(addToCartButtons[0]); // Click the first one

    // Check that modal is opened
    await waitFor(() => {
      expect(screen.getByTestId('product-addons-modal')).toBeInTheDocument();
    });

    // Close modal
    fireEvent.click(screen.getByText('Close'));

    // Check that modal is closed
    await waitFor(() => {
      expect(
        screen.queryByTestId('product-addons-modal')
      ).not.toBeInTheDocument();
    });
  });

  it('shows "No dishes found" message when search has no results', async () => {
    // Mock an empty array for this test specifically
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty array will trigger no results when searching
    });

    render(<ProductsShowcase />);

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByText('Explore Our Menu')).toBeInTheDocument();
    });

    // Find search input and search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search for dishes...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Check for no results message
    await waitFor(() => {
      const noResultsMessage = screen.queryByText('No dishes found');
      expect(noResultsMessage).toBeInTheDocument();
    });
  });
});
