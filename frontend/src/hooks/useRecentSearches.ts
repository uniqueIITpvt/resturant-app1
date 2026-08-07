'use client';

import { useState, useEffect } from 'react';

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'recent-searches';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const storedSearches = localStorage.getItem(STORAGE_KEY);
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Add a new search term to recent searches
  const addRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setRecentSearches((prev) => {
      // Create a new array without the current search term (if it exists)
      const filteredSearches = prev.filter((term) => term !== searchTerm);

      // Add the new term at the beginning and limit to MAX_RECENT_SEARCHES
      const updatedSearches = [searchTerm, ...filteredSearches].slice(
        0,
        MAX_RECENT_SEARCHES
      );

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSearches));

      return updatedSearches;
    });
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  };

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
