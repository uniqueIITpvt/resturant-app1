'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MenuItemClient } from './MenuItemClient';
import {
  
  ChevronDown,
  ArrowLeft,
  Clock,

  Search,
  SlidersHorizontal,
  Leaf,
  Tag,
  X,
  RefreshCcw,
} from 'lucide-react';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Define TypeScript interfaces
interface AddonOption {
  name: string;
  price: number;
}

interface AddonGroup {
  title: string;
  required: boolean;
  options: AddonOption[];
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: {
    public_id?: string;
    url: string;
  };
  isPopular?: boolean;
  isVegetarian?: boolean;
  addonGroups?: AddonGroup[];
}

// Map of category IDs to their display info
const categoryInfo: Record<
  string,
  { name: string; description: string; image: string; color: string }
> = {
  breakfast: {
    name: 'Breakfast',
    description: 'Start your day with our delicious breakfast options',
    image: '/menu/breakfast.jpg',
    color: 'from-amber-500/80 to-amber-600/80',
  },
  lunch: {
    name: 'Lunch',
    description: 'Perfect midday meals to fuel your afternoon',
    image: '/menu/lunch.jpg',
    color: 'from-blue-500/80 to-blue-600/80',
  },
  coffee: {
    name: 'Coffee',
    description: 'Premium coffee blends and specialty drinks',
    image: '/menu/coffee.jpg',
    color: 'from-brown-500/80 to-brown-600/80',
  },
  desserts: {
    name: 'Desserts',
    description: 'Indulgent sweet treats to satisfy your cravings',
    image: '/menu/desserts.jpg',
    color: 'from-pink-500/80 to-pink-600/80',
  },
  healthy: {
    name: 'Healthy',
    description: 'Nutritious options for the health-conscious',
    image: '/menu/healthy.jpg',
    color: 'from-green-500/80 to-green-600/80',
  },
  combos: {
    name: 'Combos',
    description: 'Perfect pairings for a complete meal experience',
    image: '/menu/combos.jpg',
    color: 'from-purple-500/80 to-purple-600/80',
  },
};

