'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/chanakya/AppShell';
import {
  Plus,
  MessageSquare,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Send,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  Printer,
  Globe,
  Zap,
  ShieldCheck,
  Download
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
  sources?: any[];
  routedMode?: 'fast_path_faq' | 'web_search_fallback' | 'internal_knowledge';
  supervisorReasoning?: string;
}

interface ActiveDoc {
  id: string;
  title: string;
}

/**
 * Formatted message component that strips messy *** artifacts,
 * highlights direct answers, and offers clean structured output.
 */
function FormattedChatMessage({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  // Clean out excessive asterisks and horizontal rules
  const cleanContent = content
    .replace(/\*{3,}/g, '')
    .replace(/_{3,}/g, '')
    .trim();

  // If message contains structured Direct Answer
  const isDirectAnswer = cleanContent.toLowerCase().includes('direct answer:');
  const isLong = cleanContent.length > 500;
  const displayedContent = !expanded && isLong ? cleanContent.slice(0, 400) + '...' : cleanContent;

  // Split lines and render cleanly
  const lines = displayedContent.split('\n').filter((l) => l.trim().length > 0);

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Highlight Direct Answer prefix
        if (trimmed.startsWith('**Direct Answer:**') || trimmed.startsWith('Direct Answer:')) {
          const answerText = trimmed.replace(/\*\*Direct Answer:\*\*|Direct Answer:/i, '').trim();
          return (
            <div
              key={idx}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs sm:text-sm font-medium text-emerald-300 leading-relaxed"
            >
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-400 mb-1">
                <Sparkles className="h-3 w-3" />
                <span>Direct Answer</span>
              </div>
              <span>{answerText}</span>
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('&bull;')) {
          const bulletText = trimmed.replace(/^[•\-*]|\&bull;/, '').trim();
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 text-xs sm:text-sm leading-relaxed">
              <span className="text-[var(--silver)] mt-1 shrink-0">&bull;</span>
              <div>{renderFormattedText(bulletText)}</div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm leading-relaxed">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}

      {/* Expand / Collapse for long technical replies */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--silver)] hover:text-[var(--ivory)] underline underline-offset-4 transition"
        >
          {expanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              <span>View Full Details &amp; Steps</span>
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

function renderFormattedText(text: string) {
  // Simple bold and citation chip parser
  const parts = text.split(/(\*\*.*?\*\*|\[\d+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--ivory)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^\[\d+\]$/.test(part)) {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex items-center rounded-md border border-[var(--panel-border)] bg-[var(--base-mid)] px-1.5 py-0.2 text-[10px] font-mono text-[var(--silver)]"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [activeDoc, setActiveDoc] = useState<ActiveDoc | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [user, setUser] = useState<{ fullName?: string; avatar?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user session profile for avatar
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

  // Initialize active document from URL or localStorage
  useEffect(() => {
    const paramDocId = searchParams?.get('docId');
    const paramDocTitle = searchParams?.get('docTitle');

    if (paramDocId && paramDocTitle) {
      const doc = { id: paramDocId, title: decodeURIComponent(paramDocTitle) };
      setActiveDoc(doc);
      localStorage.setItem('chanakya_active_doc', JSON.stringify(doc));
      initWelcomeMessage(doc);
    } else {
      const savedDoc = localStorage.getItem('chanakya_active_doc');
      if (savedDoc) {
        try {
          const parsed = JSON.parse(savedDoc);
          setActiveDoc(parsed);
          initWelcomeMessage(parsed);
        } catch {
          initDefaultWelcome();
        }
      } else {
        // Fetch user documents if available
        fetch('/api/v1/documents')
          .then((res) => res.json())
          .then((data) => {
            if (data.documents && data.documents.length > 0) {
              const latest = data.documents[0];
              const doc = { id: latest.id, title: latest.title };
              setActiveDoc(doc);
              initWelcomeMessage(doc);
            } else {
              initDefaultWelcome();
            }
          })
          .catch(() => initDefaultWelcome());
      }
    }

    // Check if a Quick-Ask chip query was passed in URL
    const paramQuestion = searchParams?.get('question');
    if (paramQuestion) {
      const decodedQ = decodeURIComponent(paramQuestion);
      setTimeout(() => {
        handleSend(decodedQ);
      }, 500);
    }
  }, [searchParams]);

  function initWelcomeMessage(doc: ActiveDoc) {
    setMessages([
      {
        role: 'assistant',
        content: `I have loaded **${doc.title}**. Ask any question to extract exact procedures, summaries, and page citations.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        routedMode: 'internal_knowledge'
      }
    ]);
  }

  function initDefaultWelcome() {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I am Chanakya, your AI knowledge assistant. Ask any question below to explore the knowledge base or query your documents directly.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        routedMode: 'internal_knowledge'
      }
    ]);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveToUserChatHistory = (query: string, reply: string, docTitle?: string) => {
    try {
      const raw = localStorage.getItem('chanakya_chat_history');
      const history = raw ? JSON.parse(raw) : [];
      const item = {
        id: `chat-${Date.now()}`,
        title: query.length > 55 ? query.slice(0, 55) + '...' : query,
        preview: reply.replace(/\*{2,}/g, '').replace(/<[^>]*>?/gm, '').slice(0, 130) + '...',
        date: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        queriesCount: 2,
        status: 'Resolved',
        docTitle: docTitle || undefined
      };
      const updated = [item, ...history.filter((h: any) => h.title !== item.title)].slice(0, 30);
      localStorage.setItem('chanakya_chat_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: text, time: userTime }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: activeDoc ? { documentId: activeDoc.id, documentTitle: activeDoc.title } : {}
        })
      });
      const data = await res.json();
      const reply = data.answer || 'I could not find an answer in the current knowledge base.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources,
          routedMode: data.routedMode || (data.fastPath ? 'fast_path_faq' : 'internal_knowledge'),
          supervisorReasoning: data.supervisorReasoning
        }
      ]);

      // Save to real user chat history
      saveToUserChatHistory(text, reply, activeDoc?.title);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the knowledge base service.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleExportChatPdf = () => {
    if (messages.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const turnsHtml = messages
      .map((m) => {
        const isUser = m.role === 'user';
        const badgeLabel =
          m.routedMode === 'fast_path_faq'
            ? '⚡ Instant Verified FAQ (<2ms)'
            : m.routedMode === 'web_search_fallback'
            ? '🌐 Web-Assisted Knowledge Fallback'
            : '🏢 Grounded Internal RRF Retrieval';

        const sourcesHtml =
          m.sources && m.sources.length > 0
            ? `<div style="margin-top: 10px; font-size: 10px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                 <strong>Verified Citations:</strong> ${m.sources
                   .map(
                     (s: any) =>
                       `${s.documentTitle || 'Knowledge Source'} (p. ${s.pageNumber || 1} &bull; ${s.headingPath || ''})`
                   )
                   .join(' | ')}
               </div>`
            : '';

        return `
          <div style="margin-bottom: 18px; padding: 14px 18px; border-radius: 8px; border: 1px solid ${
            isUser ? '#cbd5e1' : '#e2e8f0'
          }; background: ${isUser ? '#f8fafc' : '#ffffff'};">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; color: ${
              isUser ? '#475569' : '#0284c7'
            }; margin-bottom: 6px; text-transform: uppercase;">
              <span>${isUser ? 'User Inquiry' : 'Chanakya AI Response'}</span>
              <span style="font-size: 10px; color: #94a3b8;">${m.time || ''}</span>
            </div>
            ${
              !isUser
                ? `<div style="display: inline-block; font-size: 9px; padding: 2px 6px; border-radius: 4px; background: #e0f2fe; color: #0369a1; margin-bottom: 8px; font-weight: 600;">${badgeLabel}</div>`
                : ''
            }
            <div style="font-size: 12px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">
              ${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
            ${sourcesHtml}
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Chanakya AI Dialogue Transcript - ${activeDoc?.title || 'Knowledge Base Session'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 36px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 20px; color: #0f172a; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #64748b; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; }
            .badge { display: inline-block; padding: 3px 8px; font-size: 10px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: 600; margin-bottom: 12px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <span class="badge">Chanakya AI Knowledge Assistant &bull; Dialogue Export</span>
          <h1>AI Dialogue Session Report</h1>
          <div class="meta">
            Target Context: <strong>${
              activeDoc ? activeDoc.title : 'Enterprise Knowledge Base'
            }</strong> &bull; Generated: ${new Date().toLocaleString()} &bull; Total Exchanges: ${messages.length}
          </div>
          <div>${turnsHtml}</div>
          <div class="footer">Exported from Chanakya AI Knowledge Assistant &bull; Verified Retrieval-Augmented Grounding</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  function handleCopy(text: string, idx: number) {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  const defaultFaqChips = [
    'What document formats are supported?',
    'How does hybrid search work?',
    'How do page citations work?',
    'How do I upload a document?',
    'How can I export my summary as PDF?',
    'How does Chanakya ensure data security?'
  ];

  const suggestionChips = activeDoc
    ? [
        `Summarize ${activeDoc.title}`,
        'What are the key points in this document?',
        'What are the requirements & steps?',
        'Explain the core procedures',
        ...defaultFaqChips.slice(0, 2)
      ]
    : defaultFaqChips;

  const userInitial = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
        {/* Main Dialogue Panel */}
        <div className="flex-1 flex flex-col luminary-panel rounded-3xl overflow-hidden border border-[var(--panel-border)] bg-[var(--base-surface)]">
          {/* Top Dialogue Bar */}
          <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-6 py-4 bg-[var(--base-mid)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-soft)] p-1.5 shadow-sm">
                <img
                  src="/assets/avatars/avatar-happy.svg"
                  alt="Chanakya"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[var(--ivory)]">Chanakya Dialogue Engine</h2>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono uppercase text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-[var(--slate-warm)]">
                  {activeDoc ? `Active Document: ${activeDoc.title}` : 'Querying entire knowledge base'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportChatPdf}
                title="Export full conversation dialogue as PDF"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition shadow-sm"
              >
                <Printer className="h-3.5 w-3.5 stroke-[2]" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => {
                  if (activeDoc) initWelcomeMessage(activeDoc);
                  else initDefaultWelcome();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--panel-border)] bg-[var(--base-soft)] px-3 py-1.5 text-xs font-medium text-[var(--slate-light)] hover:text-[var(--ivory)] hover:border-[var(--silver)]/40 transition"
              >
                <Trash2 className="h-3.5 w-3.5 text-[var(--slate-warm)] stroke-[2]" />
                <span>Clear Chat</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-1">
                {m.role === 'user' ? (
                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-2xl rounded-2xl border border-[var(--panel-border)] bg-[var(--base-soft)] p-4 text-xs sm:text-sm leading-relaxed text-[var(--ivory)] shadow-sm">
                      <p>{m.content}</p>
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--slate-warm)] to-[var(--silver)] text-[var(--base-deep)] font-bold text-xs overflow-hidden shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="User Avatar" className="h-full w-full object-contain" />
                      ) : (
                        userInitial
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1.5 shadow-sm">
                      <img
                        src="/assets/avatars/avatar-happy.svg"
                        alt="Chanakya"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="max-w-3xl space-y-2">
                      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[var(--ivory)] shadow-sm backdrop-blur-md">
                        {/* Supervisor Routing Mode & Agent Badge */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 pb-2.5 border-b border-[var(--panel-border)]/60">
                          {m.routedMode === 'fast_path_faq' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono text-amber-300 font-semibold shadow-sm">
                              <Zap className="h-3 w-3 stroke-[2.5]" />
                              <span>⚡ Instant Verified FAQ (&lt;2ms)</span>
                            </span>
                          ) : m.routedMode === 'web_search_fallback' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-mono text-sky-300 font-semibold shadow-sm">
                              <Globe className="h-3 w-3 stroke-[2]" />
                              <span>🌐 Web Knowledge Grounding Fallback</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold shadow-sm">
                              <ShieldCheck className="h-3 w-3 stroke-[2]" />
                              <span>🏢 Grounded Internal Hybrid RRF</span>
                            </span>
                          )}
                          {m.supervisorReasoning && (
                            <span className="text-[10px] text-[var(--slate-warm)] truncate max-w-xs hidden sm:inline">
                              &bull; {m.supervisorReasoning}
                            </span>
                          )}
                        </div>

                        <FormattedChatMessage content={m.content} />

                        {/* Citations / Sources if present */}
                        {m.sources && m.sources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[var(--panel-border)] space-y-2">
                            <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--silver)] flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3" />
                              <span>Verified Document Citations</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {m.sources.map((src, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--panel-border)] bg-[var(--base-soft)] px-3 py-1 text-[10px] text-[var(--slate-light)]"
                                >
                                  <span className="font-semibold text-[var(--silver)]">
                                    p. {src.pageNumber || '1'}
                                  </span>
                                  <span>&bull;</span>
                                  <span className="truncate max-w-[200px]">{src.headingPath || src.documentTitle}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center gap-3 pl-2 text-[var(--slate-warm)] text-xs">
                        <button
                          onClick={() => handleCopy(m.content, idx)}
                          className="hover:text-[var(--ivory)] transition flex items-center gap-1"
                          title="Copy message"
                        >
                          <Copy className="h-3.5 w-3.5 stroke-[2]" />
                          <span>{copiedIndex === idx ? 'Copied' : ''}</span>
                        </button>
                        <button className="hover:text-emerald-400 transition" title="Helpful response">
                          <ThumbsUp className="h-3.5 w-3.5 stroke-[2]" />
                        </button>
                        <button className="hover:text-rose-400 transition" title="Not helpful">
                          <ThumbsDown className="h-3.5 w-3.5 stroke-[2]" />
                        </button>
                        <button onClick={() => handleSend(m.content)} className="hover:text-[var(--silver)] transition" title="Regenerate">
                          <RotateCcw className="h-3.5 w-3.5 stroke-[2]" />
                        </button>
                        {m.time && <span className="text-[10px] text-[var(--slate-warm)] ml-auto">{m.time}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1.5 shadow-sm">
                  <img src="/assets/avatars/avatar-thinking.svg" alt="Thinking" className="h-full w-full object-contain animate-pulse" />
                </div>
                <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 text-xs text-[var(--slate-light)] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--silver)] animate-ping"></span>
                  <span>Synthesizing concise, direct answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Reply FAQ & Suggestion Chips (Inspired by faqs_chatbot & Text_Summarizer_ChatBot) */}
          <div className="px-6 py-2.5 border-t border-[var(--panel-border)]/60 bg-[var(--base-mid)]/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--silver)] shrink-0 flex items-center gap-1 pr-1 border-r border-[var(--panel-border)]">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Quick Ask</span>
            </span>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap rounded-full border border-[var(--panel-border)] bg-[var(--base-soft)] px-3 py-1 text-[11px] text-[var(--slate-light)] hover:text-[var(--ivory)] hover:border-[var(--silver)]/50 hover:bg-[var(--base-surface)] transition shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input */}
          <div className="p-4 border-t border-[var(--panel-border)] bg-[var(--base-mid)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any question concisely (e.g. key steps, error codes, summaries)..."
                className="flex-1 rounded-2xl border border-[var(--panel-border)] bg-[var(--base-deep)]/80 px-4 py-3 text-xs sm:text-sm text-[var(--ivory)] placeholder-[var(--slate-warm)] focus:border-[var(--silver)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--silver)] to-[var(--ivory)] text-[var(--base-deep)] shadow-md transition hover:brightness-110 disabled:opacity-40"
              >
                <Send className="h-4 w-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[var(--slate-warm)]">Loading Chanakya Dialogue...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
