'use client';

import {
  X,
  Package,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Ban,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

// Types for the order data
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedAddons?: {
    title: string;
    options: {
      name: string;
      price: number;
    }[];
  }[];
}

interface OrderDetails {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  };
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  cancelledBy?: 'user' | 'admin';
  cancelledAt?: string;
  createdAt: string;
  paymentMethod: string;
  deliveryAddress: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  orderId: string | null;
  onClose: () => void;
  token: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function OrderDetailsModal({
  isOpen,
  orderId,
  onClose,
  token,
}: OrderDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);

      if (orderId) {
        fetchOrderDetails(orderId);
      }
    } else {
      // Add delay to allow animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setIsVisible(false);
        setOrder(null);
        setError(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async (id: string) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      console.log('Order details received:', data);
      console.log('Order items:', data.items);
      if (data.items && data.items.length > 0) {
        console.log('First item selectedAddons:', data.items[0].selectedAddons);
      }
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Could not load order details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getStatusBadge = (status: OrderDetails['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className='bg-orange-100 text-orange-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded'>
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className='bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded'>
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className='bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded'>
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className='bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded'>
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const cancelOrder = async () => {
    if (!token || !order || order.status !== 'pending') return;

    try {
      const confirmed = window.confirm(
        'Are you sure you want to cancel this order? This action cannot be undone.'
      );
      if (!confirmed) return;

      const response = await fetch(
        `${API_URL}/api/orders/${order._id}/cancel`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      // Update local state with the response data to get cancelledBy and cancelledAt
      const updatedOrder = await response.json();
      setOrder(updatedOrder);

      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 overflow-y-auto z-50 flex items-center justify-center mt-12'>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${
          isOpen
            ? 'backdrop-blur-sm bg-white/30'
            : 'backdrop-blur-none bg-transparent'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg max-w-2xl w-full mx-auto shadow-xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          isOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        <div className='p-6'>
          <div className='flex items-center justify-between mb-5 border-b border-gray-200 pb-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 mr-3'>
                <Package className='h-6 w-6 text-amber-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Order Details
              </h3>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-full'
            >
              <X className='h-6 w-6' />
            </button>
          </div>

          {isLoading ? (
            <div className='py-10 flex flex-col items-center justify-center'>
              <div className='w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4'></div>
              <p className='text-gray-500'>Loading order details...</p>
            </div>
          ) : error ? (
            <div className='py-10 text-center'>
              <p className='text-red-500 mb-4'>{error}</p>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors'
              >
                Close
              </button>
            </div>
          ) : order ? (
            <div className='space-y-6'>
              {/* Order Header */}
              <div className='bg-amber-50 p-4 rounded-lg'>
                <div className='flex justify-between items-center mb-2'>
                  <h4 className='font-medium text-amber-800'>
                    Order #{order.orderNumber}
                  </h4>
                  {getStatusBadge(order.status)}
                </div>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center'>
                    <Calendar className='h-4 w-4 text-amber-600 mr-2' />
                    <span className='text-gray-600'>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <Clock className='h-4 w-4 text-amber-600 mr-2' />
                    <span className='text-gray-600'>
                      {formatTime(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Display cancellation information */}
                {order.status === 'cancelled' && order.cancelledBy && (
                  <div className='mt-3 pt-2 border-t border-amber-200'>
                    <div className='flex items-center text-sm'>
                      <Ban className='h-4 w-4 text-red-500 mr-2' />
                      <span className='text-red-600'>
                        Cancelled by{' '}
                        {order.cancelledBy === 'user' ? 'you' : 'restaurant'}
                        {order.cancelledAt &&
                          ` on ${formatDate(order.cancelledAt)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>Items</h4>
                <div className='divide-y divide-gray-200'>
                  {order.items.map((item, index) => (
                    <div
                      key={`item-${item.id}-${index}`}
                      className='py-3 flex items-start'
                    >
                      <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative mr-3'>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className='object-cover object-center'
                          />
                        ) : (
                          <div className='h-full w-full flex items-center justify-center bg-gray-100'>
                            <span className='text-gray-400 text-xs'>
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className='flex-1'>
                        <h5 className='text-sm font-medium text-gray-900'>
                          {item.name}
                        </h5>
                        <p className='text-sm text-gray-500 mt-1'>
                          Qty: {item.quantity}
                        </p>

                        {/* Display selected addons */}
                        {item.selectedAddons &&
                          item.selectedAddons.length > 0 &&
                          item.selectedAddons.some(
                            (group) => group.options && group.options.length > 0
                          ) && (
                            <div className='mt-2'>
                              {item.selectedAddons.map(
                                (addonGroup, groupIndex) =>
                                  addonGroup.options &&
                                  addonGroup.options.length > 0 && (
                                    <div
                                      key={`addon-group-${item.id}-${groupIndex}`}
                                      className='mt-1'
                                    >
                                      <p className='text-xs text-gray-600 mb-0.5'>
                                        {addonGroup.title}:
                                      </p>
                                      <ul className='pl-2'>
                                        {addonGroup.options.map(
                                          (option, optIndex) => (
                                            <li
                                              key={`option-${item.id}-${groupIndex}-${optIndex}`}
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
                      </div>
                      <div className='text-sm font-medium text-gray-900'>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Delivery Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>
                    Delivery Address
                  </h4>
                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <div className='flex items-start'>
                      <MapPin className='h-5 w-5 text-amber-600 mr-2 mt-0.5' />
                      <div>
                        <p className='text-sm text-gray-700'>
                          {order.deliveryAddress.street}
                        </p>
                        <p className='text-sm text-gray-700'>
                          {order.deliveryAddress.city},{' '}
                          {order.deliveryAddress.state}{' '}
                          {order.deliveryAddress.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>
                    Payment Method
                  </h4>
                  <div className='bg-gray-50 p-3 rounded-lg flex items-center'>
                    <CreditCard className='h-5 w-5 text-amber-600 mr-2' />
                    <p className='text-sm text-gray-700 capitalize'>
                      {order.paymentMethod || 'Cash on Delivery'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>
                  Order Summary
                </h4>
                <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Subtotal:</span>
                    <span className='text-gray-900 font-medium'>
                      $
                      {order.subtotal
                        ? order.subtotal.toFixed(2)
                        : (order.total * 0.91).toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Tax (9%):</span>
                    <span className='text-gray-900 font-medium'>
                      $
                      {order.tax
                        ? order.tax.toFixed(2)
                        : (order.total * 0.09).toFixed(2)}
                    </span>
                  </div>
                  {order.deliveryFee !== undefined && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Delivery Fee:</span>
                      <span className='text-gray-900 font-medium'>
                        {order.deliveryFee > 0
                          ? `$${order.deliveryFee.toFixed(2)}`
                          : 'Free'}
                      </span>
                    </div>
                  )}
                  {order.coupon && order.coupon.code && (
                    <div className='flex justify-between text-sm text-green-600'>
                      <span>Discount ({order.coupon.code}):</span>
                      <span className='font-medium'>
                        -${order.coupon.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm border-t border-gray-200 pt-2 mt-2'>
                    <span className='text-gray-800 font-medium'>Total:</span>
                    <span className='text-amber-600 font-bold'>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex justify-end pt-4 border-t border-gray-200'>
                {order && order.status === 'pending' && (
                  <button
                    type='button'
                    onClick={cancelOrder}
                    className='mr-3 px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm'
                    title='Warning: Cancelling an order is permanent and cannot be reversed'
                  >
                    <div className='flex items-center'>
                      <Ban className='h-4 w-4 mr-1' />
                      Cancel Order
                    </div>
                  </button>
                )}
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm'
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className='py-10 text-center'>
              <p className='text-gray-500'>No order information available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
