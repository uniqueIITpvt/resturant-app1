import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuItemClient } from '@/components/menu/MenuItemClient';
import { useCart } from '@/context/CartContext';
import '@testing-library/jest-dom';

// Mock the CartContext
jest.mock('@/context/CartContext', () => ({
  useCart: jest.fn(),
}));

// Mock the ProductAddonsModal
jest.mock('@/components/modals/ProductAddonsModal', () => {
  return function MockProductAddonsModal({
    isOpen,
    onClose,
    productId,
  }: {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
  }) {
    return isOpen ? (
      <div data-testid='product-addons-modal' data-product-id={productId}>
        <button onClick={onClose} data-testid='close-modal-button'>
          Close
        </button>
      </div>
    ) : null;
  };
});

describe('MenuItemClient Component', () => {
  // Sample menu item for testing
  const mockMenuItem = {
    _id: 'item1',
    name: 'Test Item',
    description: 'This is a test menu item',
    price: 9.99,
    category: 'Test Category',
    image: {
      url: '/test-image.jpg',
    },
    isPopular: true,
    isVegetarian: false,
    addonGroups: [
      {
        title: 'Toppings',
        required: false,
        options: [
          { name: 'Cheese', price: 1.5 },
          { name: 'Bacon', price: 2.0 },
        ],
      },
    ],
  };

  // Mock implementation of useCart
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue({
      addToCart: mockAddToCart,
    });
  });

  test('renders menu item with correct information', () => {
    render(<MenuItemClient item={mockMenuItem} />);

    // Test item details are displayed
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('This is a test menu item')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();

    // Check for badges
    expect(screen.getByText('Popular')).toBeInTheDocument();

    // Check for customizable indicator
    expect(screen.getByText('Customizable')).toBeInTheDocument();
  });

  test('renders "Customize Options" button when item has addons', () => {
    render(<MenuItemClient item={mockMenuItem} />);

    // Check for customize button
    expect(screen.getByText('Customize Options')).toBeInTheDocument();
  });

  test('does not render "Customize Options" button when item has no addons', () => {
    const itemWithoutAddons = {
      ...mockMenuItem,
      addonGroups: [],
    };

    render(<MenuItemClient item={itemWithoutAddons} />);

    // Customize button should not exist
    expect(screen.queryByText('Customize Options')).not.toBeInTheDocument();
  });

  test('adds item to cart directly when it has no addons', async () => {
    const user = userEvent.setup();
    const itemWithoutAddons = {
      ...mockMenuItem,
      addonGroups: [],
    };

    render(<MenuItemClient item={itemWithoutAddons} />);

    // Find add to cart button and click it
    const addToCartButton = screen.getAllByRole('button')[0]; // First button is the add to cart button
    await user.click(addToCartButton);

    // Check cart context was called
    expect(mockAddToCart).toHaveBeenCalledWith({
      id: 'item1',
      name: 'Test Item',
      price: 9.99,
      quantity: 1,
      image: '/test-image.jpg',
    });

    // Modal should not appear
    expect(
      screen.queryByTestId('product-addons-modal')
    ).not.toBeInTheDocument();
  });

  test('opens customization modal when adding an item with addons', async () => {
    const user = userEvent.setup();

    render(<MenuItemClient item={mockMenuItem} />);

    // Find customize button and click it
    const customizeButton = screen.getByText('Customize Options');
    await user.click(customizeButton);

    // Modal should appear
    expect(screen.getByTestId('product-addons-modal')).toBeInTheDocument();
    expect(screen.getByTestId('product-addons-modal')).toHaveAttribute(
      'data-product-id',
      'item1'
    );

    // Cart should not be updated yet
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  test('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();

    render(<MenuItemClient item={mockMenuItem} />);

    // Open modal first
    const customizeButton = screen.getByText('Customize Options');
    await user.click(customizeButton);

    // Modal should appear
    expect(screen.getByTestId('product-addons-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId('close-modal-button');
    await user.click(closeButton);

    // Modal should disappear
    expect(
      screen.queryByTestId('product-addons-modal')
    ).not.toBeInTheDocument();
  });

  test('renders vegetarian badge when item is vegetarian', () => {
    const vegetarianItem = {
      ...mockMenuItem,
      isVegetarian: true,
    };

    render(<MenuItemClient item={vegetarianItem} />);

    // Check for vegetarian badge
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });

  test('links to product detail page', () => {
    render(<MenuItemClient item={mockMenuItem} />);

    // Check for detail links
    const detailLinks = screen.getAllByRole('link');

    // First link should be the name link
    expect(detailLinks[0]).toHaveAttribute('href', '/menu/Test Category/item1');

    // Details button link should exist
    const detailsButton = screen.getByText('Details');
    expect(detailsButton.closest('a')).toHaveAttribute(
      'href',
      '/menu/Test Category/item1'
    );
  });
});
