# Chanakya AI Knowledge Assistant — System Execution Flows

This document details the complete end-to-end execution flows and architectural lifecycles of the Chanakya AI Knowledge Platform.

---

## 1. Document Ingestion & Vector Indexing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as User / Admin
    participant UI as Upload UI (/upload)
    participant API as Ingestion API (/api/v1/documents)
    participant Worker as Background Ingestion Worker
    participant Gem as Google Gemini Embeddings API
    participant DB as PostgreSQL 16 + pgvector (Port 5433)

    Admin->>UI: Upload Document (PDF, DOCX, PPTX, TXT)
    UI->>API: POST /api/v1/documents (Multi-part File)
    API->>API: Compute SHA-256 Checksum
    API->>DB: Check Duplicate SHA-256 (assistant_document_versions)
    alt Content is Duplicate
        API-->>UI: Return existing document version (no re-embedding)
    else Content is New
        API->>DB: Upsert Document & New Version Record (status: 'processing')
        API->>Worker: Enqueue Background Job via pg-boss
        API-->>UI: Return HTTP 202 Accepted (Job ID)
        Worker->>Worker: Parse text, headings, and page boundaries
        Worker->>Worker: Chunk text into structured semantic segments
        Worker->>Gem: Batch generate 768-dim embeddings (with exponential backoff)
        Gem-->>Worker: Dense Vector Embeddings
        Worker->>DB: Batch INSERT into assistant_chunks (vector, tsv, metadata)
        Worker->>DB: Update document status: 'indexed'
    end
```

---

## 2. Direct Gemini Long-Context Document Analysis Flow

Designed for whole-document comprehension (e.g., ~100-page enterprise manuals) using Gemini Flash's native context window.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Analyst
    participant UI as Document Summary View (/documents/[id])
    participant API as Summarize API (/api/v1/documents/summarize)
    participant Direct as lib/gemini/direct-document.ts
    participant Gem as Gemini API (models/gemini-1.5-flash)
    participant DB as PostgreSQL (Port 5433)

    User->>UI: Navigate to Document Detail Page
    UI->>API: POST /api/v1/documents/summarize { documentId }
    API->>DB: Fetch Document Metadata & Content / File Path
    API->>Direct: directAnalyzeDocument({ title, content/file })
    Direct->>Gem: generateContent with Direct Multimodal Document Input
    Note over Direct,Gem: Structured Schema Output:<br/>- executiveSummary<br/>- keyPoints [ { point, pageNumber, supportingQuote } ]<br/>- actionItems<br/>- suggestedQuestions
    Gem-->>Direct: Validated JSON Response
    Direct-->>API: Structured Analysis Object
    API-->>UI: Display Executive Summary & Page-Verified Citations (p. 3, p. 18...)
```

---

## 3. Conversational RAG & Evidence-Grounded Retrieval Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / User
    participant ChatUI as Chat Interface (/chat)
    participant ChatAPI as Chat API Route (/api/v1/chat)
    participant Cache as Semantic Cache Gate
    participant Hybrid as Hybrid Search (assistant_hybrid_search)
    participant Guard as Hallucination & Security Gate
    participant LLM as Gemini Generative API

    User->>ChatUI: Submits Query: "What is the deployment procedure?"
    ChatUI->>ChatAPI: POST /api/v1/chat { message, conversationId }
    ChatAPI->>ChatAPI: Check Prompt Injection Neutralization Guard
    ChatAPI->>Cache: Query assistant_semantic_cache (cosine sim > 0.96)
    alt Cache Hit (Same Document Version)
        Cache-->>ChatAPI: Return pre-computed cached answer + citations
        ChatAPI-->>ChatUI: Return Answer (status: 'cached')
    else Cache Miss
        ChatAPI->>Hybrid: Call assistant_hybrid_search(query, vector, user_roles)
        Note over Hybrid: Reciprocal Rank Fusion (RRF):<br/>Dense Cosine Search + Full-Text ts_rank
        Hybrid-->>ChatAPI: Top K Chunks with Exact Citations
        ChatAPI->>Guard: Evaluate Chunk Relevance & Confidence Score
        alt Confidence Below Strict Threshold (< 0.65)
            Guard-->>ChatAPI: Insufficient Evidence Gate Triggered
            ChatAPI-->>ChatUI: Return Grounded "Insufficient Evidence" + Support Desk Link
        else Sufficient Evidence
            ChatAPI->>LLM: Generate Answer Constrained Strictly to Evidence Chunks
            LLM-->>ChatAPI: Grounded Answer with Source References
            ChatAPI->>DB: Store in assistant_messages & Update semantic_cache
            ChatAPI-->>ChatUI: Return Answer + Page-Level Citations
        end
    end
```

---

## 4. Universal Embeddable Click-and-Chat SDK Flow

Allows any external website or internal portal to integrate Chanakya with one line of JavaScript.

```mermaid
sequenceDiagram
    autonumber
    actor EndUser as External Web Visitor
    participant ExtPage as External Web Application
    participant SDK as public/embed/chanakya.js
    participant Widget as Floating Chat Bubble & Modal
    participant Backend as Chanakya API (/api/v1/chat)

    ExtPage->>SDK: Loads <script src=".../embed/chanakya.js" data-app-id="..." />
    SDK->>SDK: Reads configuration from data attributes or window.ChanakyaConfig
    SDK->>Widget: Injects isolated DOM elements & Luminary styling
    Widget->>ExtPage: Renders pulsing launcher button (Bottom-Right)
    EndUser->>Widget: Clicks Widget Button or presses Ctrl+K
    Widget->>Widget: Expands Silk-Ease Glassmorphic Modal
    EndUser->>Widget: Submits Question
    Widget->>Backend: POST /api/v1/chat (CORS-enabled REST stream)
    Backend-->>Widget: Returns answer with page citations & sources
    Widget-->>EndUser: Displays real-time verified dialogue
```

---

## 5. Background Ingestion & Maintenance Pipeline

- **Worker Process**: `workers/assistant-ingestion/worker.ts` powered by `pg-boss`.
- **Scheduled Jobs**:
  - Re-indexing queue for out-of-date vector embeddings upon schema changes.
  - Periodic cache invalidation when new document versions are committed.
  - System health probes (`npm run health`) verifying database connectivity, vector index validity, and Gemini API quota.
