import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { getAuthenticatedUser } from '@/lib/assistant/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUser(req);
  const { repo } = getAssistantServices();
  const conv = repo.conversations.get(params.id);
  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  }
  const messages = Array.from(repo.messages.values()).filter((m: any) => m.conversationId === params.id);
  return NextResponse.json({ conversation: conv, messages });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUser(req);
  const { repo } = getAssistantServices();
  const conv = repo.conversations.get(params.id);
  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  }
  conv.status = 'closed';
  return NextResponse.json({ status: 'closed', id: params.id });
}
