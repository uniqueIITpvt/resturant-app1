'use client';

import Link from 'next/link';
import {
  Eye,
  Ban,
  MessageSquare,
  ShoppingBag,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedAddons?: {
    groupTitle: string;
    options: {
      name: string;
      price: number;
    }[];
  }[];
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  deliveryAddress: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

interface OrdersTabProps {
  orders: Order[];
  allOrders: Order[];
  showAllOrders: boolean;
  isFetchingOrders: boolean;
  onViewOrderDetails: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onOpenReviewModal: (order: Order, product: OrderItem) => void;
  onSeeAllOrders: () => void;
  onShowLessOrders: () => void;
  isProductReviewed: (orderId: string, productId: string) => boolean;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: Order['status']) => React.ReactNode;
}

export default function OrdersTab({
  orders,
  allOrders,
  showAllOrders,
  isFetchingOrders,
  onViewOrderDetails,
  onCancelOrder,
  onOpenReviewModal,
  onSeeAllOrders,
  onShowLessOrders,
  isProductReviewed,
  formatDate,
  getStatusBadge,
}: OrdersTabProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <section className='w-full max-w-7xl mx-auto' id='orders-section'>
      {/* Header Section with Stats */}
      <div className='mb-8'>
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
              My Orders
            </h2>
            <p className='text-gray-500'>
              {orders.length > 0
                ? `You have placed ${allOrders.length} ${
                    allOrders.length === 1 ? 'order' : 'orders'
                  } with us`
                : "You haven't placed any orders yet"}
            </p>
          </div>

          {allOrders.length > 0 && (
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {['pending', 'processing', 'completed', 'cancelled'].map(
                (status) => {
                  const count = allOrders.filter(
                    (o) => o.status === status
                  ).length;
                  const colors: Record<string, string> = {
                    pending: 'bg-blue-50 text-blue-700 border-blue-200',
                    processing: 'bg-amber-50 text-amber-700 border-amber-200',
                    completed: 'bg-green-50 text-green-700 border-green-200',
                    cancelled: 'bg-red-50 text-red-700 border-red-200',
                  };

                  return (
                    <div
                      key={status}
                      className={`px-4 py-3 rounded-xl border ${colors[status]} flex flex-col items-center justify-center`}
                    >
                      <span className='text-xl font-bold'>{count}</span>
                      <span className='text-xs capitalize'>{status}</span>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {!showAllOrders && allOrders.length > 3 && (
          <button
            onClick={onSeeAllOrders}
            className='w-full sm:w-auto px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center'
          >
            <ShoppingBag className='h-4 w-4 mr-2' />
            View All Orders ({allOrders.length})
          </button>
        )}
      </div>

      {isFetchingOrders ? (
        // Professional Loading Skeleton
        <div className='space-y-6'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse'
            >
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
                <div className='space-y-3 flex-1'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='h-6 bg-gray-200 rounded-lg w-32'></div>
                    <div className='h-5 bg-gray-200 rounded-full w-24'></div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='h-4 bg-gray-200 rounded w-40'></div>
                  </div>
                </div>
                <div className='h-8 bg-gray-200 rounded-lg w-28'></div>
              </div>
              <div className='h-20 bg-gray-100 rounded-xl w-full'></div>
              <div className='mt-4 flex gap-3'>
                <div className='h-10 bg-gray-200 rounded-xl flex-1'></div>
                <div className='h-10 bg-gray-200 rounded-xl flex-1'></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className='space-y-6'>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const hasUnreviewedProduct = order.items.some(
              (item) => !isProductReviewed(order._id, item.id)
            );

            return (
              <div
                key={order._id}
                className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200'
              >
                {/* Order Header */}
                <div
                  className='p-4 sm:p-6 cursor-pointer'
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-center gap-2 mb-1.5'>
                        <h3 className='text-lg font-bold text-gray-900'>
                          Order #{order.orderNumber}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className='flex flex-wrap items-center text-sm text-gray-500 gap-3 mb-1'>
                        <div className='flex items-center'>
                          <Calendar className='h-3.5 w-3.5 mr-1.5 text-gray-400' />
                          {formatDate(order.createdAt)}
                        </div>
                        <div className='flex items-center'>
                          <ShoppingBag className='h-3.5 w-3.5 mr-1.5 text-gray-400' />
                          {order.items.length}{' '}
                          {order.items.length === 1 ? 'item' : 'items'}
                        </div>
                      </div>

                      {order.deliveryAddress && (
                        <div className='flex items-center text-xs text-gray-400 mt-1'>
                          <MapPin className='h-3 w-3 mr-1.5 flex-shrink-0' />
                          <span className='truncate'>
                            {order.deliveryAddress.street &&
                              `${order.deliveryAddress.street}, `}
                            {order.deliveryAddress.city},{' '}
                            {order.deliveryAddress.state}
                            {order.deliveryAddress.postalCode &&
                              ` ${order.deliveryAddress.postalCode}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className='flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4'>
                      <div className='text-xl font-bold text-gray-900'>
                        ${order.total.toFixed(2)}
                      </div>
                      <button className='text-amber-500 p-1 hover:bg-amber-50 rounded-full transition-colors'>
                        <svg
                          className={`w-5 h-5 transform transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Order Details */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? 'max-h-[500px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className='px-4 sm:px-6 pb-5'>
                    {/* Order Items */}
                    <div className='bg-gray-50 rounded-xl p-4 mb-5'>
                      <h4 className='font-medium text-gray-700 mb-3'>
                        Order Items
                      </h4>
                      <ul className='divide-y divide-gray-100'>
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className='py-3 flex items-center gap-3'
                          >
                            {item.image ? (
                              <div className='w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0'>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className='object-cover'
                                />
                              </div>
                            ) : (
                              <div className='w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0'>
                                <ShoppingBag className='h-6 w-6 text-amber-500' />
                              </div>
                            )}

                            <div className='flex-1 min-w-0'>
                              <p className='font-medium text-gray-900 truncate'>
                                {item.name}
                              </p>
                              <div className='flex items-center text-sm text-gray-500'>
                                <span>${item.price.toFixed(2)}</span>
                                <span className='mx-2'>•</span>
                                <span>Qty: {item.quantity}</span>

                                {order.status === 'completed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (
                                        !isProductReviewed(order._id, item.id)
                                      ) {
                                        onOpenReviewModal(order, item);
                                      }
                                    }}
                                    disabled={isProductReviewed(
                                      order._id,
                                      item.id
                                    )}
                                    className={`ml-auto px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      isProductReviewed(order._id, item.id)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    }`}
                                  >
                                    {isProductReviewed(order._id, item.id)
                                      ? 'Reviewed'
                                      : 'Review'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-3'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrderDetails(order._id);
                        }}
                        className='flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center'
                      >
                        <Eye className='h-4 w-4 mr-2' />
                        Order Details
                      </button>

                      {/* Review Button - Completed Orders */}
                      {order.status === 'completed' && hasUnreviewedProduct && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const unreviewedProduct = order.items.find(
                              (item) => !isProductReviewed(order._id, item.id)
                            );
                            if (unreviewedProduct) {
                              onOpenReviewModal(order, unreviewedProduct);
                            }
                          }}
                          className='flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors flex items-center justify-center'
                        >
                          <MessageSquare className='h-4 w-4 mr-2' />
                          Write a Review
                        </button>
                      )}

                      {/* Cancel Button - Pending Orders */}
                      {order.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelOrder(order._id);
                          }}
                          className='flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center'
                        >
                          <Ban className='h-4 w-4 mr-2' />
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {((!showAllOrders && allOrders.length > 3) ||
            (showAllOrders && allOrders.length > 3)) && (
            <div className='flex justify-center pt-4'>
              {!showAllOrders ? (
                <button
                  onClick={onSeeAllOrders}
                  className='group px-8 py-3 bg-white border-2 border-amber-500 text-amber-600 rounded-full font-medium hover:bg-amber-50 transition-all duration-200 flex items-center'
                >
                  <span>View all {allOrders.length} orders</span>
                  <svg
                    className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M14 5l7 7m0 0l-7 7m7-7H3'
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={onShowLessOrders}
                  className='px-8 py-3 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                  <span>Show fewer orders</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Empty State
        <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-dashed border-amber-200 overflow-hidden'>
          <div className='text-center py-16 px-6'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg'>
              <ShoppingBag className='h-12 w-12 text-white' />
            </div>

            <h3 className='text-2xl font-bold text-gray-900 mb-3'>
              No orders yet
            </h3>
            <p className='text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed'>
              Ready to taste something amazing? Browse our menu and place your
              first order!
            </p>

            <Link
              href='/menu'
              className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            >
              <ShoppingBag className='h-5 w-5 mr-2' />
              Browse Menu
            </Link>

            <div className='mt-8 text-sm text-gray-500 flex flex-wrap justify-center gap-3'>
              <span className='px-3 py-1 bg-white rounded-full shadow-sm'>
                🍕 Pizza
              </span>
              <span className='px-3 py-1 bg-white rounded-full shadow-sm'>
                🍔 Burgers
              </span>
              <span className='px-3 py-1 bg-white rounded-full shadow-sm'>
                🥗 Salads
              </span>
              <span className='px-3 py-1 bg-white rounded-full shadow-sm'>
                🍰 Desserts
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
