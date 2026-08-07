'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  Star,
  Clock,
  Share2,
  Truck,
  Shield,
  Check,
  ChevronRight,
  Award,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import ProductAddonsModal from '@/components/modals/ProductAddonsModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  addonGroups?: {
    title: string;
    required: boolean;
    options: {
      name: string;
      price: number;
    }[];
  }[];
}

export default function ProductDetails() {
  const params = useParams();
  const { id, category } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch product details
        const response = await fetch(`${API_URL}/api/products/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }

        const productData = await response.json();
        setProduct(productData);

        // Fetch related products (same category)
        const relatedProductsResponse = await fetch(
          `${API_URL}/api/products?category=${category}`
        );

        if (relatedProductsResponse.ok) {
          const allProducts = await relatedProductsResponse.json();
          // Filter out the current product and limit to 4 items
          const filtered = allProducts
            .filter((item: Product) => item._id !== id)
            .slice(0, 4);

          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Unable to load product details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, category]);

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (product) {
      // Check if product has addons
      const hasAddons = product.addonGroups && product.addonGroups.length > 0;

      if (hasAddons) {
        // Show addon modal
        setShowModal(true);
      } else {
        // Add directly to cart without addons
        addToCart({
          id: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image?.url,
        });

        // Show success toast for direct add (no addons)
        toast.success(`${product.name} added to cart`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center p-4 pt-20'>
        <div className='bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100'>
          <div className='flex flex-col items-center'>
            <div className='relative'>
              <div className='w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4'></div>
              <div className='absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-300 rounded-full animate-spin animation-delay-200'></div>
            </div>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>
              Loading Product
            </h2>
            <p className='text-gray-500 text-center'>
              Preparing your delicious dish details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-amber-50/30 to-white flex items-center justify-center p-4 pt-20'>
        <div className='bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md text-center border border-gray-100'>
          <div className='w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <ShoppingBag className='h-8 w-8 text-gray-400' />
          </div>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>
            Product Not Found
          </h2>
          <p className='text-gray-600 mb-6'>
            {error || 'Sorry, this product is currently unavailable'}
          </p>
          <Link
            href='/menu'
            className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 shadow-md'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='bg-gradient-to-b from-amber-50/30 to-white min-h-screen pt-16'>
        {/* Navigation breadcrumbs - Mobile Optimized */}
        <div className='bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-16 z-20'>
          <div className='container mx-auto px-4 py-3'>
            <div className='flex items-center justify-between'>
              <div className='flex text-xs md:text-sm items-center space-x-1 text-gray-500 overflow-hidden'>
                <Link
                  href='/'
                  className='hover:text-amber-500 transition-colors'
                >
                  Home
                </Link>
                <ChevronRight className='h-3 w-3' />
                <Link
                  href='/menu'
                  className='hover:text-amber-500 transition-colors'
                >
                  Menu
                </Link>
                <ChevronRight className='h-3 w-3' />
                <Link
                  href={`/menu/${category}`}
                  className='hover:text-amber-500 transition-colors hidden sm:inline'
                >
                  {typeof category === 'string'
                    ? category.charAt(0).toUpperCase() + category.slice(1)
                    : 'Category'}
                </Link>
                <ChevronRight className='h-3 w-3 hidden sm:inline' />
                <span className='text-gray-700 font-medium truncate'>
                  {product.name}
                </span>
              </div>
              <Link
                href='/menu'
                className='flex items-center text-gray-600 hover:text-amber-600 transition-colors'
              >
                <ArrowLeft className='h-4 w-4 mr-1' />
                <span className='text-sm hidden sm:inline'>Back</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Product Content - Mobile First Design */}
        <div className='container mx-auto px-4 py-4 md:py-6'>
          <div className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100'>
            <div className='flex flex-col lg:flex-row'>
              {/* Product Image Section - Mobile Optimized */}
              <div className='lg:w-2/5'>
                <div className='relative'>
                  <div className='relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200'>
                    {product.image && product.image.url ? (
                      <Image
                        src={product.image.url}
                        alt={product.name}
                        fill
                        className='object-cover'
                        sizes='(max-width: 1024px) 100vw, 40vw'
                        priority
                      />
                    ) : (
                      <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
                        <ShoppingBag className='h-16 w-16 text-gray-300' />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:hidden'></div>

                    {/* Action Buttons - Mobile Optimized */}
                    <div className='absolute top-3 right-3 flex flex-col gap-2'>
                      <button className='bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all hover:scale-110'>
                        <Share2 className='h-4 w-4 text-gray-600' />
                      </button>
                      <button className='bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all hover:scale-110'>
                        <Heart className='h-4 w-4 text-gray-600' />
                      </button>
                    </div>

                    {/* Featured Badge */}
                    <div className='absolute top-3 left-3'>
                      <div className='bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full flex items-center shadow-md'>
                        <Award className='h-3 w-3 mr-1' />
                        <span className='text-xs font-bold'>Popular</span>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    <div className='absolute bottom-3 left-3 lg:hidden'>
                      <div className='bg-red-500 text-white px-3 py-1 rounded-full shadow-md'>
                        <span className='text-sm font-bold'>20% OFF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Section - Mobile Optimized */}
              <div className='lg:w-3/5 p-4 md:p-6 lg:p-8'>
                {/* Product Header */}
                <div className='mb-4 pb-4 border-b border-gray-100'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight'>
                        {product.name}
                      </h1>

                      <div className='flex items-center space-x-4 mb-3'>
                        <div className='flex items-center'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= 4
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                          <span className='ml-2 text-sm text-gray-600 font-medium'>
                            4.0 ({Math.floor(Math.random() * 30) + 10})
                          </span>
                        </div>
                      </div>

                      <div className='inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium'>
                        <Sparkles className='h-3 w-3 mr-1' />
                        {product.category}
                      </div>
                    </div>
                  </div>

                  {/* Price Section - Mobile Optimized */}
                  <div className='bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <span className='text-2xl md:text-3xl font-bold text-gray-900'>
                          ${product.price.toFixed(2)}
                        </span>
                        <span className='text-lg text-gray-500 line-through'>
                          ${(product.price * 1.2).toFixed(2)}
                        </span>
                        <span className='bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold'>
                          20% OFF
                        </span>
                      </div>
                    </div>
                    <p className='text-xs text-gray-600 mt-2'>
                      Price inclusive of all taxes • Limited time offer
                    </p>
                  </div>
                </div>

                {/* Quick Features - Mobile Optimized */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6'>
                  <div className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100'>
                    <div className='bg-green-100 p-2 rounded-full'>
                      <Truck className='h-4 w-4 text-green-600' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-green-800'>
                        Fast Delivery
                      </h3>
                      <p className='text-xs text-green-600'>15-20 minutes</p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100'>
                    <div className='bg-blue-100 p-2 rounded-full'>
                      <Shield className='h-4 w-4 text-blue-600' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-blue-800'>
                        Fresh Made
                      </h3>
                      <p className='text-xs text-blue-600'>Daily preparation</p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-100'>
                    <div className='bg-amber-100 p-2 rounded-full'>
                      <Award className='h-4 w-4 text-amber-600' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-amber-800'>
                        Premium
                      </h3>
                      <p className='text-xs text-amber-600'>Quality assured</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    Description
                  </h3>
                  <p className='text-gray-700 leading-relaxed text-sm md:text-base'>
                    {product.description}
                  </p>
                </div>

                {/* Key Features */}
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    What Makes It Special
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {[
                      'Freshly prepared in our kitchen',
                      'Locally sourced ingredients',
                      'No artificial preservatives',
                      'Authentic traditional recipe',
                      'Chef recommended dish',
                      'Perfect for sharing',
                    ].map((feature, index) => (
                      <div key={index} className='flex items-start space-x-3'>
                        <div className='bg-amber-100 p-1 rounded-full mt-0.5'>
                          <Check className='h-3 w-3 text-amber-600' />
                        </div>
                        <span className='text-sm text-gray-700'>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Quantity & Add to Cart */}
                <div className='hidden lg:block'>
                  <div className='flex items-center space-x-4 mb-4'>
                    <div className='flex items-center border-2 border-gray-200 rounded-lg overflow-hidden'>
                      <button
                        onClick={decreaseQuantity}
                        className='px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors'
                      >
                        <Minus className='h-4 w-4' />
                      </button>
                      <div className='px-6 py-3 bg-white font-semibold text-lg'>
                        {quantity}
                      </div>
                      <button
                        onClick={increaseQuantity}
                        className='px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors'
                      >
                        <Plus className='h-4 w-4' />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className='flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg px-8 py-3 flex items-center justify-center transition-all transform hover:scale-105 shadow-md'
                    >
                      <ShoppingBag className='h-5 w-5 mr-2' />
                      ADD TO CART
                    </button>
                  </div>

                  <div className='flex items-center space-x-6 text-sm text-gray-600'>
                    <div className='flex items-center'>
                      <Shield className='h-4 w-4 mr-1 text-amber-500' />
                      <span>Secure transaction</span>
                    </div>
                    <div className='flex items-center'>
                      <Clock className='h-4 w-4 mr-1 text-amber-500' />
                      <span>Fast delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quantity Controls - Shown only on mobile */}
          <div className='lg:hidden mt-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100'>
            <div className='flex items-center space-x-3'>
              <div className='flex items-center border-2 border-gray-200 rounded-lg overflow-hidden'>
                <button
                  onClick={decreaseQuantity}
                  className='px-3 py-2 bg-gray-50 text-gray-700'
                >
                  <Minus className='h-4 w-4' />
                </button>
                <div className='px-4 py-2 bg-white font-semibold'>
                  {quantity}
                </div>
                <button
                  onClick={increaseQuantity}
                  className='px-3 py-2 bg-gray-50 text-gray-700'
                >
                  <Plus className='h-4 w-4' />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className='flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg px-4 py-2 flex items-center justify-center'
              >
                <ShoppingBag className='h-4 w-4 mr-2' />
                ADD TO CART
              </button>
            </div>
          </div>

          {/* Reviews Section - Mobile Optimized */}
          <div className='mt-6 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg md:text-xl font-bold text-gray-900'>
                Customer Reviews
              </h2>
              <div className='flex items-center bg-amber-50 px-3 py-1 rounded-full'>
                <div className='flex mr-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= 4
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className='text-sm font-semibold text-amber-800'>
                  4.0
                </span>
              </div>
            </div>

            <div className='space-y-4'>
              {[
                {
                  name: 'Sarah T.',
                  date: '2 days ago',
                  rating: 5,
                  comment:
                    'This dish is absolutely amazing! The flavors blend perfectly and the portion size is generous. Will definitely order again.',
                  title: 'Delicious!',
                },
                {
                  name: 'Michael P.',
                  date: '1 week ago',
                  rating: 4,
                  comment:
                    'Great taste and quick delivery. Could use a bit more seasoning for my preference, but overall very good.',
                  title: 'Very good',
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className='p-4 bg-gray-50 rounded-xl border border-gray-100'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm mr-3'>
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-900 text-sm'>
                          {review.name}
                        </h4>
                        <div className='flex items-center mt-1'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={
                                star <= review.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className='text-xs text-gray-500'>{review.date}</span>
                  </div>
                  <h5 className='font-semibold text-gray-800 mb-1'>
                    {review.title}
                  </h5>
                  <p className='text-sm text-gray-700 leading-relaxed'>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>

            <button className='mt-4 w-full sm:w-auto bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium py-2 px-4 rounded-lg transition-colors'>
              View all reviews
            </button>
          </div>

          {/* Similar Products - Mobile Optimized */}
          {relatedProducts.length > 0 && (
            <div className='mt-6 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg md:text-xl font-bold text-gray-900'>
                  You Might Also Like
                </h2>
                <Link
                  href='/menu'
                  className='text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center'
                >
                  View All
                  <ChevronRight className='h-4 w-4 ml-1' />
                </Link>
              </div>

              <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
                {relatedProducts.map((item) => (
                  <Link
                    href={`/menu/${item.category.toLowerCase()}/${item._id}`}
                    key={item._id}
                    className='group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
                  >
                    <div className='relative h-24 sm:h-32 lg:h-36'>
                      {item.image && item.image.url ? (
                        <Image
                          src={item.image.url}
                          alt={item.name}
                          fill
                          className='object-cover group-hover:scale-110 transition-transform duration-300'
                          sizes='(max-width: 640px) 50vw, 25vw'
                        />
                      ) : (
                        <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                          <ShoppingBag className='h-6 w-6 text-gray-300' />
                        </div>
                      )}
                      <div className='absolute top-1 right-1'>
                        <span className='bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-md font-bold'>
                          20% OFF
                        </span>
                      </div>
                    </div>

                    <div className='p-2 md:p-3'>
                      <h3 className='text-xs md:text-sm font-semibold text-gray-900 line-clamp-1 mb-1'>
                        {item.name}
                      </h3>
                      <div className='flex justify-between items-center'>
                        <div>
                          <span className='text-sm md:text-base font-bold text-gray-900'>
                            ${item.price.toFixed(2)}
                          </span>
                          <span className='text-xs text-gray-500 line-through ml-1'>
                            ${(item.price * 1.2).toFixed(2)}
                          </span>
                        </div>
                        <button className='text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 p-1 rounded-full transition-colors'>
                          <Plus className='h-3 w-3 md:h-4 md:w-4' />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Spacer for mobile CTA */}
          <div className='h-20 lg:hidden'></div>
        </div>

        {/* Mobile Fixed Bottom CTA */}
        <div className='fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-30'>
          <button
            onClick={handleAddToCart}
            className='w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl px-4 py-4 flex items-center justify-center text-lg shadow-lg'
          >
            <ShoppingBag className='h-5 w-5 mr-2' />
            ADD TO CART - ${(product.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>

      {/* ProductAddonsModal */}
      {showModal && (
        <ProductAddonsModal
          productId={product._id}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
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
    </>
  );
}
