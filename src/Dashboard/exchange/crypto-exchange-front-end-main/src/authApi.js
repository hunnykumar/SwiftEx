import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from './api';

// Function to get device token from AsyncStorage
const getDeviceToken = async () => {
  try {
    const token = await getToken();
    return token || null;
  } catch (error) {
    console.log('Error getting device token:', error);
    return null;
  }
};

// Function to get user auth token from AsyncStorage
const getUserToken = async () => {
  try {
    const token = await AsyncStorage.getItem("UserAuthID");
    return token || null;
  } catch (error) {
    console.log('Error getting user token:', error);
    return null;
  }
};

// Main API utility function with dual authentication
const makeAuthenticatedRequest = async (options) => {
  const {
    url,
    method = 'POST',
    body = null,
    headers = {},
    timeout = 15000,
    requireUserAuth = true // Flag to control if user auth is required
  } = options;

  try {
    // Get both tokens from AsyncStorage
    const deviceToken = await getDeviceToken();
    const userToken = await getUserToken();
    
    // Check if device token exists
    if (!deviceToken) {
      return {
        success: false,
        error: 'Device authentication token not found',
        status: null
      };
    }

    // Check if user token exists (when required)
    if (requireUserAuth && !userToken) {
      return {
        success: false,
        error: 'User authentication token not found',
        status: null
      };
    }

    // Prepare headers
    const requestHeaders = {
      'x-auth-device-token': deviceToken,
      'Content-Type': 'application/json',
      ...headers
    };

    // Add Authorization header if user token exists
    if (userToken) {
      requestHeaders['Authorization'] = `Bearer ${userToken}`;
    }

    // Prepare request options
    const requestOptions = {
      method: method.toUpperCase(),
      url: url,
      timeout: timeout,
      headers: requestHeaders,
      validateStatus: function (status) {
        return status >= 200 && status < 600;
      }
    };

    // Add body for requests that support it
    const methodsWithBody = ['POST', 'PUT', 'PATCH'];
    if (methodsWithBody.includes(method.toUpperCase()) && body !== null) {
      if (typeof body === 'string') {
        requestOptions.data = body;
      } else {
        requestOptions.data = JSON.stringify(body);
      }
    }

    // Make API request
    const response = await axios(requestOptions);
    
    // Handle success responses (200, 201)
    if (response.status === 200 || response.status === 201) {
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } else {
      // Handle other status codes as errors
      return {
        success: false,
        error: response.data?.message || response.data?.error || `Request failed with status ${response.status}`,
        status: response.status,
        data: response.data
      };
    }

  } catch (error) {
    console.log('Authenticated API Request Error:', error);
    
    // Handle specific axios errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timeout',
        status: null
      };
    }
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: 'Network error - please check your connection',
        status: null
      };
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        error: 'Authentication failed - please login again',
        status: 401
      };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      status: error.response?.status || null
    };
  }
};

// Authenticated API methods
const authApi = {
  // GET request with dual auth
  get: async (url, customHeaders = {}, requireUserAuth = true) => {
    return await makeAuthenticatedRequest({
      url,
      method: 'GET',
      headers: customHeaders,
      requireUserAuth
    });
  },
  
  // POST request with dual auth
  post: async (url, body = null, customHeaders = {}, requireUserAuth = true) => {
    return await makeAuthenticatedRequest({
      url,
      method: 'POST',
      body,
      headers: customHeaders,
      requireUserAuth
    });
  },
  
  // PUT request with dual auth
  put: async (url, body = null, customHeaders = {}, requireUserAuth = true) => {
    return await makeAuthenticatedRequest({
      url,
      method: 'PUT',
      body,
      headers: customHeaders,
      requireUserAuth
    });
  },
  
  // PATCH request with dual auth
  patch: async (url, body = null, customHeaders = {}, requireUserAuth = true) => {
    return await makeAuthenticatedRequest({
      url,
      method: 'PATCH',
      body,
      headers: customHeaders,
      requireUserAuth
    });
  },
  
  // DELETE request with dual auth
  delete: async (url, customHeaders = {}, requireUserAuth = true) => {
    return await makeAuthenticatedRequest({
      url,
      method: 'DELETE',
      headers: customHeaders,
      requireUserAuth
    });
  },

  // Device-only authenticated requests (without user token requirement)
  deviceOnly: {
    get: async (url, customHeaders = {}) => {
      return await makeAuthenticatedRequest({
        url,
        method: 'GET',
        headers: customHeaders,
        requireUserAuth: false
      });
    },

    post: async (url, body = null, customHeaders = {}) => {
      return await makeAuthenticatedRequest({
        url,
        method: 'POST',
        body,
        headers: customHeaders,
        requireUserAuth: false
      });
    }
  }
};

// Utility functions to set tokens
const setTokens = {
  setDeviceToken: async (token) => {
    try {
      await AsyncStorage.setItem('deviceToken', token);
      return true;
    } catch (error) {
      console.log('Error setting device token:', error);
      return false;
    }
  },

  setUserToken: async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      return true;
    } catch (error) {
      console.log('Error setting user token:', error);
      return false;
    }
  },

  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove(['deviceToken', 'userToken']);
      return true;
    } catch (error) {
      console.log('Error clearing tokens:', error);
      return false;
    }
  }
};

export { authApi as default, setTokens };

// Usage Examples:
/*
import authApi, { setTokens } from './authApiUtil';

// Set tokens first (usually after login)
const setupTokens = async () => {
  await setTokens.setDeviceToken('your-device-token');
  await setTokens.setUserToken('your-user-token');
};

// POST request with dual authentication
const createPost = async () => {
  const body = {
    title: 'New Post',
    content: 'This is a new post',
    userId: 123
  };
  
  const result = await authApi.post('https://api.example.com/posts', body);
  
  if (result.success) {
    console.log('Post created:', result.data);
  } else {
    console.log('Error:', result.error);
    if (result.status === 401) {
      // Handle authentication error
      console.log('Please login again');
    }
  }
};

// GET request with dual auth
const fetchUserData = async () => {
  const result = await authApi.get('https://api.example.com/user/profile');
  
  if (result.success) {
    console.log('User data:', result.data);
  } else {
    console.log('Failed to fetch:', result.error);
  }
};

// Device-only authentication (without user token)
const getAppConfig = async () => {
  const result = await authApi.deviceOnly.get('https://api.example.com/config');
  
  if (result.success) {
    console.log('App config:', result.data);
  } else {
    console.log('Error:', result.error);
  }
};

// POST with empty body (as in your example)
const emptyPostRequest = async () => {
  const result = await authApi.post('https://api.example.com/endpoint', '');
  
  if (result.success) {
    console.log('Success:', result.data);
  } else {
    console.log('Error:', result.error);
  }
};

// Custom headers example
const customRequest = async () => {
  const customHeaders = {
    'Custom-Header': 'custom-value',
    'Another-Header': 'another-value'
  };
  
  const result = await authApi.post(
    'https://api.example.com/custom',
    { data: 'test' },
    customHeaders
  );
  
  if (result.success) {
    console.log('Custom request success:', result.data);
  } else {
    console.log('Custom request failed:', result.error);
  }
};

// Clear tokens on logout
const logout = async () => {
  const cleared = await setTokens.clearTokens();
  if (cleared) {
    console.log('Tokens cleared successfully');
  }
};
*/