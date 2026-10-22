import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { requireAdmin } from '@/lib/assistant/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req);
    const { repo } = getAssistantServices();
    const doc = repo.documents.get(params.id);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    const versions = Array.from(repo.versions.values()).filter((v: any) => v.documentId === params.id);
    return NextResponse.json({ document: doc, versions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 403 });
  }
}
