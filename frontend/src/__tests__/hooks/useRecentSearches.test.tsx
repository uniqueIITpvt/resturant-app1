import { renderHook, act } from '@testing-library/react';
import { useRecentSearches } from '@/hooks/useRecentSearches';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useRecentSearches Hook', () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('initializes with empty array when no saved searches exist', () => {
    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recentSearches).toEqual([]);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('recent-searches');
  });

  test('loads recent searches from localStorage on init', () => {
    // Set up localStorage with some searches
    const savedSearches = ['react', 'javascript', 'typescript'];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedSearches));

    const { result } = renderHook(() => useRecentSearches());

    // Should load the saved searches
    expect(result.current.recentSearches).toEqual(savedSearches);
  });

  test('handles localStorage parsing error gracefully', () => {
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Set up invalid JSON in localStorage
    localStorageMock.getItem.mockReturnValueOnce('invalid-json');

    const { result } = renderHook(() => useRecentSearches());

    // Should initialize with empty array on error
    expect(result.current.recentSearches).toEqual([]);

    // Should log error and remove corrupt data
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('recent-searches');

    consoleErrorSpy.mockRestore();
  });

  test('adds new search term to the beginning of the list', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('react');
    });

    expect(result.current.recentSearches).toEqual(['react']);

    // Add another search
    act(() => {
      result.current.addRecentSearch('javascript');
    });

    // New search should be at the beginning
    expect(result.current.recentSearches).toEqual(['javascript', 'react']);

    // Should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'recent-searches',
      JSON.stringify(['javascript', 'react'])
    );
  });

  test('moves existing search term to the beginning when added again', () => {
    // Start with some searches
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify(['javascript', 'react', 'typescript'])
    );

    const { result } = renderHook(() => useRecentSearches());

    // Add an existing search
    act(() => {
      result.current.addRecentSearch('typescript');
    });

    // typescript should move to the beginning
    expect(result.current.recentSearches).toEqual([
      'typescript',
      'javascript',
      'react',
    ]);
  });

  test('ignores empty search terms', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('');
    });

    // Should not add empty term
    expect(result.current.recentSearches).toEqual([]);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    // Try with only whitespace
    act(() => {
      result.current.addRecentSearch('   ');
    });

    // Should not add whitespace term
    expect(result.current.recentSearches).toEqual([]);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  test('limits the number of recent searches to MAX_RECENT_SEARCHES (5)', () => {
    const { result } = renderHook(() => useRecentSearches());

    // Add more than MAX_RECENT_SEARCHES items
    act(() => {
      result.current.addRecentSearch('search1');
      result.current.addRecentSearch('search2');
      result.current.addRecentSearch('search3');
      result.current.addRecentSearch('search4');
      result.current.addRecentSearch('search5');
      result.current.addRecentSearch('search6'); // This should push out search1
    });

    // Should only keep the 5 most recent searches
    expect(result.current.recentSearches).toEqual([
      'search6',
      'search5',
      'search4',
      'search3',
      'search2',
    ]);
    expect(result.current.recentSearches.length).toBe(5);
  });

  test('clearRecentSearches removes all searches', () => {
    // Start with some searches
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify(['javascript', 'react', 'typescript'])
    );

    const { result } = renderHook(() => useRecentSearches());

    // Clear searches
    act(() => {
      result.current.clearRecentSearches();
    });

    // Should be empty and localStorage should be cleared
    expect(result.current.recentSearches).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('recent-searches');
  });
});
