import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageWrapper from '@/components/layout/PageWrapper';

describe('PageWrapper Component', () => {
  test('renders children with default padding', () => {
    const { container } = render(
      <PageWrapper>
        <div data-testid='test-child'>Test Content</div>
      </PageWrapper>
    );

    // Check if children are rendered
    expect(
      container.querySelector('[data-testid="test-child"]')
    ).toBeInTheDocument();

    // Check if it has the default padding class
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('pt-16');
  });

  test('combines custom className with default padding', () => {
    const { container } = render(
      <PageWrapper className='bg-gray-100 my-4'>
        <div data-testid='test-child'>Test Content</div>
      </PageWrapper>
    );

    // Check if it has both the default and custom classes
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('pt-16');
    expect(wrapper).toHaveClass('bg-gray-100');
    expect(wrapper).toHaveClass('my-4');
  });

  test('preserves child element attributes', () => {
    const { container } = render(
      <PageWrapper>
        <div
          data-testid='test-child'
          className='text-red-500'
          aria-label='test element'
        >
          Test Content
        </div>
      </PageWrapper>
    );

    // Check if child attributes are preserved
    const child = container.querySelector(
      '[data-testid="test-child"]'
    ) as HTMLElement;
    expect(child).toHaveClass('text-red-500');
    expect(child).toHaveAttribute('aria-label', 'test element');
  });
});
