'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  X,
  ChevronRight,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Define types
interface CouponData {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  userLimit: number;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
}

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemTotal,
  } = useCart();
  const { token, user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCheckout = () => {
    // Check if user is logged in
    if (!token || !user) {
      // Show login prompt modal
      setShowLoginPrompt(true);
      return;
    }
    
    // Proceed with checkout if logged in
    setIsCheckingOut(true);
    router.push('/checkout');
  };

  const confirmClearCart = () => {
    setShowConfirmClear(false);
    clearCart();
    // Clear coupon when cart is cleared
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  };

  // Function to validate and apply coupon
  const validateCoupon = async () => {
    if (!token) {
      setCouponError('Please login to apply a coupon');
      return;
    }

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponError('');
    setIsValidatingCoupon(true);

    try {
      const response = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: getTotal(),
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate coupon');
      }

      if (data.valid) {
        setAppliedCoupon(data.coupon);

        // Calculate discount
        let discount = 0;
        if (data.coupon.discountType === 'percentage') {
          discount = (getTotal() * data.coupon.discountValue) / 100;
          // Apply max discount limit if it exists
          if (
            data.coupon.maxDiscountAmount &&
            discount > data.coupon.maxDiscountAmount
          ) {
            discount = data.coupon.maxDiscountAmount;
          }
        } else {
          // For fixed amount discount
          discount = data.coupon.discountValue;
        }

        setCouponDiscount(discount);
        setCouponError('');

        // Store coupon data in localStorage for checkout page
        localStorage.setItem('appliedCoupon', JSON.stringify(data.coupon));
        localStorage.setItem('couponDiscount', discount.toString());
      } else {
        setCouponError(data.message || 'Invalid coupon');
        setAppliedCoupon(null);
        setCouponDiscount(0);

        // Clear any stored coupon data
        localStorage.removeItem('appliedCoupon');
        localStorage.removeItem('couponDiscount');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError(
        error instanceof Error ? error.message : 'Failed to validate coupon'
      );
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');

    // Remove coupon data from localStorage
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('couponDiscount');
  };

  // Loading state with a nice animation
  if (!isClient) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-16 px-4 md:px-6 lg:px-8'>
        <div className='w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4'></div>
        <p className='text-gray-600 animate-pulse'>Loading your cart...</p>
      </div>
    );
  }

  // Empty cart state with a friendly message
  if (cart.length === 0) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-16 px-4 sm:px-6 lg:px-8'>
        <div className='text-center max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100'>
          <div className='mb-6 w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto'>
            <ShoppingBag className='h-10 w-10 sm:h-12 sm:w-12 text-amber-600' />
          </div>
          <h2 className='text-xl sm:text-2xl font-bold mb-3 text-gray-900'>
            Your cart is empty
          </h2>
          <p className='text-gray-600 mb-8 max-w-sm mx-auto text-sm sm:text-base'>
            Looks like you haven&apos;t added any delicious items to your cart
            yet. Browse our menu to find something tasty!
          </p>
          <Link
            href='/menu'
            className='inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm text-sm sm:text-base'
          >
            <ArrowLeft className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  // Calculate subtotal, tax and total
  const subtotal = getTotal();
  const taxRate = 0.09; // 9% tax
  const tax = subtotal * taxRate;
  const deliveryFee = subtotal > 50 ? 0 : 5; // Free delivery over $50
  const totalBeforeDiscount = subtotal + tax + deliveryFee;
  const total = totalBeforeDiscount - couponDiscount;

  return (
    <div className='min-h-screen bg-gray-50 pt-16 pb-24'>
      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-gray-600 text-center mb-2">
                Please login to your account to continue with checkout.
              </p>
              <p className="text-sm text-gray-500 text-center">
                You need to be logged in to place an order and track your delivery.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  router.push('/auth/login?redirect=/checkout');
                }}
                className="py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium flex-1"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6'>
        {/* Back button and page title */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8 gap-3 sm:gap-4'>
          <div>
            <Link
              href='/menu'
              className='inline-flex items-center text-sm font-medium text-gray-600 hover:text-amber-600 mb-1 sm:mb-2'
            >
              <ArrowLeft className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1' />
              Back to Menu
            </Link>
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900'>
              Your Cart
            </h1>
          </div>
          <button
            onClick={() => setShowConfirmClear(true)}
            className='text-xs sm:text-sm text-red-600 hover:text-red-800 flex items-center disabled:opacity-50 border border-red-200 py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg bg-white shadow-sm hover:bg-red-50 transition-colors self-start'
            disabled={isCheckingOut}
          >
            <Trash2 className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
            Clear Cart
          </button>
        </div>

        <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8'>
          {/* Cart Items (Takes 2/3 on large screens) */}
          <div className='lg:w-2/3 space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
              <ul className='divide-y divide-gray-200'>
                {cart.map((item) => (
                  <li key={item.id} className='p-3 sm:p-4 md:p-6'>
                    {/* NEW MOBILE-FIRST CARD DESIGN */}
                    <div className='flex flex-col gap-3 sm:gap-4'>
                      <div className='flex gap-3'>
                        {/* Item image */}
                        <div className='relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50'>
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className='object-cover object-center'
                              sizes='(max-width: 640px) 80px, 96px'
                            />
                          ) : (
                            <div className='h-full w-full flex items-center justify-center'>
                              <ShoppingBag className='h-6 w-6 sm:h-8 sm:w-8 text-gray-400' />
                            </div>
                          )}
                        </div>

                        {/* Item details - name and price */}
                        <div className='flex-1 flex flex-col'>
                          <h3 className='text-base sm:text-lg font-medium text-gray-900 line-clamp-2'>
                            {item.name}
                          </h3>
                          <p className='text-xs sm:text-sm text-gray-500 mt-0.5 mb-1'>
                            ${item.price.toFixed(2)} each
                          </p>

                          {/* Add-ons display */}
                          {item.selectedAddons &&
                            item.selectedAddons.length > 0 &&
                            item.selectedAddons.some(
                              (group) =>
                                group.options && group.options.length > 0
                            ) && (
                              <div className='mt-1 mb-2'>
                                {item.selectedAddons.map(
                                  (addonGroup, groupIndex) =>
                                    addonGroup.options &&
                                    addonGroup.options.length > 0 && (
                                      <div key={groupIndex} className='mt-1'>
                                        <p className='text-xs text-gray-600 mb-0.5'>
                                          {addonGroup.title}:
                                        </p>
                                        <ul className='pl-2'>
                                          {addonGroup.options.map(
                                            (option, optIndex) => (
                                              <li
                                                key={optIndex}
                                                className='flex justify-between text-xs'
                                              >
                                                <span className='text-gray-600'>
                                                  {option.name}
                                                </span>
                                                <span className='text-gray-700'>
                                                  +${option.price.toFixed(2)}
                                                </span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )
                                )}
                              </div>
                            )}

                          {/* Mobile price display */}
                          <div className='sm:hidden mt-auto'>
                            <p className='font-semibold text-base text-amber-600'>
                              ${getItemTotal(item).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Desktop price display */}
                        <div className='hidden sm:block'>
                          <p className='text-base sm:text-lg font-semibold text-amber-600'>
                            ${getItemTotal(item).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Controls row - quantity adjustment and remove */}
                      <div className='flex items-center justify-between mt-1 bg-gray-50 rounded-lg p-2'>
                        <div className='flex items-center'>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className='w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:text-amber-600 bg-white rounded-l-md border border-gray-200 disabled:opacity-50'
                            disabled={isCheckingOut || item.quantity <= 1}
                            aria-label='Decrease quantity'
                          >
                            <Minus className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                          </button>
                          <div className='w-9 h-8 sm:w-10 sm:h-9 flex items-center justify-center border-t border-b border-gray-200 bg-white text-sm sm:text-base'>
                            {item.quantity}
                          </div>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className='w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:text-amber-600 bg-white rounded-r-md border border-gray-200 disabled:opacity-50'
                            disabled={isCheckingOut}
                            aria-label='Increase quantity'
                          >
                            <Plus className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className='text-red-600 hover:text-red-800 flex items-center text-xs sm:text-sm font-medium disabled:opacity-50 bg-white py-1.5 px-2.5 rounded-md border border-red-100 hover:bg-red-50 transition-colors'
                          disabled={isCheckingOut}
                          aria-label='Remove item'
                        >
                          <Trash2 className='h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5' />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary (Takes 1/3 on large screens) */}
          <div className='lg:w-1/3'>
            <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 sticky top-20 lg:top-24'>
              <div className='p-4 sm:p-6'>
                <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6'>
                  Order Summary
                </h2>

                {/* Coupon code section */}
                <div className='mb-4 sm:mb-6'>
                  {!appliedCoupon ? (
                    <>
                      <div className='flex items-center mb-2'>
                        <Tag className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mr-1.5 sm:mr-2' />
                        <h3 className='font-medium text-sm sm:text-base'>
                          Apply Coupon Code
                        </h3>
                      </div>
                      <div className='flex gap-2 mb-1'>
                        <input
                          type='text'
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          placeholder='Enter coupon code'
                          className='flex-1 border border-gray-300 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                          disabled={isValidatingCoupon || isCheckingOut}
                        />
                        <button
                          onClick={validateCoupon}
                          disabled={
                            isValidatingCoupon ||
                            isCheckingOut ||
                            !couponCode.trim()
                          }
                          className='bg-amber-600 text-white rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:hover:bg-amber-600 flex items-center whitespace-nowrap'
                        >
                          {isValidatingCoupon ? (
                            <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1' />
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <p className='text-red-600 text-xs sm:text-sm flex items-center mt-1.5 sm:mt-2'>
                          <AlertCircle className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
                          {couponError}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className='bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center'>
                          <CheckCircle className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-1.5 sm:mr-2 flex-shrink-0' />
                          <div>
                            <p className='font-medium text-gray-900 text-sm sm:text-base'>
                              {appliedCoupon.code}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-600'>
                              {appliedCoupon.discountType === 'percentage'
                                ? `${appliedCoupon.discountValue}% off`
                                : `$${appliedCoupon.discountValue} off`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className='text-gray-500 hover:text-red-600 p-1'
                          disabled={isCheckingOut}
                        >
                          <X className='h-4 w-4 sm:h-5 sm:w-5' />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className='space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base'>
                  <div className='flex justify-between'>
                    <p className='text-gray-600'>
                      Subtotal (
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                      items)
                    </p>
                    <p className='font-medium'>${subtotal.toFixed(2)}</p>
                  </div>

                  <div className='flex justify-between'>
                    <p className='text-gray-600'>Tax (9%)</p>
                    <p className='font-medium'>${tax.toFixed(2)}</p>
                  </div>

                  <div className='flex justify-between'>
                    <p className='text-gray-600'>Delivery Fee</p>
                    <p className='font-medium'>
                      {deliveryFee === 0 ? (
                        <span className='text-green-600'>Free</span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </p>
                  </div>

                  {appliedCoupon && (
                    <div className='flex justify-between text-green-600'>
                      <p>Discount ({appliedCoupon.code})</p>
                      <p className='font-medium'>
                        -${couponDiscount.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className='border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4'>
                    <div className='flex justify-between items-center'>
                      <p className='text-base sm:text-lg font-bold text-gray-900'>
                        Total
                      </p>
                      <p className='text-lg sm:text-xl font-bold text-amber-600'>
                        ${total.toFixed(2)}
                      </p>
                    </div>
                    {subtotal < 50 && (
                      <p className='text-xs sm:text-sm text-amber-600 mt-1.5 sm:mt-2 italic'>
                        Add ${(50 - subtotal).toFixed(2)} more for free
                        delivery!
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className='w-full bg-amber-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm disabled:opacity-75 flex justify-center items-center text-sm sm:text-base'
                >
                  {isCheckingOut ? (
                    <>
                      <div className='w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ChevronRight className='ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5' />
                    </>
                  )}
                </button>

                <div className='mt-4 sm:mt-6 text-center'>
                  <Link
                    href='/menu'
                    className='text-xs sm:text-sm text-amber-600 hover:text-amber-800 flex items-center justify-center font-medium'
                  >
                    <ArrowLeft className='mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4' />
                    Continue Browsing Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showConfirmClear && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl'>
            <div className='flex justify-between items-center mb-4 sm:mb-6'>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900'>
                Clear your cart?
              </h3>
              <button
                onClick={() => setShowConfirmClear(false)}
                className='text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <p className='mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base'>
              Are you sure you want to remove all items from your cart? This
              action cannot be undone.
            </p>
            <div className='flex gap-3 sm:gap-4'>
              <button
                onClick={() => setShowConfirmClear(false)}
                className='flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base'
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className='flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors shadow-sm text-sm sm:text-base'
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
