'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  X,
  ChevronRight,
  FileText,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Copy,
  Check,
  Send
} from 'lucide-react';

interface SourceCitation {
  id: string;
  documentTitle?: string;
  section?: string;
  headingPath?: string;
  version?: number;
  url: string;
  content?: string;
}

interface MessageItem {
  role: 'user' | 'assistant';
  content?: string;
  answer?: string;
  status?: string;
  messageId?: string;
  sources?: SourceCitation[];
  cached?: boolean;
  provider?: string;
  clarification?: {
    options: Array<{ label: string; query: string }>;
  };
  escalation?: {
    available: boolean;
    url: string;
    label: string;
    summary: string;
  };
}

export function AssistantWidget({
  moduleHint = 'Knowledge Assistant',
  pageHint = 'Chanakya Hub'
}: {
  moduleHint?: string;
  pageHint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [previewSource, setPreviewSource] = useState<any | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});
  const [copiedEscalation, setCopiedEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  async function submitQuestion(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          context: { module: moduleHint, page: pageHint }
        })
      });
      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', ...data }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          status: 'error',
          answer: 'Unable to connect to the assistant server. Please check your network or contact support.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendFeedback(messageId: string, rating: 'helpful' | 'not_helpful') {
    setFeedbackSent((prev) => ({ ...prev, [messageId]: rating }));
    try {
      await fetch('/api/assistant/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, rating })
      });
    } catch (e) {
      console.error('Feedback error', e);
    }
  }

  function handleCopySummary(summary: string) {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(summary);
      setCopiedEscalation(true);
      setTimeout(() => setCopiedEscalation(false), 2500);
    }
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 font-sans">
      {/* Floating Launcher Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Chanakya AI Assistant"
          className="group relative flex items-center gap-3 rounded-full border border-[var(--panel-border)] bg-[var(--base-mid)] px-4 sm:px-5 py-2.5 sm:py-3 text-[var(--ivory)] shadow-xl shadow-black/30 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-[var(--silver)]/40 active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
          </span>
          <div className="flex items-center gap-2">
            <img src="/assets/avatars/avatar-happy.svg" alt="Chanakya" className="h-5 w-5 object-contain" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--ivory)]">Ask Chanakya</span>
          </div>
          <span className="ml-1 rounded-full border border-[var(--panel-border)] bg-[var(--base-soft)] px-2 py-0.5 text-[9px] font-mono tracking-widest text-[var(--slate-warm)]">
            Ctrl+K
          </span>
        </button>
      )}

      {/* Main Assistant Modal */}
      {open && (
        <div
          role="dialog"
          aria-label="Documentation Support Assistant"
          className="flex h-[80vh] sm:h-[620px] w-[92vw] sm:w-[440px] max-w-[440px] flex-col overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--base-mid)]/95 shadow-2xl backdrop-blur-2xl transition-all duration-500 text-[var(--ivory)]"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-[var(--panel-border)] bg-[var(--base-deep)]/90 px-5 py-4 text-[var(--ivory)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-soft)] p-1">
                <img src="/assets/avatars/avatar-happy.svg" alt="Chanakya" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-wider uppercase text-[var(--ivory)]">Chanakya AI</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono uppercase text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-[var(--slate-warm)] uppercase tracking-wider">{moduleHint} &bull; {pageHint}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Assistant"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--base-soft)] text-[var(--slate-warm)] hover:text-[var(--ivory)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto p-4 text-sm scroll-smooth">
            {messages.length === 0 && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4 text-slate-800 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-800/30 dark:text-slate-200">
                  <div className="flex items-center gap-2 font-semibold text-blue-950 dark:text-blue-300">
                    <Sparkles className="h-4 w-4 text-blue-600 stroke-[2]" />
                    <span>Suggested Questions for {moduleHint}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Click any query below to run grounded RRF retrieval against indexed documentation:
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      onClick={() => submitQuestion('How do I solve duplicate records in Branch Summary?')}
                      className="group flex items-center justify-between rounded-xl border border-blue-200/60 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60"
                    >
                      <span>How do I solve duplicate records in Branch Summary?</span>
                      <ChevronRight className="h-3.5 w-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity stroke-[2]" />
                    </button>
                    <button
                      onClick={() => submitQuestion('How do I fix ERR_SSO_CLAIM_MISMATCH?')}
                      className="group flex items-center justify-between rounded-xl border border-blue-200/60 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60"
                    >
                      <span>How do I fix ERR_SSO_CLAIM_MISMATCH?</span>
                      <ChevronRight className="h-3.5 w-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity stroke-[2]" />
                    </button>
                    <button
                      onClick={() => submitQuestion('What API routes are available for branch reporting?')}
                      className="group flex items-center justify-between rounded-xl border border-blue-200/60 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60"
                    >
                      <span>What API routes are available for branch reporting?</span>
                      <ChevronRight className="h-3.5 w-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div key={idx} className={`space-y-1.5 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none dark:bg-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content || m.answer}</p>
                  {m.cached && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Answered instantly from semantic version cache</span>
                    </div>
                  )}
                </div>

                {/* Clarification Options */}
                {m.clarification?.options && m.clarification.options.length > 0 && (
                  <div className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
                    <span className="font-semibold text-amber-900 dark:text-amber-300">
                      Please clarify which module or topic you mean:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.clarification.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => submitQuestion(opt.query)}
                          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 shadow-sm transition hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-800 dark:text-amber-200 dark:hover:bg-slate-700"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Sources / Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-blue-600 stroke-[2]" />
                      <span>Verified Sources:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((s) => (
                        <button
                          key={s.id}
                          onClick={async () => {
                            try {
                              const r = await fetch(s.url);
                              if (r.ok) setPreviewSource(await r.json());
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 hover:border-blue-300 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                          <FileText className="h-3 w-3 stroke-[2]" />
                          <span>{s.section || 'Source'}</span>
                          <span className="rounded bg-blue-200/60 px-1 py-0.2 text-[9px] text-blue-900 font-mono">
                            v{s.version || 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Actions */}
                {m.role === 'assistant' && m.messageId && (
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                    {feedbackSent[m.messageId] ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Feedback recorded
                      </span>
                    ) : (
                      <>
                        <span>Was this helpful?</span>
                        <button
                          onClick={() => sendFeedback(m.messageId!, 'helpful')}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-emerald-50 hover:text-emerald-600 transition"
                        >
                          <ThumbsUp className="h-3 w-3 stroke-[2]" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => sendFeedback(m.messageId!, 'not_helpful')}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <ThumbsDown className="h-3 w-3 stroke-[2]" />
                          <span>No</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Escalation & Support Handover */}
                {m.escalation?.available && m.status !== 'answered' && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-950 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4 text-amber-600 stroke-[2]" />
                      <span>Need Further Help?</span>
                    </div>
                    <p className="mt-1 text-slate-700 dark:text-slate-300">
                      This question is not fully resolved in published documentation. You can copy the generated diagnostic summary and escalate to our support desk.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={() => handleCopySummary(m.escalation!.summary)}
                        className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
                      >
                        {copiedEscalation ? <Check className="h-3.5 w-3.5 stroke-[2]" /> : <Copy className="h-3.5 w-3.5 stroke-[2]" />}
                        <span>{copiedEscalation ? 'Copied to Clipboard' : 'Copy Support Summary'}</span>
                      </button>
                      <a
                        href={m.escalation.url}
                        className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 transition dark:border-amber-800 dark:bg-slate-800 dark:text-amber-200"
                      >
                        Open Support Page &rarr;
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800 w-fit">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></span>
                </span>
                <span>Searching documentation and grounding facts...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Source Preview Drawer */}
          {previewSource && (
            <div className="border-t border-blue-200 bg-blue-50/95 p-4 text-xs transition-all dark:border-slate-700 dark:bg-slate-800/90">
              <div className="flex items-center justify-between font-semibold text-blue-950 dark:text-blue-300">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-600 stroke-[2]" />
                  <span>
                    {previewSource.title} &mdash; {previewSource.headingPath} (v{previewSource.version})
                  </span>
                </div>
                <button
                  onClick={() => setPreviewSource(null)}
                  className="rounded px-2 py-0.5 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-slate-700 font-medium"
                >
                  Close
                </button>
              </div>
              <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-blue-200/50 bg-white p-2.5 text-slate-700 font-mono text-[11px] leading-relaxed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {previewSource.content}
              </div>
            </div>
          )}

          {/* Footer Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuestion(input);
            }}
            className="border-t border-[var(--panel-border)] bg-[var(--base-deep)]/90 p-3.5"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={4000}
                placeholder="Ask about documentation, errors, steps..."
                className="flex-1 rounded-xl border border-[var(--panel-border)] bg-[var(--base-soft)] px-3.5 py-2.5 text-xs text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send query"
                className="luminary-btn-primary !p-2.5 !rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 stroke-[2]" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--slate-warm)]">
              <span>Answers are verified against active documentation.</span>
              <a href="/chat" className="text-[var(--silver)] hover:underline uppercase tracking-wider">
                Full Dialogue
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
