'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Star,
  ChevronRight,
  Award,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import ProductAddonsModal from '../modals/ProductAddonsModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ProductData {
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const handleAddToCart = (product: ProductData) => {
    // Set the selected product ID and open the modal
    setSelectedProductId(product._id);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }

        const data = await response.json();

        // Get 4 random products from the returned data
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 4);

        setProducts(featured);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError('Unable to load featured products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className='py-12 md:py-16 bg-gradient-to-b from-amber-50/30 to-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <span className='inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs tracking-wider uppercase mb-3'>
              Chef&apos;s Selection
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Featured Dishes
            </h2>
            <div className='flex justify-center space-x-2'>
              <div className='w-3 h-3 bg-amber-500 rounded-full animate-pulse'></div>
              <div className='w-3 h-3 bg-amber-500 rounded-full animate-pulse animation-delay-200'></div>
              <div className='w-3 h-3 bg-amber-500 rounded-full animate-pulse animation-delay-400'></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show the section if there's an error or no products
  }

  return (
    <section className='py-8 md:py-16 relative overflow-hidden bg-gradient-to-b from-amber-50/30 to-white'>
      {/* Decorative background elements */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-20 right-[10%] w-64 h-64 bg-amber-100 rounded-full opacity-30 blur-3xl'></div>
        <div className='absolute -bottom-32 -left-16 w-72 h-72 bg-amber-200 rounded-full opacity-20 blur-3xl'></div>
        <div className='absolute bottom-40 right-20 w-8 h-8 bg-amber-300 rounded-full opacity-30'></div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-2xl mx-auto text-center mb-12'>
          <span className='inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs tracking-wider uppercase mb-3'>
            <Sparkles className='inline-block w-3.5 h-3.5 mr-2' />
            Chef&apos;s Selection
          </span>

          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800'>
              Featured Dishes
            </span>
          </h2>

          <p className='text-gray-600 md:text-lg'>
            Discover our chef&apos;s selection of exceptional dishes, crafted
            with the finest ingredients for a memorable dining experience
          </p>
        </div>

        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 mb-12'>
          {products.map((product, index) => (
            <div
              key={product._id}
              className={`group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 h-full flex flex-col transform hover:-translate-y-1 ${
                index % 2 === 1 ? 'md:translate-y-6' : ''
              }`}
            >
              <div className='relative h-32 sm:h-40 md:h-48 overflow-hidden'>
                {product.image && product.image.url ? (
                  <Image
                    src={product.image.url}
                    alt={product.name}
                    fill
                    sizes='(max-width: 640px) 50vw, (max-width: 768px) 50vw, 25vw'
                    className='object-cover transition-transform duration-700 group-hover:scale-110'
                  />
                ) : (
                  <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                    <ShoppingBag className='h-8 w-8 md:h-12 md:w-12 text-gray-400' />
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent'></div>

                {/* Featured badge - Mobile Optimized */}
                <div className='absolute top-1.5 right-1.5 md:top-3 md:right-3 z-10'>
                  <div className='px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-full flex items-center shadow-md'>
                    <Award className='h-2.5 w-2.5 md:h-3.5 md:w-3.5 mr-1 md:mr-1.5' />
                    <span className='text-xs font-bold hidden sm:inline'>
                      Featured
                    </span>
                  </div>
                </div>

                {/* Quick add button - Mobile Optimized */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className='absolute bottom-1.5 right-1.5 md:bottom-3 md:right-3 p-1.5 md:p-2 bg-white rounded-full text-amber-500 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-500 hover:text-white transform group-hover:translate-y-0 translate-y-4'
                  aria-label='Add to cart'
                >
                  <PlusCircle className='h-4 w-4 md:h-5 md:w-5' />
                </button>
              </div>

              <div className='p-2.5 md:p-4 flex-grow flex flex-col'>
                <Link
                  href={`/menu/${product.category.toLowerCase()}/${
                    product._id
                  }`}
                  className='text-sm md:text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-amber-600 transition-colors'
                >
                  {product.name}
                </Link>

                <div className='flex items-center mb-2 text-amber-500'>
                  <Star className='h-3 w-3 md:h-4 md:w-4 fill-current' />
                  <Star className='h-3 w-3 md:h-4 md:w-4 fill-current' />
                  <Star className='h-3 w-3 md:h-4 md:w-4 fill-current' />
                  <Star className='h-3 w-3 md:h-4 md:w-4 fill-current' />
                  <Star className='h-3 w-3 md:h-4 md:w-4 fill-current opacity-40' />
                </div>

                <p className='text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 flex-grow'>
                  {product.description}
                </p>

                <div className='flex justify-between items-center mb-2 md:mb-4'>
                  <span className='text-amber-600 font-bold text-base md:text-xl'>
                    ${product.price.toFixed(2)}
                  </span>
                  <Link
                    href={`/menu/${product.category.toLowerCase()}`}
                    className='px-2 py-1 md:px-3 md:py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-medium rounded-full transition-colors'
                  >
                    <span className='hidden sm:inline'>{product.category}</span>
                    <span className='sm:hidden'>
                      {product.category.slice(0, 3)}
                    </span>
                  </Link>
                </div>

                <div className='flex flex-col sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2'>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className='px-2 py-2 sm:px-4 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors text-xs md:text-sm flex justify-center items-center'
                  >
                    <ShoppingBag className='h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5' />
                    <span className='hidden sm:inline'>Add to Cart</span>
                    <span className='sm:hidden'>Add</span>
                  </button>
                  <Link
                    href={`/menu/${product.category.toLowerCase()}/${
                      product._id
                    }`}
                    className='px-2 py-2 sm:px-4 sm:py-2.5 border border-amber-200 text-amber-600 hover:bg-amber-50 font-medium rounded-lg transition-colors text-xs md:text-sm text-center'
                  >
                    <span className='hidden sm:inline'>View Details</span>
                    <span className='sm:hidden'>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='text-center'>
          <Link
            href='/menu'
            className='inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-sm group'
          >
            <span>Explore Full Menu</span>
            <ChevronRight className='ml-1.5 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1' />
          </Link>
        </div>
      </div>

      {/* Add the modal at the end of the component */}
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

      {/* CSS for animation delays */}
      <style jsx global>{`
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
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
      `}</style>
    </section>
  );
}
