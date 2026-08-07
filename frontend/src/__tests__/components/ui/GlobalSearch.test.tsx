import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalSearch from '@/components/ui/GlobalSearch';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock axios
jest.mock('axios');

// Mock the useRecentSearches hook
jest.mock('@/hooks/useRecentSearches', () => ({
  useRecentSearches: jest.fn(),
}));

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
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid='mock-image' />;
  },
}));

describe('GlobalSearch Component', () => {
  // Setup common mocks
  const mockRouter = {
    push: jest.fn(),
  };

  const mockRecentSearches = {
    recentSearches: ['burger', 'pizza'],
    addRecentSearch: jest.fn(),
    clearRecentSearches: jest.fn(),
  };

  const mockProductsData = [
    {
      _id: 'product1',
      name: 'Cheeseburger',
      description: 'A juicy beef patty with cheese on a brioche bun',
      price: 9.99,
      category: 'Lunch',
      image: { url: '/images/cheeseburger.jpg' },
    },
    {
      _id: 'product2',
      name: 'Veggie Pizza',
      description: 'Fresh vegetables on a thin crust with tomato sauce',
      price: 12.99,
      category: 'Dinner',
      image: { url: '/images/veggie-pizza.jpg' },
    },
    {
      _id: 'product3',
      name: 'Coffee Latte',
      description: 'Espresso with steamed milk',
      price: 4.99,
      category: 'Drinks',
      image: { url: '/images/coffee-latte.jpg' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup recent searches mock
    (useRecentSearches as jest.Mock).mockReturnValue(mockRecentSearches);

    // Setup axios mock for product fetching
    (axios.get as jest.Mock).mockResolvedValue({ data: mockProductsData });

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock setTimeout and clearTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test('renders search input and focuses it when opened', async () => {
    await act(async () => {
      render(<GlobalSearch isOpen={true} />);
    });

    const searchInput = screen.getByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveFocus();
  });

  test('does not render when isOpen is false', async () => {
    await act(async () => {
      render(<GlobalSearch isOpen={false} />);
    });

    const searchInput = screen.queryByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    expect(searchInput).not.toBeInTheDocument();
  });

  test('displays recent searches when available', async () => {
    await act(async () => {
      render(<GlobalSearch />);
    });

    // Check for recent searches heading
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();

    // Check for recent search items
    expect(screen.getByText('burger')).toBeInTheDocument();
    expect(screen.getByText('pizza')).toBeInTheDocument();
  });

  test('clears recent searches when clear button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<GlobalSearch />);
    });

    const clearButton = screen.getByText('Clear all');
    await user.click(clearButton);

    expect(mockRecentSearches.clearRecentSearches).toHaveBeenCalledTimes(1);
  });

  test('displays category links when search is empty', async () => {
    await act(async () => {
      render(<GlobalSearch />);
    });

    expect(screen.getByText('Browse Categories')).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByText('Desserts')).toBeInTheDocument();
    expect(screen.getByText('Drinks')).toBeInTheDocument();
  });

  test('handles search input changes', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<GlobalSearch />);
    });

    const searchInput = screen.getByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    await user.type(searchInput, 'burger');

    expect(searchInput).toHaveValue('burger');
  });

  test('clears search input when X button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<GlobalSearch />);
    });

    const searchInput = screen.getByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    await user.type(searchInput, 'burger');

    // Clear button should appear
    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  test('performs search on input with debounce', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<GlobalSearch />);
    });

    const searchInput = screen.getByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    await user.type(searchInput, 'burger');

    // Fast-forward timers to trigger debounced search
    await act(async () => {
      jest.advanceTimersByTime(500); // More than the 300ms debounce
    });

    // Should show loading indicator and then results
    await waitFor(() => {
      // Check for the product in the results
      expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
    });
  });

  test('navigates to product page when search result is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<GlobalSearch />);
    });

    const searchInput = screen.getByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    await user.type(searchInput, 'burger');

    // Fast-forward timers to trigger debounced search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
    });

    // Click on the search result
    const resultItem = screen.getByText('Cheeseburger').closest('div');
    if (resultItem) {
      await user.click(resultItem);
    }

    // Check that router.push was called with the correct URL
    expect(mockRouter.push).toHaveBeenCalledWith('/menu/lunch/product1');
  });

  test('handles search errors gracefully', async () => {
    // Set up a specific error for axios
    const axiosError = {
      response: undefined,
      name: 'Error',
      message: 'Network error',
      isAxiosError: true,
    };

    // Setup axios to return an error for this test
    (axios.get as jest.Mock).mockRejectedValueOnce(axiosError);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<GlobalSearch />);
    });

    const searchInput = screen.getByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    await user.type(searchInput, 'error test');

    // Fast-forward timers to trigger debounced search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Wait for the "No results found" message (the component doesn't actually show the error)
    await waitFor(() => {
      expect(screen.getByText(/No results found for/i)).toBeInTheDocument();
    });
  });

  test('closes search when close button is clicked', async () => {
    const onCloseMock = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await act(async () => {
      render(<GlobalSearch isOpen={true} onClose={onCloseMock} />);
    });

    const closeButton = screen.getByLabelText('Close search');
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('closes search when ESC key is pressed', async () => {
    const onCloseMock = jest.fn();

    await act(async () => {
      render(<GlobalSearch isOpen={true} onClose={onCloseMock} />);
    });

    const searchInput = screen.getByPlaceholderText(
      'Search for food, categories, or ingredients...'
    );
    fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('respects dark mode prop', async () => {
    await act(async () => {
      render(<GlobalSearch isDarkMode={true} />);
    });

    const searchContainer = screen
      .getByPlaceholderText('Search for food, categories, or ingredients...')
      .closest('div.fixed');
    expect(searchContainer).toHaveClass('bg-black/60');
  });
});
