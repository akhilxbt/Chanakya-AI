import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { requireAdmin } from '@/lib/assistant/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin(req);
    const { repo } = getAssistantServices();
    const res = repo.retireDocument({ documentId: params.id, actorId: admin.id });
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 400 });
  }
}
