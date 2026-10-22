'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { SplashScreen } from '@/components/chanakya/SplashScreen';
import { RefreshCw, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

export default function SplashDemoPage() {
  const [key, setKey] = useState(0);

  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[var(--ivory)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(176,184,196,0.1),transparent_70%)] pointer-events-none" />

      {/* Force-shown Splash Screen instance */}
      <SplashScreen key={key} forceShow={true} />

      {/* Control panel shown after splash screen finishes or fades */}
      <div className="relative z-10 max-w-md w-full rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)] p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)] px-3 py-1 text-xs font-semibold text-[var(--silver)] mb-4">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Splash Screen Controller</span>
        </div>

        <h1 className="text-xl font-bold text-[var(--ivory)] mb-2">
          Chanakya Launch Sequence
        </h1>
        <p className="text-xs text-[var(--slate-light)] mb-6 leading-relaxed">
          The introductory splash screen plays automatically when any new visitor or tab launches the application. You can preview and replay it below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleReplay}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] px-5 py-2.5 text-xs font-bold text-[var(--base-deep)] shadow-lg hover:brightness-110 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Replay Splash Screen</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] px-5 py-2.5 text-xs font-semibold text-[var(--slate-light)] hover:text-[var(--ivory)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Workspace</span>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--panel-border)] flex items-center justify-center gap-2 text-[11px] text-[var(--slate-warm)]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Auto-stores session acknowledgment to avoid repetitive prompts</span>
        </div>
      </div>
    </div>
  );
}
