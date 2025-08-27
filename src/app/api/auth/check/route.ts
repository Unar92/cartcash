import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/utils/sessionStorage';
import { setShopifyConfig } from '@/utils/shopify';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Auth Check: Checking authentication status');

    // Get the current session with configuration
    const sessionWithConfig = await sessionStorage.getCurrentSessionWithConfig();

    if (!sessionWithConfig || !sessionWithConfig.config) {
      console.log('❌ Auth Check: No valid session or configuration found');
      return NextResponse.json(
        { error: 'No valid session found' },
        { status: 401 }
      );
    }

    const { session, config } = sessionWithConfig;

    // Set the Shopify configuration for this request
    setShopifyConfig(config);

    console.log('✅ Auth Check: Valid session found for shop:', session.shop);
    console.log('⚙️ Auth Check: Configuration ready for shop:', config.shopName);

    return NextResponse.json({
      success: true,
      shop: session.shop,
      sessionId: session.id,
      hasConfig: true
    });
  } catch (error) {
    console.error('❌ Auth Check: Authentication check error:', error);
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
