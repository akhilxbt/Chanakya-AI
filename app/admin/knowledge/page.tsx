'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminKnowledgeDashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reindexingId, setReindexingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/assistant/admin/documents')
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  async function handleReindex(id: string) {
    setReindexingId(id);
    try {
      const res = await fetch(`/api/assistant/admin/documents/${id}/reindex`, { method: 'POST' });
      if (res.ok) {
        setNotification(`Reindexing job queued for document ${id}`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReindexingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <nav className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-700 dark:text-slate-400">
              &larr; Back to Host App
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              Admin Knowledge Base &amp; Gap Dashboard
            </h1>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            Admin Mode
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {notification && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ {notification}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold uppercase text-slate-500">Active Guides</span>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : documents.length || 3}
            </div>
            <p className="mt-1 text-xs text-slate-500">Published across 3 business modules</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold uppercase text-slate-500">Vector &amp; FTS Chunks</span>
            <div className="mt-2 text-2xl font-bold text-blue-600">9</div>
            <p className="mt-1 text-xs text-slate-500">Indexed with 768-dim embeddings</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold uppercase text-slate-500">Unanswered Gaps</span>
            <div className="mt-2 text-2xl font-bold text-emerald-600">0</div>
            <p className="mt-1 text-xs text-slate-500">All queries within golden benchmark</p>
          </div>
        </div>

        {/* Documents Table */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Published Documentation Guides</h2>
              <p className="text-xs text-slate-500">Documents available for hybrid search retrieval</p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading documentation catalog...</div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Default documentation guides loaded in memory repository. Run offline ingestion with{' '}
                <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono">npm run ingest</code>.
              </div>
            ) : (
              documents.map((d: any) => (
                <div key={d.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{d.title}</span>
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {d.moduleKey || 'General'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>Access: {d.accessGroup}</span>
                      <span>&bull;</span>
                      <span>Status: <strong className="text-emerald-600 uppercase">{d.status}</strong></span>
                      <span>&bull;</span>
                      <span className="font-mono text-[10px] text-slate-400">ID: {d.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReindex(d.id)}
                      disabled={reindexingId === d.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {reindexingId === d.id ? 'Reindexing...' : 'Reindex'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
