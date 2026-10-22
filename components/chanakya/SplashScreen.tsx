'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  forceShow?: boolean;
}

export function SplashScreen({ onFinish, forceShow = false }: SplashScreenProps) {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Initializing Chanakya AI Engine...');

  useEffect(() => {
    // Only show once per session unless forceShow is true
    const seen = sessionStorage.getItem('chanakya_splash_shown');
    if (seen && !forceShow) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timers: NodeJS.Timeout[] = [];

    const runSequence = () => {
      const stages = [
        { p: 35, text: 'Synchronizing semantic vector space...', delay: 250 },
        { p: 70, text: 'Loading Gemini multimodal pipeline...', delay: 650 },
        { p: 95, text: 'Verifying enterprise security policies...', delay: 1100 },
        { p: 100, text: 'Workspace ready.', delay: 1400 },
      ];

      stages.forEach((stage) => {
        const t = setTimeout(() => {
          setProgress(stage.p);
          setStatusText(stage.text);
        }, stage.delay);
        timers.push(t);
      });

      // Start fade-out at 1.7s
      const fadeTimer = setTimeout(() => {
        setFading(true);
      }, 1700);
      timers.push(fadeTimer);

      // Dismiss at 2.2s
      const finishTimer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('chanakya_splash_shown', 'true');
        if (onFinish) onFinish();
      }, 2200);
      timers.push(finishTimer);
    };

    runSequence();

    const handleReplay = () => {
      timers.forEach((t) => clearTimeout(t));
      setVisible(true);
      setFading(false);
      setProgress(10);
      setStatusText('Initializing Chanakya AI Engine...');
      runSequence();
    };

    window.addEventListener('replay-splash-screen', handleReplay);

    return () => {
      window.removeEventListener('replay-splash-screen', handleReplay);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [forceShow, onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('chanakya_splash_shown', 'true');
      if (onFinish) onFinish();
    }, 250);
  };

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chanakya Loading Screen"
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0B0D11] text-[var(--ivory)] select-none transition-opacity duration-500 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(176,184,196,0.12),transparent_70%)] pointer-events-none blur-2xl animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_70%)] pointer-events-none blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Animated Mascot Aura */}
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[var(--silver)]/20 via-[var(--slate-warm)]/10 to-transparent blur-md animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-surface)]/90 p-3 shadow-2xl backdrop-blur-xl">
            <Image
              src="/assets/mascot/mascot-welcome.png"
              alt="Chanakya AI Mascot"
              width={76}
              height={76}
              className="object-contain drop-shadow-md animate-bounce"
              style={{ animationDuration: '2.5s' }}
              priority
            />
          </div>
        </div>

        {/* Title & Brand */}
        <div className="space-y-1.5 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)]/90 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--silver)] shadow-sm">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Enterprise Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ivory)]">
            Chanakya <span className="font-normal text-[var(--silver)]">Assistant</span>
          </h1>
          <p className="text-xs text-[var(--slate-light)]">
            Autonomous RAG & Multimodal Knowledge System
          </p>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-full space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5 backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--silver)] via-[var(--ivory)] to-white transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--slate-warm)] px-0.5">
            <span className="truncate max-w-[220px]">{statusText}</span>
            <span className="font-mono text-[10px] text-[var(--slate-light)]">{progress}%</span>
          </div>
        </div>

        {/* Security verification stamp */}
        <div className="mt-8 flex items-center gap-1.5 text-[10px] text-[var(--slate-warm)]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Argon2id + HMAC encrypted verification</span>
        </div>

        {/* Skip button for instant entry */}
        <button
          type="button"
          onClick={handleSkip}
          className="mt-6 text-[11px] font-medium text-[var(--slate-light)] hover:text-[var(--ivory)] underline underline-offset-4 transition-colors"
        >
          Skip into workspace &rarr;
        </button>
      </div>
    </div>
  );
}
