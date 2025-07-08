
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, merchantApi, itemsApi, ordersApi, offersApi } from '../api/merchantApi';

// ============ DASHBOARD HOOK - FIXED ============
export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    console.log('🔄 useDashboard: Starting fetch...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 useDashboard: Calling dashboardApi.getDashboard()...');
      const result = await dashboardApi.getDashboard();
      console.log('✅ useDashboard: API call successful, data received:', result);
      
      // Validate the response
      if (result && typeof result === 'object') {
        setData(result);
        console.log('✅ useDashboard: Data set in state');
      } else {
        throw new Error('Invalid response format from dashboard API');
      }
    } catch (err) {
      console.error('❌ useDashboard: Error occurred:', err);
      
      let errorMessage = 'Failed to load dashboard';
      
      if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to FastAPI server. Please check if the server is running at http://localhost:8001';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setData(null); // Clear any previous data
    } finally {
      setLoading(false);
      console.log('🔄 useDashboard: Fetch completed');
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useDashboard: useEffect triggered, calling fetchDashboard...');
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
};

// ============ ITEMS HOOK - FIXED ============
export const useItems = (filters = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    console.log('🔄 useItems: Starting fetch with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 useItems: Calling itemsApi.fetchItems()...');
      const result = await itemsApi.fetchItems(filters);
      console.log('✅ useItems: API call successful, data received:', result);
      
      // Validate the response
      if (Array.isArray(result)) {
        setItems(result);
        console.log('✅ useItems: Items set in state, count:', result.length);
      } else {
        console.warn('⚠️ useItems: Expected array but got:', typeof result);
        setItems([]);
      }
    } catch (err) {
      console.error('❌ useItems: Error occurred:', err);
      
      let errorMessage = 'Failed to load items';
      
      if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to FastAPI server';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setItems([]); // Clear items on error
    } finally {
      setLoading(false);
      console.log('🔄 useItems: Fetch completed');
    }
  }, [JSON.stringify(filters)]);

  const createItem = useCallback(async (itemData) => {
    console.log('🔄 useItems: Creating item:', itemData);
    setError(null);
    
    try {
      const newItem = await itemsApi.createItem(itemData);
      console.log('✅ useItems: Item created:', newItem);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('❌ useItems: Create failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateItem = useCallback(async (itemId, itemData) => {
    console.log('🔄 useItems: Updating item:', itemId, itemData);
    setError(null);
    
    try {
      const updatedItem = await itemsApi.updateItem(itemId, itemData);
      console.log('✅ useItems: Item updated:', updatedItem);
      setItems(prev => prev.map(item => item.item_id === itemId ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      console.error('❌ useItems: Update failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteItem = useCallback(async (itemId) => {
    console.log('🔄 useItems: Deleting item:', itemId);
    setError(null);
    
    try {
      await itemsApi.deleteItem(itemId);
      console.log('✅ useItems: Item deleted:', itemId);
      setItems(prev => prev.filter(item => item.item_id !== itemId));
    } catch (err) {
      console.error('❌ useItems: Delete failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useItems: useEffect triggered, calling fetchItems...');
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems
  };
};

// ============ ORDERS HOOK - FIXED ============
export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    console.log('🔄 useOrders: Starting fetch with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 useOrders: Calling ordersApi.fetchOrders()...');
      const result = await ordersApi.fetchOrders(filters);
      console.log('✅ useOrders: API call successful, data received:', result);
      
      // Validate the response
      if (Array.isArray(result)) {
        setOrders(result);
        console.log('✅ useOrders: Orders set in state, count:', result.length);
      } else {
        console.warn('⚠️ useOrders: Expected array but got:', typeof result);
        setOrders([]);
      }
    } catch (err) {
      console.error('❌ useOrders: Error occurred:', err);
      
      let errorMessage = 'Failed to load orders';
      
      if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to FastAPI server';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setOrders([]); // Clear orders on error
    } finally {
      setLoading(false);
      console.log('🔄 useOrders: Fetch completed');
    }
  }, [JSON.stringify(filters)]);

  const acceptOrder = useCallback(async (orderId, acceptanceData = {}) => {
    console.log('🔄 useOrders: Accepting order:', orderId);
    setError(null);
    
    try {
      const updatedOrder = await ordersApi.acceptOrder(orderId, acceptanceData);
      console.log('✅ useOrders: Order accepted:', updatedOrder);
      setOrders(prev => prev.map(order => order.order_id === orderId ? updatedOrder : order));
      return updatedOrder;
    } catch (err) {
      console.error('❌ useOrders: Accept failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to accept order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const declineOrder = useCallback(async (orderId, declineData = {}) => {
    console.log('🔄 useOrders: Declining order:', orderId);
    setError(null);
    
    try {
      const updatedOrder = await ordersApi.declineOrder(orderId, declineData);
      console.log('✅ useOrders: Order declined:', updatedOrder);
      setOrders(prev => prev.map(order => order.order_id === orderId ? updatedOrder : order));
      return updatedOrder;
    } catch (err) {
      console.error('❌ useOrders: Decline failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to decline order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status, additionalData = {}) => {
    console.log('🔄 useOrders: Updating order status:', orderId, status);
    setError(null);
    
    try {
      const updatedOrder = await ordersApi.updateOrderStatus(orderId, status, additionalData);
      console.log('✅ useOrders: Order status updated:', updatedOrder);
      setOrders(prev => prev.map(order => order.order_id === orderId ? updatedOrder : order));
      return updatedOrder;
    } catch (err) {
      console.error('❌ useOrders: Status update failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useOrders: useEffect triggered, calling fetchOrders...');
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    acceptOrder,
    declineOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};

// ============ OFFERS HOOK - FIXED ============
export const useOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOffers = useCallback(async () => {
    console.log('🔄 useOffers: Starting fetch...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 useOffers: Calling offersApi.fetchOffers()...');
      const result = await offersApi.fetchOffers();
      console.log('✅ useOffers: API call successful, data received:', result);
      
      // Validate the response
      if (Array.isArray(result)) {
        setOffers(result);
        console.log('✅ useOffers: Offers set in state, count:', result.length);
      } else {
        console.warn('⚠️ useOffers: Expected array but got:', typeof result);
        setOffers([]);
      }
    } catch (err) {
      console.error('❌ useOffers: Error occurred:', err);
      
      let errorMessage = 'Failed to load offers';
      
      if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to FastAPI server';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setOffers([]); // Clear offers on error
    } finally {
      setLoading(false);
      console.log('🔄 useOffers: Fetch completed');
    }
  }, []);

  const createOffer = useCallback(async (offerData) => {
    console.log('🔄 useOffers: Creating offer:', offerData);
    setError(null);
    
    try {
      const newOffer = await offersApi.createOffer(offerData);
      console.log('✅ useOffers: Offer created:', newOffer);
      setOffers(prev => [newOffer, ...prev]);
      return newOffer;
    } catch (err) {
      console.error('❌ useOffers: Create failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create offer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteOffer = useCallback(async (offerId) => {
    console.log('🔄 useOffers: Deleting offer:', offerId);
    setError(null);
    
    try {
      await offersApi.deleteOffer(offerId);
      console.log('✅ useOffers: Offer deleted:', offerId);
      setOffers(prev => prev.filter(offer => offer.offer_id !== offerId));
    } catch (err) {
      console.error('❌ useOffers: Delete failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete offer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const applyGlobalDiscount = useCallback(async (discountData) => {
    console.log('🔄 useOffers: Applying global discount:', discountData);
    setError(null);
    
    try {
      const result = await offersApi.applyGlobalDiscount(discountData);
      console.log('✅ useOffers: Global discount applied:', result);
      return result;
    } catch (err) {
      console.error('❌ useOffers: Global discount failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to apply global discount';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useOffers: useEffect triggered, calling fetchOffers...');
    fetchOffers();
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    createOffer,
    deleteOffer,
    applyGlobalDiscount,
    refetch: fetchOffers
  };
};

// ============ MERCHANT PROFILE HOOK - FIXED ============
export const useMerchantProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    console.log('🔄 useMerchantProfile: Starting fetch...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 useMerchantProfile: Calling merchantApi.getProfile()...');
      const result = await merchantApi.getProfile();
      console.log('✅ useMerchantProfile: API call successful, data received:', result);
      
      // Validate the response
      if (result && typeof result === 'object') {
        setProfile(result);
        console.log('✅ useMerchantProfile: Profile set in state');
      } else {
        throw new Error('Invalid response format from profile API');
      }
    } catch (err) {
      console.error('❌ useMerchantProfile: Error occurred:', err);
      
      let errorMessage = 'Failed to load profile';
      
      if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to FastAPI server';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setProfile(null); // Clear profile on error
    } finally {
      setLoading(false);
      console.log('🔄 useMerchantProfile: Fetch completed');
    }
  }, []);

  const updateMetadata = useCallback(async (metadata) => {
    console.log('🔄 useMerchantProfile: Updating metadata:', metadata);
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await merchantApi.updateMetadata(metadata);
      console.log('✅ useMerchantProfile: Profile updated:', updatedProfile);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('❌ useMerchantProfile: Update failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useMerchantProfile: useEffect triggered, calling fetchProfile...');
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, updateMetadata, refetch: fetchProfile };
};