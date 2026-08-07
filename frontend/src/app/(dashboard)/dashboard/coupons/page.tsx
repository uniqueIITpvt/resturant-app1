'use client';

import React, { useState, useEffect, useCallback } from 'react';

import {
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Filter,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  XCircle,
} from 'lucide-react';
import { RiCoupon2Fill } from 'react-icons/ri';
import { useAuth } from '@/context/AuthContext';
import useToast from '@/hooks/useToast';
import { useConfirmationDialog } from '@/providers/ConfirmationProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';


// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface CouponData {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  userLimit: number;
  applicableProducts: string[];
  applicableCategories: string[];
  excludedProducts: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CouponsPage() {
  const { token } = useAuth();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
  const { confirmDelete } = useConfirmationDialog();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form data state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderValue: '0',
    maxDiscountAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split('T')[0],
    isActive: true,
    usageLimit: '',
    userLimit: '1',
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    excludedProducts: [] as string[],
  });

  const fetchCoupons = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }

      const data = await response.json();
      setCoupons(data || []);
      showInfo('Coupons loaded successfully');
    } catch (error) {
      console.error('Error fetching coupons:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch coupons. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, showInfo, showError]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const refreshCoupons = async () => {
    setIsRefreshing(true);
    await fetchCoupons();
    setIsRefreshing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (editingCoupon) {
      setEditingCoupon({
        ...editingCoupon,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : name === 'discountValue' ||
              name === 'minOrderValue' ||
              name === 'maxDiscountAmount' ||
              name === 'usageLimit' ||
              name === 'userLimit'
            ? parseFloat(value)
            : value,
      });
    } else {
      setFormData({
        ...formData,
        [name]:
          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '0',
      maxDiscountAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split('T')[0],
      isActive: true,
      usageLimit: '',
      userLimit: '1',
      applicableProducts: [],
      applicableCategories: [],
      excludedProducts: [],
    });
    setEditingCoupon(null);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate inputs
      if (
        !formData.code ||
        !formData.description ||
        !formData.discountValue ||
        !formData.endDate
      ) {
        setError('Please fill all required fields');
        showError('Please fill all required fields');
        return;
      }

      // Create coupon data
      const couponData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: parseFloat(formData.minOrderValue || '0'),
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive,
        usageLimit: formData.usageLimit
          ? parseFloat(formData.usageLimit)
          : null,
        userLimit: parseFloat(formData.userLimit || '1'),
        applicableProducts: formData.applicableProducts,
        applicableCategories: formData.applicableCategories,
        excludedProducts: formData.excludedProducts,
      };

      // Send API request
      const response = await fetch(`${API_URL}/api/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(couponData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create coupon');
      }

      const data = await response.json();
      setCoupons([data, ...coupons]);
      showSuccess('Coupon created successfully');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating coupon:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create coupon. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!editingCoupon) return;

    try {
      // Validate inputs
      if (
        !editingCoupon.code ||
        !editingCoupon.description ||
        !editingCoupon.discountValue
      ) {
        setError('Please fill all required fields');
        showError('Please fill all required fields');
        return;
      }

      // Format dates
      const updateData = {
        ...editingCoupon,
        code: editingCoupon.code.toUpperCase(),
        startDate: new Date(editingCoupon.startDate).toISOString(),
        endDate: new Date(editingCoupon.endDate).toISOString(),
      };

      // Send API request
      const response = await fetch(
        `${API_URL}/api/coupons/${editingCoupon._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update coupon');
      }

      const data = await response.json();

      // Update coupons state
      setCoupons(
        coupons.map((coupon) =>
          coupon._id === editingCoupon._id ? data : coupon
        )
      );

      showSuccess('Coupon updated successfully');
      setShowCreateModal(false);
      setEditingCoupon(null);
    } catch (error) {
      console.error('Error updating coupon:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update coupon. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    try {
      const confirmMessage = `Are you sure you want to delete the coupon ${couponCode}? This action cannot be undone.`;
      const confirmed = await confirmDelete(confirmMessage);

      if (!confirmed) return;

      const response = await fetch(`${API_URL}/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete coupon');
      }

      setCoupons(coupons.filter((coupon) => coupon._id !== couponId));
      showSuccess(`Coupon ${couponCode} deleted successfully`);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete coupon. Please try again.';
      showError(errorMessage);
    }
  };

  const editCoupon = (coupon: CouponData) => {
    setEditingCoupon({
      ...coupon,
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0],
    });
    setShowCreateModal(true);
  };

  // Pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredCoupons.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter coupons based on search query and status filter
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && coupon.isActive;
    if (statusFilter === 'inactive') return matchesSearch && !coupon.isActive;
    if (statusFilter === 'expired') {
      const endDate = new Date(coupon.endDate);
      const now = new Date();
      return matchesSearch && endDate < now;
    }

    return matchesSearch;
  });

  // Get current coupons for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if coupon is expired
  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // Add this new handler for toggling active status
  const toggleCouponStatus = async (coupon: CouponData) => {
    try {
      const updateData = {
        ...coupon,
        isActive: !coupon.isActive,
      };

      const response = await fetch(`${API_URL}/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update coupon status');
      }

      const updatedCoupon = await response.json();

      // Update coupons state
      setCoupons(
        coupons.map((c) => (c._id === coupon._id ? updatedCoupon : c))
      );

      showSuccess(
        `Coupon ${coupon.code} ${
          updatedCoupon.isActive ? 'activated' : 'deactivated'
        } successfully`
      );
    } catch (error) {
      console.error('Error updating coupon status:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update coupon status. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <ProtectedRoute requiresAuth adminOnly>
      <div className='container mx-auto px-4 py-8'>
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {/* Header */}
        <div className='mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center'>
          <div className='flex items-center mb-4 sm:mb-0'>
            <RiCoupon2Fill size={32} className='text-amber-500 mr-3' />
            <h1 className='text-2xl font-bold text-gray-800'>
              Coupons Management
            </h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className='bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded flex items-center transition duration-300'
          >
            <PlusCircle size={20} className='mr-2' />
            Create New Coupon
          </button>
        </div>

        {/* Search and filter */}
        <div className='mb-6 flex flex-col sm:flex-row gap-4'>
          <div className='flex-1 relative'>
            <input
              type='text'
              placeholder='Search coupons by code or description...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
            />
            <Search
              size={20}
              className='text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2'
            />
          </div>
          <div className='flex space-x-2'>
            <div className='relative inline-block'>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='appearance-none bg-white border border-gray-300 py-2 pl-3 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
              >
                <option value='all'>All Coupons</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='expired'>Expired</option>
              </select>
              <Filter
                size={16}
                className='text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none'
              />
            </div>
            <button
              onClick={refreshCoupons}
              className='flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-300'
              disabled={isRefreshing}
            >
              <RefreshCw
                size={20}
                className={`text-gray-600 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md'>
            {error}
          </div>
        )}

        {/* Coupons table */}
        <div className='bg-white rounded-md shadow overflow-hidden mb-8'>
          {/* Mobile view - card layout */}
          <div className='md:hidden'>
            {isLoading ? (
              <div className='p-4 text-center text-sm text-gray-500'>
                <div className='flex justify-center items-center'>
                  <RefreshCw size={20} className='animate-spin mr-2' />
                  Loading coupons...
                </div>
              </div>
            ) : currentCoupons.length === 0 ? (
              <div className='p-4 text-center text-sm text-gray-500'>
                {searchQuery
                  ? `No coupons found matching "${searchQuery}"`
                  : 'No coupons found. Create your first coupon!'}
              </div>
            ) : (
              <div className='divide-y divide-gray-200'>
                {currentCoupons.map((coupon) => (
                  <div key={coupon._id} className='p-4 hover:bg-gray-50'>
                    <div className='flex justify-between items-start mb-2'>
                      <div className='flex items-center'>
                        <Tag
                          size={16}
                          className='text-amber-500 mr-2 flex-shrink-0'
                        />
                        <span className='text-sm font-medium text-gray-900'>
                          {coupon.code}
                        </span>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => editCoupon(coupon)}
                          className='text-blue-600 hover:text-blue-900 p-1'
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCoupon(coupon._id, coupon.code)
                          }
                          className='text-red-600 hover:text-red-900 p-1'
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className='text-sm text-gray-700 mb-2'>
                      {coupon.description}
                    </div>

                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div>
                        <span className='text-gray-500 block'>Discount:</span>
                        <div className='flex items-center mt-1'>
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <Percent
                                size={14}
                                className='text-green-500 mr-1'
                              />
                              <span>{coupon.discountValue}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign
                                size={14}
                                className='text-green-500 mr-1'
                              />
                              <span>${coupon.discountValue.toFixed(2)}</span>
                            </>
                          )}
                          {coupon.minOrderValue > 0 && (
                            <span className='ml-1 text-gray-500'>
                              (Min: ${coupon.minOrderValue.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className='text-gray-500 block'>
                          Valid Period:
                        </span>
                        <div className='flex items-center mt-1'>
                          <Calendar size={14} className='text-gray-400 mr-1' />
                          <span
                            className={
                              isExpired(coupon.endDate) ? 'text-red-500' : ''
                            }
                          >
                            {formatDate(coupon.startDate)} -{' '}
                            {formatDate(coupon.endDate)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className='text-gray-500 block'>Status:</span>
                        {isExpired(coupon.endDate) ? (
                          <span className='inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                            <XCircle size={12} className='mr-1' />
                            Expired
                          </span>
                        ) : (
                          <div className='flex items-center mt-1 group relative'>
                            <button
                              onClick={() => toggleCouponStatus(coupon)}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                coupon.isActive
                                  ? 'bg-green-500 focus:ring-green-500'
                                  : 'bg-gray-300 focus:ring-amber-500'
                              }`}
                              disabled={isExpired(coupon.endDate)}
                              title={
                                coupon.isActive
                                  ? 'Click to deactivate'
                                  : 'Click to activate'
                              }
                            >
                              <span
                                aria-hidden='true'
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  coupon.isActive
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`ml-2 text-sm ${
                                coupon.isActive
                                  ? 'text-green-600 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className='text-gray-500 block'>Usage:</span>
                        <span className='mt-1 inline-block'>
                          {coupon.usedCount} / {coupon.usageLimit || '∞'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop view - table layout */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Code
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Description
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Discount
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Valid Period
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Usage
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className='px-6 py-4 text-center text-sm text-gray-500'
                    >
                      <div className='flex justify-center items-center'>
                        <RefreshCw size={20} className='animate-spin mr-2' />
                        Loading coupons...
                      </div>
                    </td>
                  </tr>
                ) : currentCoupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className='px-6 py-4 text-center text-sm text-gray-500'
                    >
                      {searchQuery
                        ? `No coupons found matching "${searchQuery}"`
                        : 'No coupons found. Create your first coupon!'}
                    </td>
                  </tr>
                ) : (
                  currentCoupons.map((coupon) => (
                    <tr key={coupon._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Tag size={16} className='text-amber-500 mr-2' />
                          <span className='text-sm font-medium text-gray-900'>
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-900 max-w-xs truncate'>
                          {coupon.description}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-sm text-gray-900'>
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <Percent
                                size={14}
                                className='text-green-500 mr-1'
                              />
                              {coupon.discountValue}%
                            </>
                          ) : (
                            <>
                              <DollarSign
                                size={14}
                                className='text-green-500 mr-1'
                              />
                              {coupon.discountValue.toFixed(2)}
                            </>
                          )}
                        </div>
                        {coupon.minOrderValue > 0 && (
                          <div className='text-xs text-gray-500 mt-1'>
                            Min: ${coupon.minOrderValue.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex flex-col text-sm text-gray-900'>
                          <div className='flex items-center'>
                            <Calendar
                              size={14}
                              className='text-gray-400 mr-1'
                            />
                            <span
                              className={
                                isExpired(coupon.endDate) ? 'text-red-500' : ''
                              }
                            >
                              {formatDate(coupon.startDate)} -{' '}
                              {formatDate(coupon.endDate)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {isExpired(coupon.endDate) ? (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                            <XCircle size={12} className='mr-1' />
                            Expired
                          </span>
                        ) : (
                          <div className='flex items-center group relative'>
                            <button
                              onClick={() => toggleCouponStatus(coupon)}
                              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                coupon.isActive
                                  ? 'bg-green-500 focus:ring-green-500'
                                  : 'bg-gray-300 focus:ring-amber-500'
                              }`}
                              disabled={isExpired(coupon.endDate)}
                              title={
                                coupon.isActive
                                  ? 'Click to deactivate'
                                  : 'Click to activate'
                              }
                            >
                              <span
                                aria-hidden='true'
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                                  coupon.isActive
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`ml-2 text-sm ${
                                coupon.isActive
                                  ? 'text-green-600 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <div className='absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                              <div className='bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap'>
                                Click to{' '}
                                {coupon.isActive ? 'deactivate' : 'activate'}
                                <div className='absolute top-full left-4 -mt-px border-solid border-t-gray-800 border-t-4 border-x-transparent border-x-4 border-b-0'></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex justify-end space-x-2'>
                          <button
                            onClick={() => editCoupon(coupon)}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCoupon(coupon._id, coupon.code)
                            }
                            className='text-red-600 hover:text-red-900'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - fully responsive */}
        {filteredCoupons.length > itemsPerPage && (
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <div className='text-sm text-gray-500 order-2 sm:order-1'>
              Showing {indexOfFirstItem + 1} to{' '}
              {Math.min(indexOfLastItem, filteredCoupons.length)} of{' '}
              {filteredCoupons.length} coupons
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
                  { length: Math.ceil(filteredCoupons.length / itemsPerPage) },
                  (_, i) => i + 1
                )
                  .filter(
                    (number) =>
                      number === 1 ||
                      number ===
                        Math.ceil(filteredCoupons.length / itemsPerPage) ||
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
                  {Math.ceil(filteredCoupons.length / itemsPerPage)}
                </span>
              </div>
              <button
                onClick={nextPage}
                disabled={
                  currentPage ===
                  Math.ceil(filteredCoupons.length / itemsPerPage)
                }
                className={`px-3 py-1 rounded ${
                  currentPage ===
                  Math.ceil(filteredCoupons.length / itemsPerPage)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Coupon Modal - Made fully responsive */}
        {showCreateModal && (
          <div className='fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
              <div className='border-b px-4 sm:px-6 py-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={
                  editingCoupon ? handleUpdateCoupon : handleCreateCoupon
                }
              >
                <div className='p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                  {/* Coupon Code */}
                  <div className='col-span-1'>
                    <label
                      htmlFor='code'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Coupon Code <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='code'
                      id='code'
                      required
                      value={editingCoupon ? editingCoupon.code : formData.code}
                      onChange={handleInputChange}
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='e.g. SUMMER2023'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      Code will be automatically converted to uppercase.
                    </p>
                  </div>

                  {/* Description */}
                  <div className='col-span-1'>
                    <label
                      htmlFor='description'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Description <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='description'
                      id='description'
                      required
                      value={
                        editingCoupon
                          ? editingCoupon.description
                          : formData.description
                      }
                      onChange={handleInputChange}
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='e.g. Summer Sale Discount'
                    />
                  </div>

                  {/* Discount Type */}
                  <div className='col-span-1'>
                    <label
                      htmlFor='discountType'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Discount Type <span className='text-red-500'>*</span>
                    </label>
                    <select
                      name='discountType'
                      id='discountType'
                      required
                      value={
                        editingCoupon
                          ? editingCoupon.discountType
                          : formData.discountType
                      }
                      onChange={handleInputChange}
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    >
                      <option value='percentage'>Percentage (%)</option>
                      <option value='fixed'>Fixed Amount ($)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div className='col-span-1'>
                    <label
                      htmlFor='discountValue'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Discount Value <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      name='discountValue'
                      id='discountValue'
                      required
                      min='0'
                      step={
                        (editingCoupon
                          ? editingCoupon.discountType
                          : formData.discountType) === 'percentage'
                          ? '1'
                          : '0.01'
                      }
                      max={
                        (editingCoupon
                          ? editingCoupon.discountType
                          : formData.discountType) === 'percentage'
                          ? '100'
                          : undefined
                      }
                      value={
                        editingCoupon
                          ? editingCoupon.discountValue
                          : formData.discountValue
                      }
                      onChange={handleInputChange}
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder={
                        (editingCoupon
                          ? editingCoupon.discountType
                          : formData.discountType) === 'percentage'
                          ? 'e.g. 15 (for 15%)'
                          : 'e.g. 10.00 (for $10.00)'
                      }
                    />
                  </div>

                  {/* Date range - display in single row on mobile */}
                  <div className='col-span-1 sm:col-span-2'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {/* Start Date */}
                      <div>
                        <label
                          htmlFor='startDate'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Start Date <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='date'
                          name='startDate'
                          id='startDate'
                          required
                          value={
                            editingCoupon
                              ? editingCoupon.startDate
                              : formData.startDate
                          }
                          onChange={handleInputChange}
                          className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <label
                          htmlFor='endDate'
                          className='block text-sm font-medium text-gray-700'
                        >
                          End Date <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='date'
                          name='endDate'
                          id='endDate'
                          required
                          value={
                            editingCoupon
                              ? editingCoupon.endDate
                              : formData.endDate
                          }
                          onChange={handleInputChange}
                          className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Min Order Value */}
                  <div className='col-span-1'>
                    <label
                      htmlFor='minOrderValue'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Minimum Order Value ($)
                    </label>
                    <input
                      type='number'
                      name='minOrderValue'
                      id='minOrderValue'
                      min='0'
                      step='0.01'
                      value={
                        editingCoupon
                          ? editingCoupon.minOrderValue
                          : formData.minOrderValue
                      }
                      onChange={handleInputChange}
                      className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                      placeholder='e.g. 50.00'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      Minimum cart value required to use this coupon.
                    </p>
                  </div>

                  {/* Max Discount Amount (for percentage discounts) */}
                  <div className='col-span-1'>
                    <label
                      htmlFor='maxDiscountAmount'
                      className='block text-sm font-medium text-gray-700'
                    >
                      Maximum Discount Amount ($)
                    </label>
                    <input
                      type='number'
                      name='maxDiscountAmount'
                      id='maxDiscountAmount'
                      min='0'
                      step='0.01'
                      value={
                        editingCoupon
                          ? editingCoupon.maxDiscountAmount !== null
                            ? editingCoupon.maxDiscountAmount
                            : ''
                          : formData.maxDiscountAmount
                      }
                      onChange={handleInputChange}
                      disabled={
                        (editingCoupon
                          ? editingCoupon.discountType
                          : formData.discountType) === 'fixed'
                      }
                      className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                        (editingCoupon
                          ? editingCoupon.discountType
                          : formData.discountType) === 'fixed'
                          ? 'bg-gray-100 cursor-not-allowed'
                          : ''
                      }`}
                      placeholder='e.g. 100.00'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      {(editingCoupon
                        ? editingCoupon.discountType
                        : formData.discountType) === 'percentage'
                        ? 'Maximum discount amount (for percentage discounts).'
                        : 'Not applicable for fixed discount coupons.'}
                    </p>
                  </div>

                  {/* Usage limits - display in single row on mobile */}
                  <div className='col-span-1 sm:col-span-2'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {/* Usage Limit */}
                      <div>
                        <label
                          htmlFor='usageLimit'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Total Usage Limit
                        </label>
                        <input
                          type='number'
                          name='usageLimit'
                          id='usageLimit'
                          min='1'
                          step='1'
                          value={
                            editingCoupon
                              ? editingCoupon.usageLimit !== null
                                ? editingCoupon.usageLimit
                                : ''
                              : formData.usageLimit
                          }
                          onChange={handleInputChange}
                          className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                          placeholder='Leave blank for unlimited'
                        />
                        <p className='mt-1 text-xs text-gray-500'>
                          Maximum times this coupon can be used. Leave blank for
                          unlimited.
                        </p>
                      </div>

                      {/* User Limit Per Coupon */}
                      <div>
                        <label
                          htmlFor='userLimit'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Usage Limit Per User
                        </label>
                        <input
                          type='number'
                          name='userLimit'
                          id='userLimit'
                          min='1'
                          step='1'
                          value={
                            editingCoupon
                              ? editingCoupon.userLimit
                              : formData.userLimit
                          }
                          onChange={handleInputChange}
                          className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                          placeholder='e.g. 1'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className='col-span-1 sm:col-span-2'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        name='isActive'
                        id='isActive'
                        checked={
                          editingCoupon
                            ? editingCoupon.isActive
                            : formData.isActive
                        }
                        onChange={handleInputChange}
                        className='h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded'
                      />
                      <label
                        htmlFor='isActive'
                        className='ml-2 block text-sm text-gray-900'
                      >
                        Active (can be used by customers)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className='bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-3'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className='w-full sm:w-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                  >
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
