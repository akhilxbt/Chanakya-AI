'use client';
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';
import { SplashScreen } from './SplashScreen';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--base-deep)] text-[var(--ivory)] transition-colors duration-500 overflow-x-hidden">
      {/* Sidebar with slideover on mobile and fixed on desktop */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Page Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full transition-all duration-300">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Click-and-Chat Widget */}
      <AssistantWidget moduleHint="Knowledge Assistant" pageHint="Chanakya Hub" />

      {/* Animated First-Load Introductory Splash Screen */}
      <SplashScreen />
    </div>
  );
}
