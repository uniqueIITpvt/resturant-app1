import { screen } from '@testing-library/react';
import { render } from '@/__tests__/utils/test-utils';
import AboutCafe from '@/components/home/AboutCafe';
import '@testing-library/jest-dom';

describe('AboutCafe Component', () => {
  test('renders section header correctly', () => {
    render(<AboutCafe />);

    // Check for the section title
    expect(screen.getByText('About Shaahi Biryani')).toBeInTheDocument();

    // Check for subtitle
    expect(screen.getByText('Our Story')).toBeInTheDocument();
  });

  test('displays the main paragraph content', () => {
    render(<AboutCafe />);

    // Check for introductory paragraph content
    expect(
      screen.getByText(
        /Founded in 2017, Shaahi Biryani was born from a passion/
      )
    ).toBeInTheDocument();

    // Check for second paragraph
    expect(
      screen.getByText(
        /Our team of skilled chefs combines traditional techniques/
      )
    ).toBeInTheDocument();
  });

  test('displays the blockquote', () => {
    render(<AboutCafe />);

    // Check for the quoted text
    expect(
      screen.getByText(/We believe dining should engage all your senses/)
    ).toBeInTheDocument();
  });

  test('displays all cafe images', () => {
    render(<AboutCafe />);

    // Check for all 4 gallery images
    const cafeImages = screen.getAllByRole('img');

    // Look for specific images from the gallery
    const ambiance = cafeImages.find(
      (img) => img.getAttribute('alt') === 'Café ambiance'
    );
    expect(ambiance).toBeInTheDocument();
    expect(ambiance).toHaveAttribute('src', expect.stringContaining('cafe-1'));

    const chef = cafeImages.find(
      (img) => img.getAttribute('alt') === 'Our chef'
    );
    expect(chef).toBeInTheDocument();
    expect(chef).toHaveAttribute('src', expect.stringContaining('cafe-2'));

    const coffee = cafeImages.find(
      (img) => img.getAttribute('alt') === 'Coffee preparation'
    );
    expect(coffee).toBeInTheDocument();
    expect(coffee).toHaveAttribute('src', expect.stringContaining('cafe-3'));

    const dish = cafeImages.find(
      (img) => img.getAttribute('alt') === 'Signature dish'
    );
    expect(dish).toBeInTheDocument();
    expect(dish).toHaveAttribute('src', expect.stringContaining('cafe-4'));
  });

  test('displays feature boxes', () => {
    render(<AboutCafe />);

    // Check for feature headings
    expect(screen.getByText('Locally Sourced')).toBeInTheDocument();
    expect(screen.getByText('Handcrafted')).toBeInTheDocument();

    // Check for feature descriptions
    expect(
      screen.getByText(
        'We partner with local farmers for the freshest ingredients'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Every dish is made with care and attention to detail')
    ).toBeInTheDocument();
  });

  test('shows team section', () => {
    render(<AboutCafe />);

    // Check for team description text
    expect(
      screen.getByText('Meet our team of passionate culinary experts')
    ).toBeInTheDocument();

    // Check for chef images
    const chefImages = screen.getAllByAltText('Chef');
    expect(chefImages.length).toBe(3);
  });
});
