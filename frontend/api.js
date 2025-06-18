// src/utils/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://eteeapbackend-production.up.railway.app";


// Request interceptor
const beforeRequest = (config) => {
  // Add auth token if exists
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
};

// Response interceptor
const afterResponse = async (response) => {
  if (!response.ok) {
    const error = new Error('API request failed');
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch {
      error.data = await response.text();
    }
    throw error;
  }
  return response.json();
};

// Core fetch wrapper
const apiClient = async (endpoint, options = {}) => {
  try {
    const config = beforeRequest({
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, config);
    
    return await afterResponse(response);
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    
    // Enhanced error handling
    if (error.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      window.location.href = '/login';
    }
    
    throw {
      message: error.message || 'Network error',
      status: error.status || 500,
      data: error.data || null
    };
  }
};

// HTTP method shortcuts
const get = (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' });
const post = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
const put = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
const del = (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' });
const patch = (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });

export default {
  get,
  post,
  put,
  delete: del,
  patch,
  raw: apiClient // For custom requests
};
