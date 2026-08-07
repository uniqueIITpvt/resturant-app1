'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProductAddonsModal from '@/components/modals/ProductAddonsModal';
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Clock,
  Award,
  ChevronRight,
  Heart,
  Sparkles,
  Leaf,
  Plus,
  ChefHat,
  TrendingUp,
} from 'lucide-react';

// Add at the top of the file
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Define TypeScript interfaces
interface AddonOption {
  name: string;
  price: number;
  selected?: boolean;
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
  addonGroups?: AddonGroup[];
  isPopular?: boolean;
  isVegetarian?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  items: MenuItem[];
}

// Map of category IDs to their display info
const categoryInfo: Record<
  string,
  {
    name: string;
    description: string;
    image: string;
    icon: string;
    bgColor: string;
    textColor: string;
  }
> = {
  appetizers: {
    name: 'Appetizers',
    description: 'Start with something special',
    image: '/menu/appetizers.jpg',
    icon: '🍤',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  'chicken dishes': {
    name: 'Chicken Dishes',
    description: 'Flavorful chicken specialties',
    image: '/menu/chicken.webp',
    icon: '🍗',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  'beef dishes': {
    name: 'Beef Dishes',
    description: 'Premium beef selections',
    image: '/menu/beef.webp',
    icon: '🥩',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  'vegetable dishes': {
    name: 'Vegetable Dishes',
    description: 'Fresh vegetable specialties',
    image: '/menu/healthy.jpg',
    icon: '🥕',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  'rice dishes': {
    name: 'Rice Dishes',
    description: 'Aromatic rice specialties',
    image: '/menu/rice.jpg',
    icon: '🍚',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  bread: {
    name: 'Bread',
    description: 'Freshly baked bread',
    image: '/menu/bread.jpg',
    icon: '🍞',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  'grilled dishes': {
    name: 'Grilled Dishes',
    description: 'Perfectly grilled specialties',
    image: '/menu/grilled.jpg',
    icon: '🔥',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  'seafood dishes': {
    name: 'Seafood Dishes',
    description: 'Fresh seafood specialties',
    image: '/menu/seafood.jpg',
    icon: '🐟',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  'rolls/wraps': {
    name: 'Rolls & Wraps',
    description: 'Delicious rolls and wraps',
    image: '/menu/rolls.jpg',
    icon: '🌯',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  'lamb/goat dishes': {
    name: 'Lamb & Goat Dishes',
    description: 'Premium lamb and goat specialties',
    image: '/menu/lamb.jpg',
    icon: '🍖',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  desserts: {
    name: 'Desserts',
    description: 'Sweet indulgences',
    image: '/menu/desserts.jpg',
    icon: '🍰',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
  },
  beverages: {
    name: 'Beverages',
    description: 'Refreshing drinks',
    image: '/menu/drinks.jpg',
    icon: '🥤',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
};

// Enhanced Menu Item Component matching homepage design
function MenuItem({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const hasAddons = item.addonGroups && item.addonGroups.length > 0;
  const categoryData = categoryInfo[item.category.toLowerCase()] || {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  };

  const handleAddToCart = () => {
    if (!hasAddons) {
      addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image?.url,
        selectedAddons: [],
      });
      toast.success(`${item.name} added to cart`);
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <div className='group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1'>
        {/* Image Section - Matching homepage design */}
        <div className='relative h-32 sm:h-40 md:h-48 overflow-hidden'>
          <Image
            src={item.image?.url || '/menu-placeholder.jpg'}
            alt={item.name}
            fill
            className='object-cover transition-transform duration-700 group-hover:scale-110'
            sizes='(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent'></div>

          {/* Badges - Matching homepage style */}
          <div className='absolute top-1.5 right-1.5 md:top-3 md:right-3 flex flex-col gap-1'>
            {item.isPopular && (
              <div className='px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-full flex items-center shadow-md'>
                <Award className='h-2.5 w-2.5 md:h-3.5 md:w-3.5 mr-1' />
                <span className='text-xs font-bold hidden sm:inline'>
                  Popular
                </span>
              </div>
            )}
            {item.isVegetarian && (
              <div className='px-2 py-1 bg-green-500 text-white rounded-full flex items-center shadow-md'>
                <Leaf className='h-2.5 w-2.5 mr-1' />
                <span className='text-xs font-bold hidden sm:inline'>Veg</span>
              </div>
            )}
            {hasAddons && (
              <div className='px-2 py-1 bg-blue-500 text-white rounded-full flex items-center shadow-md'>
                <Sparkles className='h-2.5 w-2.5 mr-1' />
                <span className='text-xs font-bold hidden sm:inline'>
                  Custom
                </span>
              </div>
            )}
          </div>

          {/* Category badge - Mobile Optimized */}
          <div className='absolute top-1.5 left-1.5'>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${categoryData.bgColor} ${categoryData.textColor}`}
            >
              <span className='hidden sm:inline'>{item.category}</span>
              <span className='sm:hidden'>
                {categoryInfo[item.category.toLowerCase()]?.icon}
              </span>
            </span>
          </div>

          {/* Quick add button - Matching homepage */}
          <button
            onClick={handleAddToCart}
            className='absolute bottom-1.5 right-1.5 md:bottom-3 md:right-3 p-1.5 md:p-2 bg-white rounded-full text-amber-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-500 hover:text-white transform group-hover:translate-y-0 translate-y-4'
            aria-label='Add to cart'
          >
            <Plus className='h-4 w-4 md:h-5 md:w-5' />
          </button>

          {/* Like button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`absolute bottom-1.5 left-1.5 md:bottom-3 md:left-3 p-1.5 md:p-2 rounded-full shadow-md transition-all duration-300 ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart
              className={`h-3 w-3 md:h-4 md:w-4 ${
                isLiked ? 'fill-current' : ''
              }`}
            />
          </button>
        </div>

        {/* Content Section - Matching homepage design */}
        <div className='p-2.5 md:p-4 flex-grow flex flex-col'>
          <Link
            href={`/menu/${item.category.toLowerCase()}/${item._id}`}
            className='text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-amber-600 transition-colors'
          >
            {item.name}
          </Link>

          {/* Rating Stars - Matching homepage */}
          <div className='flex items-center mb-2 text-amber-500'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 md:h-4 md:w-4 ${
                  i < 4 ? 'fill-current' : 'fill-current opacity-30'
                }`}
              />
            ))}
            <span className='ml-1 text-xs text-gray-500'>(4.0)</span>
          </div>

          <p className='text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 flex-grow leading-relaxed'>
            {item.description}
          </p>

          {/* Price and category info */}
          <div className='flex justify-between items-center mb-2 md:mb-3'>
            <span className='text-amber-600 font-bold text-base md:text-xl'>
              ${item.price.toFixed(2)}
            </span>
            <div className='flex items-center text-xs text-gray-500'>
              <Clock className='h-3 w-3 mr-1 text-amber-500' />
              <span>15-20 min</span>
            </div>
          </div>

          {/* Action Buttons - Matching homepage */}
          <div className='flex flex-col sm:flex-row gap-1.5 sm:gap-2'>
            <button
              onClick={handleAddToCart}
              className='flex-1 px-2 py-2 sm:px-3 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors text-xs md:text-sm flex justify-center items-center shadow-sm'
            >
              <ShoppingBag className='h-3 w-3 md:h-4 md:w-4 mr-1' />
              <span className='hidden sm:inline'>Add to Cart</span>
              <span className='sm:hidden'>Add</span>
            </button>
            <Link
              href={`/menu/${item.category.toLowerCase()}/${item._id}`}
              className='flex-1 px-2 py-2 sm:px-3 sm:py-2.5 border border-amber-200 text-amber-600 hover:bg-amber-50 font-medium rounded-lg transition-colors text-xs md:text-sm text-center'
            >
              <span className='hidden sm:inline'>View Details</span>
              <span className='sm:hidden'>Details</span>
            </Link>
          </div>
        </div>
      </div>
      {/* ProductAddonsModal */}
      {showModal && (
        <ProductAddonsModal
          productId={item._id}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// Enhanced Category Section Component
function CategorySection({ category }: { category: MenuCategory }) {
  const categoryData = categoryInfo[category.id] || {
    name: category.name,
    description: category.description,
    image: category.image,
    icon: '🍽️',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  };

  return (
    <section id={category.id} className='mb-12 scroll-mt-24'>
      {/* Category Header - Simplified design */}
      <div className='relative bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 mb-8 border border-amber-100'>
        <div className='flex flex-col md:flex-row md:items-center justify-between'>
          <div className='flex-1'>
            <div className='flex items-center mb-3'>
              <div className='text-2xl md:text-3xl mr-3'>
                {categoryData.icon}
              </div>
              <div>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-1'>
                  {category.name}
                </h2>
                <p className='text-gray-600 text-sm md:text-base'>
                  {category.items.length} item
                  {category.items.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
            <p className='text-gray-700 max-w-2xl leading-relaxed'>
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items Grid - Matching homepage layout */}
      <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6'>
        {category.items.map((item) => (
          <MenuItem key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}

// Enhanced Search Component (search only)
function SearchComponent({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className='max-w-4xl mx-auto mb-4'>
      {/* Search Bar */}
      <div
        className={`relative transition-all duration-300 ${
          searchFocused
            ? 'shadow-lg ring-2 ring-amber-200 rounded-xl'
            : 'shadow-md rounded-xl'
        }`}
      >
        <input
          type='text'
          placeholder='Search for dishes...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className='w-full px-4 py-3 pl-12 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:border-transparent bg-white text-sm md:text-base'
        />
        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500'>
          <Search className='h-5 w-5' />
        </div>
      </div>
    </div>
  );
}

// Sticky Category Filter Component
function StickyCategories({
  categories,
  categoryFilter,
}: {
  categories: MenuCategory[];
  categoryFilter: string | null;
}) {
  return (
    <div className='sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 shadow-sm'>
      <div className='container mx-auto px-4'>
        <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
          <Link
            href='/menu'
            className={`flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !categoryFilter
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            <Filter className='h-4 w-4 mr-2' />
            All Categories
          </Link>
          {categories.map((category) => {
            const info = categoryInfo[category.id];
            const isActive = categoryFilter === category.id;
            return (
              <Link
                key={category.id}
                href={isActive ? '/menu' : `/menu?category=${category.id}`}
                className={`flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                <span className='mr-2 text-base'>{info?.icon || '🍽️'}</span>
                <span className='hidden sm:inline'>{category.name}</span>
                <span className='sm:hidden'>{category.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Create a client component that uses useSearchParams
function MenuContent() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }

        const data: MenuItem[] = await response.json();

        // Group items by category
        const categorizedItems: Record<string, MenuItem[]> = {};

        data.forEach((item) => {
          const category = item.category.toLowerCase();
          if (!categorizedItems[category]) {
            categorizedItems[category] = [];
          }
          categorizedItems[category].push(item);
        });

        // Create category objects
        const menuCategories: MenuCategory[] = Object.keys(
          categorizedItems
        ).map((categoryId) => {
          const info = categoryInfo[categoryId] || {
            name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
            description: `Our selection of ${categoryId} items`,
            image: '/menu-placeholder.jpg',
            icon: '🍽️',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
          };

          return {
            id: categoryId,
            name: info.name,
            description: info.description,
            image: info.image,
            items: categorizedItems[categoryId],
          };
        });

        setCategories(menuCategories);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Scroll to category section if filter is applied
  useEffect(() => {
    if (categoryFilter && !loading) {
      const timer = setTimeout(() => {
        if (
          typeof window !== 'undefined' &&
          document.readyState === 'complete'
        ) {
          const categoryElement = document.getElementById(categoryFilter);
          if (categoryElement) {
            // Only scroll if this is user navigation, not page refresh
            const isUserNavigation =
              document.referrer && !window.performance.navigation.type;
            if (isUserNavigation) {
              categoryElement.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [categoryFilter, loading]);

  // Filter categories based on search term
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center pt-20'>
        <div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center max-w-md'>
          <div className='relative mb-6'>
            <div className='w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto'></div>
            <div className='absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-300 rounded-full animate-spin animation-delay-200 mx-auto'></div>
          </div>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>
            Loading Our Delicious Menu
          </h2>
          <p className='text-gray-600'>Preparing your culinary journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center pt-20'>
        <div className='max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100 text-center'>
          <div className='w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6'>
            <ShoppingBag className='h-8 w-8 text-red-500' />
          </div>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Error Loading Menu
          </h2>
          <p className='text-gray-600 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-b from-amber-50/30 to-white min-h-screen pt-20'>
      {/* Hero Banner - Matching homepage style */}
      <section className='pt-8 md:pt-12 relative overflow-hidden'>
        {/* Decorative background elements - Matching homepage */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <div className='absolute top-20 right-[10%] w-64 h-64 bg-amber-100 rounded-full opacity-30 blur-3xl'></div>
          <div className='absolute -bottom-100 -left-16 w-72 h-72 bg-amber-200 rounded-full opacity-20 blur-3xl'></div>
          <div className='absolute bottom-40 right-20 w-8 h-8 bg-amber-300 rounded-full opacity-30'></div>
        </div>

        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-4xl mx-auto text-center mb-12'>
            <span className='inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs tracking-wider uppercase mb-3'>
              <ChefHat className='inline-block w-3.5 h-3.5 mr-2' />
              Our Complete Menu
            </span>

            <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold mb-6'>
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800'>
                Discover Our
              </span>
              <br />
              <span className='text-gray-900'>Signature Dishes</span>
            </h1>

            <p className='text-gray-600 md:text-lg max-w-2xl mx-auto mb-8'>
              Explore our carefully curated collection of authentic dishes,
              prepared with the finest ingredients and traditional recipes that
              bring flavors from around the world to your table.
            </p>

            {categoryFilter && (
              <div className='inline-flex items-center bg-white border border-amber-200 px-6 py-3 rounded-xl shadow-sm'>
                <TrendingUp className='h-5 w-5 mr-2 text-amber-600' />
                <span className='font-semibold text-gray-700'>
                  Viewing:{' '}
                  <span className='text-amber-600'>
                    {categoryFilter.charAt(0).toUpperCase() +
                      categoryFilter.slice(1)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Search Component - Only search bar */}
          <SearchComponent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </section>

      {/* Sticky Category Filter */}
      <StickyCategories
        categories={categories}
        categoryFilter={categoryFilter}
      />

      {/* Main Content */}
      <div className='container mx-auto px-4 pb-8 md:pb-16'>
        {/* Menu Content */}
        {filteredCategories.length > 0 ? (
          <div>
            {categoryFilter
              ? // Show only the filtered category
                filteredCategories
                  .filter((category) => category.id === categoryFilter)
                  .map((category) => (
                    <CategorySection key={category.id} category={category} />
                  ))
              : // Show all categories
                filteredCategories.map((category) => (
                  <CategorySection key={category.id} category={category} />
                ))}
          </div>
        ) : (
          <div className='text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mx-2'>
            <div className='w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6'>
              <Search className='h-12 w-12 text-amber-600' />
            </div>
            <h3 className='text-2xl font-bold text-gray-800 mb-4'>
              No dishes found
            </h3>
            <p className='text-gray-600 mb-8 max-w-md mx-auto'>
              {searchTerm
                ? `No results found for "${searchTerm}". Try a different search term.`
                : categoryFilter
                ? `No items found in the "${categoryFilter}" category.`
                : 'No menu items available at the moment.'}
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors'
                >
                  Clear Search
                </button>
              )}
              <Link
                href='/menu'
                className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all inline-flex items-center justify-center'
              >
                <ChevronRight className='h-5 w-5 mr-2' />
                View All Menu
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        @media (max-width: 640px) {
          .container {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>
    </div>
  );
}

// Wrap the client component in Suspense boundary
export default function Menu() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center pt-20'>
          <div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center max-w-md'>
            <div className='relative mb-6'>
              <div className='w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto'></div>
              <div className='absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-300 rounded-full animate-spin animation-delay-200 mx-auto'></div>
            </div>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>
              Loading Menu
            </h2>
            <p className='text-gray-600'>Please wait...</p>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
