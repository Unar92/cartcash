import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

let shopify: any = null;

// Only initialize shopify if credentials are available
if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET) {
  try {
    shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      scopes: ['read_orders', 'read_customers', 'read_content'],
      hostName: process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000',
      apiVersion: ApiVersion.April23,
      isEmbeddedApp: false,
    });
    console.log('✅ Shopify API initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Shopify API:', error);
  }
} else {
  console.warn('⚠️ Shopify API credentials not found. OAuth authentication will not work. Using fallback mode.');
}

export { shopify };
