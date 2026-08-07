'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';

const categories = [
  {
    id: 'all',
    name: 'All Categories',
    description: 'Browse all dishes',
    icon: '☕',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'appetizers',
    name: 'Appetizers',
    description: 'Start with something special',
    icon: '🍤',
    gradient: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'chicken dishes',
    name: 'Chicken Dishes',
    description: 'Flavorful chicken specialties',
    icon: '👨‍🍳',
    gradient: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'bread',
    name: 'Bread',
    description: 'Freshly baked bread',
    icon: '🥐',
    gradient: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'beef dishes',
    name: 'Beef Dishes',
    description: 'Premium beef selections',
    icon: '🍔',
    gradient: 'from-red-400 to-pink-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'grilled dishes',
    name: 'Grilled Dishes',
    description: 'Perfectly grilled items',
    icon: '🍖',
    gradient: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'seafood dishes',
    name: 'Seafood Dishes',
    description: 'Fresh seafood specialties',
    icon: '🐟',
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'rolls/wraps',
    name: 'Rolls/Wraps',
    description: 'Delicious wraps and rolls',
    icon: '🌯',
    gradient: 'from-green-400 to-teal-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'vegetable dishes',
    name: 'Vegetable Dishes',
    description: 'Fresh vegetable dishes',
    icon: '🥕',
    gradient: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'lamb/goat dishes',
    name: 'Lamb/Goat Dishes',
    description: 'Traditional lamb and goat',
    icon: '🍖',
    gradient: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'rice dishes',
    name: 'Rice Dishes',
    description: 'Aromatic rice specialties',
    icon: '🍚',
    gradient: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet indulgences',
    icon: '🍦',
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    id: 'goat biryani',
    name: 'Goat Biryani',
    description: 'Aromatic goat biryani',
    icon: '🍛',
    gradient: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'chicken biryani',
    name: 'Chicken Biryani',
    description: 'Traditional chicken biryani',
    icon: '🍗',
    gradient: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'vegetable biryani',
    name: 'Vegetable Biryani',
    description: 'Flavorful vegetable biryani',
    icon: '🥬',
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Refreshing drinks',
    icon: '🥤',
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
];

export default function MenuHighlights() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <section className='py-8 md:py-16 relative overflow-hidden bg-gradient-to-b from-amber-50/50 to-white'>
      {/* Decorative Background Elements */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
        <div className='absolute top-24 right-10 w-72 h-72 bg-amber-100 rounded-full opacity-30 blur-3xl'></div>
        <div className='absolute -bottom-40 -left-20 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl'></div>
        <div className='absolute top-1/3 left-1/4 w-6 h-6 bg-amber-400 rounded-full opacity-60'></div>
        <div className='absolute top-2/3 right-1/3 w-4 h-4 bg-amber-500 rounded-full opacity-60'></div>
        <div className='absolute bottom-20 right-20 w-8 h-8 bg-amber-300 rounded-full opacity-70'></div>
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Section Header */}
        <div className='text-center max-w-4xl mx-auto mb-8 md:mb-12'>
          <div className='inline-flex items-center justify-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-6'>
            <Sparkles className='h-4 w-4 mr-2' />
            <span className='text-xs font-bold tracking-wider uppercase'>
              Culinary Categories
            </span>
          </div>

          <h2 className='text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4'>
            <span className='relative'>
              <span className='relative z-10'>Explore Our </span>
              <span className='absolute bottom-2 left-0 w-full h-3 bg-amber-200 opacity-60 -z-10'></span>
            </span>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800'>
              Menu Categories
            </span>
          </h2>

          <p className='max-w-2xl mx-auto text-sm md:text-lg text-gray-600'>
            Discover our diverse collection of authentic dishes, carefully
            crafted with traditional recipes and premium ingredients
          </p>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className='relative'>
          {/* Navigation Buttons - Hidden on mobile */}
          <button
            onClick={scrollLeft}
            className='absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110'
            aria-label='Scroll left'
          >
            <ChevronLeft className='h-5 w-5 text-gray-600' />
          </button>

          <button
            onClick={scrollRight}
            className='absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110'
            aria-label='Scroll right'
          >
            <ChevronRight className='h-5 w-5 text-gray-600' />
          </button>

          {/* Scrollable Categories Container */}
          <div
            ref={scrollContainerRef}
            className='flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-12 py-4'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/menu?category=${encodeURIComponent(category.id)}`}
                className='group flex-shrink-0 text-center transition-all duration-300 hover:scale-105'
              >
                <div className='relative mb-3'>
                  {/* Circular Card */}
                  <div
                    className={`
                    w-22 h-22 md:w-20 md:h-20 lg:w-24 lg:h-24 
                    ${category.bgColor} ${category.borderColor}
                    border-2 rounded-full 
                    flex items-center justify-center 
                    mx-auto relative overflow-hidden
                    group-hover:shadow-xl group-hover:border-opacity-50
                    transition-all duration-500 ease-out
                    group-hover:bg-gradient-to-br group-hover:${category.gradient}
                  `}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div
                      className={`
                      absolute inset-0 bg-gradient-to-br ${category.gradient} 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full
                    `}
                    ></div>

                    {/* Icon */}
                    <span className='text-3xl md:text-4xl lg:text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300'>
                      {category.icon}
                    </span>

                    {/* Sparkle Effect */}
                    <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                      <div className='absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping'></div>
                      <div className='absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200'></div>
                      <div className='absolute top-1/2 left-1 w-0.5 h-0.5 bg-white rounded-full animate-ping animation-delay-400'></div>
                    </div>
                  </div>

                  {/* Floating Badge for Popular Categories */}
                  {(index === 0 ||
                    index === 2 ||
                    index === 4 ||
                    index === 11) && (
                    <div className='absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <span className='font-bold'>★</span>
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <div className='space-y-1'>
                  <h3 className='font-semibold text-xs md:text-sm lg:text-base text-gray-800 group-hover:text-amber-600 transition-colors duration-300'>
                    {category.name}
                  </h3>
                  <p className='text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block'>
                    {category.description}
                  </p>
                </div>

                {/* Ripple Effect */}
                <div className='absolute inset-0 rounded-full bg-amber-200 opacity-0 scale-0 group-hover:scale-150 group-hover:opacity-20 transition-all duration-700 pointer-events-none'></div>
              </Link>
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className='flex justify-center mt-6 space-x-2'>
            {Array.from({ length: Math.ceil(categories.length / 6) }).map(
              (_, index) => (
                <div
                  key={index}
                  className='w-2 h-2 rounded-full bg-amber-200 opacity-50 transition-all duration-300 hover:opacity-100'
                ></div>
              )
            )}
          </div>
        </div>

        {/* View Full Menu Button */}
        <div className='text-center mt-8 md:mt-12'>
          <Link
            href='/menu'
            className='relative inline-flex group items-center justify-center px-6 md:px-8 py-3 md:py-4 overflow-hidden font-medium transition-all bg-gradient-to-r from-amber-500 to-amber-600 rounded-full hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          >
            <span className='absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease'></span>
            <span className='relative flex items-center text-sm md:text-base'>
              <span className='mr-2 md:mr-4'>View Full Menu</span>
              <svg
                className='w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ease-in-out group-hover:translate-x-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 8l4 4m0 0l-4 4m4-4H3'
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* CSS for responsive utilities */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
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
