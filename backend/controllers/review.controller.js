const Review = require('../models/review.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

class ReviewController {
  // Get eligible orders for review (completed orders that haven't been reviewed yet)
  async getEligibleOrdersForReview(req, res) {
    try {
      const userId = req.user.id;

      // Find completed orders for the user
      const completedOrders = await Order.find({
        user: userId,
        status: 'completed',
      }).sort({ createdAt: -1 });

      if (!completedOrders.length) {
        return res.json([]);
      }

      // Get all existing reviews for this user
      const existingReviews = await Review.find({ user: userId });
      const reviewedItems = new Set();

      existingReviews.forEach((review) => {
        reviewedItems.add(`${review.order}_${review.product.id}`);
      });

      // Filter orders and items that haven't been reviewed
      const eligibleOrders = [];

      for (const order of completedOrders) {
        const eligibleItems = order.items.filter((item) => {
          const key = `${order._id}_${item.id}`;
          return !reviewedItems.has(key);
        });

        if (eligibleItems.length > 0) {
          eligibleOrders.push({
            _id: order._id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            items: eligibleItems,
          });
        }
      }

      res.json(eligibleOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create a new review
  async createReview(req, res) {
    try {
      const { orderId, productId, rating, comment } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!orderId || !productId || !rating || !comment) {
        return res.status(400).json({
          message: 'Order ID, Product ID, rating, and comment are required',
        });
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Rating must be between 1 and 5',
        });
      }

      // Check if order exists and belongs to user
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
        status: 'completed',
      });

      if (!order) {
        return res.status(404).json({
          message: 'Order not found or not eligible for review',
        });
      }

      // Find the product in the order
      const orderItem = order.items.find((item) => item.id === productId);
      if (!orderItem) {
        return res.status(404).json({
          message: 'Product not found in this order',
        });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        user: userId,
        order: orderId,
        'product.id': productId,
      });

      if (existingReview) {
        return res.status(400).json({
          message: 'You have already reviewed this product for this order',
        });
      }

      // Handle image uploads if provided
      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'reviews',
              resource_type: 'auto',
            });
            uploadedImages.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
          }
        }
      }

      // Create the review
      const reviewData = {
        user: userId,
        order: orderId,
        product: {
          id: orderItem.id,
          name: orderItem.name,
          image: orderItem.image,
        },
        rating: parseInt(rating),
        comment: comment.trim(),
        images: uploadedImages,
      };

      const newReview = new Review(reviewData);
      const savedReview = await newReview.save();

      // Populate user information for response
      await savedReview.populate('user', 'name');

      res.status(201).json(savedReview);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get reviews for a specific product
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === 'asc' ? 1 : -1;

      // Build sort object
      let sortObj = {};
      if (sortBy === 'rating') {
        sortObj.rating = sortOrder;
      } else if (sortBy === 'helpful') {
        sortObj.helpfulVotes = sortOrder;
      } else {
        sortObj.createdAt = sortOrder;
      }

      // Get reviews for the product
      const reviews = await Review.find({
        'product.id': productId,
        isHidden: false,
      })
        .populate('user', 'name')
        .populate('adminResponse.respondedBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalReviews = await Review.countDocuments({
        'product.id': productId,
        isHidden: false,
      });

      // Calculate rating statistics
      const ratingStats = await Review.aggregate([
        {
          $match: {
            'product.id': productId,
            isHidden: false,
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating',
            },
          },
        },
      ]);

      let stats = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

      if (ratingStats.length > 0) {
        const stat = ratingStats[0];
        stats.averageRating = Math.round(stat.averageRating * 10) / 10;
        stats.totalReviews = stat.totalReviews;

        // Count rating distribution
        stat.ratingDistribution.forEach((rating) => {
          stats.ratingDistribution[rating]++;
        });
      }

      res.json({
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1,
        },
        stats,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get user's reviews
  async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const reviews = await Review.find({ user: userId })
        .populate('order', 'orderNumber createdAt')
        .populate('adminResponse.respondedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalReviews = await Review.countDocuments({ user: userId });

      res.json({
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update a review (user can only update their own review)
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const review = await Review.findOne({
        _id: reviewId,
        user: userId,
      });

      if (!review) {
        return res.status(404).json({
          message: 'Review not found or you are not authorized to update it',
        });
      }

      // Update fields if provided
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            message: 'Rating must be between 1 and 5',
          });
        }
        review.rating = parseInt(rating);
      }

      if (comment !== undefined) {
        review.comment = comment.trim();
      }

      // Handle new image uploads if provided
      if (req.files && req.files.length > 0) {
        // Delete old images from cloudinary
        for (const image of review.images) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
          }
        }

        // Upload new images
        const uploadedImages = [];
        for (const file of req.files) {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'reviews',
              resource_type: 'auto',
            });
            uploadedImages.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
          }
        }
        review.images = uploadedImages;
      }

      const updatedReview = await review.save();
      await updatedReview.populate('user', 'name');

      res.json(updatedReview);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a review (user can only delete their own review)
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await Review.findOne({
        _id: reviewId,
        user: userId,
      });

      if (!review) {
        return res.status(404).json({
          message: 'Review not found or you are not authorized to delete it',
        });
      }

      // Delete images from cloudinary
      for (const image of review.images) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
        }
      }

      await Review.findByIdAndDelete(reviewId);

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Mark review as helpful (toggle)
  async toggleHelpfulVote(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // For simplicity, we'll just increment/decrement the helpful votes
      // In a more complex system, you'd track which users voted
      const action = req.body.action; // 'add' or 'remove'

      if (action === 'add') {
        review.helpfulVotes += 1;
      } else if (action === 'remove' && review.helpfulVotes > 0) {
        review.helpfulVotes -= 1;
      }

      await review.save();

      res.json({
        message: 'Vote updated successfully',
        helpfulVotes: review.helpfulVotes,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Admin: Get all reviews with filters
  async getAllReviews(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        rating,
        isHidden,
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === 'asc' ? 1 : -1;

      // Build filter object
      const filter = {};
      if (rating) filter.rating = parseInt(rating);
      if (isHidden !== undefined) filter.isHidden = isHidden === 'true';

      // Build sort object
      let sortObj = {};
      if (sortBy === 'rating') {
        sortObj.rating = sortOrder;
      } else if (sortBy === 'helpful') {
        sortObj.helpfulVotes = sortOrder;
      } else {
        sortObj.createdAt = sortOrder;
      }

      const reviews = await Review.find(filter)
        .populate('user', 'name email')
        .populate('order', 'orderNumber')
        .populate('adminResponse.respondedBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      const totalReviews = await Review.countDocuments(filter);

      res.json({
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNext: skip + reviews.length < totalReviews,
          hasPrev: parseInt(page) > 1,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Admin: Respond to a review
  async respondToReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { message } = req.body;
      const adminId = req.user.id;

      if (!message || message.trim().length === 0) {
        return res
          .status(400)
          .json({ message: 'Response message is required' });
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      review.adminResponse = {
        message: message.trim(),
        respondedBy: adminId,
        respondedAt: new Date(),
      };

      await review.save();
      await review.populate('adminResponse.respondedBy', 'name');

      res.json({
        message: 'Response added successfully',
        review,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Admin: Hide/Unhide a review
  async toggleReviewVisibility(req, res) {
    try {
      const { reviewId } = req.params;
      const { isHidden } = req.body;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      review.isHidden = isHidden;
      await review.save();

      res.json({
        message: `Review ${isHidden ? 'hidden' : 'unhidden'} successfully`,
        review,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get review statistics for dashboard
  async getReviewStats(req, res) {
    try {
      const stats = await Review.aggregate([
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratingDistribution: {
              $push: '$rating',
            },
          },
        },
      ]);

      let result = {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

      if (stats.length > 0) {
        const stat = stats[0];
        result.totalReviews = stat.totalReviews;
        result.averageRating = Math.round(stat.averageRating * 10) / 10;

        // Count rating distribution
        stat.ratingDistribution.forEach((rating) => {
          result.ratingDistribution[rating]++;
        });
      }

      // Get recent reviews
      const recentReviews = await Review.find()
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      result.recentReviews = recentReviews;

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ReviewController();
