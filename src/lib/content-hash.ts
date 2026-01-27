import { createHash } from 'crypto';

/**
 * Computes SHA-256 hash of file content for duplicate detection
 * @param buffer - File content as Buffer
 * @returns Hexadecimal string of SHA-256 hash
 */
export function computeFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Computes SHA-256 hash of a string (e.g., for metadata comparison)
 * @param text - Text content to hash
 * @returns Hexadecimal string of SHA-256 hash
 */
export function computeTextHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}
