'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/chanakya/AppShell';
import { Plus, Search, ArrowRight } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const knowledgeCategories = [
    {
      title: 'Reports & Branch Reconciliation',
      description: 'Resolution guides for duplicate records, daily batch reconciliation, and financial auditing.',
      module: 'Reports',
      chunksCount: 3,
      docsCount: 1,
      color: 'border-blue-200 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20'
    },
    {
      title: 'Administration & User Management',
      description: 'Role-based access permissions, SSO configuration, and ERR_SSO_CLAIM_MISMATCH resolution.',
      module: 'Users',
      chunksCount: 3,
      docsCount: 1,
      color: 'border-purple-200 bg-purple-50/40 dark:border-purple-900/40 dark:bg-purple-950/20'
    },
    {
      title: 'API & Technical SQL Mappings',
      description: 'Endpoint routes, error codes, database table definitions, and SQL deduplication functions.',
      module: 'API & SQL',
      chunksCount: 3,
      docsCount: 1,
      color: 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
    }
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Knowledge Base</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Browse approved, ground-truth documentation collections indexed with dense vector embeddings.
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Collection</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400 stroke-[2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across all knowledge modules, procedures, and troubleshooting codes..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs sm:text-sm shadow-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Knowledge Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {knowledgeCategories.map((cat, i) => (
            <div
              key={i}
              className={`flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 hover:shadow-md ${cat.color}`}
            >
              <div>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                  {cat.module}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4 text-xs text-slate-500 dark:border-slate-800">
                <span>{cat.chunksCount} Vector Chunks</span>
                <Link
                  href="/chat"
                  className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Explore in Chat</span>
                  <ArrowRight className="h-3 w-3 stroke-[2]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
