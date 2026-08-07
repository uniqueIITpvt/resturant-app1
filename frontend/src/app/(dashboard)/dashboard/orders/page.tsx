'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  Calendar,
  DollarSign,
  Package,
  ChevronRight,
  ChevronLeft,
  ListFilter,
  Grid3X3,
  AlertCircle,
  ArrowUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  cancelledBy?: 'user' | 'admin';
  cancelledAt?: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  deliveryAddress: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  paymentMethod?: string;
}

// Status configurations including colors, background colors, and icons
const STATUS_CONFIG = {
  pending: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: <Clock className='h-4 w-4' />,
    progressValue: 25,
    progressColor: 'bg-yellow-500',
  },
  processing: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: <Package className='h-4 w-4' />,
    progressValue: 50,
    progressColor: 'bg-blue-500',
  },
  completed: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: <CheckCircle className='h-4 w-4' />,
    progressValue: 100,
    progressColor: 'bg-green-500',
  },
  cancelled: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: <XCircle className='h-4 w-4' />,
    progressValue: 100,
    progressColor: 'bg-red-500',
  },
};

export default function OrdersManagementPage() {
  const { token, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'pending' | 'processing' | 'completed' | 'cancelled' | 'error';
  }>({
    show: false,
    message: '',
    type: 'completed',
  });

  // New state variables for enhanced UI
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortField, setSortField] = useState<keyof Order | 'user.name'>(
    'createdAt'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Changed from state to constant since setter is unused
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });

  // Stats for dashboard overview
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Redirect if not admin or not authenticated
    if (!isAuthenticated() || !(isAdmin() || isSuperAdmin())) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
  }, [token, isAuthenticated, isAdmin, isSuperAdmin, router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        logout();
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);

      // Calculate stats for the dashboard overview
      const totalRevenue = data.reduce(
        (sum: number, order: Order) => sum + order.total,
        0
      );
      const pendingOrders = data.filter(
        (order: Order) => order.status === 'pending'
      ).length;
      const processingOrders = data.filter(
        (order: Order) => order.status === 'processing'
      ).length;
      const completedOrders = data.filter(
        (order: Order) => order.status === 'completed'
      ).length;
      const cancelledOrders = data.filter(
        (order: Order) => order.status === 'cancelled'
      ).length;

      setStats({
        totalOrders: data.length,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to show toast notification
  const showToast = (
    message: string,
    type:
      | 'pending'
      | 'processing'
      | 'completed'
      | 'cancelled'
      | 'error' = 'completed'
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const updatedOrder = await response.json();

      // Update local orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      showToast(
        `Order #${updatedOrder.orderNumber} status updated to ${newStatus}`,
        newStatus as 'pending' | 'processing' | 'completed' | 'cancelled'
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast(
        err instanceof Error ? err.message : 'Failed to update order status',
        'error'
      );
    } finally {
      setIsUpdating(false);
      setUpdatingOrderId(null);
    }
  };

  // Handle view order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Enhanced status styling with the new STATUS_CONFIG
  const getStatusBadge = (status: Order['status']) => {
    const config = STATUS_CONFIG[status];

    // Handle case where status or config is undefined
    if (!status || !config) {
      return (
        <div
          className='flex items-center gap-1.5 px-3 py-1 rounded-full 
                        bg-gray-100 text-gray-700 border-gray-200 border'
        >
          <AlertCircle className='h-4 w-4' />
          <span className='font-medium text-xs'>Unknown</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full 
                      ${config.bgColor} ${config.color} ${config.borderColor} border`}
      >
        {config.icon}
        <span className='font-medium text-xs'>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  };

  // Progress indicator for order status
  const getStatusProgress = (status: Order['status']) => {
    const config = STATUS_CONFIG[status];

    // Handle case where status or config is undefined
    if (!status || !config) {
      return (
        <div className='w-full bg-gray-200 rounded-full h-1.5 mt-2'>
          <div
            className='h-1.5 rounded-full bg-gray-400'
            style={{ width: '0%' }}
          ></div>
        </div>
      );
    }

    return (
      <div className='w-full bg-gray-200 rounded-full h-1.5 mt-2'>
        <div
          className={`h-1.5 rounded-full ${config.progressColor}`}
          style={{ width: `${config.progressValue}%` }}
        ></div>
      </div>
    );
  };

  // Function to sort orders based on field and direction
  const sortOrders = (
    orders: Order[],
    field: string,
    direction: 'asc' | 'desc'
  ) => {
    return [...orders].sort((a, b) => {
      let valueA, valueB;

      // Handle nested fields (like user.name)
      if (field === 'user.name') {
        valueA = a.user?.name || '';
        valueB = b.user?.name || '';
      } else if (field === 'createdAt') {
        valueA = new Date(a.createdAt || 0).getTime();
        valueB = new Date(b.createdAt || 0).getTime();
      } else {
        valueA = a[field as keyof Order] || '';
        valueB = b[field as keyof Order] || '';
      }

      // Safely compare values
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Function to toggle sort direction or set a new sort field
  const handleSort = (field: keyof Order | 'user.name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to filter orders based on search, status, and date range
  const filterOrders = (orders: Order[]) => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(searchLower) ||
          (order.user?.name?.toLowerCase() || '').includes(searchLower) ||
          (order.user?.email?.toLowerCase() || '').includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Date range filter
      if (dateRange.start && dateRange.end) {
        const orderDate = new Date(order.createdAt).getTime();
        const startDate = new Date(dateRange.start).getTime();
        const endDate = new Date(dateRange.end).getTime() + 24 * 60 * 60 * 1000; // Include end date fully

        if (orderDate < startDate || orderDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  // Get current page of orders for pagination
  const getCurrentPageOrders = (orders: Order[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return orders.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate item total including addons
  const calculateItemTotal = (item: OrderItem) => {
    let total = item.price;

    // Add addon prices
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      item.selectedAddons.forEach((addonGroup) => {
        if (addonGroup.options && addonGroup.options.length > 0) {
          addonGroup.options.forEach((option) => {
            total += option.price;
          });
        }
      });
    }

    return total * item.quantity;
  };

  // Check if an order has any items with addons
  const hasAddons = (order: Order) => {
    return order.items.some(
      (item) =>
        item.selectedAddons &&
        item.selectedAddons.length > 0 &&
        item.selectedAddons.some(
          (group) => group.options && group.options.length > 0
        )
    );
  };

  // Process orders - filter, sort, and paginate
  const processedOrders = useMemo(() => {
    let result = filterOrders(orders);
    result = sortOrders(result, sortField, sortDirection);
    return result;
  }, [orders, statusFilter, searchTerm, dateRange, sortField, sortDirection]);

  // Get current page orders
  const currentOrders = getCurrentPageOrders(processedOrders);

  // Total pages for pagination
  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);

  // Function to get payment method badge with proper styling
  const getPaymentBadge = (paymentMethod?: string) => {
    if (!paymentMethod)
      return <span className='text-gray-500'>Not specified</span>;

    const isOnline =
      paymentMethod.toLowerCase().includes('online') ||
      paymentMethod.toLowerCase().includes('card') ||
      paymentMethod.toLowerCase().includes('paypal') ||
      paymentMethod.toLowerCase().includes('stripe');

    const isCash =
      paymentMethod.toLowerCase().includes('cash') ||
      paymentMethod.toLowerCase().includes('cod') ||
      paymentMethod.toLowerCase().includes('delivery');

    if (isOnline) {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
          <span className='mr-1'>💳</span> Online Payment
        </span>
      );
    } else if (isCash) {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
          <span className='mr-1'>💵</span> Cash on Delivery
        </span>
      );
    } else {
      return <span className='text-gray-700'>{paymentMethod}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-red-50 border-l-4 border-red-500 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <XCircle className='h-5 w-5 text-red-500' />
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl shadow bg-white'>
      {/* Dashboard Header with Stats */}
      <div className='p-6 bg-gradient-to-r from-violet-50 to-blue-50 border-b'>
        <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Orders Management
            </h1>
            <p className='text-gray-600 mt-1'>
              View and manage customer orders
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <button
              onClick={() =>
                setViewMode(viewMode === 'grid' ? 'table' : 'grid')
              }
              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
            >
              {viewMode === 'grid' ? (
                <ListFilter className='text-gray-600 w-5 h-5' />
              ) : (
                <Grid3X3 className='text-gray-600 w-5 h-5' />
              )}
            </button>

            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className='p-2 rounded-md hover:bg-gray-100 transition-colors'
            >
              <Calendar className='text-gray-600 w-5 h-5' />
            </button>

            <div className='relative'>
              <input
                type='text'
                placeholder='Search orders...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
          <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Total Orders
                </p>
                <h3 className='text-2xl font-bold mt-1'>{stats.totalOrders}</h3>
              </div>
              <div className='p-2 bg-blue-50 rounded-md'>
                <ShoppingBag className='h-6 w-6 text-blue-500' />
              </div>
            </div>
            <div className='mt-2 flex items-center text-xs'>
              <span className='text-green-500 flex items-center'>
                <ArrowUp className='mr-1 h-3 w-3' />
                8.2%
              </span>
              <span className='text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>

          <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Pending Orders
                </p>
                <h3 className='text-2xl font-bold mt-1'>
                  {stats.pendingOrders}
                </h3>
              </div>
              <div className='p-2 bg-amber-50 rounded-md'>
                <Clock className='h-6 w-6 text-amber-500' />
              </div>
            </div>
            <div className='mt-2 flex items-center text-xs'>
              <span className='text-red-500 flex items-center'>
                <ArrowUp className='mr-1 h-3 w-3' />
                12.5%
              </span>
              <span className='text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>

          <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Revenue</p>
                <h3 className='text-2xl font-bold mt-1'>
                  ${stats.totalRevenue.toFixed(2)}
                </h3>
              </div>
              <div className='p-2 bg-green-50 rounded-md'>
                <DollarSign className='h-6 w-6 text-green-500' />
              </div>
            </div>
            <div className='mt-2 flex items-center text-xs'>
              <span className='text-green-500 flex items-center'>
                <ArrowUp className='mr-1 h-3 w-3' />
                18.3%
              </span>
              <span className='text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>

          <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Completed</p>
                <h3 className='text-2xl font-bold mt-1'>
                  {stats.completedOrders}
                </h3>
              </div>
              <div className='p-2 bg-teal-50 rounded-md'>
                <CheckCircle className='h-6 w-6 text-teal-500' />
              </div>
            </div>
            <div className='mt-2 flex items-center text-xs'>
              <span className='text-green-500 flex items-center'>
                <ArrowUp className='mr-1 h-3 w-3' />
                6.8%
              </span>
              <span className='text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter popover */}
      {showDateFilter && (
        <div className='p-4 border-b'>
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Start Date
              </label>
              <input
                type='date'
                value={dateRange.start || ''}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className='border rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                End Date
              </label>
              <input
                type='date'
                value={dateRange.end || ''}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className='border rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div className='self-end'>
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className='px-4 py-2 border text-gray-600 rounded-md hover:bg-gray-50 text-sm'
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className='p-4 border-b'>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${
                        statusFilter === 'all'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
          >
            All Orders
          </button>

          {Object.keys(STATUS_CONFIG).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors
                        ${
                          statusFilter === status
                            ? `${
                                STATUS_CONFIG[status as Order['status']].bgColor
                              } ${
                                STATUS_CONFIG[status as Order['status']].color
                              }`
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
            >
              {STATUS_CONFIG[status as Order['status']].icon}
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className='ml-1 bg-white bg-opacity-30 px-2 rounded-full text-xs'>
                {status === 'pending'
                  ? stats.pendingOrders
                  : status === 'processing'
                  ? stats.processingOrders
                  : status === 'completed'
                  ? stats.completedOrders
                  : status === 'cancelled'
                  ? stats.cancelledOrders
                  : 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className='flex justify-center items-center py-20'>
          <div className='spinner'></div>
          <p className='ml-2 text-gray-600'>Loading orders...</p>
        </div>
      )}

      {error && (
        <div className='bg-red-50 p-4 border border-red-100 rounded-md m-6'>
          <div className='flex'>
            <AlertCircle className='h-5 w-5 text-red-400' />
            <p className='ml-3 text-red-700'>{error}</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && processedOrders.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16'>
          <ShoppingBag className='h-12 w-12 text-gray-300' />
          <h3 className='mt-4 text-lg font-medium text-gray-900'>
            No orders found
          </h3>
          <p className='mt-1 text-gray-500'>
            {searchTerm ||
            statusFilter !== 'all' ||
            (dateRange.start && dateRange.end)
              ? 'Try changing your search or filter criteria'
              : 'No orders have been placed yet'}
          </p>
        </div>
      )}

      {/* Orders Display - Grid or Table */}
      {!isLoading && !error && processedOrders.length > 0 && (
        <div className='p-4'>
          {viewMode === 'grid' ? (
            // Grid View
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {currentOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className='border rounded-lg overflow-hidden hover:shadow-md transition-shadow relative'
                  onMouseEnter={() => setHoveredOrderId(order.orderNumber)}
                  onMouseLeave={() => setHoveredOrderId(null)}
                >
                  <div className='p-4 border-b flex justify-between items-center'>
                    <div>
                      <h4 className='font-bold text-gray-900'>
                        {order.orderNumber}
                      </h4>
                      <p className='text-sm text-gray-500'>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className='p-4'>
                    <div className='flex justify-between mb-3'>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>
                          Customer
                        </p>
                        <p className='text-sm text-gray-600'>
                          {order.user?.name || 'N/A'}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-700'>
                          Total
                        </p>
                        <p className='text-sm font-semibold text-gray-900'>
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className='mb-3'>
                      <p className='text-sm font-medium text-gray-700 mb-1'>
                        Items
                      </p>
                      <div className='flex flex-wrap gap-1'>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className='text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-700 truncate max-w-[150px]'
                          >
                            {item.quantity}× {item.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='mb-3'>
                      <p className='text-sm font-medium text-gray-700 mb-1'>
                        Payment
                      </p>
                      <div>{getPaymentBadge(order.paymentMethod)}</div>
                    </div>

                    {getStatusProgress(order.status)}
                  </div>

                  {/* Actions overlay - visible on hover */}
                  {hoveredOrderId === order.orderNumber && (
                    <div className='absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center'>
                      <div className='flex gap-2'>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              order._id,
                              e.target.value as Order['status']
                            )
                          }
                          className={`px-3 py-1.5 bg-white rounded-md text-sm ${
                            order.status === 'cancelled' &&
                            order.cancelledBy === 'user'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          disabled={
                            (isUpdating && updatingOrderId === order._id) ||
                            (order.status === 'cancelled' &&
                              order.cancelledBy === 'user')
                          }
                          title={
                            order.status === 'cancelled' &&
                            order.cancelledBy === 'user'
                              ? 'This order was cancelled by the customer and cannot be modified'
                              : ''
                          }
                        >
                          {Object.keys(STATUS_CONFIG).map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        {isUpdating && updatingOrderId === order._id && (
                          <div className='spinner'></div>
                        )}
                        <button
                          className='bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700'
                          onClick={() => handleViewOrder(order)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Table View
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <button
                        onClick={() => handleSort('orderNumber')}
                        className='flex items-center space-x-1'
                      >
                        <span>Order</span>
                        {sortField === 'orderNumber' &&
                          (sortDirection === 'asc' ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4 transform rotate-180' />
                          ))}
                      </button>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <span>Items</span>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <button
                        onClick={() => handleSort('createdAt')}
                        className='flex items-center space-x-1'
                      >
                        <span>Date</span>
                        {sortField === 'createdAt' &&
                          (sortDirection === 'asc' ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4 transform rotate-180' />
                          ))}
                      </button>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <button
                        onClick={() => handleSort('user.name')}
                        className='flex items-center space-x-1'
                      >
                        <span>Customer</span>
                        {sortField === 'user.name' &&
                          (sortDirection === 'asc' ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4 transform rotate-180' />
                          ))}
                      </button>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <button
                        onClick={() => handleSort('status')}
                        className='flex items-center space-x-1'
                      >
                        <span>Status</span>
                        {sortField === 'status' &&
                          (sortDirection === 'asc' ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4 transform rotate-180' />
                          ))}
                      </button>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      <button
                        onClick={() => handleSort('total')}
                        className='flex items-center space-x-1'
                      >
                        <span>Total</span>
                        {sortField === 'total' &&
                          (sortDirection === 'asc' ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4 transform rotate-180' />
                          ))}
                      </button>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Payment Method
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {currentOrders.map((order) => (
                    <tr key={order.orderNumber} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <span className='text-sm text-gray-900'>
                            {order.items.length} item
                            {order.items.length !== 1 ? 's' : ''}
                          </span>
                          {hasAddons(order) && (
                            <span className='ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full'>
                              With Addons
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-500'>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {order.user?.name || 'N/A'}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {order.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {getStatusBadge(order.status)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-semibold text-gray-900'>
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>{getPaymentBadge(order.paymentMethod)}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex justify-end space-x-2 items-center'>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                order._id,
                                e.target.value as Order['status']
                              )
                            }
                            className={`text-xs border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 ${
                              order.status === 'cancelled' &&
                              order.cancelledBy === 'user'
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            disabled={
                              (isUpdating && updatingOrderId === order._id) ||
                              (order.status === 'cancelled' &&
                                order.cancelledBy === 'user')
                            }
                            title={
                              order.status === 'cancelled' &&
                              order.cancelledBy === 'user'
                                ? 'This order was cancelled by the customer and cannot be modified'
                                : ''
                            }
                          >
                            {Object.keys(STATUS_CONFIG).map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </option>
                            ))}
                          </select>
                          {isUpdating && updatingOrderId === order._id && (
                            <span className='spinner ml-1'></span>
                          )}
                          <button
                            className='text-blue-600 hover:text-blue-900'
                            onClick={() => handleViewOrder(order)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className='flex justify-between items-center mt-6'>
            <div className='text-sm text-gray-700'>
              Showing{' '}
              <span className='font-medium'>
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className='font-medium'>
                {Math.min(currentPage * itemsPerPage, processedOrders.length)}
              </span>{' '}
              of <span className='font-medium'>{processedOrders.length}</span>{' '}
              results
            </div>

            <div className='flex gap-1'>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className='h-5 w-5' />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to determine which page numbers to show
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className='h-5 w-5' />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg 
          ${
            toast.type === 'pending'
              ? 'bg-yellow-500'
              : toast.type === 'processing'
              ? 'bg-blue-500'
              : toast.type === 'completed'
              ? 'bg-green-500'
              : toast.type === 'cancelled'
              ? 'bg-red-500'
              : 'bg-red-500'
          } 
          text-white flex items-center transition-all duration-300 transform translate-y-0`}
        >
          {toast.type === 'pending' ? (
            <Clock className='h-5 w-5 mr-2' />
          ) : toast.type === 'processing' ? (
            <Package className='h-5 w-5 mr-2' />
          ) : toast.type === 'completed' ? (
            <CheckCircle className='h-5 w-5 mr-2' />
          ) : toast.type === 'cancelled' ? (
            <XCircle className='h-5 w-5 mr-2' />
          ) : (
            <AlertCircle className='h-5 w-5 mr-2' />
          )}
          <p>{toast.message}</p>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className='ml-4 text-white hover:text-gray-200'
          >
            <XCircle className='h-4 w-4' />
          </button>
        </div>
      )}

      {/* Add the order details modal */}
      {isModalOpen && selectedOrder && (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Order #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <XCircle className='h-6 w-6' />
                </button>
              </div>
            </div>

            <div className='p-6 border-b border-gray-200'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4'>
                <div>
                  <p className='text-sm text-gray-500 mb-1'>Date Placed</p>
                  <p className='text-base font-medium'>
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Add cancelled information */}
              {selectedOrder.status === 'cancelled' &&
                selectedOrder.cancelledBy && (
                  <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                    <div className='flex items-start'>
                      <XCircle className='h-5 w-5 text-red-500 mr-2 mt-0.5' />
                      <div>
                        <p className='text-sm font-medium text-red-800'>
                          Cancelled by{' '}
                          {selectedOrder.cancelledBy === 'user'
                            ? 'Customer'
                            : 'Admin'}
                        </p>
                        {selectedOrder.cancelledAt && (
                          <p className='text-xs text-red-700 mt-1'>
                            on {formatDate(selectedOrder.cancelledAt)}
                          </p>
                        )}
                        {selectedOrder.cancelledBy === 'user' && (
                          <p className='text-xs text-red-700 mt-1 font-medium'>
                            This order was cancelled by the customer and cannot
                            be modified.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              <div className='mt-4'>
                <p className='text-sm text-gray-500 mb-1'>Customer</p>
                <p className='text-base font-medium'>
                  {selectedOrder.user?.name || 'N/A'}
                </p>
                <p className='text-sm text-gray-600'>
                  {selectedOrder.user?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className='p-6 border-b border-gray-200'>
              <h3 className='font-medium text-gray-900 mb-4'>Items</h3>
              <div className='space-y-4'>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className='flex items-start'>
                    <div className='h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative'>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='flex items-center justify-center h-full'>
                          <ShoppingBag size={24} className='text-gray-400' />
                        </div>
                      )}
                    </div>
                    <div className='ml-4 flex-1'>
                      <div className='flex justify-between'>
                        <div>
                          <h4 className='text-sm font-medium text-gray-900'>
                            {item.name}
                          </h4>
                          <p className='text-sm text-gray-500 mt-1'>
                            Qty: {item.quantity}
                          </p>

                          {/* Display addons if they exist */}
                          {item.selectedAddons &&
                            item.selectedAddons.length > 0 && (
                              <div className='mt-2'>
                                {item.selectedAddons.map(
                                  (addonGroup, groupIndex) =>
                                    addonGroup.options &&
                                    addonGroup.options.length > 0 && (
                                      <div key={groupIndex} className='mb-1'>
                                        <p className='text-xs font-medium text-gray-700'>
                                          {addonGroup.title}:
                                        </p>
                                        <ul className='pl-2'>
                                          {addonGroup.options.map(
                                            (option, optIndex) => (
                                              <li
                                                key={optIndex}
                                                className='text-xs flex justify-between text-gray-600'
                                              >
                                                <span>{option.name}</span>
                                                <span>
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
                        <p className='text-sm font-medium text-gray-900'>
                          ${calculateItemTotal(item).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.deliveryAddress && (
              <div className='p-6 border-b border-gray-200'>
                <h3 className='font-medium text-gray-900 mb-4'>
                  Delivery Information
                </h3>
                <div className='text-sm text-gray-700'>
                  <div className='flex'>
                    <span className='font-medium'>Address:</span>
                    <span className='ml-1'>
                      {selectedOrder.deliveryAddress.street},{' '}
                      {selectedOrder.deliveryAddress.city},{' '}
                      {selectedOrder.deliveryAddress.state}{' '}
                      {selectedOrder.deliveryAddress.zipCode}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className='p-6'>
              <h3 className='font-medium text-gray-900 mb-4'>Order Summary</h3>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='font-medium'>
                    $
                    {selectedOrder.subtotal
                      ? selectedOrder.subtotal.toFixed(2)
                      : selectedOrder.total.toFixed(2)}
                  </span>
                </div>

                {selectedOrder.tax !== undefined && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Tax</span>
                    <span className='font-medium'>
                      ${selectedOrder.tax.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Delivery Fee</span>
                  <span className='font-medium'>
                    {selectedOrder.deliveryFee === 0 ||
                    selectedOrder.deliveryFee === undefined
                      ? 'Free'
                      : `$${selectedOrder.deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {selectedOrder.coupon && selectedOrder.coupon.code && (
                  <div className='flex justify-between text-sm text-green-600'>
                    <span>Coupon Discount ({selectedOrder.coupon.code})</span>
                    <span className='font-medium'>
                      -${selectedOrder.coupon.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className='pt-2 mt-2 border-t border-gray-200 flex justify-between'>
                  <span className='font-medium text-gray-900'>Total</span>
                  <span className='font-bold text-gray-900'>
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedOrder.paymentMethod && (
                <div className='mt-4'>
                  <h3 className='font-medium text-gray-900 mb-2'>
                    Payment Method
                  </h3>
                  <div className='text-sm bg-gray-50 p-3 rounded-md border border-gray-200'>
                    {getPaymentBadge(selectedOrder.paymentMethod)}
                  </div>
                </div>
              )}

              <div className='mt-6 flex justify-end'>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
