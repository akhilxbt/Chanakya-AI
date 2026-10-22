// @ts-ignore
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  userAuthStore,
  DEFAULT_AUTH_SECRET,
  UserAuthStore
} from './session.mjs';

export interface UserSessionPayload {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  groups: string[];
  branchCode: string;
  designation?: string;
  avatar?: string;
  exp?: number;
}

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'user' | 'admin';
  accessGroups: string[];
  branchCode: string;
  googleId?: string | null;
  picture?: string | null;
  createdAt: string;
}

export {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  userAuthStore,
  DEFAULT_AUTH_SECRET,
  UserAuthStore
};
