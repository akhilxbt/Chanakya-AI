import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { requireAdmin } from '@/lib/assistant/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin(req);
    const body = await req.json();
    const { repo } = getAssistantServices();
    const res = repo.publishVersion({
      documentId: params.id,
      versionId: body.versionId,
      actorId: admin.id
    });
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 });
  }
}
