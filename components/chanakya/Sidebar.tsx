'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  UploadCloud,
  Database,
  Folder,
  History,
  Settings,
  X,
  ChevronRight,
  Shield,
  User
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{
    fullName: string;
    role: string;
    branchCode: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Ask Questions', href: '/chat', icon: MessageSquare },
    { name: 'Upload Document', href: '/upload', icon: UploadCloud },
    { name: 'Knowledge Base', href: '/knowledge', icon: Database },
    { name: 'My Documents', href: '/documents', icon: Folder },
    { name: 'Chat History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  const handleOpenUserModal = () => {
    if (onClose) onClose();
    window.dispatchEvent(new CustomEvent('open-user-modal'));
  };

  const currentAvatar = user?.avatar || '/assets/avatars/avatar-happy.svg';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--panel-border)] bg-[var(--base-mid)] backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1 shadow-sm">
              <img
                src={currentAvatar}
                alt="Chanakya Logo"
                className="h-full w-full object-contain"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[var(--base-mid)] bg-emerald-500"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold tracking-wider uppercase text-[var(--ivory)]">
                  Chanakya
                </span>
              </div>
              <p className="text-[10px] tracking-widest uppercase font-medium text-[var(--slate-warm)]">
                Knowledge Assistant
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--panel-border)] text-[var(--slate-light)] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--base-soft)] text-[var(--ivory)] border border-[var(--panel-border)] shadow-sm'
                    : 'text-[var(--slate-light)] hover:bg-[var(--base-soft)]/50 hover:text-[var(--ivory)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors stroke-[2] ${
                      isActive
                        ? 'text-[var(--silver)]'
                        : 'text-[var(--slate-warm)] group-hover:text-[var(--ivory-muted)]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--silver)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile Card -> triggers Profile Popup Modal */}
        <div className="border-t border-[var(--panel-border)] p-4">
          <button
            type="button"
            onClick={handleOpenUserModal}
            className="w-full flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--base-soft)]/60 p-2.5 text-left transition-all duration-300 hover:border-[var(--silver)]/40 hover:bg-[var(--base-soft)]"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--base-mid)] p-0.5 shadow-sm overflow-hidden">
                {user ? (
                  <img
                    src={currentAvatar}
                    alt="Mascot"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <User className="h-4 w-4 text-[var(--silver)]" />
                )}
              </div>
              <div className="max-w-[110px] truncate">
                <p className="text-xs font-semibold text-[var(--ivory)] truncate">
                  {user ? user.fullName : 'Guest User'}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--slate-warm)]">
                  {user ? `${user.role} &bull; ${user.branchCode}` : 'Click to Sign In'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--slate-warm)]" />
          </button>
        </div>
      </aside>
    </>
  );
}
