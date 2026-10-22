export interface FAQEntry {
  id: string;
  category: 'Popular' | 'Documents' | 'Technical' | 'Security';
  triggers: string[];
  question: string;
  answer: string;
  citation: string;
}

export const CANONICAL_FAQS: FAQEntry[] = [
  {
    id: 'faq-supported-formats',
    category: 'Documents',
    triggers: [
      'supported formats',
      'what files can i upload',
      'supported files',
      'file types',
      'can i upload pptx',
      'can i upload csv',
      'upload excel',
      'formats supported'
    ],
    question: 'What document formats are supported for ingestion?',
    answer:
      'Chanakya natively supports **PDF** (multi-page extraction via unpdf), **PowerPoint (.pptx)** (slide-by-slide XML extraction), **Word (.docx)** (paragraph and heading parsing), **Spreadsheets (.csv / .tsv)** (tabular schema and row-level preservation), **JSON**, **Markdown (.md)**, and **Plain Text (.txt)**. Each format is decomposed into hierarchical sections with exact page, slide, or row citations.',
    citation: 'System Architecture Specification &bull; Ingestion Engine'
  },
  {
    id: 'faq-hybrid-search',
    category: 'Technical',
    triggers: [
      'how does hybrid search work',
      'what is hybrid search',
      'hybrid rrf',
      'reciprocal rank fusion',
      'how does search work',
      'vector and keyword search'
    ],
    question: 'How does Hybrid RRF search work in Chanakya?',
    answer:
      'Chanakya employs **Dense-Sparse Hybrid Retrieval using Reciprocal Rank Fusion (RRF)** on PostgreSQL 16 + pgvector. Every query generates both a 768-dimensional dense vector embedding (via Google text-embedding-004) and a PostgreSQL `tsvector` sparse lexical token list. RRF mathematically combines cosine similarity distance (`<=>`) with full-text search relevance (`ts_rank_cd`), guaranteeing both semantic conceptual matching and exact keyword precision.',
    citation: 'Section 4 &bull; Technical Architecture Whitepaper'
  },
  {
    id: 'faq-citations',
    category: 'Technical',
    triggers: [
      'how do citations work',
      'page citations',
      'source citations',
      'how are citations verified',
      'grounded citations'
    ],
    question: 'How are source citations verified?',
    answer:
      'Every extracted document chunk maintains an immutable `pageNumber` and `headingPath`. During retrieval, the Evidence Gating layer checks that similarity confidence exceeds **0.65**. Chanakya forces the generation model to map every claim directly to an existing database chunk ID `[1]`, eliminating hallucinated references.',
    citation: 'Section 6 &bull; Evidence Gate & Ground Truth Protocol'
  },
  {
    id: 'faq-upload-doc',
    category: 'Popular',
    triggers: [
      'how to upload',
      'how do i upload',
      'upload a document',
      'upload a pdf',
      'add document'
    ],
    question: 'How do I upload a new document to the knowledge base?',
    answer:
      'Navigate to the **Upload Document** tab in the top navigation or sidebar. Drag and drop your file (.pdf, .docx, .pptx, .csv, .json, .txt) into the dropzone, or click browse. The ingestion worker automatically parses binary structures, computes semantic vector embeddings, and indexes the document for immediate dialogue.',
    citation: 'Chanakya Platform User Onboarding Guide'
  },
  {
    id: 'faq-export-pdf',
    category: 'Popular',
    triggers: [
      'how to export',
      'export as pdf',
      'export to word',
      'download summary',
      'save summary',
      'export chat'
    ],
    question: 'How can I export my summaries and chat dialogues as PDF?',
    answer:
      'On any document detail page (`/documents/[id]`), click the **Export PDF** or **Export Word (.doc)** buttons in the top header. In the chat dialogue page (`/chat`), click the **Export Chat as PDF** button in the header bar to generate an executive print-ready PDF containing all conversation turns, direct answers, and cited sources.',
    citation: 'Knowledge Operations &bull; Export Utilities'
  },
  {
    id: 'faq-security',
    category: 'Security',
    triggers: [
      'is my data secure',
      'privacy',
      'data confidentiality',
      'prompt injection',
      'tenant isolation',
      'security features'
    ],
    question: 'How does Chanakya guarantee enterprise security and data privacy?',
    answer:
      'Chanakya enforces a 4-tier security gate: 1) **Prompt Injection Neutralization** that scrubs jailbreaks and instruction overrides; 2) **Role-Aware Access Group Isolation** (RBAC) preventing unauthorized tenant exposure; 3) **Conversation Isolation** blocking cross-session leakage; and 4) **Deterministic Evidence Gating** that safely refuses out-of-bounds queries.',
    citation: 'Enterprise Security & Compliance Whitepaper'
  }
];

/**
 * Fast-path FAQ matcher (executes in < 2ms without LLM or vector DB cost)
 * Inspired by Sayan-Mondal2022/faqs_chatbot deterministic intent layer
 */
export function matchFastPathFAQ(query: string): FAQEntry | null {
  const normalized = query.toLowerCase().trim().replace(/[?!.,;]/g, '');

  if (normalized.length < 3) return null;

  for (const faq of CANONICAL_FAQS) {
    // Check exact question match
    if (normalized === faq.question.toLowerCase().replace(/[?!.,;]/g, '')) {
      return faq;
    }

    // Check trigger phrase inclusion
    for (const trigger of faq.triggers) {
      if (normalized.includes(trigger)) {
        return faq;
      }
    }
  }

  return null;
}
