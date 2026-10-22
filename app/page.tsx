'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/chanakya/AppShell';
import {
  UploadCloud,
  MessageSquare,
  FileText,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface RecentDoc {
  id: string;
  title: string;
  type: string;
  size: string;
  date: string;
}

export default function HomePage() {
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);

  useEffect(() => {
    fetch('/api/v1/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          setRecentDocs(
            data.documents.slice(0, 5).map((d: any) => ({
              id: d.id,
              title: d.title,
              type: d.type || 'PDF',
              size: d.size || '1.8 MB',
              date: d.date || 'Recent'
            }))
          );
        } else {
          const saved = localStorage.getItem('chanakya_user_docs');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setRecentDocs(
                parsed.slice(0, 5).map((p: any) => ({
                  id: p.id,
                  title: p.name || p.title,
                  type: p.type || 'PDF',
                  size: p.size || '1.8 MB',
                  date: p.date || 'Recent'
                }))
              );
            } catch {
              setRecentDocs([]);
            }
          }
        }
      })
      .catch(() => setRecentDocs([]));
  }, []);

  const getFileIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'PDF') return '/assets/icons/icon-file-pdf.svg';
    if (t === 'DOC' || t === 'DOCX') return '/assets/icons/icon-file-doc.svg';
    if (t === 'PPT' || t === 'PPTX') return '/assets/icons/icon-file-ppt.svg';
    if (t === 'XLS' || t === 'XLSX') return '/assets/icons/icon-file-xls.svg';
    return '/assets/icons/icon-file-txt.svg';
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Luminary Hero Section with 3D Mascot Welcome */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 sm:p-12 backdrop-blur-2xl transition-all duration-700">
          <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)]/80 px-3.5 py-1 text-[11px] font-medium uppercase tracking-widest text-[var(--silver)]">
                <Sparkles className="h-3.5 w-3.5 stroke-[2] text-[var(--silver)]" />
                <span>Next-Gen Enterprise Knowledge Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-[var(--ivory)]">
                Chanakya <strong className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--ivory)] via-[var(--silver)] to-[var(--slate-light)]">Assistant</strong>
              </h1>

              <p className="text-sm sm:text-base text-[var(--slate-light)] leading-relaxed">
                Empower your organization with direct Gemini multimodal document synthesis, native vector hybrid search, and verifiable page-level citations.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Link
                  href="/upload"
                  className="luminary-btn-primary"
                >
                  <UploadCloud className="h-4 w-4 stroke-[2]" />
                  <span>Upload Your PDF</span>
                </Link>
                <Link
                  href="/chat"
                  className="luminary-btn-secondary"
                >
                  <MessageSquare className="h-4 w-4 stroke-[2]" />
                  <span>Start Dialogue</span>
                </Link>
              </div>
            </div>

            <div className="relative h-48 w-48 sm:h-56 sm:w-56 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--silver)]/20 to-transparent blur-3xl"></div>
              <img
                src="/assets/mascot/mascot-welcome.png"
                alt="Chanakya AI Mascot Welcome"
                className="relative h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* 4 Feature Action Cards with Dharma Vignettes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/upload"
            className="luminary-card group flex flex-col items-center text-center p-6"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl group-hover:scale-105 transition-transform duration-500">
              <img
                src="/assets/vignettes/vignette-reading.png"
                alt="Upload Document"
                className="h-full w-full object-contain drop-shadow-md"
              />
            </div>
            <h3 className="mt-3 text-sm font-semibold tracking-wide text-[var(--ivory)]">Upload Document</h3>
            <p className="mt-1 text-xs text-[var(--slate-warm)] leading-relaxed">
              PDF, DOCX, PPTX and plain text formats
            </p>
          </Link>

          <Link
            href="/chat"
            className="luminary-card group flex flex-col items-center text-center p-6"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl group-hover:scale-105 transition-transform duration-500">
              <img
                src="/assets/vignettes/vignette-chatting.png"
                alt="Ask Questions"
                className="h-full w-full object-contain drop-shadow-md"
              />
            </div>
            <h3 className="mt-3 text-sm font-semibold tracking-wide text-[var(--ivory)]">Ask Questions</h3>
            <p className="mt-1 text-xs text-[var(--slate-warm)] leading-relaxed">
              Real-time conversational RAG retrieval
            </p>
          </Link>

          <Link
            href="/documents"
            className="luminary-card group flex flex-col items-center text-center p-6"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl group-hover:scale-105 transition-transform duration-500">
              <img
                src="/assets/vignettes/vignette-summary.png"
                alt="Get Summary"
                className="h-full w-full object-contain drop-shadow-md"
              />
            </div>
            <h3 className="mt-3 text-sm font-semibold tracking-wide text-[var(--ivory)]">Get Summary</h3>
            <p className="mt-1 text-xs text-[var(--slate-warm)] leading-relaxed">
              Direct whole-document long-context synthesis
            </p>
          </Link>

          <Link
            href="/knowledge"
            className="luminary-card group flex flex-col items-center text-center p-6"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl group-hover:scale-105 transition-transform duration-500">
              <img
                src="/assets/vignettes/vignette-knowledge.png"
                alt="Knowledge Base"
                className="h-full w-full object-contain drop-shadow-md"
              />
            </div>
            <h3 className="mt-3 text-sm font-semibold tracking-wide text-[var(--ivory)]">Knowledge Base</h3>
            <p className="mt-1 text-xs text-[var(--slate-warm)] leading-relaxed">
              Hybrid vector cosine &amp; BM25 full-text index
            </p>
          </Link>
        </div>

        {/* Enterprise Metrics Row with Dharma Vignettes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="luminary-card p-5 flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">
              <img
                src="/assets/vignettes/vignette-security.png"
                alt="Tenant Security"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ivory)]">Strict Tenant Isolation</p>
              <p className="text-[11px] text-[var(--slate-warm)]">Role-aware ACL &amp; session security</p>
            </div>
          </div>
          <div className="luminary-card p-5 flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">
              <img
                src="/assets/vignettes/vignette-analytics.png"
                alt="Dual AI Engine"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ivory)]">Dual AI Engine</p>
              <p className="text-[11px] text-[var(--slate-warm)]">pgvector RRF + Direct Vision SDK</p>
            </div>
          </div>
          <div className="luminary-card p-5 flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">
              <img
                src="/assets/vignettes/vignette-insights.png"
                alt="Verifiable Citations"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ivory)]">Verifiable Citations</p>
              <p className="text-[11px] text-[var(--slate-warm)]">Page numbers &amp; verbatim evidence</p>
            </div>
          </div>
        </div>

        {/* Recent Ingested Documents Section */}
        <div className="luminary-panel rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-7 py-5">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--ivory)]">
              Recent Documents ({recentDocs.length})
            </h2>
            <Link
              href="/documents"
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--silver)] hover:text-[var(--ivory)] transition-colors"
            >
              <span>View All Documents</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <img
                src="/assets/mascot/mascot-offline.png"
                alt="No documents"
                className="h-20 w-20 mx-auto object-contain opacity-70"
              />
              <p className="text-xs text-[var(--slate-warm)]">No active documents uploaded yet.</p>
              <Link href="/upload" className="luminary-btn-primary !py-1.5 !px-3.5 !text-xs inline-flex">
                <UploadCloud className="h-3.5 w-3.5 mr-1" />
                Upload PDF
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--panel-border)] p-2">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl transition hover:bg-[var(--base-soft)]/50 gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1.5">
                      <img
                        src={getFileIcon(doc.type)}
                        alt={doc.type}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[var(--ivory)]">{doc.title}</h3>
                      <p className="text-[11px] text-[var(--slate-warm)] flex items-center gap-2 mt-0.5">
                        <span>{doc.type}</span>
                        <span>&bull;</span>
                        <span>{doc.size}</span>
                        <span>&bull;</span>
                        <span>{doc.date}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      href={`/chat?docId=${doc.id}&docTitle=${encodeURIComponent(doc.title)}`}
                      className="luminary-btn-primary !py-1.5 !px-3.5 !text-xs font-semibold"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Ask Questions
                    </Link>

                    <Link
                      href={`/documents/${doc.id}`}
                      className="luminary-btn-secondary !py-1.5 !px-3.5 !text-xs"
                    >
                      Summary
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
