import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { getAuthenticatedUser } from '@/lib/assistant/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    const { chatService } = getAssistantServices();

    const response = await chatService.handleChat({
      user,
      message: body.message,
      conversationId: body.conversationId ?? null,
      context: body.context ?? {}
    });

    return NextResponse.json(response);
  } catch (err: any) {
    const status = err?.statusCode || 500;
    return NextResponse.json(
      {
        status: 'error',
        message:
          status === 429
            ? 'Rate limit reached. Please wait a moment and try again.'
            : status === 403
            ? 'You are not authorized to access this conversation.'
            : 'Unable to process your question right now.'
      },
      { status }
    );
  }
}
