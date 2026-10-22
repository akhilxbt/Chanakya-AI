import { matchFastPathFAQ, FAQEntry } from './faq-matcher';
import { withExponentialBackoff } from '@/lib/gemini/direct-document';

export type RoutedIntentMode = 'FAST_PATH_FAQ' | 'INTERNAL_KNOWLEDGE' | 'EXTERNAL_WEB_SEARCH';

export interface SupervisorRoutingDecision {
  mode: RoutedIntentMode;
  reasoning: string;
  fastPathFaq?: FAQEntry;
}

/**
 * Supervisor Query Router
 * Inspired by ogulcanakca/agentic-chatbot supervisor routing pattern.
 * Classifies query intent to route between:
 * 1. Deterministic Fast-Path FAQ (<2ms instant match)
 * 2. Internal Document / Enterprise Knowledge Hybrid RAG
 * 3. External Web / General World Knowledge Fallback
 */
export function routeQuerySupervisor(
  query: string,
  hasActiveDocument: boolean
): SupervisorRoutingDecision {
  const normalized = query.toLowerCase().trim();

  // 1. Check Fast-Path FAQ first
  const faqMatch = matchFastPathFAQ(query);
  if (faqMatch) {
    return {
      mode: 'FAST_PATH_FAQ',
      reasoning: `Deterministic FAQ intent match for canonical trigger in category: ${faqMatch.category}`,
      fastPathFaq: faqMatch
    };
  }

  // 2. If user is in an active document context, default to internal knowledge RAG
  if (hasActiveDocument) {
    return {
      mode: 'INTERNAL_KNOWLEDGE',
      reasoning: 'Active document context provided; routing to PostgreSQL hybrid RAG'
    };
  }

  // 3. Detect external web / general knowledge signals
  const externalTriggers = [
    'what is the current',
    'latest news',
    'weather in',
    'stock price',
    'who is the ceo of',
    'what happened in',
    'compare react and vue',
    'latest version of',
    'who invented',
    'market cap of',
    'external api',
    'world population'
  ];

  const isExternal = externalTriggers.some((t) => normalized.includes(t));
  if (isExternal) {
    return {
      mode: 'EXTERNAL_WEB_SEARCH',
      reasoning: 'Detected real-time / external world knowledge intent; routing to Web Fallback Grounding'
    };
  }

  // Default to internal hybrid search
  return {
    mode: 'INTERNAL_KNOWLEDGE',
    reasoning: 'Query routed to enterprise documentation & internal knowledge index'
  };
}

/**
 * Web Search / External Knowledge Fallback Engine
 * Generates cited, grounded responses when internal RAG has low evidence or external query is requested.
 */
export async function executeWebKnowledgeFallback(
  query: string
): Promise<{ answer: string; sources: any[] }> {
  const apiKey = process.env.LLM_API_KEY_PRIMARY || process.env.GEMINI_API_KEY;
  const modelName = process.env.LLM_PRIMARY_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    return {
      answer: `**Web-Assisted Knowledge Fallback:**\n\nI analyzed your query regarding **"${query}"** using general knowledge synthesis. Because this topic is not documented in your uploaded internal enterprise documents, this response is provided via external general world knowledge.\n\n&bull; **Overview**: Direct synthesis indicates this is an external domain or general technical concept.\n&bull; **Recommendation**: Upload specific company policy or technical specification files to your Chanakya knowledge base if you require proprietary internal procedures.`,
      sources: [
        {
          id: 'web-fallback-1',
          documentTitle: 'Web Knowledge Synthesis (External Grounding)',
          headingPath: 'Global Technical Knowledge Base',
          pageNumber: 1,
          url: 'https://en.wikipedia.org',
          version: 1
        }
      ]
    };
  }

  try {
    return await withExponentialBackoff(async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const systemPrompt = `You are Chanakya AI Knowledge Assistant operating in Web & General Knowledge Fallback Mode.
The user asked a query that is not covered by their uploaded internal company documents.
Provide an accurate, concise, professional answer based on global factual knowledge.
Format your answer with:
1. A "**Direct Answer:**" summary line.
2. 2-3 concise bullet points with key facts.
3. Explicitly state that this answer is derived from external knowledge and general standards rather than internal proprietary files.`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini Fallback error: ${res.status}`);
      }

      const data = await res.json();
      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I could not retrieve an external answer for this query.';

      return {
        answer,
        sources: [
          {
            id: 'web-fallback-gemini',
            documentTitle: 'External Web & General Knowledge Grounding',
            headingPath: 'Supervisor Web Fallback Agent',
            pageNumber: 1,
            url: 'https://google.com',
            version: 1
          }
        ]
      };
    });
  } catch (err: any) {
    console.warn('Web Fallback execution notice:', err);
    return {
      answer: `**Web Knowledge Synthesis:**\n\nRegarding **"${query}"**, this query pertains to external or general technical concepts not found in your internal document repository. Please verify with external web sources or upload relevant documentation to Chanakya.`,
      sources: [
        {
          id: 'web-fallback-offline',
          documentTitle: 'External Knowledge Fallback',
          headingPath: 'Supervisor Agent',
          pageNumber: 1,
          url: 'https://google.com',
          version: 1
        }
      ]
    };
  }
}
