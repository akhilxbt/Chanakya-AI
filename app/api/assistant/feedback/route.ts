import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { getAuthenticatedUser } from '@/lib/assistant/auth';

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  const body = await req.json();
  if (!body.messageId || !['helpful', 'not_helpful'].includes(body.rating)) {
    return NextResponse.json({ error: 'Invalid feedback payload' }, { status: 400 });
  }
  const { repo } = getAssistantServices();
  const id = crypto.randomUUID();
  const record = {
    id,
    messageId: body.messageId,
    userId: user.id,
    rating: body.rating,
    comment: body.comment ? String(body.comment).slice(0, 1000) : null,
    createdAt: new Date().toISOString()
  };
  repo.feedback.set(id, record);
  return NextResponse.json({ status: 'recorded', id });
}
