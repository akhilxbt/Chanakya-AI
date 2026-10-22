# Chanakya AI Chatbot

Production-grade enterprise knowledge assistant and retrieval-augmented generation (RAG) platform built with Next.js 14 App Router, PostgreSQL pgvector, deterministic citation grounding, and multi-intent query routing.

## Overview

Chanakya AI Chatbot is an end-to-end knowledge assistant designed for internal teams, operations, and customer support. It solves the critical limitations of standard chatbot implementations:
- It eliminates hallucinations through a code-level evidence gating layer and strict database citations.
- It provides a triple-engine supervisor router that handles repetitive FAQs in under 2ms, routes complex questions to hybrid semantic/keyword search, and falls back to live web grounding when internal evidence is insufficient.
- It ingests complex enterprise documentation (including multi-page PDFs, tables, schemas, spreadsheets, and slide decks) and provides page-level grounding with direct document viewing.

## Core Capabilities

### 1. Supervisor Query Router
Rather than sending every prompt directly to a large language model, Chanakya evaluates incoming queries through a supervisor router:
- Fast-Path FAQ Engine: Matches repetitive enterprise queries deterministically in less than 2 milliseconds with zero LLM latency and zero API cost.
- Internal Knowledge RAG: Combines PostgreSQL tsvector (lexical keyword search) and pgvector (768-dimensional dense semantic embeddings) using Reciprocal Rank Fusion (RRF).
- External Web Knowledge Grounding: Gracefully searches live technical documentation when internal knowledge base thresholds are not satisfied.

### 2. Multi-Format Document Ingestion
Supports direct file parsing and chunking across common enterprise file types:
- PDF: Per-page extraction preserving structure and page numbers.
- DOCX: Word document XML text and heading extraction.
- PPTX: Presentation slide parsing and topic identification.
- CSV / TSV: Tabular row-by-row entity modeling and Markdown table preview synthesis.
- JSON / Markdown / Plain Text: Native structured and unstructured ingestion.

### 3. Interactive Enterprise Document Viewer
- Page-by-Page Canvas: Renders actual extracted text, headings, and schema tables for any selected page.
- Native Table Rendering: Automatically formats database schemas, configuration parameters, and data tables into structured, high-contrast tables.
- Jump Navigation & Zoom: Direct page number input, previous/next controls, and scale adjustment.
- Dual View Modes: Seamless toggle between raw extracted page content and executive AI summaries.

### 4. Deep Document Question-Answering
- Targeted Schema Extraction: Capable of answering specific schema requests (e.g. "list all tables used in this specification") by scoring all document chunks and extracting tabular definitions.
- Typo Resilience: Normalizes query terms (e.g. schema, tables, settings, parameters) to ensure retrieval accuracy.
- Citation Verification: Every claim or table reference is cited with verified document titles and page numbers.

### 5. Headless REST API and Drop-In Widget
- Standard REST Endpoints: Exposes `/api/v1/chat`, `/api/v1/documents/summarize`, and `/api/v1/documents/upload` with full CORS preflight support for external applications.
- Drop-In Script: Embeddable single-line JavaScript snippet (`/embed/chanakya.js`) to mount a floating chat assistant on any external website.

### 6. Authentication and Security
- Self-Hosted Authentication: Cookie-based signed session tokens with bcrypt password hashing.
- Role-Aware Access Groups: Restricts sensitive documentation chunks to authorized user groups.
- Prompt Injection Sanitization: Cleans script tags, event handlers, and jailbreak patterns before vector indexing and query execution.
- LLM Provider Fallback Chain: Primary Google Gemini 1.5 Flash with automatic circuit-breaker fallback to Groq LLaMA 3.1 8B Instant if rate limits (HTTP 429) occur.

## Technology Stack

- Framework: Next.js 14 (App Router, Server Actions, Route Handlers)
- Language: TypeScript (Strict mode)
- Styling: Vanilla CSS and Tailwind CSS (Dark and Light mode)
- Vector Storage: PostgreSQL with pgvector extension
- Lexical Search: PostgreSQL full-text search (tsvector / tsquery)
- Document Parsers: unpdf, fflate
- LLM Providers: Google Gemini Flash (Primary), Groq LLaMA 3.1 (Fallback)
- Test Suite: Node.js native test runner with custom assertion framework

## Project Structure

```text
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication routes (login, register, me, logout)
│   │   └── v1/                # External REST API (chat, documents, summarize, upload)
│   ├── chat/                  # Interactive Chanakya dialogue engine page
│   ├── documents/[id]/        # Enterprise document viewer and page explorer
│   ├── embed-demo/            # Developer SDK and integration documentation
│   ├── history/               # Activity logs and conversation audit trail
│   ├── upload/                # Multi-format document ingestion interface
│   └── globals.css            # Luminary dark/light theme definitions
├── components/
│   ├── chanakya/              # AppShell, Header, DocumentOverviewModal, SplashScreen
│   └── auth/                  # UserWindow, LoginModal, RegisterModal
├── lib/
│   ├── assistant/             # RAG engine, query router, FAQ matcher, document QA
│   ├── auth/                  # Session management, JWT verification, password hashing
│   └── gemini/                # Direct document analysis and exponential backoff
├── public/
│   └── embed/                 # Standalone embeddable widget script (chanakya.js)
├── tests/                     # 13 automated test suites verifying gates and retrieval
└── db/
    └── migrations/            # SQL schema definitions for pgvector and RRF search
```

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- PostgreSQL 15+ (with pgvector extension enabled for persistent vector storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/akhilxbt/Chanakya-AI.git
   cd Chanakya-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Configure the following keys in your `.env` file:
   ```ini
   ASSISTANT_ENABLED=true
   LLM_PRIMARY_PROVIDER=gemini
   LLM_PRIMARY_MODEL=gemini-1.5-flash
   LLM_FALLBACK_PROVIDER=groq
   LLM_FALLBACK_MODEL=llama-3.1-8b-instant
   LLM_API_KEY_PRIMARY=your_gemini_api_key
   LLM_API_KEY_FALLBACK=your_groq_api_key
   DATABASE_URL=postgresql://user:password@localhost:5432/app_db
   ```

4. Run the automated test suite:
   ```bash
   npm test
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## API Reference

### 1. Chat and Question-Answering
```http
POST /api/v1/chat
Content-Type: application/json

{
  "message": "List all tables used in the document",
  "context": {
    "documentTitle": "Webex_Recordings_Exporter_User_and_Technical_Guide"
  }
}
```

### 2. Document Summarization
```http
POST /api/v1/documents/summarize
Content-Type: application/json

{
  "documentId": "optional-document-id",
  "content": "Raw markdown or technical text to summarize...",
  "fileName": "Service_Architecture.pdf"
}
```

### 3. Document Ingestion
```http
POST /api/v1/documents/upload
Content-Type: multipart/form-data

file: <binary-file>
title: "Technical Specification"
moduleKey: "Operations"
```

## Quality and Verification

The repository includes a 13-suite automated test framework (`tests/run-tests.mjs`) covering:
1. Grounded answers and database citation integrity.
2. Semantic cache hit and version signature binding.
3. Ambiguity handling and clarification chip generation.
4. Insufficient evidence gate and anti-hallucination defense.
5. Role-aware access group authorization.
6. Conversation ownership isolation (HTTP 403).
7. Prompt injection neutralization.
8. Safe ingestion validation and SHA-256 deduplication.
9. Provider fallback chain and circuit breaker resilience.
10. Follow-up query rewriting.
11. Per-user rate limiting (HTTP 429).
12. Self-hosted user registration, login, and signed session cookies.

Run the test suite anytime:
```bash
npm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
