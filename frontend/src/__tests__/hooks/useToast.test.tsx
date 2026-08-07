import { renderHook, act } from '@testing-library/react';
import useToast from '@/hooks/useToast';

// Store the original Math.random
const originalRandom = Math.random;

// Create a counter for predictable IDs
let mockCounter = 0;

// Set up the mock implementation
const mockRandomValues = [0.123456, 0.222222, 0.333333, 0.444444, 0.555555];

// Mock Math.random to return predictable values
beforeEach(() => {
  mockCounter = 0;
  Math.random = jest.fn(
    () => mockRandomValues[mockCounter++ % mockRandomValues.length]
  );
});

// Restore the original Math.random after tests
afterEach(() => {
  Math.random = originalRandom;
});

describe('useToast Hook', () => {
  // Mock the ID generation in useToast
  let mockStringSubstring: jest.SpyInstance;

  beforeEach(() => {
    // Mock String.prototype.substring to return predictable IDs
    mockStringSubstring = jest.spyOn(String.prototype, 'substring');
    // First call is typically for Math.random().toString(36)
    mockStringSubstring.mockImplementation(function (
      this: string,
      start: number,
      end: number
    ): string {
      // Return predictable IDs for the specific pattern used in useToast
      if (this.toString().includes('0.') && start === 2 && end === 9) {
        // This is the ID generation pattern in useToast
        return '123456';
      }
      // For other substring calls, use the original implementation
      return this.slice(start, end);
    });
  });

  afterEach(() => {
    mockStringSubstring.mockRestore();
  });

  test('initializes with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  test('addToast adds a toast with the correct type and message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Test message', 'success');
    });

    expect(result.current.toasts).toEqual([
      {
        id: '123456',
        message: 'Test message',
        type: 'success',
      },
    ]);
  });

  test('removeToast removes a toast by ID', () => {
    const { result } = renderHook(() => useToast());

    // Change mock implementation for second toast ID
    mockStringSubstring.mockImplementationOnce(function (
      this: string,
      start: number,
      end: number
    ): string {
      if (this.toString().includes('0.') && start === 2 && end === 9) {
        return '123456';
      }
      return this.slice(start, end);
    });

    // Second mock implementation
    mockStringSubstring.mockImplementationOnce(function (
      this: string,
      start: number,
      end: number
    ): string {
      if (this.toString().includes('0.') && start === 2 && end === 9) {
        return '222222';
      }
      return this.slice(start, end);
    });

    // Add two toasts
    act(() => {
      result.current.addToast('First toast', 'success');
    });

    act(() => {
      result.current.addToast('Second toast', 'error');
    });

    // Verify both toasts are there
    expect(result.current.toasts.length).toBe(2);

    // Remove the first toast
    act(() => {
      result.current.removeToast('123456');
    });

    // Check only the second toast remains
    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].message).toBe('Second toast');

    // Remove a non-existent toast (should not error)
    act(() => {
      result.current.removeToast('non-existent-id');
    });

    // Still have the second toast
    expect(result.current.toasts.length).toBe(1);
  });

  test('showSuccess adds a success toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showSuccess('Success message');
    });

    expect(result.current.toasts).toEqual([
      {
        id: '123456',
        message: 'Success message',
        type: 'success',
      },
    ]);
  });

  test('showError adds an error toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showError('Error message');
    });

    expect(result.current.toasts).toEqual([
      {
        id: '123456',
        message: 'Error message',
        type: 'error',
      },
    ]);
  });

  test('showInfo adds an info toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showInfo('Info message');
    });

    expect(result.current.toasts).toEqual([
      {
        id: '123456',
        message: 'Info message',
        type: 'info',
      },
    ]);
  });

  test('toast functions return the toast ID', () => {
    const { result } = renderHook(() => useToast());

    let id;
    act(() => {
      id = result.current.addToast('Test message', 'success');
    });

    expect(id).toBe('123456');

    // Test convenience methods too
    // Set up mock to return a different ID for the second call
    mockStringSubstring.mockImplementationOnce(function (
      this: string,
      start: number,
      end: number
    ): string {
      if (this.toString().includes('0.') && start === 2 && end === 9) {
        return '222222';
      }
      return this.slice(start, end);
    });

    let successId;
    act(() => {
      successId = result.current.showSuccess('Success message');
    });

    expect(successId).toBe('222222');
  });

  test('multiple toasts can be added', () => {
    const { result } = renderHook(() => useToast());

    // Set up mock for the first toast
    mockStringSubstring.mockImplementationOnce(function (
      this: string,
      start: number,
      end: number
    ): string {
      if (this.toString().includes('0.') && start === 2 && end === 9) {
        return '123456';
      }
      return this.slice(start, end);
    });

    // Set up mock for the second toast
    mockStringSubstring.mockImplementationOnce(function (
      this: string,
      start: number,
      end: number
    ): string {
      if (this.toString().includes('0.') && start === 2 && end === 9) {
        return '222222';
      }
      return this.slice(start, end);
    });

    // Set up mock for the third toast
    mockStringSubstring.mockImplementationOnce(function (
      this: string,
      start: number,
      end: number
    ): string {
      if (this.toString().includes('0.') && start === 2 && end === 9) {
        return '333333';
      }
      return this.slice(start, end);
    });

    // Add first toast
    act(() => {
      result.current.showSuccess('First message');
    });

    // Add second toast
    act(() => {
      result.current.showError('Second message');
    });

    // Add third toast
    act(() => {
      result.current.showInfo('Third message');
    });

    // Check all toasts are in the array
    expect(result.current.toasts).toEqual([
      {
        id: '123456',
        message: 'First message',
        type: 'success',
      },
      {
        id: '222222',
        message: 'Second message',
        type: 'error',
      },
      {
        id: '333333',
        message: 'Third message',
        type: 'info',
      },
    ]);
  });
});
