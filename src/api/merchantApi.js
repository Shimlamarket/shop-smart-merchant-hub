
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8002',  // Merchant API server
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token'); // Use same token key as AuthProvider
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔗 API Call: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.response?.data);
    
    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error: Unable to connect to FastAPI server');
      return Promise.reject(new Error('Network Error: Unable to connect to FastAPI server. Make sure the server is running at http://localhost:8001'));
    }
    
    // Handle HTTP errors
    if (error.response?.status === 401) {
      console.error('❌ Authentication Error: Invalid token');
      localStorage.removeItem('auth_token'); // Use same token key as AuthProvider
      // Don't reload automatically, let the auth context handle it
    }
    
    return Promise.reject(error);
  }
);

// Get current merchant ID from stored data
const getCurrentMerchantId = () => {
  const merchantData = sessionStorage.getItem('merchant_data') || localStorage.getItem('merchant_data');
  if (merchantData) {
    try {
      const parsed = JSON.parse(merchantData);
      return parsed.merchant_id || 'merchant123';
    } catch (error) {
      console.error('Error parsing merchant data:', error);
    }
  }
  return 'merchant123';
};

// ============ AUTHENTICATION API ============
export const authApi = {
  async googleAuth(accessToken) {
    const response = await api.post('/auth/google', {
      access_token: accessToken
    });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// ============ DASHBOARD API ============
export const dashboardApi = {
  async getDashboard() {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

// ============ MERCHANT PROFILE API ============
export const merchantApi = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateMetadata(metadata) {
    const merchantId = getCurrentMerchantId();
    const response = await api.put(`/merchants/${merchantId}/metadata`, metadata);
    return response.data;
  },

  async getShopStatus() {
    const merchantId = getCurrentMerchantId();
    const response = await api.get(`/merchants/${merchantId}/shop-status`);
    return response.data;
  },

  async updateShopStatus(statusData) {
    const merchantId = getCurrentMerchantId();
    const response = await api.put(`/merchants/${merchantId}/shop-status`, statusData);
    return response.data;
  }
};

// ============ ITEMS/PRODUCTS API ============
export const itemsApi = {
  async fetchItems(filters = {}) {
    const merchantId = getCurrentMerchantId();
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `/merchants/${merchantId}/items${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  async createItem(itemData) {
    const merchantId = getCurrentMerchantId();
    const response = await api.post(`/merchants/${merchantId}/items`, itemData);
    return response.data;
  },

  async updateItem(itemId, itemData) {
    const merchantId = getCurrentMerchantId();
    const response = await api.put(`/merchants/${merchantId}/items/${itemId}`, itemData);
    return response.data;
  },

  async deleteItem(itemId) {
    const merchantId = getCurrentMerchantId();
    const response = await api.delete(`/merchants/${merchantId}/items/${itemId}`);
    return response.data;
  },

  async applyOffer(itemId, offerId) {
    const merchantId = getCurrentMerchantId();
    const response = await api.post(`/merchants/${merchantId}/items/${itemId}/apply-offer`, {
      offer_id: offerId
    });
    return response.data;
  }
};

// ============ ORDERS API ============
export const ordersApi = {
  async fetchOrders(filters = {}) {
    const merchantId = getCurrentMerchantId();
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    
    const queryString = params.toString();
    const url = `/merchants/${merchantId}/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  async acceptOrder(orderId, acceptanceData = {}) {
    const merchantId = getCurrentMerchantId();
    const response = await api.post(`/merchants/${merchantId}/orders/${orderId}/accept`, acceptanceData);
    return response.data;
  },

  async declineOrder(orderId, declineData = {}) {
    const merchantId = getCurrentMerchantId();
    const response = await api.post(`/merchants/${merchantId}/orders/${orderId}/decline`, declineData);
    return response.data;
  },

  async updateOrderStatus(orderId, status, additionalData = {}) {
    const merchantId = getCurrentMerchantId();
    const response = await api.put(`/merchants/${merchantId}/orders/${orderId}/status`, {
      status,
      ...additionalData
    });
    return response.data;
  }
};

// ============ OFFERS API ============
export const offersApi = {
  async fetchOffers() {
    const merchantId = getCurrentMerchantId();
    const response = await api.get(`/merchants/${merchantId}/offers`);
    return response.data;
  },

  async createOffer(offerData) {
    const merchantId = getCurrentMerchantId();
    const response = await api.post(`/merchants/${merchantId}/offers`, offerData);
    return response.data;
  },

  async deleteOffer(offerId) {
    const merchantId = getCurrentMerchantId();
    const response = await api.delete(`/merchants/${merchantId}/offers/${offerId}`);
    return response.data;
  },

  async applyGlobalDiscount(discountData) {
    const merchantId = getCurrentMerchantId();
    const response = await api.post(`/merchants/${merchantId}/apply-overall-discount`, discountData);
    return response.data;
  }
};
