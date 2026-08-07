/**
 * API Service for making requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Make a request to the API
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options (method, headers, body)
 * @returns {Promise<any>} - The response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${
    endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }`;

  // Default options
  const defaultOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Important: Don't use credentials: 'include' with different domains
    // as it requires very specific CORS settings
    mode: 'cors',
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  // Add body for non-GET requests
  if (options.body && defaultOptions.method !== 'GET') {
    // Check if body is FormData - if so, use it directly without JSON.stringify
    if (options.body instanceof FormData) {
      defaultOptions.body = options.body;
      // Remove Content-Type header for FormData to let browser set it with boundary
      delete defaultOptions.headers['Content-Type'];
    } else {
      defaultOptions.body =
        typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(url, defaultOptions);

    // Handle 401 Unauthorized by redirecting to login
    if (response.status === 401 && !options.skipAuthRedirect) {
      // Clear token and user from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw new Error('Authentication failed. Please log in again.');
    }

    // Parse the response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle special cases for non-200 responses
    if (!response.ok) {
      // For 403 responses that might contain verification data, include the full response
      if (response.status === 403 && data && typeof data === 'object') {
        // If it's a verification-required response, throw an error with the full data
        if (data.requiresVerification) {
          const error = new Error(data.message || 'Verification required');
          error.data = data; // Attach the full response data
          error.status = response.status;
          throw error;
        }
      }

      // For 409 responses (conflicts), include the full response data
      if (response.status === 409 && data && typeof data === 'object') {
        const error = new Error(data.message || 'Conflict');
        error.data = data; // Attach the full response data including conflicts
        error.status = response.status;
        throw error;
      }

      // For other errors, create error with status and data
      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

/**
 * Convenience methods for common API operations
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'POST', body: data }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body: data }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),

  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body: data }),

  upload: async (endpoint, formData, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return apiRequest(endpoint, {
      ...options,
      method: options.method || 'POST',
      headers,
      body: formData, // Don't JSON.stringify FormData
    });
  },

  // Address API functions
  addresses: {
    getAll: () => api.get('api/users/me/addresses'),
    getById: (id) => api.get(`api/users/me/addresses/${id}`),
    create: (addressData) => api.post('api/users/me/addresses', addressData),
    update: (id, addressData) =>
      api.put(`api/users/me/addresses/${id}`, addressData),
    delete: (id) => api.delete(`api/users/me/addresses/${id}`),
    setDefault: (id) => api.patch(`api/users/me/addresses/${id}/default`),
  },

  // User profile functions
  user: {
    getProfile: () => api.get('api/users/me'),
    updateProfile: (userData) => api.put('api/users/me', userData),
  },

  // Coupon management functions
};

export default api;
