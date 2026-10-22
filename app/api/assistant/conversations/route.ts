import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { getAuthenticatedUser } from '@/lib/assistant/auth';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  const { repo } = getAssistantServices();
  const list = Array.from(repo.conversations.values()).filter((c: any) => c.userId === user.id && c.status === 'open');
  return NextResponse.json({ conversations: list });
}
