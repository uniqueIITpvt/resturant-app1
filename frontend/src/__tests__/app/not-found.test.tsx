import { render, screen, waitFor } from '@testing-library/react';
import NotFound from '@/app/not-found';
import React, { useEffect, useState } from 'react';

// Mock the Lottie component
jest.mock('lottie-react', () => {
  const MockLottie = ({ animationData, loop, className, onError }: any) => (
    <div data-testid='mock-lottie' className={className}>
      Lottie Animation Mock
    </div>
  );

  MockLottie.displayName = 'Lottie';
  return MockLottie;
});

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return jest.fn((_importFunc, options) => {
    // Return the loading component without trying to use useState or useEffect
    if (options?.loading) {
      const LoadingComponent = options.loading;
      return () => <LoadingComponent />;
    }

    // Simple mock component that doesn't rely on state
    const MockedComponent = (props: any) => (
      <div data-testid='mock-dynamic-component' {...props}>
        Dynamic Component Mock
      </div>
    );

    MockedComponent.displayName = 'DynamicComponent';
    return MockedComponent;
  });
});

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, className }: any) => (
    <a
      href={href}
      className={className}
      data-testid={`mock-link-${href.replace(/\//g, '')}`}
    >
      {children}
    </a>
  );

  MockLink.displayName = 'Link';
  return MockLink;
});

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid='mock-arrow-left-icon'>Arrow Icon</div>,
  Home: () => <div data-testid='mock-home-icon'>Home Icon</div>,
  Coffee: () => <div data-testid='mock-coffee-icon'>Coffee Icon</div>,
  Utensils: () => <div data-testid='mock-utensils-icon'>Utensils Icon</div>,
}));

describe('NotFound Page', () => {
  test('renders the 404 page with correct elements', async () => {
    render(<NotFound />);

    // Check for page title
    expect(screen.getByText('Oops! Page Not Found')).toBeInTheDocument();

    // Check for message
    expect(
      screen.getByText(
        /The page you're looking for seems to have gone on a lunch break/i
      )
    ).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByTestId('mock-link-')).toBeInTheDocument(); // Home link
    expect(screen.getByText('Go Home')).toBeInTheDocument();

    expect(screen.getByTestId('mock-link-menu')).toBeInTheDocument(); // Menu link
    expect(screen.getByText('Explore Our Menu')).toBeInTheDocument();
  });
});
