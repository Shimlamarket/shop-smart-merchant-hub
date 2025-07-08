
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/merchantApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [merchant, setMerchant] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔄 Checking authentication status...');
    
    const token = sessionStorage.getItem('merchant_token') || localStorage.getItem('merchant_token');
    const merchantData = sessionStorage.getItem('merchant_data') || localStorage.getItem('merchant_data');
    
    if (token && merchantData) {
      try {
        const parsedMerchant = JSON.parse(merchantData);
        console.log('✅ Found stored auth data:', parsedMerchant);
        setMerchant(parsedMerchant);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Error parsing stored merchant data:', error);
        clearAuthData();
      }
    } else {
      console.log('ℹ️ No stored auth data found');
    }
    
    setLoading(false);
  };

  const login = async (accessToken) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Attempting login with Google token...');
      
      // Call the REAL FastAPI authentication endpoint
      const response = await authApi.googleAuth(accessToken);
      const { token, merchant: merchantData } = response;
      
      console.log('✅ Login successful:', merchantData);
      
      // Store auth data
      sessionStorage.setItem('merchant_token', token);
      sessionStorage.setItem('merchant_data', JSON.stringify(merchantData));
      
      setMerchant(merchantData);
      setIsAuthenticated(true);
      
      return merchantData;
    } catch (err) {
      console.error('❌ Login failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      
      // NO FALLBACK TO MOCK DATA - Only real API authentication
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Logging out...');
      await authApi.logout();
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API call failed:', error);
      // Continue with logout even if API fails
    }
    
    clearAuthData();
    setLoading(false);
  };

  const clearAuthData = () => {
    console.log('🧹 Clearing auth data...');
    sessionStorage.removeItem('merchant_token');
    sessionStorage.removeItem('merchant_data');
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_data');
    setMerchant(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateMerchant = (updatedMerchant) => {
    console.log('🔄 Updating merchant data...', updatedMerchant);
    setMerchant(updatedMerchant);
    sessionStorage.setItem('merchant_data', JSON.stringify(updatedMerchant));
  };

  const value = {
    merchant,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateMerchant,
    setMerchant
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
