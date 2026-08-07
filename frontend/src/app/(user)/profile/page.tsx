'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import OrderDetailsModal from '@/components/modals/OrderDetailsModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import ReviewModal from '@/components/modals/ReviewModal';
import {
  ProfileSidebar,
  MobileHeader,
  PersonalInfoTab,
  OrdersTab,
  AddressesTab,
  SettingsTab,
  UserProfile,
  Order,
  OrderItem,
  Address,
  EligibleOrder,
} from '@/components/profile';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, token, updateUser } = useAuth();

  // Helper to get the saved tab from localStorage or use default
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');

      if (
        tabParam &&
        (tabParam === 'personal-info' ||
          tabParam === 'orders' ||
          tabParam === 'addresses' ||
          tabParam === 'settings')
      ) {
        return tabParam as
          | 'personal-info'
          | 'orders'
          | 'addresses'
          | 'settings';
      }

      const savedTab = localStorage.getItem('profileActiveTab');
      if (
        savedTab === 'personal-info' ||
        savedTab === 'orders' ||
        savedTab === 'addresses' ||
        savedTab === 'settings'
      ) {
        return savedTab as
          | 'personal-info'
          | 'orders'
          | 'addresses'
          | 'settings';
      }
    }
    return 'personal-info';
  };

  // State management
  const [currentTab, setCurrentTab] = useState(getInitialTab());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] =
    useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [specificReviewOrder, setSpecificReviewOrder] = useState<Order | null>(
    null
  );
  const [specificReviewProduct, setSpecificReviewProduct] =
    useState<OrderItem | null>(null);
  const [userReviews, setUserReviews] = useState<
    { orderId: string; productId: string }[]
  >([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    addressType: 'home',
    isDefault: false,
    additionalDirections: '',
    landmark: '',
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Save tab selection to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', currentTab);
    }
  }, [currentTab]);

  // Listen for URL changes to update the active tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleURLChange = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');

        if (
          tabParam &&
          (tabParam === 'personal-info' ||
            tabParam === 'orders' ||
            tabParam === 'addresses' ||
            tabParam === 'settings')
        ) {
          setCurrentTab(
            tabParam as 'personal-info' | 'orders' | 'addresses' | 'settings'
          );
        }
      };

      handleURLChange();
      window.addEventListener('popstate', handleURLChange);

      return () => {
        window.removeEventListener('popstate', handleURLChange);
      };
    }
  }, []);

  // Function to handle tab changes
  const handleTabChange = (
    tabId: 'personal-info' | 'orders' | 'addresses' | 'settings'
  ) => {
    setCurrentTab(tabId);

    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', tabId);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthLoading) {
          return;
        }

        if (user === null && !isAuthLoading) {
          setTimeout(() => {
            router.push('/auth/login');
          }, 100);
          return;
        }

        setProfile((prevProfile) => ({
          ...prevProfile,
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.mobileNumber || '',
        }));

        fetchUserProfile();
        fetchUserOrders();
        fetchUserAddresses();
        fetchUserReviews();
      } catch (error) {
        console.error('Authentication error:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [user, router, isAuthenticated, isAuthLoading]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.user.getProfile();

      if (response.success) {
        setProfile({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phoneNumber || '',
          profileImage: response.data.profileImage || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!token) return;

    setIsFetchingOrders(true);
    try {
      const ordersData = await api.get('api/orders/user');
      setAllOrders(ordersData);
      setOrders(ordersData.slice(0, 3));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  const handleSeeAllOrders = () => {
    setShowAllOrders(true);
    setOrders(allOrders);

    setTimeout(() => {
      const ordersSection = document.getElementById('orders-section');
      if (ordersSection && document.readyState === 'complete') {
        // Only scroll on user interaction
        const isUserInteraction = document.hasFocus();
        if (isUserInteraction) {
          ordersSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    }, 100);
  };

  const handleShowLessOrders = () => {
    setShowAllOrders(false);
    setOrders(allOrders.slice(0, 3));

    setTimeout(() => {
      const ordersSection = document.getElementById('orders-section');
      if (ordersSection && document.readyState === 'complete') {
        // Only scroll on user interaction
        const isUserInteraction = document.hasFocus();
        if (isUserInteraction) {
          ordersSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    }, 100);
  };

  const fetchUserAddresses = async () => {
    if (!token) return;

    setIsFetchingAddresses(true);
    try {
      const addressResponse = await api.addresses.getAll();
      setAddresses(addressResponse.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile || !token) return null;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', profileImageFile);

      const data = await api.upload('api/upload/image', formData);
      return data.url;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (profileImageFile) {
        await uploadProfileImage();
      }

      const userData = {
        name: profile.name,
        phoneNumber: profile.phone,
      };

      const response = await api.user.updateProfile(userData);

      if (response.success) {
        updateUser({
          name: response.data.name,
          phoneNumber: response.data.phoneNumber,
        });

        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid date';
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteAccountModalOpen(false);
    setIsLoading(true);
    try {
      await api.delete('api/users/delete-account');
      logout();
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            Cancelled
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            Unknown
          </span>
        );
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: user?.name || '',
      phoneNumber: user?.mobileNumber || '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      addressType: 'home',
      isDefault: false,
      additionalDirections: '',
      landmark: '',
    });
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  useEffect(() => {
    if (editingAddressId && addresses) {
      const addressToEdit = addresses.find(
        (addr) => addr._id === editingAddressId
      );
      if (addressToEdit) {
        setAddressForm({
          name: addressToEdit.name || '',
          phoneNumber: addressToEdit.phoneNumber || '',
          street: addressToEdit.street || '',
          city: addressToEdit.city || '',
          state: addressToEdit.state || '',
          postalCode: addressToEdit.postalCode || '',
          country: addressToEdit.country || 'USA',
          addressType: addressToEdit.addressType || 'home',
          isDefault: addressToEdit.isDefault || false,
          additionalDirections: addressToEdit.additionalDirections || '',
          landmark: addressToEdit.landmark || '',
        });
        setIsAddingAddress(true);
      }
    }
  }, [editingAddressId, addresses, user]);

  const handleAddressFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const name = target.name;
    const value =
      target.type === 'checkbox'
        ? (target as HTMLInputElement).checked
        : target.value;

    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAddressId) {
        await api.addresses.update(editingAddressId, addressForm);
        toast.success('Address updated successfully');
      } else {
        await api.addresses.create(addressForm);
        toast.success('Address added successfully');
      }

      resetAddressForm();
      fetchUserAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteAddressModal = (addressId: string) => {
    setAddressToDelete(addressId);
    setIsDeleteAddressModalOpen(true);
  };

  const closeDeleteAddressModal = () => {
    setIsDeleteAddressModalOpen(false);
    setAddressToDelete(null);
  };

  const handleDeleteAddress = async (addressId: string) => {
    openDeleteAddressModal(addressId);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsLoading(true);
    try {
      const response = await api.addresses.delete(addressToDelete);

      if (response.success) {
        setAddresses(addresses.filter((addr) => addr._id !== addressToDelete));
        toast.success('Address deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setIsLoading(false);
      closeDeleteAddressModal();
    }
  };

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderDetailsModalOpen(true);
  };

  const closeOrderDetailsModal = () => {
    setIsOrderDetailsModalOpen(false);
    setSelectedOrderId(null);
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setCancellingOrderId(orderId);
      await api.put(`api/orders/${orderId}/cancel`);

      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );

      toast.success('Order cancelled successfully');
      closeCancelOrderModal();
      fetchUserOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const openCancelOrderModal = (orderId: string) => {
    setCancellingOrderId(orderId);
    setIsCancelOrderModalOpen(true);
  };

  const closeCancelOrderModal = () => {
    setIsCancelOrderModalOpen(false);
    setCancellingOrderId(null);
  };

  const openDeleteAccountModal = () => {
    setIsDeleteAccountModalOpen(true);
  };

  const openReviewModal = async (order?: Order, product?: OrderItem) => {
    try {
      // Always fetch the latest user reviews to ensure accurate status
      await fetchUserReviews();

      if (order && product) {
        // Direct review for specific product - open immediately to review form
        setSpecificReviewOrder(order);
        setSpecificReviewProduct(product);
        setShowReviewModal(true);
      } else if (order) {
        // Review for specific order - show product selection for that order
        setSpecificReviewOrder(order);
        setSpecificReviewProduct(null);
        setShowReviewModal(true);
      } else {
        // General review modal - fetch all eligible orders first
        await fetchEligibleOrders();
        setSpecificReviewOrder(null);
        setSpecificReviewProduct(null);
        setShowReviewModal(true);
      }
    } catch (error) {
      console.error('Error opening review modal:', error);
      toast.error('Failed to load review data');
    }
  };

  const fetchUserReviews = async () => {
    if (!token) return;

    try {
      const data = await api.get('api/reviews/my-reviews');
      const reviewedItems =
        data.reviews?.map(
          (review: { order: { _id: string }; product: { id: string } }) => ({
            orderId: review.order._id,
            productId: review.product.id,
          })
        ) || [];
      setUserReviews(reviewedItems);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      // Don't show error toast here as it's called frequently
      setUserReviews([]); // Reset to empty array on error
    }
  };

  const fetchEligibleOrders = async () => {
    try {
      if (!token) return;

      const data = await api.get('api/reviews/eligible-orders');
      setEligibleOrders(data);
    } catch (err) {
      console.error('Error fetching eligible orders:', err);
      toast.error('Failed to load reviewable orders');
    }
  };

  const handleReviewSubmitted = async () => {
    try {
      // Refresh all review-related data
      await Promise.all([
        fetchUserReviews(),
        fetchEligibleOrders(),
        fetchUserOrders(), // Refresh orders to update review button status
      ]);

      // Close the modal and clear state
      setShowReviewModal(false);
      setSpecificReviewOrder(null);
      setSpecificReviewProduct(null);

      toast.success('Thank you for your review!');
    } catch (error) {
      console.error('Error after review submission:', error);
    }
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSpecificReviewOrder(null);
    setSpecificReviewProduct(null);
  };

  const isProductReviewed = (orderId: string, productId: string) => {
    return userReviews.some(
      (review) => review.orderId === orderId && review.productId === productId
    );
  };

  if (isAuthLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (user === null && !isAuthLoading) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-16'>
      <MobileHeader
        profile={profile}
        currentTab={currentTab}
        isLoading={isFetchingAddresses}
        isMobileMenuOpen={isMobileMenuOpen}
        onEditProfile={() => setIsEditing(true)}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      <div className='container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-10'>
        <div className='flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8 max-w-7xl mx-auto'>
          {/* Desktop & Tablet Sidebar */}
          <div className='hidden lg:block xl:w-80 lg:w-72'>
            <ProfileSidebar
              profile={profile}
              currentTab={currentTab}
              isLoading={isFetchingAddresses}
              onEditProfile={() => setIsEditing(true)}
              onTabChange={handleTabChange}
              onLogout={handleLogout}
            />
          </div>

          {/* Main Content Area */}
          <div className='flex-1 xl:max-w-4xl'>
            {currentTab === 'personal-info' && (
              <PersonalInfoTab
                profile={profile}
                addresses={addresses}
                isLoading={isFetchingAddresses}
                isEditing={isEditing}
                isUploadingImage={isUploadingImage}
                profileImagePreview={profileImagePreview}
                onEditToggle={() => setIsEditing(!isEditing)}
                onProfileChange={handleChange}
                onImageChange={handleProfileImageChange}
                onSubmit={handleSubmit}
                onTabChange={(tab) =>
                  handleTabChange(
                    tab as 'personal-info' | 'orders' | 'addresses' | 'settings'
                  )
                }
                onDeleteAddress={handleDeleteAddress}
                onEditAddress={(addressId) => {
                  handleTabChange('addresses');
                  setEditingAddressId(addressId);
                }}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersTab
                orders={orders}
                allOrders={allOrders}
                showAllOrders={showAllOrders}
                isFetchingOrders={isFetchingOrders}
                onViewOrderDetails={handleViewOrderDetails}
                onCancelOrder={openCancelOrderModal}
                onOpenReviewModal={openReviewModal}
                onSeeAllOrders={handleSeeAllOrders}
                onShowLessOrders={handleShowLessOrders}
                isProductReviewed={isProductReviewed}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
              />
            )}

            {currentTab === 'addresses' && (
              <AddressesTab
                addresses={addresses}
                isLoading={isLoading}
                isFetchingAddresses={isFetchingAddresses}
                isAddingAddress={isAddingAddress}
                isSubmitting={isSubmitting}
                editingAddressId={editingAddressId}
                addressForm={addressForm}
                onAddNewAddress={() => {
                  resetAddressForm();
                  setIsAddingAddress(true);
                }}
                onEditAddress={(addressId) => setEditingAddressId(addressId)}
                onDeleteAddress={handleDeleteAddress}
                onCancelAddressForm={() => {
                  resetAddressForm();
                  setIsAddingAddress(false);
                  setEditingAddressId(null);
                }}
                onAddressFormChange={handleAddressFormChange}
                onAddressFormSubmit={handleAddressFormSubmit}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsTab
                isLoading={isLoading}
                onDeleteAccount={openDeleteAccountModal}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteAccountModalOpen}
        title='Delete Account'
        message='Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        confirmText='Delete Account'
        cancelText='Cancel'
        type='delete'
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteAccountModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isDeleteAddressModalOpen}
        title='Delete Address'
        message='Are you sure you want to delete this address? This action cannot be undone.'
        confirmText='Delete Address'
        cancelText='Cancel'
        type='delete'
        onConfirm={confirmDeleteAddress}
        onCancel={closeDeleteAddressModal}
      />

      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={closeOrderDetailsModal}
        orderId={selectedOrderId}
        token={token}
      />

      <ConfirmModal
        isOpen={isCancelOrderModalOpen}
        title='Cancel Order'
        message='Are you sure you want to cancel this order? This action cannot be undone.'
        confirmText='Cancel Order'
        cancelText='Keep Order'
        type='delete'
        onConfirm={() => cancellingOrderId && cancelOrder(cancellingOrderId)}
        onCancel={closeCancelOrderModal}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={closeReviewModal}
        eligibleOrders={eligibleOrders}
        userReviews={userReviews}
        onReviewSubmitted={handleReviewSubmitted}
        specificOrder={specificReviewOrder}
        specificProduct={specificReviewProduct}
      />
    </div>
  );
}
