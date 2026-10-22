import { withExponentialBackoff } from '@/lib/gemini/direct-document';

export interface DocumentQAResult {
  answer: string;
  sources: Array<{
    id: string;
    documentTitle: string;
    headingPath: string;
    pageNumber: number;
    url: string;
    version: number;
  }>;
}

/**
 * Deep Document Question-Answering Engine
 * Answers specific user requests (e.g. "list all tables used", "what are the error codes", "explain section 3")
 * by searching all pages and chunks of the active document and synthesizing via Gemini Flash.
 */
export async function answerQuestionFromDocument(
  doc: any,
  allDocChunks: any[],
  query: string
): Promise<DocumentQAResult | null> {
  if (!allDocChunks || allDocChunks.length === 0) return null;

  let normalizedQuery = query.toLowerCase().trim();
  // Typo normalization
  normalizedQuery = normalizedQuery
    .replace(/\btbales?\b/g, 'tables')
    .replace(/\btbale\b/g, 'table')
    .replace(/\brequiest\b/g, 'request')
    .replace(/\bparamenters?\b/g, 'parameters')
    .replace(/\bverifcation\b/g, 'verification')
    .replace(/\bsettigns?\b/g, 'settings');

  const queryTokens = normalizedQuery
    .replace(/[^a-z0-9_]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !['what', 'which', 'list', 'show', 'all', 'the', 'and', 'for', 'are', 'used', 'in'].includes(t));

  // 1. Score all chunks of this document specifically for the query
  const scoredChunks = allDocChunks.map((chunk: any) => {
    const text = `${chunk.headingPath} ${chunk.content}`.toLowerCase();
    let score = 0;

    // Direct token hits
    for (const token of queryTokens) {
      if (text.includes(token)) {
        score += 3.0;
        // Count occurrences
        const regex = new RegExp(`\\b${token}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) score += Math.min(matches.length, 5) * 1.5;
      }
    }

    // Special intent boosts
    if (
      normalizedQuery.includes('table') ||
      normalizedQuery.includes('schema') ||
      normalizedQuery.includes('database') ||
      normalizedQuery.includes('entity') ||
      normalizedQuery.includes('column') ||
      normalizedQuery.includes('relation')
    ) {
      if (
        text.includes('table') ||
        text.includes('tables') ||
        text.includes('column') ||
        text.includes('|') ||
        text.includes('tbl') ||
        text.includes('simcomm_') ||
        text.includes('_cdr_')
      ) {
        score += 15.0;
      }
    }

    if (normalizedQuery.includes('error') || normalizedQuery.includes('code') || normalizedQuery.includes('status')) {
      if (text.includes('error') || text.includes('fail') || text.includes('exception') || text.includes('http')) {
        score += 6.0;
      }
    }

    if (normalizedQuery.includes('config') || normalizedQuery.includes('setting') || normalizedQuery.includes('parameter')) {
      if (text.includes('config') || text.includes('setting') || text.includes('env') || text.includes('param')) {
        score += 6.0;
      }
    }

    return { chunk, score };
  });

  // Sort descending by score
  scoredChunks.sort((a, b) => b.score - a.score);

  // If top chunk has score > 0, pick the top 3-4 chunks
  let topChunks = scoredChunks.filter((s) => s.score > 0).slice(0, 4).map((s) => s.chunk);

  // If no specific keyword hit, take first 3 chunks as representative overview
  if (topChunks.length === 0) {
    topChunks = allDocChunks.slice(0, 3);
  }

  const apiKey = process.env.LLM_API_KEY_PRIMARY || process.env.GEMINI_API_KEY;
  const modelName = process.env.LLM_PRIMARY_MODEL || 'gemini-1.5-flash';

  const sources = topChunks.map((c: any, i: number) => {
    const pageNum = parseInt(String(c.headingPath).replace(/\D/g, '') || `${i + 1}`);
    return {
      id: c.id,
      documentTitle: doc.title,
      headingPath: c.headingPath,
      pageNumber: pageNum,
      url: `/documents/${doc.id}`,
      version: 1
    };
  });

  // If Gemini API Key is available, use Gemini Flash for deep grounded answering
  if (apiKey) {
    try {
      const excerptsText = topChunks
        .map((c: any) => `### Excerpt from [${c.headingPath}]:\n${c.content}`)
        .join('\n\n');

      const systemPrompt = `You are Chanakya AI Knowledge Assistant.
Answer the user's question directly, accurately, and thoroughly using ONLY the provided excerpts from "${doc.title}".
Rules:
1. If the user asks for tables, list every table name (e.g. simcomm_webex_cdr_main) and its role/description in clear bullet points.
2. If the user asks for steps or parameters, list them in exact order.
3. Start with a "**Direct Answer:**" header.
4. For every claim or table, cite the page or section where it is found (e.g. [Page 13]).
5. Do not hallucinate or guess any tables not present in the excerpts.`;

      const prompt = `${systemPrompt}\n\nDocument Excerpts:\n${excerptsText}\n\nUser Question: ${query}`;

      const res = await withExponentialBackoff(async () => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 800
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini Document QA Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty Gemini response');
        return text;
      });

      return {
        answer: res,
        sources
      };
    } catch (err) {
      console.warn('Gemini Document QA fallback notice:', err);
    }
  }

  // Deterministic Extraction Fallback (when offline or no API key)
  const isTableQuery = normalizedQuery.includes('table');
  if (isTableQuery) {
    const tableChunk = topChunks.find((c: any) => c.content.toLowerCase().includes('table'));
    if (tableChunk) {
      const lines = tableChunk.content.split('\n');
      const tableLines = lines.filter((l: string) => {
        const lower = l.toLowerCase();
        return (
          lower.includes('simcomm_') ||
          lower.includes('tbl_') ||
          lower.includes('tblmst_') ||
          lower.includes('_cdr_') ||
          lower.includes('_logs') ||
          l.includes('|')
        );
      });

      if (tableLines.length > 0) {
        const formattedList = tableLines
          .map((l: string) => `&bull; **${l.replace(/^[-*|•\s]+/, '').trim()}**`)
          .join('\n');

        return {
          answer: `**Direct Answer:** In **${doc.title}** (${tableChunk.headingPath}), the following tables are documented:\n\n${formattedList}\n\nRefer to ${tableChunk.headingPath} for complete schema definitions.`,
          sources
        };
      }
    }
  }

  // General clean excerpt fallback
  const topChunk = topChunks[0];
  const cleanSnippet = topChunk.content.slice(0, 450).trim();
  return {
    answer: `**Direct Answer:** In **${doc.title}** (${topChunk.headingPath}):\n\n${cleanSnippet} [1]`,
    sources
  };
}
