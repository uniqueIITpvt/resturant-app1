import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock the components used in the layout
jest.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='auth-provider'>{children}</div>
  ),
}));

jest.mock('@/context/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='cart-provider'>{children}</div>
  ),
}));

jest.mock('@/providers/ConfirmationProvider', () => ({
  ConfirmationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='confirmation-provider'>{children}</div>
  ),
}));

jest.mock('@/components/layout/ClientNavbarWrapper', () => {
  const ClientNavbarWrapperMock = () => (
    <nav data-testid='navbar'>Navbar Mock</nav>
  );
  ClientNavbarWrapperMock.displayName = 'ClientNavbarWrapper';
  return ClientNavbarWrapperMock;
});

jest.mock('@/components/layout/FooterWrapper', () => {
  const FooterWrapperMock = () => (
    <footer data-testid='footer'>Footer Mock</footer>
  );
  FooterWrapperMock.displayName = 'FooterWrapper';
  return FooterWrapperMock;
});

jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid='toaster'>Toaster Mock</div>,
}));

// Mock next/font to avoid issues with actual font loading
jest.mock('next/font/google', () => ({
  Inter: jest.fn().mockReturnValue({
    className: 'mock-inter-class',
  }),
}));

describe('RootLayout', () => {
  test('renders layout with children', () => {
    render(
      <RootLayout>
        <div data-testid='test-content'>Test Content</div>
      </RootLayout>
    );

    // Check that the providers are rendered
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('cart-provider')).toBeInTheDocument();
    expect(screen.getByTestId('confirmation-provider')).toBeInTheDocument();

    // Check that the layout components are rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();

    // Check that the children are rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('has correct HTML structure', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // Check for HTML and body tags
    expect(document.querySelector('html')).toHaveAttribute('lang', 'en');
    expect(document.querySelector('html')).toHaveClass('scroll-smooth');

    // Check that body has the correct class
    const body = document.querySelector('body');
    expect(body).toHaveClass('mock-inter-class');
    expect(body).toHaveClass('min-h-screen');
    expect(body).toHaveClass('relative');
    expect(body).toHaveClass('flex');
    expect(body).toHaveClass('flex-col');
  });
});
