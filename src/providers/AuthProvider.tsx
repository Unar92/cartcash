'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setUserShopifyConfig, removeUserShopifyConfig } from '@/utils/shopifyMultiUser';
import { sessionStorage } from '@/utils/sessionStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  shop: string | null;
  userId: string | null;
  login: (shopDomain: string, accessToken?: string, userId?: string) => Promise<void>;
  logout: (userId?: string) => Promise<void>;
  checkAuthStatus: (userId?: string) => Promise<void>;
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
  const [userId, setUserId] = useState<string | null>(null);

  const checkAuthStatus = async (targetUserId?: string) => {
    try {
      setIsLoading(true);

      // Check if there's a shop and userId parameter in the URL (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const shopParam = urlParams.get('shop');
      const userIdParam = urlParams.get('userId') || targetUserId;

      if (shopParam && userIdParam) {
        // Verify the session with the backend for this specific user
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shop: shopParam, userId: userIdParam }),
        });

        if (response.ok) {
          // Try to get the user-specific session with configuration
          const sessionWithConfig = await sessionStorage.getCurrentSessionWithConfigForUser(userIdParam);
          if (sessionWithConfig?.config) {
            setUserShopifyConfig(userIdParam, sessionWithConfig.config);
            console.log('✅ Restored Shopify configuration for OAuth session:', userIdParam);
          }

          setIsAuthenticated(true);
          setShop(shopParam);
          setUserId(userIdParam);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }

      // If no parameters or verification failed, check for existing user session
      if (userIdParam) {
        const sessionWithConfig = await sessionStorage.getCurrentSessionWithConfigForUser(userIdParam);
        if (sessionWithConfig?.config) {
          setUserShopifyConfig(userIdParam, sessionWithConfig.config);
          console.log('✅ Restored Shopify configuration for existing session:', userIdParam);

          setIsAuthenticated(true);
          setShop(sessionWithConfig.config.shopName);
          setUserId(userIdParam);
          return;
        }
      }

      // Fallback: check for any existing session (for backward compatibility)
      const response = await fetch('/api/auth/check', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const sessionWithConfig = await sessionStorage.getCurrentSessionWithConfig();

        if (sessionWithConfig?.config) {
          setUserShopifyConfig('legacy-user', sessionWithConfig.config);
          console.log('✅ Restored legacy Shopify configuration');
        }

        setIsAuthenticated(true);
        setShop(data.shop);
        setUserId('legacy-user');
      } else {
        setIsAuthenticated(false);
        setShop(null);
        setUserId(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setShop(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (shopDomain: string, accessToken?: string, targetUserId?: string) => {
    try {
      setIsLoading(true);

      // Generate a userId if not provided
      const currentUserId = targetUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUserId(currentUserId);

      // If access token is provided, use static token authentication
      if (accessToken) {
        console.log('Starting static token authentication for:', shopDomain, 'user:', currentUserId);
        await staticLogin(shopDomain, accessToken, currentUserId);
        return;
      }

      // Use traditional OAuth flow (app handles authentication with its own credentials)
      console.log('Starting traditional OAuth flow for shop:', shopDomain, 'user:', currentUserId);

      // For OAuth, we redirect the user to the auth endpoint
      // The endpoint will redirect to Shopify, and Shopify will redirect back to our callback
      window.location.href = `/api/auth?shop=${encodeURIComponent(shopDomain)}&userId=${currentUserId}`;
      return;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const staticLogin = async (shopDomain: string, accessToken: string, userId: string) => {
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
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Static authentication failed');
      }

      const data = await response.json();

      // Set the Shopify configuration for this user
      setUserShopifyConfig(userId, {
        shopName: data.shop,
        accessToken: accessToken,
        apiVersion: '2024-04'
      });

      setIsAuthenticated(true);
      setShop(data.shop);
      setUserId(userId);
      console.log('✅ Static login successful for shop:', data.shop, 'user:', userId);
    } catch (error) {
      console.error('Static login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (targetUserId?: string) => {
    try {
      setIsLoading(true);

      const currentUserId = targetUserId || userId;

      if (currentUserId) {
        // Remove user-specific Shopify configuration
        removeUserShopifyConfig(currentUserId);

        // Call logout API with userId
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUserId }),
        });

        if (response.ok) {
          console.log('✅ Logout successful for user:', currentUserId);
        } else {
          console.error('Logout API call failed');
        }
      }

      setIsAuthenticated(false);
      setShop(null);
      setUserId(null);
      console.log('✅ Logout completed');
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
    userId,
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
