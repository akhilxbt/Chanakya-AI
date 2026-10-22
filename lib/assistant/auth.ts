import { NextRequest } from 'next/server';
import { verifySessionToken, type UserSessionPayload } from '@/lib/auth/session';

export interface SessionUser {
  id: string;
  email?: string;
  fullName?: string;
  role: 'user' | 'admin';
  groups: string[];
  branchCode?: string;
}

export function getAuthenticatedUser(req: NextRequest): SessionUser {
  // 1. Attempt reading tamper-proof signed httpOnly cookie
  const sessionCookie = req.cookies.get('assistant_session')?.value;
  if (sessionCookie) {
    const verified = verifySessionToken(sessionCookie) as UserSessionPayload | null;
    if (verified && verified.id) {
      return {
        id: verified.id,
        email: verified.email,
        fullName: verified.fullName,
        role: verified.role === 'admin' ? 'admin' : 'user',
        groups: Array.isArray(verified.groups) ? verified.groups : ['application-users'],
        branchCode: verified.branchCode || 'BR-001'
      };
    }
  }

  // 2. Fallback to caller headers for CLI scripts, integration tests, or legacy clients
  const id = req.headers.get('x-user-id') || 'user-001';
  const role = req.headers.get('x-user-role') === 'admin' ? 'admin' : 'user';
  const groups = (req.headers.get('x-user-groups') || 'application-users')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
  const email = req.headers.get('x-user-email') || (role === 'admin' ? 'admin@project.local' : 'user@project.local');
  const fullName = req.headers.get('x-user-name') || (role === 'admin' ? 'Security & Knowledge Admin' : 'Standard Operator');
  const branchCode = req.headers.get('x-user-branch') || (role === 'admin' ? 'HQ-001' : 'BR-001');

  return { id, email, fullName, role, groups, branchCode };
}

export function requireAdmin(req: NextRequest): SessionUser {
  const user = getAuthenticatedUser(req);
  if (user.role !== 'admin') {
    throw Object.assign(new Error('Forbidden: administrator role required'), { statusCode: 403 });
  }
  return user;
}
