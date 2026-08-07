'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  Image as ImageIcon,
  Utensils,
  RefreshCw,
  Users,
  AlertCircle,
  Play,
  Code,
  X,
} from 'lucide-react';

// Define the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface EndpointStatus {
  name: string;
  url: string;
  method: string;
  category: 'auth' | 'food' | 'upload' | 'general' | 'user';
  status: 'success' | 'error' | 'loading';
  description?: string;
  responseTime?: number;
  lastChecked?: Date;
}

interface ApiTestRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

interface ApiTestResponse {
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, string>;
  time: number;
}

export default function ApiHealth() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    // General endpoints
    {
      name: 'Server Health',
      url: `${API_URL}/api`,
      method: 'GET',
      category: 'general',
      status: 'loading',
      description: 'Checks if the backend server is running',
    },

    // Auth endpoints
    {
      name: 'User Login',
      url: `${API_URL}/api/auth/login`,
      method: 'POST',
      category: 'auth',
      status: 'loading',
      description: 'Authenticate user with email and password',
    },
    {
      name: 'User Registration',
      url: `${API_URL}/api/auth/register`,
      method: 'POST',
      category: 'auth',
      status: 'loading',
      description: 'Register new user with email verification',
    },
    {
      name: 'Verify Email OTP',
      url: `${API_URL}/api/auth/verify-otp`,
      method: 'POST',
      category: 'auth',
      status: 'loading',
      description: 'Verify user email with one-time password',
    },
    {
      name: 'Resend OTP',
      url: `${API_URL}/api/auth/resend-otp`,
      method: 'POST',
      category: 'auth',
      status: 'loading',
      description: 'Resend verification OTP to user email',
    },
    {
      name: 'Get Current User',
      url: `${API_URL}/api/auth/me`,
      method: 'GET',
      category: 'auth',
      status: 'loading',
      description: 'Get authenticated user profile',
    },
    {
      name: 'Admin Registration',
      url: `${API_URL}/api/auth/admin-register`,
      method: 'POST',
      category: 'auth',
      status: 'loading',
      description: 'Superadmin only: Register admin/superadmin users',
    },

    // User management endpoints
    {
      name: 'Get All Users',
      url: `${API_URL}/api/users`,
      method: 'GET',
      category: 'user',
      status: 'loading',
      description: 'Admin only: List all registered users',
    },
    {
      name: 'Get User by ID',
      url: `${API_URL}/api/users/:id`,
      method: 'GET',
      category: 'user',
      status: 'loading',
      description: 'Get user profile by ID',
    },

    // Food endpoints
    {
      name: 'Get All Products',
      url: `${API_URL}/api/products`,
      method: 'GET',
      category: 'food',
      status: 'loading',
      description: 'List all food items in the menu',
    },
    {
      name: 'Food by Category',
      url: `${API_URL}/api/products/category/Main Course`,
      method: 'GET',
      category: 'food',
      status: 'loading',
      description: 'Filter food items by category',
    },
    {
      name: 'Add New Product',
      url: `${API_URL}/api/products`,
      method: 'POST',
      category: 'food',
      status: 'loading',
      description: 'Admin only: Add new food item to menu',
    },
    {
      name: 'Update Product',
      url: `${API_URL}/api/products/:id`,
      method: 'PUT',
      category: 'food',
      status: 'loading',
      description: 'Admin only: Update existing food item',
    },
    {
      name: 'Delete Product',
      url: `${API_URL}/api/products/:id`,
      method: 'DELETE',
      category: 'food',
      status: 'loading',
      description: 'Admin only: Remove food item from menu',
    },

    // Upload endpoints
    {
      name: 'Upload Image',
      url: `${API_URL}/api/upload/image`,
      method: 'POST',
      category: 'upload',
      status: 'loading',
      description: 'Admin only: Upload image to Cloudinary',
    },
    {
      name: 'Delete Image',
      url: `${API_URL}/api/upload/image/:public_id`,
      method: 'DELETE',
      category: 'upload',
      status: 'loading',
      description: 'Admin only: Delete image from Cloudinary',
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API Testing states
  const [showTester, setShowTester] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<EndpointStatus | null>(null);
  const [apiRequest, setApiRequest] = useState<ApiTestRequest>({
    url: '',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: '',
  });
  const [apiResponse, setApiResponse] = useState<ApiTestResponse | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [authToken, setAuthToken] = useState('');

  const checkEndpoint = async (
    endpoint: EndpointStatus
  ): Promise<EndpointStatus> => {
    const startTime = Date.now();
    try {
      await fetch(endpoint.url, {
        method: endpoint.method === 'POST' ? 'HEAD' : 'GET',
        headers: {
          Accept: 'application/json',
        },
        mode: 'no-cors', // To avoid CORS issues during health checks
      });
      const endTime = Date.now();
      return {
        ...endpoint,
        status: 'success' as const, // We're using no-cors, so we assume success if no exception
        responseTime: endTime - startTime,
        lastChecked: new Date(),
      };
    } catch {
      // We don't need the actual error object
      return {
        ...endpoint,
        status: 'error' as const,
        lastChecked: new Date(),
      };
    }
  };

  const checkAllEndpoints = async () => {
    setIsRefreshing(true);
    try {
      const results = await Promise.all(endpoints.map(checkEndpoint));
      setEndpoints(results);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkAllEndpoints();
    const interval = setInterval(checkAllEndpoints, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkAllEndpoints]);

  const filteredEndpoints =
    activeCategory === 'all'
      ? endpoints
      : endpoints.filter((endpoint) => endpoint.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <ShieldCheck className='w-4 h-4' />;
      case 'food':
        return <Utensils className='w-4 h-4' />;
      case 'upload':
        return <ImageIcon className='w-4 h-4' />;
      case 'user':
        return <Users className='w-4 h-4' />;
      case 'general':
        return <AlertCircle className='w-4 h-4' />;
      default:
        return null;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // New function for API testing
  const handleSelectEndpoint = (endpoint: EndpointStatus) => {
    setSelectedEndpoint(endpoint);

    // Check if URL has parameters (like :id)
    const hasUrlParams = endpoint.url.includes(':');
    let processedUrl = endpoint.url;

    if (hasUrlParams) {
      // For display purposes, mark parameters for user to replace
      processedUrl = endpoint.url.replace(/:([a-zA-Z0-9_]+)/g, '[REPLACE_$1]');
    }

    // Default demo request bodies based on endpoint
    let defaultBody = '';

    // Set default JSON data based on endpoint URL and method
    if (endpoint.method !== 'GET') {
      if (endpoint.url.includes('/api/auth/login')) {
        defaultBody = JSON.stringify(
          {
            email: 'user@example.com',
            password: 'password123',
          },
          null,
          2
        );
      } else if (endpoint.url.includes('/api/auth/register')) {
        defaultBody = JSON.stringify(
          {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
          },
          null,
          2
        );
      } else if (endpoint.url.includes('/api/auth/verify-otp')) {
        defaultBody = JSON.stringify(
          {
            userId: 'user_id_here',
            otp: '123456',
          },
          null,
          2
        );
      } else if (endpoint.url.includes('/api/auth/resend-otp')) {
        defaultBody = JSON.stringify(
          {
            userId: 'user_id_here',
          },
          null,
          2
        );
      } else if (endpoint.url.includes('/api/auth/admin-register')) {
        defaultBody = JSON.stringify(
          {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
          },
          null,
          2
        );
      } else if (
        endpoint.url.includes('/api/products') &&
        endpoint.method === 'POST'
      ) {
        defaultBody = JSON.stringify(
          {
            name: 'New Food Item',
            description: 'Delicious food item description',
            price: 12.99,
            category: 'Main Course',
            image: 'https://example.com/image.jpg',
            ingredients: ['Ingredient 1', 'Ingredient 2'],
          },
          null,
          2
        );
      } else if (
        endpoint.url.includes('/api/products') &&
        endpoint.method === 'PUT'
      ) {
        defaultBody = JSON.stringify(
          {
            name: 'Updated Food Item',
            description: 'Updated description',
            price: 14.99,
            category: 'Main Course',
            image: 'https://example.com/image.jpg',
            ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
          },
          null,
          2
        );
      } else if (endpoint.url.includes('/api/upload/image')) {
        defaultBody =
          'Note: Image upload requires a FormData object with a file input.\nUse the actual form in the admin dashboard for image uploads.';
      } else if (
        endpoint.url.includes('/api/products/:id') &&
        endpoint.method === 'DELETE'
      ) {
        defaultBody =
          'No body required for DELETE request. Replace :id in the URL with an actual food item ID.';
      }
    }

    setApiRequest({
      url: processedUrl,
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
      body: defaultBody,
    });

    setApiResponse(null);
    setShowTester(true);
  };

  const handleApiTest = async () => {
    setIsTestLoading(true);
    setApiResponse(null);

    try {
      // Process URL to replace parameter placeholders with actual values
      let processedUrl = apiRequest.url;
      if (processedUrl.includes('[REPLACE_')) {
        processedUrl = processedUrl.replace(
          /\[REPLACE_([a-zA-Z0-9_]+)\]/g,
          (match, param) => {
            const value = prompt(`Enter value for parameter: ${param}`);
            return value || match; // Return the original placeholder if user cancels
          }
        );

        // If placeholders still exist, abort
        if (processedUrl.includes('[REPLACE_')) {
          throw new Error(
            'URL parameters must be replaced before sending the request'
          );
        }
      }

      const startTime = Date.now();

      // Prepare headers
      const headers: Record<string, string> = { ...apiRequest.headers };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Prepare request options
      const options: RequestInit = {
        method: apiRequest.method,
        headers,
        credentials: 'include',
      };

      // Add body for non-GET requests
      if (apiRequest.method !== 'GET' && apiRequest.body) {
        try {
          // Try to parse as JSON first
          const parsedBody = JSON.parse(apiRequest.body);
          options.body = JSON.stringify(parsedBody);
        } catch {
          // If not valid JSON, use as is
          options.body = apiRequest.body;
        }
      }

      // Use the processed URL for the actual request
      const response = await fetch(processedUrl, options);
      const endTime = Date.now();

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Try to parse response as JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        time: endTime - startTime,
      });
    } catch (error) {
      console.error('API test error:', error);
      setApiResponse({
        status: 0,
        statusText: 'Request Failed',
        headers: {},
        data: error instanceof Error ? error.message : 'Unknown error occurred',
        time: 0,
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleAddHeader = () => {
    setApiRequest({
      ...apiRequest,
      headers: {
        ...apiRequest.headers,
        '': '',
      },
    });
  };

  const handleUpdateHeader = (
    currentKey: string,
    newKey: string,
    value: string
  ) => {
    const updatedHeaders = { ...apiRequest.headers };
    if (currentKey !== newKey && currentKey in updatedHeaders) {
      delete updatedHeaders[currentKey];
    }
    updatedHeaders[newKey] = value;

    setApiRequest({
      ...apiRequest,
      headers: updatedHeaders,
    });
  };

  const handleRemoveHeader = (key: string) => {
    const updatedHeaders = { ...apiRequest.headers };
    delete updatedHeaders[key];

    setApiRequest({
      ...apiRequest,
      headers: updatedHeaders,
    });
  };

  return (
    <div className='py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-5xl mx-auto'>
        {showTester && selectedEndpoint ? (
          <div className='bg-white shadow rounded-lg mb-8'>
            <div className='px-4 py-5 sm:p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                  {getCategoryIcon(selectedEndpoint.category)}
                  Test: {selectedEndpoint.name}
                </h2>
                <button
                  onClick={() => setShowTester(false)}
                  className='p-1 rounded-full hover:bg-gray-100'
                >
                  <X className='w-5 h-5 text-gray-500' />
                </button>
              </div>

              <div className='space-y-6'>
                {/* Request URL and Method */}
                <div className='flex flex-col md:flex-row gap-4'>
                  <div className='w-full md:w-3/4'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Request URL
                    </label>
                    <input
                      type='text'
                      value={apiRequest.url}
                      onChange={(e) =>
                        setApiRequest({ ...apiRequest, url: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                    />
                  </div>
                  <div className='w-full md:w-1/4'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Method
                    </label>
                    <select
                      value={apiRequest.method}
                      onChange={(e) =>
                        setApiRequest({ ...apiRequest, method: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                    >
                      <option value='GET'>GET</option>
                      <option value='POST'>POST</option>
                      <option value='PUT'>PUT</option>
                      <option value='DELETE'>DELETE</option>
                      <option value='PATCH'>PATCH</option>
                    </select>
                  </div>
                </div>

                {/* Auth Token */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Auth Token (for protected endpoints)
                  </label>
                  <input
                    type='text'
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder='JWT token for Authorization header'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  />
                </div>

                {/* Headers */}
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Headers
                    </label>
                    <button
                      onClick={handleAddHeader}
                      type='button'
                      className='text-sm text-indigo-600 hover:text-indigo-500'
                    >
                      + Add Header
                    </button>
                  </div>
                  <div className='space-y-2'>
                    {Object.entries(apiRequest.headers).map(
                      ([key, value], index) => (
                        <div key={index} className='flex gap-2'>
                          <input
                            type='text'
                            value={key}
                            onChange={(e) =>
                              handleUpdateHeader(key, e.target.value, value)
                            }
                            placeholder='Header name'
                            className='w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                          />
                          <input
                            type='text'
                            value={value}
                            onChange={(e) =>
                              handleUpdateHeader(key, key, e.target.value)
                            }
                            placeholder='Header value'
                            className='w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                          />
                          <button
                            onClick={() => handleRemoveHeader(key)}
                            className='px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100'
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Request Body */}
                {apiRequest.method !== 'GET' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Request Body (JSON)
                    </label>
                    <textarea
                      value={apiRequest.body}
                      onChange={(e) =>
                        setApiRequest({ ...apiRequest, body: e.target.value })
                      }
                      rows={8}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm'
                      placeholder='{"key": "value"}'
                    ></textarea>
                  </div>
                )}

                {/* Send button */}
                <div>
                  <button
                    onClick={handleApiTest}
                    disabled={isTestLoading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isTestLoading
                        ? 'bg-indigo-400'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isTestLoading ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Play className='w-4 h-4 mr-2' />
                        Send Request
                      </>
                    )}
                  </button>
                </div>

                {/* Response */}
                {apiResponse && (
                  <div className='mt-8 border border-gray-200 rounded-md overflow-hidden'>
                    <div
                      className={`px-4 py-3 ${
                        apiResponse.status >= 200 && apiResponse.status < 300
                          ? 'bg-green-50 border-b border-green-100'
                          : apiResponse.status >= 400
                          ? 'bg-red-50 border-b border-red-100'
                          : 'bg-yellow-50 border-b border-yellow-100'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <span className='text-sm font-semibold mr-2'>
                            Status:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              apiResponse.status >= 200 &&
                              apiResponse.status < 300
                                ? 'bg-green-100 text-green-800'
                                : apiResponse.status >= 400
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {apiResponse.status} {apiResponse.statusText}
                          </span>
                        </div>
                        <div className='text-xs text-gray-500'>
                          Response time: {apiResponse.time}ms
                        </div>
                      </div>
                    </div>

                    <div className='p-4'>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Response Body
                      </h4>
                      <pre className='bg-gray-50 p-3 rounded-md overflow-auto max-h-96 text-sm'>
                        {typeof apiResponse.data === 'object' &&
                        apiResponse.data !== null
                          ? JSON.stringify(apiResponse.data, null, 2)
                          : String(apiResponse.data)}
                      </pre>
                    </div>

                    <div className='p-4 border-t border-gray-200'>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Response Headers
                      </h4>
                      <pre className='bg-gray-50 p-3 rounded-md overflow-auto max-h-60 text-sm'>
                        {JSON.stringify(apiResponse.headers, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className='bg-white shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-semibold text-gray-900'>
                API Health Dashboard
              </h1>
              <button
                onClick={checkAllEndpoints}
                disabled={isRefreshing}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isRefreshing
                    ? 'bg-indigo-400'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className='w-4 h-4 mr-2' />
                    Refresh Status
                  </>
                )}
              </button>
            </div>

            <div className='mb-6'>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeCategory === 'all'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveCategory('general')}
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                    activeCategory === 'general'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <AlertCircle className='w-3 h-3 mr-1' /> General
                </button>
                <button
                  onClick={() => setActiveCategory('auth')}
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                    activeCategory === 'auth'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ShieldCheck className='w-3 h-3 mr-1' /> Authentication
                </button>
                <button
                  onClick={() => setActiveCategory('user')}
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                    activeCategory === 'user'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className='w-3 h-3 mr-1' /> Users
                </button>
                <button
                  onClick={() => setActiveCategory('food')}
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                    activeCategory === 'food'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Utensils className='w-3 h-3 mr-1' /> Food
                </button>
                <button
                  onClick={() => setActiveCategory('upload')}
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                    activeCategory === 'upload'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ImageIcon className='w-3 h-3 mr-1' /> Upload
                </button>
              </div>
            </div>

            <div className='divide-y divide-gray-200'>
              {filteredEndpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className='py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'
                >
                  <div className='flex-1'>
                    <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2'>
                      {getCategoryIcon(endpoint.category)}
                      {endpoint.name}
                    </h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      {endpoint.description}
                    </p>
                    <div className='flex items-center flex-wrap gap-2 mt-2'>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMethodColor(
                          endpoint.method
                        )}`}
                      >
                        {endpoint.method}
                      </span>
                      <code className='text-xs bg-gray-100 p-1 rounded'>
                        {endpoint.url}
                      </code>
                      {endpoint.lastChecked && (
                        <span className='text-xs text-gray-400'>
                          Last checked:{' '}
                          {endpoint.lastChecked.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    {endpoint.status === 'loading' ? (
                      <div className='flex items-center'>
                        <Loader2 className='w-5 h-5 text-indigo-500 animate-spin' />
                        <span className='ml-2 text-sm font-medium text-gray-500'>
                          Checking...
                        </span>
                      </div>
                    ) : endpoint.status === 'success' ? (
                      <div className='flex items-center'>
                        <CheckCircle className='w-5 h-5 text-green-500' />
                        <span className='ml-2 text-sm font-medium text-green-700'>
                          Available
                          {endpoint.responseTime && (
                            <span className='ml-1 text-xs text-gray-500'>
                              ({endpoint.responseTime}ms)
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className='flex items-center'>
                        <XCircle className='w-5 h-5 text-red-500' />
                        <span className='ml-2 text-sm font-medium text-red-700'>
                          Unavailable
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => handleSelectEndpoint(endpoint)}
                      className='ml-4 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                      <Code className='w-4 h-4 mr-2' />
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
