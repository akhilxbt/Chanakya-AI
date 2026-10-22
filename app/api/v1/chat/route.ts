import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { routeQuerySupervisor, executeWebKnowledgeFallback } from '@/lib/assistant/query-router';
import { answerQuestionFromDocument } from '@/lib/assistant/document-qa';

// Handle preflight OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Chanakya-Key'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, documentId: topDocId, documentTitle: topDocTitle, context = {} } = body;
    const targetDocId = topDocId || context?.documentId;
    const targetDocTitle = topDocTitle || context?.documentTitle;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Field "message" is required and must be a string.' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    const { chatService, repo } = getAssistantServices();

    // Direct Active Document Q&A Handler
    // If the user has an active document open, search all pages/chunks of that document specifically
    if (targetDocId || targetDocTitle) {
      let doc = targetDocId ? repo.documents.get(targetDocId) : null;
      if (!doc && targetDocTitle) {
        doc = Array.from(repo.documents.values()).find(
          (d: any) => d.title.toLowerCase() === targetDocTitle.toLowerCase()
        );
      }
      if (!doc && repo.documents.size > 0) {
        doc = Array.from(repo.documents.values()).reverse()[0];
      }

      if (doc) {
        const docChunks = Array.from(repo.chunks.values()).filter(
          (c: any) => c.documentId === doc.id || (doc.activeVersionId && c.versionId === doc.activeVersionId)
        );

        if (docChunks.length > 0) {
          const docAnswer = await answerQuestionFromDocument(doc, docChunks, message);
          if (docAnswer && docAnswer.answer) {
            return NextResponse.json(
              {
                conversationId: conversationId || `conv-${Date.now()}`,
                answer: docAnswer.answer,
                sources: docAnswer.sources,
                status: 'answered',
                cached: false,
                routedMode: 'internal_knowledge',
                supervisorReasoning: `Direct document query answered from ${doc.title} (${docChunks.length} pages indexed)`
              },
              {
                status: 200,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        }
      }
    }

    // 1. Supervisor Query Routing Step (Inspired by ogulcanakca/agentic-chatbot)
    const hasActiveDoc = Boolean(targetDocId || targetDocTitle);
    const supervisorDecision = routeQuerySupervisor(message, hasActiveDoc);

    // Fast-Path FAQ (<2ms instant response)
    if (supervisorDecision.mode === 'FAST_PATH_FAQ' && supervisorDecision.fastPathFaq) {
      const faq = supervisorDecision.fastPathFaq;
      return NextResponse.json(
        {
          conversationId: conversationId || `conv-faq-${Date.now()}`,
          answer: `**Direct Answer:** ${faq.answer}`,
          sources: [
            {
              id: faq.id,
              documentTitle: `Knowledge Base FAQ &bull; ${faq.category}`,
              headingPath: faq.question,
              pageNumber: 1,
              url: '/support',
              version: 1
            }
          ],
          status: 'answered',
          cached: true,
          fastPath: true,
          routedMode: 'fast_path_faq',
          supervisorReasoning: supervisorDecision.reasoning
        },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Direct External Web Knowledge Intent
    if (supervisorDecision.mode === 'EXTERNAL_WEB_SEARCH') {
      const webResult = await executeWebKnowledgeFallback(message);
      return NextResponse.json(
        {
          conversationId: conversationId || `conv-web-${Date.now()}`,
          answer: webResult.answer,
          sources: webResult.sources,
          status: 'answered',
          cached: false,
          routedMode: 'web_search_fallback',
          supervisorReasoning: supervisorDecision.reasoning
        },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 2. Standard Internal Knowledge Hybrid RRF Search
    const response = await chatService.handleChat({
      user: { id: 'api-user', groups: ['application-users'] },
      conversationId,
      message,
      context: { ...context, documentId: targetDocId, documentTitle: targetDocTitle }
    });

    // If standard RAG had low evidence on a broad query, check if an active document was provided or recent document exists
    if (
      response.status === 'insufficient_evidence' &&
      (targetDocId || targetDocTitle || repo.documents.size > 0)
    ) {
      const doc = targetDocId
        ? repo.documents.get(targetDocId)
        : Array.from(repo.documents.values()).reverse()[0];

      if (doc) {
        const docChunks = Array.from(repo.chunks.values()).filter((c: any) => c.documentId === doc.id);
        if (docChunks.length > 0) {
          const docAnswer = await answerQuestionFromDocument(doc, docChunks, message);
          if (docAnswer && docAnswer.answer) {
            return NextResponse.json(
              {
                conversationId: response.conversationId || `conv-${Date.now()}`,
                answer: docAnswer.answer,
                sources: docAnswer.sources,
                status: 'answered',
                cached: false,
                routedMode: 'internal_knowledge',
                supervisorReasoning: `Fallback deep retrieval from ${doc.title}`
              },
              {
                status: 200,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        }
      }
    }

    // If internal RAG still had insufficient evidence, trigger Web Knowledge Fallback
    if (response.status === 'insufficient_evidence') {
      const webFallback = await executeWebKnowledgeFallback(message);
      return NextResponse.json(
        {
          conversationId: response.conversationId || `conv-web-${Date.now()}`,
          answer: webFallback.answer,
          sources: webFallback.sources,
          status: 'answered',
          cached: false,
          routedMode: 'web_search_fallback',
          supervisorReasoning: 'Internal evidence threshold not met; gracefully escalated to Web Knowledge Grounding'
        },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return NextResponse.json(
      {
        conversationId: response.conversationId,
        answer: response.answer,
        sources: response.sources || [],
        status: response.status,
        cached: response.cached || false,
        routedMode: 'internal_knowledge',
        clarification: response.clarification || null,
        escalation: response.escalation || null
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Knowledge API Error' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
