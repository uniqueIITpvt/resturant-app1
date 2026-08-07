import { screen } from '@testing-library/react';
import { render } from '@/__tests__/utils/test-utils';
import ContactInfo from '@/components/home/ContactInfo';
import '@testing-library/jest-dom';

describe('ContactInfo Component', () => {
  test('renders section header correctly', () => {
    render(<ContactInfo />);

    // Check for the section title
    expect(screen.getByText('Visit Our Restaurant')).toBeInTheDocument();

    // Check for subtitle
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();

    // Check for description
    expect(
      screen.getByText(/We'd love to welcome you to our restaurant/i)
    ).toBeInTheDocument();
  });

  test('displays location information', () => {
    render(<ContactInfo />);

    // Check for location card heading
    expect(screen.getByText('Our Location')).toBeInTheDocument();

    // Check for address details
    expect(screen.getByText('123 Gourmet Avenue')).toBeInTheDocument();
    expect(screen.getByText('Culinary District')).toBeInTheDocument();
    expect(screen.getByText('Foodie City, FC 12345')).toBeInTheDocument();

    // Check for directions link
    const directionsLink = screen.getByText('Get Directions');
    expect(directionsLink).toBeInTheDocument();
    expect(directionsLink.closest('a')).toHaveAttribute(
      'href',
      'https://maps.google.com'
    );
    expect(directionsLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  test('displays hours information', () => {
    render(<ContactInfo />);

    // Check for hours card heading
    expect(screen.getByText('Opening Hours')).toBeInTheDocument();

    // Check for opening hours details
    expect(screen.getByText('Monday - Friday')).toBeInTheDocument();
    expect(screen.getByText('8:00 AM - 10:00 PM')).toBeInTheDocument();

    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 11:00 PM')).toBeInTheDocument();

    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM - 9:00 PM')).toBeInTheDocument();

    // Check for reservation link
    const reservationLink = screen.getByText('Make a Reservation');
    expect(reservationLink).toBeInTheDocument();
    expect(reservationLink.closest('a')).toHaveAttribute(
      'href',
      '/reservation'
    );
  });

  test('displays contact information', () => {
    render(<ContactInfo />);

    // Check for contact card heading
    expect(screen.getByText('Contact Us')).toBeInTheDocument();

    // Check for phone number
    const phoneLink = screen.getByText('(123) 456-7890');
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:+1234567890');

    // Check for email
    const emailLink = screen.getByText('info@restaurant.com');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute(
      'href',
      'mailto:info@restaurant.com'
    );

    // Check for website
    const websiteLink = screen.getByText('www.restaurant.com');
    expect(websiteLink).toBeInTheDocument();
    expect(websiteLink.closest('a')).toHaveAttribute(
      'href',
      'https://www.restaurant.com'
    );
  });

  test('displays social media links', () => {
    render(<ContactInfo />);

    // Check for social media icons
    const facebookLink = screen.getByLabelText('Facebook');
    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute('href', '#');

    const instagramLink = screen.getByLabelText('Instagram');
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', '#');

    const twitterLink = screen.getByLabelText('Twitter');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', '#');
  });

  test('displays Google Maps iframe', () => {
    render(<ContactInfo />);

    // Check for map iframe
    const mapFrame = screen.getByTitle('Shaahi Biryani Location Map');
    expect(mapFrame).toBeInTheDocument();
    expect(mapFrame.tagName).toBe('IFRAME');
    expect(mapFrame).toHaveAttribute(
      'src',
      expect.stringContaining('google.com/maps')
    );
  });
});
