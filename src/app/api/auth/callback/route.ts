import { NextRequest, NextResponse } from 'next/server';
import { shopify } from '@/utils/shopifyApi';
import { sessionStorage } from '@/utils/sessionStorage';

export async function GET(req: NextRequest) {
  console.log('🔵 Callback Route: Received callback request');
  try {
    console.log('🔍 Callback Route: Checking request URL:', req.url);
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      console.error('❌ Callback Route: Missing shop parameter');
      return NextResponse.json(
        { error: 'Shop parameter is required' },
        { status: 400 }
      );
    }
    console.log('✅ Callback Route: Found shop parameter:', shop);

    // Validate shop domain format
    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
      console.error('❌ Callback Route: Invalid shop domain format:', shop);
      return NextResponse.json(
        { error: 'Invalid shop domain format' },
        { status: 400 }
      );
    }
    console.log('✅ Callback Route: Shop domain format is valid');

    console.log('🚀 Callback Route: Starting OAuth completion for shop:', shop);
    console.log('📝 Callback Route: Request headers:', {
      host: req.headers.get('host'),
      referer: req.headers.get('referer'),
      origin: req.headers.get('origin')
    });
    
    // Complete OAuth
    console.log('⚙️ Callback Route: Completing OAuth process');
    const session = await shopify.auth.callback({
      rawRequest: req,
    });

    console.log('✨ Callback Route: OAuth completed successfully');
    console.log('📦 Callback Route: Session data received');

    // Store the session
    console.log('💾 Callback Route: Storing session');
    await sessionStorage.storeSession(session);
    console.log('✅ Callback Route: Session stored successfully');

    // Redirect to app with shop parameter
    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}/?shop=${shop}`;
    
    console.log('➡️ Callback Route: Preparing redirect with parameters:', {
      host,
      protocol,
      redirectUrl
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