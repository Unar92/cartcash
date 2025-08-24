import { NextRequest, NextResponse } from 'next/server';
import { shopify } from '@/utils/shopifyApi';
import { sessionStorage } from '@/utils/sessionStorage';

export async function GET(req: NextRequest) {
  console.log('🔵 Auth Route: Received request');
  try {
    console.log('🔍 Auth Route: Checking request URL:', req.url);
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      console.error('❌ Auth Route: Missing shop parameter');
      return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
    }
    console.log('✅ Auth Route: Found shop parameter:', shop);

    const sanitizedShop = shop.trim().replace(/^https?:\/\//, '');
    console.log('🧹 Auth Route: Sanitized shop name:', sanitizedShop);

    // Validate shop domain format
    if (!sanitizedShop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
      console.error('❌ Auth Route: Invalid shop domain format:', sanitizedShop);
      return NextResponse.json({ error: 'Invalid shop domain format' }, { status: 400 });
    }
    console.log('✅ Auth Route: Shop domain format is valid');

    console.log('🚀 Auth Route: Beginning OAuth for shop:', sanitizedShop);

    // Generate authorization URL
    console.log('⚙️ Auth Route: Configuring auth parameters:', {
      shop: sanitizedShop,
      callbackPath: '/api/auth/callback',
      isOnline: false
    });

    const authUrl = await shopify.auth.begin({
      shop: sanitizedShop,
      callbackPath: '/api/auth/callback',
      isOnline: false,
      rawRequest: {
        headers: {
          host: req.headers.get('host') || '',
          'user-agent': req.headers.get('user-agent') || '',
          accept: req.headers.get('accept') || '',
        },
        method: req.method,
        url: req.url,
        body: null,
      },
    });

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
    const { shop } = await req.json();

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }

    // Find sessions for the shop
    const sessions = await sessionStorage.findSessionsByShop(shop);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ error: 'No valid session found' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Authentication validation failed' },
      { status: 500 }
    );
  }
}