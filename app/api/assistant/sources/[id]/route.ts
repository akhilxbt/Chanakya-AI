import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { getAuthenticatedUser } from '@/lib/assistant/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUser(req);
  const { repo } = getAssistantServices();
  const chunk = repo.chunks.get(params.id);
  if (!chunk || !user.groups.includes(chunk.accessGroup)) {
    return NextResponse.json({ error: 'Source not found or unauthorized' }, { status: 404 });
  }
  return NextResponse.json({
    id: chunk.id,
    title: chunk.documentTitle,
    headingPath: chunk.headingPath,
    version: chunk.versionNumber,
    content: chunk.content
  });
}
