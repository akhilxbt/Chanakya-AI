'use client';
import React, { useState } from 'react';
import { AppShell } from '@/components/chanakya/AppShell';
import { Copy, Check, Terminal, Code2, Sparkles, FileText } from 'lucide-react';

export default function EmbedDemoPage() {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const scriptCode = `<script src="http://localhost:3000/embed/chanakya.js" data-api-url="http://localhost:3000"></script>`;

  const curlCode = `curl -X POST http://localhost:3000/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "What is the main purpose of this project?"
  }'`;

  function copy(text: string, type: 'script' | 'curl') {
    navigator.clipboard?.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Developer SDK &amp; Integration Guide
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Embed Chanakya In Your Website
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose between the 1-line drag-and-drop JavaScript widget or the headless REST API for custom frontends.
          </p>
        </div>

        {/* Method 1: Drop-In JavaScript Widget */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
                <Code2 className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Drop-In JavaScript Widget (&lt;script&gt;)
                </h2>
                <p className="text-xs text-slate-400">
                  Adds the floating launcher button and interactive chat window to any web application in seconds.
                </p>
              </div>
            </div>
            <button
              onClick={() => copy(scriptCode, 'script')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition dark:bg-blue-950/60 dark:text-blue-300"
            >
              {copiedScript ? <Check className="h-3.5 w-3.5 stroke-[2]" /> : <Copy className="h-3.5 w-3.5 stroke-[2]" />}
              <span>{copiedScript ? 'Copied' : 'Copy Snippet'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
            <code>{scriptCode}</code>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-slate-800 dark:text-slate-200">Zero Dependencies</span>
              <p className="text-slate-500 mt-1">Lightweight vanilla JS script that works in React, Next.js, Vue, or static HTML.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-slate-800 dark:text-slate-200">Customizable Theme</span>
              <p className="text-slate-500 mt-1">Add <code className="font-mono text-blue-600">data-theme="#2563eb"</code> to match your company's branding.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-slate-800 dark:text-slate-200">Self-Hosted Endpoint</span>
              <p className="text-slate-500 mt-1">Directs queries to your secure Docker PostgreSQL + pgvector cluster.</p>
            </div>
          </div>
        </div>

        {/* Method 2: Headless REST API */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                <Terminal className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Headless REST API Endpoint
                </h2>
                <p className="text-xs text-slate-400">
                  Build your own custom UI and integrate Chanakya into mobile apps, backend services, or Slack/Discord bots.
                </p>
              </div>
            </div>
            <button
              onClick={() => copy(curlCode, 'curl')}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              {copiedCurl ? <Check className="h-3.5 w-3.5 stroke-[2]" /> : <Copy className="h-3.5 w-3.5 stroke-[2]" />}
              <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 font-mono text-xs text-blue-300 overflow-x-auto shadow-inner leading-relaxed">
            <pre>{curlCode}</pre>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Sample JSON Response:</span>
            <pre className="font-mono text-slate-600 dark:text-slate-300 overflow-x-auto">
{`{
  "conversationId": "7df4c9a8-e1b2-4d5f-9812-789a45bc0123",
  "status": "answered",
  "answer": "**Direct Answer:** The project implements an enterprise knowledge assistant...",
  "sources": [
    {
      "id": "chunk-101",
      "documentTitle": "Webex_Recordings_Exporter_User_and_Technical_Guide",
      "headingPath": "Page 13: Tables",
      "pageNumber": 13,
      "url": "/documents/doc-123",
      "version": 1
    }
  ],
  "routedMode": "internal_knowledge"
}`}
            </pre>
          </div>
        </div>

        {/* Method 3: Instant Document Summarizer API */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                <Sparkles className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Document Summarizer &amp; Key Points API
                </h2>
                <p className="text-xs text-slate-400">
                  Pass any document ID or raw text payload from another project to generate executive summaries and page-cited key points.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner leading-relaxed">
            <pre>{`curl -X POST http://localhost:3000/api/v1/documents/summarize \\
  -H "Content-Type: application/json" \\
  -d '{
    "documentId": "optional-uploaded-doc-id",
    "content": "Raw markdown or text to summarize directly from another project...",
    "fileName": "Spec.pdf"
  }'`}</pre>
          </div>
        </div>

        {/* Method 4: Multi-Format Document Ingestion API */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20">
              <FileText className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Format Document Upload API
              </h2>
              <p className="text-xs text-slate-400">
                Upload PDF, DOCX, CSV, PPTX, JSON, or TXT directly via multipart/form-data.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 font-mono text-xs text-amber-300 overflow-x-auto shadow-inner leading-relaxed">
            <pre>{`curl -X POST http://localhost:3000/api/v1/documents/upload \\
  -F "file=@/path/to/document.pdf" \\
  -F "title=Webex Recordings Exporter" \\
  -F "moduleKey=Operations"`}</pre>
          </div>
        </div>

        {/* Architecture & Loopholes Audit Checklist */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>External Integration Architecture &amp; Loopholes Checklist</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
              <span className="font-bold text-emerald-400">1. CORS Preflight &bull; Enabled</span>
              <p className="text-slate-600 dark:text-slate-300">
                All routes (<code className="font-mono text-emerald-400">/api/v1/*</code>) implement HTTP OPTIONS preflight handlers with <code className="font-mono">Access-Control-Allow-Origin: *</code>. External browser frontends on different ports or domains can fetch without CORS blocks.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1">
              <span className="font-bold text-blue-400">2. Active Document Scoping &bull; Resolved</span>
              <p className="text-slate-600 dark:text-slate-300">
                Pass <code className="font-mono text-blue-400">context.documentId</code> or <code className="font-mono">documentTitle</code> in <code className="font-mono">/api/v1/chat</code> to scope queries to that specific document, bypassing general broad knowledge thresholds.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
              <span className="font-bold text-amber-400">3. In-Memory vs DB Persistence &bull; Loophole Note</span>
              <p className="text-slate-600 dark:text-slate-300">
                In local development or test mode, documents uploaded to memory repo reset when Next.js dev server restarts. For persistent multi-project deployment, ensure the PostgreSQL database URL is configured.
              </p>
            </div>
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-1">
              <span className="font-bold text-purple-400">4. Fallback Provider Resilience &bull; Active</span>
              <p className="text-slate-600 dark:text-slate-300">
                If Gemini Flash hits rate limits (HTTP 429), the engine automatically falls back to Groq LLaMA 3.1 8B Instant without failing the user request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
