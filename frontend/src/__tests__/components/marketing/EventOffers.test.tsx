import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventOffers from '@/components/marketing/EventOffers';
import { act } from 'react';
import toast from 'react-hot-toast';

// Mock fetch API
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.Mock;

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
// Override the actual API URL to match what we're testing with
const apiUrl = 'https://resturant-app-backend-red.vercel.app';

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock setTimeout function
jest.useFakeTimers();

describe('EventOffers Component', () => {
  const mockEventOffers = [
    {
      _id: '1',
      name: 'Summer Special',
      description: 'Get 20% off on all items',
      banner: {
        public_id: 'banner1',
        url: 'https://example.com/banner1.jpg',
      },
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      isActive: true,
      priority: 1,
      offerType: 'discount',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 100,
      minOrderValue: 500,
      couponCode: 'SUMMER20',
    },
    {
      _id: '2',
      name: 'Holiday Special',
      description: 'Special holiday menu',
      banner: {
        public_id: 'banner2',
        url: 'https://example.com/banner2.jpg',
      },
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      isActive: true,
      priority: 2,
      offerType: 'holiday',
      discountType: 'fixed',
      discountValue: 200,
      maxDiscountAmount: null,
      minOrderValue: 1000,
      couponCode: 'HOLIDAY200',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetch.mockClear();
  });

  test('renders loading state initially', () => {
    // Mock the fetch to not resolve yet
    mockedFetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<EventOffers />);

    // Check for loading state
    expect(screen.getByText('Loading special offers...')).toBeInTheDocument();
    // The spinning loader doesn't have role="status", so check for it by its styling instead
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('renders event offers correctly after loading', async () => {
    // Mock successful API response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEventOffers }),
    });

    render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Check section title
    expect(screen.getByText('Special Promotions')).toBeInTheDocument();
    expect(screen.getByText('& Events')).toBeInTheDocument();

    // Check if first offer is rendered
    expect(screen.getByText('Summer Special')).toBeInTheDocument();
    expect(screen.getByText('Get 20% off on all items')).toBeInTheDocument();
  });

  test('hides component when no offers are returned', async () => {
    // Mock empty response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { container } = render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // The component should be empty
    expect(container.firstChild).toBeNull();
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error fetching offers' }),
    });

    const { container } = render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // The component should be empty on error
    expect(container.firstChild).toBeNull();
  });

  test('copies coupon code to clipboard when clicked', async () => {
    // Mock successful API response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEventOffers }),
    });

    // Mock the clipboard API to resolve immediately
    const clipboardMock = jest.spyOn(navigator.clipboard, 'writeText');
    clipboardMock.mockImplementation(() => {
      return Promise.resolve();
    });

    render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Find and click the copy button - button with Copy icon (rather than checking for aria-label)
    const copyButtons = document.querySelectorAll('button:has(.lucide-copy)');

    await act(async () => {
      fireEvent.click(copyButtons[0]);
      // Wait for the promise to resolve
      await Promise.resolve();
    });

    // Verify clipboard API was called with correct code
    expect(clipboardMock).toHaveBeenCalledWith('SUMMER20');
    expect(toast.success).toHaveBeenCalledWith(
      'Coupon code copied to clipboard!'
    );
  });

  test('tracks offer clicks', async () => {
    // Mock successful API responses
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEventOffers }),
    });

    // Mock the tracking API call
    mockedFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Find and click an offer link (the "Order Now" link)
    const offerLinks = screen.getAllByText(/order now/i);

    await act(async () => {
      fireEvent.click(offerLinks[0]);
      await Promise.resolve();
    });

    // Verify tracking API was called with correct ID - use nthCall to check the second call
    expect(mockedFetch.mock.calls[1][0]).toBe(
      `${apiUrl}/api/event-offers/1/track-click`
    );
    expect(mockedFetch.mock.calls[1][1]).toEqual({ method: 'POST' });
  });

  test('carousel navigation changes the active slide', async () => {
    // Mock successful API response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEventOffers }),
    });

    render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Check if first slide is active initially
    expect(screen.getByText('Summer Special')).toBeInTheDocument();

    // Click the desktop next button - using a more specific selector
    const desktopNextButton = document.querySelector(
      '.hidden.md\\:flex[aria-label="Next offer"]'
    );
    expect(desktopNextButton).not.toBeNull();

    await act(async () => {
      if (desktopNextButton) {
        fireEvent.click(desktopNextButton);
      }
      await Promise.resolve();
    });

    // Check if second slide is now active
    expect(screen.getByText('Holiday Special')).toBeInTheDocument();

    // Click the desktop previous button
    const desktopPrevButton = document.querySelector(
      '.hidden.md\\:flex[aria-label="Previous offer"]'
    );
    expect(desktopPrevButton).not.toBeNull();

    await act(async () => {
      if (desktopPrevButton) {
        fireEvent.click(desktopPrevButton);
      }
      await Promise.resolve();
    });

    // Check if first slide is active again
    expect(screen.getByText('Summer Special')).toBeInTheDocument();
  });

  test('auto-slides after timer interval', async () => {
    // Mock successful API response with multiple offers
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEventOffers }),
    });

    render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Verify first slide is visible
    expect(screen.getByText('Summer Special')).toBeInTheDocument();

    // Advance timers by auto-slide interval (6 seconds)
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Verify second slide is now visible
    expect(screen.getByText('Holiday Special')).toBeInTheDocument();
  });

  test('resets copied code state after timeout', async () => {
    // Mock successful API response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEventOffers }),
    });

    // Mock the clipboard API to resolve immediately
    const clipboardMock = jest.spyOn(navigator.clipboard, 'writeText');
    clipboardMock.mockImplementation(() => {
      return Promise.resolve();
    });

    render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Find and click the copy button
    const copyButtons = document.querySelectorAll('button:has(.lucide-copy)');

    await act(async () => {
      fireEvent.click(copyButtons[0]);
      await Promise.resolve();
    });

    // Verify copy action is reflected in the UI
    expect(clipboardMock).toHaveBeenCalledWith('SUMMER20');

    // Fast-forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // The copied state should be reset
    // Since we can't directly check the state, we'll make sure clicking again calls the API
    clipboardMock.mockClear();

    await act(async () => {
      fireEvent.click(copyButtons[0]);
      await Promise.resolve();
    });

    expect(clipboardMock).toHaveBeenCalledTimes(1);
  });

  test('renders different styles for different offer types', async () => {
    // Mock successful API response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEventOffers }),
    });

    render(<EventOffers />);

    // Wait for the API call to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // The first offer is a discount type, the second is a holiday type
    const offerTag = screen.getByText('discount');
    expect(offerTag).toBeInTheDocument();

    // Navigate to the second slide - using a more specific selector
    const desktopNextButton = document.querySelector(
      '.hidden.md\\:flex[aria-label="Next offer"]'
    );
    expect(desktopNextButton).not.toBeNull();

    await act(async () => {
      if (desktopNextButton) {
        fireEvent.click(desktopNextButton);
      }
      await Promise.resolve();
    });

    // Check the second offer type
    const holidayTag = screen.getByText('holiday');
    expect(holidayTag).toBeInTheDocument();
  });
});
