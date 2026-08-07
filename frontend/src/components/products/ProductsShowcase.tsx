'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconShoppingBag,
  IconCoffee,
  IconToolsKitchen2,
  IconSearch,
  IconArrowRight,
  IconCake,
  IconMeat,
  IconSalad,
  IconGlass,
  IconStar,
  IconPlus,
  IconChefHat,
  IconFilterSearch,
} from '@tabler/icons-react';
import ProductAddonsModal from '../modals/ProductAddonsModal';
// import ProductAddonsModal from './ProductAddonsModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  hoverBg: string;
  activeRing: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: {
    public_id?: string;
    url?: string;
  };
}

export default function ProductsShowcase() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const categories: Category[] = [
    {
      id: 'appetizers',
      name: 'Appetizers',
      icon: <IconCoffee size={18} />,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      hoverBg: 'hover:bg-amber-50',
      activeRing: 'ring-amber-400',
    },
    {
      id: 'chicken dishes',
      name: 'Chicken',
      icon: <IconToolsKitchen2 size={18} />,
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      hoverBg: 'hover:bg-red-50',
      activeRing: 'ring-red-400',
    },
    {
      id: 'beef dishes',
      name: 'Beef',
      icon: <IconMeat size={18} />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      hoverBg: 'hover:bg-purple-50',
      activeRing: 'ring-purple-400',
    },
    {
      id: 'vegetable dishes',
      name: 'Vegetable',
      icon: <IconSalad size={18} />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      hoverBg: 'hover:bg-green-50',
      activeRing: 'ring-green-400',
    },
    {
      id: 'rice dishes',
      name: 'Rice',
      icon: <IconToolsKitchen2 size={18} />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      hoverBg: 'hover:bg-blue-50',
      activeRing: 'ring-blue-400',
    },
    {
      id: 'desserts',
      name: 'Desserts',
      icon: <IconCake size={18} />,
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      hoverBg: 'hover:bg-pink-50',
      activeRing: 'ring-pink-400',
    },
    {
      id: 'bread',
      name: 'Bread',
      icon: <IconCoffee size={18} />,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      hoverBg: 'hover:bg-amber-50',
      activeRing: 'ring-amber-400',
    },
    {
      id: 'beverages',
      name: 'Beverages',
      icon: <IconGlass size={18} />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      hoverBg: 'hover:bg-blue-50',
      activeRing: 'ring-blue-400',
    },
  ];

  // Helper function to map category names
  const getCategoryId = (categoryName: string): string => {
    const normalizedCategory = categoryName.toLowerCase().trim();

    // Direct mapping for common category variations
    const categoryMap: Record<string, string> = {
      appetizers: 'appetizers',
      'chicken dishes': 'chicken dishes',
      'beef dishes': 'beef dishes',
      'vegetable dishes': 'vegetable dishes',
      'rice dishes': 'rice dishes',
      desserts: 'desserts',
      'goat biryani': 'rice dishes',
      'chicken biryani': 'rice dishes',
      'vegetable biryani': 'rice dishes',
      bread: 'bread',
      'grilled dishes': 'grilled dishes',
      'seafood dishes': 'seafood dishes',
      'rolls/wraps': 'rolls/wraps',
      'lamb/goat dishes': 'lamb/goat dishes',
      beverages: 'beverages',
    };

    return categoryMap[normalizedCategory] || normalizedCategory;
  };

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);

        // Initially show all products, limited to 8
        setFilteredProducts(data.slice(0, 8));

        // Set an initial active category if we have products
        if (data.length > 0) {
          // Find the category with the most products
          const categoryCounts: Record<string, number> = {};
          data.forEach((product: Product) => {
            const categoryId = getCategoryId(product.category);
            categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
          });

          const mostPopularCategory = Object.keys(categoryCounts).reduce(
            (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
            Object.keys(categoryCounts)[0]
          );

          setActiveCategory(mostPopularCategory);

          // Filter products for this category
          const filtered = data
            .filter(
              (product: Product) =>
                getCategoryId(product.category) === mostPopularCategory
            )
            .slice(0, 8);

          setFilteredProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Unable to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchTerm('');

    // Find matching products by category
    const filtered = products
      .filter((product) => getCategoryId(product.category) === categoryId)
      .slice(0, 8);

    setFilteredProducts(filtered);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // If no term, revert to category filtering
    if (!term && activeCategory) {
      handleCategoryChange(activeCategory);
      return;
    }

    // Filter by search term
    const filtered = products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      )
      .slice(0, 8);

    setFilteredProducts(filtered);
  };

  // Add product to cart - updated to show modal if needed
  const handleAddToCart = (product: Product) => {
    // Set the selected product ID and open the modal
    setSelectedProductId(product._id);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <section className='py-12 md:py-20 bg-gradient-to-b from-amber-50/30 to-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-2xl mx-auto text-center mb-12'>
            <span className='inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs tracking-wider uppercase mb-3'>
              Delicious Selections
            </span>
            <h2 className='text-2xl md:text-4xl font-bold text-gray-900 mb-6'>
              Exploring Our Menu
            </h2>

            <div className='w-full h-48 rounded-xl bg-gray-100 flex items-center justify-center'>
              <div className='relative flex space-x-2'>
                <div className='w-3 h-3 bg-amber-500 rounded-full animate-pulse'></div>
                <div className='w-3 h-3 bg-amber-500 rounded-full animate-pulse animation-delay-150'></div>
                <div className='w-3 h-3 bg-amber-500 rounded-full animate-pulse animation-delay-300'></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section className='py-12 md:py-20 bg-gradient-to-b from-amber-50/30 to-white relative overflow-hidden'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-20 right-[20%] w-64 h-64 bg-amber-100 rounded-full opacity-20 blur-3xl'></div>
        <div className='absolute -bottom-32 -left-16 w-72 h-72 bg-amber-200 rounded-full opacity-15 blur-3xl'></div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Header Section - Mobile Optimized */}
        <div className='max-w-2xl mx-auto text-center mb-8 md:mb-12'>
          <span className='inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs tracking-wider uppercase mb-3'>
            Delicious Selections
          </span>
          <h2 className='text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 md:mb-6'>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800'>
              Explore Our Menu
            </span>
          </h2>
          <p className='text-gray-600 text-sm md:text-lg max-w-xl mx-auto'>
            Discover mouthwatering dishes prepared with the finest ingredients
            by our award-winning chefs.
          </p>
        </div>

        {/* Search Section - Mobile Optimized */}
        <div className='max-w-3xl mx-auto mb-8 md:mb-12'>
          <div
            className={`relative transition-all duration-300 ${
              searchFocused
                ? 'shadow-lg ring-2 ring-amber-200 rounded-xl'
                : 'shadow-md rounded-xl'
            }`}
          >
            <input
              type='text'
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder='Search for dishes...'
              className='w-full px-4 py-3 pl-12 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:border-transparent bg-white text-sm md:text-base'
            />
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500'>
              <IconFilterSearch size={20} strokeWidth={1.5} />
            </div>
          </div>

          {/* Categories - Mobile Optimized Horizontal Scroll */}
          <div className='mt-6 overflow-hidden'>
            <div className='flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide'>
              {categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex-shrink-0 flex items-center px-3 py-2 rounded-full transition-all duration-300 text-sm ${
                      isActive
                        ? `${category.bgColor} ${category.textColor} font-medium shadow-md ring-2 ring-offset-1 ${category.activeRing}`
                        : `bg-white text-gray-700 ${category.hoverBg} border border-gray-100 shadow-sm hover:shadow`
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center p-1 ${
                        isActive ? 'bg-white/30' : 'bg-gray-50'
                      } rounded-full mr-2`}
                    >
                      {category.icon}
                    </span>
                    <span className='whitespace-nowrap font-medium'>
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid - Mobile First Responsive */}
        <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-12'>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const categoryInfo =
                categories.find(
                  (cat) => cat.id === getCategoryId(product.category)
                ) || categories[0];

              return (
                <div
                  key={product._id}
                  className='group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1'
                >
                  {/* Image Section - Mobile Optimized */}
                  <div className='relative h-32 sm:h-40 md:h-48 overflow-hidden'>
                    {product.image && product.image.url ? (
                      <Image
                        src={product.image.url}
                        alt={product.name}
                        fill
                        sizes='(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                        className='object-cover transition-transform duration-700 group-hover:scale-110'
                        priority={false}
                      />
                    ) : (
                      <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                        <IconShoppingBag size={24} className='text-gray-400' />
                      </div>
                    )}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent'></div>

                    {/* Category badge - Mobile Optimized */}
                    <div className='absolute top-1.5 right-1.5'>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor}`}
                      >
                        <span className='hidden sm:inline'>
                          {product.category}
                        </span>
                        <span className='sm:hidden'>
                          {(() => {
                            const categoryId = getCategoryId(product.category);
                            if (categoryId === 'appetizers')
                              return <IconCoffee size={10} />;
                            if (
                              categoryId === 'chicken dishes' ||
                              categoryId === 'chicken biryani'
                            )
                              return <IconToolsKitchen2 size={10} />;
                            if (
                              categoryId === 'beef dishes' ||
                              categoryId === 'grilled dishes' ||
                              categoryId === 'lamb/goat dishes'
                            )
                              return <IconMeat size={10} />;
                            if (
                              categoryId === 'vegetable dishes' ||
                              categoryId === 'vegetable biryani'
                            )
                              return <IconSalad size={10} />;
                            if (categoryId === 'desserts')
                              return <IconCake size={10} />;
                            if (categoryId === 'beverages')
                              return <IconGlass size={10} />;
                            if (
                              categoryId === 'rice dishes' ||
                              categoryId === 'goat biryani'
                            )
                              return <IconToolsKitchen2 size={10} />;
                            return <IconCoffee size={10} />;
                          })()}
                        </span>
                      </span>
                    </div>

                    {/* Quick add button - Mobile Optimized */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className='absolute bottom-1.5 right-1.5 p-1.5 bg-white rounded-full text-amber-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-500 hover:text-white transform group-hover:translate-y-0 translate-y-2'
                      aria-label='Add to cart'
                    >
                      <IconPlus size={14} />
                    </button>
                  </div>

                  {/* Content Section - Mobile Optimized */}
                  <div className='p-2.5 md:p-4'>
                    {/* Title and Rating */}
                    <div className='mb-2'>
                      <Link
                        href={`/menu/${getCategoryId(product.category)}/${
                          product._id
                        }`}
                        className='block text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-amber-600 transition-colors'
                      >
                        {product.name}
                      </Link>

                      <div className='flex items-center text-amber-500'>
                        {[...Array(5)].map((_, i) => (
                          <IconStar
                            key={i}
                            size={10}
                            className={`${
                              i < 4 ? 'fill-current' : 'fill-current opacity-30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Description - Mobile Optimized */}
                    <p className='text-gray-600 text-xs md:text-sm mb-2 line-clamp-2 leading-relaxed'>
                      {product.description}
                    </p>

                    {/* Price and Category Icon */}
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-amber-600 font-bold text-base md:text-xl'>
                        ${product.price.toFixed(2)}
                      </span>

                      <span
                        className={`hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor} opacity-80`}
                      >
                        {(() => {
                          const categoryId = getCategoryId(product.category);
                          if (categoryId === 'appetizers')
                            return <IconCoffee size={10} className='mr-1' />;
                          if (
                            categoryId === 'chicken dishes' ||
                            categoryId === 'chicken biryani'
                          )
                            return (
                              <IconToolsKitchen2 size={10} className='mr-1' />
                            );
                          if (
                            categoryId === 'beef dishes' ||
                            categoryId === 'grilled dishes' ||
                            categoryId === 'lamb/goat dishes'
                          )
                            return <IconMeat size={10} className='mr-1' />;
                          if (
                            categoryId === 'vegetable dishes' ||
                            categoryId === 'vegetable biryani'
                          )
                            return <IconSalad size={10} className='mr-1' />;
                          if (categoryId === 'desserts')
                            return <IconCake size={10} className='mr-1' />;
                          if (categoryId === 'beverages')
                            return <IconGlass size={10} className='mr-1' />;
                          if (
                            categoryId === 'rice dishes' ||
                            categoryId === 'goat biryani'
                          )
                            return (
                              <IconToolsKitchen2 size={10} className='mr-1' />
                            );
                          return <IconCoffee size={10} className='mr-1' />;
                        })()}
                        <span className='capitalize text-xs'>
                          {getCategoryId(product.category).replace(
                            ' dishes',
                            ''
                          )}
                        </span>
                      </span>
                    </div>

                    {/* Action Buttons - Mobile Optimized */}
                    <div className='flex flex-col sm:flex-row gap-1.5 sm:gap-2'>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className='flex-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors text-xs md:text-sm flex justify-center items-center shadow-sm'
                      >
                        <IconShoppingBag size={12} className='mr-1' />
                        <span className='hidden sm:inline'>Add to Cart</span>
                        <span className='sm:hidden'>Add</span>
                      </button>
                      <Link
                        href={`/menu/${getCategoryId(product.category)}/${
                          product._id
                        }`}
                        className='flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 font-medium rounded-lg transition-colors text-xs md:text-sm text-center'
                      >
                        <span className='hidden sm:inline'>Details</span>
                        <span className='sm:hidden'>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 mx-2'>
              <div className='w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4'>
                <IconSearch size={24} className='text-amber-600' />
              </div>
              <h3 className='text-lg font-bold text-gray-800 mb-2'>
                No dishes found
              </h3>
              <p className='text-gray-600 text-sm max-w-sm mx-auto mb-4'>
                We couldn&apos;t find any dishes matching your criteria. Try a
                different search term or category.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  if (categories.length > 0) {
                    handleCategoryChange(categories[0].id);
                  }
                }}
                className='inline-flex items-center px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors'
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Chef recommendation & View All section - Mobile Optimized */}
        <div className='bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl p-4 md:p-6 mb-8'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6'>
            <div className='flex items-start flex-1'>
              <span className='flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3'>
                <IconChefHat size={20} className='text-amber-600' />
              </span>
              <div>
                <h3 className='text-base md:text-lg font-bold text-gray-900 mb-1'>
                  Chef&apos;s Recommendation
                </h3>
                <p className='text-gray-600 text-sm md:text-base'>
                  Try our chef&apos;s recommended dishes for a truly exceptional
                  dining experience.
                </p>
              </div>
            </div>

            <Link
              href='/menu'
              className='w-full md:w-auto inline-flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-sm group text-sm md:text-base'
            >
              <span>View Full Menu</span>
              <span className='ml-2 transform transition-transform duration-300 group-hover:translate-x-1'>
                <IconArrowRight size={16} strokeWidth={2} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProductId && (
        <ProductAddonsModal
          productId={selectedProductId}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedProductId(null);
          }}
        />
      )}

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

        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }

        @media (max-width: 640px) {
          .container {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>
    </section>
  );
}
