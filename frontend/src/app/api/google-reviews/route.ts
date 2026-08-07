import { NextResponse } from 'next/server';

// Mock Google Reviews data
const mockReviewsData = {
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
};

/**
 * GET handler for Google Reviews API
 * This endpoint returns mock Google Reviews data since
 * we don't have direct API access to Google Reviews
 */
export async function GET() {
  // In a real application, you would fetch this data from Google Places API
  // For now, we'll return mock data
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(mockReviewsData);
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google reviews' },
      { status: 500 }
    );
  }
}
