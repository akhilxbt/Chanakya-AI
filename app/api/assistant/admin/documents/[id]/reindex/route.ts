import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { requireAdmin } from '@/lib/assistant/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin(req);
    const { repo } = getAssistantServices();
    const doc = repo.documents.get(params.id);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    repo.logAudit({ actorId: admin.id, action: 'QUEUE_REINDEX', resourceType: 'document', resourceId: params.id });
    return NextResponse.json({ status: 'queued', documentId: params.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 });
  }
}
