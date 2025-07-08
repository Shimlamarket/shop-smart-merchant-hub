// API Service for FastAPI Backend Integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  console.log(authToken)
  localStorage.setItem('auth_token', token);
  console.log(getAuthToken())
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
    console.log('🔑 getAuthToken: Retrieved from localStorage:', authToken);
  } else {
    console.log('🔑 getAuthToken: Using cached token:', authToken);
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

// Types matching FastAPI backend
export interface Product {
  product_id: string;
  merchant_id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand: string;
  description: string;
  variants: ProductVariant[];
  offers: string[]; // Array of offer IDs
  images: string[];
  weight?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  mrp: number;
  selling_price: number;
  stock_quantity: number;
  sku: string;
}

export interface Offer {
  offer_id: string;
  merchant_id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'custom';
  discount_value: number;
  level: 'product' | 'merchant';
  valid_from: string;
  valid_till: string;
  is_active: boolean;
  product_ids: string[];
  usage_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  merchant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  order_time: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

export interface User {
  user_id: string;
  business_name: string;
  business_type: string;
  email: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  subscription_plan: string;
  shop_status: {
    is_open: boolean;
    accepting_orders: boolean;
    reason?: string;
  };
  is_active: boolean;
  created_at: string;
}

export interface DashboardAnalytics {
  orders_today: number;
  revenue_today: number;
  active_offers: number;
  low_stock_products: number;
  total_products: number;
  pending_orders: number;
  top_products: Product[];
  recent_orders: Order[];
}

export interface Review {
  review_id: string;
  customer_id: string;
  product_id?: string;
  shop_id?: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
}

// Response interfaces for API endpoints
export interface ProductsResponse {
  products: Product[];
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🔗 API Request URL:', url);
    const token = getAuthToken();
    console.log('🔑 Retrieved token:', token);
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    console.log('📋 Request headers:', headers);
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Authentication failed - clearing token');
        clearAuthToken();
        throw new Error('Authentication failed. Please login again.');
      }
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, response.statusText, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ API Response:', result);
    return result;
  }

  // Authentication
  async authenticateWithGoogle(accessToken: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardAnalytics> {
    return this.request<DashboardAnalytics>('/dashboard');
  }

  // Product Management
  async getProducts(shopId: string): Promise<Product[]> {
    const response = await this.request<ProductsResponse>(`/shops/${shopId}/products`);
    return response.products || [];
  }

  async getProduct(shopId: string, productId: string): Promise<Product> {
    return this.request<Product>(`/shops/${shopId}/products/${productId}`);
  }

  async createProduct(productData: {
    name: string;
    category: string;
    subcategory?: string;
    brand: string;
    description: string;
    variants: ProductVariant[];
    images?: string[];
    weight?: number;
  }): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Order Management
  async getOrders(status?: string): Promise<Order[]> {
    const params = status ? `?status=${status}` : '';
    return this.request<Order[]>(`/orders${params}`);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Offer Management
  async getOffers(): Promise<Offer[]> {
    return this.request<Offer[]>('/offers');
  }

  async createOffer(offerData: {
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'bogo' | 'custom';
    discount_value: number;
    level: 'product' | 'merchant';
    valid_from: string;
    valid_till: string;
    product_ids: string[];
  }): Promise<Offer> {
    return this.request<Offer>('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async updateOffer(offerId: string, offerData: Partial<Offer>): Promise<Offer> {
    return this.request<Offer>(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  }

  async deleteOffer(offerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/offers/${offerId}`, {
      method: 'DELETE',
    });
  }

  // Product-specific offers
  async createProductOffer(productId: string, offerData: {
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'bogo' | 'custom';
    discount_value: number;
    valid_from: string;
    valid_till: string;
  }): Promise<Offer> {
    return this.request<Offer>(`/products/${productId}/offers`, {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async updateProductOffer(productId: string, offerId: string, offerData: Partial<Offer>): Promise<Offer> {
    return this.request<Offer>(`/products/${productId}/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  }

  async deleteProductOffer(productId: string, offerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${productId}/offers/${offerId}`, {
      method: 'DELETE',
    });
  }

  // Shop-specific offers
  async createShopOffer(shopId: string, offerData: {
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'bogo' | 'custom';
    discount_value: number;
    valid_from: string;
    valid_till: string;
  }): Promise<Offer> {
    return this.request<Offer>(`/shops/${shopId}/offers`, {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async updateShopOffer(shopId: string, offerId: string, offerData: Partial<Offer>): Promise<Offer> {
    return this.request<Offer>(`/shops/${shopId}/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  }

  async deleteShopOffer(shopId: string, offerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/shops/${shopId}/offers/${offerId}`, {
      method: 'DELETE',
    });
  }

  // Reviews
  async getReviews(productId?: string, shopId?: string): Promise<Review[]> {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId);
    if (shopId) params.append('shop_id', shopId);
    
    const queryString = params.toString();
    return this.request<Review[]>(`/reviews${queryString ? `?${queryString}` : ''}`);
  }

  async createReview(reviewData: {
    product_id?: string;
    shop_id?: string;
    order_id?: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Merchant Profile
  async getMerchantProfile(): Promise<User> {
    return this.request<User>('/merchants/profile');
  }

  async updateMerchantProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>('/merchants/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

export const apiService = new ApiService();
