import axios from 'axios';
import { ShopifyAbandonedCartsResponse, ShopifyAbandonedCart } from '../types/shopify';

// Dynamic configuration - will be set at runtime
let shopifyConfig = {
  shopName: '',
  apiVersion: '2024-04',
  accessToken: '',
  storefrontPassword: process.env.SHOPIFY_STOREFRONT_PASSWORD || ''
};

// Function to set Shopify configuration at runtime
export function setShopifyConfig(config: {
  shopName: string;
  accessToken: string;
  apiVersion?: string;
  storefrontPassword?: string;
}) {
  shopifyConfig = {
    shopName: config.shopName,
    apiVersion: config.apiVersion || '2024-04',
    accessToken: config.accessToken,
    storefrontPassword: config.storefrontPassword || shopifyConfig.storefrontPassword
  };
  console.log('✅ Shopify configuration updated for shop:', config.shopName);
}

// Function to get the current Shopify configuration
export function getShopifyConfig() {
  return { ...shopifyConfig };
}

// Function to get API base URL dynamically
const getShopifyApiBase = () => {
  if (!shopifyConfig.shopName) {
    throw new Error('Shopify configuration not set. Please authenticate first.');
  }

  // Ensure shopName doesn't already have .myshopify.com
  const sanitizedShopName = shopifyConfig.shopName.replace(/\.myshopify\.com$/, '');
  return `https://${sanitizedShopName}.myshopify.com/admin/api/${shopifyConfig.apiVersion}`;
};

// Function to get the storefront password cookie
const getStorefrontPasswordCookie = () => {
  if (shopifyConfig.storefrontPassword) {
    return `storefront_password=${shopifyConfig.storefrontPassword}`;
  }
  return '';
};

// Create a dynamic axios client that will be configured at runtime
let shopifyClient: any = null;

function getShopifyClient() {
  if (!shopifyClient || !shopifyConfig.accessToken) {
    if (!shopifyConfig.shopName || !shopifyConfig.accessToken) {
      throw new Error('Shopify configuration not set. Please authenticate first.');
    }

    shopifyClient = axios.create({
      baseURL: getShopifyApiBase(),
      headers: {
        'X-Shopify-Access-Token': shopifyConfig.accessToken,
        'Content-Type': 'application/json',
      },
    });
  }
  return shopifyClient;
}

export async function fetchAbandonedCarts(
  limit: number = 50,
  sinceId?: string
): Promise<ShopifyAbandonedCartsResponse> {
  try {
    if (!shopifyConfig.shopName || !shopifyConfig.accessToken) {
      throw new Error('Shopify configuration not set. Please authenticate first.');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      // Remove the status filter to see all carts
      ...(sinceId && { since_id: sinceId }),
    });

    // Add debug logging
    console.log('Fetching carts with params:', Object.fromEntries(params.entries()));

    const client = getShopifyClient();
    const response = await client.get(`/checkouts.json?${params}`);

    // Add debug logging for the response
    console.log('Shopify API Response:', {
      totalCheckouts: response.data.checkouts?.length,
      checkoutStatuses: response.data.checkouts?.map((c: any) => ({ id: c.id, status: c.status }))
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching abandoned carts:', error);

    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please check your Shopify access token.');
    } else if (error.response?.status === 403) {
      throw new Error('Access forbidden. Please check if your app has the required admin API permissions (read_orders scope).');
    }

    throw error;
  }
}

export async function getAbandonedCartDetails(
  cartId: string
): Promise<ShopifyAbandonedCart> {
  try {
    if (!shopifyConfig.shopName || !shopifyConfig.accessToken) {
      throw new Error('Shopify configuration not set. Please authenticate first.');
    }

    const client = getShopifyClient();
    const response = await client.get(`/checkouts/${cartId}.json`);
    return response.data.checkout;
  } catch (error) {
    console.error('Error fetching cart details:', error);
    throw error;
  }
}
