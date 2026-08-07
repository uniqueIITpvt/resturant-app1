# Customer Reviews API Documentation

## Overview

The Customer Reviews API allows users to write reviews for products they have purchased after the order delivery is completed. This system ensures that only verified customers who have actually purchased and received the products can write reviews.

## Features

- ✅ **Verified Reviews**: Only customers who have completed orders can review products
- ✅ **Image Support**: Users can upload images with their reviews
- ✅ **Rating System**: 1-5 star rating system
- ✅ **Admin Management**: Admins can respond to reviews and manage visibility
- ✅ **Helpful Votes**: Users can mark reviews as helpful
- ✅ **Pagination**: All endpoints support pagination
- ✅ **Statistics**: Comprehensive review statistics and analytics

## Authentication

Most endpoints require authentication using Bearer tokens:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get Product Reviews

```http
GET /api/reviews/product/{productId}
```

**Parameters:**

- `productId` (path): Product ID to get reviews for
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Reviews per page (default: 10)
- `sortBy` (query, optional): Sort field - `createdAt`, `rating`, `helpful` (default: createdAt)
- `order` (query, optional): Sort order - `asc`, `desc` (default: desc)

**Response:**

```json
{
  "reviews": [
    {
      "_id": "review_id",
      "user": {
        "_id": "user_id",
        "name": "John Doe"
      },
      "product": {
        "id": "product_id",
        "name": "Product Name",
        "image": "product_image_url"
      },
      "rating": 5,
      "comment": "Great product!",
      "images": [
        {
          "public_id": "cloudinary_id",
          "url": "image_url"
        }
      ],
      "helpfulVotes": 3,
      "adminResponse": {
        "message": "Thank you for your feedback!",
        "respondedBy": {
          "name": "Admin Name"
        },
        "respondedAt": "2024-01-15T10:30:00Z"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalReviews": 50,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "averageRating": 4.2,
    "totalReviews": 50,
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 8,
      "4": 15,
      "5": 22
    }
  }
}
```

### User Endpoints (Authentication Required)

#### Get Eligible Orders for Review

```http
GET /api/reviews/eligible-orders
```

Returns completed orders that haven't been reviewed yet.

**Response:**

```json
[
  {
    "_id": "order_id",
    "orderNumber": "123456",
    "createdAt": "2024-01-15T10:00:00Z",
    "items": [
      {
        "id": "product_id",
        "name": "Product Name",
        "price": 25.99,
        "quantity": 2,
        "image": "product_image_url"
      }
    ]
  }
]
```

#### Get User's Reviews

```http
GET /api/reviews/my-reviews
```

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Reviews per page (default: 10)

#### Create a Review

```http
POST /api/reviews
```

**Content-Type:** `multipart/form-data`

**Body:**

- `orderId` (required): Order ID
- `productId` (required): Product ID
- `rating` (required): Rating 1-5
- `comment` (required): Review comment
- `images` (optional): Array of image files (max 5 files, 5MB each)

**Example using FormData:**

```javascript
const formData = new FormData();
formData.append('orderId', 'order_id_here');
formData.append('productId', 'product_id_here');
formData.append('rating', '5');
formData.append('comment', 'Great product, highly recommended!');
formData.append('images', imageFile1);
formData.append('images', imageFile2);

fetch('/api/reviews', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
  },
  body: formData,
});
```

#### Update a Review

```http
PUT /api/reviews/{reviewId}
```

**Content-Type:** `multipart/form-data`

**Body:**

- `rating` (optional): New rating 1-5
- `comment` (optional): New comment
- `images` (optional): New images (replaces all existing images)

#### Delete a Review

```http
DELETE /api/reviews/{reviewId}
```

#### Mark Review as Helpful

```http
POST /api/reviews/{reviewId}/helpful
```

**Body:**

```json
{
  "action": "add" // or "remove"
}
```

### Admin Endpoints (Admin/SuperAdmin Only)

#### Get All Reviews (Admin)

```http
GET /api/reviews/admin/all
```

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Reviews per page (default: 20)
- `rating` (query, optional): Filter by rating (1-5)
- `isHidden` (query, optional): Filter by hidden status (true/false)
- `sortBy` (query, optional): Sort field
- `order` (query, optional): Sort order

#### Get Review Statistics (Admin)

```http
GET /api/reviews/admin/stats
```

**Response:**

```json
{
  "totalReviews": 150,
  "averageRating": 4.2,
  "ratingDistribution": {
    "1": 5,
    "2": 8,
    "3": 20,
    "4": 45,
    "5": 72
  },
  "recentReviews": [
    // Last 5 reviews
  ]
}
```

#### Respond to a Review (Admin)

```http
POST /api/reviews/admin/{reviewId}/respond
```

**Body:**

```json
{
  "message": "Thank you for your feedback! We're glad you enjoyed our product."
}
```

#### Hide/Unhide a Review (Admin)

```http
PATCH /api/reviews/admin/{reviewId}/visibility
```

**Body:**

```json
{
  "isHidden": true // or false
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "message": "Error description"
}
```

Common status codes:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Business Logic

### Review Eligibility

- Users can only review products from completed orders
- One review per user per product per order
- Orders must have status "completed"

### Image Uploads

- Maximum 5 images per review
- Maximum 5MB per image
- Supported formats: JPEG, JPG, PNG, GIF, WebP
- Images are uploaded to Cloudinary

### Admin Features

- Admins can respond to any review
- Admins can hide inappropriate reviews
- Hidden reviews are not shown in public endpoints
- Admin responses are displayed with reviews

## Frontend Integration Examples

### React Hook for Reviews

```javascript
import { useState, useEffect } from 'react';

const useProductReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/product/${productId}`);
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return { reviews, stats, loading };
};
```

### Submit Review Form

```javascript
const submitReview = async (reviewData, images) => {
  const formData = new FormData();
  formData.append('orderId', reviewData.orderId);
  formData.append('productId', reviewData.productId);
  formData.append('rating', reviewData.rating);
  formData.append('comment', reviewData.comment);

  images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

## Database Schema

### Review Model

```javascript
{
  user: ObjectId, // Reference to User
  order: ObjectId, // Reference to Order
  product: {
    id: String, // Product ID from order
    name: String, // Product name
    image: String // Product image URL
  },
  rating: Number, // 1-5
  comment: String, // Review text
  images: [{ // Cloudinary images
    public_id: String,
    url: String
  }],
  isVerified: Boolean, // Auto-verified for completed orders
  helpfulVotes: Number,
  reportCount: Number,
  isHidden: Boolean,
  adminResponse: {
    message: String,
    respondedBy: ObjectId, // Reference to Admin User
    respondedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- JWT authentication for all user endpoints
- Role-based authorization for admin endpoints
- File upload validation (type, size)
- Input sanitization and validation
- Rate limiting (if implemented)
- CORS protection

## Performance Considerations

- Database indexes on frequently queried fields
- Pagination for all list endpoints
- Cloudinary for image optimization
- Aggregation pipelines for statistics

This review system provides a complete solution for customer feedback management in your restaurant business application!
