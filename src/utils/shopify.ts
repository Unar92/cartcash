import axios from 'axios';
import { ShopifyAbandonedCartsResponse, ShopifyAbandonedCart } from '../types/shopify';

// Validate environment variables
const validateShopifyConfig = () => {
  const missingVars = [];
  
  if (!process.env.SHOPIFY_SHOP_NAME) missingVars.push('SHOPIFY_SHOP_NAME');
  if (!process.env.SHOPIFY_API_VERSION) missingVars.push('SHOPIFY_API_VERSION');
  if (!process.env.SHOPIFY_ACCESS_TOKEN) missingVars.push('SHOPIFY_ACCESS_TOKEN');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Shopify configuration: ${missingVars.join(', ')}. Please check your .env.local file.`);
  }
};

// Initialize API base URL after validation
const getShopifyApiBase = () => {
  validateShopifyConfig();
  return `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/${process.env.SHOPIFY_API_VERSION}`;
};

// Log API configuration (without sensitive data)
console.log('Initializing Shopify API with:', {
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiVersion: process.env.SHOPIFY_API_VERSION,
  hasAccessToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
  hasStorefrontPassword: !!process.env.SHOPIFY_STOREFRONT_PASSWORD
});

const SHOPIFY_API_BASE = getShopifyApiBase();

// Function to get the storefront password cookie
const getStorefrontPasswordCookie = () => {
  // Storefront password is optional, only required for development stores
  if (process.env.SHOPIFY_STOREFRONT_PASSWORD) {
    return `storefront_password=${process.env.SHOPIFY_STOREFRONT_PASSWORD}`;
  }
  return '';
};

const shopifyClient = axios.create({
  baseURL: SHOPIFY_API_BASE,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
});

export async function fetchAbandonedCarts(
  limit: number = 50,
  sinceId?: string
): Promise<ShopifyAbandonedCartsResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      status: 'open',
      ...(sinceId && { since_id: sinceId }),
    });

    const response = await shopifyClient.get(`/checkouts.json?${params}`);
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
    const response = await shopifyClient.get(`/checkouts/${cartId}.json`);
    return response.data.checkout;
  } catch (error) {
    console.error('Error fetching cart details:', error);
    throw error;
  }
}
