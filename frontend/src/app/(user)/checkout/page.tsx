'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import {
  CreditCard,
  ChevronRight,
  MapPin,
  Clock,
  Phone,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle,
  X,
  ShoppingBag,
  Home,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API URL for backend requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Address {
  _id: string;
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
  additionalDirections?: string;
  landmark?: string;
}

// Add interface for coupon data
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
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('cash');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    instructions: '',
  });
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  // New state for mobile checkout flow
  const [activeStep, setActiveStep] = useState(0);
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Add coupon states
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Reference to track if we're still on the checkout page
  const isCheckoutPage = useRef(true);

  // Reference to track if we're still on the checkout page

  // Authentication check
  useEffect(() => {
    // If user is not authenticated, redirect to login with a return URL
    if (!token || !user) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [token, user, router]);

  // Add useEffect to load coupon data from localStorage
  useEffect(() => {
    // Load coupon data from localStorage when component mounts
    const storedCoupon = localStorage.getItem('appliedCoupon');
    const storedDiscount = localStorage.getItem('couponDiscount');

    if (storedCoupon && storedDiscount) {
      try {
        const couponData = JSON.parse(storedCoupon) as CouponData;
        const discount = parseFloat(storedDiscount);

        setAppliedCoupon(couponData);
        setCouponDiscount(discount);
      } catch (error) {
        console.error('Error parsing coupon data:', error);
        // Clear invalid data
        localStorage.removeItem('appliedCoupon');
        localStorage.removeItem('couponDiscount');
      }
    } else {
      // If no coupon data is found, reset the states
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }
  }, []);

  // Add listener for storage events to handle coupon changes from other pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only respond to changes in coupon-related items
      if (e.key === 'appliedCoupon' || e.key === 'couponDiscount') {
        const storedCoupon = localStorage.getItem('appliedCoupon');
        const storedDiscount = localStorage.getItem('couponDiscount');

        if (!storedCoupon || !storedDiscount) {
          // If either is missing, reset coupon state
          setAppliedCoupon(null);
          setCouponDiscount(0);
        } else {
          try {
            const couponData = JSON.parse(storedCoupon) as CouponData;
            const discount = parseFloat(storedDiscount);
            setAppliedCoupon(couponData);
            setCouponDiscount(discount);
          } catch (error) {
            console.error('Error parsing coupon data:', error);
            setAppliedCoupon(null);
            setCouponDiscount(0);
          }
        }
      }
    };

    // Check coupon status when component is focused
    const handleVisibilityChange = () => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'
      ) {
        const storedCoupon = localStorage.getItem('appliedCoupon');
        const storedDiscount = localStorage.getItem('couponDiscount');

        if (!storedCoupon || !storedDiscount) {
          setAppliedCoupon(null);
          setCouponDiscount(0);
        }
      }
    };

    // Only add event listeners in browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
      };
    }

    return () => {};
  }, []);

  // Handle navigation away from checkout
  const handleNavigateAway = () => {
    localStorage.removeItem('checkout_in_progress');
  };

  // Cleanup on unmount or navigation
  useEffect(() => {
    isCheckoutPage.current = true;

    return () => {
      if (isCheckoutPage.current) {
        localStorage.removeItem('checkout_in_progress');
      }
    };
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set initial contact info from user data if available
  useEffect(() => {
    if (user) {
      setContactInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
      });

      // Fetch user's saved addresses
      fetchUserAddresses();
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    // Only redirect if cart is empty AND not currently processing an order AND not resuming an existing checkout
    const checkoutInProgress = localStorage.getItem('checkout_in_progress');

    if (cart.length === 0 && !isLoading && !checkoutInProgress) {
      router.push('/menu');
    }

    // Set checkout in progress flag when the page loads with items in cart
    if (cart.length > 0) {
      localStorage.setItem('checkout_in_progress', 'true');
    }

    // Check coupon status on each render to handle same-tab updates
    const storedCoupon = localStorage.getItem('appliedCoupon');
    const storedDiscount = localStorage.getItem('couponDiscount');

    if (!storedCoupon || !storedDiscount) {
      // If coupon was removed, reset the state
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } else if (storedCoupon && storedDiscount) {
      try {
        const couponData = JSON.parse(storedCoupon) as CouponData;
        const discount = parseFloat(storedDiscount);

        // Only update if the coupon code has changed or if no coupon is currently applied
        if (!appliedCoupon || appliedCoupon.code !== couponData.code) {
          setAppliedCoupon(couponData);
          setCouponDiscount(discount);
        }
      } catch (error) {
        console.error('Error parsing coupon data:', error);
      }
    }

    // Cleanup function to remove the flag when component unmounts
    return () => {
      if (cart.length === 0) {
        localStorage.removeItem('checkout_in_progress');
      }
    };
  }, [cart, router, isLoading, appliedCoupon]);

  // Check for completed transactions when returning to checkout
  useEffect(() => {
    // This will be handled in the dedicated payment page
  }, []);

  // If not authenticated, show a loading state
  if (!token || !user) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-16'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='w-16 h-16 rounded-full bg-amber-200 mb-4 flex items-center justify-center'>
            <CreditCard className='text-amber-500 w-8 h-8' />
          </div>
          <div className='h-4 bg-amber-100 rounded w-48 mb-2'></div>
          <div className='h-3 bg-amber-50 rounded w-32'></div>
        </div>
      </div>
    );
  }

  // Add a processCheckout function for cash payment orders
  const processCheckout = async () => {
    // Show loading toast
    const loadingToast = toast.loading('Processing your order...');

    try {
      // Prepare order data
      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedAddons: item.selectedAddons || [],
        })),
        total: total,
        subtotal: subtotal,
        tax: tax,
        deliveryFee: deliveryFee,
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discount: couponDiscount,
            }
          : null,
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zipCode: deliveryAddress.postalCode,
        },
        paymentMethod: 'cash',
      };

      // Submit order to API
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Order placed successfully!');

      // Save delivery address for future use
      localStorage.setItem(
        'deliveryAddress',
        JSON.stringify({
          ...deliveryAddress,
          fullName: contactInfo.name,
          phone: contactInfo.phone,
        })
      );

      // Set checkout completion flags and cleanup
      sessionStorage.setItem('checkout_completed', Date.now().toString());
      localStorage.setItem('has_completed_checkout', 'true');
      sessionStorage.setItem('last_order_id', order._id);
      sessionStorage.setItem('last_order_number', order.orderNumber);
      localStorage.removeItem('checkout_in_progress');
      clearCart();

      // Remove coupon data
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('couponDiscount');

      // Redirect to success page
      localStorage.setItem('intentional_redirect_to_success', 'true');
      router.push('/checkout/success');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.dismiss(loadingToast);
      toast.error(
        'There was an error processing your order. Please try again.'
      );
      setIsLoading(false);
    }
  };

  // Define steps for mobile progress indicator
  const steps = [
    {
      title: 'Contact',
      icon: <Phone size={16} />,
    },
    {
      title: 'Address',
      icon: <MapPin size={16} />,
    },
    {
      title: 'Payment',
      icon: <CreditCard size={16} />,
    },
  ];

  // Fetch user's saved addresses
  const fetchUserAddresses = async () => {
    if (!token) return;

    setIsFetchingAddresses(true);
    try {
      const response = await api.addresses.getAll();

      if (response.success) {
        setUserAddresses(response.data as Address[]);

        // We don't auto-select any address initially - user must choose
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userAddresses.find(
      (addr) => addr._id === addressId
    );

    if (selectedAddress) {
      setDeliveryAddress({
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        instructions: selectedAddress.additionalDirections || '',
      });

      setContactInfo({
        name: selectedAddress.name,
        email: user?.email || '',
        phone: selectedAddress.phoneNumber,
      });

      // Clear errors when a valid address is selected
      setErrors({
        ...errors,
        street: '',
        city: '',
        state: '',
        postalCode: '',
        name: '',
        phone: '',
      });

      toast.success('Delivery address selected');
    }
  };

  // Clear selected address and form fields
  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setDeliveryAddress({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      instructions: '',
    });
  };

  // Functions for step-based navigation in mobile view
  const handleNextStep = () => {
    // Validate current step
    let isValid = true;

    if (activeStep === 0) {
      // Validate contact info
      const contactErrors: { [key: string]: string } = {};
      if (!contactInfo.name) contactErrors.name = 'Name is required';
      if (!contactInfo.email) {
        contactErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
        contactErrors.email = 'Email is invalid';
      }
      if (!contactInfo.phone) {
        contactErrors.phone = 'Phone number is required';
      }

      setErrors(contactErrors);
      isValid = Object.keys(contactErrors).length === 0;
    } else if (activeStep === 1) {
      // Validate delivery address
      const addressErrors: { [key: string]: string } = {};
      if (!deliveryAddress.street)
        addressErrors.street = 'Street address is required';
      if (!deliveryAddress.city) addressErrors.city = 'City is required';
      if (!deliveryAddress.postalCode)
        addressErrors.postalCode = 'Postal code is required';

      setErrors(addressErrors);
      isValid = Object.keys(addressErrors).length === 0;
    }

    if (isValid && activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      // Only scroll on user interaction, not on page load
      if (typeof window !== 'undefined' && document.readyState === 'complete') {
        setTimeout(() => window.scrollTo(0, 0), 100);
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      // Only scroll on user interaction, not on page load
      if (typeof window !== 'undefined' && document.readyState === 'complete') {
        setTimeout(() => window.scrollTo(0, 0), 100);
      }
    }
  };

  const goToStep = (step: number) => {
    if (step <= activeStep) {
      setActiveStep(step);
      // Only scroll on user interaction, not on page load
      if (typeof window !== 'undefined' && document.readyState === 'complete') {
        setTimeout(() => window.scrollTo(0, 0), 100);
      }
    }
  };

  const handleDeliveryAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDeliveryAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate contact info
    if (!contactInfo.name) newErrors.name = 'Name is required';
    if (!contactInfo.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!contactInfo.phone) {
      newErrors.phone = 'Phone number is required';
    }

    // Validate delivery address
    if (!deliveryAddress.street)
      newErrors.street = 'Street address is required';
    if (!deliveryAddress.city) newErrors.city = 'City is required';
    if (!deliveryAddress.postalCode)
      newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return newErrors;
  };

  // Update the handleSubmit function to redirect to payment page for card payments
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // First do validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // On mobile, scroll to the first error
      if (window.innerWidth < 768) {
        const firstErrorKey = Object.keys(validationErrors)[0];
        const firstErrorElement = document.querySelector(
          `[name="${firstErrorKey}"]`
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
      return;
    }

    // For cash payments, process directly
    if (paymentMethod === 'cash') {
      // Handle cash on delivery checkout
      setIsLoading(true);
      processCheckout();
    } else {
      // For card payments, prepare data and redirect to payment page
      // Store order data for the payment page
      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedAddons: item.selectedAddons || [],
        })),
        total: total,
        subtotal: subtotal,
        tax: tax,
        deliveryFee: deliveryFee,
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.code,
              discount: couponDiscount,
            }
          : null,
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zipCode: deliveryAddress.postalCode,
        },
        contactInfo: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
        },
      };

      // Store in localStorage for the payment page to use
      localStorage.setItem('pending_payment_order', JSON.stringify(orderData));

      // Redirect to the payment page
      router.push('/payment');
    }
  };

  // Calculate subtotal, tax, delivery fee, and total
  const subtotal = getTotal();
  const taxRate = 0.09; // 9% tax
  const tax = subtotal * taxRate;
  const deliveryFee = subtotal > 0 ? (subtotal > 50 ? 0 : 5) : 0; // Free delivery over $50
  const totalBeforeDiscount = subtotal + tax + deliveryFee;
  const total = totalBeforeDiscount - couponDiscount; // Apply coupon discount to total

  // Display loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
        <div className='w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4'></div>
        <div className='text-lg text-gray-700'>Processing your order...</div>
      </div>
    );
  }

  // Mobile progress indicator component
  const ProgressIndicator = () => (
    <div className='w-full bg-white shadow-sm px-4 py-3 fixed top-0 left-0 z-10 border-b border-gray-200 mt-16'>
      <div className='flex justify-between items-center max-w-md mx-auto'>
        {steps.map((step, index) => (
          <div
            key={step.title}
            className='flex flex-col items-center relative'
            onClick={() => goToStep(index)}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full mb-1.5 ${
                index < activeStep
                  ? 'bg-green-100 text-green-600'
                  : index === activeStep
                  ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-600 ring-offset-2'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {index < activeStep ? <CheckCircle size={16} /> : step.icon}
            </div>
            <span
              className={`text-xs ${
                index === activeStep
                  ? 'font-semibold text-amber-600'
                  : index < activeStep
                  ? 'font-medium text-green-600'
                  : 'text-gray-500'
              }`}
            >
              {step.title}
            </span>

            {/* Progress line connecting steps */}
            {index < steps.length - 1 && (
              <div className='absolute top-4 left-[calc(50%+16px)] w-[calc(100%-32px)] h-0.5 -z-10'>
                <div
                  className={`h-full ${
                    index < activeStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Main page structure with conditional mobile/desktop layouts
  return (
    <div className='min-h-screen bg-gray-50 mt-16'>
      {/* Mobile header - shown only on small screens */}
      <div className='block lg:hidden'>
        <ProgressIndicator />

        {/* Mobile order summary toggle */}
        <button
          onClick={() => setShowCartSummary(!showCartSummary)}
          className={`fixed bottom-0 left-0 right-0 z-20 bg-white shadow-lg border-t border-gray-200 p-3 flex justify-between items-center ${
            hasScrolled ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-200`}
        >
          <div className='flex items-center'>
            <div className='relative'>
              <ShoppingBag className='text-amber-600 mr-1.5' size={18} />
              <span className='absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center'>
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <span className='font-medium text-sm'>View cart</span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold text-amber-600 mr-1.5 text-sm'>
              ${total.toFixed(2)}
            </span>
            <ChevronRight size={16} className='text-gray-400' />
          </div>
        </button>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-10 pb-20 lg:pb-16'>
        {/* Back button - hidden on mobile during checkout steps */}
        <div className='flex items-center justify-between mb-6 lg:mb-10 mt-14 lg:mt-0'>
          <div className='flex items-center space-x-4'>
            <Link
              href='/cart'
              onClick={handleNavigateAway}
              className='inline-flex items-center text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors'
            >
              <ArrowLeft className='h-4 w-4 mr-1.5' />
              Back to Cart
            </Link>
          </div>
          <div className='text-center flex-1'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
              Checkout
            </h1>
            <div className='mt-1.5 text-xs sm:text-sm lg:text-base text-gray-600 hidden lg:block'>
              Complete your order by providing delivery and payment details
            </div>
          </div>
          <div className='w-[150px]'></div> {/* Spacer to balance the layout */}
        </div>

        {/* Main content */}
        <div className='flex flex-col lg:flex-row gap-6 lg:gap-12'>
          {/* Left column - Delivery and Payment */}
          <div className='flex-1 order-2 lg:order-1'>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              id='checkoutForm'
              className='space-y-6 lg:space-y-8'
            >
              {/* Mobile step content */}
              <div className='block lg:hidden'>
                <AnimatePresence mode='wait'>
                  {activeStep === 0 && (
                    <motion.div
                      key='contact'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className='bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100'
                    >
                      <h2 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
                        <Phone size={18} className='mr-2 text-amber-600' />
                        Contact Information
                      </h2>
                      <div className='space-y-4'>
                        <div>
                          <label
                            htmlFor='name'
                            className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                          >
                            Full Name
                          </label>
                          <input
                            type='text'
                            id='name'
                            name='name'
                            value={contactInfo.name}
                            onChange={handleContactInfoChange}
                            className={`block w-full rounded-lg border ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            } px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base`}
                            placeholder='Your full name'
                          />
                          {errors.name && (
                            <div className='mt-1 text-xs sm:text-sm text-red-600'>
                              {errors.name}
                            </div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor='email'
                            className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                          >
                            Email Address
                          </label>
                          <input
                            type='email'
                            id='email'
                            name='email'
                            value={contactInfo.email}
                            onChange={handleContactInfoChange}
                            className={`block w-full rounded-lg border ${
                              errors.email
                                ? 'border-red-300'
                                : 'border-gray-300'
                            } px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base`}
                            placeholder='your@email.com'
                          />
                          {errors.email && (
                            <div className='mt-1 text-xs sm:text-sm text-red-600'>
                              {errors.email}
                            </div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor='phone'
                            className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                          >
                            Phone Number
                          </label>
                          <input
                            type='tel'
                            id='phone'
                            name='phone'
                            value={contactInfo.phone}
                            onChange={handleContactInfoChange}
                            className={`block w-full rounded-lg border ${
                              errors.phone
                                ? 'border-red-300'
                                : 'border-gray-300'
                            } px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base`}
                            placeholder='For delivery updates'
                          />
                          {errors.phone && (
                            <div className='mt-1 text-xs sm:text-sm text-red-600'>
                              {errors.phone}
                            </div>
                          )}
                        </div>

                        <div className='pt-4'>
                          <button
                            type='button'
                            onClick={handleNextStep}
                            className='w-full py-2.5 sm:py-3.5 px-6 flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm sm:text-base transition-colors duration-200'
                          >
                            Continue to Delivery
                            <ChevronRight size={16} className='ml-1' />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 1 && (
                    <motion.div
                      key='delivery'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className='bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100'
                    >
                      <h2 className='text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center'>
                        <MapPin size={18} className='mr-2 text-amber-600' />
                        Delivery Address
                      </h2>
                      <div className='space-y-4'>
                        {/* Saved Addresses Section for Mobile */}
                        {user && (
                          <div className='space-y-3 mb-4 sm:mb-5'>
                            <div className='flex justify-between items-center mb-2'>
                              <h3 className='font-medium text-sm text-gray-700'>
                                Delivery Options
                              </h3>
                              {userAddresses.length > 0 && (
                                <button
                                  type='button'
                                  onClick={handleUseNewAddress}
                                  className='text-xs text-amber-600 hover:text-amber-700 font-medium'
                                >
                                  {selectedAddressId
                                    ? '+ Add New Address'
                                    : 'Use Saved Address'}
                                </button>
                              )}
                            </div>

                            {userAddresses.length > 0 ? (
                              <div className='space-y-2.5'>
                                {userAddresses.map((address) => (
                                  <div
                                    key={address._id}
                                    onClick={() =>
                                      handleAddressSelect(address._id)
                                    }
                                    className={`p-2.5 sm:p-3 border rounded-lg cursor-pointer transition-colors flex items-start ${
                                      selectedAddressId === address._id
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50/50'
                                    }`}
                                  >
                                    <div className='mr-2 mt-0.5 text-gray-500'>
                                      {address.addressType === 'home' ? (
                                        <Home size={14} />
                                      ) : address.addressType === 'work' ? (
                                        <div className='i-lucide-briefcase w-3.5 h-3.5' />
                                      ) : (
                                        <MapPin size={14} />
                                      )}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                      <p className='font-medium text-gray-900 text-sm truncate'>
                                        {address.name}
                                      </p>
                                      <p className='text-xs text-gray-600 line-clamp-2'>
                                        {address.street}, {address.city},{' '}
                                        {address.state} {address.postalCode}
                                      </p>
                                      {address.phoneNumber && (
                                        <p className='text-xs text-gray-500 mt-1 flex items-center'>
                                          <Phone size={10} className='mr-1' />
                                          {address.phoneNumber}
                                        </p>
                                      )}
                                    </div>
                                    {selectedAddressId === address._id && (
                                      <div className='text-amber-600 ml-2'>
                                        <CheckCircle size={16} />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              !isFetchingAddresses && (
                                <div className='p-3 border border-dashed border-gray-300 rounded-lg text-center'>
                                  <p className='text-xs sm:text-sm text-gray-500'>
                                    No saved addresses
                                  </p>
                                  <p className='text-xs text-gray-400 mt-1'>
                                    Add a new address below
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {isFetchingAddresses && (
                          <div className='p-3 bg-gray-50 rounded-lg mb-4'>
                            <div className='animate-pulse h-4 w-3/4 bg-gray-200 rounded mb-2'></div>
                            <div className='animate-pulse h-3 w-1/2 bg-gray-200 rounded'></div>
                          </div>
                        )}

                        {/* Only show the manual address form if no address is selected or no addresses exist */}
                        {(!selectedAddressId || userAddresses.length === 0) && (
                          <div>
                            <label
                              htmlFor='street'
                              className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                            >
                              Street Address
                            </label>
                            <input
                              type='text'
                              id='street'
                              name='street'
                              value={deliveryAddress.street}
                              onChange={handleDeliveryAddressChange}
                              className={`block w-full rounded-lg border ${
                                errors.street
                                  ? 'border-red-300'
                                  : 'border-gray-300'
                              } px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base`}
                              placeholder='House/Apt number and street name'
                            />
                            {errors.street && (
                              <div className='mt-1 text-xs sm:text-sm text-red-600'>
                                {errors.street}
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor='city'
                            className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                          >
                            City
                          </label>
                          <input
                            type='text'
                            id='city'
                            name='city'
                            value={deliveryAddress.city}
                            onChange={handleDeliveryAddressChange}
                            className={`block w-full rounded-lg border ${
                              errors.city ? 'border-red-300' : 'border-gray-300'
                            } px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base`}
                            placeholder='Your city'
                          />
                          {errors.city && (
                            <div className='mt-1 text-xs sm:text-sm text-red-600'>
                              {errors.city}
                            </div>
                          )}
                        </div>

                        <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                          <div>
                            <label
                              htmlFor='state'
                              className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                            >
                              State/Province
                            </label>
                            <input
                              type='text'
                              id='state'
                              name='state'
                              value={deliveryAddress.state}
                              onChange={handleDeliveryAddressChange}
                              className='block w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base'
                              placeholder='State'
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='postalCode'
                              className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                            >
                              Postal Code
                            </label>
                            <input
                              type='text'
                              id='postalCode'
                              name='postalCode'
                              value={deliveryAddress.postalCode}
                              onChange={handleDeliveryAddressChange}
                              className={`block w-full rounded-lg border ${
                                errors.postalCode
                                  ? 'border-red-300'
                                  : 'border-gray-300'
                              } px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base`}
                              placeholder='ZIP/Postal'
                            />
                            {errors.postalCode && (
                              <div className='mt-1 text-xs sm:text-sm text-red-600'>
                                {errors.postalCode}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor='instructions'
                            className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'
                          >
                            Delivery Instructions (optional)
                          </label>
                          <textarea
                            id='instructions'
                            name='instructions'
                            rows={2}
                            value={deliveryAddress.instructions}
                            onChange={handleDeliveryAddressChange}
                            className='block w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 focus:border-amber-500 focus:outline-none focus:ring-amber-500 text-sm sm:text-base'
                            placeholder='Apartment number, gate code, etc.'
                          ></textarea>
                        </div>

                        <div className='pt-4 flex space-x-3'>
                          <button
                            type='button'
                            onClick={handlePrevStep}
                            className='flex-1 py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm sm:text-base transition-colors duration-200'
                          >
                            <ArrowLeft size={16} className='mr-1' />
                            Back
                          </button>
                          <button
                            type='button'
                            onClick={handleNextStep}
                            className='flex-1 py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm sm:text-base transition-colors duration-200'
                          >
                            Continue
                            <ChevronRight size={16} className='ml-1' />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div
                      key='payment'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className='space-y-4 sm:space-y-5'
                    >
                      {/* Payment Method Section */}
                      <div className='bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100'>
                        <h2 className='text-lg font-bold text-gray-900 mb-4 sm:mb-5 flex items-center'>
                          <CreditCard
                            size={18}
                            className='mr-2 text-amber-600'
                          />
                          Payment Method
                        </h2>
                        <div className='space-y-3 sm:space-y-4'>
                          <div className='flex flex-col space-y-3'>
                            <div
                              onClick={() => setPaymentMethod('cash')}
                              className={`relative flex cursor-pointer rounded-lg border ${
                                paymentMethod === 'cash'
                                  ? 'border-amber-500 bg-amber-50'
                                  : 'border-gray-200'
                              } p-3 sm:p-4 shadow-sm focus:outline-none`}
                            >
                              <span className='flex flex-1 items-center'>
                                <span className='flex flex-col'>
                                  <span className='block text-sm sm:text-base font-medium text-gray-900'>
                                    Cash on Delivery
                                  </span>
                                  <span className='mt-1 text-xs sm:text-sm text-gray-500'>
                                    Pay in cash when you receive your order
                                  </span>
                                </span>
                              </span>
                              <span
                                className={`${
                                  paymentMethod === 'cash'
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                } pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-amber-600`}
                              >
                                <CheckCircle size={16} />
                              </span>
                            </div>

                            <div
                              onClick={() => setPaymentMethod('card')}
                              className={`relative flex cursor-pointer rounded-lg border ${
                                paymentMethod === 'card'
                                  ? 'border-amber-500 bg-amber-50'
                                  : 'border-gray-200'
                              } p-3 sm:p-4 shadow-sm focus:outline-none`}
                            >
                              <span className='flex flex-1 items-center'>
                                <span className='flex flex-col'>
                                  <span className='block text-sm sm:text-base font-medium text-gray-900'>
                                    Credit/Debit Card
                                  </span>
                                  <span className='mt-1 text-xs sm:text-sm text-gray-500'>
                                    Pay securely with Helcim payment gateway
                                  </span>
                                </span>
                              </span>
                              <span
                                className={`${
                                  paymentMethod === 'card'
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                } pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-amber-600`}
                              >
                                <CheckCircle size={16} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estimated Delivery Section */}
                      <div className='bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100'>
                        <h2 className='text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center'>
                          <Clock size={18} className='mr-2 text-amber-600' />
                          Estimated Delivery
                        </h2>
                        <div className='flex items-center justify-between p-2 bg-gray-50 rounded-lg'>
                          <div>
                            <p className='text-sm sm:text-base font-medium text-gray-700'>
                              Delivery Time
                            </p>
                            <p className='text-gray-500 text-xs sm:text-sm mt-0.5'>
                              30-45 minutes
                            </p>
                          </div>
                          <div className='bg-green-100 text-green-800 py-1.5 px-3 rounded-full text-xs sm:text-sm font-medium'>
                            Fast Delivery
                          </div>
                        </div>
                      </div>

                      {/* Order Summary Section (Condensed for mobile) */}
                      <div className='bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100'>
                        <h2 className='text-lg font-bold text-gray-900 mb-3 sm:mb-4'>
                          Order Summary
                        </h2>

                        {/* Items */}
                        <div className='border-b border-gray-200 pb-3 mb-3'>
                          <div className='max-h-[250px] overflow-y-auto space-y-3 pr-1'>
                            {cart.map((item) => (
                              <div
                                key={item.id}
                                className='flex items-start p-2 hover:bg-gray-50 rounded-lg transition-colors'
                              >
                                <div className='h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative'>
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className='object-cover object-center'
                                      sizes='(max-width: 640px) 56px, 64px'
                                    />
                                  ) : (
                                    <div className='h-full w-full flex items-center justify-center bg-gray-100'>
                                      <span className='text-gray-400 text-xs'>
                                        No image
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className='ml-3 flex-1 min-w-0'>
                                  <h3 className='text-xs sm:text-sm font-medium text-gray-900 line-clamp-1'>
                                    {item.name}
                                  </h3>
                                  <div className='mt-1 flex items-center justify-between'>
                                    <div className='text-xs text-gray-500'>
                                      ${item.price.toFixed(2)} × {item.quantity}
                                    </div>
                                    <div className='font-medium text-xs sm:text-sm text-amber-600'>
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>

                                  <div className='mt-1.5 flex items-center'>
                                    <button
                                      type='button'
                                      onClick={() =>
                                        updateQuantity(
                                          item.id,
                                          item.quantity - 1
                                        )
                                      }
                                      className='p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className='mx-2 text-gray-800 w-5 text-center text-xs'>
                                      {item.quantity}
                                    </span>
                                    <button
                                      type='button'
                                      onClick={() =>
                                        updateQuantity(
                                          item.id,
                                          item.quantity + 1
                                        )
                                      }
                                      className='p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                    >
                                      <Plus size={12} />
                                    </button>

                                    <button
                                      type='button'
                                      onClick={() => removeFromCart(item.id)}
                                      className='ml-auto p-1 text-gray-400 hover:text-red-500'
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Summary Costs */}
                        <div className='space-y-2 border-b border-gray-200 pb-3 mb-3'>
                          <div className='flex justify-between text-xs'>
                            <span className='text-gray-600'>Subtotal</span>
                            <span className='text-gray-900 font-medium'>
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className='flex justify-between text-xs'>
                            <span className='text-gray-600'>Tax (9%)</span>
                            <span className='text-gray-900 font-medium'>
                              ${tax.toFixed(2)}
                            </span>
                          </div>
                          <div className='flex justify-between text-xs'>
                            <span className='text-gray-600'>Delivery Fee</span>
                            {deliveryFee === 0 ? (
                              <span className='text-green-600 font-medium'>
                                Free
                              </span>
                            ) : (
                              <span className='text-gray-900 font-medium'>
                                ${deliveryFee.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {appliedCoupon && (
                            <div className='flex justify-between text-xs text-green-600'>
                              <span>Discount ({appliedCoupon.code})</span>
                              <span className='font-medium'>
                                -${couponDiscount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Total */}
                        <div className='flex justify-between items-center text-base sm:text-lg font-bold mb-4 sm:mb-5'>
                          <span className='text-gray-900'>Total</span>
                          <span className='text-amber-600'>
                            ${total.toFixed(2)}
                          </span>
                        </div>

                        <div className='pt-1 flex space-x-3'>
                          <button
                            type='button'
                            onClick={handlePrevStep}
                            className='w-1/3 py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs sm:text-sm transition-colors duration-200'
                          >
                            <ArrowLeft size={14} className='mr-1.5' />
                            Back
                          </button>
                          <button
                            type='submit'
                            form='checkoutForm'
                            className={`w-2/3 py-2.5 sm:py-3.5 px-4 flex items-center justify-center rounded-lg text-white font-bold text-xs sm:text-base transition-colors duration-200 ${
                              isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                            disabled={isLoading}
                          >
                            <span>
                              {isLoading
                                ? 'Processing...'
                                : paymentMethod === 'card'
                                ? `Continue to Payment • $${total.toFixed(2)}`
                                : `Place Order • $${total.toFixed(2)}`}
                            </span>
                            <ChevronRight size={16} className='ml-1.5' />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop view content */}
              <div className='hidden lg:block'>
                {/* Contact Information */}
                <div className='bg-white mb-2 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 lg:p-8 border border-gray-100'>
                  <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center'>
                    <div className='p-2 bg-amber-100 rounded-full mr-3 text-amber-600'>
                      <Phone size={18} />
                    </div>
                    Contact Information
                  </h2>
                  <div className='space-y-4 sm:space-y-5'>
                    <div>
                      <label
                        htmlFor='name-desktop'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Full Name
                      </label>
                      <input
                        type='text'
                        id='name-desktop'
                        name='name'
                        value={contactInfo.name}
                        onChange={handleContactInfoChange}
                        className={`block w-full rounded-lg border ${
                          errors.name
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        } px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors`}
                        placeholder='Your full name'
                      />
                      {errors.name && (
                        <div className='mt-1 text-sm text-red-600 flex items-center'>
                          <AlertCircle size={14} className='mr-1' />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor='email-desktop'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Email Address
                      </label>
                      <input
                        type='email'
                        id='email-desktop'
                        name='email'
                        value={contactInfo.email}
                        onChange={handleContactInfoChange}
                        className={`block w-full rounded-lg border ${
                          errors.email
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        } px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors`}
                        placeholder='your@email.com'
                      />
                      {errors.email && (
                        <div className='mt-1 text-sm text-red-600 flex items-center'>
                          <AlertCircle size={14} className='mr-1' />
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor='phone-desktop'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        id='phone-desktop'
                        name='phone'
                        value={contactInfo.phone}
                        onChange={handleContactInfoChange}
                        className={`block w-full rounded-lg border ${
                          errors.phone
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        } px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors`}
                        placeholder='For delivery updates'
                      />
                      {errors.phone && (
                        <div className='mt-1 text-sm text-red-600 flex items-center'>
                          <AlertCircle size={14} className='mr-1' />
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className='bg-white mb-2 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 lg:p-8 border border-gray-100'>
                  <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center'>
                    <div className='p-2 bg-amber-100 rounded-full mr-3 text-amber-600'>
                      <MapPin size={18} />
                    </div>
                    Delivery Address
                  </h2>

                  {/* Saved Addresses Section for Desktop */}
                  {user && (
                    <div className='space-y-3 mb-5 border-b border-gray-200 pb-5'>
                      <div className='flex justify-between items-center mb-3'>
                        <h3 className='font-medium text-gray-700 flex items-center'>
                          <Home size={14} className='text-amber-600 mr-2' />
                          Your Saved Addresses
                        </h3>
                        {userAddresses.length > 0 && (
                          <button
                            type='button'
                            onClick={handleUseNewAddress}
                            className='text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center bg-amber-50 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors'
                          >
                            {selectedAddressId ? (
                              <>
                                <Plus size={14} className='mr-1' />
                                Add New Address
                              </>
                            ) : (
                              'Use Saved Address'
                            )}
                          </button>
                        )}
                      </div>

                      {userAddresses.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                          {userAddresses.map((address) => (
                            <div
                              key={`desktop-${address._id}`}
                              onClick={() => handleAddressSelect(address._id)}
                              className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start ${
                                selectedAddressId === address._id
                                  ? 'border-amber-500 bg-amber-50 shadow-md'
                                  : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-sm'
                              }`}
                            >
                              <div className='mr-3 mt-0.5 text-gray-500'>
                                {address.addressType === 'home' ? (
                                  <Home size={18} className='text-amber-600' />
                                ) : address.addressType === 'work' ? (
                                  <div className='i-lucide-briefcase w-4.5 h-4.5 text-blue-600' />
                                ) : (
                                  <MapPin
                                    size={18}
                                    className='text-green-600'
                                  />
                                )}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium text-gray-900 truncate'>
                                  {address.name}
                                </p>
                                <p className='text-sm text-gray-600 line-clamp-2'>
                                  {address.street}, {address.city},{' '}
                                  {address.state} {address.postalCode}
                                </p>
                                {address.phoneNumber && (
                                  <p className='text-sm text-gray-500 mt-1'>
                                    <span className='flex items-center'>
                                      <Phone
                                        size={12}
                                        className='mr-1 text-amber-600'
                                      />
                                      {address.phoneNumber}
                                    </span>
                                  </p>
                                )}
                              </div>
                              {selectedAddressId === address._id && (
                                <div className='text-amber-600 ml-2 bg-amber-100 p-1 rounded-full'>
                                  <CheckCircle size={18} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        !isFetchingAddresses && (
                          <div className='p-5 border border-dashed border-amber-300 rounded-lg text-center mb-2 bg-amber-50'>
                            <p className='text-sm text-gray-700'>
                              No saved addresses
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              Add a new address below
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {isFetchingAddresses && (
                    <div className='p-4 bg-gray-50 rounded-lg mb-5'>
                      <div className='animate-pulse h-5 w-3/4 bg-gray-200 rounded mb-3'></div>
                      <div className='animate-pulse h-4 w-1/2 bg-gray-200 rounded'></div>
                    </div>
                  )}

                  {/* Only show the manual address form if no address is selected or no addresses exist */}
                  {(!selectedAddressId || userAddresses.length === 0) && (
                    <div className='space-y-4 sm:space-y-5'>
                      <div>
                        <label
                          htmlFor='street-desktop'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          Street Address
                        </label>
                        <input
                          type='text'
                          id='street-desktop'
                          name='street'
                          value={deliveryAddress.street}
                          onChange={handleDeliveryAddressChange}
                          className={`block w-full rounded-lg border ${
                            errors.street
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                          } px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors`}
                          placeholder='House/Apt number and street name'
                        />
                        {errors.street && (
                          <div className='mt-1 text-sm text-red-600 flex items-center'>
                            <AlertCircle size={14} className='mr-1' />
                            {errors.street}
                          </div>
                        )}
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5'>
                        <div>
                          <label
                            htmlFor='city-desktop'
                            className='block text-sm font-medium text-gray-700 mb-1'
                          >
                            City
                          </label>
                          <input
                            type='text'
                            id='city-desktop'
                            name='city'
                            value={deliveryAddress.city}
                            onChange={handleDeliveryAddressChange}
                            className={`block w-full rounded-lg border ${
                              errors.city
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            } px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors`}
                            placeholder='Your city'
                          />
                          {errors.city && (
                            <div className='mt-1 text-sm text-red-600 flex items-center'>
                              <AlertCircle size={14} className='mr-1' />
                              {errors.city}
                            </div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor='state-desktop'
                            className='block text-sm font-medium text-gray-700 mb-1'
                          >
                            State/Province
                          </label>
                          <input
                            type='text'
                            id='state-desktop'
                            name='state'
                            value={deliveryAddress.state}
                            onChange={handleDeliveryAddressChange}
                            className='block w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors'
                            placeholder='State'
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor='postalCode-desktop'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          Postal Code
                        </label>
                        <input
                          type='text'
                          id='postalCode-desktop'
                          name='postalCode'
                          value={deliveryAddress.postalCode}
                          onChange={handleDeliveryAddressChange}
                          className={`block w-full rounded-lg border ${
                            errors.postalCode
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                          } px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors`}
                          placeholder='ZIP/Postal'
                        />
                        {errors.postalCode && (
                          <div className='mt-1 text-sm text-red-600 flex items-center'>
                            <AlertCircle size={14} className='mr-1' />
                            {errors.postalCode}
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor='instructions-desktop'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          Delivery Instructions (optional)
                        </label>
                        <textarea
                          id='instructions-desktop'
                          name='instructions'
                          rows={3}
                          value={deliveryAddress.instructions}
                          onChange={handleDeliveryAddressChange}
                          className='block w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm sm:text-base transition-colors'
                          placeholder='Apartment number, gate code, or special instructions...'
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className='bg-white mb-2 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 lg:p-8 border border-gray-100'>
                  <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center'>
                    <div className='p-2 bg-amber-100 rounded-full mr-3 text-amber-600'>
                      <CreditCard size={18} />
                    </div>
                    Payment Method
                  </h2>
                  <div className='space-y-4'>
                    <div className='flex flex-col space-y-3 sm:space-y-4'>
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`relative flex cursor-pointer rounded-lg border-2 ${
                          paymentMethod === 'cash'
                            ? 'border-amber-500 bg-amber-50 shadow-md'
                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                        } p-4 sm:p-5 focus:outline-none transition-all`}
                      >
                        <div className='mr-3 mt-1'>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'cash'
                                ? 'border-amber-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {paymentMethod === 'cash' && (
                              <div className='w-3 h-3 bg-amber-500 rounded-full'></div>
                            )}
                          </div>
                        </div>
                        <span className='flex flex-1 items-center'>
                          <span className='flex flex-col'>
                            <span className='block text-sm sm:text-base font-medium text-gray-900'>
                              Cash on Delivery
                            </span>
                            <span className='mt-1 text-xs sm:text-sm text-gray-500'>
                              Pay in cash when you receive your order
                            </span>
                          </span>
                        </span>
                        {paymentMethod === 'cash' && (
                          <span className='text-amber-600 absolute right-4 top-1/2 -translate-y-1/2'>
                            <CheckCircle size={18} />
                          </span>
                        )}
                      </div>

                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`relative flex cursor-pointer rounded-lg border-2 ${
                          paymentMethod === 'card'
                            ? 'border-amber-500 bg-amber-50 shadow-md'
                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                        } p-4 sm:p-5 focus:outline-none transition-all`}
                      >
                        <div className='mr-3 mt-1'>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'card'
                                ? 'border-amber-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {paymentMethod === 'card' && (
                              <div className='w-3 h-3 bg-amber-500 rounded-full'></div>
                            )}
                          </div>
                        </div>
                        <span className='flex flex-1 items-center'>
                          <span className='flex flex-col'>
                            <span className='block text-sm sm:text-base font-medium text-gray-900'>
                              Credit/Debit Card
                            </span>
                            <span className='mt-1 text-xs sm:text-sm text-gray-500'>
                              Pay securely with Helcim payment gateway
                            </span>
                          </span>
                        </span>
                        {paymentMethod === 'card' && (
                          <span className='text-amber-600 absolute right-4 top-1/2 -translate-y-1/2'>
                            <CheckCircle size={18} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className='bg-white mb-2 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 lg:p-8 border border-gray-100'>
                  <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center'>
                    <div className='p-2 bg-amber-100 rounded-full mr-3 text-amber-600'>
                      <Clock size={18} />
                    </div>
                    Estimated Delivery
                  </h2>
                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100'>
                    <div>
                      <p className='text-sm sm:text-base font-medium text-gray-700'>
                        Expected Delivery Time
                      </p>
                      <p className='text-gray-500 text-xs sm:text-sm mt-1'>
                        30-45 minutes from order confirmation
                      </p>
                    </div>
                    <div className='bg-green-100 text-green-800 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium shadow-sm'>
                      Fast Delivery
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right column - Order Summary */}
          <div className='lg:w-[380px] xl:w-[450px] order-1 lg:order-2'>
            <div className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 lg:p-8 border border-gray-100 sticky top-20 hidden lg:block'>
              <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center'>
                <ShoppingBag className='mr-2 text-amber-600' />
                Order Summary
                <span className='ml-2 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </h2>

              {/* Items */}
              <div className='border-b border-gray-200 pb-4 sm:pb-5 mb-4 sm:mb-5'>
                <div className='max-h-[350px] overflow-y-auto space-y-3 sm:space-y-4 pr-2'>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className='flex items-start p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100'
                    >
                      <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative'>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className='object-cover object-center'
                          />
                        ) : (
                          <div className='h-full w-full flex items-center justify-center bg-gray-100'>
                            <ShoppingBag className='h-5 w-5 text-gray-400' />
                          </div>
                        )}
                      </div>

                      <div className='ml-3 flex-1 min-w-0'>
                        <h3 className='text-xs sm:text-sm font-medium text-gray-900 line-clamp-1'>
                          {item.name}
                        </h3>
                        <div className='mt-1 flex items-center justify-between'>
                          <div className='text-xs text-gray-500'>
                            ${item.price.toFixed(2)} × {item.quantity}
                          </div>
                          <div className='font-medium text-xs sm:text-sm text-amber-600'>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        <div className='mt-2 flex items-center'>
                          <button
                            type='button'
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className='p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          >
                            <Minus size={14} />
                          </button>
                          <span className='mx-2 text-gray-800 w-5 text-center text-xs'>
                            {item.quantity}
                          </span>
                          <button
                            type='button'
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className='p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          >
                            <Plus size={14} />
                          </button>

                          <button
                            type='button'
                            onClick={() => removeFromCart(item.id)}
                            className='ml-auto p-1.5 text-gray-400 hover:text-red-500'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Costs */}
              <div className='space-y-3 border-b border-gray-200 pb-4 sm:pb-5 mb-4 sm:mb-5 bg-gray-50 p-4 rounded-lg'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='text-gray-900 font-medium'>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Tax (9%)</span>
                  <span className='text-gray-900 font-medium'>
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className='text-green-600 font-medium'>Free</span>
                  ) : (
                    <span className='text-gray-900 font-medium'>
                      ${deliveryFee.toFixed(2)}
                    </span>
                  )}
                </div>
                {appliedCoupon && (
                  <div className='flex justify-between text-sm text-green-600'>
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className='font-medium'>
                      -${couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                {subtotal > 0 && subtotal < 50 && (
                  <div className='text-sm text-amber-600 mt-2 italic bg-amber-50 border border-amber-100 rounded-md p-2 text-center'>
                    Add ${(50 - subtotal).toFixed(2)} more to get free delivery!
                  </div>
                )}
              </div>

              {/* Total */}
              <div className='flex justify-between items-center text-base sm:text-lg font-bold mb-5 sm:mb-6 bg-amber-50 p-3 rounded-lg border border-amber-100'>
                <span className='text-gray-900'>Total</span>
                <span className='text-amber-600'>${total.toFixed(2)}</span>
              </div>

              {/* Place Order Button (Desktop) */}
              <div>
                <button
                  type='submit'
                  form='checkoutForm'
                  className={`w-full py-3.5 sm:py-4 px-6 flex items-center justify-center rounded-lg text-white font-semibold text-sm sm:text-base transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg'
                  }`}
                  disabled={isLoading}
                >
                  <span>
                    {isLoading
                      ? 'Processing...'
                      : paymentMethod === 'card'
                      ? `Continue to Payment • $${total.toFixed(2)}`
                      : `Place Order • $${total.toFixed(2)}`}
                  </span>
                  <ChevronRight size={18} className='ml-2' />
                </button>
              </div>

              {/* Back to Menu Link */}
              <div className='mt-4 sm:mt-6 text-center'>
                <Link
                  href='/menu'
                  onClick={handleNavigateAway}
                  className='text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center justify-center'
                >
                  <ArrowLeft size={14} className='mr-1.5' />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cart Summary Slide-over */}
        <AnimatePresence>
          {showCartSummary && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 bg-black bg-opacity-50 z-30'
                onClick={() => setShowCartSummary(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className='fixed bottom-0 left-0 right-0 bg-white z-40 rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto pb-safe'
              >
                <div className='sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-gray-100 flex justify-between items-center z-10'>
                  <h2 className='text-base font-bold text-gray-900 flex items-center'>
                    <ShoppingBag className='mr-2 h-4 w-4 text-amber-600' />
                    Cart Summary
                  </h2>
                  <button
                    onClick={() => setShowCartSummary(false)}
                    className='p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200'
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Items List */}
                <div className='px-4 py-3'>
                  <div className='space-y-3'>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className='flex items-start p-2 hover:bg-gray-50 rounded-lg transition-colors'
                      >
                        <div className='h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative'>
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className='object-cover object-center'
                              sizes='56px'
                            />
                          ) : (
                            <div className='h-full w-full flex items-center justify-center bg-gray-100'>
                              <ShoppingBag className='h-5 w-5 text-gray-400' />
                            </div>
                          )}
                        </div>

                        <div className='ml-3 flex-1 min-w-0'>
                          <h3 className='text-xs font-medium text-gray-900 line-clamp-1'>
                            {item.name}
                          </h3>
                          <div className='mt-1 flex items-center justify-between'>
                            <div className='text-xs text-gray-500'>
                              ${item.price.toFixed(2)} × {item.quantity}
                            </div>
                            <div className='font-medium text-xs sm:text-sm text-amber-600'>
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>

                          <div className='mt-1.5 flex items-center'>
                            <button
                              type='button'
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className='p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                            >
                              <Minus size={10} />
                            </button>
                            <span className='mx-2 text-gray-800 w-4 text-center text-xs'>
                              {item.quantity}
                            </span>
                            <button
                              type='button'
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className='p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                            >
                              <Plus size={10} />
                            </button>

                            <button
                              type='button'
                              onClick={() => removeFromCart(item.id)}
                              className='ml-auto p-1 text-gray-400 hover:text-red-500'
                              aria-label='Remove item'
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost summary */}
                <div className='px-4 pt-2 pb-4 bg-gray-50 border-t border-gray-200 space-y-3'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-xs'>
                      <span className='text-gray-600'>Subtotal</span>
                      <span className='text-gray-900 font-medium'>
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-gray-600'>Tax (9%)</span>
                      <span className='text-gray-900 font-medium'>
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-gray-600'>Delivery Fee</span>
                      {deliveryFee === 0 ? (
                        <span className='text-green-600 font-medium'>Free</span>
                      ) : (
                        <span className='text-gray-900 font-medium'>
                          ${deliveryFee.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {appliedCoupon && (
                      <div className='flex justify-between text-xs text-green-600'>
                        <span>Discount ({appliedCoupon.code})</span>
                        <span className='font-medium'>
                          -${couponDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {subtotal > 0 && subtotal < 50 && (
                      <div className='text-xs text-amber-600 mt-2 italic'>
                        Add ${(50 - subtotal).toFixed(2)} more to get free
                        delivery!
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className='flex justify-between items-center text-sm font-bold pt-2 border-t border-gray-200'>
                    <span className='text-gray-900'>Total</span>
                    <span className='text-amber-600'>${total.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setShowCartSummary(false);
                    }}
                    className='w-full py-2.5 flex items-center justify-center rounded-lg bg-amber-600 text-white font-semibold text-sm mt-2'
                  >
                    Back to Checkout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
