import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { requireAdmin } from '@/lib/assistant/auth';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const { repo } = getAssistantServices();
    return NextResponse.json(repo.getQualityReport());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 403 });
  }
}
