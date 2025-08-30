import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check if the app has Shopify OAuth credentials configured
    const appApiKey = process.env.SHOPIFY_API_KEY;
    const appApiSecret = process.env.SHOPIFY_API_SECRET;

    if (appApiKey && appApiSecret) {
      return NextResponse.json({
        oauthConfigured: true,
        message: 'OAuth is configured and ready to use'
      });
    }

    return NextResponse.json({
      oauthConfigured: false,
      message: 'OAuth not configured. Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET to enable OAuth.'
    });
  } catch (error) {
    console.error('Error checking OAuth configuration:', error);
    return NextResponse.json(
      { error: 'Failed to check OAuth configuration' },
      { status: 500 }
    );
  }
}
