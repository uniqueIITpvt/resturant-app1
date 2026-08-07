'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Copy, Check, CalendarDays, Clock, Tag, ArrowRight, ShoppingBag, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

// Define API URL for fetching offers
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types for offers
interface SpecialOffer {
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
  offerType: 'discount' | 'special' | 'seasonal' | 'holiday';
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  couponCode: string;
  featured: boolean;
}

export default function SpecialOffersPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<SpecialOffer[]>([]);
  const [regularOffers, setRegularOffers] = useState<SpecialOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/event-offers/active`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch special offers');
        }
        
        const data = await response.json();
        const allOffers = data.data || [];
        
        // Split into featured and regular offers
        const featured = allOffers.filter((offer: SpecialOffer) => offer.featured);
        const regular = allOffers.filter((offer: SpecialOffer) => !offer.featured);
        
        setOffers(allOffers);
        setFeaturedOffers(featured);
        setRegularOffers(regular);
      } catch (error) {
        console.error('Error fetching offers:', error);
        setError('Unable to load special offers at this time');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, []);

  // Reset copied code after 3 seconds
  useEffect(() => {
    if (!copiedCode) return;
    
    const timeout = setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [copiedCode]);

  // Copy coupon code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        toast.success('Coupon code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
        toast.error('Failed to copy code');
      });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
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

  // Filter offers by type
  const filteredOffers = activeFilter === 'all' 
    ? regularOffers 
    : regularOffers.filter(offer => offer.offerType === activeFilter);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            {/* Hero section skeleton */}
            <div className="h-80 bg-gray-200 rounded-2xl"></div>
            
            {/* Filters skeleton */}
            <div className="flex space-x-4 overflow-x-auto py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-full"></div>
              ))}
            </div>
            
            {/* Offers grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 h-80">
                  <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">We're sorry</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
          >
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Featured Offer */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              <span className="block">Special Offers</span>
              <span className="block text-amber-600">& Exclusive Deals</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our latest promotions, seasonal specials, and exclusive discounts to enhance your dining experience.
            </p>
          </div>

          {/* Featured Offers Carousel/Showcase */}
          {featuredOffers.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-2xl shadow-2xl">
              <div className="bg-white">
                <div className="flex flex-col lg:flex-row">
                  {/* Featured Offer Banner */}
                  <div className="relative h-64 lg:h-auto lg:w-1/2 overflow-hidden">
                    {featuredOffers[0].banner?.url ? (
                      <Image 
                        src={featuredOffers[0].banner.url}
                        alt={featuredOffers[0].name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">{featuredOffers[0].name}</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-md">
                      <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Featured Offer Content */}
                  <div className="lg:w-1/2 p-6 md:p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{featuredOffers[0].name}</h2>
                      
                      <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                          <CalendarDays size={16} className="mr-1" />
                          <span>
                            {formatDate(featuredOffers[0].startDate)} - {formatDate(featuredOffers[0].endDate)}
                          </span>
                        </div>
                        
                        <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          <Clock size={16} className="mr-1" />
                          <span>{getDaysRemaining(featuredOffers[0].endDate)} days left</span>
                        </div>
                        
                        {featuredOffers[0].minOrderValue > 0 && (
                          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <ShoppingBag size={16} className="mr-1" />
                            <span>Min. order: ${featuredOffers[0].minOrderValue}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-base leading-relaxed">{featuredOffers[0].description}</p>
                      
                      {featuredOffers[0].discountType !== 'none' && (
                        <div className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
                          <div className="flex items-center">
                            <Percent className="h-8 w-8 mr-3" />
                            <div>
                              <p className="font-semibold text-xl">
                                {featuredOffers[0].discountType === 'percentage' 
                                  ? `${featuredOffers[0].discountValue}% OFF` 
                                  : `$${featuredOffers[0].discountValue} OFF`}
                              </p>
                              {featuredOffers[0].maxDiscountAmount && (
                                <p className="text-sm opacity-90">
                                  Max discount: ${featuredOffers[0].maxDiscountAmount}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Coupon Code */}
                    {featuredOffers[0].couponCode && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code:</label>
                        <div className="flex">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              value={featuredOffers[0].couponCode}
                              readOnly
                              className="block w-full bg-gray-50 border border-gray-300 rounded-l-md py-3 px-4 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => handleCopyCode(featuredOffers[0].couponCode)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none"
                          >
                            {copiedCode === featuredOffers[0].couponCode ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <Copy className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* CTA Button */}
                    <div className="mt-6">
                      <Link
                        href="/menu"
                        className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        <span>Order Now</span>
                        <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Offers Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Offers
            </button>
            <button
              onClick={() => setActiveFilter('discount')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'discount'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Discounts
            </button>
            <button
              onClick={() => setActiveFilter('special')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'special'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Specials
            </button>
            <button
              onClick={() => setActiveFilter('seasonal')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'seasonal'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Seasonal
            </button>
            <button
              onClick={() => setActiveFilter('holiday')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'holiday'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Holiday
            </button>
          </div>

          {/* No offers for the selected filter */}
          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No offers available</h3>
              <p className="text-gray-600 mb-6">
                There are currently no {activeFilter !== 'all' ? activeFilter : ''} offers available.
              </p>
              <button
                onClick={() => setActiveFilter('all')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none"
              >
                View all offers
              </button>
            </div>
          )}

          {/* Offers Grid */}
          {filteredOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer) => (
                <div 
                  key={offer._id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Offer Image */}
                  <div className="relative h-48">
                    {offer.banner?.url ? (
                      <Image 
                        src={offer.banner.url}
                        alt={offer.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 text-xl font-bold">{offer.name}</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md shadow-sm">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                        {offer.offerType}
                      </span>
                    </div>
                  </div>
                  
                  {/* Offer Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{offer.name}</h3>
                      <span className="text-xs font-medium text-red-600 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {getDaysRemaining(offer.endDate)} days left
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {offer.description}
                    </p>
                    
                    {/* Discount information */}
                    {offer.discountType !== 'none' && (
                      <div className="bg-amber-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <Percent className="h-5 w-5 text-amber-600 mr-2" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {offer.discountType === 'percentage' 
                                ? `${offer.discountValue}% OFF` 
                                : `$${offer.discountValue} OFF`}
                            </p>
                            {offer.minOrderValue > 0 && (
                              <p className="text-xs text-gray-600">
                                Min order: ${offer.minOrderValue}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Coupon Code */}
                    {offer.couponCode && (
                      <div className="flex mb-4">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            value={offer.couponCode}
                            readOnly
                            className="block w-full bg-gray-50 border border-gray-200 rounded-l-md py-2 px-3 text-sm focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handleCopyCode(offer.couponCode)}
                          className="inline-flex items-center px-3 py-2 border border-transparent rounded-r-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none"
                        >
                          {copiedCode === offer.couponCode ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* Valid Period */}
                    <div className="text-xs text-gray-500 mb-4">
                      Valid from {formatDate(offer.startDate)} to {formatDate(offer.endDate)}
                    </div>
                    
                    {/* CTA Button */}
                    <Link
                      href="/menu"
                      className="block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our special offers</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I use a coupon code?</h3>
              <p className="text-gray-600">
                Simply copy the coupon code and apply it during checkout. The discount will be automatically applied to your order if it meets the requirements.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I combine multiple offers?</h3>
              <p className="text-gray-600">
                No, only one coupon code or special offer can be applied per order.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long are offers valid?</h3>
              <p className="text-gray-600">
                Each offer has its own validity period, which is clearly indicated on the offer. Once an offer expires, the coupon code will no longer be valid.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are there minimum order requirements?</h3>
              <p className="text-gray-600">
                Some offers may have minimum order requirements. These are clearly indicated on each offer where applicable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-amber-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter to receive updates on new special offers and promotions.
          </p>
          
          <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button 
              className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition-colors duration-200"
            >
              Subscribe
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            By subscribing, you agree to receive marketing emails from us. You can unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
} 