import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { requireAdmin } from '@/lib/assistant/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req);
    const { repo } = getAssistantServices();
    const job = repo.jobs.get(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json(job);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 403 });
  }
}
