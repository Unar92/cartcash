import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/utils/sessionStorage';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Auth Check: Checking authentication status');

    // Get the current session
    const currentSession = await sessionStorage.getCurrentSession();

    if (!currentSession) {
      console.log('❌ Auth Check: No valid session found');
      return NextResponse.json(
        { error: 'No valid session found' },
        { status: 401 }
      );
    }

    console.log('✅ Auth Check: Valid session found for shop:', currentSession.shop);
    return NextResponse.json({
      success: true,
      shop: currentSession.shop,
      sessionId: currentSession.id
    });
  } catch (error) {
    console.error('❌ Auth Check: Authentication check error:', error);
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
