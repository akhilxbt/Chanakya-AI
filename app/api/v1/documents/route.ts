import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get('id');
  const includeSystem = searchParams.get('all') === 'true';
  const { repo } = getAssistantServices();

  // If specific document ID is requested, return full document details + pages
  if (docId) {
    let doc = repo.documents.get(docId);
    if (!doc) {
      doc = Array.from(repo.documents.values()).find(
        (d: any) => d.id === docId || d.title.toLowerCase() === docId.toLowerCase()
      );
    }

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const docChunks = Array.from(repo.chunks.values())
      .filter((c: any) => c.documentId === doc.id || (doc.activeVersionId && c.versionId === doc.activeVersionId))
      .sort((a: any, b: any) => {
        const pA = parseInt(String(a.headingPath).replace(/\D/g, '') || '0');
        const pB = parseInt(String(b.headingPath).replace(/\D/g, '') || '0');
        return pA - pB;
      });

    const pages = docChunks.map((c: any, idx: number) => {
      const pageNum = parseInt(String(c.headingPath).replace(/\D/g, '') || `${idx + 1}`);
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
  }

  const allDocs = Array.from(repo.documents.values());
  const filtered = includeSystem
    ? allDocs
    : allDocs.filter(
        (d: any) =>
          d.documentType === 'user-upload' ||
          d.createdBy === 'user-uploader' ||
          d.isUserUpload === true
      );

  const docs = filtered.map((d: any) => ({
    id: d.id,
    title: d.title,
    moduleKey: d.moduleKey,
    status: d.status === 'published' ? 'Processed' : d.status,
    accessGroup: d.accessGroup,
    type: d.filename?.split('.').pop()?.toUpperCase() || 'PDF',
    size: d.size || '1.8 MB',
    date: new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  }));

  return NextResponse.json(
    { documents: docs },
    {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  );
}

export async function DELETE(req: NextRequest) {
  try {
    const { repo } = getAssistantServices();
    const url = new URL(req.url);
    const docId = url.searchParams.get('id');

    if (docId) {
      repo.documents.delete(docId);
      for (const [chunkId, chunk] of Array.from(repo.chunks.entries())) {
        if ((chunk as any).documentId === docId || (chunk as any).versionId === docId) {
          repo.chunks.delete(chunkId);
        }
      }
      return NextResponse.json({ success: true, message: `Document ${docId} removed.` });
    }

    // Clear user documents
    for (const [id, d] of Array.from(repo.documents.entries())) {
      if ((d as any).documentType === 'user-upload' || (d as any).createdBy === 'user-uploader') {
        repo.documents.delete(id);
      }
    }

    return NextResponse.json({ success: true, message: 'User documents cleared.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
