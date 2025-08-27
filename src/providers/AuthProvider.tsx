'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setShopifyConfig } from '@/utils/shopify';
import { sessionStorage } from '@/utils/sessionStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  shop: string | null;
  login: (shopDomain: string, accessToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // Check if there's a shop parameter in the URL (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const shopParam = urlParams.get('shop');

      if (shopParam) {
        // Verify the session with the backend
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shop: shopParam }),
        });

        if (response.ok) {
          // Try to get the session with configuration
          const sessionWithConfig = await sessionStorage.getCurrentSessionWithConfig();
          if (sessionWithConfig?.config) {
            setShopifyConfig(sessionWithConfig.config);
            console.log('✅ Restored Shopify configuration for OAuth session');
          }

          setIsAuthenticated(true);
          setShop(shopParam);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }

      // If no shop parameter or verification failed, check for existing session
      const response = await fetch('/api/auth/check', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();

        // Try to get the session with configuration and restore it
        const sessionWithConfig = await sessionStorage.getCurrentSessionWithConfig();
        if (sessionWithConfig?.config) {
          setShopifyConfig(sessionWithConfig.config);
          console.log('✅ Restored Shopify configuration for existing session');
        }

        setIsAuthenticated(true);
        setShop(data.shop);
      } else {
        setIsAuthenticated(false);
        setShop(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setShop(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (shopDomain: string, accessToken?: string) => {
    try {
      setIsLoading(true);

      // If access token is provided, use static token authentication
      if (accessToken) {
        console.log('Starting static token authentication for:', shopDomain);
        await staticLogin(shopDomain, accessToken);
        return;
      }

      // Check if static credentials are available
      const hasStaticCredentials = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_NAME &&
                                  process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;

      if (hasStaticCredentials && shopDomain.includes(process.env.NEXT_PUBLIC_SHOPIFY_SHOP_NAME || '')) {
        console.log('Static credentials available, attempting static authentication');
        const staticToken = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;
        if (staticToken) {
          await staticLogin(shopDomain, staticToken);
          return;
        }
      }

      // Start OAuth flow
      console.log('Starting OAuth flow for:', shopDomain);
      const response = await fetch(`/api/auth?shop=${encodeURIComponent(shopDomain)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle setup required error
        if (errorData.setupRequired) {
          throw new Error('OAuth not configured. To use OAuth authentication, you need to set up SHOPIFY_API_KEY and SHOPIFY_API_SECRET environment variables. For now, please use Access Token authentication instead - it works without any environment variables.');
        }

        throw new Error(errorData.error || 'Failed to start authentication');
      }

      // The API should redirect to Shopify OAuth
      // This will redirect away from the page, so we don't need to handle the response
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const staticLogin = async (shopDomain: string, accessToken: string) => {
    try {
      // Validate the shop domain
      const sanitizedShop = shopDomain.trim().replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '');

      // Test the credentials by making a simple API call
      const response = await fetch('/api/auth/static-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: sanitizedShop,
          accessToken: accessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Static authentication failed');
      }

      const data = await response.json();

      // Set the Shopify configuration for this session
      setShopifyConfig({
        shopName: data.shop,
        accessToken: accessToken,
        apiVersion: '2024-04'
      });

      setIsAuthenticated(true);
      setShop(data.shop);
      console.log('✅ Static login successful for shop:', data.shop);
    } catch (error) {
      console.error('Static login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Clear the Shopify configuration
        setShopifyConfig({
          shopName: '',
          accessToken: '',
          apiVersion: '2024-04'
        });

        setIsAuthenticated(false);
        setShop(null);
        console.log('✅ Logout successful');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    shop,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
