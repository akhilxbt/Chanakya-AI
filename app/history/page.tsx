'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/chanakya/AppShell';
import { Plus, MessageSquare, Clock, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  preview: string;
  date: string;
  queriesCount: number;
  status: string;
  docTitle?: string;
}

export default function ChatHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load real conversation history created by the user
    const saved = localStorage.getItem('chanakya_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
    setLoading(false);
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('chanakya_chat_history');
    setHistory([]);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ivory)]">Chat History</h1>
            <p className="mt-1 text-xs text-[var(--slate-light)]">
              Your real conversation dialogues and questions asked to Chanakya.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </button>
            )}
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] px-4 py-2 text-xs font-bold text-[var(--base-deep)] shadow-md hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Start New Chat</span>
            </Link>
          </div>
        </div>

        {/* History List or Empty State */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--slate-warm)]">
            Loading your dialogue history...
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--base-surface)] shadow-sm transition hover:border-[var(--silver)]/40 hover:bg-[var(--base-surface)] gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-[var(--ivory)]">{item.title}</h3>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {item.status || 'Active'}
                    </span>
                    {item.docTitle && (
                      <span className="rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)] px-2.5 py-0.5 text-[10px] text-[var(--slate-light)]">
                        {item.docTitle}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--slate-light)] line-clamp-1">{item.preview}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--slate-warm)] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.date}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {item.queriesCount} messages exchanged
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/chat?dialogueId=${item.id}`}
                    className="rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] px-3.5 py-2 text-xs font-semibold text-[var(--silver)] hover:text-[var(--ivory)] hover:border-[var(--silver)]/40 transition"
                  >
                    Resume Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)] p-12 text-center">
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--base-mid)] p-3 border border-[var(--panel-border)] shadow-sm">
              <Image
                src="/assets/mascot/mascot-welcome.png"
                alt="Chanakya Mascot"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h3 className="text-base font-bold text-[var(--ivory)]">No Conversations Recorded Yet</h3>
            <p className="mt-1 text-xs text-[var(--slate-light)] max-w-sm">
              Old sample dialogues have been cleared. As you interact with Chanakya and ask questions about your documents, your dialogue history will appear here.
            </p>
            <Link
              href="/chat"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] px-5 py-2.5 text-xs font-bold text-[var(--base-deep)] shadow-md hover:brightness-110 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Start Your First Dialogue</span>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
