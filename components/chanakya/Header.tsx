'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Code2, Bell, Moon, Sun, Menu } from 'lucide-react';
import { UserWindow } from '@/components/auth/UserWindow';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [isLight, setIsLight] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Document Ingestion Complete',
      desc: 'Webex Recordings Exporter User and Technical Guide was indexed into pgvector with 23 pages.',
      time: '10m ago',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Supervisor Query Router Active',
      desc: 'Multi-intent routing enabled with instant FAQ fast-path and live web fallback.',
      time: '25m ago',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'API Gateway Ready',
      desc: 'CORS & REST endpoints are active for external project summarization & Q&A integration.',
      time: '1h ago',
      unread: false
    }
  ]);

  useEffect(() => {
    // Check initial preference from localStorage or html class
    const savedTheme = localStorage.getItem('chanakya-theme');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light');
    } else {
      setIsLight(false);
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('chanakya-theme', 'dark');
      setIsLight(false);
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('chanakya-theme', 'light');
      setIsLight(true);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 sm:px-6 lg:px-8 backdrop-blur-xl transition-colors duration-500">
      <div className="flex items-center gap-3 w-full max-w-md">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] text-[var(--slate-light)] hover:text-[var(--ivory)] hover:border-[var(--silver)]/40 lg:hidden transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--slate-warm)]">
            <Search className="h-4 w-4 stroke-[2]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, entities, knowledge base..."
            className="w-full rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)]/60 py-2 pl-10 pr-4 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] transition-all duration-300 focus:border-[var(--silver)] focus:bg-[var(--base-mid)] focus:outline-none focus:ring-1 focus:ring-[var(--silver)]/30"
          />
        </div>
      </div>

      {/* Right Controls: Dark/Light Mode Switcher, SDK Link & User Window */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isLight ? 'Switch to Luminary Dark' : 'Switch to Luminary Light'}
          aria-label="Toggle Dark and Light Mode"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)]/80 text-[var(--slate-light)] transition-transform duration-300 hover:scale-105 hover:text-[var(--ivory)]"
        >
          {isLight ? (
            <Moon className="h-4 w-4 stroke-[2]" />
          ) : (
            <Sun className="h-4 w-4 stroke-[2]" />
          )}
        </button>

        {/* Quick Embed Guide Link */}
        <Link
          href="/embed-demo"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)]/80 px-3.5 py-1.5 text-xs font-medium text-[var(--ivory-muted)] transition-all duration-300 hover:border-[var(--silver)]/40 hover:text-[var(--ivory)]"
        >
          <Code2 className="h-3.5 w-3.5 stroke-[2] text-[var(--silver)]" />
          <span>Embed Widget SDK</span>
        </Link>

        {/* Notification Bell with Interactive Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            aria-label="Notifications"
            title="View Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)]/80 text-[var(--slate-light)] transition-transform duration-300 hover:scale-105 hover:text-[var(--ivory)]"
          >
            <Bell className="h-4 w-4 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          {/* Backdrop dismissal */}
          {showNotifications && (
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setShowNotifications(false)}
            />
          )}

          {/* Interactive Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--panel-border)] bg-[var(--base-surface)] p-4 shadow-2xl backdrop-blur-xl z-50 luminary-panel animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-[var(--panel-border)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ivory)]">Notifications</span>
                  <span className="rounded-full bg-[var(--base-soft)] px-2 py-0.5 text-[10px] font-mono text-[var(--silver)]">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                    setUnreadCount(0);
                  }}
                  className="text-[11px] text-[var(--silver)] hover:text-[var(--ivory)] transition"
                >
                  Mark all as read
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      n.unread
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-[var(--panel-border)] bg-[var(--base-mid)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--ivory)] leading-snug">{n.title}</p>
                      <span className="text-[10px] font-mono text-[var(--slate-warm)] shrink-0">{n.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--slate-light)] leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--panel-border)] text-center">
                <Link
                  href="/history"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold text-[var(--silver)] hover:text-[var(--ivory)] hover:underline transition"
                >
                  View full activity history &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account Window (Popup Modal & Trigger) */}
        <UserWindow />
      </div>
    </header>
  );
}
