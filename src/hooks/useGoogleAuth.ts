import { useState, useCallback } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const initializeGoogleAuth = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Auth'));
      document.head.appendChild(script);
    });
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    
    try {
      await initializeGoogleAuth();
      
      return new Promise((resolve, reject) => {
        window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "687991270323-2mt9l61alcrjp4nna7gr3ad7av89cpei.apps.googleusercontent.com",
          scope: 'email profile',
          callback: (response: any) => {
            if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('No access token received'));
            }
          },
          error_callback: (error: any) => {
            reject(new Error(error.error || 'Google Auth failed'));
          }
        }).requestAccessToken();
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [initializeGoogleAuth]);

  return { signInWithGoogle, isLoading };
};