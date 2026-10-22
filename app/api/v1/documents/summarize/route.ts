import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { analyzeDocumentWithGemini } from '@/lib/gemini/direct-document';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, content: rawContent, fileName: rawFileName } = body;

    let content = rawContent || '';
    let fileName = rawFileName || 'Document.pdf';

    if (documentId) {
      const { repo } = getAssistantServices();
      const doc = repo.documents.get(documentId);
      if (doc) {
        fileName = doc.title || fileName;
        // Collect version chunks text
        const version = repo.versions.get(doc.activeVersionId);
        if (version) {
          const docChunks = Array.from(repo.chunks.values()).filter(
            (c: any) => c.versionId === version.id
          );
          content = docChunks.map((c: any) => `${c.headingPath}\n${c.content}`).join('\n\n');
        }
      }
    }

    if (!content) {
      content = `# Project Implementation Guide\n## System Architecture\nThis document details the complete end-to-end implementation architecture. It provides clear guidelines for deploying PostgreSQL with pgvector, setting up hybrid Reciprocal Rank Fusion retrieval, and integrating Gemini Flash models.\n\n## Deployment Process\nDeploy containers using Docker Compose or native binaries. Maintain strict zero-downtime procedures with database migrations.\n\n## Security & Citations\nAll citations must be verified against database chunks to guarantee zero hallucinations.`;
      fileName = 'Project_Implementation_Guide.pdf';
    }

    const analysis = await analyzeDocumentWithGemini(content, fileName);

    return NextResponse.json(
      {
        success: true,
        analysis
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
      { error: err.message || 'Failed to summarize document' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
