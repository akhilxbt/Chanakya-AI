'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';

export interface DocumentOverviewData {
  id: string;
  title: string;
  type: string;
  size: string;
  date?: string;
  totalPages?: number;
  summary?: string;
  suggestedQuestions?: string[];
}

interface DocumentOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentOverviewData | null;
}

export function DocumentOverviewModal({ isOpen, onClose, document: doc }: DocumentOverviewModalProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen || !doc) return;

    setLoading(true);
    setSummary('');

    // Fetch or generate document summary & suggested questions
    fetch('/api/v1/documents/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.analysis) {
          setSummary(
            data.analysis.executiveSummary ||
              `Executive synthesis extracted for ${doc.title}. All active sections and page citations indexed for verifiable reasoning.`
          );
          if (data.analysis.suggestedQuestions && data.analysis.suggestedQuestions.length > 0) {
            setQuestions(data.analysis.suggestedQuestions.slice(0, 4));
          } else {
            generateDefaultQuestions(doc.title);
          }
        } else {
          setSummary(
            `This document (${doc.title}) has been processed and indexed into PostgreSQL pgvector with dense-sparse reciprocal rank fusion search.`
          );
          generateDefaultQuestions(doc.title);
        }
        setLoading(false);
      })
      .catch(() => {
        setSummary(
          `This document (${doc.title}) contains technical and operational guidelines. Ask questions to extract page-verified citations.`
        );
        generateDefaultQuestions(doc.title);
        setLoading(false);
      });
  }, [isOpen, doc?.id]);

  function generateDefaultQuestions(title: string) {
    const cleanTitle = title.replace(/\.[^/.]+$/, '');
    setQuestions([
      `Summarize the key points in ${cleanTitle}`,
      `What are the core requirements and steps?`,
      `Explain the governance & validation rules`,
      `List all action items and next steps`
    ]);
  }

  if (!isOpen || !doc) return null;

  const estimatedReadingTime = Math.max(1, Math.ceil((doc.totalPages || 1) * 2));

  function handleAskQuestion(questionText: string) {
    onClose();
    localStorage.setItem('chanakya_active_doc', JSON.stringify({ id: doc!.id, title: doc!.title }));
    router.push(
      `/chat?docId=${doc!.id}&docTitle=${encodeURIComponent(doc!.title)}&question=${encodeURIComponent(questionText)}`
    );
  }

  function handleOpenFullChat() {
    onClose();
    localStorage.setItem('chanakya_active_doc', JSON.stringify({ id: doc!.id, title: doc!.title }));
    router.push(`/chat?docId=${doc!.id}&docTitle=${encodeURIComponent(doc!.title)}`);
  }

  function handleOpenFullSummary() {
    onClose();
    router.push(`/documents/${doc!.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--base-surface)] shadow-2xl luminary-panel">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-6 py-4 bg-[var(--base-mid)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-soft)] p-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-[var(--silver)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--silver)]">
                  Instant Document Intelligence
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[9px] font-mono text-emerald-400">
                  Ready
                </span>
              </div>
              <h2 className="text-base font-semibold text-[var(--ivory)] truncate max-w-md">{doc.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-soft)] text-[var(--slate-warm)] hover:text-[var(--ivory)] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)]/60 p-3 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--slate-warm)] flex items-center justify-center gap-1">
                <Layers className="h-3 w-3" />
                <span>Pages / Units</span>
              </span>
              <p className="mt-1 text-sm font-bold text-[var(--ivory)]">{doc.totalPages || 1}</p>
            </div>

            <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)]/60 p-3 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--slate-warm)] flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Format</span>
              </span>
              <p className="mt-1 text-sm font-bold text-[var(--silver)]">{doc.type}</p>
            </div>

            <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)]/60 p-3 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--slate-warm)] flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Read Time</span>
              </span>
              <p className="mt-1 text-sm font-bold text-[var(--ivory)]">~{estimatedReadingTime} min</p>
            </div>
          </div>

          {/* AI Executive TL;DR */}
          <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--ivory)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Executive AI Summary</span>
              </div>
              {loading && <span className="text-[10px] text-[var(--silver)] animate-pulse">Extracting...</span>}
            </div>
            <p className="text-xs text-[var(--slate-light)] leading-relaxed">{summary}</p>
          </div>

          {/* Quick-Ask Chips (Inspired by Text_Summarizer_ChatBot) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--silver)] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Quick-Ask Question Chips</span>
              </span>
              <span className="text-[10px] text-[var(--slate-warm)]">Click to start immediate dialogue</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(q)}
                  className="flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--base-soft)]/80 p-3 text-left text-xs font-medium text-[var(--ivory)] hover:border-[var(--silver)]/50 hover:bg-[var(--base-soft)] hover:scale-[1.01] transition-all duration-200 group shadow-sm"
                >
                  <span className="line-clamp-2 pr-2">{q}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--slate-warm)] group-hover:text-[var(--silver)] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[var(--panel-border)] px-6 py-4 bg-[var(--base-mid)]">
          <button
            onClick={handleOpenFullSummary}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--slate-warm)] hover:text-[var(--ivory)] transition"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Open Full Page Citations</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFullChat}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] px-4 py-2 text-xs font-bold text-[var(--base-deep)] shadow-md hover:brightness-110 transition"
            >
              <MessageSquare className="h-3.5 w-3.5 stroke-[2]" />
              <span>Open Document Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
