import { screen, render, waitFor } from '@testing-library/react';
import Hero from '@/components/home/Hero';
import '@testing-library/jest-dom';

// Mock window.Image
class MockImage {
  onload: (() => void) | null = null;
  src: string = '';
  fetchPriority: string = '';

  constructor() {
    // Simulate image load after a short delay
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 100);
  }
}

// Mock the MutationObserver with correct interface implementation
class MockMutationObserver implements MutationObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);

  // Using underscore prefix to indicate deliberate unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: MutationCallback) {
    // No implementation needed for the test
  }
}

global.MutationObserver =
  MockMutationObserver as unknown as typeof MutationObserver;

describe('Hero Component', () => {
  beforeEach(() => {
    // Mock window.Image before each test
    Object.defineProperty(window, 'Image', {
      value: MockImage,
      writable: true,
    });

    // Mock getBoundingClientRect to simulate element dimensions
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 1200,
      height: 800,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1200,
      bottom: 800,
      toJSON: () => {},
    }));

    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<Hero />);

    // Check loading spinner is present using a more specific selector
    const loadingSpinner = screen.getByTestId('loading-animation');
    expect(loadingSpinner.className).toContain('animate-spin');
  });

  test('renders placeholder image after loading', async () => {
    render(<Hero />);

    // Wait for image to "load"
    await waitFor(() => {
      const imageContainer = screen.getByAltText('Food background');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  test('renders video iframe', async () => {
    render(<Hero />);

    // Wait for image to "load"
    await waitFor(() => {
      const iframe = screen.getByTitle('Background video');
      expect(iframe).toBeInTheDocument();

      // Check iframe src contains correct parameters
      expect(iframe.getAttribute('src')).toContain('autoplay=1');
      expect(iframe.getAttribute('src')).toContain('loop=1');
      expect(iframe.getAttribute('src')).toContain('muted=1');
    });
  });

  test('renders phone numbers correctly', () => {
    render(<Hero />);

    // Check Ghana phone number
    const ghanaPhone = screen.getByLabelText('Call Ghana phone number');
    expect(ghanaPhone).toBeInTheDocument();
    expect(ghanaPhone).toHaveAttribute('href', 'tel:630-614-4546');

    // Check Texas phone number
    const texasPhone = screen.getByLabelText('Call Texas phone number');
    expect(texasPhone).toBeInTheDocument();
    expect(texasPhone).toHaveAttribute('href', 'tel:469-960-3300');
  });

  test('renders social media links correctly', () => {
    render(<Hero />);

    // Check all social media links
    const facebookLink = screen.getByLabelText('Visit our Facebook page');
    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute(
      'href',
      'https://www.facebook.com/ShaahiBiryani/#'
    );

    const instagramLink = screen.getByLabelText('Visit our Instagram page');
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute(
      'href',
      'https://www.instagram.com/shaahibiryani/'
    );

    const pinterestLink = screen.getByLabelText('Visit our Twitter page');
    expect(pinterestLink).toBeInTheDocument();
    expect(pinterestLink).toHaveAttribute(
      'href',
      'https://www.pinterest.com/mmahkri/shaahi-biryani/'
    );

    const tiktokLink = screen.getByLabelText('Visit our TikTok page');
    expect(tiktokLink).toBeInTheDocument();
    expect(tiktokLink).toHaveAttribute('href', 'https://tiktok.com');

    const youtubeLink = screen.getByLabelText('Visit our YouTube channel');
    expect(youtubeLink).toBeInTheDocument();
    expect(youtubeLink).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=zIqi-R0_aHA'
    );
  });

  test('renders main call-to-action button', () => {
    render(<Hero />);

    // Check order now button
    const orderButton = screen.getByText('ORDER NOW');
    expect(orderButton).toBeInTheDocument();
    expect(orderButton).toHaveAttribute('href', '/menu');
  });

  test('renders scroll down indicator', () => {
    render(<Hero />);

    // Check scroll down text is present
    expect(screen.getByText('Scroll Down')).toBeInTheDocument();
  });

  test('handles visibility changes', () => {
    // Create a spy on the document event listener
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(<Hero />);

    // Check that visibility change listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    // Unmount to check cleanup
    unmount();

    // Check that event listener was removed during cleanup
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });
});
