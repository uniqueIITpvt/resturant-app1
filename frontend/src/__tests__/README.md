# Frontend Unit Testing

This directory contains unit tests for the frontend components and utilities using Jest and React Testing Library.

## Directory Structure

The test files are organized to mirror the source code structure:

```
src/
├── __tests__/            # Test root directory
│   ├── components/       # Tests for React components
│   │   ├── home/         # Tests for home components (e.g., Testimonials)
│   │   ├── ...           # Other component tests
│   ├── utils/            # Tests for utility functions
│   ├── hooks/            # Tests for custom hooks
```

## Running Tests

You can run tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Guidelines

1. **Component Tests**: Focus on testing behavior, not implementation details
2. **Accessibility**: Include accessibility checks in component tests
3. **Mock Dependencies**: Use Jest mocks for external dependencies (API calls, etc.)
4. **Coverage**: Aim for high coverage of critical paths and edge cases
5. **Isolation**: Each test should be independent and not rely on other tests

## Example Test

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## Test Utilities

Common testing utilities are located in the `__tests__/utils` directory, including:

- Custom render functions
- Mock providers
- Test data factories

## Continuous Integration

Tests are automatically run in the CI pipeline on every pull request.
