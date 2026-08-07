import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';
import '@testing-library/jest-dom';

// Mock Next.js Link component since it's used in Footer
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders the main headings', () => {
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getAllByText('Contact Us')[0]).toBeInTheDocument();
    expect(screen.getByText('Order Online')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
  });

  it('renders quick links correctly', () => {
    expect(screen.getByText('Our Menu')).toBeInTheDocument();
    expect(screen.getByText('Reservations')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    expect(screen.getByText('(123) 456-7890')).toBeInTheDocument();
    expect(screen.getByText('info@restaurant.com')).toBeInTheDocument();
    expect(screen.getByText(/Mon-Fri/i)).toBeInTheDocument();
  });

  it('renders the sub-footer with links and year', () => {
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Restaurant. All rights reserved.`)
    ).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getAllByText('Privacy Policy')[1]).toBeInTheDocument();
    expect(screen.getByText('Sitemap')).toBeInTheDocument();
  });
});
