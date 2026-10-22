import { NextRequest, NextResponse } from 'next/server';
import { userAuthStore, signSessionToken } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, branchCode } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const newUser = userAuthStore.register({
      email,
      password,
      fullName,
      branchCode: branchCode || 'BR-001',
      role: 'user',
      accessGroups: ['application-users']
    });

    const payload = userAuthStore.toSessionPayload(newUser);
    const sessionToken = signSessionToken(payload);

    const res = NextResponse.json(
      {
        success: true,
        user: payload
      },
      { status: 201 }
    );

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
    const status = err?.statusCode || 500;
    return NextResponse.json(
      { error: err?.message || 'Registration failed' },
      { status }
    );
  }
}
