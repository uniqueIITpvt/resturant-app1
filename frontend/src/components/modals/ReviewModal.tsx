'use client';

import { useState, useEffect } from 'react';
import { X, Star, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import { Order } from '@/components/profile/types';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface EligibleOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
}

interface ReviewFormData {
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
  images: File[];
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleOrders: EligibleOrder[];
  userReviews: { orderId: string; productId: string }[];
  onReviewSubmitted: () => void;
  specificOrder?: Order | null;
  specificProduct?: OrderItem | null;
}

export default function ReviewModal({
  isOpen,
  onClose,
  eligibleOrders,
  userReviews,
  onReviewSubmitted,
  specificOrder = null,
  specificProduct = null,
}: ReviewModalProps) {
  const [selectedOrder, setSelectedOrder] = useState<EligibleOrder | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(
    null
  );
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    orderId: '',
    productId: '',
    rating: 0,
    comment: '',
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Reset form when modal opens/closes or set specific order/product
  useEffect(() => {
    if (!isOpen) {
      setSelectedOrder(null);
      setSelectedProduct(null);
      setReviewForm({
        orderId: '',
        productId: '',
        rating: 0,
        comment: '',
        images: [],
      });
      setImagePreviewUrls([]);
    } else if (specificOrder && specificProduct) {
      // Convert Order to EligibleOrder format and directly show review form
      const eligibleOrder: EligibleOrder = {
        _id: specificOrder._id,
        orderNumber: specificOrder.orderNumber,
        createdAt: specificOrder.createdAt,
        items: specificOrder.items,
      };

      setSelectedOrder(eligibleOrder);
      setSelectedProduct(specificProduct);
      setReviewForm({
        orderId: specificOrder._id,
        productId: specificProduct.id,
        rating: 0,
        comment: '',
        images: [],
      });
    } else if (specificOrder) {
      // Convert Order to EligibleOrder format and show product selection
      const eligibleOrder: EligibleOrder = {
        _id: specificOrder._id,
        orderNumber: specificOrder.orderNumber,
        createdAt: specificOrder.createdAt,
        items: specificOrder.items,
      };

      setSelectedOrder(eligibleOrder);
      setSelectedProduct(null); // Let user select product
      setReviewForm({
        orderId: specificOrder._id,
        productId: '',
        rating: 0,
        comment: '',
        images: [],
      });
    }
  }, [isOpen, specificOrder, specificProduct]);

  const isProductReviewed = (orderId: string, productId: string) => {
    // Check if user has already reviewed this product (regardless of which order)
    return userReviews.some((review) => review.productId === productId);
  };

  const handleOrderSelect = (order: EligibleOrder) => {
    setSelectedOrder(order);
    setSelectedProduct(null);
    setReviewForm((prev) => ({
      ...prev,
      orderId: order._id,
      productId: '',
    }));
  };

  const handleProductSelect = (product: OrderItem) => {
    setSelectedProduct(product);
    setReviewForm((prev) => ({
      ...prev,
      productId: product.id,
    }));
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewForm((prev) => ({
      ...prev,
      comment: e.target.value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + reviewForm.images.length > 5) {
      toast.error('You can upload maximum 5 images');
      return;
    }

    const newImages = [...reviewForm.images, ...files];
    const newPreviewUrls = [
      ...imagePreviewUrls,
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    setReviewForm((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index: number) => {
    const newImages = reviewForm.images.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setReviewForm((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewForm.orderId || !reviewForm.productId) {
      toast.error('Please select an order and product');
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    // Check if user has already reviewed this product
    if (isProductReviewed(reviewForm.orderId, reviewForm.productId)) {
      toast.error(
        'You have already reviewed this product. Each product can only be reviewed once.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('orderId', reviewForm.orderId);
      formData.append('productId', reviewForm.productId);
      formData.append('rating', reviewForm.rating.toString());
      formData.append('comment', reviewForm.comment);

      // Add images if any
      reviewForm.images.forEach((image) => {
        formData.append(`images`, image);
      });

      await api.upload('api/reviews', formData);

      toast.success('Review submitted successfully!');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);

      // Handle specific error types
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('E11000 duplicate key error')) {
        toast.error(
          'You have already reviewed this product. Each product can only be reviewed once.'
        );
      } else if (errorMessage.includes('already reviewed this product')) {
        toast.error('You have already reviewed this product.');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-40 overflow-y-auto pt-16 md:pt-20'>
      <div className='flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] items-center justify-center p-2 sm:p-4'>
        <div
          className='fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity'
          onClick={onClose}
        />

        <div className='relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl bg-white rounded-lg md:rounded-xl shadow-xl mx-2 my-4'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 md:p-6 border-b border-gray-200'>
            <h2 className='text-lg md:text-xl font-bold text-gray-900'>
              Write a Review
            </h2>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='p-4 md:p-6 max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-10rem)] overflow-y-auto'>
            {!selectedOrder ? (
              /* Order Selection - only show if no specific order provided */
              !specificOrder && (
                <div>
                  <h3 className='text-base md:text-lg font-medium mb-3 md:mb-4'>
                    Select an order to review
                  </h3>
                  <div className='space-y-2 md:space-y-3 max-h-60 md:max-h-96 overflow-y-auto'>
                    {eligibleOrders.map((order) => (
                      <div
                        key={order._id}
                        className='border border-gray-200 rounded-lg p-3 md:p-4 hover:border-amber-300 cursor-pointer transition-colors'
                        onClick={() => handleOrderSelect(order)}
                      >
                        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0'>
                          <span className='font-medium text-amber-600 text-sm md:text-base'>
                            Order #{order.orderNumber}
                          </span>
                          <span className='text-xs md:text-sm text-gray-500'>
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className='text-xs md:text-sm text-gray-600'>
                          {order.items.length} item(s) • Available for review
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : !selectedProduct ? (
              /* Product Selection - only show if no specific product provided */
              !specificProduct && (
                <div>
                  <div className='flex flex-col sm:flex-row sm:items-center mb-3 md:mb-4 space-y-2 sm:space-y-0'>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className='text-amber-600 hover:text-amber-700 text-sm md:text-base sm:mr-3 self-start'
                    >
                      ← Back
                    </button>
                    <h3 className='text-base md:text-lg font-medium'>
                      Select a product to review from Order #
                      {selectedOrder.orderNumber}
                    </h3>
                  </div>
                  <div className='space-y-2 md:space-y-3 max-h-60 md:max-h-96 overflow-y-auto'>
                    {selectedOrder.items.map((item) => {
                      const isReviewed = isProductReviewed(
                        selectedOrder._id,
                        item.id
                      );
                      return (
                        <div
                          key={item.id}
                          className={`border rounded-lg p-3 md:p-4 transition-colors ${
                            isReviewed
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-amber-300 cursor-pointer'
                          }`}
                          onClick={() =>
                            !isReviewed && handleProductSelect(item)
                          }
                        >
                          <div className='flex items-center space-x-3 md:space-x-4'>
                            {item.image && (
                              <div className='w-12 h-12 md:w-16 md:h-16 relative rounded-lg overflow-hidden flex-shrink-0'>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className='object-cover'
                                />
                              </div>
                            )}
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-medium text-sm md:text-base truncate'>
                                {item.name}
                              </h4>
                              <p className='text-xs md:text-sm text-gray-600'>
                                Quantity: {item.quantity} • $
                                {item.price.toFixed(2)}
                              </p>
                              {isReviewed && (
                                <span className='inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                                  Already Reviewed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              /* Review Form - show when both order and product are selected */
              <form onSubmit={handleSubmit}>
                <div className='flex flex-col sm:flex-row sm:items-center mb-4 md:mb-6 space-y-2 sm:space-y-0'>
                  {!specificProduct && (
                    <button
                      type='button'
                      onClick={() => setSelectedProduct(null)}
                      className='text-amber-600 hover:text-amber-700 text-sm md:text-base sm:mr-3 self-start'
                    >
                      ← Back
                    </button>
                  )}
                  <h3 className='text-base md:text-lg font-medium'>
                    Review: {selectedProduct.name}
                  </h3>
                </div>

                {/* Product Info */}
                <div className='flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg'>
                  {selectedProduct.image && (
                    <div className='w-12 h-12 md:w-16 md:h-16 relative rounded-lg overflow-hidden flex-shrink-0'>
                      <Image
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <h4 className='font-medium text-sm md:text-base truncate'>
                      {selectedProduct.name}
                    </h4>
                    <p className='text-xs md:text-sm text-gray-600'>
                      Order #{selectedOrder.orderNumber} •{' '}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className='mb-4 md:mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Rating *
                  </label>
                  <div className='flex space-x-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type='button'
                        onClick={() => handleRatingChange(star)}
                        className={`p-1 transition-colors ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star className='w-6 h-6 md:w-8 md:h-8 fill-current' />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className='mb-4 md:mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Review Comment *
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={handleCommentChange}
                    rows={4}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm md:text-base'
                    placeholder='Share your experience with this product...'
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className='mb-4 md:mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Photos (Optional)
                  </label>
                  <div className='space-y-3 md:space-y-4'>
                    {imagePreviewUrls.length > 0 && (
                      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4'>
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className='relative'>
                            <div className='w-full h-20 md:h-24 relative rounded-lg overflow-hidden'>
                              <Image
                                src={url}
                                alt={`Preview ${index + 1}`}
                                fill
                                className='object-cover'
                              />
                            </div>
                            <button
                              type='button'
                              onClick={() => removeImage(index)}
                              className='absolute -top-1 -right-1 md:-top-2 md:-right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600'
                            >
                              <Trash2 className='w-3 h-3' />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {reviewForm.images.length < 5 && (
                      <label className='flex flex-col items-center justify-center w-full h-24 md:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                        <div className='flex flex-col items-center justify-center pt-3 pb-3 md:pt-5 md:pb-6'>
                          <Upload className='w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-4 text-gray-500' />
                          <p className='mb-1 md:mb-2 text-xs md:text-sm text-gray-500'>
                            <span className='font-semibold'>
                              Click to upload
                            </span>{' '}
                            photos
                          </p>
                          <p className='text-xs text-gray-500'>
                            PNG, JPG up to 10MB (Max 5 photos)
                          </p>
                        </div>
                        <input
                          type='file'
                          className='hidden'
                          multiple
                          accept='image/*'
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm md:text-base'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full sm:w-auto px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base'
                  >
                    {isSubmitting && (
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
