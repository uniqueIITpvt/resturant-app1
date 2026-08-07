'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCw,
} from 'lucide-react';

import useToast from '@/hooks/useToast';
import { useConfirmationDialog } from '@/providers/ConfirmationProvider';
import { useAuth } from '@/context/AuthContext';
import { ToastContainer } from '@/components/ui/Toast';

// Define API URL for backend requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Define interface for the API user data
interface ApiUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  mobileNumber?: string;
  phoneNumber?: string;
  phone?: string;
  address?:
    | {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        postalCode?: string;
        country?: string;
      }
    | string;
  city?: string;
  state?: string;
  zipCode?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  updatedAt?: string;
  createdAt?: string;
  role?: string;
  userType?: string;
  orderStats?: {
    count: number;
    spent: number;
    lastOrderDate: string;
  };
  country?: string;
  addresses?: Array<{
    addressType?: string;
    name?: string;
    phoneNumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
    additionalDirections?: string;
    landmark?: string;
    _id?: string;
  }>;
  isVerified?: boolean;
}

type CustomerData = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  isVerified: boolean;
};

export default function CustomersPage() {
  const { token } = useAuth();
  const { toasts, removeToast, showError, showSuccess } = useToast();
  const { confirmDelete } = useConfirmationDialog();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [spendingFilter, setSpendingFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [sortField, setSortField] = useState('lastOrderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(
    null
  );
  const [customerToDelete, setCustomerToDelete] = useState<CustomerData | null>(
    null
  );
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch customers data
  const fetchCustomers = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch users with more detailed params to get customer data specifically
      const response = await fetch(
        `${API_URL}/api/users?role=user&userType=customer&includeDetails=true&includeStats=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          showError('Authentication failed. Please log in again.');
          return;
        }

        if (response.status === 403) {
          setError('You do not have permission to view customers.');
          showError('You do not have permission to view customers.');
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch customers');
      }

      const data = await response.json();
      console.log('API response data:', data); // Log for debugging

      // Transform user data into the CustomerData format with all fields
      const transformedData: CustomerData[] = (data.users || [])
        .filter(
          (user: ApiUser) =>
            user.role === 'user' || user.userType === 'customer'
        )
        .map((user: ApiUser) => {
          // Extract data or provide defaults
          let address = '';
          let city = '';
          let state = '';
          let zipCode = '';
          let country = '';
          let phoneNumber = '';

          // Get phone from phoneNumber field
          phoneNumber =
            user.phoneNumber || user.phone || user.mobileNumber || '';

          // Check if user has default address in addresses array
          const defaultAddress =
            user.addresses?.find((addr) => addr.isDefault) ||
            user.addresses?.[0];

          if (defaultAddress) {
            address = defaultAddress.street || '';
            city = defaultAddress.city || '';
            state = defaultAddress.state || '';
            zipCode = defaultAddress.postalCode || defaultAddress.zipCode || '';
            country = defaultAddress.country || '';
            // If the address has its own phoneNumber, prioritize it
            if (defaultAddress.phoneNumber) {
              phoneNumber = defaultAddress.phoneNumber;
            }
          } else if (user.address) {
            // Fallback to the legacy address field if no addresses array
            if (typeof user.address === 'string') {
              address = user.address;
            } else {
              address = user.address.street || '';
              city = user.address.city || '';
              state = user.address.state || '';
              zipCode = user.address.zipCode || user.address.postalCode || '';
              country = user.address.country || '';
            }
          }

          // Use city/state/zipCode fields from root if not found in address
          city = city || user.city || '';
          state = state || user.state || '';
          zipCode = zipCode || user.zipCode || '';
          country = country || user.country || '';

          // Get order data
          const totalOrders =
            typeof user.totalOrders === 'number'
              ? user.totalOrders
              : user.orderStats?.count || 0;

          // Get spending data
          const totalSpent =
            typeof user.totalSpent === 'number'
              ? user.totalSpent
              : user.orderStats?.spent || 0;

          // Get last order date
          const lastOrderDate =
            user.lastOrderDate ||
            user.orderStats?.lastOrderDate ||
            user.updatedAt ||
            new Date().toISOString();

          return {
            id: user.id || user._id || '',
            name: user.name || 'Unknown',
            email: user.email || '',
            phoneNumber,
            address,
            city,
            state,
            zipCode,
            country,
            totalOrders,
            totalSpent,
            lastOrderDate,
            createdAt: user.createdAt || new Date().toISOString(),
            isVerified: user.isVerified || false,
          };
        });

      console.log('Transformed customer data:', transformedData);
      setCustomers(transformedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch customers. Please try again.';
      setError(errorMessage);
      showError(errorMessage);

      // Fallback to mock data in case of error (for development)
      if (process.env.NODE_ENV === 'development') {
        const mockData = generateMockData();
        setCustomers(mockData);
      }

      setIsLoading(false);
    }
  }, [token, showError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const refreshCustomers = async () => {
    setIsRefreshing(true);
    await fetchCustomers();
    setIsRefreshing(false);
  };

  const handleDeleteCustomer = async (
    customerId: string,
    customerName: string
  ) => {
    try {
      const confirmed = await confirmDelete(customerName);
      if (!confirmed) return;

      // Delete user API call
      const response = await fetch(`${API_URL}/api/users/${customerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete customer');
      }

      // Update local state
      setCustomers(customers.filter((customer) => customer.id !== customerId));
      showSuccess(`Customer ${customerName} deleted successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete customer';
      showError(errorMessage);
    }
  };

  // Mock data generation - used as fallback if API fails
  const generateMockData = () => {
    const mockCustomers: CustomerData[] = Array.from({ length: 20 }, (_, i) => {
      const id = (i + 1).toString().padStart(3, '0');
      const now = new Date();
      const createdDate = new Date(now);
      createdDate.setDate(now.getDate() - Math.floor(Math.random() * 365));

      const lastOrderDate = new Date(now);
      lastOrderDate.setDate(now.getDate() - Math.floor(Math.random() * 60));

      const totalOrders = Math.floor(Math.random() * 20) + 1;
      const totalSpent = Math.round((Math.random() * 1000 + 50) * 100) / 100;

      // Generate realistic customer data with real names
      const firstNames = [
        'James',
        'Mary',
        'John',
        'Patricia',
        'Robert',
        'Jennifer',
        'Michael',
        'Linda',
        'William',
        'Elizabeth',
        'David',
        'Susan',
        'Richard',
        'Jessica',
        'Joseph',
        'Sarah',
        'Thomas',
        'Karen',
        'Charles',
        'Nancy',
      ];
      const lastNames = [
        'Smith',
        'Johnson',
        'Williams',
        'Jones',
        'Brown',
        'Davis',
        'Miller',
        'Wilson',
        'Moore',
        'Taylor',
        'Anderson',
        'Thomas',
        'Jackson',
        'White',
        'Harris',
        'Martin',
        'Thompson',
        'Garcia',
        'Martinez',
        'Robinson',
      ];
      const name = `${
        firstNames[Math.floor(Math.random() * firstNames.length)]
      } ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

      const cities = [
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
        'Philadelphia',
      ];
      const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'];
      const countries = ['USA', 'USA', 'USA', 'Canada', 'UK', 'Australia'];
      const cityIndex = Math.floor(Math.random() * cities.length);

      // Generate realistic phone number
      const areaCode = Math.floor(Math.random() * 800) + 200;
      const prefix = Math.floor(Math.random() * 900) + 100;
      const lineNum = Math.floor(Math.random() * 9000) + 1000;
      const phoneNumber = `(${areaCode}) ${prefix}-${lineNum}`;

      // Generate address components
      const streetNumbers = Math.floor(Math.random() * 9000) + 1000;
      const streetNames = [
        'Main St',
        'Oak Ave',
        'Maple Dr',
        'Washington Blvd',
        'Park Ln',
        'Cedar Rd',
      ];
      const streetName =
        streetNames[Math.floor(Math.random() * streetNames.length)];
      const address = `${streetNumbers} ${streetName}`;

      // Generate zip code based on city
      const zipBase = 10000 + cityIndex * 10000;
      const zipCode = (zipBase + Math.floor(Math.random() * 9000)).toString();

      return {
        id: `CUST-${id}`,
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        phoneNumber,
        address,
        city: cities[cityIndex],
        state: states[cityIndex],
        zipCode,
        country: countries[cityIndex],
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrderDate.toISOString(),
        createdAt: createdDate.toISOString(),
        isVerified: Math.random() > 0.3, // 70% of mock customers are verified
      };
    });

    return mockCustomers;
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phoneNumber && customer.phoneNumber.includes(searchQuery)) ||
        customer.id.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesSpending = true;
      if (spendingFilter === 'high') {
        matchesSpending = customer.totalSpent > 500;
      } else if (spendingFilter === 'medium') {
        matchesSpending =
          customer.totalSpent >= 100 && customer.totalSpent <= 500;
      } else if (spendingFilter === 'low') {
        matchesSpending = customer.totalSpent < 100;
      }

      let matchesOrders = true;
      if (orderFilter === 'frequent') {
        matchesOrders = customer.totalOrders > 10;
      } else if (orderFilter === 'regular') {
        matchesOrders = customer.totalOrders >= 3 && customer.totalOrders <= 10;
      } else if (orderFilter === 'new') {
        matchesOrders = customer.totalOrders < 3;
      }

      return matchesSearch && matchesSpending && matchesOrders;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'totalSpent') {
        comparison = a.totalSpent - b.totalSpent;
      } else if (sortField === 'totalOrders') {
        comparison = a.totalOrders - b.totalOrders;
      } else if (sortField === 'lastOrderDate') {
        comparison =
          new Date(a.lastOrderDate).getTime() -
          new Date(b.lastOrderDate).getTime();
      } else if (sortField === 'createdAt') {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Get current page items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredCustomers.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete) {
      await handleDeleteCustomer(customerToDelete.id, customerToDelete.name);
      setCustomerToDelete(null);
    }
  };

  // Export customers to CSV
  const exportToCSV = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return; // Exit early if not in browser environment
    }

    // Prepare CSV data
    const csvData = [
      [
        'ID',
        'Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'ZIP',
        'Total Orders',
        'Total Spent',
        'Last Order Date',
        'Signup Date',
      ],
      ...customers.map((c) => [
        c.id,
        c.name,
        c.email,
        c.phoneNumber || '',
        c.address || '',
        c.city || '',
        c.state || '',
        c.zipCode || '',
        c.totalOrders.toString(),
        c.totalSpent.toFixed(2),
        c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '',
        new Date(c.createdAt).toLocaleDateString(),
      ]),
    ];

    // Convert to CSV content
    const csvContent = [...csvData.map((row) => row.join(','))].join('\n');

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `customers_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Customers data exported successfully');
  };

  // Handle column sort click
  const handleSortClick = (field: string) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle bulk selection of customers
  const toggleSelectAll = () => {
    if (selectedCustomers.length === currentCustomers.length) {
      // If all are selected, deselect all
      setSelectedCustomers([]);
    } else {
      // Otherwise select all
      setSelectedCustomers(currentCustomers.map((c) => c.id));
    }
    updateBulkActionVisibility(
      selectedCustomers.length === 0 ? currentCustomers.map((c) => c.id) : []
    );
  };

  const toggleSelectCustomer = (customerId: string) => {
    const newSelectedCustomers = selectedCustomers.includes(customerId)
      ? selectedCustomers.filter((id) => id !== customerId)
      : [...selectedCustomers, customerId];

    setSelectedCustomers(newSelectedCustomers);
    updateBulkActionVisibility(newSelectedCustomers);
  };

  const updateBulkActionVisibility = (selectedIds: string[]) => {
    setShowBulkActions(selectedIds.length > 0);
  };

  // Handle bulk delete
  const bulkDeleteCustomers = async () => {
    try {
      const confirmMessage = `Are you sure you want to delete ${selectedCustomers.length} customers? This action cannot be undone.`;
      const confirmed = await confirmDelete(confirmMessage);

      if (!confirmed) return;

      let successCount = 0;
      let errorCount = 0;

      // Process each selected customer for deletion
      for (const customerId of selectedCustomers) {
        try {
          const response = await fetch(`${API_URL}/api/users/${customerId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to delete customer ID: ${customerId}`);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error deleting customer ID: ${customerId}`, err);
        }
      }

      // Update local state by removing successfully deleted customers
      if (successCount > 0) {
        const remainingCustomers = customers.filter(
          (customer) => !selectedCustomers.includes(customer.id)
        );
        setCustomers(remainingCustomers);
      }

      // Show appropriate message
      if (successCount > 0 && errorCount === 0) {
        showSuccess(`${successCount} customers deleted successfully`);
      } else if (successCount > 0 && errorCount > 0) {
        showSuccess(
          `${successCount} customers deleted successfully, but ${errorCount} failed`
        );
      } else {
        showError('Failed to delete any customers');
      }

      setSelectedCustomers([]);
      setShowBulkActions(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete customers';
      showError(errorMessage);
    }
  };

  // Helper function to get purchase frequency label
  const getFrequencyLabel = (customer: CustomerData) => {
    if (customer.totalOrders >= 10) return 'Frequent';
    if (customer.totalOrders >= 5) return 'Regular';
    if (customer.totalOrders >= 2) return 'Occasional';
    return 'New';
  };

  // Helper function to calculate loyalty period
  const getLoyaltyPeriod = (createdAt: string) => {
    const created = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return 'New (< 1 mo)';
    if (diffDays < 90) return '1-3 months';
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;

    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year' : `${years} years`;
  };

  // Generate mock orders for a customer
  const generateMockOrders = (customer: CustomerData) => {
    if (customer.totalOrders === 0) return [];

    const orders = [];
    const orderStatuses = [
      'Delivered',
      'Processing',
      'Delivered',
      'Completed',
      'Cancelled',
      'Delivered',
    ];

    // Generate a maximum of 5 orders or the actual number if less
    const orderCount = Math.min(customer.totalOrders, 5);

    for (let i = 0; i < orderCount; i++) {
      // Calculate a reasonable date for the order
      const orderDate = new Date();
      // Most recent order should be close to the lastOrderDate
      if (i === 0) {
        orderDate.setTime(new Date(customer.lastOrderDate).getTime());
      } else {
        // Distribute other orders going back in time
        const daysBack = i * 14 + Math.floor(Math.random() * 14);
        orderDate.setDate(orderDate.getDate() - daysBack);
      }

      // Calculate a reasonable order amount
      const avgOrderValue =
        customer.totalOrders > 0
          ? customer.totalSpent / customer.totalOrders
          : 50;

      // Vary the order amounts around the average
      const variance = 0.3; // 30% variance
      const minAmount = avgOrderValue * (1 - variance);
      const maxAmount = avgOrderValue * (1 + variance);
      const orderAmount = minAmount + Math.random() * (maxAmount - minAmount);

      orders.push({
        id: `#ORD-${100000 + i + parseInt(customer.id.replace(/\D/g, ''))}`,
        date: orderDate.toISOString(),
        amount: orderAmount,
        status: orderStatuses[Math.min(i, orderStatuses.length - 1)],
      });
    }

    return orders;
  };

  return (
    <div className='min-h-screen bg-gray-50 px-2 sm:px-4 py-4 sm:py-6'>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <h1 className='text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6'>
        Customer Accounts
      </h1>

      {/* Customer count summary */}
      {!isLoading && !error && (
        <div className='bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6'>
          <p className='text-sm text-gray-600'>
            Showing{' '}
            <span className='font-semibold'>{filteredCustomers.length}</span>{' '}
            customer{filteredCustomers.length !== 1 ? 's' : ''}
            {filteredCustomers.length !== customers.length && (
              <span> (filtered from {customers.length} total)</span>
            )}
          </p>
        </div>
      )}

      {/* Top action bar */}
      <div className='bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4'>
        <div className='flex items-center gap-2 w-full'>
          <div className='relative flex-grow'>
            <input
              type='text'
              placeholder='Search customers...'
              className='pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 w-full'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className='p-2 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            <Filter className='h-5 w-5 text-gray-500' />
          </button>

          <button
            onClick={refreshCustomers}
            className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            disabled={isRefreshing}
          >
            <RotateCw className='h-5 w-5 text-gray-500' />
          </button>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0'>
          {showBulkActions ? (
            <button
              onClick={bulkDeleteCustomers}
              className='flex-1 sm:flex-initial px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center sm:justify-start gap-2'
            >
              <Trash2 className='h-4 w-4' />
              <span>Delete Selected ({selectedCustomers.length})</span>
            </button>
          ) : (
            <button
              onClick={exportToCSV}
              className='flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center sm:justify-start gap-2'
            >
              <Download className='h-4 w-4 text-gray-600' />
              <span className='text-gray-600'>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className='bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Spending Level
            </label>
            <select
              className='w-full border border-gray-300 rounded-lg p-2'
              value={spendingFilter}
              onChange={(e) => setSpendingFilter(e.target.value)}
            >
              <option value='all'>All Spending Levels</option>
              <option value='high'>High Spenders ({'>'}$500)</option>
              <option value='medium'>Medium Spenders ($100-$500)</option>
              <option value='low'>Low Spenders (&lt;$100)</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Order Frequency
            </label>
            <select
              className='w-full border border-gray-300 rounded-lg p-2'
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
            >
              <option value='all'>All Customers</option>
              <option value='frequent'>Frequent ({'>'}10 orders)</option>
              <option value='regular'>Regular (3-10 orders)</option>
              <option value='new'>New (&lt;3 orders)</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Sort By
            </label>
            <select
              className='w-full border border-gray-300 rounded-lg p-2'
              value={sortField}
              onChange={(e) => handleSortClick(e.target.value)}
            >
              <option value='lastOrderDate'>Last Order Date</option>
              <option value='totalSpent'>Total Spent</option>
              <option value='totalOrders'>Total Orders</option>
              <option value='name'>Name</option>
              <option value='createdAt'>Registration Date</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Sort Direction
            </label>
            <select
              className='w-full border border-gray-300 rounded-lg p-2'
              value={sortDirection}
              onChange={(e) =>
                setSortDirection(e.target.value as 'asc' | 'desc')
              }
            >
              <option value='desc'>Descending</option>
              <option value='asc'>Ascending</option>
            </select>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        {isLoading ? (
          <div className='min-h-[300px] flex items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600'></div>
          </div>
        ) : error ? (
          <div className='min-h-[200px] flex items-center justify-center p-4'>
            <div className='text-red-500 flex flex-col items-center text-center'>
              <p className='mb-4'>{error}</p>
              <button
                onClick={refreshCustomers}
                className='px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700'
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className='min-h-[200px] flex items-center justify-center p-4'>
            <div className='text-gray-500 flex flex-col items-center text-center'>
              <User className='h-12 w-12 mb-4 text-gray-300' />
              <p className='mb-4'>No customers found</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSpendingFilter('all');
                  setOrderFilter('all');
                }}
                className='px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700'
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile view - card layout */}
            <div className='md:hidden'>
              {/* Mobile sorting options */}
              <div className='p-3 border-b border-gray-200 flex items-center justify-between'>
                <label className='text-sm font-medium text-gray-700'>
                  Sort By:
                </label>
                <div className='relative flex-1 max-w-[180px] ml-2'>
                  <select
                    value={sortField}
                    onChange={(e) => handleSortClick(e.target.value)}
                    className='block w-full border border-gray-300 rounded-md shadow-sm py-1.5 pl-3 pr-8 text-sm focus:ring-amber-500 focus:border-amber-500'
                  >
                    <option value='name'>Name</option>
                    <option value='totalSpent'>Total Spent</option>
                    <option value='totalOrders'>Order Count</option>
                    <option value='lastOrderDate'>Last Order</option>
                    <option value='createdAt'>Registration Date</option>
                  </select>
                </div>
                <button
                  onClick={() =>
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  }
                  className='ml-2 p-1.5 bg-gray-100 rounded-md flex items-center'
                >
                  {sortDirection === 'asc' ? (
                    <ChevronUp size={14} className='text-gray-600' />
                  ) : (
                    <ChevronDown size={14} className='text-gray-600' />
                  )}
                </button>
              </div>

              {/* Select all checkbox for mobile */}
              {currentCustomers.length > 0 && (
                <div className='p-3 border-b border-gray-200 flex items-center'>
                  <input
                    type='checkbox'
                    id='select-all-mobile'
                    className='h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
                    checked={
                      currentCustomers.length > 0 &&
                      selectedCustomers.length === currentCustomers.length
                    }
                    onChange={toggleSelectAll}
                  />
                  <label
                    htmlFor='select-all-mobile'
                    className='ml-2 text-sm text-gray-700'
                  >
                    {selectedCustomers.length === 0
                      ? 'Select All'
                      : selectedCustomers.length === currentCustomers.length
                      ? 'Deselect All'
                      : `Selected ${selectedCustomers.length} of ${currentCustomers.length}`}
                  </label>
                </div>
              )}

              <div className='divide-y divide-gray-200'>
                {currentCustomers.map((customer) => (
                  <div key={customer.id} className='p-4 hover:bg-gray-50'>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          className='h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 mr-3'
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleSelectCustomer(customer.id)}
                        />
                        <div className='flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center'>
                          <User className='h-5 w-5 text-gray-500' />
                        </div>
                        <div className='ml-3'>
                          <div className='text-sm font-medium text-gray-900'>
                            {customer.name}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {customer.id}
                          </div>
                        </div>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          className='text-gray-500 hover:text-gray-700 p-1'
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye className='h-5 w-5' />
                        </button>
                        <button
                          className='text-red-500 hover:text-red-700 p-1'
                          onClick={() => setCustomerToDelete(customer)}
                        >
                          <Trash2 className='h-5 w-5' />
                        </button>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-3 text-xs'>
                      <div>
                        <p className='text-gray-500'>Email</p>
                        <div className='flex items-center mt-1'>
                          <Mail className='h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0' />
                          <span className='text-gray-900 truncate'>
                            {customer.email}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className='text-gray-500'>Phone</p>
                        <div className='flex items-center mt-1'>
                          <Phone className='h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0' />
                          <span className='text-gray-900'>
                            {customer.phoneNumber || 'Not available'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className='text-gray-500'>Location</p>
                        <div className='flex items-center mt-1'>
                          <MapPin className='h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0' />
                          <span className='text-gray-900'>
                            {customer.city}, {customer.state}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className='text-gray-500'>Last Order</p>
                        <div className='flex items-center mt-1'>
                          <Calendar className='h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0' />
                          <span className='text-gray-900'>
                            {new Date(
                              customer.lastOrderDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs'>
                      <div className='text-center'>
                        <p className='text-gray-500'>Orders</p>
                        <p className='font-medium text-amber-600 text-sm mt-1'>
                          {customer.totalOrders}
                        </p>
                      </div>
                      <div className='text-center'>
                        <p className='text-gray-500'>Total Spent</p>
                        <p className='font-medium text-amber-600 text-sm mt-1'>
                          ${customer.totalSpent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop view - table layout */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th scope='col' className='w-10 px-6 py-3 text-center'>
                      <input
                        type='checkbox'
                        className='h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
                        checked={
                          currentCustomers.length > 0 &&
                          selectedCustomers.length === currentCustomers.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none'
                      onClick={() => handleSortClick('name')}
                    >
                      <div className='flex items-center gap-1'>
                        Customer
                        {sortField === 'name' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none'
                      onClick={() => handleSortClick('phone')}
                    >
                      <div className='flex items-center gap-1'>
                        Contact
                        {sortField === 'phone' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none'
                      onClick={() => handleSortClick('city')}
                    >
                      <div className='flex items-center gap-1'>
                        Location
                        {sortField === 'city' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none'
                      onClick={() => handleSortClick('totalOrders')}
                    >
                      <div className='flex items-center gap-1'>
                        Orders
                        {sortField === 'totalOrders' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none'
                      onClick={() => handleSortClick('totalSpent')}
                    >
                      <div className='flex items-center gap-1'>
                        Spent
                        {sortField === 'totalSpent' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none'
                      onClick={() => handleSortClick('lastOrderDate')}
                    >
                      <div className='flex items-center gap-1'>
                        Last Order
                        {sortField === 'lastOrderDate' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {currentCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <input
                          type='checkbox'
                          className='h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleSelectCustomer(customer.id)}
                        />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center'>
                            <User className='h-5 w-5 text-gray-500' />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {customer.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {customer.phoneNumber || 'No phone'}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {customer.city}, {customer.state}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {customer.country}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {customer.totalOrders}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {new Date(
                            customer.lastOrderDate
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex items-center space-x-2'>
                          <button
                            className='text-gray-500 hover:text-gray-700'
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className='h-5 w-5' />
                          </button>
                          <button
                            className='text-red-500 hover:text-red-700'
                            onClick={() => setCustomerToDelete(customer)}
                          >
                            <Trash2 className='h-5 w-5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination - fully responsive */}
      {filteredCustomers.length > itemsPerPage && (
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 py-2 bg-white border-t border-gray-200'>
          <div className='text-sm text-gray-500 order-2 sm:order-1'>
            Showing {indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, filteredCustomers.length)} of{' '}
            {filteredCustomers.length} customers
          </div>
          <div className='flex space-x-1 order-1 sm:order-2'>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            {/* Show fewer page numbers on small screens */}
            <div className='hidden sm:flex space-x-1'>
              {Array.from(
                { length: Math.ceil(filteredCustomers.length / itemsPerPage) },
                (_, i) => i + 1
              )
                .filter(
                  (number) =>
                    number === 1 ||
                    number ===
                      Math.ceil(filteredCustomers.length / itemsPerPage) ||
                    (number >= currentPage - 1 && number <= currentPage + 1)
                )
                .map((number, index, array) => (
                  <React.Fragment key={number}>
                    {index > 0 && array[index - 1] !== number - 1 && (
                      <span className='px-3 py-1'>...</span>
                    )}
                    <button
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded ${
                        currentPage === number
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {number}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            {/* Simple page indicator for mobile */}
            <div className='flex items-center sm:hidden'>
              <span className='px-3 py-1'>
                {currentPage} /{' '}
                {Math.ceil(filteredCustomers.length / itemsPerPage)}
              </span>
            </div>
            <button
              onClick={nextPage}
              disabled={
                currentPage ===
                Math.ceil(filteredCustomers.length / itemsPerPage)
              }
              className={`px-3 py-1 rounded ${
                currentPage ===
                Math.ceil(filteredCustomers.length / itemsPerPage)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center'>
              <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                Customer Details
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className='text-gray-400 hover:text-gray-500'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <div className='p-4 sm:p-6 grid gap-6'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0'>
                  <User className='h-8 w-8 text-gray-500' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {selectedCustomer.name}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Customer since{' '}
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                  <h4 className='text-sm font-medium text-gray-500 mb-3'>
                    Contact Information
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex items-center'>
                      <Mail className='h-4 w-4 text-gray-400 mr-2' />
                      <span className='text-gray-800'>
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <Phone className='h-4 w-4 text-gray-400 mr-2' />
                      <span className='text-gray-800'>
                        {selectedCustomer.phoneNumber || 'No phone number'}
                      </span>
                    </div>
                    <div className='flex items-start'>
                      <MapPin className='h-4 w-4 text-gray-400 mr-2 mt-0.5' />
                      <div>
                        <div className='text-gray-800'>
                          {selectedCustomer.address && (
                            <div>{selectedCustomer.address}</div>
                          )}
                          {(selectedCustomer.city ||
                            selectedCustomer.state ||
                            selectedCustomer.zipCode) && (
                            <div>
                              {[
                                selectedCustomer.city,
                                selectedCustomer.state,
                                selectedCustomer.zipCode,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          )}
                          {selectedCustomer.country && (
                            <div>{selectedCustomer.country}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                  <h4 className='text-sm font-medium text-gray-500 mb-3'>
                    Customer Summary
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-xs text-gray-500'>Total Orders</p>
                      <p className='text-xl font-semibold text-gray-900'>
                        {selectedCustomer.totalOrders}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Total Spent</p>
                      <p className='text-xl font-semibold text-amber-600'>
                        ${selectedCustomer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Last Order</p>
                      <p className='text-sm font-medium text-gray-900'>
                        {new Date(
                          selectedCustomer.lastOrderDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Customer Since</p>
                      <p className='text-sm font-medium text-gray-900'>
                        {new Date(
                          selectedCustomer.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                <h4 className='text-sm font-medium text-gray-500 mb-3'>
                  Recent Orders & Purchase History
                </h4>
                <div className='mb-4'>
                  <div className='flex flex-wrap gap-4'>
                    <div className='bg-white rounded-md border border-gray-200 p-3 flex-1 min-w-[120px]'>
                      <p className='text-xs text-gray-500'>Average Order</p>
                      <p className='text-lg font-semibold text-amber-600'>
                        $
                        {selectedCustomer.totalOrders > 0
                          ? (
                              selectedCustomer.totalSpent /
                              selectedCustomer.totalOrders
                            ).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                    <div className='bg-white rounded-md border border-gray-200 p-3 flex-1 min-w-[120px]'>
                      <p className='text-xs text-gray-500'>
                        Purchase Frequency
                      </p>
                      <p className='text-lg font-semibold text-gray-900'>
                        {selectedCustomer.totalOrders > 0
                          ? getFrequencyLabel(selectedCustomer)
                          : 'New Customer'}
                      </p>
                    </div>
                    <div className='bg-white rounded-md border border-gray-200 p-3 flex-1 min-w-[120px]'>
                      <p className='text-xs text-gray-500'>Customer Since</p>
                      <p className='text-lg font-semibold text-gray-900'>
                        {getLoyaltyPeriod(selectedCustomer.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-100'>
                      <tr>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Order ID
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Date
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Amount
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {/* In production, this would fetch real order data from the API */}
                      {/* We're using mock data here for demonstration */}
                      {generateMockOrders(selectedCustomer).map((order) => (
                        <tr key={order.id} className='text-sm'>
                          <td className='px-3 py-2 whitespace-nowrap'>
                            {order.id}
                          </td>
                          <td className='px-3 py-2 whitespace-nowrap'>
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td className='px-3 py-2 whitespace-nowrap'>
                            ${order.amount.toFixed(2)}
                          </td>
                          <td className='px-3 py-2 whitespace-nowrap'>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'Delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'Processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {selectedCustomer.totalOrders === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className='px-3 py-4 text-center text-sm text-gray-500'
                          >
                            No orders found for this customer
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className='flex justify-end gap-3 border-t border-gray-200 pt-4'>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg max-w-md w-full p-4 sm:p-6'>
            <div className='text-center mb-4'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                <AlertTriangle className='h-6 w-6 text-red-600' />
              </div>
              <h3 className='text-lg font-medium text-gray-900'>
                Delete Customer Account
              </h3>
              <p className='text-sm text-gray-500 mt-2'>
                Are you sure you want to delete{' '}
                <span className='font-semibold'>
                  {customerToDelete.name}&apos;s
                </span>
                account? This action cannot be undone.
              </p>
            </div>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setCustomerToDelete(null)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCustomer}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
