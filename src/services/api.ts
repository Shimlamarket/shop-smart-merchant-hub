
const API_BASE_URL = 'http://localhost:8080';

// Types based on the API documentation
export interface Product {
  product_id: string;
  merchant_id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand: string;
  description: string;
  variants: ProductVariant[];
  offers: Offer[];
  images: string[];
  weight?: number;
  is_active: boolean;
  created_at: string;
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
  merchant_id?: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'custom';
  discount_value: number;
  level?: string;
  valid_from: string;
  valid_till: string;
  is_active: boolean;
  product_ids?: string[];
  customType?: string;
}

export interface Order {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'accepted' | 'declined' | 'in-delivery' | 'delivered';
  order_time: string;
  estimated_delivery?: string;
  offer_expiry?: string;
  time_remaining?: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  customization?: string;
}

export interface MerchantProfile {
  merchant_id: string;
  name: string;
  email: string;
  phone: string;
  store_name: string;
  store_address: string;
  store_description: string;
  operating_hours: string;
  profile_image: string;
  store_image: string;
  joined_date: string;
  total_products: number;
  total_orders: number;
  rating: number;
  longitude?: number;
  latitude?: number;
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

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth header when needed
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Product Management
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
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

  async getProduct(productId: string): Promise<Product> {
    return this.request<Product>(`/products/${productId}`);
  }

  // Offer Management
  async getOffers(): Promise<Offer[]> {
    return this.request<Offer[]>('/offers');
  }

  async createProductOffer(productId: string, offerData: Partial<Offer>): Promise<Offer> {
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

  async createShopOffer(shopId: string, offerData: Partial<Offer>): Promise<Offer> {
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

  // Order Management
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Merchant Profile
  async getMerchantProfile(): Promise<MerchantProfile> {
    return this.request<MerchantProfile>('/merchants/profile');
  }

  async updateMerchantProfile(profileData: Partial<MerchantProfile>): Promise<MerchantProfile> {
    return this.request<MerchantProfile>('/merchants/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Dashboard Analytics
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return this.request<DashboardAnalytics>('/dashboard');
  }
}

export const apiService = new ApiService();
