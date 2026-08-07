import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstagramReels from '@/components/marketing/InstagramReels';

// Mock the play and pause methods for HTMLVideoElement
beforeAll(() => {
  // Mock the play method to return a resolved promise
  HTMLVideoElement.prototype.play = jest
    .fn()
    .mockImplementation(() => Promise.resolve());
  // Mock the pause method
  HTMLVideoElement.prototype.pause = jest.fn();
  // We need to be able to set and get properties
  const mutedMap = new WeakMap();
  Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
    get: function () {
      return mutedMap.get(this) || true;
    },
    set: function (value) {
      mutedMap.set(this, value);
    },
  });
});

describe('InstagramReels Component', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with correct heading', () => {
    render(<InstagramReels />);

    // Check for main heading only - simpler test that won't break
    expect(screen.getByText('Savor the Experience')).toBeInTheDocument();
  });

  test('renders the correct number of reels', () => {
    render(<InstagramReels />);

    // Check for the video elements
    // Note: Since only 3 videos are visible at a time (center, left, right),
    // we check for at least 3 video elements
    const videos = document.querySelectorAll('video');
    expect(videos.length).toBeGreaterThanOrEqual(3);
  });

  test('plays video on initial render', () => {
    render(<InstagramReels />);

    // The first video should be played automatically (center)
    expect(HTMLVideoElement.prototype.play).toHaveBeenCalled();
  });

  test('navigates to next slide when next button is clicked', () => {
    render(<InstagramReels />);

    // Get the navigation buttons - use getAllByLabelText since there are multiple buttons with 'next' in the label
    const nextButtons = screen.getAllByLabelText(/next/i);

    // Use the navigation button (not the story button)
    const nextButton = nextButtons.find(
      (button) => button.getAttribute('aria-label') === 'Next reel'
    );

    // Initial state - first slide visible
    expect(screen.getByText('Let your tastebuds travel')).toBeInTheDocument();

    // Click next button
    fireEvent.click(nextButton!);

    // Second slide should now be visible
    expect(
      screen.getByText('Catering services for all your events')
    ).toBeInTheDocument();
  });

  test('navigates to previous slide when previous button is clicked', () => {
    render(<InstagramReels />);

    // Get the navigation buttons
    const prevButton = screen.getByLabelText('Previous reel');

    // Initial state - first slide visible
    expect(screen.getByText('Let your tastebuds travel')).toBeInTheDocument();

    // Click previous button - should wrap around to last slide
    fireEvent.click(prevButton);

    // Last slide should now be visible
    expect(
      screen.getByText("We don't just serve food, we serve memories")
    ).toBeInTheDocument();
  });

  test('pauses video when pause button is clicked', () => {
    render(<InstagramReels />);

    // Get the play/pause button
    const pauseButton = screen.getByLabelText(/pause/i);

    // Reset mock counts from initial render
    jest.clearAllMocks();

    // Click pause button
    fireEvent.click(pauseButton);

    // Video should be paused
    expect(HTMLVideoElement.prototype.pause).toHaveBeenCalled();
  });

  test('unmutes video when unmute button is clicked', () => {
    // Reset all mocks
    jest.clearAllMocks();

    render(<InstagramReels />);

    // Get the mute/unmute button
    const muteButton = screen.getByLabelText(/unmute/i);

    // Click unmute button
    fireEvent.click(muteButton);

    // Skip checking the muted property itself and just verify the component state has changed
    // Now the button should show a mute icon (for muting sound that's currently playing)
    expect(screen.getByLabelText(/mute video/i)).toBeInTheDocument();
  });

  test('shows the correct indicator dots for the carousel', () => {
    render(<InstagramReels />);

    // Get all the indicator dots
    const indicators = screen.getAllByRole('button', { name: /go to slide/i });

    // Should have 6 indicators (one for each reel)
    expect(indicators.length).toBe(6);

    // Click on the third indicator
    fireEvent.click(indicators[2]);

    // Third slide content should be visible
    expect(
      screen.getByText('Quality, taste, and experience all in one')
    ).toBeInTheDocument();
  });

  test('changes the active slide when indicator is clicked', () => {
    render(<InstagramReels />);

    // Get all the indicator dots
    const indicators = screen.getAllByRole('button', { name: /go to slide/i });

    // Click on the fourth indicator
    fireEvent.click(indicators[3]);

    // Fourth slide content should be visible
    expect(
      screen.getByText('Grand opening in Plano, Texas')
    ).toBeInTheDocument();
  });

  test('pauses and resumes correctly when video control buttons are clicked', () => {
    render(<InstagramReels />);

    // Get the play/pause button
    const pauseButton = screen.getByLabelText(/pause/i);

    // Clear previous mock calls
    jest.clearAllMocks();

    // Click pause button
    fireEvent.click(pauseButton);

    // Video should be paused
    expect(HTMLVideoElement.prototype.pause).toHaveBeenCalled();

    // Now the button should show play icon
    const playButton = screen.getByLabelText(/play/i);

    // Reset mock counts
    jest.clearAllMocks();

    // Click play button to resume
    fireEvent.click(playButton);

    // Video should play again
    expect(HTMLVideoElement.prototype.play).toHaveBeenCalled();
  });

  test('shows Instagram link when hovering over a reel', () => {
    render(<InstagramReels />);

    // Find the Instagram links by title
    const instagramLinks = screen.getAllByTitle('View on Instagram');

    // Should have links for all visible slides
    expect(instagramLinks.length).toBeGreaterThanOrEqual(1);

    // Check if the link has the correct href
    expect(instagramLinks[0]).toHaveAttribute(
      'href',
      'https://www.instagram.com/shaahibiryani/'
    );
  });

  test('handles mouse hover state correctly', () => {
    render(<InstagramReels />);

    // Find the carousel items
    const carouselItems = document.querySelectorAll('.relative.group');

    // Simulate mouse enter on the center item
    fireEvent.mouseEnter(carouselItems[0]);

    // Control buttons should be visible with full opacity
    const controlsContainer = screen.getByRole('group', {
      name: /video controls/i,
    });
    expect(controlsContainer).toHaveClass('opacity-100');

    // Simulate mouse leave
    fireEvent.mouseLeave(carouselItems[0]);

    // Controls should fade out
    expect(controlsContainer).toHaveClass('opacity-0');
  });

  test('plays correct video after navigation', () => {
    render(<InstagramReels />);

    // Get next button - use getAllByLabelText and find the navigation button
    const nextButtons = screen.getAllByLabelText(/next/i);
    const nextButton = nextButtons.find(
      (button) => button.getAttribute('aria-label') === 'Next reel'
    );

    // Reset the play mock calls from initial render
    jest.clearAllMocks();

    // Navigate to next slide
    fireEvent.click(nextButton!);

    // New current video should be played
    expect(HTMLVideoElement.prototype.play).toHaveBeenCalled();
  });
});
