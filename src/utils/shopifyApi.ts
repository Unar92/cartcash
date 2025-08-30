import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';

// Import Node.js adapters for server-side rendering
import '@shopify/shopify-api/adapters/node';

let shopify: any = null;

// Try to initialize shopify if credentials are available (for OAuth)
if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET) {
  try {
    console.log('🔧 Initializing Shopify API with credentials...');
    console.log('API Key:', process.env.SHOPIFY_API_KEY ? 'Present' : 'Missing');
    console.log('API Secret:', process.env.SHOPIFY_API_SECRET ? 'Present' : 'Missing');

    // Construct proper host name for OAuth
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const hostName = new URL(appUrl).hostname;

    shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      scopes: ['read_orders', 'read_customers', 'read_content'],
      hostName: hostName,
      hostScheme: process.env.NODE_ENV === 'production' ? 'https' : 'http',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
    });
    console.log('✅ Shopify API initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Shopify API:', error);
  }
} else {
  console.log('ℹ️ Shopify API not initialized - OAuth will not work. Using static token mode only.');
  console.log('Missing SHOPIFY_API_KEY:', !process.env.SHOPIFY_API_KEY);
  console.log('Missing SHOPIFY_API_SECRET:', !process.env.SHOPIFY_API_SECRET);
}

// Dynamic Shopify client for static token authentication
let dynamicShopifyClient: any = null;

export function createShopifyClient(apiKey?: string, apiSecret?: string) {
  if (!apiKey || !apiSecret) {
    console.warn('⚠️ No API credentials provided for OAuth client');
    return null;
  }

  try {
    // Construct proper host name for OAuth
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const hostName = new URL(appUrl).hostname;

    return shopifyApi({
      apiKey,
      apiSecretKey: apiSecret,
      scopes: ['read_orders', 'read_customers', 'read_content'],
      hostName: hostName,
      hostScheme: process.env.NODE_ENV === 'production' ? 'https' : 'http',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
    });
  } catch (error) {
    console.error('❌ Failed to create dynamic Shopify client:', error);
    return null;
  }
}

export function setDynamicShopifyClient(client: any) {
  dynamicShopifyClient = client;
}

export { shopify, dynamicShopifyClient, Session };
