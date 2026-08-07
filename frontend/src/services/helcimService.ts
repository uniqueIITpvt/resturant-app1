import axios from 'axios';

// Get the API URL from environment variables or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api/payments`;

// Types
export interface PaymentInitializeRequest {
  amount: number;
  customerCode?: string;
  invoiceNumber?: string;
  returnUrl: string;
  homepageUrl?: string;
  customerData?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  checkoutToken?: string;
  helcimPayId?: string;
  paymentUrl?: string;
  transactionId?: string;
  responseCode?: string;
  responseMessage?: string;
  redirectUrl?: string;
  status?: string;
  error?: string;
  details?: string;
}

export interface TransactionData {
  data?: {
    transactionId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Initialize a payment with Helcim
 *
 * @param data Payment request data
 * @returns Response with checkout token for HelcimPay.js
 */
export const initializePayment = async (
  data: PaymentInitializeRequest,
  token?: string
): Promise<PaymentResponse> => {
  try {
    // Ensure the return URL is absolute
    if (!data.returnUrl) {
      data.returnUrl = window.location.origin + '/checkout/success';
    } else if (!data.returnUrl.startsWith('http')) {
      data.returnUrl = window.location.origin + data.returnUrl;
    }

    // Set homepage URL if not provided
    if (!data.homepageUrl) {
      data.homepageUrl = window.location.origin;
    } else if (!data.homepageUrl.startsWith('http')) {
      data.homepageUrl = window.location.origin + data.homepageUrl;
    }

    console.log('Initializing payment with data:', data);

    // Set up headers with optional authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_BASE_URL}/initialize`, data, {
      headers,
    });

    console.log('Payment initialization response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Payment initialization error:', error);

    if (axios.isAxiosError(error) && error.response) {
      // Handle axios errors with response
      const errorMessage =
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'error' in error.response.data
          ? String(error.response.data.error)
          : 'Payment initialization failed';

      console.error('API error response:', error.response.data);

      return {
        success: false,
        error: errorMessage,
        details: error.response.data?.details || error.message,
      };
    }

    // Handle other errors
    let errorMessage = 'Network error occurred while processing payment';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Verify a payment token and transaction after processing through HelcimPay.js
 *
 * @param transactionData The transaction data returned from HelcimPay.js
 * @returns Verification response
 */
export const verifyHelcimPayment = async (
  transactionData: TransactionData,
  token?: string
): Promise<PaymentResponse> => {
  try {
    console.log('Verifying HelcimPay.js payment:', transactionData);

    // Set up headers with optional authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${API_BASE_URL}/verify`,
      { transactionData },
      { headers }
    );

    console.log('Payment verification response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle axios errors with response
      const errorMessage =
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'error' in error.response.data
          ? String(error.response.data.error)
          : 'Failed to verify payment';

      return {
        success: false,
        error: errorMessage,
        details: error.response.data?.details || error.message,
      };
    }

    // Handle other errors
    let errorMessage = 'Network error occurred while verifying payment';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Verify the status of a payment
 *
 * @param helcimPayId Payment ID to check
 * @returns Payment status response
 */
export const verifyPaymentStatus = async (
  helcimPayId: string,
  token?: string
): Promise<PaymentResponse> => {
  try {
    console.log('Verifying payment status for:', helcimPayId);

    // Set up headers with optional authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/status/${helcimPayId}`, {
      headers,
    });

    console.log('Payment status verification response:', response.data);

    // Ensure we handle the redirectUrl properly
    if (response.data.redirectUrl) {
      console.log('Got redirectUrl from server:', response.data.redirectUrl);
      // Store in session for immediate use
      sessionStorage.setItem('homepageRedirectUrl', response.data.redirectUrl);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle axios errors with response
      const errorMessage =
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'error' in error.response.data
          ? String(error.response.data.error)
          : 'Failed to verify payment status';

      return {
        success: false,
        error: errorMessage,
        details: error.response.data?.details || error.message,
      };
    }

    // Handle other errors
    let errorMessage = 'Network error occurred while verifying payment';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Generate a unique invoice number
 *
 * @returns Unique invoice number string
 */
export const generateInvoiceNumber = (): string => {
  // Generate a unique invoice number (timestamp + random number)
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

/**
 * Handle the return from Helcim payment
 * Extracts status and transaction ID from URL parameters
 *
 * @returns Object with status and transaction ID
 */
export const handlePaymentReturn = (): {
  status: string;
  transactionId?: string;
} => {
  // Get URL parameters from the current URL
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status') || 'unknown';
  const transactionId = urlParams.get('txnId') || undefined;

  return {
    status,
    transactionId,
  };
};
