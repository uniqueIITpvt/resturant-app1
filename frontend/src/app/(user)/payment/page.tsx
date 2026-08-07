'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Shield, CreditCard, LockKeyhole } from 'lucide-react';
import HelcimPayment from '@/components/payment/HelcimPayment';
import CreditCardComponent from '@/components/payment/CreditCard';
import { generateInvoiceNumber } from '@/services/helcimService';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

// Define type for order data
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedAddons?: Array<{ id: string; name: string; price: number }>;
}

interface OrderData {
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  coupon: {
    code: string;
    discount: number;
  } | null;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [orderId, setOrderId] = useState<string>('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add new state for credit card details
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• ••••',
    name: 'YOUR NAME',
    expiry: 'MM/YY',
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!token || !user) {
      router.push('/auth/login?redirect=/payment');
      return;
    }

    // Check if we have order data in localStorage
    const storedOrderData = localStorage.getItem('pending_payment_order');

    if (!storedOrderData) {
      setError('No order information found');
      setLoading(false);
      return;
    }

    try {
      const parsedOrderData = JSON.parse(storedOrderData) as OrderData;
      setOrderData(parsedOrderData);

      // Generate or use existing order ID
      const existingOrderId = localStorage.getItem('pending_order_id');
      const newOrderId = existingOrderId || generateInvoiceNumber();

      if (!existingOrderId) {
        localStorage.setItem('pending_order_id', newOrderId);
      }

      setOrderId(newOrderId);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing order data:', err);
      setError('Invalid order data');
      setLoading(false);
    }
  }, [router, token, user]);

  const handlePaymentError = (errorMessage: string) => {
    toast.error(errorMessage || 'Payment failed. Please try again.');
    console.error('Payment error:', errorMessage);
    // Keep order data in case user wants to retry
  };

  const handleCancel = () => {
    // Don't clear order data so user can come back to payment
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16 sm:pt-24'>
        <div className='max-w-3xl mx-auto px-4 py-8'>
          <div className='bg-white rounded-xl shadow-lg p-8 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-red-600 text-2xl'>×</span>
            </div>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>
              Payment Error
            </h1>
            <p className='text-gray-700 mb-6'>{error}</p>
            <Link
              href='/checkout'
              className='inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all transform hover:scale-105'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Return to Checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData || !orderData.total) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16 sm:pt-24'>
        <div className='max-w-3xl mx-auto px-4 py-8'>
          <div className='bg-white rounded-xl shadow-lg p-8 text-center'>
            <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-amber-600 text-2xl'>!</span>
            </div>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>
              Invalid Order
            </h1>
            <p className='text-gray-700 mb-6'>
              We couldn&apos;t find valid order information for payment
            </p>
            <Link
              href='/cart'
              className='inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all transform hover:scale-105'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prepare customer data from user profile
  const customerData = {
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-10 sm:pt-16'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Payment Section */}
          <div className='bg-white rounded-xl shadow-lg p-6 order-2 lg:order-1'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>
                Secure Payment
              </h2>
              <div className='flex items-center space-x-4 mb-2'>
                <div className='flex items-center text-green-600'>
                  <Shield className='w-5 h-5 mr-1' />
                  <span className='text-sm'>SSL Encrypted</span>
                </div>
                <div className='flex items-center text-gray-600'>
                  <LockKeyhole className='w-5 h-5 mr-1' />
                  <span className='text-sm'>Secure Payment</span>
                </div>
              </div>

              {/* Accepted Cards */}
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-gray-600'>Accepted Cards</span>
                  <div className='flex space-x-3'>
                    {/* Visa */}
                    <div className='flex items-center justify-center'>
                      <Image
                        src='/cards/card.png'
                        alt='Visa'
                        width={45}
                        height={45}
                      />
                    </div>
                    {/* Mastercard */}
                    <div className='flex items-center justify-center'>
                      <Image
                        src='/cards/american-express.png'
                        alt='American Express'
                        width={45}
                        height={45}
                      />
                    </div>
                    {/* American Express */}
                    <div className='flex items-center justify-center'>
                      <Image
                        src='/cards/discover.png'
                        alt='Discover'
                        width={45}
                        height={45}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Card Preview */}
              <div className='mb-8'>
                <CreditCardComponent
                  cardNumber={cardDetails.number}
                  cardHolder={cardDetails.name}
                  expiryDate={cardDetails.expiry}
                />
              </div>

              <HelcimPayment
                amount={orderData?.total || 0}
                orderId={orderId}
                customerData={customerData}
                token={token || undefined}
                onPaymentError={handlePaymentError}
                onCancel={handleCancel}
                returnUrl='/checkout/success'
              />
            </div>
          </div>

          {/* Order Summary Section */}
          <div className='bg-white rounded-xl shadow-lg p-6 order-1 lg:order-2'>
            <h2 className='text-xl font-bold text-gray-800 mb-4'>
              Order Summary
            </h2>
            <div className='space-y-4 mb-6'>
              {orderData.items &&
                orderData.items.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between py-2 border-b border-gray-100'
                  >
                    <div className='flex items-center'>
                      {item.image && (
                        <div className='w-12 h-12 rounded-lg overflow-hidden mr-3 bg-gray-100'>
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className='object-cover'
                          />
                        </div>
                      )}
                      <div>
                        <p className='font-medium text-gray-800'>{item.name}</p>
                        <p className='text-sm text-gray-500'>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className='font-medium'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>

            <div className='space-y-3 text-sm border-t border-gray-200 pt-4'>
              <div className='flex justify-between text-gray-600'>
                <span>Subtotal</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-gray-600'>
                <span>Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-gray-600'>
                <span>Delivery Fee</span>
                <span>${orderData.deliveryFee.toFixed(2)}</span>
              </div>
              {orderData.coupon && (
                <div className='flex justify-between text-green-600'>
                  <span>Discount ({orderData.coupon.code})</span>
                  <span>-${orderData.coupon.discount.toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between text-lg font-bold pt-4 border-t border-gray-200'>
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-200'>
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <div className='flex items-center'>
                  <CreditCard className='w-4 h-4 mr-2' />
                  <span>Delivery Address:</span>
                </div>
                <Link
                  href='/checkout'
                  className='text-amber-600 hover:text-amber-700'
                >
                  Edit
                </Link>
              </div>
              <div className='mt-2 text-sm text-gray-800'>
                <p>{orderData.deliveryAddress.street}</p>
                <p>
                  {orderData.deliveryAddress.city},{' '}
                  {orderData.deliveryAddress.state}{' '}
                  {orderData.deliveryAddress.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className='mt-8 text-center'>
          <div className='flex items-center justify-center space-x-6'>
            <div className='text-gray-500 text-sm flex items-center'>
              <Shield className='w-5 h-5 mr-2 text-green-600' />
              <span>256-bit SSL Security</span>
            </div>
            <div className='text-gray-500 text-sm flex items-center'>
              <LockKeyhole className='w-5 h-5 mr-2 text-green-600' />
              <span>Encrypted Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
