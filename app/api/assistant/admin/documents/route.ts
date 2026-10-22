import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { requireAdmin } from '@/lib/assistant/auth';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const { repo } = getAssistantServices();
    return NextResponse.json({
      documents: Array.from(repo.documents.values()),
      versions: Array.from(repo.versions.values())
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    const body = await req.json();
    const { repo } = getAssistantServices();
    const result = repo.ingestAndPublishDocument({
      title: body.title,
      moduleKey: body.moduleKey || 'General',
      filename: body.filename || 'guide.md',
      mimeType: body.mimeType || 'text/markdown',
      content: body.content,
      actorId: admin.id,
      autoPublish: Boolean(body.autoPublish)
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 403 });
  }
}
