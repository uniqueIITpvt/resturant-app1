'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GoogleReview {
  id: string;
  author_name: string;
  profile_photo_url: string;
  text: string;
  rating: number;
  time: number;
  relative_time_description: string;
}

interface GoogleReviewsData {
  average_rating: number;
  total_reviews: number;
  reviews: GoogleReview[];
}

export default function Testimonials() {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const reviewsPerPage = 3;

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        setLoading(true);

        // Replace with your actual API endpoint
        const response = await fetch('/api/google-reviews');

        if (!response.ok) {
          throw new Error('Failed to fetch Google reviews');
        }

        const data = await response.json();
        setReviewsData(data);
      } catch (err) {
        console.error('Error fetching Google reviews:', err);
        setError('Unable to load reviews. Please try again later.');

        // Fallback to sample data for development/demo
        setReviewsData({
          average_rating: 4.0,
          total_reviews: 1286,
          reviews: [
            {
              id: '1',
              author_name: 'Racquelle Roberts',
              profile_photo_url: '/reviews/profile.png',
              text: 'Hiring Feedback Wrench has been one of the greatest investments I have made in my business.',
              rating: 5,
              time: Date.now() - 7776000000, // 90 days ago
              relative_time_description: 'February 11',
            },
            {
              id: '2',
              author_name: 'Rita Nwokeji',
              profile_photo_url: '/reviews/profile.png',
              text: 'Rob helped me identify the next steps for my accounting practice quickly. Thanks alot',
              rating: 5,
              time: Date.now() - 31536000000, // 1 year ago
              relative_time_description: 'March 11, 2021',
            },
            {
              id: '3',
              author_name: 'Mike Stilwell',
              profile_photo_url: '/reviews/profile.png',
              text: 'Met with Rob as he helped me navigate some long term strategies as I operated my business.',
              rating: 5,
              time: Date.now() - 94608000000, // 3 years ago
              relative_time_description: 'March 11, 2018',
            },
            {
              id: '4',
              author_name: 'John Smith',
              profile_photo_url: '/reviews/profile.png',
              text: 'The team at this place provided exceptional service and advice for my startup.',
              rating: 5,
              time: Date.now() - 15768000000, // 6 months ago
              relative_time_description: 'April 15, 2022',
            },
            {
              id: '5',
              author_name: 'Emma Wilson',
              profile_photo_url: '/reviews/profile.png',
              text: 'Outstanding service and attention to detail. Highly recommend!',
              rating: 5,
              time: Date.now() - 2592000000, // 30 days ago
              relative_time_description: 'a month ago',
            },
            {
              id: '6',
              author_name: 'James Anderson',
              profile_photo_url: '/reviews/profile.png',
              text: 'Exactly what our business needed. The team is professional and responsive.',
              rating: 5,
              time: Date.now() - 5184000000, // 60 days ago
              relative_time_description: '2 months ago',
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleReviews();
  }, []);

  const handlePreviousPage = () => {
    if (!reviewsData?.reviews?.length || isAnimating) return;

    setIsAnimating(true);
    const totalPages = Math.ceil(reviewsData.reviews.length / reviewsPerPage);
    const nextPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;

    // Apply animation class
    if (slideContainerRef.current) {
      slideContainerRef.current.classList.add('slide-prev');

      // After animation completes, update page and remove animation class
      setTimeout(() => {
        setCurrentPage(nextPage);
        slideContainerRef.current?.classList.remove('slide-prev');
        setIsAnimating(false);
      }, 300);
    } else {
      setCurrentPage(nextPage);
      setIsAnimating(false);
    }
  };

  const handleNextPage = () => {
    if (!reviewsData?.reviews?.length || isAnimating) return;

    setIsAnimating(true);
    const totalPages = Math.ceil(reviewsData.reviews.length / reviewsPerPage);
    const nextPage = (currentPage + 1) % totalPages;

    // Apply animation class
    if (slideContainerRef.current) {
      slideContainerRef.current.classList.add('slide-next');

      // After animation completes, update page and remove animation class
      setTimeout(() => {
        setCurrentPage(nextPage);
        slideContainerRef.current?.classList.remove('slide-next');
        setIsAnimating(false);
      }, 300);
    } else {
      setCurrentPage(nextPage);
      setIsAnimating(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (isAnimating) return;

    if (touchStart - touchEnd > 50) {
      // Swipe left, go to next
      handleNextPage();
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right, go to previous
      handlePreviousPage();
    }
  };

  const handlePageClick = (index: number) => {
    if (currentPage === index || isAnimating) return;

    setIsAnimating(true);

    // Determine direction for animation
    const direction = index > currentPage ? 'next' : 'prev';

    // Apply animation class
    if (slideContainerRef.current) {
      slideContainerRef.current.classList.add(`slide-${direction}`);

      // After animation completes, update page and remove animation class
      setTimeout(() => {
        setCurrentPage(index);
        slideContainerRef.current?.classList.remove(`slide-${direction}`);
        setIsAnimating(false);
      }, 300);
    } else {
      setCurrentPage(index);
      setIsAnimating(false);
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className='flex'>
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'text-amber-500' : 'text-gray-300'
            }`}
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className='py-12 md:py-16 bg-white'>
        <div className='container mx-auto px-4 text-center'>
          <div className='animate-pulse' data-testid='loading-animation'>
            <div className='h-8 bg-gray-200 rounded-full w-40 mx-auto mb-4'></div>
            <div className='h-4 bg-gray-200 rounded-full w-64 mx-auto mb-8'></div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='bg-white rounded-lg p-6 shadow-md border border-gray-100 h-48'
                >
                  <div className='flex items-center mb-4'>
                    <div className='w-12 h-12 rounded-full bg-gray-200 mr-3'></div>
                    <div>
                      <div className='h-4 bg-gray-200 rounded-full w-32 mb-2'></div>
                      <div className='h-3 bg-gray-200 rounded-full w-24'></div>
                    </div>
                  </div>
                  <div className='h-4 bg-gray-200 rounded-full w-full mb-2'></div>
                  <div className='h-4 bg-gray-200 rounded-full w-full mb-2'></div>
                  <div className='h-4 bg-gray-200 rounded-full w-2/3'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !reviewsData) {
    return (
      <section className='py-12 md:py-16 bg-white'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-lg mx-auto p-6 bg-red-50 rounded-lg border border-red-200'>
            <h2 className='text-xl font-semibold text-red-800 mb-2'>
              Error Loading Reviews
            </h2>
            <p className='text-red-700'>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!reviewsData || !reviewsData.reviews.length) {
    return null;
  }

  // Calculate total pages
  const totalPages = Math.ceil(reviewsData.reviews.length / reviewsPerPage);

  // Get current reviews to display
  const currentReviews = reviewsData.reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  return (
    <section className='py-12 md:py-16 bg-white'>
      <style jsx global>{`
        @keyframes slideInNext {
          from {
            transform: translateX(10%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutNext {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-10%);
            opacity: 0;
          }
        }

        @keyframes slideInPrev {
          from {
            transform: translateX(-10%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutPrev {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(10%);
            opacity: 0;
          }
        }

        .slide-next {
          animation: slideOutNext 0.3s forwards;
        }

        .slide-prev {
          animation: slideOutPrev 0.3s forwards;
        }

        .reviews-container {
          position: relative;
          min-height: 300px;
        }

        .reviews-grid {
          transition: opacity 0.3s ease-in-out;
        }

        .reviews-grid.entering {
          animation: slideInNext 0.3s forwards;
        }

        /* Header styling */
        .review-header {
          background: linear-gradient(to right, #f9fafb, #f3f4f6);
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          position: relative;
        }

        .review-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            to right,
            #4285f4,
            #ea4335,
            #fbbc05,
            #34a853
          );
        }

        .star-pulse {
          animation: star-pulse 2s infinite;
        }

        @keyframes star-pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      <div className='container mx-auto px-4'>
        {/* Enhanced header section */}
        <div className='review-header mb-10 md:mb-14 p-6 md:p-8'>
          <div className='flex flex-col md:flex-row items-center justify-between'>
            <div className='flex flex-col md:flex-row items-center mb-4 md:mb-0'>
              <div className='relative'>
                <Image
                  src='/reviews/Google-01.svg'
                  alt='Google'
                  width={120}
                  height={60}
                  className='h-14 w-auto'
                />
                <div className='absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center transform rotate-12'>
                  <span>★</span>
                </div>
              </div>

              <div className='ml-0 md:ml-4 mt-3 md:mt-0 text-center md:text-left'>
                <div className='flex items-center justify-center md:justify-start'>
                  <span className='text-3xl font-bold mr-2 text-gray-900'>
                    {reviewsData.average_rating.toFixed(1)}
                  </span>
                  <div className='star-pulse'>
                    {renderStars(reviewsData.average_rating)}
                  </div>
                </div>
                <div className='text-sm text-gray-600 font-medium mt-1'>
                  Based on{' '}
                  <span className='font-bold text-blue-600'>
                    {reviewsData.total_reviews.toLocaleString()}
                  </span>{' '}
                  reviews
                </div>
              </div>
            </div>

            <div className=''>
              <a
                href='https://maps.app.goo.gl/jF15X3foiDbddsSK6'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-6 py-3 transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
                    clipRule='evenodd'
                  />
                </svg>
                Write a Review
              </a>
            </div>
          </div>

          <div className='mt-6 text-center'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
              What Our Customers Are Saying
            </h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Don&apos;t just take our word for it. See real feedback from
              satisfied customers who have experienced our services.
            </p>
          </div>
        </div>

        <div className='max-w-6xl mx-auto'>
          <div className='relative reviews-container'>
            {/* Review cards container */}
            <div
              className='overflow-hidden'
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Three reviews per row on desktop, one per row on mobile */}
              <div
                ref={slideContainerRef}
                className='grid grid-cols-1 md:grid-cols-3 gap-6 reviews-grid'
              >
                {currentReviews.map((review, index) => (
                  <div
                    key={review.id}
                    className={`bg-white rounded-lg p-6 shadow-md border border-gray-100 ${
                      index > 0 ? 'hidden md:block' : ''
                    }`}
                  >
                    <div className='flex items-center mb-4'>
                      <div className='relative w-12 h-12 rounded-full overflow-hidden mr-3'>
                        <Image
                          src={review.profile_photo_url}
                          alt={review.author_name}
                          fill
                          className='object-cover'
                        />
                      </div>
                      <div>
                        <h4 className='text-base font-semibold text-gray-900'>
                          {review.author_name}
                        </h4>
                        <div className='flex items-center'>
                          {renderStars(review.rating)}
                          <span className='ml-2 text-xs text-gray-500'>
                            {review.relative_time_description}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className='text-gray-700 text-sm'>
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className='mt-4 flex items-center'>
                      <Image
                        src='/reviews/google-icon.svg'
                        alt='Posted on Google'
                        width={20}
                        height={20}
                      />
                      <span className='ml-1 text-xs text-gray-500'>
                        Posted on Google
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            {totalPages > 1 && (
              <div className='flex justify-between absolute top-1/2 left-0 right-0 -mt-4 -mx-4 z-10'>
                <button
                  onClick={handlePreviousPage}
                  disabled={isAnimating}
                  className='bg-white rounded-full p-3 shadow-md text-gray-700 hover:text-amber-500 transition-colors transform -translate-y-1/2 disabled:opacity-50 disabled:pointer-events-none'
                  aria-label='Previous reviews'
                >
                  <ChevronLeft className='h-6 w-6' />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={isAnimating}
                  className='bg-white rounded-full p-3 shadow-md text-gray-700 hover:text-amber-500 transition-colors transform -translate-y-1/2 disabled:opacity-50 disabled:pointer-events-none'
                  aria-label='Next reviews'
                >
                  <ChevronRight className='h-6 w-6' />
                </button>
              </div>
            )}

            {/* Page indicators */}
            {totalPages > 1 && (
              <div className='flex justify-center mt-8'>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageClick(index)}
                    disabled={isAnimating}
                    className={`h-2 w-8 mx-1 rounded-full transition-colors ${
                      currentPage === index ? 'bg-amber-500' : 'bg-gray-300'
                    } ${isAnimating ? 'pointer-events-none' : ''}`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
