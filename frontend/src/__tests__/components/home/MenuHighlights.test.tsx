import { screen } from '@testing-library/react';
import { render } from '@/__tests__/utils/test-utils';
import MenuHighlights from '@/components/home/MenuHighlights';
import '@testing-library/jest-dom';

describe('MenuHighlights Component', () => {
  test('renders the component header correctly', () => {
    render(<MenuHighlights />);

    // Check heading is present
    expect(screen.getByText('Explore Our')).toBeInTheDocument();
    expect(screen.getByText('Menu Categories')).toBeInTheDocument();

    // Check subtitle label
    expect(screen.getByText('Culinary Delights')).toBeInTheDocument();
  });

  test('displays all menu categories', () => {
    render(<MenuHighlights />);

    // Check that all category headings are present
    expect(screen.getByText('Appetizers')).toBeInTheDocument();
    expect(screen.getByText('Chicken Dishes')).toBeInTheDocument();
    expect(screen.getByText('Beef Dishes')).toBeInTheDocument();
    expect(screen.getByText('Rice Dishes')).toBeInTheDocument();
    expect(screen.getByText('Desserts')).toBeInTheDocument();
    expect(screen.getByText('Beverages')).toBeInTheDocument();
  });

  test('shows category descriptions', () => {
    render(<MenuHighlights />);

    // Check that category descriptions are present
    expect(
      screen.getByText('Start with something special')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Flavorful chicken specialties')
    ).toBeInTheDocument();
    expect(screen.getByText('Premium beef selections')).toBeInTheDocument();
    expect(screen.getByText('Aromatic rice specialties')).toBeInTheDocument();
    expect(screen.getByText('Sweet indulgences')).toBeInTheDocument();
    expect(screen.getByText('Refreshing drinks')).toBeInTheDocument();
  });

  test('highlights featured categories', () => {
    render(<MenuHighlights />);

    // Check for featured badges (Only Chicken Dishes and Rice Dishes are featured)
    const featuredBadges = screen.getAllByText('Featured');
    expect(featuredBadges).toHaveLength(2);
  });

  test('shows category tags', () => {
    render(<MenuHighlights />);

    // Check for all category tags
    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText("Chef's Choice")).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Signature')).toBeInTheDocument();
    expect(screen.getByText('Sweet Treats')).toBeInTheDocument();
    expect(screen.getByText('Refreshing')).toBeInTheDocument();
  });

  test('provides correct links for each category', () => {
    render(<MenuHighlights />);

    // Check all "View Items" links go to the correct URL
    const viewItemsLinks = screen.getAllByText('View Items');
    expect(viewItemsLinks).toHaveLength(6);

    // Check for specific category links
    const linkElements = screen.getAllByRole('link');

    // Check if certain links exist in the expected format
    const appetizerLink = linkElements.find(
      (link) => link.getAttribute('href') === '/menu?category=appetizers'
    );
    expect(appetizerLink).toBeInTheDocument();

    const chickenLink = linkElements.find(
      (link) => link.getAttribute('href') === '/menu?category=chicken%20dishes'
    );
    expect(chickenLink).toBeInTheDocument();
  });

  test('has a View Full Menu button with correct link', () => {
    render(<MenuHighlights />);

    // Find the View Full Menu button
    const fullMenuButton = screen.getByText('View Full Menu');
    expect(fullMenuButton).toBeInTheDocument();

    // Check the URL is correct
    const buttonLink = fullMenuButton.closest('a');
    expect(buttonLink).toHaveAttribute('href', '/menu');
  });
});
