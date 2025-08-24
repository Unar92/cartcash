import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/utils/sessionStorage';
import { Session } from '@shopify/shopify-api';

export async function POST(req: NextRequest) {
  try {
    const { shop, accessToken } = await req.json();

    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: 'Shop and access token are required' },
        { status: 400 }
      );
    }

    console.log('🔐 Static Login: Attempting authentication for shop:', shop);

    // Test the access token by making a simple API call to Shopify
    const shopDomain = `${shop}.myshopify.com`;
    const testUrl = `https://${shopDomain}/admin/api/2024-04/shop.json`;

    try {
      const testResponse = await fetch(testUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        console.error('❌ Static Login: Access token validation failed');
        return NextResponse.json(
          { error: 'Invalid access token or shop domain' },
          { status: 401 }
        );
      }

      console.log('✅ Static Login: Access token validated successfully');

      // Create a mock session for static token authentication
      const mockSession = new Session({
        id: `static-${shop}-${Date.now()}`,
        shop: shopDomain,
        accessToken: accessToken,
        scope: 'read_orders read_customers read_content',
        expires: null, // Static tokens don't expire
        isOnline: false,
      });

      // Store the session
      await sessionStorage.storeSession(mockSession);

      console.log('✅ Static Login: Session created and stored');

      return NextResponse.json({
        success: true,
        shop: shopDomain,
        sessionId: mockSession.id
      });

    } catch (fetchError) {
      console.error('❌ Static Login: API test failed:', fetchError);
      return NextResponse.json(
        { error: 'Failed to validate credentials with Shopify' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Static Login: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Static authentication failed' },
      { status: 500 }
    );
  }
}
