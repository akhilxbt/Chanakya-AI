import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, type UserSessionPayload } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('assistant_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }

  const payload = verifySessionToken(sessionCookie) as UserSessionPayload | null;
  if (!payload || !payload.id) {
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: payload
  });
}
