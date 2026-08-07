import { render, screen, waitFor } from '@testing-library/react';
import CategoryClient from '@/components/menu/CategoryClient';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Setup jest timers
jest.useFakeTimers();

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    return <img src={src} alt={alt} data-testid='mock-image' />;
  },
}));

// Mock MenuItemClient component
jest.mock('@/components/menu/MenuItemClient', () => ({
  MenuItemClient: ({
    item,
  }: {
    item: {
      _id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      image: { url: string };
      isVegetarian?: boolean;
    };
  }) => (
    <div data-testid='menu-item'>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <span>${item.price}</span>
      {item.isVegetarian && <span data-testid='veg-badge'>Vegetarian</span>}
    </div>
  ),
}));

// Mock fetch API
const mockFetch = (mockData: {
  categoryItems: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: { url: string };
    isPopular?: boolean;
    isVegetarian?: boolean;
  }>;
  allItems: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: { url: string };
  }>;
}) => {
  global.fetch = jest.fn().mockImplementation((url) => {
    if (url.includes('/api/products/category/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData.categoryItems),
      });
    } else if (url.includes('/api/products')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData.allItems),
      });
    }
    return Promise.reject(new Error('Not found'));
  });
};

describe('CategoryClient Component', () => {
  // Sample mock data
  const mockData = {
    categoryItems: [
      {
        _id: 'item1',
        name: 'Cheeseburger',
        description: 'A juicy beef patty with cheese on a brioche bun',
        price: 9.99,
        category: 'lunch',
        image: { url: '/images/cheeseburger.jpg' },
        isPopular: true,
        isVegetarian: false,
      },
      {
        _id: 'item2',
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables',
        price: 8.99,
        category: 'lunch',
        image: { url: '/images/veggie-burger.jpg' },
        isPopular: false,
        isVegetarian: true,
      },
      {
        _id: 'item3',
        name: 'Bacon Burger',
        description: 'Beef patty with crispy bacon slices',
        price: 10.99,
        category: 'lunch',
        image: { url: '/images/bacon-burger.jpg' },
        isPopular: true,
        isVegetarian: false,
      },
    ],
    allItems: [
      // Some items from other categories
      {
        _id: 'breakfast1',
        name: 'Pancakes',
        description: 'Fluffy pancakes with maple syrup',
        price: 7.99,
        category: 'breakfast',
        image: { url: '/images/pancakes.jpg' },
      },
      {
        _id: 'dessert1',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with frosting',
        price: 5.99,
        category: 'desserts',
        image: { url: '/images/chocolate-cake.jpg' },
      },
    ],
  };

  // Setup router mock
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockFetch(mockData);
  });

  test('renders loading state initially', async () => {
    // Mock an intentional delay in fetch response
    global.fetch = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }, 100);
      });
    });

    render(<CategoryClient category='lunch' />);

    // Check for loading indicator
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays category information and menu items', async () => {
    render(<CategoryClient category='lunch' />);

    // Wait for data to load and component to update
    await waitFor(() => {
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(
        screen.getByText('Perfect midday meals to fuel your afternoon')
      ).toBeInTheDocument();
      expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
      expect(screen.getByText('Veggie Burger')).toBeInTheDocument();
      expect(screen.getByText('Bacon Burger')).toBeInTheDocument();
    });
  });

  test('handles errors gracefully', async () => {
    // Mock a fetch error
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.reject(new Error('Failed to fetch category items'));
    });

    render(<CategoryClient category='lunch' />);

    // Wait for the error to display
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });

  // This is a simplified combined test for verification
  test('basic component verification', async () => {
    // Verify the component renders properly
    render(<CategoryClient category='lunch' />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Confirm key elements render
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Bacon Burger')).toBeInTheDocument();

    // Check if we have all menu items rendered
    const menuItems = screen.getAllByTestId('menu-item');
    expect(menuItems.length).toBe(3);
  });
});
