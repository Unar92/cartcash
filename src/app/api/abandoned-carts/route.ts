import { NextResponse } from 'next/server';
import { fetchAbandonedCarts } from '@/utils/shopify';

export async function GET(request: Request) {
  try {
    // Log environment variables (excluding sensitive data)
    console.log('Environment check:', {
      SHOPIFY_SHOP_NAME: process.env.SHOPIFY_SHOP_NAME ? 'Set' : 'Not set',
      SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION ? 'Set' : 'Not set',
      SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN ? 'Set' : 'Not set',
    });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sinceId = searchParams.get('since_id') || undefined;

    const abandonedCarts = await fetchAbandonedCarts(limit, sinceId);
    
    return NextResponse.json(abandonedCarts);
  } catch (error: any) {
    // Log detailed error information
    console.error('Detailed error in abandoned carts API:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        headers: error.config?.headers ? {
          ...error.config.headers,
          'X-Shopify-Access-Token': '[REDACTED]' // Don't log sensitive tokens
        } : null
      }
    });
    
    // Handle specific error messages
    const errorMessage = error.message || 'Failed to fetch abandoned carts';
    const status = error.response?.status || 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.response?.data?.errors || null,
        timestamp: new Date().toISOString()
      },
      { status }
    );
  }
}
