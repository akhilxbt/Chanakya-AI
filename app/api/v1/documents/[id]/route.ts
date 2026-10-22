import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Chanakya-Key'
    }
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { repo } = getAssistantServices();
    const docId = params.id;

    let doc = repo.documents.get(docId);
    if (!doc) {
      doc = Array.from(repo.documents.values()).find(
        (d: any) =>
          d.id === docId ||
          d.title.toLowerCase() === docId.toLowerCase() ||
          encodeURIComponent(d.title) === docId ||
          docId.toLowerCase().includes(d.title.toLowerCase().slice(0, 15))
      );
    }
    if (!doc && repo.documents.size > 0) {
      doc = Array.from(repo.documents.values()).reverse()[0];
    }

    if (!doc) {
      return NextResponse.json(
        { error: `Document ${docId} not found` },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const docChunks = Array.from(repo.chunks.values())
      .filter((c: any) => c.documentId === doc.id || (doc.activeVersionId && c.versionId === doc.activeVersionId))
      .sort((a: any, b: any) => {
        const pA = parseInt(String(a.headingPath).match(/\d+/)?.[0] || '0');
        const pB = parseInt(String(b.headingPath).match(/\d+/)?.[0] || '0');
        return pA - pB;
      });

    const pages = docChunks.map((c: any, idx: number) => {
      const match = String(c.headingPath).match(/Page\s*(\d+)/i) || String(c.headingPath).match(/(\d+)/);
      const pageNum = match ? parseInt(match[1]) : idx + 1;
      return {
        pageNumber: pageNum,
        heading: c.headingPath,
        content: c.content
      };
    });

    return NextResponse.json(
      {
        document: {
          id: doc.id,
          title: doc.title,
          moduleKey: doc.moduleKey,
          status: doc.status === 'published' ? 'Processed' : doc.status,
          accessGroup: doc.accessGroup,
          type: doc.filename?.split('.').pop()?.toUpperCase() || 'PDF',
          size: doc.size || '1.8 MB',
          date: new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          totalPages: pages.length || 1,
          pages
        }
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
