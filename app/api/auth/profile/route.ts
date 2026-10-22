import { NextRequest, NextResponse } from 'next/server';
import { userAuthStore, signSessionToken, verifySessionToken, type UserSessionPayload } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('assistant_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie) as UserSessionPayload | null;
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, branchCode, designation, avatar } = body;

    const updatedUser = userAuthStore.updateProfile(payload.id, {
      fullName,
      branchCode,
      designation,
      avatar
    });

    const newPayload = userAuthStore.toSessionPayload(updatedUser);
    const sessionToken = signSessionToken(newPayload);

    const res = NextResponse.json({
      success: true,
      user: newPayload
    });

    res.cookies.set({
      name: 'assistant_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update profile' },
      { status: err?.statusCode || 500 }
    );
  }
}
