import crypto from 'node:crypto';

export const DEFAULT_AUTH_SECRET =
  process.env.AUTH_SECRET || 'chanakya-luminary-jwt-secret-key-at-least-32-chars-token';

/**
 * Hash password using crypto.scryptSync with 16-byte random salt
 */
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against salt:derivedKey hash
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Sign session payload with HMAC-SHA256
 */
export function signSessionToken(payload, secret = DEFAULT_AUTH_SECRET) {
  const exp = payload.exp || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days expiration
  const fullPayload = { ...payload, exp };
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/**
 * Verify signed session token and return verified payload
 */
export function verifySessionToken(token, secret = DEFAULT_AUTH_SECRET) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * In-Memory & Database-Aware User Authentication Store
 */
export class UserAuthStore {
  constructor() {
    this.users = new Map();
    this.seedDefaultUsers();
  }

  seedDefaultUsers() {
    // 1. Pre-seeded Standard User
    const userPassHash = hashPassword('Password123!');
    const user = {
      id: 'user-001',
      email: 'user@project.local',
      fullName: 'Standard Operator',
      passwordHash: userPassHash,
      role: 'user',
      accessGroups: ['application-users'],
      branchCode: 'BR-001',
      createdAt: new Date().toISOString()
    };
    this.users.set(user.email.toLowerCase(), user);

    // 2. Pre-seeded Knowledge & Security Admin
    const adminPassHash = hashPassword('Admin123!');
    const admin = {
      id: 'admin-001',
      email: 'admin@project.local',
      fullName: 'Security & Knowledge Admin',
      passwordHash: adminPassHash,
      role: 'admin',
      accessGroups: ['application-users', 'internal-security-admins'],
      branchCode: 'HQ-001',
      createdAt: new Date().toISOString()
    };
    this.users.set(admin.email.toLowerCase(), admin);
  }

  findByEmail(email) {
    if (!email) return null;
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  findById(id) {
    if (!id) return null;
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  register({ email, password, fullName, branchCode = 'BR-001', role = 'user', accessGroups = ['application-users'] }) {
    if (!email || !password || !fullName) {
      throw Object.assign(new Error('Email, password and full name are required'), { statusCode: 400 });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (this.users.has(cleanEmail)) {
      throw Object.assign(new Error('An account with this email address already exists'), { statusCode: 409 });
    }
    const passwordHash = hashPassword(password);
    const id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const newUser = {
      id,
      email: cleanEmail,
      fullName: fullName.trim(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
      accessGroups: Array.isArray(accessGroups) ? accessGroups : ['application-users'],
      branchCode: branchCode?.trim() || 'BR-001',
      createdAt: new Date().toISOString()
    };
    this.users.set(cleanEmail, newUser);
    return newUser;
  }

  authenticate(email, password) {
    const user = this.findByEmail(email);
    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    return user;
  }

  authenticateGoogle({ email, fullName, googleId, picture }) {
    if (!email) throw Object.assign(new Error('Email is required for Google Sign-In'), { statusCode: 400 });
    const cleanEmail = email.toLowerCase().trim();
    let user = this.findByEmail(cleanEmail);
    if (!user) {
      // Auto-register verified Google user
      const id = `user-g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      user = {
        id,
        email: cleanEmail,
        fullName: fullName || cleanEmail.split('@')[0],
        passwordHash: hashPassword(crypto.randomBytes(32).toString('hex')),
        role: 'user',
        accessGroups: ['application-users'],
        branchCode: 'BR-GOOG',
        googleId: googleId || null,
        picture: picture || null,
        createdAt: new Date().toISOString()
      };
      this.users.set(cleanEmail, user);
    }
    return user;
  }

  updateProfile(idOrEmail, updates = {}) {
    let user = this.findById(idOrEmail) || this.findByEmail(idOrEmail);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    if (updates.fullName !== undefined && updates.fullName.trim()) {
      user.fullName = updates.fullName.trim();
    }
    if (updates.branchCode !== undefined && updates.branchCode.trim()) {
      user.branchCode = updates.branchCode.trim();
    }
    if (updates.designation !== undefined) {
      user.designation = updates.designation.trim();
    }
    if (updates.avatar !== undefined) {
      user.avatar = updates.avatar;
    }
    if (Array.isArray(updates.accessGroups)) {
      user.accessGroups = updates.accessGroups;
    }
    user.updatedAt = new Date().toISOString();
    return user;
  }

  toSessionPayload(user) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      groups: user.accessGroups || ['application-users'],
      branchCode: user.branchCode || 'BR-001',
      designation: user.designation || (user.role === 'admin' ? 'Security Architect' : 'Support Specialist'),
      avatar: user.avatar || '/assets/avatars/avatar-happy.svg'
    };
  }
}

// Global singleton for server environments
const globalRef = globalThis;
if (!globalRef.__assistantUserAuthStore) {
  globalRef.__assistantUserAuthStore = new UserAuthStore();
}

export const userAuthStore = globalRef.__assistantUserAuthStore;
