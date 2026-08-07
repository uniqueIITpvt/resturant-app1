'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Home,
  Coffee,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// API URL for backend requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [isValidAccess, setIsValidAccess] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    // Get order details from sessionStorage
    const storedOrderNumber = sessionStorage.getItem('last_order_number');
    const checkoutCompleted = sessionStorage.getItem('checkoutCompleted');
    const transactionData = sessionStorage.getItem('transactionData');
    const pendingOrderData = localStorage.getItem('pending_payment_order');
    const intentionalRedirect = localStorage.getItem(
      'intentional_redirect_to_success'
    );
    const hasCompletedCheckout = localStorage.getItem('has_completed_checkout');

    // Flag to prevent duplicate order creation
    const orderCreationStarted = sessionStorage.getItem(
      'order_creation_started'
    );
    const transactionOrderCreated = sessionStorage.getItem(
      'transaction_order_created'
    );

    // Check if we need to create an order from Helcim payment
    const createCardOrder = async () => {
      // Prevent duplicate order creation
      if (!token || !transactionData || !pendingOrderData || creatingOrder) {
        return;
      }

      // Check if we already started creating an order for this transaction
      const parsedTransactionData = JSON.parse(transactionData);
      const transactionId = parsedTransactionData?.data?.transactionId;

      // If we already created or started creating an order for this transaction, don't create another
      if (
        orderCreationStarted ||
        (transactionId && transactionId === transactionOrderCreated)
      ) {
        console.log(
          'Order creation already in progress or completed for this transaction'
        );
        return;
      }

      try {
        // Set flag to indicate order creation has started
        sessionStorage.setItem('order_creation_started', 'true');
        if (transactionId) {
          sessionStorage.setItem('transaction_order_created', transactionId);
        }

        setCreatingOrder(true);

        // Parse transaction and order data
        const parsedOrderData = JSON.parse(pendingOrderData);

        // Log data for debugging
        console.log(
          'Creating order with transaction data:',
          parsedTransactionData
        );
        console.log('Order data:', parsedOrderData);

        if (
          !parsedTransactionData.data ||
          !parsedTransactionData.data.transactionId
        ) {
          throw new Error('Invalid transaction data');
        }

        // Extract card details if available
        const cardDetails = {
          last4:
            parsedTransactionData.data.last4 ||
            parsedTransactionData.data.cardNumber?.slice(-4),
          brand:
            parsedTransactionData.data.cardType ||
            parsedTransactionData.data.cardBrand ||
            'Credit',
        };

        // Prepare order data with payment details
        const orderData = {
          items: parsedOrderData.items,
          total: parsedOrderData.total,
          subtotal: parsedOrderData.subtotal,
          tax: parsedOrderData.tax,
          deliveryFee: parsedOrderData.deliveryFee,
          coupon: parsedOrderData.coupon,
          deliveryAddress: parsedOrderData.deliveryAddress,
          paymentMethod: 'card',
          cardDetails: cardDetails,
          transactionId: parsedTransactionData.data.transactionId,
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
        console.log('Order created successfully:', order);

        // Set order number for display
        setOrderNumber(order.orderNumber);
        sessionStorage.setItem('last_order_number', order.orderNumber);
        sessionStorage.setItem('last_order_id', order._id);

        // Mark this transaction as having a completed order
        if (parsedTransactionData.data.transactionId) {
          sessionStorage.setItem(
            'transaction_order_created',
            parsedTransactionData.data.transactionId
          );
        }

        // Clear cart and payment data
        localStorage.removeItem('cart');
        localStorage.removeItem('pending_payment_order');

        // Set checkout flags
        localStorage.setItem('has_completed_checkout', 'true');
        sessionStorage.setItem('checkout_completed', Date.now().toString());

        setIsValidAccess(true);
        toast.success('Payment successful! Your order has been placed.');
      } catch (error) {
        console.error('Error creating order:', error);
        toast.error('There was an issue processing your order.');
      } finally {
        setCreatingOrder(false);
      }
    };

    // If we have transaction data from a card payment, create an order
    if (
      checkoutCompleted &&
      transactionData &&
      pendingOrderData &&
      token &&
      !orderCreationStarted
    ) {
      console.log('Creating card order from transaction data');
      createCardOrder();
      return;
    }

    // For non-card payment success (cash orders)
    // Validate access to success page
    if (
      !checkoutCompleted &&
      !storedOrderNumber &&
      !hasCompletedCheckout &&
      !intentionalRedirect
    ) {
      // If accessed directly without completing checkout, redirect to home
      router.replace('/');
      return;
    }

    // If we have order data, display it
    if (storedOrderNumber) {
      setOrderNumber(storedOrderNumber);
      setIsValidAccess(true);
    }

    // Clear the intentional redirect flag if it exists
    if (intentionalRedirect) {
      localStorage.removeItem('intentional_redirect_to_success');
    }

    return () => {
      // We'll only clear this when explicitly navigating away via the links
      // This prevents clearing during refreshes
      if (typeof window !== 'undefined') {
        const isNavigatingAway =
          (typeof document !== 'undefined' &&
            document.visibilityState === 'hidden') ||
          window.location.pathname !== '/checkout/success';

        if (isNavigatingAway) {
          // Only clear when actually navigating away, not on refresh
          sessionStorage.removeItem('checkoutCompleted');
          sessionStorage.removeItem('transactionData');
          sessionStorage.removeItem('last_order_id');
          sessionStorage.removeItem('last_order_number');
          sessionStorage.removeItem('order_creation_started');
          sessionStorage.removeItem('transaction_order_created');
          localStorage.removeItem('has_completed_checkout');
          localStorage.removeItem('pending_payment_order');
        }
      }
    };
  }, [router, token, creatingOrder]);

  const handleTrackOrder = () => {
    // Set the active tab to 'orders' in localStorage before redirecting
    localStorage.setItem('profileActiveTab', 'orders');
    router.push('/profile?tab=orders');
  };

  const handleViewOrderHistory = () => {
    // Set the active tab to 'orders' in localStorage before redirecting
    localStorage.setItem('profileActiveTab', 'orders');
    router.push('/profile?tab=orders');
  };

  if (creatingOrder) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center'>
        <div className='w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4'></div>
        <div className='text-lg text-gray-700'>Processing your payment...</div>
      </div>
    );
  }

  if (!isValidAccess && !creatingOrder) {
    return null; // Return nothing while redirecting
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-6'>
      <div className='max-w-md w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6'>
            <CheckCircle className='h-10 w-10 text-green-600' />
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Order Confirmed!
          </h1>
          <p className='text-lg text-gray-600 mb-6'>
            Your order has been placed successfully
          </p>

          <div className='bg-amber-50 rounded-lg p-4 mb-6 text-left'>
            <h2 className='font-bold text-amber-800 mb-2'>Order Details</h2>
            <p className='text-amber-700 mb-1'>
              Order #: {orderNumber || '********'}
            </p>
            <p className='text-amber-700 mb-1'>
              Estimated Delivery: 30-45 minutes
            </p>
            <p className='text-amber-700'>
              We&apos;ll send an email with your order confirmation and receipt.
            </p>
          </div>

          <div className='space-y-4 mb-6'>
            <button
              onClick={handleTrackOrder}
              className='w-full p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:border-amber-300 hover:bg-amber-50 transition-colors'
            >
              <div className='flex items-center'>
                <Coffee className='h-6 w-6 text-amber-600 mr-3' />
                <span className='text-gray-700'>Track your order</span>
              </div>
              <ChevronRight className='h-5 w-5 text-gray-400' />
            </button>

            <button
              onClick={handleViewOrderHistory}
              className='w-full p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:border-amber-300 hover:bg-amber-50 transition-colors'
            >
              <div className='flex items-center'>
                <ShoppingBag className='h-6 w-6 text-amber-600 mr-3' />
                <span className='text-gray-700'>View order history</span>
              </div>
              <ChevronRight className='h-5 w-5 text-gray-400' />
            </button>
          </div>

          <div className='space-y-3'>
            <Link
              href='/menu'
              className='w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none transition'
            >
              Continue Shopping
            </Link>

            <Link
              href='/'
              className='w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition'
            >
              <Home className='mr-2 h-5 w-5' />
              Return to Home
            </Link>
          </div>
        </div>
      </div>

      <div className='mt-8 text-center text-gray-500 text-sm'>
        <p>Thank you for choosing Unique Café!</p>
      </div>
    </div>
  );
}
