import { extractText } from 'unpdf';
import * as zlib from 'zlib';

export interface ParsedDocumentResult {
  content: string;
  totalPages: number;
  format: 'PDF' | 'DOCX' | 'PPTX' | 'CSV' | 'JSON' | 'TXT' | 'MD' | 'OTHER';
  metadata: {
    title?: string;
    rowCount?: number;
    slideCount?: number;
    wordCount: number;
    characterCount: number;
  };
}

/**
 * Intelligent Multi-Format Document Ingestion Engine
 * Inspired by agentic-rag-chatbot multi-format pipeline.
 * Supports PDF, DOCX, PPTX, CSV, JSON, Markdown, and Plain Text.
 */
export async function parseMultiFormatDocument(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  mimeType?: string
): Promise<ParsedDocumentResult> {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

  // 1. PDF Documents
  if (extension === 'pdf' || mimeType === 'application/pdf') {
    try {
      const extracted = await extractText(new Uint8Array(buffer), { mergePages: false });
      const totalPages = extracted.totalPages || 1;
      let pages: string[] = [];

      const rawText: any = extracted.text;
      if (Array.isArray(rawText)) {
        pages = rawText;
      } else if (typeof rawText === 'string') {
        if (rawText.includes('\f')) {
          pages = rawText.split('\f');
        } else {
          pages = [rawText];
        }
      }

      const content = pages
        .map((pageText: string, idx: number) => `\n\n## Page ${idx + 1}\n\n${String(pageText).trim()}`)
        .join('\n');

      return {
        content: content.trim() || `## Overview\n\nDocument: ${fileName}\nTotal Pages: ${totalPages}`,
        totalPages,
        format: 'PDF',
        metadata: {
          wordCount: content.split(/\s+/).filter(Boolean).length,
          characterCount: content.length
        }
      };
    } catch (err) {
      console.warn('[Parser] PDF extraction warning, falling back to text:', err);
    }
  }

  // 2. CSV & TSV Spreadsheets
  if (extension === 'csv' || extension === 'tsv' || mimeType === 'text/csv') {
    const delimiter = extension === 'tsv' ? '\t' : ',';
    const rawText = buffer.toString('utf-8');
    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length > 0) {
      const headerLine = lines[0];
      const headers = parseCSVLine(headerLine, delimiter);
      const rows = lines.slice(1).map((l) => parseCSVLine(l, delimiter));

      // Build structured markdown table for first 50 rows + detailed entity chunking
      const tableHeaders = `| ${headers.join(' | ')} |`;
      const tableDivider = `| ${headers.map(() => '---').join(' | ')} |`;
      const previewRows = rows
        .slice(0, 30)
        .map((r) => `| ${r.map((c) => c.replace(/\|/g, '-')).join(' | ')} |`)
        .join('\n');

      // Detailed row entities for RAG semantic chunking
      const detailedEntities = rows
        .map((r, idx) => {
          const pairs = headers.map((h, i) => `**${h}**: ${r[i] || 'N/A'}`).join(', ');
          return `### Record #${idx + 1}\n${pairs}`;
        })
        .join('\n\n');

      const content = [
        `# Spreadsheet Dataset: ${fileName}`,
        `Total Records: ${rows.length} | Columns: ${headers.join(', ')}`,
        '',
        '## Data Preview Table',
        tableHeaders,
        tableDivider,
        previewRows,
        '',
        '## Detailed Records & Values',
        detailedEntities
      ].join('\n');

      const totalPages = Math.max(1, Math.ceil(rows.length / 25));

      return {
        content,
        totalPages,
        format: 'CSV',
        metadata: {
          rowCount: rows.length,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          characterCount: content.length
        }
      };
    }
  }

  // 3. PPTX (PowerPoint Presentations)
  if (extension === 'pptx' || mimeType?.includes('presentation')) {
    try {
      const pptxResult = extractPptxTextFromBuffer(buffer, fileName);
      if (pptxResult.content.trim().length > 0) {
        return pptxResult;
      }
    } catch (err) {
      console.warn('[Parser] PPTX parsing warning:', err);
    }
  }

  // 4. DOCX (Word Documents)
  if (extension === 'docx' || mimeType?.includes('wordprocessingml')) {
    try {
      const docxResult = extractDocxTextFromBuffer(buffer, fileName);
      if (docxResult.content.trim().length > 0) {
        return docxResult;
      }
    } catch (err) {
      console.warn('[Parser] DOCX parsing warning:', err);
    }
  }

  // 5. JSON Structured Files
  if (extension === 'json' || mimeType === 'application/json') {
    try {
      const jsonStr = buffer.toString('utf-8');
      const parsed = JSON.parse(jsonStr);
      const formatted = formatJsonForKnowledgeBase(parsed, fileName);
      return {
        content: formatted,
        totalPages: Math.max(1, Math.ceil(formatted.length / 2000)),
        format: 'JSON',
        metadata: {
          wordCount: formatted.split(/\s+/).filter(Boolean).length,
          characterCount: formatted.length
        }
      };
    } catch {
      // ignore
    }
  }

  // 6. Markdown & Plain Text Fallback
  const text = buffer.toString('utf-8').trim();
  const format = extension === 'md' ? 'MD' : 'TXT';
  const totalPages = Math.max(1, Math.ceil(text.length / 2500));

  let content = text;
  if (!text.includes('#')) {
    content = `# Document: ${fileName}\n\n## Overview\n\n${text}`;
  }

  return {
    content,
    totalPages,
    format,
    metadata: {
      wordCount: content.split(/\s+/).filter(Boolean).length,
      characterCount: content.length
    }
  };
}

