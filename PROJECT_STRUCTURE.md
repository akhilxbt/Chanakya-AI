# Chanakya AI Knowledge Assistant — Project Directory & Structure Guide

This guide describes the directory structure of the repository, the purpose of each subsystem, and the maintenance workflow for keeping the project healthy.

---

## 1. Directory Tree & Roles

```
D:/Chatbot/Support-assistant/
├── app/                              # Next.js 14 App Router
│   ├── api/                          # REST API Endpoints
│   │   ├── assistant/chat/           # Core Grounded Assistant Endpoint
│   │   ├── assistant/feedback/       # Thumbs Up/Down & Quality Feedback
│   │   └── v1/                       # Versioned REST APIs (Chat & Summarize)
│   ├── chat/                         # Interactive Multi-Turn Dialogue View
│   │   └── page.tsx
│   ├── documents/                    # Document Browser & Long-Context Viewer
│   │   ├── [id]/page.tsx             # Whole-Document Viewer & Verified Citations
│   │   └── page.tsx
│   ├── embed-demo/                   # Demonstration of external SDK embed
│   │   └── page.tsx
│   ├── history/                      # Conversation History & Audit Trail
│   ├── knowledge/                    # Global Knowledge Base Index Browser
│   ├── settings/                     # User & System Preferences
│   ├── upload/                       # Multi-File Drag-and-Drop Ingestion View
│   ├── globals.css                   # Luminary Design System CSS Variables & Utilities
│   ├── layout.tsx                    # Root Layout & Metadata
│   └── page.tsx                      # Dashboard Home & Feature Hub
│
├── components/                       # React Reusable Components
│   ├── assistant/
│   │   └── AssistantWidget.tsx       # In-App Click-and-Chat Modal & Hotkey Launcher
│   └── chanakya/
│       ├── AppShell.tsx              # Outer Layout Shell (Sidebar + Header + Widget)
│       ├── Header.tsx                # Header Bar with Search & Dark/Light Switcher
│       └── Sidebar.tsx               # Primary Navigation Sidebar with Lucide Icons
│
├── db/                               # Database Schemas & Migrations
│   └── migrations/
│       ├── 001_assistant_schema.sql  # Canonical pgvector Schema (Runs on Port 5433)
│       └── 001_assistant_schema_native_pg.sql # Fallback schema for standard Postgres
│
├── lib/                              # Shared Library Modules
│   └── gemini/
│       └── direct-document.ts        # Direct Multimodal Long-Context Engine + Exponential Backoff
│
├── public/                           # Static Public Assets
│   ├── chanakya-robot.png            # AI Mascot Illustration
│   └── embed/
│       └── chanakya.js               # Standalone Embeddable Click-and-Chat SDK
│
├── server/                           # Server-side Business Logic
│   └── assistant/                    # RAG Retrieval, RRF Fusion, Citation Gating
│
├── tests/                            # Automated Verification Test Suite
│   └── run-tests.mjs                 # 12 Core Unit & Integration Tests (Passes 12/12)
│
├── workers/                          # Background Asynchronous Workers
│   └── assistant-ingestion/          # Ingestion Queue Processor (pg-boss)
│
├── ARCHITECTURE.md                   # System Architecture & Database Topology
├── DESIGN_SYSTEM.md                  # Luminary Color Tokens & UX Guidelines
├── FLOW.md                           # Mermaid Execution Sequence Flows
├── PROJECT_STRUCTURE.md              # Directory Map & Update Guidelines (This File)
├── README.md                         # Quick Start & Overview
└── package.json                      # Dependencies & Scripts
```

---

## 2. Maintenance & Regular Update Workflows

To keep the project clean, secure, and up to date, execute the following commands regularly:

### A. Run Verification Tests
```powershell
npm test
```
Ensures all 12 core security gates, semantic caching, citation bindings, and role access controls are working properly.

### B. Ingest New Documents
```powershell
npm run ingest
```
Reads files from `docs-source/`, calculates SHA-256 hashes, generates 768-dim embeddings via Google text-embedding-004, and upserts them into `assistant_chunks`.

### C. Re-index Vector Embeddings
```powershell
npm run reindex
```
Refreshes the HNSW cosine index and TSVector full-text search indexes on PostgreSQL port 5433.

### D. System Health Check
```powershell
npm run health
```
Performs a live connectivity test against PostgreSQL port 5433 and validates the Gemini API key.

---

## 3. Engineering Guidelines

1. **Zero Emojis**: Never use unicode emojis in source code. Always use `lucide-react` vector components.
2. **Database Protection**: Never run ad-hoc DDL/DML statements or alter tables directly without user confirmation.
3. **Design System Adherence**: Always style elements using the Luminary tokens (`var(--base-deep)`, `var(--panel-bg)`, `var(--silver)`, `var(--ivory)`) defined in `globals.css` and `DESIGN_SYSTEM.md`.
