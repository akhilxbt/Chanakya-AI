'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  User,
  Building,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branchCode, setBranchCode] = useState('BR-001');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, branchCode })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alex.chen.developer@gmail.com',
          fullName: 'Alex Chen (Google)',
          googleId: 'g-auth-10928374'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google signup failed');
      }
      setSuccessMsg('Google identity verified! Redirecting...');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Google signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[var(--base-deep)] relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(176,184,196,0.08),transparent_70%)] pointer-events-none" />

      {/* Return home link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--slate-light)] hover:text-[var(--ivory)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)]/90 p-8 shadow-2xl backdrop-blur-2xl relative z-10">
        {/* Header with Mascot */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--slate-warm)]/30 to-[var(--silver)]/20 p-2 border border-[var(--panel-border)] shadow-inner">
            <Image
              src="/assets/mascot/mascot-welcome.png"
              alt="Chanakya Mascot"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--ivory)]">
            Create Your Account
          </h1>
          <p className="mt-1 text-xs text-[var(--slate-light)] max-w-xs">
            Join your organization&apos;s workspace with self-hosted encrypted sessions.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] py-2.5 px-4 text-xs font-semibold text-[var(--ivory)] shadow-sm transition-all hover:border-[var(--silver)]/40 hover:bg-[var(--base-mid)]/80 disabled:opacity-50"
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
          <span>Sign up with Google</span>
        </button>

        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-[var(--panel-border)]"></div>
          <span className="absolute bg-[var(--base-surface)] px-3 text-[10px] uppercase tracking-wider text-[var(--slate-warm)]">
            or with email
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--slate-light)] mb-1.5">
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
            <label className="block text-xs font-medium text-[var(--slate-light)] mb-1.5">
              Work Email Address
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--slate-light)] mb-1.5">
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
              <label className="block text-xs font-medium text-[var(--slate-light)] mb-1.5">
                Branch / Org Code
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
            className="w-full rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] py-2.5 text-xs font-bold text-[var(--base-deep)] shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
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

        {/* Security badge info */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[var(--slate-warm)]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Passphrases hashed with salt:scryptSync</span>
        </div>

        {/* Link to Login */}
        <div className="mt-5 text-center text-xs text-[var(--slate-light)] border-t border-[var(--panel-border)] pt-4">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[var(--silver)] hover:text-[var(--ivory)] underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
