import type { SourceContentType } from '@/types/database';

// Default limits from environment variables
const DEFAULT_MAX_VIDEO_SIZE_MB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '500', 10);
const DEFAULT_MAX_DOCUMENT_SIZE_MB = parseInt(process.env.MAX_DOCUMENT_SIZE_MB || '50', 10);
const DEFAULT_MAX_VIDEO_DURATION_HOURS = parseInt(process.env.MAX_VIDEO_DURATION_HOURS || '2', 10);

// Convert MB to bytes
const MAX_VIDEO_SIZE_BYTES = DEFAULT_MAX_VIDEO_SIZE_MB * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = DEFAULT_MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

// Convert hours to seconds
const MAX_VIDEO_DURATION_SECONDS = DEFAULT_MAX_VIDEO_DURATION_HOURS * 3600;

// Maximum pages for documents
const MAX_DOCUMENT_PAGES = 100;

// Allowed video MIME types
const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'video/x-matroska',
  'video/x-msvideo',
  'video/3gpp',
  'video/x-flv',
  'video/x-ms-wmv',
  'video/mpeg',
];

// Allowed document MIME types
const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/msword', // DOC
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-powerpoint', // PPT
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'text/plain',
  'text/csv',
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    fileSize?: string;
    fileSizeLimit?: string;
    duration?: number;
    durationLimit?: number;
    pageCount?: number;
    pageCountLimit?: number;
  };
}

/**
 * Validates a video file upload
 * @param file - File object to validate
 * @returns ValidationResult with success/error details
 */
export function validateVideoFile(file: File): ValidationResult {
  const errors: string[] = [];

  // Check file size
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    errors.push(
      `Video file size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${DEFAULT_MAX_VIDEO_SIZE_MB}MB`
    );
  }

  // Check MIME type
  if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.type)) {
    errors.push(
      `Invalid video file type: ${file.type}. Allowed types: ${ALLOWED_VIDEO_MIME_TYPES.join(', ')}`
    );
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join('; '),
      details: {
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileSizeLimit: `${DEFAULT_MAX_VIDEO_SIZE_MB}MB`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates a document file upload
 * @param file - File object to validate
 * @returns ValidationResult with success/error details
 */
export function validateDocumentFile(file: File): ValidationResult {
  const errors: string[] = [];

  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    errors.push(
      `Document file size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${DEFAULT_MAX_DOCUMENT_SIZE_MB}MB`
    );
  }

  // Check MIME type
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    errors.push(
      `Invalid document file type: ${file.type}. Allowed types: ${ALLOWED_DOCUMENT_MIME_TYPES.join(', ')}`
    );
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join('; '),
      details: {
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileSizeLimit: `${DEFAULT_MAX_DOCUMENT_SIZE_MB}MB`,
      },
    };
  }

  return { valid: true };
}

/**
 * Checks if file size exceeds limit for given content type
 * @param fileSize - File size in bytes
 * @param contentType - Type of content (video or document)
 * @returns ValidationResult with size check details
 */
export function checkFileSizeLimit(
  fileSize: number,
  contentType: SourceContentType
): ValidationResult {
  const maxSizeBytes =
    contentType === 'video' ? MAX_VIDEO_SIZE_BYTES : MAX_DOCUMENT_SIZE_BYTES;
  const maxSizeMB =
    contentType === 'video' ? DEFAULT_MAX_VIDEO_SIZE_MB : DEFAULT_MAX_DOCUMENT_SIZE_MB;

  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${maxSizeMB}MB`,
      details: {
        fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        fileSizeLimit: `${maxSizeMB}MB`,
      },
    };
  }

  return { valid: true };
}

/**
 * Checks if video duration is within allowed limits
 * @param durationSeconds - Video duration in seconds
 * @returns ValidationResult with duration check details
 */
export function checkVideoDuration(durationSeconds: number): ValidationResult {
  if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
    const durationMinutes = Math.floor(durationSeconds / 60);
    const limitMinutes = DEFAULT_MAX_VIDEO_DURATION_HOURS * 60;
    
    return {
      valid: false,
      error: `Video duration (${durationMinutes} minutes) exceeds limit of ${limitMinutes} minutes`,
      details: {
        duration: durationSeconds,
        durationLimit: MAX_VIDEO_DURATION_SECONDS,
      },
    };
  }

  return { valid: true };
}

/**
 * Checks if document page count is within allowed limits
 * @param pageCount - Number of pages in document
 * @returns ValidationResult with page count check details
 */
export function checkPageCount(pageCount: number): ValidationResult {
  if (pageCount > MAX_DOCUMENT_PAGES) {
    return {
      valid: false,
      error: `Document page count (${pageCount}) exceeds limit of ${MAX_DOCUMENT_PAGES} pages`,
      details: {
        pageCount,
        pageCountLimit: MAX_DOCUMENT_PAGES,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates file based on content type
 * @param file - File object to validate
 * @param contentType - Type of content
 * @returns ValidationResult with appropriate validation
 */
export function validateFileByType(
  file: File,
  contentType: SourceContentType
): ValidationResult {
  switch (contentType) {
    case 'video':
      return validateVideoFile(file);
    case 'document':
      return validateDocumentFile(file);
    case 'recording':
      return validateVideoFile(file); // Recordings use video validation
    case 'external_link':
      return { valid: true }; // External links don't need file validation
    default:
      return {
        valid: false,
        error: `Unknown content type: ${contentType}`,
      };
  }
}

/**
 * Gets user-friendly error message from validation result
 * @param result - ValidationResult object
 * @returns Formatted error message or null if valid
 */
export function getValidationErrorMessage(result: ValidationResult): string | null {
  if (result.valid) {
    return null;
  }

  return result.error || 'Validation failed';
}
