'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/chanakya/AppShell';
import { Plus, MessageSquare, CheckCircle2, FileText, Trash2, FileUp, Sparkles } from 'lucide-react';
import { DocumentOverviewModal } from '@/components/chanakya/DocumentOverviewModal';

interface DocumentItem {
  id: string;
  title: string;
  type: string;
  size: string;
  date: string;
  status: string;
}

export default function MyDocumentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [overviewDoc, setOverviewDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    fetch('/api/v1/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          setDocuments(
            data.documents.map((d: any) => ({
              id: d.id,
              title: d.title,
              type: d.type || 'PDF',
              size: d.size || '1.8 MB',
              date: d.date || 'Recent',
              status: d.status || 'Processed'
            }))
          );
        } else {
          const saved = localStorage.getItem('chanakya_user_docs');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setDocuments(
                parsed.map((p: any) => ({
                  id: p.id,
                  title: p.name || p.title,
                  type: p.type || 'PDF',
                  size: p.size || '1.8 MB',
                  date: p.date || 'Recent',
                  status: p.status || 'Processed'
                }))
              );
            } catch {
              setDocuments([]);
            }
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setDocuments([]);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    localStorage.setItem('chanakya_user_docs', JSON.stringify(updated));
    try {
      await fetch(`/api/v1/documents?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete error', e);
    }
  }

  function startChatWithDoc(doc: DocumentItem) {
    localStorage.setItem(
      'chanakya_active_doc',
      JSON.stringify({ id: doc.id, title: doc.title })
    );
    router.push(`/chat?docId=${doc.id}&docTitle=${encodeURIComponent(doc.title)}`);
  }

  const filtered = filter === 'All' ? documents : documents.filter((d) => d.type === filter);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-light tracking-tight text-[var(--ivory)]">
              My <strong className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--ivory)] via-[var(--silver)] to-[var(--slate-light)]">Documents</strong>
            </h1>
            <p className="mt-1 text-xs text-[var(--slate-warm)]">
              Browse, inspect, and summarize your indexed knowledge base documents.
            </p>
          </div>
          <Link
            href="/upload"
            className="luminary-btn-primary !py-2.5 !px-4 !text-xs font-semibold self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Upload New Document</span>
          </Link>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 text-xs font-medium">
          {['All', 'PDF', 'DOCX', 'PPTX', 'TXT'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-3.5 py-1 text-xs transition-all duration-300 ${
                filter === item
                  ? 'border border-[var(--silver)] bg-[var(--base-soft)] text-[var(--ivory)] font-semibold shadow-sm'
                  : 'border border-[var(--panel-border)] bg-[var(--base-mid)] text-[var(--slate-warm)] hover:text-[var(--ivory)]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Document Cards Grid */}
        {filtered.length === 0 ? (
          <div className="luminary-panel rounded-3xl p-12 text-center space-y-3">
            <img
              src="/assets/mascot/mascot-offline.png"
              alt="No documents"
              className="h-20 w-20 mx-auto object-contain opacity-70"
            />
            <h3 className="text-sm font-semibold text-[var(--ivory)]">No documents indexed</h3>
            <p className="text-xs text-[var(--slate-warm)] max-w-sm mx-auto">
              You haven&apos;t uploaded any documents yet. Upload a PDF or document to start chatting and extracting summaries.
            </p>
            <Link href="/upload" className="luminary-btn-primary !py-2 !px-4 !text-xs mt-2 inline-flex">
              Upload Document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="luminary-card flex flex-col justify-between p-6 transition-all duration-500"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1.5 shadow-sm">
                      <img
                        src={
                          doc.type === 'PDF'
                            ? '/assets/icons/icon-file-pdf.svg'
                            : doc.type === 'DOCX' || doc.type === 'DOC'
                            ? '/assets/icons/icon-file-doc.svg'
                            : doc.type === 'PPTX' || doc.type === 'PPT'
                            ? '/assets/icons/icon-file-ppt.svg'
                            : '/assets/icons/icon-file-txt.svg'
                        }
                        alt={doc.type}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3 w-3 stroke-[2]" />
                      <span>{doc.status}</span>
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[var(--ivory)] truncate" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--slate-warm)]">
                    {doc.type} &bull; {doc.size} &bull; {doc.date}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="mt-6 flex items-center justify-between border-t border-[var(--panel-border)] pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOverviewDoc(doc)}
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition shadow-sm"
                      title="Instant AI Overview and Quick-Ask Chips"
                    >
                      <Sparkles className="h-3 w-3 stroke-[2]" />
                      <span>Overview</span>
                    </button>

                    <button
                      onClick={() => startChatWithDoc(doc)}
                      className="luminary-btn-primary !py-1.5 !px-3 !text-xs font-semibold"
                    >
                      <MessageSquare className="h-3 w-3 stroke-[2]" />
                      <span>Ask</span>
                    </button>

                    <Link
                      href={`/documents/${doc.id}`}
                      className="luminary-btn-secondary !py-1.5 !px-3 !text-xs font-medium"
                    >
                      <FileText className="h-3 w-3 stroke-[2]" />
                      <span>Summary</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    title="Remove document"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--base-mid)] text-[var(--slate-warm)] hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instant Document Overview & Quick-Ask Modal */}
        <DocumentOverviewModal
          isOpen={Boolean(overviewDoc)}
          onClose={() => setOverviewDoc(null)}
          document={overviewDoc}
        />
      </div>
    </AppShell>
  );
}
