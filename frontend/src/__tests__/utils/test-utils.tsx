import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Add any providers that are needed for tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything from testing-library
export * from '@testing-library/react';

// override render method
export { customRender as render };
