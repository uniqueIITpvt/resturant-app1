import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { useRouter } from 'next/navigation';

// Mock the components used in the Home page with display names
jest.mock('@/components/home/Hero', () => {
  const HeroMock = () => <div data-testid='hero-component'>Hero Mock</div>;
  HeroMock.displayName = 'Hero';
  return HeroMock;
});

jest.mock('@/components/marketing/EventOffers', () => {
  const EventOffersMock = () => (
    <div data-testid='event-offers-component'>EventOffers Mock</div>
  );
  EventOffersMock.displayName = 'EventOffers';
  return EventOffersMock;
});

jest.mock('@/components/home/MenuHighlights', () => {
  const MenuHighlightsMock = () => (
    <div data-testid='menu-highlights-component'>MenuHighlights Mock</div>
  );
  MenuHighlightsMock.displayName = 'MenuHighlights';
  return MenuHighlightsMock;
});

jest.mock('@/components/products/ProductsShowcase', () => {
  const ProductsShowcaseMock = () => (
    <div data-testid='products-showcase-component'>ProductsShowcase Mock</div>
  );
  ProductsShowcaseMock.displayName = 'ProductsShowcase';
  return ProductsShowcaseMock;
});

jest.mock('@/components/home/FeaturedProducts', () => {
  const FeaturedProductsMock = () => (
    <div data-testid='featured-products-component'>FeaturedProducts Mock</div>
  );
  FeaturedProductsMock.displayName = 'FeaturedProducts';
  return FeaturedProductsMock;
});

jest.mock('@/components/marketing/InstagramReels', () => {
  const InstagramReelsMock = () => (
    <div data-testid='instagram-reels-component'>InstagramReels Mock</div>
  );
  InstagramReelsMock.displayName = 'InstagramReels';
  return InstagramReelsMock;
});

jest.mock('@/components/home/Testimonials', () => {
  const TestimonialsMock = () => (
    <div data-testid='testimonials-component'>Testimonials Mock</div>
  );
  TestimonialsMock.displayName = 'Testimonials';
  return TestimonialsMock;
});

jest.mock('@/components/home/AboutCafe', () => {
  const AboutCafeMock = () => (
    <div data-testid='about-cafe-component'>AboutCafe Mock</div>
  );
  AboutCafeMock.displayName = 'AboutCafe';
  return AboutCafeMock;
});

jest.mock('@/components/home/ContactInfo', () => {
  const ContactInfoMock = () => (
    <div data-testid='contact-info-component'>ContactInfo Mock</div>
  );
  ContactInfoMock.displayName = 'ContactInfo';
  return ContactInfoMock;
});

jest.mock('@/components/marketing/NewsletterSignup', () => {
  const NewsletterSignupMock = () => (
    <div data-testid='newsletter-signup-component'>NewsletterSignup Mock</div>
  );
  NewsletterSignupMock.displayName = 'NewsletterSignup';
  return NewsletterSignupMock;
});

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Home Page', () => {
  beforeEach(() => {
    // Mock useRouter implementation
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  test('renders all home page components', () => {
    render(<Home />);

    // Check that all major section components are rendered
    expect(screen.getByTestId('hero-component')).toBeInTheDocument();
    expect(screen.getByTestId('event-offers-component')).toBeInTheDocument();
    expect(screen.getByTestId('menu-highlights-component')).toBeInTheDocument();
    expect(
      screen.getByTestId('products-showcase-component')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('featured-products-component')
    ).toBeInTheDocument();
    expect(screen.getByTestId('instagram-reels-component')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials-component')).toBeInTheDocument();
    expect(screen.getByTestId('about-cafe-component')).toBeInTheDocument();
    expect(screen.getByTestId('contact-info-component')).toBeInTheDocument();
    expect(
      screen.getByTestId('newsletter-signup-component')
    ).toBeInTheDocument();
  });

  test('renders main element', () => {
    render(<Home />);

    // Check for the main element
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });
});
