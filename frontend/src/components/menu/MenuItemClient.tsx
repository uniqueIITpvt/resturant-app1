'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ChevronRight, Layers, Star, ShoppingBag } from 'lucide-react';
import ProductAddonsModal from '../modals/ProductAddonsModal';

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

export function MenuItemClient({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasAddons = item.addonGroups && item.addonGroups.length > 0;

  const handleAddToCart = () => {
    if (hasAddons) {
      setShowModal(true);
    } else {
      setIsAddingToCart(true);

      addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image?.url,
      });

      // Show animation effect for a brief moment
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 600);
    }
  };

  return (
    <>
      <div
        className='group relative bg-white overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image container with animated overlay */}
        <div className='relative w-full aspect-[4/3] overflow-hidden'>
          <Link
            href={`/menu/${item.category}/${item._id}`}
            className='block h-full'
          >
            <Image
              src={item.image?.url || '/menu-placeholder.jpg'}
              alt={item.name}
              fill
              className={`object-cover transition-all duration-700 ${
                isHovered ? 'scale-110 filter brightness-90' : ''
              }`}
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            ></div>
          </Link>

          {/* Badges */}
          <div className='absolute top-4 left-4 z-10 flex flex-col gap-2'>
            {item.isPopular && (
              <div className='flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-xs font-medium transform transition-transform duration-300 hover:scale-105'>
                <Star className='w-3 h-3' />
                <span>Popular</span>
              </div>
            )}
            {item.isVegetarian && (
              <div className='flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium transform transition-transform duration-300 hover:scale-105'>
                <span>Vegetarian</span>
              </div>
            )}
          </div>

          {/* Price tag with stylish design */}
          <div className='absolute top-4 right-4 z-10'>
            <div className='px-3 py-2 rounded-full bg-white shadow-md text-amber-600 font-bold'>
              ${item.price.toFixed(2)}
            </div>
          </div>

          {/* Quick action buttons that appear on hover */}
          <div
            className={`absolute bottom-4 right-4 z-10 transition-all duration-300 ${
              isHovered
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-4'
            }`}
          >
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`flex items-center justify-center p-3 rounded-full shadow-lg transition-all duration-300 ${
                isAddingToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {isAddingToCart ? (
                <span className='animate-pulse'>✓</span>
              ) : (
                <ShoppingBag className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>

        {/* Content section */}
        <div className='p-5'>
          <Link href={`/menu/${item.category}/${item._id}`}>
            <h3 className='text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors'>
              {item.name}
            </h3>
          </Link>

          <p className='mt-2 text-gray-600 text-sm line-clamp-2'>
            {item.description}
          </p>

          {/* Addon indicator and action row */}
          <div className='mt-4 flex items-center justify-between'>
            {hasAddons ? (
              <div className='flex items-center text-amber-700'>
                <Layers className='h-4 w-4 mr-1' />
                <span className='text-xs font-medium'>Customizable</span>
              </div>
            ) : (
              <div className='h-4'></div> /* Empty space holder for alignment */
            )}

            <Link
              href={`/menu/${item.category}/${item._id}`}
              className='inline-flex items-center text-sm font-medium px-4 py-2 rounded-full bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 transition-colors'
            >
              Details <ChevronRight className='h-4 w-4 ml-1' />
            </Link>
          </div>
        </div>

        {/* Bottom action bar for customize button */}
        {hasAddons && (
          <div
            className={`px-5 py-3 border-t border-gray-100 transition-all duration-300 ${
              isHovered ? 'bg-amber-50' : 'bg-white'
            }`}
          >
            <button
              onClick={() => setShowModal(true)}
              className='w-full py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium transition-colors flex items-center justify-center'
            >
              Customize Options <Layers className='ml-2 h-4 w-4' />
            </button>
          </div>
        )}
      </div>

      {/* Product Addons Modal */}
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
