'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/chanakya/AppShell';
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  FileUp,
  AlertCircle
} from 'lucide-react';

interface UploadedItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'Processed' | 'Processing';
  totalPages?: number;
}

export default function UploadDocumentPage() {
  const router = useRouter();
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's uploaded documents on mount
  useEffect(() => {
    fetch('/api/v1/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          const formatted = data.documents.map((d: any) => ({
            id: d.id,
            name: d.title,
            type: d.type || 'PDF',
            size: d.size || '1.8 MB',
            date: d.date || 'Recent',
            status: 'Processed',
            totalPages: d.totalPages || 1
          }));
          setItems(formatted);
        } else {
          // Check localStorage fallback
          const saved = localStorage.getItem('chanakya_user_docs');
          if (saved) {
            try {
              setItems(JSON.parse(saved));
            } catch {
              setItems([]);
            }
          }
        }
      })
      .catch(() => {
        setItems([]);
      });
  }, []);

  // Save to localStorage when items change
  const saveItems = (newItems: UploadedItem[]) => {
    setItems(newItems);
    localStorage.setItem('chanakya_user_docs', JSON.stringify(newItems));
  };

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);
    setUploading(true);
    setUploadProgress(15);
    setUploadStage('Reading file binary and structure...');

    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';

    const tempId = `doc-${Date.now()}`;
    const newItem: UploadedItem = {
      id: tempId,
      name: file.name,
      type: ext,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      date: 'Just now',
      status: 'Processing',
      totalPages: 1
    };

    saveItems([newItem, ...items]);

    try {
      const progressTimer = setTimeout(() => {
        setUploadProgress(45);
        setUploadStage('Extracting document pages & text stream...');
      }, 500);

      const progressTimer2 = setTimeout(() => {
        setUploadProgress(75);
        setUploadStage('Computing 768-dim semantic vectors & citations...');
      }, 1200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('moduleKey', 'User Uploads');

      const res = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData
      });

      clearTimeout(progressTimer);
      clearTimeout(progressTimer2);

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setUploadProgress(100);
      setUploadStage('Indexing complete! Document ready for dialogue.');

      // Update item in list
      const resolvedId = data.document?.id || tempId;
      const updatedList = [
        {
          ...newItem,
          id: resolvedId,
          name: data.document?.title || file.name,
          status: 'Processed' as const,
          totalPages: data.document?.totalPages || 1
        },
        ...items.filter((it) => it.id !== tempId)
      ];
      saveItems(updatedList);

      // Store as the active document in session
      localStorage.setItem(
        'chanakya_active_doc',
        JSON.stringify({
          id: resolvedId,
          title: data.document?.title || file.name
        })
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error uploading document.');
      setItems((prev) => prev.filter((it) => it.id !== tempId));
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadStage('');
      }, 1400);
    }
  }

  async function handleDelete(id: string) {
    const updated = items.filter((it) => it.id !== id);
    saveItems(updated);
    try {
      await fetch(`/api/v1/documents?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete warning:', e);
    }
  }

  async function handleClearAll() {
    if (!confirm('Are you sure you want to remove all uploaded documents?')) return;
    saveItems([]);
    localStorage.removeItem('chanakya_active_doc');
    try {
      await fetch('/api/v1/documents', { method: 'DELETE' });
    } catch (e) {
      console.warn('Clear error:', e);
    }
  }

  function startChatWithDoc(doc: UploadedItem) {
    localStorage.setItem(
      'chanakya_active_doc',
      JSON.stringify({ id: doc.id, title: doc.name })
    );
    router.push(`/chat?docId=${doc.id}&docTitle=${encodeURIComponent(doc.name)}`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Title & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-light tracking-tight text-[var(--ivory)]">
              Document Ingestion &amp; <strong className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--ivory)] via-[var(--silver)] to-[var(--slate-light)]">Knowledge Base</strong>
            </h1>
            <p className="mt-1 text-xs text-[var(--slate-warm)]">
              Upload your PDF, DOCX, or text files to extract full text and query with verified page citations.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="luminary-btn-secondary !py-2 !px-3.5 !text-xs self-start sm:self-auto text-rose-400 border-rose-500/20 hover:border-rose-500/40"
            >
              <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
              <span>Clear Old Documents</span>
            </button>
          )}
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-500 luminary-panel ${
            isDragging
              ? 'border-[var(--silver)] bg-[var(--base-soft)] scale-[1.01]'
              : 'border-[var(--panel-border)] hover:border-[var(--silver)]/50'
          }`}
        >
          <div className="flex h-24 w-24 items-center justify-center transition-transform duration-500 hover:scale-105">
            {uploading ? (
              <img
                src="/assets/mascot/mascot-processing.png"
                alt="Processing Document"
                className="h-full w-full object-contain animate-pulse"
              />
            ) : (
              <img
                src="/assets/mascot/mascot-upload.png"
                alt="Upload PDF"
                className="h-full w-full object-contain drop-shadow-md"
              />
            )}
          </div>

          <h2 className="mt-3 text-base font-semibold tracking-wide text-[var(--ivory)]">
            {uploading ? 'Processing & Indexing Document with Gemini...' : 'Drag & drop your PDF file here'}
          </h2>

          <p
            className="mt-1 text-xs text-[var(--silver)] cursor-pointer hover:underline uppercase tracking-wider font-semibold"
            onClick={() => fileInputRef.current?.click()}
          >
            browse from your computer
          </p>

          <p className="mt-2 text-[11px] text-[var(--slate-warm)]">
            Multi-Format Ingestion: PDF, DOCX, PPTX, CSV, JSON, Markdown, and TXT
          </p>

          {/* Format Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {['PDF', 'DOCX', 'PPTX', 'CSV', 'JSON', 'TXT / MD'].map((fmt) => (
              <span
                key={fmt}
                className="rounded-lg border border-[var(--panel-border)] bg-[var(--base-mid)] px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--silver)]"
              >
                {fmt}
              </span>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.csv,.tsv,.json,.txt,.md"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          {/* Animated Multi-Stage Progress Stepper */}
          {uploading && (
            <div className="w-full max-w-lg mt-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-[var(--slate-light)] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {uploadStage}
                </span>
                <span className="font-bold text-[var(--ivory)]">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--base-deep)] border border-[var(--panel-border)]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-[var(--silver)] to-[var(--ivory)] transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>

              {/* 4 Agentic Pipeline Steps */}
              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-[var(--slate-warm)] text-center pt-1">
                <span className={uploadProgress >= 15 ? 'text-emerald-400 font-bold' : ''}>1. Parse Binary</span>
                <span className={uploadProgress >= 45 ? 'text-emerald-400 font-bold' : ''}>2. Extract Slides/Rows</span>
                <span className={uploadProgress >= 75 ? 'text-emerald-400 font-bold' : ''}>3. Vector Embed</span>
                <span className={uploadProgress >= 100 ? 'text-emerald-400 font-bold' : ''}>4. Verified RAG</span>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Documents List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ivory)]">
              Active Documents ({items.length})
            </h2>
            {items.length > 0 && (
              <span className="text-[11px] text-[var(--slate-warm)]">
                Click &ldquo;Ask Questions&rdquo; to start dialogue
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="luminary-panel rounded-3xl p-10 text-center space-y-3">
              <img
                src="/assets/mascot/mascot-offline.png"
                alt="No active documents"
                className="h-20 w-20 mx-auto object-contain opacity-70"
              />
              <h3 className="text-sm font-semibold text-[var(--ivory)]">No documents currently uploaded</h3>
              <p className="text-xs text-[var(--slate-warm)] max-w-sm mx-auto">
                Old mock files have been removed. Upload your real PDF document above and Chanakya will index it for grounded reasoning.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--panel-border)] rounded-3xl luminary-panel overflow-hidden">
              {items.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4 transition hover:bg-[var(--base-soft)]/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] p-1.5">
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
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xs font-semibold text-[var(--ivory)]">{doc.name}</h3>
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{doc.status}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--slate-warm)] mt-0.5">
                        {doc.type} &bull; {doc.size} &bull; {doc.date}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this document */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => startChatWithDoc(doc)}
                      className="luminary-btn-primary !py-1.5 !px-3.5 !text-xs font-semibold"
                    >
                      <MessageSquare className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Ask Questions</span>
                    </button>

                    <Link
                      href={`/documents/${doc.id}`}
                      className="luminary-btn-secondary !py-1.5 !px-3 !text-xs font-medium"
                    >
                      <FileText className="h-3.5 w-3.5 stroke-[2]" />
                      <span>Summary</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      title="Remove Document"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--base-mid)] text-[var(--slate-warm)] hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 stroke-[2]" />
                    </button>
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