/**
 * CSV Line Parser that respects quoted strings with commas
 */
function parseCSVLine(line: string, delimiter = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Simple Zip unpacker for DOCX (word/document.xml) and PPTX (ppt/slides/slide*.xml)
 * Parses standard PKZIP local file headers directly from Node.js Buffer
 */
function extractDocxTextFromBuffer(buffer: Buffer, fileName: string): ParsedDocumentResult {
  const xmlEntries = readZipXmlEntries(buffer);
  const docXml = xmlEntries['word/document.xml'];

  if (docXml) {
    // Extract paragraphs <w:p> and text runs <w:t>
    const paragraphs: string[] = [];
    const pRegex = /<w:p[\s>]([\s\S]*?)<\/w:p>/g;
    let pMatch;

    while ((pMatch = pRegex.exec(docXml)) !== null) {
      const pContent = pMatch[1];
      const tRegex = /<w:t[\s>]([\s\S]*?)<\/w:t>/g;
      let textRun = '';
      let tMatch;
      while ((tMatch = tRegex.exec(pContent)) !== null) {
        textRun += tMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      }
      if (textRun.trim().length > 0) {
        paragraphs.push(textRun.trim());
      }
    }

    const sections = paragraphs.map((p, i) => (i % 5 === 0 ? `\n\n## Section ${Math.floor(i / 5) + 1}\n\n${p}` : p));
    const content = `# Document: ${fileName}\n\n${sections.join('\n\n')}`;
    const totalPages = Math.max(1, Math.ceil(paragraphs.length / 8));

    return {
      content,
      totalPages,
      format: 'DOCX',
      metadata: {
        wordCount: content.split(/\s+/).filter(Boolean).length,
        characterCount: content.length
      }
    };
  }

  // Raw text pattern extraction fallback
  const rawTextMatches = buffer.toString('latin1').match(/[A-Za-z0-9\s.,;:'"?!-]{5,}/g) || [];
  const content = `# Document: ${fileName}\n\n## Extracted Content\n\n${rawTextMatches.join(' ').slice(0, 8000)}`;
  return {
    content,
    totalPages: 1,
    format: 'DOCX',
    metadata: { wordCount: content.split(/\s+/).length, characterCount: content.length }
  };
}

function extractPptxTextFromBuffer(buffer: Buffer, fileName: string): ParsedDocumentResult {
  const xmlEntries = readZipXmlEntries(buffer);
  const slideKeys = Object.keys(xmlEntries)
    .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0');
      const numB = parseInt(b.replace(/\D/g, '') || '0');
      return numA - numB;
    });

  if (slideKeys.length > 0) {
    const slides = slideKeys.map((key, idx) => {
      const xml = xmlEntries[key];
      const tRegex = /<a:t[\s>]([\s\S]*?)<\/a:t>/g;
      const textPieces: string[] = [];
      let tMatch;
      while ((tMatch = tRegex.exec(xml)) !== null) {
        textPieces.push(tMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
      }
      const title = textPieces[0] || `Slide ${idx + 1}`;
      const bullets = textPieces.slice(1).map((t) => `• ${t}`).join('\n');
      return `## Slide ${idx + 1}: ${title}\n\n${bullets || textPieces.join('\n')}`;
    });

    const content = `# Presentation: ${fileName}\nTotal Slides: ${slideKeys.length}\n\n${slides.join('\n\n')}`;
    return {
      content,
      totalPages: slideKeys.length,
      format: 'PPTX',
      metadata: {
        slideCount: slideKeys.length,
        wordCount: content.split(/\s+/).filter(Boolean).length,
        characterCount: content.length
      }
    };
  }

  return {
    content: `# Presentation: ${fileName}\n\n## Slide 1\nPresentation file indexed.`,
    totalPages: 1,
    format: 'PPTX',
    metadata: { wordCount: 10, characterCount: 50 }
  };
}

/**
 * Lightweight ZIP extractor for OOXML (.docx, .pptx)
 */
function readZipXmlEntries(buffer: Buffer): Record<string, string> {
  const entries: Record<string, string> = {};
  let offset = 0;

  while (offset < buffer.length - 30) {
    // Check for PK\x03\x04 Local File Header signature
    if (
      buffer[offset] === 0x50 &&
      buffer[offset + 1] === 0x4b &&
      buffer[offset + 2] === 0x03 &&
      buffer[offset + 3] === 0x04
    ) {
      const compression = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const uncompressedSize = buffer.readUInt32LE(offset + 22);
      const fileNameLength = buffer.readUInt16LE(offset + 26);
      const extraFieldLength = buffer.readUInt16LE(offset + 28);

      const fileNameStart = offset + 30;
      const fileName = buffer.toString('utf8', fileNameStart, fileNameStart + fileNameLength);
      const dataStart = fileNameStart + fileNameLength + extraFieldLength;

      if (fileName.endsWith('.xml') && compressedSize > 0 && dataStart + compressedSize <= buffer.length) {
        const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);
        try {
          let decompressed: Buffer;
          if (compression === 8) {
            // Deflate
            decompressed = zlib.inflateRawSync(compressedData);
          } else {
            decompressed = compressedData;
          }
          entries[fileName] = decompressed.toString('utf8');
        } catch {
          // ignore decompression failure for this entry
        }
      }

      offset = dataStart + compressedSize;
    } else {
      offset++;
    }
  }

  return entries;
}

function formatJsonForKnowledgeBase(obj: any, fileName: string): string {
  const title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const entries: string[] = [];

  if (Array.isArray(obj)) {
    entries.push(`Total Array Items: ${obj.length}`);
    obj.slice(0, 40).forEach((item, idx) => {
      entries.push(`### Item #${idx + 1}\n\`\`\`json\n${JSON.stringify(item, null, 2)}\n\`\`\``);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      const valStr = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
      entries.push(`### Key: ${key}\n${valStr}`);
    });
  }

  return `# Structured JSON Document: ${title}\n\n${entries.join('\n\n')}`;
}
