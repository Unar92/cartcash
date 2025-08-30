import { NextRequest, NextResponse } from 'next/server';
import { createUserOAuthClient, setUserShopifyConfig } from '@/utils/shopifyMultiUser';
import { sessionStorage } from '@/utils/sessionStorage';

export async function GET(req: NextRequest) {
  console.log('🔵 Callback Route: Received callback request');
  try {
    console.log('🔍 Callback Route: Checking request URL:', req.url);
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const userId = searchParams.get('userId');
    const appKey = searchParams.get('appKey');
    const appSecret = searchParams.get('appSecret');

    if (!shop) {
      console.error('❌ Callback Route: Missing shop parameter');
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }
    console.log('✅ Callback Route: Found shop parameter:', shop);

    if (!userId) {
      console.error('❌ Callback Route: Missing userId parameter');
      return NextResponse.json(
        { error: 'User ID is required for multi-user authentication' },
        { status: 400 }
      );
    }
    console.log('✅ Callback Route: Found userId parameter:', userId);

    if (!appKey || !appSecret) {
      console.error('❌ Callback Route: Missing app credentials');
      return NextResponse.json(
        { error: 'App credentials are required to complete OAuth' },
        { status: 400 }
      );
    }
    console.log('✅ Callback Route: Found app credentials');

    // Validate shop domain format
    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
      console.error('❌ Callback Route: Invalid shop domain format:', shop);
      return NextResponse.json(
        { error: 'Invalid shop domain format' },
        { status: 400 }
      );
    }
    console.log('✅ Callback Route: Shop domain format is valid');

    console.log('🚀 Callback Route: Starting OAuth completion for shop:', shop, 'user:', userId);
    console.log('📝 Callback Route: Request headers:', {
      host: req.headers.get('host'),
      referer: req.headers.get('referer'),
      origin: req.headers.get('origin')
    });

    // Get the authorization code from the URL
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.error('❌ Callback Route: Missing authorization code');
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Exchange the authorization code for an access token
    console.log('⚙️ Callback Route: Exchanging authorization code for access token');

    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenPayload = {
      client_id: appKey,
      client_secret: appSecret,
      code: code,
    };

    console.log('📤 Callback Route: Making token request to:', tokenUrl);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenPayload),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Callback Route: Token exchange failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code for access token' },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('❌ Callback Route: No access token received');
      return NextResponse.json(
        { error: 'No access token received from Shopify' },
        { status: 500 }
      );
    }

    console.log('✨ Callback Route: OAuth completed successfully - received access token');

    // Store the session with user-specific configuration
    console.log('💾 Callback Route: Storing session for user:', userId);
    const shopifyConfig = {
      shopName: shop,
      accessToken: accessToken,
      apiVersion: '2024-04',
      apiKey: appKey,  // Store app credentials for future use
      apiSecret: appSecret,
    };

    // Create a simple session object for storage
    const session = {
      id: `session_${userId}_${Date.now()}`,
      shop: shop,
      accessToken: accessToken,
      scope: 'read_orders,read_customers,read_content',
      expires: null, // Shopify access tokens don't expire
      isOnline: false,
    };

    await sessionStorage.storeSession(session, userId, shopifyConfig);
    console.log('✅ Callback Route: Session stored successfully for user:', userId);

    // Set up the user configuration for immediate use
    setUserShopifyConfig(userId, shopifyConfig);

    // Redirect to app with shop and userId parameters
    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}/?shop=${shop}&userId=${userId}`;

    console.log('➡️ Callback Route: Preparing redirect with parameters:', {
      host,
      protocol,
      redirectUrl,
      userId
    });

    console.log('🏁 Callback Route: Redirecting to app');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Callback Route: Authentication error occurred');
    // Log more details about the error
    if (error instanceof Error) {
      console.error('🔍 Callback Route: Detailed error information:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        searchParams: new URL(req.url).searchParams.toString()
      });
    }
    return NextResponse.json(
      { error: 'Authentication callback failed' },
      { status: 500 }
    );
  }
}