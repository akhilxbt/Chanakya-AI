import { NextRequest, NextResponse } from 'next/server';
import { getAssistantServices } from '@/lib/assistant/singleton';
import { parseMultiFormatDocument } from '@/lib/assistant/multi-format-parser';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || file?.name || 'Untitled Document';
    const moduleKey = (formData.get('moduleKey') as string) || 'General';

    let content = '';
    let totalPages = 1;
    let detectedType = 'PDF';

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const parsed = await parseMultiFormatDocument(
        Buffer.from(arrayBuffer),
        file.name,
        file.type
      );
      content = parsed.content;
      totalPages = parsed.totalPages;
      detectedType = parsed.format;
    } else {
      content = (formData.get('content') as string) || '';
      detectedType = 'TXT';
    }

    // Ensure content has at least basic structured headings if raw text was sparse
    if (!content.trim()) {
      content = `\n\n## Overview\n\nDocument: ${title}\nUploaded to knowledge base with ${totalPages} page(s).\n`;
    }

    const { repo } = getAssistantServices();
    const result = repo.ingestAndPublishDocument({
      title,
      moduleKey,
      documentType: 'user-upload',
      filename: file?.name || `${title}.${detectedType.toLowerCase()}`,
      mimeType: file?.type || 'application/octet-stream',
      content,
      actorId: 'user-uploader',
      accessGroup: 'application-users',
      autoPublish: true
    });

    return NextResponse.json(
      {
        success: true,
        document: {
          id: result.documentId || `doc-${Date.now()}`,
          title,
          totalPages,
          status: 'Processed',
          moduleKey,
          filename: file?.name || `${title}.${detectedType.toLowerCase()}`,
          size: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '1.0 MB',
          date: 'Just now',
          type: detectedType
        }
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  } catch (err: any) {
    console.error('Document upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process and index document' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
