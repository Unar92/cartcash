import { NextRequest, NextResponse } from 'next/server';
import { sessionStorage } from '@/utils/sessionStorage';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Auth Logout: Processing logout request');

    const { userId } = await req.json();

    if (userId) {
      // Get the user-specific session
      const userSession = await sessionStorage.getCurrentSessionForUser(userId);

      if (userSession) {
        // Delete the user-specific session
        await sessionStorage.deleteSession(userSession.id);
        console.log('✅ Auth Logout: Session deleted for user:', userId, 'shop:', userSession.shop);
      } else {
        console.log('ℹ️ Auth Logout: No active session found for user:', userId);
      }
    } else {
      // Fallback: delete current session (for backward compatibility)
      const currentSession = await sessionStorage.getCurrentSession();
      if (currentSession) {
        await sessionStorage.deleteSession(currentSession.id);
        console.log('✅ Auth Logout: Legacy session deleted for shop:', currentSession.shop);
      }
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
