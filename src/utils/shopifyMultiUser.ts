import axios from 'axios';
import { ShopifyAbandonedCartsResponse, ShopifyAbandonedCart } from '../types/shopify';

// User-specific configuration interface
interface UserShopifyConfig {
  shopName: string;
  accessToken: string;
  apiVersion: string;
  storefrontPassword?: string;
  // For OAuth users, store their app credentials
  apiKey?: string;
  apiSecret?: string;
}

// Per-user Shopify client manager
class MultiUserShopifyManager {
  private static instance: MultiUserShopifyManager;
  private userClients: Map<string, any> = new Map();
  private userConfigs: Map<string, UserShopifyConfig> = new Map();

  private constructor() {}

  static getInstance(): MultiUserShopifyManager {
    if (!MultiUserShopifyManager.instance) {
      MultiUserShopifyManager.instance = new MultiUserShopifyManager();
    }
    return MultiUserShopifyManager.instance;
  }

  // Set configuration for a specific user
  setUserConfig(userId: string, config: UserShopifyConfig) {
    this.userConfigs.set(userId, { ...config });
    console.log(`✅ Shopify configuration updated for user: ${userId}, shop: ${config.shopName}`);

    // Invalidate existing client to force recreation with new config
    this.userClients.delete(userId);
  }

  // Get configuration for a specific user
  getUserConfig(userId: string): UserShopifyConfig | null {
    return this.userConfigs.get(userId) || null;
  }

  // Remove configuration for a specific user
  removeUserConfig(userId: string) {
    this.userConfigs.delete(userId);
    this.userClients.delete(userId);
    console.log(`✅ Shopify configuration removed for user: ${userId}`);
  }

  // Get or create axios client for a specific user
  private getUserClient(userId: string): any {
    if (this.userClients.has(userId)) {
      return this.userClients.get(userId);
    }

    const config = this.userConfigs.get(userId);
    if (!config) {
      throw new Error(`Shopify configuration not set for user: ${userId}. Please authenticate first.`);
    }

    // Create axios client for this user
    const client = axios.create({
      baseURL: this.getApiBaseUrl(config.shopName, config.apiVersion),
      headers: {
        'X-Shopify-Access-Token': config.accessToken,
        'Content-Type': 'application/json',
      },
    });

    this.userClients.set(userId, client);
    return client;
  }

  // Helper to construct API base URL
  private getApiBaseUrl(shopName: string, apiVersion: string): string {
    const sanitizedShopName = shopName.replace(/\.myshopify\.com$/, '');
    return `https://${sanitizedShopName}.myshopify.com/admin/api/${apiVersion}`;
  }

  // Fetch abandoned carts for a specific user
  async fetchAbandonedCarts(
    userId: string,
    limit: number = 50,
    sinceId?: string
  ): Promise<ShopifyAbandonedCartsResponse> {
    try {
      const config = this.userConfigs.get(userId);
      if (!config) {
        throw new Error(`Shopify configuration not set for user: ${userId}. Please authenticate first.`);
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(sinceId && { since_id: sinceId }),
      });

      console.log(`Fetching carts for user ${userId} with params:`, Object.fromEntries(params.entries()));

      const client = this.getUserClient(userId);
      const response = await client.get(`/checkouts.json?${params}`);

      console.log(`Shopify API Response for user ${userId}:`, {
        totalCheckouts: response.data.checkouts?.length,
        checkoutStatuses: response.data.checkouts?.map((c: any) => ({ id: c.id, status: c.status }))
      });

      return response.data;
    } catch (error: any) {
      console.error(`Error fetching abandoned carts for user ${userId}:`, error);

      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your Shopify access token.');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. Please check if your app has the required admin API permissions (read_orders scope).');
      }

      throw error;
    }
  }

  // Get abandoned cart details for a specific user
  async getAbandonedCartDetails(userId: string, cartId: string): Promise<ShopifyAbandonedCart> {
    try {
      const config = this.userConfigs.get(userId);
      if (!config) {
        throw new Error(`Shopify configuration not set for user: ${userId}. Please authenticate first.`);
      }

      const client = this.getUserClient(userId);
      const response = await client.get(`/checkouts/${cartId}.json`);
      return response.data.checkout;
    } catch (error) {
      console.error(`Error fetching cart details for user ${userId}:`, error);
      throw error;
    }
  }

  // Create OAuth client for a specific user (no global env vars needed)
  createUserOAuthClient(userId: string, apiKey: string, apiSecret: string, shopName: string) {
    try {
      const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
      require('@shopify/shopify-api/adapters/node');

      // Get app URL from environment or use default
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const hostName = new URL(appUrl).hostname;

      const oauthClient = shopifyApi({
        apiKey,
        apiSecretKey: apiSecret,
        scopes: ['read_orders', 'read_customers', 'read_content'],
        hostName: hostName,
        hostScheme: process.env.NODE_ENV === 'production' ? 'https' : 'http',
        apiVersion: LATEST_API_VERSION,
        isEmbeddedApp: false,
      });

      console.log(`✅ OAuth client created for user: ${userId}, shop: ${shopName}`);
      return oauthClient;
    } catch (error) {
      console.error(`❌ Failed to create OAuth client for user ${userId}:`, error);
      return null;
    }
  }

  // Get all active user IDs (for debugging/admin purposes)
  getActiveUsers(): string[] {
    return Array.from(this.userConfigs.keys());
  }

  // Clean up inactive users (optional cleanup method)
  cleanupInactiveUsers(inactiveUserIds: string[]) {
    inactiveUserIds.forEach(userId => {
      this.removeUserConfig(userId);
    });
  }
}

// Export singleton instance
export const multiUserShopifyManager = MultiUserShopifyManager.getInstance();

// Export convenience functions for easier usage
export function setUserShopifyConfig(userId: string, config: {
  shopName: string;
  accessToken: string;
  apiVersion?: string;
  storefrontPassword?: string;
  apiKey?: string;
  apiSecret?: string;
}) {
  multiUserShopifyManager.setUserConfig(userId, {
    shopName: config.shopName,
    accessToken: config.accessToken,
    apiVersion: config.apiVersion || '2024-04',
    storefrontPassword: config.storefrontPassword,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
  });
}

export function getUserShopifyConfig(userId: string) {
  return multiUserShopifyManager.getUserConfig(userId);
}

export function removeUserShopifyConfig(userId: string) {
  multiUserShopifyManager.removeUserConfig(userId);
}

export async function fetchUserAbandonedCarts(userId: string, limit?: number, sinceId?: string) {
  return multiUserShopifyManager.fetchAbandonedCarts(userId, limit, sinceId);
}

export async function getUserAbandonedCartDetails(userId: string, cartId: string) {
  return multiUserShopifyManager.getAbandonedCartDetails(userId, cartId);
}

export function createUserOAuthClient(userId: string, apiKey: string, apiSecret: string, shopName: string) {
  return multiUserShopifyManager.createUserOAuthClient(userId, apiKey, apiSecret, shopName);
}
