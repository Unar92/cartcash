import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

let shopify: any = null;

// Try to initialize shopify if credentials are available (for OAuth)
if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET) {
  try {
    shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      scopes: ['read_orders', 'read_customers', 'read_content'],
      hostName: process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
    });
    console.log('✅ Shopify API initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Shopify API:', error);
  }
} else {
  console.log('ℹ️ Shopify API not initialized - OAuth will not work. Using static token mode only.');
}

// Dynamic Shopify client for static token authentication
let dynamicShopifyClient: any = null;

export function createShopifyClient(apiKey?: string, apiSecret?: string) {
  if (!apiKey || !apiSecret) {
    console.warn('⚠️ No API credentials provided for OAuth client');
    return null;
  }

  try {
    return shopifyApi({
      apiKey,
      apiSecretKey: apiSecret,
      scopes: ['read_orders', 'read_customers', 'read_content'],
      hostName: process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000',
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

export { shopify, dynamicShopifyClient };
