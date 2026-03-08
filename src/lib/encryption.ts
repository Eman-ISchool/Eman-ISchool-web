import * as crypto from 'crypto';

// Salt for key derivation (in production, consider using a KMS or rotating salts)
// Note: When rotating encryption keys, you must re-encrypt all data with the new key
const ENCRYPTION_SALT = process.env.TOKEN_ENCRYPTION_SALT;

// Derive a 32-byte key using PBKDF2 (more secure than SHA-256 alone)
// PBKDF2 iterations: 100,000 (NIST recommends at least 10,000 for sensitive data)
let ENCRYPTION_KEY: Buffer | null = null;

const IV_LENGTH = 16;

// Key rotation: To rotate keys:
// 1. Generate new TOKEN_ENCRYPTION_KEY
// 2. Update environment variable
// 3. Deploy with new key
// 4. Run migration script to re-encrypt all existing data
// 5. Remove old key from environment variables

/**
 * Validate encryption configuration at application startup
 * Call this function during app initialization to ensure encryption is properly configured
 * @returns true if encryption is properly configured, false otherwise
 */
export function validateEncryptionConfig(): boolean {
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    console.error('CRITICAL: TOKEN_ENCRYPTION_KEY environment variable is required for encryption functionality');
    console.error('Please set TOKEN_ENCRYPTION_KEY in your environment variables');
    return false;
  }

  if (!ENCRYPTION_SALT) {
    console.error('CRITICAL: TOKEN_ENCRYPTION_SALT environment variable is required for encryption functionality');
    console.error('Please set TOKEN_ENCRYPTION_SALT in your environment variables');
    return false;
  }

  try {
    ENCRYPTION_KEY = crypto.pbkdf2Sync(
      process.env.TOKEN_ENCRYPTION_KEY,
      ENCRYPTION_SALT,
      100000, // iterations
      32, // key length
      'sha512' // digest
    );
    console.log('Encryption configuration validated successfully');
    return true;
  } catch (error) {
    console.error('CRITICAL: Failed to initialize encryption key:', error);
    return false;
  }
}

/**
 * Check if encryption is initialized
 * @returns true if encryption key has been initialized
 */
export function isEncryptionInitialized(): boolean {
  return ENCRYPTION_KEY !== null;
}

/**
 * Encrypt a string using AES-256-CBC
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: iv:encrypted
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption not initialized. Call validateEncryptionConfig() at application startup.');
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string using AES-256-CBC
 * @param text - Encrypted string in format: iv:encrypted
 * @returns Decrypted plain text
 */
export function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption not initialized. Call validateEncryptionConfig() at application startup.');
  }

  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a string appears to be encrypted
 * @param text - String to check
 * @returns true if the string appears to be in encrypted format
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 2 &&
    parts[0].length === IV_LENGTH * 2 && // IV in hex
    /^[a-f0-9:]+$/i.test(text);
}
