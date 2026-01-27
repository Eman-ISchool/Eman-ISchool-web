/**
 * Document Parser
 * Handles parsing of PDF, DOCX, and TXT documents for content extraction
 */

import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedDocument {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export interface ParseResult {
  success: boolean;
  text?: string;
  pageCount?: number;
  error?: string;
}

/**
 * Parses a PDF file and extracts text content
 * @param buffer - PDF file buffer
 * @returns Parse result with extracted text and page count
 */
export async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  try {
    console.log('[DocumentParser] Parsing PDF...');
    
    const data = await pdf(buffer);
    
    if (!data || !data.text) {
      return {
        success: false,
        error: 'Failed to extract text from PDF',
      };
    }

    return {
      success: true,
      text: data.text,
      pageCount: data.numpages || 0,
    };
  } catch (error: any) {
    console.error('[DocumentParser] PDF parsing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse PDF',
    };
  }
}

/**
 * Parses a DOCX file and extracts text content
 * @param buffer - DOCX file buffer
 * @returns Parse result with extracted text
 */
export async function parseDOCX(buffer: Buffer): Promise<ParseResult> {
  try {
    console.log('[DocumentParser] Parsing DOCX...');
    
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result || !result.value) {
      return {
        success: false,
        error: 'Failed to extract text from DOCX',
      };
    }

    return {
      success: true,
      text: result.value,
      pageCount: 1, // DOCX doesn't have page count in same way
    };
  } catch (error: any) {
    console.error('[DocumentParser] DOCX parsing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse DOCX',
    };
  }
}

/**
 * Parses a TXT file and extracts text content
 * @param buffer - TXT file buffer
 * @returns Parse result with extracted text
 */
export async function parseTXT(buffer: Buffer): Promise<ParseResult> {
  try {
    console.log('[DocumentParser] Parsing TXT...');
    
    const text = buffer.toString('utf-8');
    
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'TXT file is empty',
      };
    }

    return {
      success: true,
      text: text.trim(),
      pageCount: 1,
    };
  } catch (error: any) {
    console.error('[DocumentParser] TXT parsing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse TXT',
    };
  }
}

/**
 * Main parser function that routes to appropriate parser based on MIME type
 * @param buffer - File buffer
 * @param mimeType - MIME type of file
 * @returns Parse result
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<ParseResult> {
  console.log('[DocumentParser] Parsing document:', mimeType);
  
  switch (mimeType.toLowerCase()) {
    case 'application/pdf':
      return await parsePDF(buffer);
    
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
    case 'application/vnd.ms-word':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await parseDOCX(buffer);
    
    case 'text/plain':
    case 'text/txt':
      return await parseTXT(buffer);
    
    default:
      return {
        success: false,
        error: `Unsupported document type: ${mimeType}`,
      };
  }
}

/**
 * Validates document page count against limits
 * @param pageCount - Number of pages in document
 * @param maxPages - Maximum allowed pages (default: 100)
 * @returns True if page count is within limits
 */
export function validatePageCount(pageCount: number, maxPages: number = 100): boolean {
  return pageCount > 0 && pageCount <= maxPages;
}

/**
 * Estimates word count from text
 * @param text - Text content
 * @returns Estimated word count
 */
export function estimateWordCount(text: string): number {
  if (!text) return 0;
  
  // Split by whitespace and filter empty strings
  const words = text.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}
