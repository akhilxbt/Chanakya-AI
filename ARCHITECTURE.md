# Chanakya AI Knowledge Assistant — Technical Architecture

This document outlines the architecture, database topology, dual AI reasoning engine, and security gates of the Chanakya platform.

---

## 1. System Topology Overview

```mermaid
graph TD
    Client[Next.js App / External Web Apps via SDK] -->|HTTPS REST| AppRouter[Next.js 14 App Router Server]
    
    subgraph Core AI Services
        AppRouter -->|Dense + Sparse Hybrid RRF| PGVector[(PostgreSQL 16 + pgvector on Port 5433)]
        AppRouter -->|Whole Document Long Context| DirectGemini[Gemini Flash 1.5 Multimodal SDK]
        AppRouter -->|Vector Embeddings| EmbeddingsAPI[Google text-embedding-004]
        AppRouter -->|Asynchronous Ingestion| PGBoss[pg-boss Job Worker Queue]
    end

    subgraph Security & Policy Gates
        AppRouter --> RateLimit[Per-User Token Bucket Rate Limiter]
        AppRouter --> InjectionGuard[Prompt Injection Neutralization]
        AppRouter --> ACLGate[Role-Aware Access Group Isolation]
        AppRouter --> EvidenceGate[Ground Truth & Confidence Gate]
    end
```

---

## 2. Database Topology & Storage Layout

The platform connects to a containerized PostgreSQL instance (`pgvector-db`) operating on **port 5433** (`postgresql://postgres:akdogra@localhost:5433/app_db`).

### Schema Tables (`db/migrations/001_assistant_schema.sql`):
1. **`assistant_documents`**: Core document records with title, slug, MIME type, owner, and access group array.
2. **`assistant_document_versions`**: Version history with SHA-256 content deduplication hashes, metadata, and status.
3. **`assistant_chunks`**: Document text segments storing:
   - `embedding vector(768)` (dense representation).
   - `tsv tsvector` (sparse representation generated from content and headings).
   - `page_number` & `heading_path` for accurate citation mapping.
4. **`assistant_conversations`**: Multi-tenant user dialogue threads with title and metadata.
5. **`assistant_messages`**: Dialogue history linking questions, grounded answers, and source chunk references.
6. **`assistant_feedback`**: User thumbs-up/down ratings, corrections, and audit feedback.
7. **`assistant_semantic_cache`**: High-similarity query cache storing pre-computed answers keyed to document version hashes.
8. **`assistant_rate_limits`**: Sliding-window rate limit counters protecting the backend against abusive requests.

### Stored Procedures:
- **`assistant_hybrid_search(p_query_text, p_query_vector, p_roles, p_limit)`**:
  Executes Reciprocal Rank Fusion (RRF) combining vector cosine distance (`<=>`) with full-text search rank (`ts_rank_cd`), filtering strictly by the user's role access groups.

---

## 3. Dual AI Reasoning Engine

Chanakya employs two complementary AI engines tailored to distinct query modalities:

### Engine A: Direct Long-Context Gemini Multimodal Engine (`lib/gemini/direct-document.ts`)
- **Use Case**: Entire documents (PDF, DOCX, up to 100+ pages) requiring global synthesis, executive summaries, and page-by-page citation extraction.
- **Mechanism**: Passes document bytes directly to `models/gemini-1.5-flash` using native vision and multimodal context.
- **Resilience**: Protected with `withExponentialBackoff` retry logic handling HTTP 429 (`RESOURCE_EXHAUSTED`) with jitter.
- **Output Schema**: Returns strictly typed JSON adhering to a structured schema:
  - `executiveSummary` (string)
  - `keyPoints` (`Array<{ point: string, pageNumber: number, supportingQuote: string }>`)
  - `actionItems` (`string[]`)
  - `suggestedQuestions` (`string[]`)

### Engine B: Dense-Sparse Hybrid RAG Engine (`server/assistant/`)
- **Use Case**: Real-time interactive conversational dialogue across thousands of indexed documents.
- **Mechanism**: Computes query embeddings, queries `assistant_hybrid_search`, passes top retrieved chunks to Gemini Generative API with strict grounding system instructions.
- **Citations**: Injects exact `pageNumber`, `headingPath`, and `documentTitle` citations into every generated answer.

---

## 4. Security & Compliance Gates

1. **Prompt Injection Neutralization**:
   Incoming user prompts are scrubbed against adversarial jailbreak patterns, system prompt overrides, and unauthorized instruction leakage.
2. **Tenant & Role-Based Authorization**:
   Documents belong to access groups (e.g. `['admin', 'engineering']`). Queries only match chunks from documents the requesting user's roles permit.
3. **Conversation Isolation**:
   Attempting to read or append to another user's conversation ID yields an immediate `HTTP 403 Forbidden`.
4. **Insufficient Evidence Gate**:
   If the hybrid search similarity confidence falls below the strict relevance threshold (`< 0.65`), the model refuses to hallucinate, instead returning a helpful fallback with a direct escalation link to the Support Desk.
5. **SHA-256 Deduplication**:
   Identical documents uploaded multiple times are deduplicated at ingestion, preventing redundant embedding costs and index pollution.
