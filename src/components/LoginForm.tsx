'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export function LoginForm() {
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [authMethod, setAuthMethod] = useState<'oauth' | 'static'>('static'); // Default to static since it works without env vars
  const [isOAuthAvailable, setIsOAuthAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  // Check if OAuth is available on component mount
  useEffect(() => {
    const checkOAuthAvailability = async () => {
      try {
        // Try to make a test OAuth request to see if credentials are configured
        const response = await fetch('/api/auth?shop=test.myshopify.com', {
          method: 'GET',
        });

        // If we get the setupRequired error, OAuth is not configured
        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.setupRequired) {
            setIsOAuthAvailable(false);
            // Automatically switch to static token if OAuth is not available
            setAuthMethod('static');
            return;
          }
        }

        // If we get a different response, OAuth might be available
        setIsOAuthAvailable(true);
      } catch (error) {
        console.log('OAuth availability check failed, assuming not available');
        setIsOAuthAvailable(false);
        // Automatically switch to static token if OAuth check fails
        setAuthMethod('static');
      }
    };

    checkOAuthAvailability();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate shop domain
      if (!shopDomain.trim()) {
        setError('Please enter your Shopify store domain');
        return;
      }

      // Clean and validate the domain
      let cleanDomain = shopDomain.trim().toLowerCase();

      // Remove protocol if present
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '');

      // Remove .myshopify.com if present
      cleanDomain = cleanDomain.replace(/\.myshopify\.com$/, '');

      // Add .myshopify.com if not present
      if (!cleanDomain.includes('.')) {
        cleanDomain += '.myshopify.com';
      }

      // Validate the final domain format
      if (!cleanDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
        setError('Please enter a valid Shopify store domain (e.g., mystore.myshopify.com or mystore)');
        return;
      }

      if (authMethod === 'static') {
        if (!accessToken.trim()) {
          setError('Please enter your Shopify access token');
          return;
        }
        console.log('Starting static token authentication for shop:', cleanDomain);
        await login(cleanDomain, accessToken.trim());
      } else {
        console.log('Starting OAuth flow for shop:', cleanDomain);
        await login(cleanDomain);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to CartCash
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Connect your Shopify store to start managing abandoned carts
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Authentication Method Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Authentication Method
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="oauth"
                  name="authMethod"
                  type="radio"
                  checked={authMethod === 'oauth'}
                  onChange={() => setAuthMethod('oauth')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={isLoading || !isOAuthAvailable}
                />
                <label htmlFor="oauth" className={`ml-2 block text-sm ${isOAuthAvailable ? 'text-gray-900 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  OAuth (Recommended - requires Shopify app setup)
                  {!isOAuthAvailable && (
                    <span className="text-red-500 dark:text-red-400 text-xs block">
                      ⚠️ Not configured - requires SHOPIFY_API_KEY and SHOPIFY_API_SECRET environment variables
                    </span>
                  )}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="static"
                  name="authMethod"
                  type="radio"
                  checked={authMethod === 'static'}
                  onChange={() => setAuthMethod('static')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={isLoading}
                />
                <label htmlFor="static" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Access Token (Simple - requires private app)
                  {!isOAuthAvailable && (
                    <span className="text-green-600 dark:text-green-400 text-xs block">
                      ✅ Recommended - works without environment variables
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="shopDomain" className="sr-only">
              Shopify Store Domain
            </label>
            <div className="relative">
              <input
                id="shopDomain"
                name="shopDomain"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="your-store.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter your Shopify store domain (e.g., mystore or mystore.myshopify.com)
            </p>
          </div>

          {authMethod === 'static' && (
            <div>
              <label htmlFor="accessToken" className="sr-only">
                Shopify Access Token
              </label>
              <div className="relative">
                <input
                  id="accessToken"
                  name="accessToken"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter your Shopify private app access token (starts with shpat_)
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Authentication Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {authMethod === 'static' ? 'Authenticating...' : 'Connecting...'}
                </div>
              ) : (
                authMethod === 'static' ? 'Authenticate with Token' : 'Connect Shopify Store'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Secure OAuth Connection
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By connecting your store, you agree to allow CartCash to access your abandoned cart data
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
