'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  Image as ImageIcon,
} from 'lucide-react';

import useToast from '@/hooks/useToast';
import { useConfirmationDialog } from '@/providers/ConfirmationProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface EventOfferData {
  _id: string;
  name: string;
  description: string;
  banner: {
    public_id: string;
    url: string;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  offerType: 'discount' | 'special' | 'seasonal' | 'holiday';
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  applicableProducts: string[];
  applicableCategories: string[];
  couponCode: string;
  clickCount: number;
  conversionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CouponData {
  _id: string;
  code: string;
  isActive: boolean;
  endDate: string;
}

interface ProductData {
  _id: string;
  name: string;
}

interface CategoryData {
  name: string;
}

export default function EventOffersPage() {
  const { token } = useAuth();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
  const { confirmDelete } = useConfirmationDialog();
  const [eventOffers, setEventOffers] = useState<EventOfferData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingOffer, setEditingOffer] = useState<EventOfferData | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Products and categories for form selections
  const [products, setProducts] = useState<{id: string, name: string}[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [coupons, setCoupons] = useState<{id: string, code: string}[]>([]);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner: {
      public_id: '',
      url: '',
    },
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split('T')[0],
    isActive: true,
    priority: '0',
    offerType: 'discount' as 'discount' | 'special' | 'seasonal' | 'holiday',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'none',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: '0',
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    couponCode: '',
  });

  // Fetch event offers
  const fetchEventOffers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/event-offers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event offers');
      }

      const data = await response.json();
      setEventOffers(data.data || []);
      showInfo('Event offers loaded successfully');
    } catch (error) {
      console.error('Error fetching event offers:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch event offers. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, showInfo, showError]);

  // Fetch products for offer selection
  const fetchProducts = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(
        data.products.map((product: ProductData) => ({
          id: product._id,
          name: product.name,
        }))
      );
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [token]);

  // Fetch categories for offer selection
  const fetchCategories = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(
        data.map((category: CategoryData) => ({
          id: category.name, // Categories use name as ID
          name: category.name,
        }))
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [token]);

  // Fetch coupons for coupon code selection
  const fetchCoupons = useCallback(async () => {
    if (!token) return;

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
      // Filter to only include active coupons
      const activeCoupons = data.filter((coupon: CouponData) => {
        const endDate = new Date(coupon.endDate);
        const today = new Date();
        return coupon.isActive && endDate >= today;
      });
      
      setCoupons(
        activeCoupons.map((coupon: CouponData) => ({
          id: coupon._id,
          code: coupon.code,
        }))
      );
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchEventOffers();
    fetchProducts();
    fetchCategories();
    fetchCoupons();
  }, [fetchEventOffers, fetchProducts, fetchCategories, fetchCoupons]);

  const refreshEventOffers = async () => {
    setIsRefreshing(true);
    await fetchEventOffers();
    setIsRefreshing(false);
  };

  // Pagination functions
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredEventOffers().length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter functions
  const filteredEventOffers = () => {
    const currentDate = new Date();
    
    return eventOffers.filter((offer) => {
      // Apply search filter
      const matchesSearch = 
        searchQuery === '' || 
        offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      let matchesStatus = true;
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      
      if (statusFilter === 'active') {
        matchesStatus = offer.isActive && startDate <= currentDate && endDate >= currentDate;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !offer.isActive;
      } else if (statusFilter === 'expired') {
        matchesStatus = endDate < currentDate;
      } else if (statusFilter === 'upcoming') {
        matchesStatus = startDate > currentDate;
      }
      
      // Apply type filter
      const matchesType = 
        typeFilter === 'all' || 
        offer.offerType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  // Form handling
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (editingOffer) {
      setEditingOffer({
        ...editingOffer,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : name === 'discountValue' ||
              name === 'minOrderValue' ||
              name === 'maxDiscountAmount' ||
              name === 'priority'
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
      name: '',
      description: '',
      banner: {
        public_id: '',
        url: '',
      },
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split('T')[0],
      isActive: true,
      priority: '0',
      offerType: 'discount',
      discountType: 'percentage',
      discountValue: '',
      maxDiscountAmount: '',
      minOrderValue: '0',
      applicableProducts: [],
      applicableCategories: [],
      couponCode: '',
    });
    setEditingOffer(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge component
  const getStatusBadge = (eventOffer: EventOfferData) => {
    const currentDate = new Date();
    const startDate = new Date(eventOffer.startDate);
    const endDate = new Date(eventOffer.endDate);

    if (!eventOffer.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    } else if (startDate > currentDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Upcoming
        </span>
      );
    } else if (endDate < currentDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
  };

  // Edit offer
  const editOffer = (eventOffer: EventOfferData) => {
    setEditingOffer(eventOffer);
    setShowCreateModal(true);
  };

  // Delete offer
  const handleDeleteEventOffer = async (offerId: string, offerName: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/event-offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event offer');
      }

      // Update local state
      setEventOffers(eventOffers.filter((offer) => offer._id !== offerId));
      showSuccess(`Event offer "${offerName}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting event offer:', error);
      showError('Failed to delete event offer. Please try again.');
    }
  };

  // Create event offer
  const handleCreateEventOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate inputs
      console.log("Validating form data:", formData);
      
      if (!formData.name) {
        setError('Event name is required');
        showError('Event name is required');
        return;
      }
      
      if (!formData.description) {
        setError('Description is required');
        showError('Description is required');
        return;
      }
      
      if (!formData.banner.url) {
        setError('Banner image is required');
        showError('Banner image is required');
        return;
      }
      
      if (!formData.startDate) {
        setError('Start date is required');
        showError('Start date is required');
        return;
      }
      
      if (!formData.endDate) {
        setError('End date is required');
        showError('End date is required');
        return;
      }

      // Create data object
      const eventOfferData = {
        name: formData.name,
        description: formData.description,
        banner: formData.banner,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        priority: parseInt(formData.priority),
        offerType: formData.offerType,
        discountType: formData.discountType,
        discountValue: formData.discountValue ? parseFloat(formData.discountValue) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        applicableProducts: formData.applicableProducts,
        applicableCategories: formData.applicableCategories,
        couponCode: formData.couponCode,
      };

      console.log("Submitting event offer data:", eventOfferData);

      const response = await fetch(`${API_URL}/api/event-offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventOfferData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event offer');
      }

      const result = await response.json();
      
      // Add to local state
      setEventOffers([result.data, ...eventOffers]);
      showSuccess('Event offer created successfully');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating event offer:', error);
      showError(error instanceof Error ? error.message : 'Failed to create event offer. Please try again.');
    }
  };

  // Update event offer
  const handleUpdateEventOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    setError('');

    try {
      // Validate inputs
      console.log("Validating editing offer data:", editingOffer);
      
      if (!editingOffer.name) {
        setError('Event name is required');
        showError('Event name is required');
        return;
      }
      
      if (!editingOffer.description) {
        setError('Description is required');
        showError('Description is required');
        return;
      }
      
      if (!editingOffer.banner.url) {
        setError('Banner image is required');
        showError('Banner image is required');
        return;
      }
      
      if (!editingOffer.startDate) {
        setError('Start date is required');
        showError('Start date is required');
        return;
      }
      
      if (!editingOffer.endDate) {
        setError('End date is required');
        showError('End date is required');
        return;
      }

      console.log("Submitting update for event offer:", editingOffer);

      const response = await fetch(`${API_URL}/api/event-offers/${editingOffer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingOffer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event offer');
      }

      const result = await response.json();
      
      // Update local state
      setEventOffers(
        eventOffers.map((offer) =>
          offer._id === editingOffer._id ? result.data : offer
        )
      );
      
      showSuccess('Event offer updated successfully');
      setShowCreateModal(false);
      setEditingOffer(null);
    } catch (error) {
      console.error('Error updating event offer:', error);
      showError(error instanceof Error ? error.message : 'Failed to update event offer. Please try again.');
    }
  };

  // Upload banner image
  const uploadBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      const formDataObj = new FormData();
      formDataObj.append('image', file);

      const response = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      if (editingOffer) {
        setEditingOffer({
          ...editingOffer,
          banner: {
            public_id: result.public_id,
            url: result.url,
          },
        });
      } else {
        setFormData({
          ...formData,
          banner: {
            public_id: result.public_id,
            url: result.url,
          },
        });
      }

      showSuccess('Banner image uploaded successfully');
    } catch (error) {
      console.error('Error uploading banner image:', error);
      showError('Failed to upload banner image. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Offers</h1>
            <p className="mt-2 text-gray-600">
              Manage promotional events and special offers
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              onClick={refreshEventOffers}
              className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
              disabled={isRefreshing}
              title="Refresh event offers"
            >
              <RefreshCw
                size={20}
                className={isRefreshing ? 'animate-spin' : ''}
              />
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors gap-2"
            >
              <PlusCircle size={18} />
              <span>Add Event Offer</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search event offers by name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <div className="mr-2 text-gray-600 flex items-center">
                  <Filter size={16} className="mr-1" />
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

              <div className="flex items-center">
                <div className="mr-2 text-gray-600 flex items-center">
                  <Tag size={16} className="mr-1" />
                  <span>Type:</span>
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">All Types</option>
                  <option value="discount">Discount</option>
                  <option value="special">Special</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Event Offers List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Something went wrong
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={refreshEventOffers}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : eventOffers.length === 0 ? (
            <div className="text-center p-8">
              <Calendar className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No event offers found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first event offer.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Event Offer
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Event
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Dates
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Discount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEventOffers().map((eventOffer) => (
                      <tr key={eventOffer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={eventOffer.banner.url}
                                alt={eventOffer.name}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {eventOffer.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {eventOffer.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {eventOffer.offerType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(eventOffer.startDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {formatDate(eventOffer.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {eventOffer.discountType !== 'none' ? (
                            <div className="flex items-center">
                              {eventOffer.discountType === 'percentage' ? (
                                <Percent size={14} className="text-amber-600 mr-1" />
                              ) : (
                                <DollarSign size={14} className="text-amber-600 mr-1" />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {eventOffer.discountValue}
                                {eventOffer.discountType === 'percentage' ? '%' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(eventOffer)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => editOffer(eventOffer)}
                              className="text-amber-600 hover:text-amber-900"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (typeof confirmDelete === 'function') {
                                  confirmDelete(`Are you sure you want to delete "${eventOffer.name}"? This action cannot be undone.`);
                                  const confirmed = window.confirm(`Are you sure you want to delete "${eventOffer.name}"? This action cannot be undone.`);
                                  if (confirmed) {
                                    handleDeleteEventOffer(eventOffer._id, eventOffer.name);
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {Math.ceil(filteredEventOffers().length / itemsPerPage) > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={
                        currentPage ===
                        Math.ceil(filteredEventOffers().length / itemsPerPage)
                      }
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage ===
                        Math.ceil(filteredEventOffers().length / itemsPerPage)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {Math.min(
                            (currentPage - 1) * itemsPerPage + 1,
                            filteredEventOffers().length
                          )}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredEventOffers().length
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {filteredEventOffers().length}
                        </span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from(
                          {
                            length: Math.ceil(
                              filteredEventOffers().length / itemsPerPage
                            ),
                          },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={nextPage}
                          disabled={
                            currentPage ===
                            Math.ceil(
                              filteredEventOffers().length / itemsPerPage
                            )
                          }
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                            currentPage ===
                            Math.ceil(
                              filteredEventOffers().length / itemsPerPage
                            )
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-medium text-gray-900">
                {editingOffer ? 'Edit Event Offer' : 'Create New Event Offer'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={editingOffer ? handleUpdateEventOffer : handleCreateEventOffer}>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Information */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Event Information
                  </h4>
                </div>
                
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editingOffer ? editingOffer.name : formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                
                {/* Event Type */}
                <div>
                  <label
                    htmlFor="offerType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="offerType"
                    name="offerType"
                    value={editingOffer ? editingOffer.offerType : formData.offerType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="discount">Discount</option>
                    <option value="special">Special</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                
                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editingOffer ? editingOffer.description : formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                
                {/* Banner Image */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="banner"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Banner Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center">
                    {(editingOffer?.banner.url || formData.banner.url) && (
                      <div className="mr-4 mb-4 md:mb-0 relative">
                        <img
                          src={editingOffer ? editingOffer.banner.url : formData.banner.url}
                          alt="Banner preview"
                          className="w-32 h-16 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="banner"
                        accept="image/*"
                        onChange={uploadBannerImage}
                        className="hidden"
                      />
                      <label
                        htmlFor="banner"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <ImageIcon size={16} className="mr-2" />
                        {(editingOffer?.banner.url || formData.banner.url)
                          ? 'Change Image'
                          : 'Upload Image'}
                      </label>
                      <div className="mt-3 text-sm text-gray-500">
                        <p className="font-medium">Image requirements:</p>
                        <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
                          <li>Recommended size: <span className="font-medium">1200 × 600 pixels</span> (2:1 ratio)</li>
                          <li>Maximum file size: <span className="font-medium">2MB</span></li>
                          <li>Formats accepted: JPG, PNG, or WebP</li>
                          <li>Use high-quality, well-lit images with clear focal points</li>
                          <li>Ensure text on images is readable on both desktop and mobile</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Event Period */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 mt-4">
                    Event Period
                  </h4>
                </div>
                
                {/* Start Date */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={editingOffer 
                      ? new Date(editingOffer.startDate).toISOString().split('T')[0] 
                      : formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                
                {/* End Date */}
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={editingOffer 
                      ? new Date(editingOffer.endDate).toISOString().split('T')[0] 
                      : formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                
                {/* Discount Settings */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 mt-4">
                    Discount Settings
                  </h4>
                </div>
                
                {/* Discount Type */}
                <div>
                  <label
                    htmlFor="discountType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount Type
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={editingOffer ? editingOffer.discountType : formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="none">No Discount</option>
                  </select>
                </div>
                
                {/* Discount Value */}
                {(editingOffer?.discountType !== 'none' || formData.discountType !== 'none') && (
                  <div>
                    <label
                      htmlFor="discountValue"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Discount Value
                    </label>
                    <input
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      value={editingOffer ? editingOffer.discountValue : formData.discountValue}
                      onChange={handleInputChange}
                      min="0"
                      step={editingOffer?.discountType === 'percentage' || formData.discountType === 'percentage' ? "1" : "0.01"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                )}
                
                {/* Max Discount Amount (for percentage) */}
                {(editingOffer?.discountType === 'percentage' || formData.discountType === 'percentage') && (
                  <div>
                    <label
                      htmlFor="maxDiscountAmount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Max Discount Amount ($)
                    </label>
                    <input
                      type="number"
                      id="maxDiscountAmount"
                      name="maxDiscountAmount"
                      value={editingOffer ? (editingOffer.maxDiscountAmount || '') : formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                      placeholder="No limit"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty for no maximum limit
                    </p>
                  </div>
                )}
                
                {/* Min Order Value */}
                <div>
                  <label
                    htmlFor="minOrderValue"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Order Value ($)
                  </label>
                  <input
                    type="number"
                    id="minOrderValue"
                    name="minOrderValue"
                    value={editingOffer ? editingOffer.minOrderValue : formData.minOrderValue}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                {/* Applicable Products */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="applicableProducts"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Applicable Products
                  </label>
                  <div className="relative">
                    <select
                      id="applicableProducts"
                      name="applicableProducts"
                      multiple
                      value={editingOffer ? editingOffer.applicableProducts : formData.applicableProducts}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        if (editingOffer) {
                          setEditingOffer({
                            ...editingOffer,
                            applicableProducts: selectedOptions,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            applicableProducts: selectedOptions,
                          });
                        }
                      }}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      size={5}
                    >
                      {products.length > 0 ? (
                        products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No products available
                        </option>
                      )}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Hold Ctrl (or Cmd on Mac) to select multiple products. Leave empty to apply to all products.
                  </p>
                </div>

                {/* Applicable Categories */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="applicableCategories"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Applicable Categories
                  </label>
                  <div className="relative">
                    <select
                      id="applicableCategories"
                      name="applicableCategories"
                      multiple
                      value={editingOffer ? editingOffer.applicableCategories : formData.applicableCategories}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        if (editingOffer) {
                          setEditingOffer({
                            ...editingOffer,
                            applicableCategories: selectedOptions,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            applicableCategories: selectedOptions,
                          });
                        }
                      }}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      size={5}
                    >
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No categories available
                        </option>
                      )}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Hold Ctrl (or Cmd on Mac) to select multiple categories. Leave empty to apply to all categories.
                  </p>
                </div>
                
                {/* Coupon Code */}
                <div>
                  <label
                    htmlFor="couponCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Associated Coupon Code
                  </label>
                  {coupons.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <select
                        id="couponCode"
                        name="couponCode"
                        value={editingOffer ? editingOffer.couponCode : formData.couponCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">Select a coupon (optional)</option>
                        {coupons.map((coupon) => (
                          <option key={coupon.id} value={coupon.code}>
                            {coupon.code}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          fetchCoupons();
                          showInfo('Coupon list refreshed');
                        }}
                        className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="Refresh coupon list"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <input
                        type="text"
                        id="couponCode"
                        name="couponCode"
                        value={editingOffer ? editingOffer.couponCode : formData.couponCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Optional"
                      />
                      <button
                        type="button"
                        onClick={() => window.open('/dashboard/coupons', '_blank')}
                        className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Create Coupon
                      </button>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Associate a coupon code with this event offer
                  </p>
                </div>
                
                {/* Additional Settings */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 mt-4">
                    Additional Settings
                  </h4>
                </div>
                
                {/* Status */}
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={editingOffer ? editingOffer.isActive : formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Active
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Inactive events won&apos;t be shown to customers
                  </p>
                </div>
                
                {/* Priority */}
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Display Priority
                  </label>
                  <input
                    type="number"
                    id="priority"
                    name="priority"
                    value={editingOffer ? editingOffer.priority : formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Higher values will be displayed first
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="px-6 py-2 mb-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
                    {error}
                  </div>
                </div>
              )}
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  {editingOffer ? 'Update Event Offer' : 'Create Event Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ProtectedRoute>
  );
} 