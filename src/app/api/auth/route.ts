import { NextRequest, NextResponse } from 'next/server';
import { createUserOAuthClient } from '@/utils/shopifyMultiUser';
import { sessionStorage } from '@/utils/sessionStorage';

export async function GET(req: NextRequest) {
  console.log('🔵 Auth Route: Received request');
  try {
    console.log('🔍 Auth Route: Checking request URL:', req.url);
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const userId = searchParams.get('userId');

    if (!shop) {
      console.error('❌ Auth Route: Missing shop parameter');
      return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
    }
    console.log('✅ Auth Route: Found shop parameter:', shop);

    if (!userId) {
      console.error('❌ Auth Route: Missing userId parameter');
      return NextResponse.json({ error: 'User ID is required for multi-user authentication' }, { status: 400 });
    }
    console.log('✅ Auth Route: Found userId parameter:', userId);

    const sanitizedShop = shop.trim().replace(/^https?:\/\//, '');
    console.log('🧹 Auth Route: Sanitized shop name:', sanitizedShop);

    // Validate shop domain format
    if (!sanitizedShop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
      console.error('❌ Auth Route: Invalid shop domain format:', sanitizedShop);
      return NextResponse.json({ error: 'Invalid shop domain format' }, { status: 400 });
    }
    console.log('✅ Auth Route: Shop domain format is valid');

    console.log('🚀 Auth Route: Beginning OAuth for shop:', sanitizedShop, 'user:', userId);

    // Check if app has its own Shopify credentials (traditional OAuth flow)
    const appApiKey = process.env.SHOPIFY_API_KEY;
    const appApiSecret = process.env.SHOPIFY_API_SECRET;

    if (!appApiKey || !appApiSecret) {
      console.error('❌ Auth Route: App Shopify credentials not configured');
      return NextResponse.json({
        error: 'Shopify OAuth not configured. Please set SHOPIFY_API_KEY and SHOPIFY_API_SECRET environment variables.',
        setupRequired: true
      }, { status: 500 });
    }

    // Generate authorization URL manually (traditional OAuth flow)
    console.log('⚙️ Auth Route: Generating OAuth authorization URL manually');

    // Create the OAuth authorization URL manually
    const scopes = 'read_orders,read_customers,read_content';
    const callbackUrl = encodeURIComponent(`http://localhost:3000/api/auth/callback?userId=${userId}&appKey=${appApiKey}&appSecret=${appApiSecret}`);
    const state = Math.random().toString(36).substring(2, 15);

    const authUrl = `https://${sanitizedShop}/admin/oauth/authorize?client_id=${appApiKey}&scope=${encodeURIComponent(scopes)}&redirect_uri=${callbackUrl}&state=${state}`;

    console.log('✨ Auth Route: Generated auth URL:', authUrl);
    console.log('➡️ Auth Route: Redirecting to Shopify auth page');
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('❌ Auth Route: Authentication error occurred');
    if (error instanceof Error) {
      console.error('🔍 Auth Route: Detailed error information:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  try {
    const { shop, userId } = await req.json();

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }

    if (userId) {
      // Check user-specific session
      const userSession = await sessionStorage.getCurrentSessionForUser(userId);
      if (userSession && userSession.shop === shop) {
        return NextResponse.json({ success: true, userId, shop });
      }
    } else {
      // Fallback: find sessions for the shop (legacy support)
      const sessions = await sessionStorage.findSessionsByShop(shop);
      if (sessions && sessions.length > 0) {
        return NextResponse.json({ success: true, shop });
      }
    }

    return NextResponse.json({ error: 'No valid session found' }, { status: 401 });
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Authentication validation failed' },
      { status: 500 }
    );
  }
}