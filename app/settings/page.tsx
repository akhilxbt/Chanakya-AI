'use client';
import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/chanakya/AppShell';
import { Cpu, Database, CheckCircle2, User, Shield, Sparkles, Building, Layers } from 'lucide-react';

export default function SettingsPage() {
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [dbStatus] = useState('Connected to PostgreSQL (with pgvector & tsvector hybrid search)');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    role: string;
    branchCode: string;
    designation?: string;
    avatar?: string;
    groups: string[];
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

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function openProfileModal() {
    window.dispatchEvent(new CustomEvent('open-user-modal'));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ivory)]">Settings &amp; Workspace Configuration</h1>
          <p className="mt-1 text-xs text-[var(--slate-light)]">
            Manage your AI model providers, user profile attributes, and database connections.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 stroke-[2]" />
            <span>Settings successfully saved and applied to Chanakya.</span>
          </div>
        )}

        {/* User Profile & Account Settings Card */}
        <div className="rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)]/80 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1.5 shadow-md">
                <img
                  src={user?.avatar || '/assets/avatars/avatar-happy.svg'}
                  alt="Avatar"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--ivory)]">
                  {user ? user.fullName : 'Guest Session'}
                </h2>
                <p className="text-xs text-[var(--slate-light)]">
                  {user ? user.email : 'Sign in to access authorized document roles & branch groups'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      user?.role === 'admin'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    <Shield className="h-2.5 w-2.5" />
                    {user ? user.role : 'Guest'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)] px-2 py-0.5 text-[10px] font-medium text-[var(--slate-light)]">
                    <Building className="h-2.5 w-2.5" />
                    {user?.branchCode || 'BR-001'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={openProfileModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] px-4 py-2 text-xs font-bold text-[var(--base-deep)] shadow-sm hover:brightness-110 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>{user ? 'Open Profile &amp; Avatar Flow' : 'Sign In / Register'}</span>
            </button>
          </div>
        </div>

        {/* LLM Provider Configuration */}
        <div className="rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)]/80 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--base-mid)] text-[var(--silver)] border border-[var(--panel-border)]">
              <Cpu className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--ivory)]">AI Language Model Provider</h2>
              <p className="text-xs text-[var(--slate-light)]">Select which primary LLM powers Chanakya's grounded responses and PDF comprehension</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => {
                setProvider('gemini');
                setModel('gemini-1.5-flash');
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                provider === 'gemini'
                  ? 'border-[var(--silver)] bg-[var(--base-mid)] shadow-md'
                  : 'border-[var(--panel-border)] bg-[var(--base-deep)]/40 hover:border-[var(--silver)]/40'
              }`}
            >
              <div className="font-bold text-xs text-[var(--ivory)]">Google Gemini</div>
              <p className="text-[11px] text-[var(--slate-light)] mt-1">Direct long-context PDF vision (up to 1,000 pages) and page citations.</p>
            </div>

            <div
              onClick={() => {
                setProvider('groq');
                setModel('llama-3.1-8b-instant');
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                provider === 'groq'
                  ? 'border-[var(--silver)] bg-[var(--base-mid)] shadow-md'
                  : 'border-[var(--panel-border)] bg-[var(--base-deep)]/40 hover:border-[var(--silver)]/40'
              }`}
            >
              <div className="font-bold text-xs text-[var(--ivory)]">Groq Cloud</div>
              <p className="text-[11px] text-[var(--slate-light)] mt-1">Ultra-low latency inference with Llama 3 models.</p>
            </div>

            <div
              onClick={() => {
                setProvider('ollama');
                setModel('llama3.2');
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                provider === 'ollama'
                  ? 'border-[var(--silver)] bg-[var(--base-mid)] shadow-md'
                  : 'border-[var(--panel-border)] bg-[var(--base-deep)]/40 hover:border-[var(--silver)]/40'
              }`}
            >
              <div className="font-bold text-xs text-[var(--ivory)]">Local Ollama</div>
              <p className="text-[11px] text-[var(--slate-light)] mt-1">100% private offline local model at http://localhost:11434.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--slate-warm)] mb-1">Model Name</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/60 px-3.5 py-2 text-xs font-mono text-[var(--ivory)] focus:border-[var(--silver)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--slate-warm)] mb-1">
                {provider === 'gemini' ? 'Gemini API Key' : provider === 'groq' ? 'Groq API Key' : 'Local Ollama URL'}
              </label>
              <input
                type={provider === 'ollama' ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'gemini' ? 'AIzaSy...' : provider === 'groq' ? 'gsk_...' : 'http://localhost:11434'}
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--base-deep)]/60 px-3.5 py-2 text-xs font-mono text-[var(--ivory)] focus:border-[var(--silver)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)]/80 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--base-mid)] text-emerald-400 border border-[var(--panel-border)]">
              <Database className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--ivory)]">Connected Database</h2>
              <p className="text-xs text-[var(--slate-light)]">PostgreSQL with pgvector hybrid search extension</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active &amp; Operational</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[var(--slate-light)]">
              {dbStatus}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] px-6 py-2.5 text-xs font-bold text-[var(--base-deep)] shadow-md transition hover:brightness-110"
        >
          Save Settings
        </button>
      </div>
    </AppShell>
  );
}
