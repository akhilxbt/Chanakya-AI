'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const [issueSummary, setIssueSummary] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [urgency, setUrgency] = useState('medium');

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <nav className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400">
            &larr; Back to Application
          </Link>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Tier-2 Technical Escalation Desk</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Escalate to Support Engineers</h1>
              <p className="text-xs text-slate-500">
                Paste the diagnostic summary from the AI Assistant below to preserve error codes, module context, and citations.
              </p>
            </div>
          </div>

          {ticketSubmitted ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-3 text-base font-bold text-emerald-950 dark:text-emerald-200">Ticket Dispatched Successfully</h2>
              <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                Support reference: <strong>TKT-2026-9481</strong>. An engineer will follow up shortly.
              </p>
              <button
                onClick={() => {
                  setTicketSubmitted(false);
                  setIssueSummary('');
                }}
                className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700"
              >
                File Another Ticket
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setTicketSubmitted(true);
              }}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">
                  AI Diagnostic &amp; Issue Summary
                </label>
                <textarea
                  required
                  rows={6}
                  value={issueSummary}
                  onChange={(e) => setIssueSummary(e.target.value)}
                  placeholder="Paste the copied issue summary (e.g. from the 'Copy Support Summary' button in the assistant modal)..."
                  className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-4 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">Severity</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="low">Low - General Inconvenience</option>
                    <option value="medium">Medium - Functional Blocker</option>
                    <option value="high">High - Batch / Data Discrepancy</option>
                    <option value="critical">Critical - System Outage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="operator@coreenterprise.internal"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99]"
              >
                Submit Escalation Ticket
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
