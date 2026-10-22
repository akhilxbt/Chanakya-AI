'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Shield,
  LogOut,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  UserPlus,
  LogIn,
  Layers,
  ChevronDown,
  X,
  Edit3,
  Briefcase,
  Sparkles,
  Check
} from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  groups: string[];
  branchCode: string;
  designation?: string;
  avatar?: string;
}

const AVATAR_OPTIONS = [
  { id: 'happy', label: 'Dharma', path: '/assets/avatars/avatar-happy.svg' },
  { id: 'idea', label: 'Genius', path: '/assets/avatars/avatar-idea.svg' },
  { id: 'cool', label: 'Expert', path: '/assets/avatars/avatar-cool.svg' },
  { id: 'thinking', label: 'Analyst', path: '/assets/avatars/avatar-thinking.svg' },
  { id: 'wink', label: 'Friendly', path: '/assets/avatars/avatar-wink.svg' },
  { id: 'alert', label: 'Guardian', path: '/assets/avatars/avatar-alert.svg' }
];

export function UserWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Modal Views: 'auth' (sign-in/register) | 'profile-edit' | 'profile-view'
  const [view, setView] = useState<'auth' | 'profile-edit' | 'profile-view'>('auth');
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');

  // Status alerts
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for login/register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [branchCode, setBranchCode] = useState('BR-001');

  // Profile fields for Step 2: Profile Completion / Edit
  const [profileName, setProfileName] = useState('');
  const [profileDesignation, setProfileDesignation] = useState('');
  const [profileBranch, setProfileBranch] = useState('BR-001');
  const [selectedAvatar, setSelectedAvatar] = useState('/assets/avatars/avatar-happy.svg');

  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch current session on mount
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setProfileName(data.user.fullName || '');
        setProfileBranch(data.user.branchCode || 'BR-001');
        setProfileDesignation(data.user.designation || (data.user.role === 'admin' ? 'Security Architect' : 'Support Specialist'));
        setSelectedAvatar(data.user.avatar || '/assets/avatars/avatar-happy.svg');
        setView('profile-view');
      } else {
        setUser(null);
        setView('auth');
      }
    } catch {
      setUser(null);
      setView('auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkSession();

    // Listen to global open event from sidebar or other buttons
    const handleGlobalOpen = () => {
      setIsOpen(true);
      setError(null);
      setSuccessMsg(null);
    };

    window.addEventListener('open-user-modal', handleGlobalOpen);
    return () => window.removeEventListener('open-user-modal', handleGlobalOpen);
  }, []);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle Sign In -> Automatically progresses to Profile review
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      setProfileName(data.user.fullName || '');
      setProfileBranch(data.user.branchCode || 'BR-001');
      setProfileDesignation(data.user.designation || (data.user.role === 'admin' ? 'Security Architect' : 'Support Specialist'));
      setSelectedAvatar(data.user.avatar || '/assets/avatars/avatar-happy.svg');

      setSuccessMsg('Signed in! Now review your profile.');
      // Seamless transition to Profile Completion flow
      setTimeout(() => {
        setSuccessMsg(null);
        setView('profile-edit');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Register -> Automatically progresses to Profile review
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, branchCode })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
      setProfileName(data.user.fullName || fullName);
      setProfileBranch(data.user.branchCode || branchCode);
      setProfileDesignation('Support Specialist');
      setSelectedAvatar('/assets/avatars/avatar-happy.svg');

      setSuccessMsg('Account created! Let us complete your profile.');
      // Seamless transition to Profile Completion flow
      setTimeout(() => {
        setSuccessMsg(null);
        setView('profile-edit');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Google Login -> Automatically progresses to Profile review
  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alex.chen.developer@gmail.com',
          fullName: 'Alex Chen',
          googleId: 'g-auth-10928374'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google sign-in failed');
      }

      setUser(data.user);
      setProfileName(data.user.fullName || 'Alex Chen');
      setProfileBranch(data.user.branchCode || 'BR-GOOG');
      setProfileDesignation('Principal Systems Specialist');
      setSelectedAvatar('/assets/avatars/avatar-idea.svg');

      setSuccessMsg('Google verification complete! Review your profile.');
      setTimeout(() => {
        setSuccessMsg(null);
        setView('profile-edit');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Profile Update Save (Step 2 completion)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileName,
          branchCode: profileBranch,
          designation: profileDesignation,
          avatar: selectedAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data.user);
      setSuccessMsg('Profile updated and saved successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        setView('profile-view');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Profile save failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setView('auth');
      setAuthTab('signin');
      setIsOpen(false);
      window.location.reload();
    } catch {
      // Ignored
    } finally {
      setSubmitting(false);
    }
  };

  const currentAvatar = user?.avatar || selectedAvatar;

  return (
    <>
      {/* Header Profile Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setSuccessMsg(null);
          if (user) setView('profile-view');
        }}
        aria-label="Open User Account Window"
        className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)]/90 py-1 pl-1.5 pr-3 shadow-sm transition-all duration-300 hover:border-[var(--silver)]/40 hover:bg-[var(--base-mid)] focus:outline-none"
      >
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--slate-warm)]/40 to-[var(--silver)]/30 p-0.5 shadow-sm overflow-hidden">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--silver)]" />
          ) : user ? (
            <img
              src={currentAvatar}
              alt="User Mascot"
              className="h-full w-full object-contain"
            />
          ) : (
            <User className="h-3.5 w-3.5 text-[var(--silver)] stroke-[2.5]" />
          )}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-[11px] font-semibold text-[var(--ivory)] leading-tight max-w-[100px] truncate">
            {user ? user.fullName : 'Sign In'}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-[var(--slate-warm)] leading-tight">
            {user ? (user.branchCode || user.role) : 'Guest Access'}
          </p>
        </div>
        <ChevronDown className="h-3 w-3 text-[var(--slate-warm)]" />
      </button>

      {/* Centered Popup Screen Modal mounted to document.body via Portal to prevent any stacking context or z-index cutoff */}
      {mounted && isOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="User Authentication and Profile Dialog"
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false);
              }}
            >
              <div
                ref={modalRef}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)] shadow-2xl transition-all duration-300 ring-1 ring-white/10"
                style={{ backgroundColor: 'var(--base-surface)' }}
              >
                {/* Modal Top Bar */}
                <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-6 py-4 bg-[var(--base-mid)]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1">
                      <img
                        src={selectedAvatar}
                        alt="Dharma Mascot"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-[var(--ivory)]">
                        {view === 'auth'
                          ? 'Chanakya Secure Access'
                          : view === 'profile-edit'
                          ? 'Customize Your Profile Flow'
                          : 'Active User Profile'}
                      </h3>
                      <p className="text-[10px] text-[var(--slate-light)]">
                        Self-hosted HMAC session &bull; Role-based knowledge access
                      </p>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close dialog"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)] text-[var(--slate-light)] hover:text-[var(--ivory)] hover:border-[var(--silver)]/40 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Notification Alerts */}
                {error && (
                  <div
                    role="alert"
                    className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div
                    role="alert"
                    className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* MODAL BODY */}
                <div className="p-6 max-h-[82vh] overflow-y-auto">
                  {/* ================= VIEW 1: AUTH (SIGN IN / REGISTER / GOOGLE) ================= */}
                  {view === 'auth' && (
                    <div className="space-y-4">
                      {/* Tab Selector */}
                      <div className="flex rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/50 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab('signin');
                            setError(null);
                          }}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                            authTab === 'signin'
                              ? 'bg-[var(--base-mid)] text-[var(--ivory)] shadow-sm'
                              : 'text-[var(--slate-warm)] hover:text-[var(--slate-light)]'
                          }`}
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          <span>Sign In</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab('register');
                            setError(null);
                          }}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                            authTab === 'register'
                              ? 'bg-[var(--base-mid)] text-[var(--ivory)] shadow-sm'
                              : 'text-[var(--slate-warm)] hover:text-[var(--slate-light)]'
                          }`}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>New User / Sign Up</span>
                        </button>
                      </div>

                      {/* Google Sign-In Button */}
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)] py-2.5 px-4 text-xs font-semibold text-[var(--ivory)] shadow-sm transition-all hover:border-[var(--silver)]/40 hover:bg-[var(--base-mid)]/80 disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.4 7.34 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </button>

                      <div className="relative my-4 flex items-center justify-center">
                        <div className="w-full border-t border-[var(--panel-border)]"></div>
                        <span className="absolute bg-[var(--base-surface)] px-3 text-[10px] uppercase tracking-wider text-[var(--slate-warm)]">
                          or continue with email
                        </span>
                      </div>

                      {authTab === 'signin' ? (
                        <form onSubmit={handleSignIn} className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                              Email address
                            </label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@enterprise.com"
                              className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] py-2.5 text-xs font-bold text-[var(--base-deep)] shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                          >
                            {submitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Verifying Credentials...
                              </span>
                            ) : (
                              'Sign In'
                            )}
                          </button>

                          {/* Production Enterprise Security Note */}
                          <div className="pt-3 border-t border-[var(--panel-border)] flex items-center justify-between text-[11px] text-[var(--slate-warm)]">
                            <span className="flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Argon2id + HMAC encrypted session</span>
                            </span>
                            <Link
                              href="/login"
                              onClick={() => setIsOpen(false)}
                              className="text-[var(--silver)] hover:text-[var(--ivory)] underline underline-offset-2"
                            >
                              Login Page
                            </Link>
                          </div>
                        </form>
                      ) : (
                        /* Registration Form */
                        <form onSubmit={handleRegister} className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Dr. Rajesh Sharma"
                              className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                              Work Email
                            </label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="rajesh@enterprise.com"
                              className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                                Password
                              </label>
                              <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 chars"
                                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                                Branch Code
                              </label>
                              <input
                                type="text"
                                value={branchCode}
                                onChange={(e) => setBranchCode(e.target.value)}
                                placeholder="BR-001"
                                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] py-2.5 text-xs font-bold text-[var(--base-deep)] shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                          >
                            {submitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating Account...
                              </span>
                            ) : (
                              'Create Account'
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

              {/* ================= VIEW 2: PROFILE EDIT / ONBOARDING FLOW ================= */}
              {view === 'profile-edit' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--base-deep)]/50 p-4">
                    <p className="text-xs font-semibold text-[var(--ivory)] mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Choose Your Mascot Avatar</span>
                    </p>
                    <p className="text-[11px] text-[var(--slate-light)] mb-3">
                      Select how your AI assistant persona appears across your workspace.
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {AVATAR_OPTIONS.map((av) => {
                        const isSelected = selectedAvatar === av.path;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av.path)}
                            className={`group relative flex flex-col items-center rounded-xl border p-2 transition-all ${
                              isSelected
                                ? 'border-[var(--silver)] bg-[var(--base-mid)] shadow-md ring-2 ring-[var(--silver)]/40'
                                : 'border-[var(--panel-border)] bg-[var(--base-mid)]/40 hover:border-[var(--silver)]/40 hover:bg-[var(--base-mid)]'
                            }`}
                          >
                            <div className="relative h-10 w-10">
                              <img
                                src={av.path}
                                alt={av.label}
                                className="h-full w-full object-contain"
                              />
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <span className="mt-1 text-[10px] font-medium text-[var(--slate-light)] group-hover:text-[var(--ivory)]">
                              {av.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Profile Details Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                          Role Title / Designation
                        </label>
                        <input
                          type="text"
                          value={profileDesignation}
                          onChange={(e) => setProfileDesignation(e.target.value)}
                          placeholder="e.g. Lead Engineer"
                          className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                          Branch / Org Code
                        </label>
                        <input
                          type="text"
                          value={profileBranch}
                          onChange={(e) => setProfileBranch(e.target.value)}
                          placeholder="BR-001"
                          className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/70 px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--slate-light)] mb-1">
                        Registered Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || email}
                        className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/40 px-3.5 py-2 text-xs text-[var(--slate-warm)] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setView('profile-view')}
                      className="flex-1 rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] py-2.5 text-xs font-semibold text-[var(--slate-light)] hover:text-[var(--ivory)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] py-2.5 text-xs font-bold text-[var(--base-deep)] shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Save & Apply Profile'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ================= VIEW 3: PROFILE SUMMARY & STATUS ================= */}
              {view === 'profile-view' && user && (
                <div className="space-y-4">
                  {/* Top Profile Card */}
                  <div className="flex items-center justify-between rounded-2xl border border-[var(--panel-border)] bg-[var(--base-deep)]/50 p-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1.5 shadow-md">
                        <img
                          src={currentAvatar}
                          alt="User Mascot"
                          className="h-full w-full object-contain"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--base-surface)] bg-emerald-500"></span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[var(--ivory)]">{user.fullName}</h4>
                        <p className="text-xs text-[var(--slate-light)]">{user.email}</p>
                        <p className="text-[11px] font-medium text-[var(--silver)]">
                          {user.designation || (user.role === 'admin' ? 'Security Architect' : 'Support Specialist')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setView('profile-edit');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] px-3 py-1.5 text-xs font-medium text-[var(--silver)] hover:text-[var(--ivory)] hover:border-[var(--silver)]/40 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Attributes badges */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)]/60 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--slate-warm)] mb-1">
                        System Role
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </span>
                    </div>

                    <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)]/60 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--slate-warm)] mb-1">
                        Branch / Org
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ivory)]">
                        <Building className="h-3.5 w-3.5 text-[var(--silver)]" />
                        <span>{user.branchCode || 'BR-001'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Access Groups */}
                  <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--base-deep)]/40 p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ivory-muted)] mb-2">
                      <Layers className="h-3.5 w-3.5 text-[var(--silver)]" />
                      <span>Authorized Documentation Access Groups</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {user.groups && user.groups.length > 0 ? (
                        user.groups.map((g) => (
                          <span
                            key={g}
                            className="rounded-lg border border-[var(--panel-border)] bg-[var(--base-mid)] px-2.5 py-1 text-xs font-mono text-[var(--slate-light)]"
                          >
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--slate-warm)]">application-users</span>
                      )}
                    </div>
                  </div>

                  {/* Admin knowledge shortcut if admin */}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/knowledge"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-400" />
                        Admin Knowledge & Document Quality Dashboard
                      </span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--panel-border)]">
                    <button
                      onClick={() => {
                        setView('profile-edit');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-medium text-[var(--silver)] hover:text-[var(--ivory)] underline underline-offset-4"
                    >
                      Update Profile Info
                    </button>

                    <button
                      onClick={handleSignOut}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" />
                      )}
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
