-- Native PostgreSQL Schema (No pgvector extension required)
-- Uses native pgcrypto and native full-text search (tsvector + GIN)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS assistant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  module_key TEXT,
  document_type TEXT,
  access_group TEXT NOT NULL DEFAULT 'application-users',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  active_version_id UUID,
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assistant_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES assistant_documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded','processing','indexed','published','failed','retired')),
  parser_version TEXT,
  embedding_model TEXT,
  failure_code TEXT,
  indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, version_number),
  UNIQUE (document_id, checksum_sha256)
);

CREATE TABLE IF NOT EXISTS assistant_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES assistant_document_versions(id) ON DELETE CASCADE,
  chunk_number INT NOT NULL,
  heading_path TEXT,
  source_locator TEXT,
  context_prefix TEXT,
  content TEXT NOT NULL,
  module_key TEXT,
  access_group TEXT NOT NULL,
  token_count INT,
  embedding jsonb,
  fts tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(heading_path,'') || ' ' ||
                coalesce(context_prefix,'') || ' ' || content)
  ) STORED,
  UNIQUE (version_id, chunk_number)
);

CREATE INDEX IF NOT EXISTS idx_chunks_fts ON assistant_chunks USING gin (fts);
CREATE INDEX IF NOT EXISTS idx_chunks_version ON assistant_chunks(version_id);

CREATE TABLE IF NOT EXISTS assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conv_user ON assistant_conversations(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  response_status TEXT,
  top_score REAL,
  sources JSONB NOT NULL DEFAULT '[]',
  provider TEXT,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON assistant_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS assistant_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES assistant_messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('helpful','not_helpful')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assistant_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_embedding jsonb,
  answer JSONB NOT NULL,
  version_signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assistant_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  request_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Native text search function using PostgreSQL tsvector + ts_rank_cd
CREATE OR REPLACE FUNCTION assistant_hybrid_search(
  q_text TEXT,
  match_count INT DEFAULT 20,
  p_groups TEXT[] DEFAULT ARRAY['application-users']
) RETURNS TABLE (chunk_id UUID, score FLOAT) LANGUAGE sql STABLE AS $$
  WITH live AS (
    SELECT c.* FROM assistant_chunks c
    JOIN assistant_documents d ON d.active_version_id = c.version_id
    WHERE d.status = 'published' AND c.access_group = ANY(p_groups)
  )
  SELECT id,
         ts_rank_cd(fts, websearch_to_tsquery('english', q_text))::FLOAT AS score
  FROM live
  WHERE fts @@ websearch_to_tsquery('english', q_text)
  ORDER BY score DESC
  LIMIT match_count;
$$;
