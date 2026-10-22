import React from 'react';
import './globals.css';

export const metadata = {
  title: 'AI Documentation Support Assistant | RAG Next.js 14',
  description: 'Grounded RAG Support Assistant backed by PostgreSQL + pgvector, hybrid reciprocal rank fusion, and verifiable citations.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