export default function CategoryClient({ category }: { category: string }) {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [otherCategories, setOtherCategories] = useState<
    { id: string; name: string; image: string; color: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Get category info
  const categoryId = category;
  const info = categoryInfo[categoryId] || {
    name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
    description: `Our selection of ${categoryId} items`,
    image: '/menu-placeholder.jpg',
    color: 'from-amber-500/80 to-amber-600/80',
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);

        // Fetch items for this category
        const response = await fetch(
          `${API_URL}/api/products/category/${categoryId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            router.push('/menu');
            return;
          }
          throw new Error('Failed to fetch category items');
        }

        const data: MenuItem[] = await response.json();
        setItems(data);

        // Fetch all categories for the "other categories" section
        const allCatsResponse = await fetch(`${API_URL}/api/products`);

        if (allCatsResponse.ok) {
          const allItems: MenuItem[] = await allCatsResponse.json();

          // Get unique categories
          const uniqueCategories = [
            ...new Set(allItems.map((item) => item.category.toLowerCase())),
          ];

          // Filter out current category and create category objects
          const otherCats = uniqueCategories
            .filter((cat) => cat !== categoryId)
            .map((cat) => {
              const info = categoryInfo[cat] || {
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                image: '/menu-placeholder.jpg',
                color: 'from-gray-500/80 to-gray-600/80',
              };

              return {
                id: cat,
                name: info.name,
                image: info.image,
                color: info.color,
              };
            });

          setOtherCategories(otherCats);
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId, router]);

  // Filter and sort items
  const filteredItems = items
    .filter((item) => {
      // Apply search term filter
      if (
        searchTerm &&
        !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Apply vegetarian filter if selected
      if (filterVeg && !item.isVegetarian) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterVeg(false);
    setSortBy('name');
  };

  // Check if any filter is active
  const isFilterActive = searchTerm !== '' || filterVeg || sortBy !== 'name';

  if (loading) {
    return (
      <div className='min-h-screen pt-16 md:pt-20 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50'>
        <div className='text-center'>
          <div className='w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6'></div>
          <p className='text-amber-800 font-medium'>
            Loading delicious items...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen pt-16 md:pt-20 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50'>
        <div className='max-w-md m-4 p-8 bg-white rounded-2xl shadow-xl'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full'>
            <X className='w-8 h-8 text-red-600' />
          </div>
          <h2 className='mb-6 text-2xl font-bold text-center text-gray-900'>
            Error Loading Menu
          </h2>
          <p className='mb-6 text-center text-gray-600'>{error}</p>
          <div className='flex justify-center'>
            <Link
              href='/menu'
              className='px-6 py-3 text-white bg-amber-500 rounded-full hover:bg-amber-600 transition-colors'
            >
              Return to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pt-16 md:pt-20 bg-gradient-to-br from-orange-50 to-amber-50'>
      {/* Hero section */}
      <div className='relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] overflow-hidden'>
        {/* Background image */}
        <div className='absolute inset-0'>
          <Image
            src={info.image}
            alt={info.name}
            fill
            className='object-cover'
            priority
            sizes='100vw'
          />
          {/* Gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${info.color} mix-blend-multiply`}
          ></div>
        </div>

        {/* Content */}
        <div className='absolute inset-0 flex flex-col justify-end'>
          <div className='container mx-auto px-4 pb-8 sm:pb-12 md:pb-16 z-10'>
            <Link
              href='/menu'
              className='inline-flex items-center px-4 py-2 mb-4 sm:mb-6 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/30 transition-colors'
            >
              <ArrowLeft size={16} className='mr-2' />
              Back to menu
            </Link>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4'>
              {info.name}
            </h1>
            <p className='text-white/90 text-base sm:text-lg md:text-xl max-w-2xl'>
              {info.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='container mx-auto px-4 -mt-6 sm:-mt-10 relative z-10'>
        {/* Search and filter container */}
        <div className='bg-white rounded-xl shadow-xl p-4 md:p-6 mb-8'>
          {/* Top row: search and filter buttons */}
          <div className='flex flex-wrap justify-between items-center gap-4'>
            {/* Search field */}
            <div className='relative flex-grow max-w-md'>
              <input
                type='text'
                placeholder='Search menu items...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-amber-500'
              />
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Desktop filters */}
            <div className='hidden md:flex items-center gap-3'>
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
                  showFilters
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-200 hover:text-amber-600'
                }`}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Vegetarian filter */}
              <button
                onClick={() => setFilterVeg(!filterVeg)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
                  filterVeg
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-200 hover:text-green-600'
                }`}
              >
                <Leaf size={18} />
                <span>Vegetarian</span>
              </button>

              {/* Sort options */}
              <button
                onClick={() => setSortBy(sortBy === 'name' ? 'price' : 'name')}
                className='flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-200 hover:text-amber-600'
              >
                <Tag size={18} />
                <span>Sort: {sortBy === 'name' ? 'A-Z' : 'Price'}</span>
              </button>

              {/* Reset button - only show if filters are active */}
              {isFilterActive && (
                <button
                  onClick={resetFilters}
                  className='flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-500 hover:text-gray-700'
                  title='Reset all filters'
                >
                  <RefreshCcw size={18} />
                </button>
              )}
            </div>

            {/* Mobile filter button */}
            <div className='md:hidden'>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${
                  isFilterActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <SlidersHorizontal size={18} />
                <span>{isFilterActive ? 'Filters Applied' : 'Filters'}</span>
              </button>
            </div>
          </div>

          {/* Desktop expanded filters */}
          {showFilters && (
            <div className='hidden md:block mt-6 pt-4 border-t border-gray-200'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>
                    Sort By
                  </h3>
                  <div className='space-y-2'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        name='sortDesktop'
                        checked={sortBy === 'name'}
                        onChange={() => setSortBy('name')}
                        className='w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300'
                      />
                      <span className='ml-2 text-gray-700'>Name (A to Z)</span>
                    </label>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        name='sortDesktop'
                        checked={sortBy === 'price'}
                        onChange={() => setSortBy('price')}
                        className='w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300'
                      />
                      <span className='ml-2 text-gray-700'>
                        Price (Low to High)
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>
                    Dietary Preferences
                  </h3>
                  <label className='flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={filterVeg}
                      onChange={() => setFilterVeg(!filterVeg)}
                      className='w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
                    />
                    <span className='ml-2 text-gray-700'>
                      Vegetarian Options Only
                    </span>
                  </label>
                </div>
              </div>

              <div className='flex justify-end mt-6'>
                <button
                  onClick={resetFilters}
                  className='px-4 py-2 text-amber-600 hover:text-amber-700 font-medium'
                >
                  Reset All
                </button>
              </div>
            </div>
          )}

          {/* Mobile filter drawer */}
          {mobileFilterOpen && (
            <div className='fixed inset-0 z-50 md:hidden overflow-hidden'>
              {/* Backdrop */}
              <div
                className='absolute inset-0 bg-black/50 backdrop-blur-sm'
                onClick={() => setMobileFilterOpen(false)}
              ></div>

              {/* Drawer content */}
              <div className='absolute bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-2xl overflow-hidden shadow-xl transform transition-all'>
                <div className='flex justify-center py-2'>
                  <div className='w-10 h-1 rounded-full bg-gray-300'></div>
                </div>

                <div
                  className='p-6 space-y-6 overflow-y-auto'
                  style={{ maxHeight: 'calc(90vh - 40px)' }}
                >
                  <div>
                    <div className='flex justify-between items-center mb-4'>
                      <h3 className='text-lg font-medium text-gray-900'>
                        Filters
                      </h3>
                      <button onClick={() => setMobileFilterOpen(false)}>
                        <X size={20} className='text-gray-500' />
                      </button>
                    </div>

                    {/* Filter sections */}
                    <div className='space-y-6 divide-y divide-gray-200'>
                      <div className='pt-2'>
                        <h4 className='text-sm font-medium text-gray-700 mb-3'>
                          Sort By
                        </h4>
                        <div className='space-y-4'>
                          <label className='flex items-center cursor-pointer'>
                            <input
                              type='radio'
                              name='sortMobile'
                              checked={sortBy === 'name'}
                              onChange={() => setSortBy('name')}
                              className='w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300'
                            />
                            <span className='ml-3 text-gray-700'>
                              Name (A to Z)
                            </span>
                          </label>
                          <label className='flex items-center cursor-pointer'>
                            <input
                              type='radio'
                              name='sortMobile'
                              checked={sortBy === 'price'}
                              onChange={() => setSortBy('price')}
                              className='w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300'
                            />
                            <span className='ml-3 text-gray-700'>
                              Price (Low to High)
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className='pt-6'>
                        <h4 className='text-sm font-medium text-gray-700 mb-3'>
                          Dietary Preferences
                        </h4>
                        <label className='flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={filterVeg}
                            onChange={() => setFilterVeg(!filterVeg)}
                            className='w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded'
                          />
                          <span className='ml-3 text-gray-700'>
                            Vegetarian Options Only
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className='pt-6 flex gap-3'>
                    <button
                      onClick={resetFilters}
                      className='flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium'
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className='flex-1 py-3 bg-amber-500 rounded-lg text-white font-medium'
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className='flex items-center justify-between mt-4 text-sm text-gray-500'>
            <div>
              Showing{' '}
              <span className='font-medium text-gray-700'>
                {filteredItems.length}
              </span>{' '}
              items
            </div>
            {isFilterActive && (
              <button
                onClick={resetFilters}
                className='text-amber-600 hover:text-amber-700 text-sm md:hidden'
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Menu items grid */}
        {filteredItems.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-16'>
            {filteredItems.map((item) => (
              <MenuItemClient key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className='bg-white rounded-xl shadow-lg p-10 text-center mb-16'>
            {filterVeg ? (
              <div className='flex flex-col items-center'>
                <div className='w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6'>
                  <Leaf size={32} className='text-green-500' />
                </div>
                <h3 className='text-xl font-medium text-gray-800 mb-2'>
                  No Vegetarian Options Found
                </h3>
                <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                  We couldn&apos;t find any vegetarian items in this category.
                  Try removing the filter to see all available options.
                </p>
                <button
                  onClick={() => setFilterVeg(false)}
                  className='px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors'
                >
                  Show All Items
                </button>
              </div>
            ) : searchTerm ? (
              <div className='flex flex-col items-center'>
                <div className='w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6'>
                  <Search size={32} className='text-amber-500' />
                </div>
                <h3 className='text-xl font-medium text-gray-800 mb-2'>
                  No Matching Items Found
                </h3>
                <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                  We couldn&apos;t find any items matching &quot;{searchTerm}
                  &quot;. Try searching with different keywords.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className='px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors'
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className='flex flex-col items-center'>
                <div className='w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6'>
                  <Clock size={32} className='text-amber-500' />
                </div>
                <h3 className='text-xl font-medium text-gray-800 mb-2'>
                  Coming Soon!
                </h3>
                <p className='text-gray-600 max-w-md mx-auto'>
                  We&apos;re working on adding delicious items to this category.
                  Please check back soon!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Other Categories Carousel */}
        {otherCategories.length > 0 && (
          <div className='mb-20'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Explore Other Categories
            </h2>
            <div className='overflow-x-auto pb-6 -mx-4 px-4 hide-scrollbar'>
              <div
                className='flex space-x-4'
                style={{ minWidth: 'max-content' }}
              >
                {otherCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/menu/${cat.id}`}
                    className='block relative w-64 h-40 flex-shrink-0 rounded-xl overflow-hidden group'
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className='object-cover transition-transform duration-500 group-hover:scale-110'
                      sizes='256px'
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80 group-hover:opacity-90 transition-opacity`}
                    ></div>
                    <div className='absolute inset-0 flex items-center justify-center p-4'>
                      <h3 className='text-xl font-bold text-white text-center'>
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom stylesheet for hiding scrollbars */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
