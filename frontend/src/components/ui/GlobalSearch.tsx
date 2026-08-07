'use client';

import {
  IconSearch,
  IconX,
  IconCoffee,
  IconToolsKitchen2,
  IconCake,
  IconSalad,
  IconGlass,
  IconClock,
  IconTrendingUp,
  IconSparkles,
} from '@tabler/icons-react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

// Define Product interface locally to avoid import errors
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  image?: {
    public_id?: string;
    url?: string;
  };
}

interface GlobalSearchProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create a cache to store search results - prevents repeated API calls
const searchCache = new Map<
  string,
  { timestamp: number; results: Product[] }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 20; // Maximum number of cached searches

// Cache cleanup function (to prevent memory leaks)
const cleanupCache = () => {
  const now = Date.now();
  const toDelete: string[] = [];

  // Find expired cache entries
  searchCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      toDelete.push(key);
    }
  });

  // Delete expired entries
  toDelete.forEach((key) => searchCache.delete(key));

  // If cache is still too large, remove oldest entries
  if (searchCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(searchCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const entriesToRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    entriesToRemove.forEach(([key]) => searchCache.delete(key));
  }
};

export default function GlobalSearch({
  isOpen = true,
  onClose,
  isDarkMode = false,
}: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentSearches();

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all products on component mount (only once)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`);
        if (Array.isArray(response.data)) {
          setProductsData(response.data);
        }
        setDataFetched(true);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    if (!dataFetched) {
      fetchAllProducts();
    }

    // Cleanup the cache periodically
    const cacheCleanupInterval = setInterval(cleanupCache, CACHE_TTL);

    return () => {
      clearInterval(cacheCleanupInterval);
      // Cancel any in-flight requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dataFetched]);

  // Debounce search to improve performance with a proper cleanup
  const debouncedSearch = useCallback(
    (() => {
      let timeout: NodeJS.Timeout | null = null;
      return (value: string) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (value.trim()) performSearch(value);
        }, 300);
      };
    })(),
    [productsData]
  );

  // Set up click outside detection
  useOnClickOutside(
    searchRef as React.RefObject<HTMLElement>,
    onClose || (() => {})
  );

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Effect for debounced search
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      debouncedSearch(searchTerm);
    } else if (searchTerm === '') {
      setResults([]);
    }

    // Cleanup function to cancel any pending search
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [searchTerm, debouncedSearch]);

  // The optimized search implementation
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Check if result is in cache
    const cacheKey = query.toLowerCase();
    const cachedResult = searchCache.get(cacheKey);

    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      setResults(cachedResult.results);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (productsData.length === 0 && !dataFetched) {
        const response = await axios.get(`${API_URL}/api/products`, {
          signal: abortControllerRef.current.signal,
        });

        if (Array.isArray(response.data)) {
          setProductsData(response.data);
        }
      }

      const allProducts = productsData.length > 0 ? productsData : [];

      if (Array.isArray(allProducts) && allProducts.length > 0) {
        const queryLower = query.toLowerCase();
        const searchTerms = queryLower
          .split(' ')
          .filter((term) => term.length > 1);

        const scoredResults = allProducts.map((product) => {
          let score = 0;
          const name = product.name?.toLowerCase() || '';
          const category = product.category?.toLowerCase() || '';

          if (name === queryLower) {
            score += 200;
          } else if (name.includes(queryLower)) {
            score += 100;
          } else if (category.includes(queryLower)) {
            score += 75;
          } else {
            for (const term of searchTerms) {
              if (name.includes(term)) {
                score += 50;
                break;
              }
            }

            for (const term of searchTerms) {
              if (category.includes(term)) {
                score += 30;
                break;
              }
            }

            if (score === 0) {
              const description = product.description?.toLowerCase() || '';
              for (const term of searchTerms) {
                if (description.includes(term)) {
                  score += 10;
                  break;
                }
              }
            }
          }

          return { product, score };
        });

        const relevantResults = scoredResults
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 12)
          .map((item) => item.product);

        searchCache.set(cacheKey, {
          timestamp: Date.now(),
          results: relevantResults,
        });

        setResults(relevantResults);

        if (relevantResults.length > 0) {
          addRecentSearch(query);
        }
      } else {
        setResults([]);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.name === 'CanceledError') {
        return;
      }

      console.error('Search error:', error);
      setError('Failed to fetch search results. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
      addRecentSearch(searchTerm);
    }
  };

  const getCategoryIcon = useCallback(
    (category: string) => {
      const categoryLower = category.toLowerCase().trim();

      if (categoryLower.includes('coffee') || categoryLower.includes('drink')) {
        return (
          <IconCoffee size={isMobile ? 14 : 16} className='text-amber-500' />
        );
      } else if (
        categoryLower.includes('lunch') ||
        categoryLower.includes('dinner')
      ) {
        return (
          <IconToolsKitchen2
            size={isMobile ? 14 : 16}
            className='text-amber-500'
          />
        );
      } else if (
        categoryLower.includes('dessert') ||
        categoryLower.includes('cake')
      ) {
        return (
          <IconCake size={isMobile ? 14 : 16} className='text-amber-500' />
        );
      } else if (
        categoryLower.includes('healthy') ||
        categoryLower.includes('salad')
      ) {
        return (
          <IconSalad size={isMobile ? 14 : 16} className='text-amber-500' />
        );
      }

      return <IconGlass size={isMobile ? 14 : 16} className='text-amber-500' />;
    },
    [isMobile]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleSearchSubmit();
    }
  };

  const handleResultClick = (product: Product) => {
    const categoryId = getCategoryId(product.category);
    router.push(`/menu/${categoryId}/${product._id}`);
    if (onClose) onClose();
  };

  const getCategoryId = useCallback((categoryName: string): string => {
    const normalizedCategory = categoryName.toLowerCase().trim();
    const categoryMap: Record<string, string> = {
      breakfast: 'breakfast',
      lunch: 'lunch',
      dinner: 'dinner',
      dessert: 'desserts',
      desserts: 'desserts',
      healthy: 'healthy',
      drink: 'drinks',
      drinks: 'drinks',
      coffee: 'drinks',
    };
    return categoryMap[normalizedCategory] || 'lunch';
  }, []);

  const categories = useMemo(
    () => [
      {
        name: 'Breakfast',
        icon: <IconCoffee size={isMobile ? 16 : 18} />,
        emoji: '☕',
      },
      {
        name: 'Lunch',
        icon: <IconToolsKitchen2 size={isMobile ? 16 : 18} />,
        emoji: '🍽️',
      },
      {
        name: 'Dinner',
        icon: <IconToolsKitchen2 size={isMobile ? 16 : 18} />,
        emoji: '🌃',
      },
      {
        name: 'Healthy',
        icon: <IconSalad size={isMobile ? 16 : 18} />,
        emoji: '🥗',
      },
      {
        name: 'Desserts',
        icon: <IconCake size={isMobile ? 16 : 18} />,
        emoji: '🍰',
      },
      {
        name: 'Drinks',
        icon: <IconGlass size={isMobile ? 16 : 18} />,
        emoji: '🥤',
      },
    ],
    [isMobile]
  );

  // Mobile-optimized search results
  const renderResultsList = useMemo(() => {
    if (results.length === 0) return null;

    return (
      <div
        className={`divide-y ${
          isDarkMode ? 'divide-gray-800' : 'divide-gray-100'
        }`}
      >
        {results.map((product) => (
          <div
            key={product._id}
            onClick={() => handleResultClick(product)}
            className={`p-3 md:p-4 flex items-center gap-3 md:gap-4 cursor-pointer transition-all duration-200 active:scale-95 ${
              isDarkMode
                ? 'hover:bg-gray-800 active:bg-gray-700'
                : 'hover:bg-amber-50 active:bg-amber-100'
            }`}
          >
            {/* Product Image */}
            <div
              className={`${
                isMobile ? 'w-12 h-12' : 'w-16 h-16'
              } relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm`}
            >
              {product.image?.url ? (
                <Image
                  src={product.image.url}
                  alt={product.name}
                  fill
                  className='object-cover'
                  sizes={isMobile ? '48px' : '64px'}
                  loading='lazy'
                />
              ) : product.images && product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className='object-cover'
                  sizes={isMobile ? '48px' : '64px'}
                  loading='lazy'
                />
              ) : (
                <div className='flex items-center justify-center h-full'>
                  <IconSearch
                    size={isMobile ? 16 : 20}
                    className='text-gray-400'
                  />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className='flex-1 min-w-0'>
              <h4
                className={`${
                  isMobile ? 'text-sm' : 'text-base'
                } font-semibold truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {product.name}
              </h4>
              <p
                className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } truncate mt-0.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {product.description.substring(0, isMobile ? 40 : 60)}
                {product.description.length > (isMobile ? 40 : 60) ? '...' : ''}
              </p>
              <div className='flex items-center mt-1 gap-2'>
                {getCategoryIcon(product.category)}
                <span
                  className={`${isMobile ? 'text-xs' : 'text-sm'} ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  {product.category}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className='flex flex-col items-end'>
              <span
                className={`${
                  isMobile ? 'text-sm' : 'text-lg'
                } font-bold text-amber-600`}
              >
                ${product.price.toFixed(2)}
              </span>
              <div className='flex items-center mt-1'>
                <IconSparkles size={12} className='text-amber-400 mr-1' />
                <span
                  className={`${
                    isMobile ? 'text-xs' : 'text-sm'
                  } text-amber-500 font-medium`}
                >
                  Popular
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [results, isDarkMode, isMobile, getCategoryIcon]);

  // Recent searches with improved mobile layout
  const renderRecentSearches = useMemo(() => {
    if (!recentSearches.length) return null;

    return (
      <div className='p-4 md:p-6'>
        <div className='flex items-center justify-between mb-3 md:mb-4'>
          <div className='flex items-center gap-2'>
            <IconClock size={isMobile ? 14 : 16} className='text-amber-500' />
            <h3
              className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-800'
              }`}
            >
              Recent Searches
            </h3>
          </div>
          <button
            onClick={clearRecentSearches}
            className={`${
              isMobile ? 'text-xs' : 'text-sm'
            } text-amber-600 hover:text-amber-700 font-medium transition-colors`}
          >
            Clear all
          </button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {recentSearches.slice(0, isMobile ? 4 : 6).map((term, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchTerm(term);
                setTimeout(() => performSearch(term), 100);
              }}
              className={`${
                isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
              } rounded-full transition-all duration-200 active:scale-95 ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    );
  }, [recentSearches, isDarkMode, isMobile, clearRecentSearches]);

  // Enhanced category browsing
  const renderCategoryLinks = useMemo(() => {
    if (searchTerm || results.length) return null;

    return (
      <div
        className={`p-4 md:p-6 ${
          isDarkMode ? 'border-gray-800' : 'border-gray-100'
        } border-t`}
      >
        <div className='flex items-center gap-2 mb-3 md:mb-4'>
          <IconTrendingUp
            size={isMobile ? 14 : 16}
            className='text-amber-500'
          />
          <h3
            className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}
          >
            Browse Categories
          </h3>
        </div>
        <div
          className={`grid ${
            isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-3'
          }`}
        >
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/menu?category=${category.name.toLowerCase()}`}
              onClick={onClose}
              className={`flex items-center gap-3 ${
                isMobile ? 'p-3' : 'p-4'
              } rounded-xl transition-all duration-200 active:scale-95 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-amber-50 hover:to-amber-100 text-gray-800 border border-gray-200 hover:border-amber-200'
              }`}
            >
              <div className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                {category.emoji}
              </div>
              <div className='flex-1 min-w-0'>
                <span
                  className={`${
                    isMobile ? 'text-sm' : 'text-base'
                  } font-medium`}
                >
                  {category.name}
                </span>
              </div>
              <span className='text-amber-500'>{category.icon}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }, [categories, searchTerm, results.length, isDarkMode, isMobile, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[10000]' onKeyDown={handleInputKeyDown}>
      {/* Backdrop with better mobile optimization */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isDarkMode ? 'bg-black/70' : 'bg-white/80 backdrop-blur-sm'
        }`}
        onClick={onClose}
      />

      {/* Search Modal */}
      <div
        className={`relative z-10 ${isMobile ? 'p-2' : 'p-4'} ${
          isMobile ? 'pt-4' : 'pt-16'
        }`}
      >
        <div
          ref={searchRef}
          className={`w-full ${
            isMobile ? 'max-w-full' : 'max-w-4xl'
          } mx-auto rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
            isOpen
              ? 'translate-y-0 opacity-100'
              : '-translate-y-10 opacity-0 pointer-events-none'
          } ${
            isDarkMode
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Search Header */}
          <div
            className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-white'} ${
              isMobile ? 'p-3' : 'p-4'
            }`}
          >
            <form onSubmit={handleSearchSubmit} className='relative'>
              <div
                className={`relative rounded-xl overflow-hidden ${
                  isDarkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                } focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all`}
              >
                <input
                  ref={inputRef}
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isMobile
                      ? 'Search food...'
                      : 'Search for food, categories, or ingredients...'
                  }
                  className={`w-full ${
                    isMobile
                      ? 'p-3 pl-11 pr-20 text-base'
                      : 'p-4 pl-12 pr-24 text-lg'
                  } outline-none bg-transparent ${
                    isDarkMode
                      ? 'text-white placeholder-gray-400'
                      : 'text-gray-900 placeholder-gray-500'
                  }`}
                  aria-label='Search'
                />
                <IconSearch
                  className={`absolute ${
                    isMobile ? 'left-3 top-3.5' : 'left-4 top-4'
                  } text-amber-500`}
                  size={isMobile ? 18 : 20}
                />
                <div
                  className={`absolute ${
                    isMobile ? 'right-2 top-2' : 'right-3 top-3'
                  } flex items-center gap-1`}
                >
                  {searchTerm && (
                    <button
                      type='button'
                      onClick={() => setSearchTerm('')}
                      className={`${
                        isMobile ? 'p-1.5' : 'p-2'
                      } rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all active:scale-95`}
                      aria-label='Clear search'
                    >
                      <IconX size={isMobile ? 16 : 18} />
                    </button>
                  )}
                  {onClose && (
                    <button
                      type='button'
                      onClick={onClose}
                      className={`${
                        isMobile ? 'p-1.5' : 'p-2'
                      } rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all active:scale-95`}
                      aria-label='Close search'
                    >
                      <IconX size={isMobile ? 18 : 20} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Search Results */}
          <div
            className={`${
              isMobile ? 'max-h-[70vh]' : 'max-h-[60vh]'
            } overflow-y-auto overscroll-contain ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {isLoading ? (
              <div className={`${isMobile ? 'p-8' : 'p-12'} text-center`}>
                <div className='w-8 h-8 border-t-2 border-amber-500 rounded-full animate-spin mx-auto'></div>
                <p
                  className={`mt-3 ${isMobile ? 'text-sm' : 'text-base'} ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Searching delicious food...
                </p>
              </div>
            ) : error ? (
              <div className={`${isMobile ? 'p-8' : 'p-12'} text-center`}>
                <IconX className='w-12 h-12 mx-auto text-red-400 mb-3' />
                <p
                  className={`font-medium ${
                    isMobile ? 'text-sm' : 'text-base'
                  } ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {error}
                </p>
              </div>
            ) : results.length > 0 ? (
              renderResultsList
            ) : searchTerm ? (
              <div className={`${isMobile ? 'p-8' : 'p-12'} text-center`}>
                <IconSearch className='w-12 h-12 mx-auto text-gray-300 mb-3' />
                <p
                  className={`font-medium ${isMobile ? 'text-sm' : 'text-lg'} ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-800'
                  }`}
                >
                  No results found for &quot;{searchTerm}&quot;
                </p>
                <p
                  className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'} ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Try a different search term or browse our categories below
                </p>
              </div>
            ) : recentSearches.length > 0 ? (
              renderRecentSearches
            ) : (
              <div className={`${isMobile ? 'p-8' : 'p-12'} text-center`}>
                <IconSearch className='w-12 h-12 mx-auto text-amber-200 mb-3' />
                <p
                  className={`font-medium ${
                    isMobile ? 'text-base' : 'text-lg'
                  } ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}
                >
                  Search our delicious menu
                </p>
                <p
                  className={`mt-2 ${isMobile ? 'text-sm' : 'text-base'} ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Find your favorite foods, drinks, and more
                </p>
              </div>
            )}

            {/* Category Links */}
            {renderCategoryLinks}
          </div>

          {/* Footer with search tips */}
          <div
            className={`${isMobile ? 'p-3' : 'p-4'} border-t ${
              isDarkMode
                ? 'border-gray-800 bg-gray-900'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <p
              className={`${isMobile ? 'text-xs' : 'text-sm'} text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span className='font-medium'>💡 Tip:</span> Press{' '}
              <kbd
                className={`${
                  isMobile ? 'px-1 py-0.5 text-xs' : 'px-1.5 py-0.5 text-xs'
                } rounded border mx-1 ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-800'
                    : 'border-gray-300 bg-white'
                }`}
              >
                ESC
              </kbd>{' '}
              to close search
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
