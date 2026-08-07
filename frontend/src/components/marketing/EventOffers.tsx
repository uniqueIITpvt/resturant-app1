'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ShoppingBag,
  Percent,
  Clock,
  Tag,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface EventOffer {
  _id: string;
  name: string;
  description: string;
  banner: {
    public_id: string;
    url: string;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  offerType: 'discount' | 'special' | 'seasonal' | 'holiday';
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  couponCode: string;
}

export default function EventOffers() {
  const [eventOffers, setEventOffers] = useState<EventOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Fetch active event offers
  useEffect(() => {
    const fetchEventOffers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/event-offers/active`);

        if (!response.ok) {
          throw new Error('Failed to fetch event offers');
        }

        const data = await response.json();
        setEventOffers(data.data || []);
      } catch (error) {
        console.error('Error fetching event offers:', error);
        setError('Unable to load current promotions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventOffers();
  }, []);

  // Auto slide functionality
  useEffect(() => {
    if (eventOffers.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === eventOffers.length - 1 ? 0 : prev + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [eventOffers]);

  // Reset copied code after 3 seconds
  useEffect(() => {
    if (!copiedCode) return;

    const timeout = setTimeout(() => {
      setCopiedCode(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [copiedCode]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && eventOffers.length > 1) {
      goToNextSlide();
    }
    if (isRightSwipe && eventOffers.length > 1) {
      goToPrevSlide();
    }
  };

  // Track offer click
  const handleOfferClick = async (offerId: string) => {
    try {
      await fetch(`${API_URL}/api/event-offers/${offerId}/track-click`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking offer click:', error);
    }
  };

  // Copy coupon code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedCode(code);
        toast.success('Coupon code copied!');
      })
      .catch((err) => {
        console.error('Failed to copy code:', err);
        toast.error('Failed to copy code');
      });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining for an offer
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Navigate to next slide
  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev === eventOffers.length - 1 ? 0 : prev + 1));
  };

  // Navigate to previous slide
  const goToPrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? eventOffers.length - 1 : prev - 1));
  };

  // Get offer type styles
  const getOfferTypeStyles = (offerType: string) => {
    switch (offerType) {
      case 'discount':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          badge: 'bg-red-50 text-red-700 border-red-200',
          icon: <Percent className='w-3 h-3 sm:w-4 sm:h-4' />,
        };
      case 'special':
        return {
          bg: 'bg-purple-500',
          text: 'text-purple-600',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <Flame className='w-3 h-3 sm:w-4 sm:h-4' />,
        };
      case 'seasonal':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600',
          badge: 'bg-green-50 text-green-700 border-green-200',
          icon: <Calendar className='w-3 h-3 sm:w-4 sm:h-4' />,
        };
      case 'holiday':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600',
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <Tag className='w-3 h-3 sm:w-4 sm:h-4' />,
        };
      default:
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          badge: 'bg-red-50 text-red-700 border-red-200',
          icon: <Percent className='w-3 h-3 sm:w-4 sm:h-4' />,
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className='py-6 sm:py-8 md:py-12 lg:py-16'>
        <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8'>
          <div className='bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center'>
            <div className='inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mb-3 sm:mb-4'></div>
            <p className='text-gray-600 text-sm sm:text-base'>
              Loading special offers...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Error or no offers
  if (error || eventOffers.length === 0) {
    return null;
  }

  return (
    <section className='py-6 sm:py-8 md:py-12 lg:py-16 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-6 sm:mb-8 md:mb-12'>
          <div className='inline-flex items-center justify-center bg-amber-100 text-amber-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6'>
            <Flame className='w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2' />
            <span className='text-xs sm:text-xs font-bold tracking-wider uppercase'>
              Special Offers
            </span>
          </div>
          <h2 className='text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4 md:mb-6'>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800'>
              Limited Time Deals
            </span>
          </h2>
          <p className='text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4'>
            Don&apos;t miss out on our exclusive offers and seasonal promotions
          </p>
        </div>

        {/* Offers Container */}
        <div className='relative'>
          {/* Desktop Navigation */}
          {eventOffers.length > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className='hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors'
                style={{ marginLeft: '-20px' }}
              >
                <ChevronLeft className='w-5 h-5 text-gray-600' />
              </button>
              <button
                onClick={goToNextSlide}
                className='hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors'
                style={{ marginRight: '-20px' }}
              >
                <ChevronRight className='w-5 h-5 text-gray-600' />
              </button>
            </>
          )}

          {/* Offers Carousel */}
          <div
            className='overflow-hidden rounded-xl sm:rounded-2xl'
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className='flex transition-transform duration-500 ease-out'
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {eventOffers.map((offer) => {
                const offerTypeStyle = getOfferTypeStyles(offer.offerType);
                const daysRemaining = getDaysRemaining(offer.endDate);

                return (
                  <div key={offer._id} className='w-full flex-shrink-0'>
                    <div className='bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden'>
                      {/* Mobile Layout */}
                      <div className='block lg:hidden'>
                        {/* Mobile Image */}
                        <div className='relative h-40 sm:h-48'>
                          {offer.banner.url ? (
                            <Image
                              src={offer.banner.url}
                              alt={offer.name}
                              fill
                              className='object-cover'
                              sizes='100vw'
                            />
                          ) : (
                            <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                              <span className='text-gray-500 font-medium text-sm sm:text-base'>
                                {offer.name}
                              </span>
                            </div>
                          )}

                          {/* Mobile Badges */}
                          <div className='absolute top-2 sm:top-3 left-2 sm:left-3'>
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${offerTypeStyle.badge}`}
                            >
                              {offerTypeStyle.icon}
                              <span className='ml-1 capitalize'>
                                {offer.offerType}
                              </span>
                            </div>
                          </div>

                          <div className='absolute top-2 sm:top-3 right-2 sm:right-3'>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                                daysRemaining <= 3
                                  ? 'bg-amber-500'
                                  : 'bg-black/50'
                              }`}
                            >
                              {daysRemaining}d left
                            </div>
                          </div>
                        </div>

                        {/* Mobile Content */}
                        <div className='p-3 sm:p-4'>
                          <h3 className='text-base sm:text-lg font-bold text-gray-900 mb-2'>
                            {offer.name}
                          </h3>
                          <p className='text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2'>
                            {offer.description}
                          </p>

                          {/* Mobile Discount */}
                          {offer.discountType !== 'none' &&
                            offer.discountValue > 0 && (
                              <div
                                className={`${offerTypeStyle.bg} text-white rounded-lg p-3 mb-3 sm:mb-4`}
                              >
                                <div className='flex items-center'>
                                  <div className='bg-white/20 p-1.5 rounded mr-2 sm:mr-3'>
                                    <Percent className='w-3 h-3 sm:w-4 sm:h-4' />
                                  </div>
                                  <div>
                                    <p className='font-bold text-sm sm:text-lg'>
                                      {offer.discountType === 'percentage'
                                        ? `${offer.discountValue}% OFF`
                                        : `$${offer.discountValue} OFF`}
                                    </p>
                                    {offer.maxDiscountAmount && (
                                      <p className='text-xs opacity-90'>
                                        Max: ${offer.maxDiscountAmount}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Mobile Coupon */}
                          {offer.couponCode && (
                            <div className='bg-gray-50 rounded-lg p-3 mb-3 sm:mb-4'>
                              <p className='text-xs text-gray-600 mb-2'>
                                Coupon Code:
                              </p>
                              <div className='flex'>
                                <input
                                  type='text'
                                  value={offer.couponCode}
                                  readOnly
                                  className='flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-l-lg bg-white'
                                />
                                <button
                                  onClick={() =>
                                    handleCopyCode(offer.couponCode)
                                  }
                                  className={`px-2 sm:px-3 py-2 rounded-r-lg text-white text-xs sm:text-sm ${
                                    copiedCode === offer.couponCode
                                      ? 'bg-green-500'
                                      : 'bg-gray-800 hover:bg-gray-700'
                                  }`}
                                >
                                  {copiedCode === offer.couponCode ? (
                                    <Check className='w-3 h-3 sm:w-4 sm:h-4' />
                                  ) : (
                                    <Copy className='w-3 h-3 sm:w-4 sm:h-4' />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Mobile CTA */}
                          <Link
                            href={`/menu?offer=${offer._id}`}
                            onClick={() => handleOfferClick(offer._id)}
                            className='block w-full bg-amber-600 hover:bg-amber-700 text-white text-center py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base'
                          >
                            Order Now
                          </Link>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className='hidden lg:flex'>
                        {/* Desktop Image */}
                        <div className='w-1/2 relative'>
                          {offer.banner.url ? (
                            <Image
                              src={offer.banner.url}
                              alt={offer.name}
                              fill
                              className='object-cover'
                              sizes='50vw'
                            />
                          ) : (
                            <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                              <span className='text-gray-500 font-medium text-xl'>
                                {offer.name}
                              </span>
                            </div>
                          )}

                          {/* Desktop Badges */}
                          <div className='absolute top-4 left-4'>
                            <div
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${offerTypeStyle.badge}`}
                            >
                              {offerTypeStyle.icon}
                              <span className='ml-2 capitalize'>
                                {offer.offerType}
                              </span>
                            </div>
                          </div>

                          <div className='absolute top-4 right-4'>
                            <div
                              className={`px-3 py-1.5 rounded-full text-sm font-medium text-white ${
                                daysRemaining <= 3
                                  ? 'bg-red-500'
                                  : 'bg-black/50'
                              }`}
                            >
                              <Clock className='w-4 h-4 inline mr-1' />
                              {daysRemaining} days left
                            </div>
                          </div>
                        </div>

                        {/* Desktop Content */}
                        <div className='w-1/2 p-6 lg:p-8 flex flex-col'>
                          <div className='flex-1'>
                            <h3 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-3'>
                              {offer.name}
                            </h3>

                            <div className='flex flex-wrap gap-2 mb-4'>
                              <div className='inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs'>
                                <Calendar className='w-3 h-3 mr-1' />
                                {formatDate(offer.startDate)} -{' '}
                                {formatDate(offer.endDate)}
                              </div>
                              {offer.minOrderValue > 0 && (
                                <div className='inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs'>
                                  <ShoppingBag className='w-3 h-3 mr-1' />
                                  Min. ${offer.minOrderValue}
                                </div>
                              )}
                            </div>

                            <p className='text-gray-600 mb-6 leading-relaxed'>
                              {offer.description}
                            </p>

                            {/* Desktop Discount */}
                            {offer.discountType !== 'none' &&
                              offer.discountValue > 0 && (
                                <div
                                  className={`${offerTypeStyle.bg} text-white rounded-xl p-4 mb-6`}
                                >
                                  <div className='flex items-center'>
                                    <div className='bg-white/20 p-2 rounded-lg mr-4'>
                                      <Percent className='w-6 h-6' />
                                    </div>
                                    <div>
                                      <p className='font-bold text-2xl'>
                                        {offer.discountType === 'percentage'
                                          ? `${offer.discountValue}% OFF`
                                          : `$${offer.discountValue} OFF`}
                                      </p>
                                      {offer.maxDiscountAmount && (
                                        <p className='text-sm opacity-90'>
                                          Maximum discount: $
                                          {offer.maxDiscountAmount}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Desktop Coupon */}
                            {offer.couponCode && (
                              <div className='bg-gray-50 rounded-xl p-4 mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                  Coupon Code:
                                </label>
                                <div className='flex'>
                                  <input
                                    type='text'
                                    value={offer.couponCode}
                                    readOnly
                                    className='flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-white font-mono'
                                  />
                                  <button
                                    onClick={() =>
                                      handleCopyCode(offer.couponCode)
                                    }
                                    className={`px-4 py-3 rounded-r-lg text-white font-medium ${
                                      copiedCode === offer.couponCode
                                        ? 'bg-green-500'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                                  >
                                    {copiedCode === offer.couponCode ? (
                                      <Check className='w-5 h-5' />
                                    ) : (
                                      <Copy className='w-5 h-5' />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Desktop CTA */}
                          <Link
                            href={`/menu?offer=${offer._id}`}
                            onClick={() => handleOfferClick(offer._id)}
                            className='inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors group'
                          >
                            Order Now
                            <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation */}
          {eventOffers.length > 1 && (
            <div className='flex items-center justify-between mt-3 sm:mt-4 lg:hidden'>
              <button
                onClick={goToPrevSlide}
                className='p-2 rounded-full bg-white shadow-md border'
              >
                <ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600' />
              </button>

              <div className='flex space-x-1.5 sm:space-x-2'>
                {eventOffers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                      activeSlide === index ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goToNextSlide}
                className='p-2 rounded-full bg-white shadow-md border'
              >
                <ChevronRight className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600' />
              </button>
            </div>
          )}

          {/* Desktop Indicators */}
          {eventOffers.length > 1 && (
            <div className='hidden lg:flex justify-center mt-6 space-x-2'>
              {eventOffers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeSlide === index ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className='text-center mt-6 sm:mt-8'>
          <Link
            href='/special-offers'
            className='inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base'
          >
            View All Offers
            <ArrowRight className='w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2' />
          </Link>
        </div>
      </div>
    </section>
  );
}
