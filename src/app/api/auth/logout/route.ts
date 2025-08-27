import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/utils/sessionStorage';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Auth Logout: Processing logout request');

    // Get the current session
    const currentSession = await sessionStorage.getCurrentSession();

    if (currentSession) {
      // Delete the session
      await sessionStorage.deleteSession(currentSession.id);
      console.log('✅ Auth Logout: Session deleted for shop:', currentSession.shop);
    }

    console.log('✅ Auth Logout: Logout completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Auth Logout: Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
